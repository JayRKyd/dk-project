import { supabase } from '../lib/supabase';

// Admin Analytics Types and Functions
export interface AnalyticsData {
  totalUsers: number;
  totalLadies: number;
  totalClients: number;
  totalClubs: number;
  verifiedUsers: number;
  lockedUsers: number;
  totalProfiles: number;
  totalBookings: number;
  totalReviews: number;
  totalFanPosts: number;
  totalGifts: number;
  userStats: {
    role: string;
    count: number;
    verifiedCount: number;
  }[];
  recentActivity: {
    date: string;
    newUsers: number;
  }[];
}

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    console.log('Starting analytics data fetch...');
    
    // Get total counts
    const [
      { count: totalUsers, error: usersError },
      { count: totalLadies, error: ladiesError },
      { count: totalClients, error: clientsError },
      { count: totalClubs, error: clubsError },
      { count: verifiedUsers, error: verifiedError },
      { count: lockedUsers, error: lockedError },
      { count: totalProfiles, error: profilesError },
      { count: totalBookings, error: bookingsError },
      { count: totalReviews, error: reviewsError },
      { count: totalFanPosts, error: fanPostsError },
      { count: totalGifts, error: giftsError }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'lady'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'client'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'club'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_blocked', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('fan_posts').select('*', { count: 'exact', head: true }),
      supabase.from('gifts').select('*', { count: 'exact', head: true })
    ]);

    // Check for errors
    const errors = [usersError, ladiesError, clientsError, clubsError, verifiedError, lockedError, profilesError, bookingsError, reviewsError, fanPostsError, giftsError];
    const hasErrors = errors.some(error => error);
    
    if (hasErrors) {
      console.error('Database errors:', errors);
      throw new Error('Failed to fetch analytics data from database');
    }

    console.log('Counts fetched:', {
      totalUsers, totalLadies, totalClients, totalClubs, verifiedUsers, lockedUsers,
      totalProfiles, totalBookings, totalReviews, totalFanPosts, totalGifts
    });

    // Get user statistics by role
    const { data: userStatsData, error: userStatsError } = await supabase
      .from('users')
      .select('role, is_verified');

    if (userStatsError) {
      console.error('Error fetching user stats:', userStatsError);
      throw userStatsError;
    }

    const userStats = userStatsData?.reduce((acc, user) => {
      const existing = acc.find(stat => stat.role === user.role);
      if (existing) {
        existing.count++;
        if (user.is_verified) existing.verifiedCount++;
      } else {
        acc.push({
          role: user.role,
          count: 1,
          verifiedCount: user.is_verified ? 1 : 0
        });
      }
      return acc;
    }, [] as { role: string; count: number; verifiedCount: number }[]) || [];

    console.log('User stats calculated:', JSON.stringify(userStats, null, 2));

    // Get recent activity (new users in last 7 days)
    const { data: recentActivityData, error: recentActivityError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (recentActivityError) {
      console.error('Error fetching recent activity:', recentActivityError);
      throw recentActivityError;
    }

    const recentActivity = recentActivityData?.reduce((acc, user) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      const existing = acc.find(activity => activity.date === date);
      if (existing) {
        existing.newUsers++;
      } else {
        acc.push({ date, newUsers: 1 });
      }
      return acc;
    }, [] as { date: string; newUsers: number }[]) || [];

    console.log('Recent activity calculated:', JSON.stringify(recentActivity, null, 2));

    const result = {
      totalUsers: totalUsers || 0,
      totalLadies: totalLadies || 0,
      totalClients: totalClients || 0,
      totalClubs: totalClubs || 0,
      verifiedUsers: verifiedUsers || 0,
      lockedUsers: lockedUsers || 0,
      totalProfiles: totalProfiles || 0,
      totalBookings: totalBookings || 0,
      totalReviews: totalReviews || 0,
      totalFanPosts: totalFanPosts || 0,
      totalGifts: totalGifts || 0,
      userStats,
      recentActivity
    };

    console.log('Final analytics result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

// Club Analytics Types and Functions (Original functionality)
export interface ProfileView {
  id: string;
  club_id: string;
  viewer_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}

export interface ViewAnalytics {
  total_views: number;
  daily_views: number;
  weekly_views: number;
  monthly_views: number;
  unique_viewers: number;
  returning_viewers: number;
}

export interface RevenueData {
  total_revenue: number;
  booking_revenue: number;
  commission_earnings: number;
  monthly_recurring: number;
  growth_percentage: number;
}

export const analyticsService = {
  // Track a profile view
  async trackProfileView(
    clubId: string, 
    viewerId?: string, 
    ipAddress?: string,
    userAgent?: string,
    referrer?: string
  ): Promise<ProfileView> {
    const { data, error } = await supabase
      .from('club_profile_views')
      .insert({
        club_id: clubId,
        viewer_id: viewerId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get view analytics for a club
  async getViewAnalytics(clubId: string): Promise<ViewAnalytics> {
    const today = new Date();
    const oneDay = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const oneWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total views
    const { count: totalViews } = await supabase
      .from('club_profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId);

    // Get daily views
    const { count: dailyViews } = await supabase
      .from('club_profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .gte('created_at', oneDay.toISOString());

    // Get weekly views
    const { count: weeklyViews } = await supabase
      .from('club_profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .gte('created_at', oneWeek.toISOString());

    // Get monthly views
    const { count: monthlyViews } = await supabase
      .from('club_profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .gte('created_at', oneMonth.toISOString());

    // Get unique viewers (based on IP address for anonymous + user ID for logged in)
    const { data: uniqueViewsData } = await supabase
      .from('club_profile_views')
      .select('viewer_id, ip_address')
      .eq('club_id', clubId);

    const uniqueIdentifiers = new Set();
    uniqueViewsData?.forEach(view => {
      if (view.viewer_id) {
        uniqueIdentifiers.add(`user_${view.viewer_id}`);
      } else if (view.ip_address) {
        uniqueIdentifiers.add(`ip_${view.ip_address}`);
      }
    });

    // Calculate returning viewers (simplified - viewers with more than 1 view)
    const viewerCounts = new Map();
    uniqueViewsData?.forEach(view => {
      const identifier = view.viewer_id || view.ip_address;
      if (identifier) {
        viewerCounts.set(identifier, (viewerCounts.get(identifier) || 0) + 1);
      }
    });

    const returningViewers = Array.from(viewerCounts.values()).filter(count => count > 1).length;

    return {
      total_views: totalViews || 0,
      daily_views: dailyViews || 0,
      weekly_views: weeklyViews || 0,
      monthly_views: monthlyViews || 0,
      unique_viewers: uniqueIdentifiers.size,
      returning_viewers: returningViewers
    };
  },

  // Get revenue data for a club
  async getRevenueData(clubId: string): Promise<RevenueData> {
    // Get booking revenue from club_bookings
    const { data: bookings } = await supabase
      .from('club_bookings')
      .select('club_fee')
      .eq('club_id', clubId);

    const bookingRevenue = bookings?.reduce((sum, booking) => sum + (booking.club_fee || 0), 0) || 0;

    // Calculate commission (assuming 15% commission rate)
    const commissionRate = 0.15;
    const commissionEarnings = bookingRevenue * commissionRate;

    const totalRevenue = bookingRevenue + commissionEarnings;

    // Get last month's revenue for growth calculation
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const { data: lastMonthBookings } = await supabase
      .from('club_bookings')
      .select('club_fee')
      .eq('club_id', clubId)
      .gte('created_at', lastMonth.toISOString());

    const lastMonthRevenue = lastMonthBookings?.reduce((sum, booking) => sum + (booking.club_fee || 0), 0) || 0;
    const growthPercentage = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      total_revenue: totalRevenue,
      booking_revenue: bookingRevenue,
      commission_earnings: commissionEarnings,
      monthly_recurring: totalRevenue, // Simplified - could be calculated based on subscription
      growth_percentage: Math.round(growthPercentage * 100) / 100
    };
  },

  // Get view trends (for charts)
  async getViewTrends(clubId: string, days = 7): Promise<{ date: string; views: number }[]> {
    const trends = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const { count: views } = await supabase
        .from('club_profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId)
        .gte('created_at', date.toISOString().split('T')[0])
        .lt('created_at', nextDate.toISOString().split('T')[0]);

      trends.push({
        date: date.toISOString().split('T')[0],
        views: views || 0
      });
    }

    return trends;
  },

  // Get top referrers
  async getTopReferrers(clubId: string, limit = 5): Promise<{ referrer: string; count: number }[]> {
    const { data } = await supabase
      .from('club_profile_views')
      .select('referrer')
      .eq('club_id', clubId)
      .not('referrer', 'is', null);

    if (!data) return [];

    const referrerCounts = new Map();
    data.forEach(view => {
      if (view.referrer) {
        referrerCounts.set(view.referrer, (referrerCounts.get(view.referrer) || 0) + 1);
      }
    });

    return Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}; 