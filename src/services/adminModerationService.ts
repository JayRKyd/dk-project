import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface ModerationLog {
  id: string;
  moderator_id: string;
  target_user_id: string;
  action_type: string;
  reason: string;
  metadata: any;
  created_at: string;
}

export interface LockUserParams {
  userId: string;
  reason: string;
  expiresAt?: Date;
}

export class AdminModerationService {
  /**
   * Lock a user account
   */
  static async lockUser({ userId, reason, expiresAt }: LockUserParams): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.rpc('lock_user_account', {
      target_user_id: userId,
      lock_reason: reason,
      expires_at: expiresAt?.toISOString()
    });

    return { error };
  }

  /**
   * Unlock a user account
   */
  static async unlockUser(userId: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.rpc('unlock_user_account', {
      target_user_id: userId
    });

    return { error };
  }

  /**
   * Get moderation logs for a specific user
   */
  static async getUserModerationLogs(userId: string): Promise<{ 
    logs: ModerationLog[];
    error: PostgrestError | null;
  }> {
    const { data: logs, error } = await supabase
      .from('moderation_logs')
      .select('*')
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false });

    return { 
      logs: logs as ModerationLog[] || [],
      error 
    };
  }

  /**
   * Get all moderation logs with pagination
   */
  static async getAllModerationLogs(page: number = 1, pageSize: number = 20): Promise<{
    logs: ModerationLog[];
    error: PostgrestError | null;
  }> {
    const { data: logs, error } = await supabase
      .from('moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    return {
      logs: logs as ModerationLog[] || [],
      error
    };
  }

  /**
   * Get locked users with pagination
   */
  static async getLockedUsers(page: number = 1, pageSize: number = 20): Promise<{
    users: any[];
    error: PostgrestError | null;
  }> {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_locked', true)
      .order('locked_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    return {
      users: users || [],
      error
    };
  }
} 