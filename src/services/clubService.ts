import { supabase } from '../lib/supabase';

export interface ClubProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  license_number?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  membership_tier: 'BASIC' | 'PRO' | 'PREMIUM';
  logo_url?: string;
  cover_photo_url?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  parking_info?: string;
  public_transport_info?: string;
  created_at: string;
  updated_at: string;
}

export interface ClubStats {
  club_id: string;
  name: string;
  user_id: string;
  total_ladies: number;
  active_ladies: number;
  total_bookings: number;
  upcoming_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
}

export interface ClubLady {
  id: string;
  club_id: string;
  lady_id: string;
  join_date: string;
  status: 'active' | 'inactive' | 'suspended';
  revenue_share_percentage: number;
  monthly_fee?: number;
  created_at: string;
  lady?: {
    id: string;
    username: string;
    email: string;
  };
  profile?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export interface ClubBooking {
  id: string;
  club_id: string;
  booking_id: string;
  club_fee: number;
  lady_earnings: number;
  created_at: string;
  booking?: {
    id: string;
    client_id: string;
    provider_id: string;
    date: string;
    time: string;
    duration: string;
    total_cost: number;
    status: string;
  };
  client?: {
    id: string;
    username: string;
  };
  lady?: {
    id: string;
    username: string;
  };
}

export interface ClubActivity {
  id: string;
  club_id: string;
  activity_type: string;
  actor_id?: string;
  target_id?: string;
  metadata?: any;
  created_at: string;
}

export interface ClubNotification {
  id: string;
  club_id: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  read: boolean;
  created_at: string;
}

export const clubService = {
  // Get club by club ID
  async getClubById(clubId: string): Promise<ClubProfile | null> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  },
  // Get club profile by user ID
  async getClubProfile(userId: string): Promise<ClubProfile | null> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No club profile found
        return null;
      }
      throw error;
    }
    return data;
  },

  // Create club profile
  async createClubProfile(userId: string, clubData: Partial<ClubProfile>): Promise<ClubProfile> {
    const { data, error } = await supabase
      .from('clubs')
      .insert({
        user_id: userId,
        ...clubData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update club profile
  async updateClubProfile(userId: string, updates: Partial<ClubProfile>): Promise<ClubProfile> {
    // Ensure a row exists for this user; create one if not
    const { data: existing, error: existingError } = await supabase
      .from('clubs')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing?.id) {
      const { data, error } = await supabase
        .from('clubs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as ClubProfile;
    } else {
      const { data, error } = await supabase
        .from('clubs')
        .insert({ user_id: userId, ...updates })
        .select()
        .single();

      if (error) throw error;
      return data as ClubProfile;
    }
  },

  // Get club stats
  async getClubStats(clubId: string): Promise<ClubStats | null> {
    const { data, error } = await supabase
      .from('club_stats_view')
      .select('*')
      .eq('club_id', clubId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  },

  // Get club ladies
  async getClubLadies(clubId: string): Promise<ClubLady[]> {
    const { data, error } = await supabase
      .from('club_ladies')
      .select(`
        *,
        lady:users!lady_id(*),
        profile:profiles!lady_id(*)
      `)
      .eq('club_id', clubId)
      .order('join_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get club bookings
  async getClubBookings(clubId: string, limit = 10): Promise<ClubBooking[]> {
    const { data, error } = await supabase
      .from('club_bookings')
      .select(`
        *,
        booking:bookings!booking_id(*),
        client:users!client_id(*),
        lady:users!lady_id(*)
      `)
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get upcoming bookings
  async getUpcomingBookings(clubId: string, limit = 5): Promise<ClubBooking[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('club_bookings')
      .select(`
        *,
        booking:bookings!booking_id(
          *,
          client:users!client_id(*),
          provider:profiles!provider_id(*)
        )
      `)
      .eq('club_id', clubId)
      .gte('booking.date', today)
      .order('booking.date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get recent activity
  async getRecentActivity(clubId: string, limit = 10): Promise<ClubActivity[]> {
    const { data, error } = await supabase
      .from('club_activity')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Get notifications
  async getNotifications(clubId: string, limit = 10): Promise<ClubNotification[]> {
    const { data, error } = await supabase
      .from('club_notifications')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('club_notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
  },

  // Add activity log
  async addActivity(clubId: string, activityType: string, actorId?: string, targetId?: string, metadata?: any): Promise<void> {
    const { error } = await supabase
      .from('club_activity')
      .insert({
        club_id: clubId,
        activity_type: activityType,
        actor_id: actorId,
        target_id: targetId,
        metadata
      });
    
    if (error) throw error;
  },

  // Add notification
  async addNotification(clubId: string, type: string, title: string, message: string, metadata?: any): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        club_id: clubId,
        type,
        title,
        message,
        metadata
      });
    
    if (error) throw error;
  },

  // Lady management methods
  async removeLadyFromClub(clubId: string, ladyId: string): Promise<void> {
    const { error } = await supabase
      .from('club_ladies')
      .delete()
      .eq('club_id', clubId)
      .eq('lady_id', ladyId);
    
    if (error) throw error;
  },

  async updateLadyStatus(clubId: string, ladyId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> {
    const { error } = await supabase
      .from('club_ladies')
      .update({ status })
      .eq('club_id', clubId)
      .eq('lady_id', ladyId);
    
    if (error) throw error;
  },

  async addLadyToClub(clubId: string, ladyId: string, revenueSharePercentage: number, monthlyFee?: number): Promise<ClubLady> {
    const { data, error } = await supabase
      .from('club_ladies')
      .insert({
        club_id: clubId,
        lady_id: ladyId,
        revenue_share_percentage: revenueSharePercentage,
        monthly_fee: monthlyFee,
        status: 'active'
      })
      .select(`
        *,
        lady:users!lady_id(*),
        profile:profiles!lady_id(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }
}; 