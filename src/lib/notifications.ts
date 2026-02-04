import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'task' | 'project' | 'calendar' | 'financial' | 'general';

export async function sendNotification(
  title: string,
  body: string,
  userIds: string[],
  type: NotificationType,
  url?: string
): Promise<void> {
  if (userIds.length === 0) return;

  try {
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        title,
        body,
        url: url || '/',
        user_ids: userIds,
        notification_type: type
      }
    });
    
    if (error) {
      console.error('Failed to send notification:', error);
    }
  } catch (err) {
    console.error('Error sending notification:', err);
  }
}

// Helper to get user profile ID from email using secure RPC
export async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_id_by_email', { lookup_email: email });
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data || null;
  } catch (err) {
    console.error('Error getting user ID by email:', err);
    return null;
  }
}
