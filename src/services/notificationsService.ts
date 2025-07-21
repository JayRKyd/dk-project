import { supabase } from '../lib/supabase';

// Database response types
interface DbUser {
  username: string;
}

interface DbNotification {
  id: string;
  type: string;
  user_id: string | null;
  profile_id: string;
  data: any;
  is_read: boolean;
  created_at: string;
  user: DbUser | null;
}

export interface Notification {
  id: string;
  type: 'view' | 'love' | 'message' | 'gift' | 'review' | 'booking';
  user_id: string | null;
  profile_id: string;
  data: any;
  is_read: boolean;
  created_at: string;
  user?: {
    username: string;
  };
}

/**
 * Get notifications for a user
 * @param profileId The profile ID
 * @param limit Maximum number of notifications to return
 * @param unreadOnly Whether to return only unread notifications
 * @returns Array of notifications
 */
export const getNotifications = async (
  profileId: string,
  limit: number = 10,
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('activities')
      .select(`
        id,
        type,
        user_id,
        profile_id,
        data,
        is_read,
        created_at,
        user:user_id (username)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Ensure proper typing for user property
    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.type as 'view' | 'love' | 'message' | 'gift' | 'review' | 'booking',
      user_id: item.user_id,
      profile_id: item.profile_id,
      data: item.data,
      is_read: item.is_read,
      created_at: item.created_at,
      user: item.user && typeof item.user === 'object' && !Array.isArray(item.user)
        ? { username: item.user.username }
        : undefined
    }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Get unread notification count for a user
 * @param profileId The profile ID
 * @returns Number of unread notifications
 */
export const getUnreadNotificationCount = async (
  profileId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
};

/**
 * Mark notifications as read
 * @param notificationIds Array of notification IDs to mark as read
 * @returns Success status
 */
export const markNotificationsAsRead = async (
  notificationIds: string[]
): Promise<boolean> => {
  try {
    if (!notificationIds.length) return true;

    const { error } = await supabase
      .from('activities')
      .update({ is_read: true })
      .in('id', notificationIds);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a profile
 * @param profileId The profile ID
 * @returns Success status
 */
export const markAllNotificationsAsRead = async (
  profileId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activities')
      .update({ is_read: true })
      .eq('profile_id', profileId)
      .eq('is_read', false);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Create a new notification
 * @param notification Notification data
 * @returns Created notification or null if error
 */
export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>
): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        ...notification,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Delete a notification
 * @param notificationId Notification ID
 * @returns Success status
 */
export const deleteNotification = async (
  notificationId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
};
