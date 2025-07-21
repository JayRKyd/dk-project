import { supabase } from '../lib/supabase';

export interface ProfileStats {
  profileViews: number;
  profileViewsChange: number;
  loves: number;
  lovesChange: number;
  reviews: number;
  reviewsChange: number;
  giftsReceived: number;
  giftsReceivedChange: number;
  gifts: number;
}

export interface Activity {
  id: string;
  type: 'view' | 'love' | 'message' | 'gift' | 'review' | 'booking';
  user_id: string;
  profile_id: string;
  created_at: string;
  user?: {
    username: string;
  };
  data?: any;
}

// Database response types

/**
 * Get profile statistics for a lady with percentage changes
 * @param userId The lady's user ID
 * @returns Profile statistics with percentage changes
 */
export const getProfileStats = async (userId: string): Promise<ProfileStats> => {
  try {
    // First check if we have stats in the profile_stats table
    const { data: statsData, error: statsError } = await supabase
      .from('profile_stats')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching profile stats:', statsError);
    }

    // If we have stats data, use it
    if (statsData) {
      return {
        profileViews: statsData.views_current_week || 0,
        profileViewsChange: calculatePercentageChange(statsData.views_current_week, statsData.views_previous_week),
        loves: statsData.loves_current_week || 0,
        lovesChange: calculatePercentageChange(statsData.loves_current_week, statsData.loves_previous_week),
        reviews: statsData.reviews_current_week || 0,
        reviewsChange: calculatePercentageChange(statsData.reviews_current_week, statsData.reviews_previous_week),
        giftsReceived: statsData.gifts_current_week || 0,
        giftsReceivedChange: calculatePercentageChange(statsData.gifts_current_week, statsData.gifts_previous_week),
        gifts: 0 // This will be filled in later
      };
    }

    // If we don't have stats data, fall back to counting from the individual tables
    // Get profile views count
    const { count: viewsCount, error: viewsError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId);

    if (viewsError) throw viewsError;

    // Get loves count from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('loves')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get reviews count
    const { count: reviewsCount, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId);

    if (reviewsError) throw reviewsError;

    // Get gifts received count
    const { count: giftsReceivedCount, error: giftsReceivedError } = await supabase
      .from('gifts')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId);

    if (giftsReceivedError) throw giftsReceivedError;

    // Get gifts sent count
    const { count: giftsSentCount, error: giftsSentError } = await supabase
      .from('gifts')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', userId);

    if (giftsSentError) throw giftsSentError;

    // Create a new entry in the profile_stats table
    const newStats = {
      profile_id: userId,
      views_current_week: viewsCount || 0,
      views_previous_week: 0,
      loves_current_week: profileData?.loves || 0,
      loves_previous_week: 0,
      reviews_current_week: reviewsCount || 0,
      reviews_previous_week: 0,
      gifts_current_week: giftsReceivedCount || 0,
      gifts_previous_week: 0
    };

    const { error: insertError } = await supabase
      .from('profile_stats')
      .insert(newStats);

    if (insertError) {
      console.error('Error creating profile stats:', insertError);
    }

    return {
      profileViews: viewsCount || 0,
      profileViewsChange: 0, // No previous data to compare
      loves: profileData?.loves || 0,
      lovesChange: 0, // No previous data to compare
      reviews: reviewsCount || 0,
      reviewsChange: 0, // No previous data to compare
      giftsReceived: giftsReceivedCount || 0,
      giftsReceivedChange: 0, // No previous data to compare
      gifts: giftsSentCount || 0
    };
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return {
      profileViews: 0,
      profileViewsChange: 0,
      loves: 0,
      lovesChange: 0,
      reviews: 0,
      reviewsChange: 0,
      giftsReceived: 0,
      giftsReceivedChange: 0,
      gifts: 0
    };
  }
};

/**
 * Calculate percentage change between two values
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change (positive or negative)
 */
const calculatePercentageChange = (current: number, previous: number): number => {
  if (!previous || previous === 0) return 0;
  const change = ((current - previous) / previous) * 100;
  return Math.round(change);
};

/**
 * Update weekly stats for a profile
 * This should be called by a scheduled function weekly
 * @param profileId The profile ID
 */
export const updateWeeklyStats = async (profileId: string): Promise<boolean> => {
  try {
    // Get current stats
    const { data: currentStats, error: statsError } = await supabase
      .from('profile_stats')
      .select('*')
      .eq('profile_id', profileId)
      .single();

    if (statsError && statsError.code !== 'PGRST116') throw statsError;

    if (!currentStats) {
      // No stats exist yet, create them
      return await createInitialStats(profileId);
    }

    // Count this week's stats
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count views in the last week
    const { count: viewsCount, error: viewsError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('viewed_at', oneWeekAgo.toISOString())
      .lte('viewed_at', now.toISOString());

    if (viewsError) throw viewsError;

    // Get current loves count
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('loves')
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;

    // Count reviews in the last week
    const { count: reviewsCount, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)
      .gte('created_at', oneWeekAgo.toISOString())
      .lte('created_at', now.toISOString());

    if (reviewsError) throw reviewsError;

    // Count gifts in the last week
    const { count: giftsCount, error: giftsError } = await supabase
      .from('gifts')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', profileId)
      .gte('created_at', oneWeekAgo.toISOString())
      .lte('created_at', now.toISOString());

    if (giftsError) throw giftsError;

    // Update stats
    const { error: updateError } = await supabase
      .from('profile_stats')
      .update({
        views_previous_week: currentStats.views_current_week,
        views_current_week: viewsCount || 0,
        loves_previous_week: currentStats.loves_current_week,
        loves_current_week: profileData?.loves || 0,
        reviews_previous_week: currentStats.reviews_current_week,
        reviews_current_week: reviewsCount || 0,
        gifts_previous_week: currentStats.gifts_current_week,
        gifts_current_week: giftsCount || 0,
        updated_at: now.toISOString()
      })
      .eq('profile_id', profileId);

    if (updateError) throw updateError;

    return true;
  } catch (error) {
    console.error('Error updating weekly stats:', error);
    return false;
  }
};

/**
 * Create initial stats for a profile
 * @param profileId The profile ID
 */
const createInitialStats = async (profileId: string): Promise<boolean> => {
  try {
    // Count total views
    const { count: viewsCount, error: viewsError } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (viewsError) throw viewsError;

    // Get current loves count
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('loves')
      .eq('id', profileId)
      .single();

    if (profileError) throw profileError;

    // Count total reviews
    const { count: reviewsCount, error: reviewsError } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (reviewsError) throw reviewsError;

    // Count total gifts
    const { count: giftsCount, error: giftsError } = await supabase
      .from('gifts')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', profileId);

    if (giftsError) throw giftsError;

    // Create stats record
    const { error: insertError } = await supabase
      .from('profile_stats')
      .insert({
        profile_id: profileId,
        views_current_week: viewsCount || 0,
        views_previous_week: 0,
        loves_current_week: profileData?.loves || 0,
        loves_previous_week: 0,
        reviews_current_week: reviewsCount || 0,
        reviews_previous_week: 0,
        gifts_current_week: giftsCount || 0,
        gifts_previous_week: 0
      });

    if (insertError) throw insertError;

    return true;
  } catch (error) {
    console.error('Error creating initial stats:', error);
    return false;
  }
};

/**
 * Get recent activities for a lady's profile
 * @param userId The lady's user ID
 * @param limit Maximum number of activities to return
 * @returns Array of recent activities
 */
export const getRecentActivities = async (
  userId: string,
  limit: number = 5
): Promise<Activity[]> => {
  try {
    // First try to get activities from the activities table directly
    // This is more likely to succeed with the current RLS policies
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('id, type, user_id, profile_id, created_at, users:user_id(username)')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!activitiesError && activitiesData && activitiesData.length > 0) {
      return activitiesData.map(item => ({
        id: item.id,
        type: item.type as 'view' | 'love' | 'message' | 'gift' | 'review' | 'booking',
        user_id: item.user_id,
        profile_id: item.profile_id,
        created_at: item.created_at,
        user: item.users ? { username: (Array.isArray(item.users) ? (item.users[0] as any)?.username : (item.users as any).username) } : undefined,
        username: item.users ? (Array.isArray(item.users) ? (item.users[0] as any)?.username || 'Anonymous' : (item.users as any).username || 'Anonymous') : 'Anonymous'
      }));
    }

    // If no activities in the activities table, try the RPC function
    const { data, error } = await supabase.rpc('get_recent_activities', {
      p_profile_id: userId,
      p_limit: limit
    });

    if (error) {
      console.error('Error calling get_recent_activities:', error);
      // If both approaches fail, try to get individual activity types
      
      // Get profile views
      const { data: viewsData } = await supabase
        .from('profile_views')
        .select('id, viewer_id, profile_id, viewed_at, users:viewer_id(username)')
        .eq('profile_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      // Get profile loves
      const { data: lovesData } = await supabase
        .from('profile_loves')
        .select('id, user_id, profile_id, created_at, users:user_id(username)')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Combine activities
      const activities: Activity[] = [
        ...(viewsData || []).map(item => ({
          id: item.id,
          type: 'view' as const,
          user_id: item.viewer_id,
          profile_id: item.profile_id,
          created_at: item.viewed_at,
          user: item.users ? { username: (Array.isArray(item.users) ? (item.users[0] as any)?.username : (item.users as any).username) } : undefined,
          username: item.users ? (Array.isArray(item.users) ? (item.users[0] as any)?.username || 'Anonymous' : (item.users as any).username || 'Anonymous') : 'Anonymous'
        })),
        ...(lovesData || []).map(item => ({
          id: item.id,
          type: 'love' as const,
          user_id: item.user_id,
          profile_id: item.profile_id,
          created_at: item.created_at,
          user: item.users ? { username: (Array.isArray(item.users) ? (item.users[0] as any)?.username : (item.users as any).username) } : undefined,
          username: item.users ? (Array.isArray(item.users) ? (item.users[0] as any)?.username || 'Anonymous' : (item.users as any).username || 'Anonymous') : 'Anonymous'
        }))
      ];

      // Sort and limit
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
    }

    // Process the data from the function
    if (data && Array.isArray(data)) {
      return data.map(item => ({
        id: item.id,
        type: item.type as 'view' | 'love' | 'message' | 'gift' | 'review' | 'booking',
        user_id: item.user_id,
        profile_id: item.profile_id,
        created_at: item.created_at,
        user: item.username ? { username: String(item.username) } : undefined,
        username: item.username ? String(item.username) : 'Anonymous'
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
};

/**
 * Calculate profile completion percentage
 * @param userId The user's ID
 * @returns Completion percentage, missing items, and detailed suggestions
 */
export const getProfileCompletion = async (userId: string) => {
  try {
    // Get profile completion percentage and missing items
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get photos count
    const { count: photosCount, error: photosError } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact' })
      .eq('profile_id', userId);

    if (photosError) throw photosError;

    // Get user's services count
    const { count: servicesCount, error: servicesError } = await supabase
      .from('services')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (servicesError) throw servicesError;

    // Get user's availability
    const { count: availabilityCount, error: availabilityError } = await supabase
      .from('availability')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (availabilityError) throw availabilityError;

    // Define required fields and their weights with detailed validation
    const requiredFields = [
      { 
        name: 'name', 
        weight: 8, 
        value: profileData?.name ? profileData.name.length >= 2 : false,
        details: !profileData?.name ? 'Name is missing' : 
                 profileData.name.length < 2 ? 'Name is too short' : null
      },
      { 
        name: 'description', 
        weight: 12, 
        value: profileData?.description ? profileData.description.length >= 50 : false,
        details: !profileData?.description ? 'Description is missing' : 
                 profileData.description.length < 50 ? 'Description is too short (min 50 characters)' : null
      },
      { 
        name: 'location', 
        weight: 8, 
        value: !!profileData?.location,
        details: !profileData?.location ? 'Location is missing' : null
      },
      { 
        name: 'phone_verified', 
        weight: 10, 
        value: !!profileData?.phone_verified,
        details: !profileData?.phone_verified ? 'Phone number is not verified' : null
      },
      { 
        name: 'photos', 
        weight: 15, 
        value: (photosCount || 0) >= 3,
        details: !photosCount ? 'No photos uploaded' : 
                 photosCount < 3 ? `Only ${photosCount} of 3 required photos uploaded` : null
      },
      { 
        name: 'services', 
        weight: 15, 
        value: (servicesCount || 0) >= 1,
        details: !servicesCount ? 'No services listed' : null
      },
      { 
        name: 'price', 
        weight: 8, 
        value: profileData?.price && profileData.price > 0,
        details: !profileData?.price ? 'Price is not set' : 
                 profileData.price <= 0 ? 'Price must be greater than zero' : null
      },
      { 
        name: 'availability', 
        weight: 8, 
        value: (availabilityCount || 0) > 0,
        details: !availabilityCount ? 'Availability schedule is not set' : null
      },
      { 
        name: 'age', 
        weight: 6, 
        value: profileData?.age && profileData.age >= 18,
        details: !profileData?.age ? 'Age is not set' : 
                 profileData.age < 18 ? 'Age must be 18 or older' : null
      },
      { 
        name: 'profile_type', 
        weight: 5, 
        value: !!profileData?.profile_type,
        details: !profileData?.profile_type ? 'Profile type is not selected' : null
      },
      { 
        name: 'languages', 
        weight: 5, 
        value: profileData?.languages && profileData.languages.length > 0,
        details: !profileData?.languages || profileData.languages.length === 0 ? 
                 'No languages specified' : null
      }
    ];

    // Calculate completion percentage
    const totalWeight = requiredFields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = requiredFields.reduce(
      (sum, field) => sum + (field.value ? field.weight : 0),
      0
    );
    const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

    // Identify missing items with detailed suggestions
    const missingItems = requiredFields
      .filter(field => !field.value)
      .map(field => {
        switch (field.name) {
          case 'name':
            return 'Add your full name (first and last name)';
          case 'description':
            return 'Add a detailed description (min 50 characters) highlighting your personality and services';
          case 'location':
            return 'Add your location to help clients find you';
          case 'phone_verified':
            return 'Verify your phone number to increase trust and visibility';
          case 'photos':
            return `Add ${Math.max(0, 3 - (photosCount || 0))} more photos (professional photos get more attention)`;
          case 'services':
            return 'Add your services with detailed descriptions';
          case 'price':
            return 'Set your pricing information';
          case 'availability':
            return 'Set your availability schedule so clients know when you\'re free';
          case 'age':
            return 'Add your age (must be 18+)';
          case 'profile_type':
            return 'Select your profile type (escort, massage, etc.)';
          case 'languages':
            return 'Add languages you speak to attract more clients';
          default:
            return `Complete your ${field.name} information`;
        }
      });

    // Generate detailed suggestions for improvement
    const detailedSuggestions = requiredFields
      .filter(field => field.details)
      .map(field => field.details)
      .filter(Boolean) as string[];

    // Calculate profile strength based on completion
    let profileStrength = 'Weak';
    if (completionPercentage >= 80) {
      profileStrength = 'Excellent';
    } else if (completionPercentage >= 60) {
      profileStrength = 'Good';
    } else if (completionPercentage >= 40) {
      profileStrength = 'Average';
    }

    // Prioritize suggestions based on weight
    const prioritizedMissingItems = requiredFields
      .filter(field => !field.value)
      .sort((a, b) => b.weight - a.weight)
      .map(field => field.name);

    return {
      completionPercentage,
      missingItems,
      detailedSuggestions,
      profileStrength,
      prioritizedMissingItems
    };
  } catch (error) {
    console.error('Error calculating profile completion:', error);
    return {
      completionPercentage: 0,
      missingItems: ['Error calculating profile completion'],
      detailedSuggestions: ['There was an error calculating your profile completion'],
      profileStrength: 'Unknown',
      prioritizedMissingItems: []
    };
  }
};

/**
 * Record a profile view
 * @param userId The viewing user's ID
 * @param profileId The viewed profile's ID
 * @returns Success status
 */
export const recordProfileView = async (
  userId: string,
  profileId: string
): Promise<boolean> => {
  try {
    // Don't record if viewing own profile
    if (userId === profileId) return true;

    // Insert into profile_views table
    const { error: viewError } = await supabase
      .from('profile_views')
      .insert({
        viewer_id: userId,
        profile_id: profileId
      });

    if (viewError) throw viewError;

    // Create activity record
    const { error: activityError } = await supabase
      .from('activities')
      .insert({
        profile_id: profileId,
        user_id: userId,
        type: 'view',
        data: null
      });

    if (activityError) {
      console.error('Error creating activity record:', activityError);
      // Continue even if activity creation fails
    }

    return true;
  } catch (error) {
    console.error('Error recording profile view:', error);
    return false;
  }
};

/**
 * Toggle love status for a profile
 * @param userId The user's ID
 * @param profileId The profile's ID
 * @returns New love status (true if loved, false if unloved)
 */
export const toggleProfileLove = async (
  userId: string,
  profileId: string
): Promise<boolean> => {
  try {
    // Check if already loved
    const { data: existingLove, error: checkError } = await supabase
      .from('profile_loves')
      .select('*')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existingLove) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('profile_loves')
        .delete()
        .eq('id', existingLove.id);

      if (deleteError) throw deleteError;

      // Update loves count in profiles table
      const { error: updateError } = await supabase.rpc('decrement_loves', {
        profile_id: profileId
      });

      if (updateError) throw updateError;

      return false;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('profile_loves')
        .insert({
          user_id: userId,
          profile_id: profileId
        });

      if (insertError) throw insertError;

      // Update loves count in profiles table
      const { error: updateError } = await supabase.rpc('increment_loves', {
        profile_id: profileId
      });

      if (updateError) throw updateError;

      // Create activity record
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          profile_id: profileId,
          user_id: userId,
          type: 'love',
          data: null
        });

      if (activityError) {
        console.error('Error creating activity record:', activityError);
        // Continue even if activity creation fails
      }

      return true;
    }
  } catch (error) {
    console.error('Error toggling profile love:', error);
    return false;
  }
};
