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

    console.log('Starting task due date reminder check...');

    // Get today's date and tomorrow's date for comparison
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking tasks due on ${todayStr} or ${tomorrowStr}`);

    // Query tasks that are due today or tomorrow and not completed
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        task_name,
        due_date,
        assigned_to,
        status,
        project_id,
        adrian_projects (
          project_name
        )
      `)
      .in('due_date', [todayStr, tomorrowStr])
      .neq('status', 'completed')
      .not('assigned_to', 'is', null);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks with upcoming due dates`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tasks with upcoming due dates', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group tasks by assigned user
    const tasksByUser: Record<string, typeof tasks> = {};
    for (const task of tasks) {
      if (task.assigned_to) {
        if (!tasksByUser[task.assigned_to]) {
          tasksByUser[task.assigned_to] = [];
        }
        tasksByUser[task.assigned_to].push(task);
      }
    }

    let notificationsSent = 0;

    // Send notifications for each user
    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
      // Get user's notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('task_notifications')
        .eq('user_id', userId)
        .maybeSingle();

      // Skip if user has disabled task notifications
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

      // Create notification message
      const dueToday = userTasks.filter(t => t.due_date === todayStr);
      const dueTomorrow = userTasks.filter(t => t.due_date === tomorrowStr);

      let notificationBody = '';
      if (dueToday.length > 0 && dueTomorrow.length > 0) {
        notificationBody = `${dueToday.length} task(s) due today, ${dueTomorrow.length} due tomorrow`;
      } else if (dueToday.length > 0) {
        notificationBody = dueToday.length === 1 
           ? `"${dueToday[0].task_name}" is due today!`
           : `${dueToday.length} tasks are due today!`;
      } else {
        notificationBody = dueTomorrow.length === 1
          ? `"${dueTomorrow[0].task_name}" is due tomorrow`
          : `${dueTomorrow.length} tasks are due tomorrow`;
      }

      // Send notification using web-push
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

      if (!vapidPublicKey || !vapidPrivateKey) {
        console.error('VAPID keys not configured');
        continue;
      }

      const notificationPayload = JSON.stringify({
        title: '⏰ Task Deadline Reminder',
        body: notificationBody,
        icon: '/adrian-idea-favicon-512.png',
        url: '/dashboard',
      });

      for (const subscription of subscriptions) {
        try {
          const webPush = await import("npm:web-push@3.6.7");
          
          webPush.setVapidDetails(
            'mailto:m.barkhordari@adrianidea.ir',
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
          console.log(`Sent reminder notification to ${userId}`);
        } catch (pushError: any) {
          console.error(`Failed to send push to ${subscription.endpoint}:`, pushError.message);
          
          // Remove invalid subscriptions
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

    console.log(`Task reminder check complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({ 
        message: 'Task reminder check complete', 
        tasksFound: tasks.length,
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in task-due-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
