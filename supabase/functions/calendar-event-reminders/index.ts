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

    console.log('Starting calendar event reminder check...');

    // Get the time window: now to 60 minutes from now
    const now = new Date();
    const reminderWindowStart = new Date(now.getTime() + 45 * 60 * 1000); // 45 mins from now
    const reminderWindowEnd = new Date(now.getTime() + 75 * 60 * 1000); // 75 mins from now
    
    // This gives us a 30-minute window centered around 60 minutes before the event
    // Running every 15 minutes, we'll catch events in this window

    console.log(`Checking events starting between ${reminderWindowStart.toISOString()} and ${reminderWindowEnd.toISOString()}`);

    // Query calendar events that start within the reminder window
    const { data: events, error: eventsError } = await supabase
      .from('our_calendar')
      .select('id, title, start_time, end_time, location, description, user_id')
      .gte('start_time', reminderWindowStart.toISOString())
      .lte('start_time', reminderWindowEnd.toISOString());

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      throw eventsError;
    }

    console.log(`Found ${events?.length || 0} events starting in ~60 minutes`);

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming events in reminder window', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group events by user
    const eventsByUser: Record<string, typeof events> = {};
    for (const event of events) {
      if (event.user_id) {
        if (!eventsByUser[event.user_id]) {
          eventsByUser[event.user_id] = [];
        }
        eventsByUser[event.user_id].push(event);
      }
    }

    let notificationsSent = 0;

    // Get VAPID keys once
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications for each user
    for (const [userId, userEvents] of Object.entries(eventsByUser)) {
      // Get user's notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('calendar_notifications')
        .eq('user_id', userId)
        .maybeSingle();

      // Skip if user has disabled calendar notifications
      if (prefs && prefs.calendar_notifications === false) {
        console.log(`User ${userId} has calendar notifications disabled, skipping`);
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

      // Create notification for each event
      for (const event of userEvents) {
        const eventTime = new Date(event.start_time);
        const timeStr = eventTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });

        let notificationBody = `"${event.title}" starts at ${timeStr}`;
        if (event.location) {
          notificationBody += ` at ${event.location}`;
        }

        const notificationPayload = JSON.stringify({
          title: '📅 Event Reminder - 1 Hour',
          body: notificationBody,
          icon: '/adrian-idea-favicon-512.png',
          url: '/our-calendar',
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
            console.log(`Sent event reminder for "${event.title}" to user ${userId}`);
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
    }

    console.log(`Calendar reminder check complete. Sent ${notificationsSent} notifications.`);

    return new Response(
      JSON.stringify({ 
        message: 'Calendar reminder check complete', 
        eventsFound: events.length,
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in calendar-event-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
