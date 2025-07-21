/**
 * Protected API Service
 * Wraps Supabase API calls with membership tier validation
 */

import { supabase } from '../lib/supabase';
import { membershipValidationService } from './membershipValidationService';
import { logMembershipAction } from '../utils/developmentUtils';

export class MembershipAccessError extends Error {
  constructor(
    message: string,
    public userTier: string,
    public requiredTier: string,
    public feature: string
  ) {
    super(message);
    this.name = 'MembershipAccessError';
  }
}

interface ProtectedApiOptions {
  requireAuth?: boolean;
  requiredTier?: 'FREE' | 'PRO';
  feature?: string;
  endpoint?: string;
  bypassInDev?: boolean;
}

/**
 * Main protected API call function
 */
export const protectedApiCall = async <T = any>(
  apiCall: () => Promise<{ data: T; error: any }>,
  options: ProtectedApiOptions = {}
): Promise<{ data: T; error: any }> => {
  const {
    requireAuth = true,
    requiredTier = 'FREE',
    feature,
    endpoint,
    bypassInDev = true
  } = options;

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (requireAuth && (authError || !user)) {
      logMembershipAction('API call failed - no auth', { feature, endpoint });
      return {
        data: null as T,
        error: { message: 'Authentication required', code: 'AUTH_REQUIRED' }
      };
    }

    if (user) {
      // Validate membership access
      let validationResult;
      
      if (feature) {
        // Feature-based validation
        validationResult = bypassInDev 
          ? await membershipValidationService.validateWithBypass(user.id, feature, user)
          : await membershipValidationService.validateFeatureAccess(user.id, feature);
      } else if (endpoint) {
        // Endpoint-based validation
        validationResult = await membershipValidationService.validateAPIAccess(user.id, endpoint);
      } else {
        // Manual tier validation
        const userTier = await getUserTier(user.id);
        validationResult = {
          hasAccess: checkTierAccess(userTier, requiredTier),
          userTier,
          requiredTier,
          reason: `Requires ${requiredTier} membership`
        };
      }

      if (!validationResult.hasAccess) {
        logMembershipAction('API call blocked - insufficient tier', {
          userId: user.id,
          feature,
          endpoint,
          userTier: validationResult.userTier,
          requiredTier: validationResult.requiredTier
        });

        const errorMessage = validationResult.reason || 
          `This feature requires ${validationResult.requiredTier} membership`;
        
        throw new MembershipAccessError(
          errorMessage,
          validationResult.userTier,
          validationResult.requiredTier,
          feature || endpoint || 'unknown'
        );
      }

      logMembershipAction('API call authorized', {
        userId: user.id,
        feature,
        endpoint,
        userTier: validationResult.userTier
      });
    }

    // Execute the actual API call
    return await apiCall();

  } catch (error) {
    if (error instanceof MembershipAccessError) {
      return {
        data: null as T,
        error: {
          message: error.message,
          code: 'MEMBERSHIP_REQUIRED',
          userTier: error.userTier,
          requiredTier: error.requiredTier,
          feature: error.feature
        }
      };
    }

    logMembershipAction('API call error', { feature, endpoint, error });
    throw error;
  }
};

/**
 * Helper function to get user tier
 */
async function getUserTier(userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_tier')
    .eq('user_id', userId)
    .single();
  
  return profile?.membership_tier || 'FREE';
}

/**
 * Helper function to check tier access
 */
function checkTierAccess(userTier: string, requiredTier: 'FREE' | 'PRO'): boolean {
  if (requiredTier === 'FREE') return true;
  if (requiredTier === 'PRO') return userTier === 'PRO';
  return false;
}

/**
 * Specific protected API functions for common operations
 */
export const protectedApiService = {
  /**
   * Fan Posts API (PRO only)
   */
  fanPosts: {
    async list() {
      return protectedApiCall(
        async () => await supabase.from('fan_posts').select('*'),
        { feature: 'fan_posts', endpoint: 'fan_posts' }
      );
    },
    
    async create(fanPostData: any) {
      return protectedApiCall(
        async () => await supabase.from('fan_posts').insert(fanPostData),
        { feature: 'fan_posts_create', endpoint: 'fan_posts' }
      );
    },
    
    async update(id: string, updates: any) {
      return protectedApiCall(
        async () => await supabase.from('fan_posts').update(updates).eq('id', id),
        { feature: 'fan_posts_manage', endpoint: 'fan_posts' }
      );
    },
    
    async delete(id: string) {
      return protectedApiCall(
        async () => await supabase.from('fan_posts').delete().eq('id', id),
        { feature: 'fan_posts_manage', endpoint: 'fan_posts' }
      );
    }
  },

  /**
   * Gifts API (PRO only)
   */
  gifts: {
    async getReceived() {
      return protectedApiCall(
        async () => await supabase.from('gifts').select('*').eq('recipient_type', 'lady'),
        { feature: 'gifts_received', endpoint: 'gifts' }
      );
    },
    
    async getTransactions() {
      return protectedApiCall(
        async () => await supabase.from('gift_transactions').select('*'),
        { feature: 'gifts_management', endpoint: 'gift_transactions' }
      );
    }
  },

  /**
   * Bookings API (PRO only)
   */
  bookings: {
    async list() {
      return protectedApiCall(
        async () => await supabase.from('bookings').select('*'),
        { feature: 'booking_management', endpoint: 'bookings' }
      );
    },
    
    async create(bookingData: any) {
      return protectedApiCall(
        async () => await supabase.from('bookings').insert(bookingData),
        { feature: 'online_bookings', endpoint: 'bookings' }
      );
    },
    
    async update(id: string, updates: any) {
      return protectedApiCall(
        async () => await supabase.from('bookings').update(updates).eq('id', id),
        { feature: 'booking_management', endpoint: 'bookings' }
      );
    }
  },

  /**
   * Credits API (PRO only)
   */
  credits: {
    async getBalance() {
      return protectedApiCall(
        async () => await supabase.from('profiles').select('credits'),
        { feature: 'dk_credits', endpoint: 'dk_credits' }
      );
    },
    
    async getTransactions() {
      return protectedApiCall(
        async () => await supabase.from('credit_transactions').select('*'),
        { feature: 'dk_credits', endpoint: 'credit_transactions' }
      );
    }
  },

  /**
   * Analytics API (PRO only)
   */
  analytics: {
    async getFanPostMetrics() {
      return protectedApiCall(
        async () => await supabase.from('fan_post_analytics').select('*'),
        { feature: 'advanced_analytics', endpoint: 'fan_post_analytics' }
      );
    }
  },

  /**
   * Free tier APIs (available to all)
   */
  free: {
    async getProfile() {
      return protectedApiCall(
        async () => await supabase.from('profiles').select('*'),
        { feature: 'profile_view', endpoint: 'profiles' }
      );
    },
    
    async getReviews() {
      return protectedApiCall(
        async () => await supabase.from('reviews').select('*'),
        { feature: 'reviews_view', endpoint: 'reviews' }
      );
    },
    
    async getNotifications() {
      return protectedApiCall(
        async () => await supabase.from('notifications').select('*'),
        { feature: 'basic_stats', endpoint: 'notifications' }
      );
    }
  }
};

export default protectedApiService; 