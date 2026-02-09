import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'task' | 'project' | 'calendar' | 'financial' | 'general';

// The two Our Life users
const OUR_LIFE_USERS = {
  mohammad: '19db583e-1e4a-4a20-9f3c-591cb2ca3dc7',
  raiana: '8dd0bb2f-2768-4c1c-9e62-495f36b882d4'
};

export function getOtherOurLifeUser(currentUserId: string): string | null {
  if (currentUserId === OUR_LIFE_USERS.mohammad) return OUR_LIFE_USERS.raiana;
  if (currentUserId === OUR_LIFE_USERS.raiana) return OUR_LIFE_USERS.mohammad;
  return null;
}

export function getOurLifeUserName(userId: string): string {
  if (userId === OUR_LIFE_USERS.mohammad) return 'Mohammad';
  if (userId === OUR_LIFE_USERS.raiana) return 'Raiana';
  return 'Someone';
}

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
