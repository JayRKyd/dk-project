import { supabase } from '../lib/supabase';

export interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  role: 'lady' | 'client' | 'club' | 'admin';
  membership_tier: 'FREE' | 'PRO';
  is_verified: boolean;
  is_blocked: boolean;
  client_number?: string | null;
  created_at: string;
  last_login?: string;
  profile?: {
    name: string;
    location: string;
    image_url?: string;
  };
}

export const adminUserService = {
  /**
   * Get all users with their profile information
   */
  async getAllUsers(): Promise<UserWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          username,
          role,
          membership_tier,
          is_verified,
          is_blocked,
          client_number,
          created_at,
          last_login,
          profiles (
            name,
            location,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }

      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        membership_tier: user.membership_tier,
        is_verified: user.is_verified,
        is_blocked: user.is_blocked || false,
        client_number: user.client_number || null,
        created_at: user.created_at,
        last_login: user.last_login,
        profile: user.profiles?.[0] ? {
          name: user.profiles[0].name,
          location: user.profiles[0].location,
          image_url: user.profiles[0].image_url
        } : undefined
      }));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  /**
   * Paged users with optional search
   */
  async getUsers(params: { page: number; pageSize: number; search?: string }): Promise<{ rows: UserWithProfile[]; total: number }> {
    const { page, pageSize, search } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    try {
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          username,
          role,
          membership_tier,
          is_verified,
          is_blocked,
          client_number,
          created_at,
          last_login,
          profiles (
            name,
            location,
            image_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search && search.trim().length > 0) {
        const s = `%${search.trim()}%`;
        // Search in username, email, role, and client_number
        query = query.or(
          `username.ilike.${s},email.ilike.${s},role.ilike.${s},client_number.ilike.${s}`
        );
      }

      const { data, error, count } = await query;
      if (error) {
        console.error('Error fetching paged users:', error);
        throw new Error('Failed to fetch users');
      }

      const rows: UserWithProfile[] = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        membership_tier: user.membership_tier,
        is_verified: user.is_verified,
        is_blocked: user.is_blocked || false,
        client_number: user.client_number || null,
        created_at: user.created_at,
        last_login: user.last_login,
        profile: user.profiles?.[0] ? {
          name: user.profiles[0].name,
          location: user.profiles[0].location,
          image_url: user.profiles[0].image_url
        } : undefined
      }));

      return { rows, total: count || 0 };
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<void> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Admin authentication required');

      // Block at auth level and mark in users table
      const { error } = await supabase.rpc('admin_block_user', { p_user_id: userId });

      if (error) {
        console.error('Error blocking user:', error);
        throw new Error('Failed to block user');
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.id,
          action_type: 'block_user',
          target_user_id: userId,
          notes: 'User blocked by admin'
        });
    } catch (error) {
      console.error('Error in blockUser:', error);
      throw error;
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Admin authentication required');

      const { error } = await supabase.rpc('admin_unblock_user', { p_user_id: userId });

      if (error) {
        console.error('Error unblocking user:', error);
        throw new Error('Failed to unblock user');
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.id,
          action_type: 'unblock_user',
          target_user_id: userId,
          notes: 'User unblocked by admin'
        });
    } catch (error) {
      console.error('Error in unblockUser:', error);
      throw error;
    }
  },

  /**
   * Get user activity stats
   */
  async getUserStats(): Promise<{
    total: number;
    verified: number;
    blocked: number;
    ladies: number;
    clients: number;
    clubs: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, is_verified, is_blocked');

      if (error) {
        console.error('Error fetching user stats:', error);
        throw new Error('Failed to fetch user statistics');
      }

      const stats = {
        total: data?.length || 0,
        verified: data?.filter(u => u.is_verified).length || 0,
        blocked: data?.filter(u => u.is_blocked).length || 0,
        ladies: data?.filter(u => u.role === 'lady').length || 0,
        clients: data?.filter(u => u.role === 'client').length || 0,
        clubs: data?.filter(u => u.role === 'club').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }
}; 