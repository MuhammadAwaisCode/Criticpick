'server-only';
'use server';

import { createClient } from '@/lib/supabase/server';

export async function fetchNotifications(userId) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, message, type, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = (data || []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'system',
      read: Boolean(n.is_read),
      time: new Date(n.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    return { success: true, data: formatted };
  } catch (err) {
    console.error('Server Action Error (fetchNotifications):', err);
    return { success: false, error: 'Failed to load notifications.' };
  }
}

export async function markNotificationReadAction(notificationId, userId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Server Action Error (markNotificationReadAction):', err);
    return { success: false, error: 'Failed to update notification.' };
  }
}

export async function markAllNotificationsReadAction(userId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Server Action Error (markAllNotificationsReadAction):', err);
    return { success: false, error: 'Failed to update all notifications.' };
  }
}

export async function deleteNotificationAction(notificationId, userId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Server Action Error (deleteNotificationAction):', err);
    return { success: false, error: 'Failed to delete notification.' };
  }
}

export async function clearAllNotificationsAction(userId) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Server Action Error (clearAllNotificationsAction):', err);
    return { success: false, error: 'Failed to clear notifications.' };
  }
}