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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Testing push notification for user: ${user_id}`);

    // Get subscriptions for this user
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user_id);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No push subscriptions found for this user', 
          user_id,
          hint: 'User needs to enable push notifications in their browser first'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscription(s) for user`);

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

    // Prepare test notification payload
    const notificationData = JSON.stringify({
      title: '🎉 Test Notification',
      body: `Push notifications are working! Sent at ${new Date().toLocaleTimeString()}`,
      icon: '/adrian-idea-favicon-512.png',
      url: '/',
      type: 'general',
      timestamp: new Date().toISOString()
    });

    const results = [];
    const removedSubscriptions = [];

    for (const sub of subscriptions) {
      try {
        console.log(`Sending to subscription ${sub.id} (endpoint: ${sub.endpoint.substring(0, 60)}...)`);

        // Build proper PushSubscription object
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
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
        const response = await fetch(sub.endpoint, pushPayload);

        if (response.ok || response.status === 201) {
          console.log(`Successfully sent to subscription ${sub.id}`);
          results.push({ 
            subscription_id: sub.id, 
            device_info: sub.device_info,
            success: true 
          });
        } else {
          const errorText = await response.text();
          console.error(`Failed to send to subscription ${sub.id}: ${response.status} - ${errorText}`);

          // If subscription is expired/invalid (410 Gone or 404), remove it
          if (response.status === 410 || response.status === 404) {
            console.log(`Removing expired subscription: ${sub.id}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
            removedSubscriptions.push(sub.id);
          }

          results.push({ 
            subscription_id: sub.id, 
            device_info: sub.device_info,
            success: false, 
            error: `${response.status}: ${errorText}`,
            removed: response.status === 410 || response.status === 404
          });
        }

      } catch (error: any) {
        console.error(`Failed to send to subscription ${sub.id}:`, error);
        results.push({ 
          subscription_id: sub.id, 
          device_info: sub.device_info,
          success: false, 
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        message: `Sent ${successCount} test notification(s), ${failCount} failed`,
        user_id,
        total_subscriptions: subscriptions.length,
        sent: successCount,
        failed: failCount,
        removed_expired: removedSubscriptions.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Test push notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
