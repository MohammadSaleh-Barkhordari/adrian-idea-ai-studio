import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from "npm:@block65/webcrypto-web-push@1.0.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushPayloadInput {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  user_ids?: string[];
  notification_type?: 'task' | 'project' | 'calendar' | 'financial' | 'general';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const payload: PushPayloadInput = await req.json();
    console.log('Received push notification request:', payload);

    const { title, body, url, icon, user_ids, notification_type } = payload;

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    // Get VAPID keys from environment
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!publicKey || !privateKey) {
      throw new Error('VAPID keys not configured in Edge Function secrets');
    }

    const vapid: VapidKeys = {
      subject: 'mailto:adrianidea.ir@gmail.com',
      publicKey,
      privateKey,
    };

    // Get subscriptions based on user_ids or all if not specified
    let query = supabase
      .from('push_subscriptions')
      .select('*');

    if (user_ids && user_ids.length > 0) {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found');
      return new Response(
        JSON.stringify({ success: true, message: 'No subscriptions to notify', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter subscriptions based on notification preferences
    const filteredSubscriptions = [];
    for (const sub of subscriptions) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', sub.user_id)
        .single();

      // Check if user wants this type of notification
      let shouldNotify = true;
      if (prefs && notification_type) {
        switch (notification_type) {
          case 'task':
            shouldNotify = prefs.task_notifications !== false;
            break;
          case 'project':
            shouldNotify = prefs.project_notifications !== false;
            break;
          case 'calendar':
            shouldNotify = prefs.calendar_notifications !== false;
            break;
          case 'financial':
            shouldNotify = prefs.financial_notifications !== false;
            break;
        }
      }

      if (shouldNotify) {
        filteredSubscriptions.push(sub);
      }
    }

    console.log(`Sending notifications to ${filteredSubscriptions.length} subscriptions`);

    // Prepare notification payload
    const notificationData = JSON.stringify({
      title,
      body,
      icon: icon || '/adrian-idea-favicon-512.png',
      url: url || '/',
      timestamp: new Date().toISOString()
    });

    let successCount = 0;
    let failCount = 0;
    const results = [];
    const removedSubscriptions = [];

    for (const subscription of filteredSubscriptions) {
      try {
        // Build proper PushSubscription object for Web Push Protocol
        const pushSubscription: PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const message: PushMessage = {
          data: notificationData,
          options: {
            ttl: 86400, // 24 hours
          },
        };

        // Build the encrypted payload with VAPID auth
        const pushPayload = await buildPushPayload(message, pushSubscription, vapid);

        // Send the request to the push service
        const response = await fetch(subscription.endpoint, pushPayload);

        if (response.ok || response.status === 201) {
          successCount++;
          console.log(`Successfully sent to subscription ${subscription.id}`);
          results.push({ subscription_id: subscription.id, user_id: subscription.user_id, success: true });
        } else {
          failCount++;
          const errorText = await response.text();
          console.error(`Failed to send to subscription ${subscription.id}: ${response.status} - ${errorText}`);

          // If subscription is no longer valid (410 Gone or 404), remove it
          if (response.status === 404 || response.status === 410) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subscription.id);
            console.log(`Removed invalid subscription ${subscription.id}`);
            removedSubscriptions.push(subscription.id);
          }

          results.push({ 
            subscription_id: subscription.id, 
            user_id: subscription.user_id, 
            success: false, 
            error: `${response.status}: ${errorText}`,
            removed: response.status === 404 || response.status === 410
          });
        }

      } catch (error: any) {
        failCount++;
        console.error(`Error sending to subscription ${subscription.id}:`, error);
        results.push({ 
          subscription_id: subscription.id, 
          user_id: subscription.user_id, 
          success: false, 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount} notifications, ${failCount} failed`,
        sent: successCount,
        failed: failCount,
        removed_expired: removedSubscriptions.length,
        details: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
