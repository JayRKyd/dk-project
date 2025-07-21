/**
 * Membership Validation Service
 * Provides backend validation for membership tier access controls
 */

import { supabase } from '../lib/supabase';
import { canBypassMembershipCheck, logMembershipAction } from '../utils/developmentUtils';

export interface MembershipValidationResult {
  hasAccess: boolean;
  userTier: string;
  requiredTier: string;
  reason?: string;
}

/**
 * Feature to required tier mapping (simplified for FREE/PRO)
 */
const FEATURE_TIER_REQUIREMENTS: Record<string, 'FREE' | 'PRO'> = {
  // FREE features (available to all)
  'profile_view': 'FREE',
  'basic_stats': 'FREE',
  'advertisement_management': 'FREE',
  'profile_settings': 'FREE',
  'reviews_view': 'FREE',
  
  // PRO features (requires upgrade)
  'fan_posts': 'PRO',
  'fan_posts_create': 'PRO',
  'fan_posts_manage': 'PRO',
  'fan_earnings': 'PRO',
  'gifts_management': 'PRO',
  'gifts_received': 'PRO',
  'booking_management': 'PRO',
  'online_bookings': 'PRO',
  'advanced_analytics': 'PRO',
  'priority_support': 'PRO',
  'review_replies': 'PRO',
  'dk_credits': 'PRO'
};

/**
 * API endpoint to required tier mapping
 */
const ENDPOINT_TIER_REQUIREMENTS: Record<string, 'FREE' | 'PRO'> = {
  // Fan Posts endpoints (PRO only)
  'fan_posts': 'PRO',
  'fan_post_subscribers': 'PRO',
  
  // Gifts endpoints (PRO only)
  'gifts': 'PRO',
  'gift_transactions': 'PRO',
  
  // Bookings endpoints (PRO only)
  'bookings': 'PRO',
  'booking_schedules': 'PRO',
  
  // Credits endpoints (PRO only)
  'dk_credits': 'PRO',
  'credit_transactions': 'PRO',
  
  // Analytics endpoints (PRO only)
  'analytics': 'PRO',
  'fan_post_analytics': 'PRO',
  
  // FREE endpoints (available to all)
  'profiles': 'FREE',
  'reviews': 'FREE',
  'notifications': 'FREE',
  'advertisements': 'FREE'
};

/**
 * Check if user tier has access to required tier
 */
function checkTierAccess(userTier: string, requiredTier: 'FREE' | 'PRO'): boolean {
  if (requiredTier === 'FREE') return true; // Everyone has FREE access
  if (requiredTier === 'PRO') return userTier === 'PRO'; // Only PRO users have PRO access
  return false;
}

/**
 * Get user's membership tier from database
 */
async function getUserMembershipTier(userId: string): Promise<string> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('membership_tier')
      .eq('user_id', userId)
      .single();
    
    if (error || !profile) {
      logMembershipAction('Failed to get user tier', { userId, error });
      return 'FREE'; // Default to FREE on error
    }
    
    return profile.membership_tier || 'FREE';
  } catch (error) {
    logMembershipAction('Exception getting user tier', { userId, error });
    return 'FREE';
  }
}

/**
 * Main membership validation service
 */
export const membershipValidationService = {
  /**
   * Validate if user has access to a specific feature
   */
  async validateFeatureAccess(
    userId: string, 
    feature: string
  ): Promise<MembershipValidationResult> {
    try {
      const requiredTier = FEATURE_TIER_REQUIREMENTS[feature] || 'FREE';
      const userTier = await getUserMembershipTier(userId);
      const hasAccess = checkTierAccess(userTier, requiredTier);
      
      logMembershipAction('Feature access validation', {
        userId,
        feature,
        userTier,
        requiredTier,
        hasAccess
      });
      
      return {
        hasAccess,
        userTier,
        requiredTier,
        reason: hasAccess ? undefined : `${feature} requires ${requiredTier} membership`
      };
    } catch (error) {
      logMembershipAction('Feature validation error', { userId, feature, error });
      return {
        hasAccess: false,
        userTier: 'FREE',
        requiredTier: 'FREE',
        reason: 'Validation error occurred'
      };
    }
  },

  /**
   * Validate if user has access to a specific API endpoint
   */
  async validateAPIAccess(
    userId: string, 
    endpoint: string
  ): Promise<MembershipValidationResult> {
    try {
      const requiredTier = ENDPOINT_TIER_REQUIREMENTS[endpoint] || 'FREE';
      const userTier = await getUserMembershipTier(userId);
      const hasAccess = checkTierAccess(userTier, requiredTier);
      
      logMembershipAction('API access validation', {
        userId,
        endpoint,
        userTier,
        requiredTier,
        hasAccess
      });
      
      return {
        hasAccess,
        userTier,
        requiredTier,
        reason: hasAccess ? undefined : `${endpoint} API requires ${requiredTier} membership`
      };
    } catch (error) {
      logMembershipAction('API validation error', { userId, endpoint, error });
      return {
        hasAccess: false,
        userTier: 'FREE',
        requiredTier: 'FREE',
        reason: 'API validation error occurred'
      };
    }
  },

  /**
   * Validate user access with bypass check for development
   */
  async validateWithBypass(
    userId: string,
    feature: string,
    user?: any
  ): Promise<MembershipValidationResult> {
    // Check development bypass first
    if (user && canBypassMembershipCheck(user)) {
      logMembershipAction('Development bypass activated', { userId, feature });
      return {
        hasAccess: true,
        userTier: 'DEV_BYPASS',
        requiredTier: 'FREE',
        reason: 'Development bypass active'
      };
    }
    
    return this.validateFeatureAccess(userId, feature);
  },

  /**
   * Get required tier for a feature
   */
  getRequiredTierForFeature(feature: string): 'FREE' | 'PRO' {
    return FEATURE_TIER_REQUIREMENTS[feature] || 'FREE';
  },

  /**
   * Get required tier for an endpoint
   */
  getRequiredTierForEndpoint(endpoint: string): 'FREE' | 'PRO' {
    return ENDPOINT_TIER_REQUIREMENTS[endpoint] || 'FREE';
  },

  /**
   * Check if a specific tier can access a feature
   */
  canTierAccessFeature(userTier: string, feature: string): boolean {
    const requiredTier = this.getRequiredTierForFeature(feature);
    return checkTierAccess(userTier, requiredTier);
  }
};

export default membershipValidationService; 