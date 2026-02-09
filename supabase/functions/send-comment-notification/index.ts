import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommentNotificationPayload {
  task_id: string;
  comment_content: string;
  commenter_id: string;
  mentioned_user_ids?: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: CommentNotificationPayload = await req.json();
    console.log('Received comment notification request:', payload);

    const { task_id, comment_content, commenter_id, mentioned_user_ids = [] } = payload;

    if (!task_id || !comment_content || !commenter_id) {
      throw new Error('task_id, comment_content, and commenter_id are required');
    }

    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, assigned_to, project_id')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      console.error('Error fetching task:', taskError);
      throw new Error('Task not found');
    }

    // Get commenter's profile
    const { data: commenter } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', commenter_id)
      .single();

    const commenterName = commenter?.full_name || commenter?.email || 'Someone';

    // Collect recipients (task assignee + mentioned users, excluding commenter)
    const recipientIds = new Set<string>();

    // Add task assignee if different from commenter
    if (task.assigned_to && task.assigned_to !== commenter_id) {
      recipientIds.add(task.assigned_to);
    }

    // Add mentioned users (excluding commenter)
    for (const userId of mentioned_user_ids) {
      if (userId !== commenter_id) {
        recipientIds.add(userId);
      }
    }

    if (recipientIds.size === 0) {
      console.log('No recipients to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients to notify', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending notifications to ${recipientIds.size} recipient(s)`);

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      throw new Error('VAPID keys not configured');
    }

    let notificationsSent = 0;

    // Truncate comment for notification
    const truncatedComment = comment_content.length > 50 
      ? comment_content.substring(0, 50) + '...' 
      : comment_content;

    // Determine URL
    const notificationUrl = task.project_id 
      ? `/projects/${task.project_id}` 
      : '/dashboard';

    for (const userId of recipientIds) {
      // Check notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('task_notifications')
        .eq('user_id', userId)
        .maybeSingle();

      if (prefs && prefs.task_notifications === false) {
        console.log(`User ${userId} has task notifications disabled, skipping`);
        continue;
      }

      // Get user's push subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId);

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No push subscriptions for user ${userId}`);
        continue;
      }

      const notificationPayload = JSON.stringify({
        title: '💬 New Comment',
        body: `${commenterName} commented on "${task.title}": "${truncatedComment}"`,
        icon: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
        url: notificationUrl,
      });

      for (const subscription of subscriptions) {
        try {
          const webPush = await import("npm:web-push@3.6.7");
          
          webPush.setVapidDetails(
            'mailto:adrianidea.ir@gmail.com',
            vapidPublicKey,
            vapidPrivateKey
          );

          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            notificationPayload
          );

          notificationsSent++;
          console.log(`Sent comment notification to user ${userId}`);
        } catch (pushError: any) {
          console.error(`Failed to send push to ${subscription.endpoint}:`, pushError.message);
          
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', subscription.endpoint);
            console.log('Removed invalid subscription');
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${notificationsSent} comment notifications`,
        sent: notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-comment-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
