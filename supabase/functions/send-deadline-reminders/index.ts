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

    console.log('Starting project deadline reminder check...');

    // Calculate dates: 1 day from now and 3 days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    const oneDayStr = oneDayFromNow.toISOString().split('T')[0];
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    console.log(`Checking projects due on ${oneDayStr} (tomorrow) or ${threeDaysStr} (3 days)`);

    // Query projects with deadlines in 1 or 3 days
    const { data: projects, error: projectsError } = await supabase
      .from('adrian_projects')
      .select(`
        id,
        project_id,
        project_name,
        end_date,
        assigned_to,
        created_by,
        user_id,
        status
      `)
      .in('end_date', [oneDayStr, threeDaysStr])
      .not('status', 'eq', 'completed')
      .not('status', 'eq', 'cancelled');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw projectsError;
    }

    console.log(`Found ${projects?.length || 0} projects with upcoming deadlines`);

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No projects with upcoming deadlines', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      throw new Error('VAPID keys not configured');
    }

    let notificationsSent = 0;

    for (const project of projects) {
      const isOneDayAway = project.end_date === oneDayStr;
      
      // Count remaining tasks for this project
      const { count: remainingTasks } = await supabase
        .from('tasks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project.project_id)
        .not('status', 'eq', 'completed')
        .not('status', 'eq', 'cancelled');

      const taskCount = remainingTasks || 0;

      // Collect recipients (assigned_to, created_by, user_id - unique)
      const recipientIds = new Set<string>();
      if (project.assigned_to) recipientIds.add(project.assigned_to);
      if (project.created_by) recipientIds.add(project.created_by);
      if (project.user_id) recipientIds.add(project.user_id);

      // Format date for notification
      const endDate = new Date(project.end_date!);
      const formattedDate = endDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });

      for (const userId of recipientIds) {
        // Check notification preferences
        const { data: prefs } = await supabase
          .from('notification_preferences')
          .select('project_notifications')
          .eq('user_id', userId)
          .maybeSingle();

        if (prefs && prefs.project_notifications === false) {
          console.log(`User ${userId} has project notifications disabled, skipping`);
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

        const title = isOneDayAway 
          ? '🔴 Deadline Tomorrow!' 
          : '📋 Deadline in 3 Days';
        
        const body = isOneDayAway
          ? `Project "${project.project_name}" is due tomorrow! ${taskCount} task(s) still incomplete.`
          : `Project "${project.project_name}" is due on ${formattedDate}. ${taskCount} task(s) remaining.`;

        const notificationPayload = JSON.stringify({
          title,
          body,
          icon: '/lovable-uploads/38598e63-607e-4758-bb3d-7fb4e170eae0.png',
          url: `/projects/${project.id}`,
          type: 'project',
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
            console.log(`Sent deadline reminder for project ${project.project_name} to user ${userId}`);
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
    }

    console.log(`Deadline reminder check complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({ 
        message: 'Deadline reminder check complete', 
        projectsFound: projects.length,
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-deadline-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
