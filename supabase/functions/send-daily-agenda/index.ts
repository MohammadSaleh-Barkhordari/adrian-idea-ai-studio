import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting daily agenda summary...');

    // Get today's date range
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const startOfDay = new Date(todayStr + 'T00:00:00.000Z');
    const endOfDay = new Date(todayStr + 'T23:59:59.999Z');

    console.log(`Checking agenda for ${todayStr}`);

    // Get all users with push subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id')
      .order('user_id');

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
      throw subsError;
    }

    // Get unique user IDs
    const userIds = [...new Set(subscriptions?.map(s => s.user_id) || [])];
    console.log(`Found ${userIds.length} users with push subscriptions`);

    let notificationsSent = 0;

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      throw new Error('VAPID keys not configured');
    }

    for (const userId of userIds) {
      // Check notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('calendar_notifications, task_notifications')
        .eq('user_id', userId)
        .maybeSingle();

      // Skip if user has both notifications disabled
      if (prefs && prefs.calendar_notifications === false && prefs.task_notifications === false) {
        console.log(`User ${userId} has agenda-related notifications disabled, skipping`);
        continue;
      }

      // Get today's calendar events for user
      const { data: events } = await supabase
        .from('our_calendar')
        .select('id, title, start_time, all_day')
        .eq('user_id', userId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: true });

      // Get today's tasks for user
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, due_date, start_time')
        .eq('assigned_to', userId)
        .eq('due_date', todayStr)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'cancelled')
        .order('start_time', { ascending: true, nullsFirst: false });

      const eventCount = events?.length || 0;
      const taskCount = tasks?.length || 0;

      // Skip if no events and no tasks
      if (eventCount === 0 && taskCount === 0) {
        console.log(`User ${userId} has no agenda items for today, skipping`);
        continue;
      }

      // Find the first item of the day
      let firstItemTitle = '';
      let firstItemTime = '';

      if (events && events.length > 0 && tasks && tasks.length > 0) {
        const firstEvent = events[0];
        const firstTask = tasks[0];
        
        const eventTime = new Date(firstEvent.start_time);
        const taskTime = firstTask.start_time ? new Date(firstTask.start_time) : null;
        
        if (taskTime && taskTime < eventTime) {
          firstItemTitle = firstTask.title;
          firstItemTime = taskTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
          firstItemTitle = firstEvent.title;
          firstItemTime = firstEvent.all_day ? 'All day' : eventTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
      } else if (events && events.length > 0) {
        const firstEvent = events[0];
        firstItemTitle = firstEvent.title;
        firstItemTime = firstEvent.all_day ? 'All day' : new Date(firstEvent.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (tasks && tasks.length > 0) {
        const firstTask = tasks[0];
        firstItemTitle = firstTask.title;
        firstItemTime = firstTask.start_time 
          ? new Date(firstTask.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'Due today';
      }

      // Get user's push subscriptions
      const { data: userSubscriptions } = await supabase
        .from('push_subscriptions')
        .select('endpoint, p256dh, auth')
        .eq('user_id', userId);

      if (!userSubscriptions || userSubscriptions.length === 0) {
        continue;
      }

      const notificationPayload = JSON.stringify({
        title: '📅 Today\'s Agenda',
        body: `${eventCount} event(s) and ${taskCount} task(s) today. First: "${firstItemTitle}" at ${firstItemTime}.`,
        icon: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
        url: '/dashboard',
      });

      for (const subscription of userSubscriptions) {
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
          console.log(`Sent daily agenda to user ${userId}: ${eventCount} events, ${taskCount} tasks`);
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

    console.log(`Daily agenda check complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({ 
        message: 'Daily agenda check complete', 
        usersChecked: userIds.length,
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-daily-agenda:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
