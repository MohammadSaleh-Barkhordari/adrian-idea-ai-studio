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

    console.log('Starting overdue task reminder check...');

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    console.log(`Checking tasks overdue before ${todayStr}`);

    // Query overdue tasks (due_date < today, not completed/cancelled)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        due_date,
        assigned_to,
        status,
        project_id
      `)
      .lt('due_date', todayStr)
      .not('status', 'eq', 'completed')
      .not('status', 'eq', 'cancelled')
      .not('assigned_to', 'is', null);

    if (tasksError) {
      console.error('Error fetching overdue tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} overdue tasks`);

    if (!tasks || tasks.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No overdue tasks found', sent: 0 }),
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

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      throw new Error('VAPID keys not configured');
    }

    // Send notifications for each user
    for (const [userId, userTasks] of Object.entries(tasksByUser)) {
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

      // Find oldest overdue task
      const sortedTasks = userTasks.sort((a, b) => 
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
      );
      const oldestTask = sortedTasks[0];
      const oldestDate = new Date(oldestTask.due_date!);
      const formattedDate = oldestDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      const notificationPayload = JSON.stringify({
        title: '⚠️ Overdue Tasks',
        body: `You have ${userTasks.length} overdue task(s). Oldest: "${oldestTask.title}" was due ${formattedDate}.`,
        icon: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
        url: '/dashboard',
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
          console.log(`Sent overdue reminder to user ${userId}`);
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

    console.log(`Overdue reminder check complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({ 
        message: 'Overdue reminder check complete', 
        overdueTasksFound: tasks.length,
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-overdue-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
