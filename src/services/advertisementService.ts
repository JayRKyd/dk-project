import { supabase } from '../lib/supabase';

export interface AdvertisementStatus {
  ad_status: 'active' | 'inactive' | 'bumped' | 'expired';
  ad_expiry_date: string | null;
  last_bumped_at: string | null;
  bump_count: number;
  membership_tier: string;
  remaining_free_bumps: number;
  days_until_expiry: number;
  hours_until_expiry: number;
  is_expired: boolean;
}

export interface BumpResult {
  success: boolean;
  message: string;
  newStatus?: AdvertisementStatus;
}

/**
 * Get advertisement status for a profile
 * @param profileId The profile ID
 * @returns Advertisement status details
 */
export const getAdvertisementStatus = async (profileId: string): Promise<AdvertisementStatus | undefined> => {
  try {
    const { data, error } = await supabase.rpc('get_advertisement_status', {
      p_profile_id: profileId
    });

    if (error) throw error;
    return data as AdvertisementStatus;
  } catch (error) {
    console.error('Error getting advertisement status:', error);
    return undefined;
  }
};

/**
 * Bump an advertisement to increase visibility
 * @param profileId The profile ID
 * @param bumpType Type of bump: 'free', 'paid', or 'credit'
 * @param creditsUsed Number of credits to use (for 'credit' type)
 * @returns Result of the bump operation
 */
export const bumpAdvertisement = async (
  profileId: string,
  bumpType: 'free' | 'paid' | 'credit' = 'free',
  creditsUsed: number = 0
): Promise<BumpResult> => {
  try {
    // Call the bump_advertisement function
    const { data, error } = await supabase.rpc('bump_advertisement', {
      p_profile_id: profileId,
      p_bump_type: bumpType,
      p_credits_used: creditsUsed
    });

    if (error) throw error;

    // If the bump was successful
    if (data) {
      // Get the updated advertisement status
      const newStatus = await getAdvertisementStatus(profileId);
      
      return {
        success: true,
        message: `Advertisement successfully bumped with ${bumpType} bump.`,
        newStatus
      };
    } else {
      // If the bump failed
      let message = 'Failed to bump advertisement.';
      
      // Get the current status to determine why it failed
      const currentStatus = await getAdvertisementStatus(profileId);
      
      if (bumpType === 'free' && currentStatus?.remaining_free_bumps === 0) {
        message = 'No free bumps remaining for this month.';
      } else if (bumpType === 'credit' && !data) {
        message = 'Not enough credits for this operation.';
      }
      
      return {
        success: false,
        message
      };
    }
  } catch (error) {
    console.error('Error bumping advertisement:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

/**
 * Activate an advertisement
 * @param profileId The profile ID
 * @returns Success status
 */
export const activateAdvertisement = async (profileId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ad_status: 'active' })
      .eq('id', profileId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error activating advertisement:', error);
    return false;
  }
};

/**
 * Deactivate an advertisement
 * @param profileId The profile ID
 * @returns Success status
 */
export const deactivateAdvertisement = async (profileId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ad_status: 'inactive' })
      .eq('id', profileId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deactivating advertisement:', error);
    return false;
  }
};

/**
 * Get bump history for a profile
 * @param profileId The profile ID
 * @param limit Maximum number of records to return
 * @returns Array of bump records
 */
export const getBumpHistory = async (profileId: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('profile_bumps')
      .select('*')
      .eq('profile_id', profileId)
      .order('bumped_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting bump history:', error);
    return [];
  }
};

/**
 * Format time until expiry in a human-readable format
 * @param status Advertisement status
 * @returns Formatted time string
 */
export const formatTimeUntilExpiry = (status: AdvertisementStatus | undefined | null): string => {
  if (!status || status.is_expired) {
    return 'Expired';
  }
  
  const days = Math.floor(status.days_until_expiry);
  const hours = Math.floor(status.hours_until_expiry % 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return 'Less than an hour';
  }
};

/**
 * Initialize advertisement for a new profile based on membership tier
 * @param profileId The profile ID
 * @param userId The user ID
 * @returns Success status
 */
export const initializeAdvertisement = async (profileId: string, userId: string): Promise<boolean> => {
  try {
    // Get user's membership tier
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('membership_tier')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get tier duration
    const { data: tierData, error: tierError } = await supabase
      .from('membership_tiers')
      .select('ad_duration')
      .eq('name', userData.membership_tier || 'FREE')
      .single();

    if (tierError) throw tierError;

    // Calculate expiry date
    const expiryDate = new Date();
    // Parse the interval string (e.g., "7 days" or "30 days")
    const durationMatch = tierData.ad_duration.match(/(\d+)\s+(\w+)/);
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      
      if (unit.includes('day')) {
        expiryDate.setDate(expiryDate.getDate() + value);
      } else if (unit.includes('month')) {
        expiryDate.setMonth(expiryDate.getMonth() + value);
      } else if (unit.includes('year')) {
        expiryDate.setFullYear(expiryDate.getFullYear() + value);
      }
    }

    // Update profile with expiry date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ad_status: 'active',
        ad_expiry_date: expiryDate.toISOString()
      })
      .eq('id', profileId);

    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error initializing advertisement:', error);
    return false;
  }
};
