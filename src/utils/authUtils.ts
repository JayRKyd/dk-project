import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Checks if the user has the required role
 * @param user The user object from useAuth()
 * @param requiredRole The required role ('admin', 'lady', 'club', 'client')
 * @returns boolean indicating if the user has the required role
 */
export const hasRole = (user: User | null, requiredRole: string): boolean => {
  if (!user) return false;
  
  // 🚨 EMERGENCY BYPASS: Handle emergency admin user
  if (user.id === 'emergency-admin-bypass' && requiredRole === 'admin') {
    return true;
  }
  
  // Check in user_metadata first (from auth)
  if (user.user_metadata?.role === requiredRole) return true;
  
  // Check in app_metadata (for roles set server-side)
  if (user.app_metadata?.role === requiredRole) return true;
  
  // Check in raw_user_meta_data for direct role assignment
  if (user.user_metadata?.raw_user_meta_data?.role === requiredRole) return true;
  
  return false;
};

/**
 * Gets the user's membership tier
 * @param user The user object from useAuth()
 * @returns The user's membership tier (default: 'FREE')
 */
export const getUserMembershipTier = (user: User | null): string => {
  if (!user) return 'FREE';
  
  // Check in user_metadata first
  if (user.user_metadata?.membership_tier) {
    return user.user_metadata.membership_tier.toUpperCase();
  }
  
  // Check in app_metadata
  if (user.app_metadata?.membership_tier) {
    return user.app_metadata.membership_tier.toUpperCase();
  }
  
  return 'FREE';
};

/**
 * Checks if the user has a premium membership
 * @param user The user object from useAuth()
 * @returns boolean indicating if the user has a premium membership
 */
export const isPremiumUser = (user: User | null): boolean => {
  const tier = getUserMembershipTier(user);
  return ['PRO', 'PREMIUM', 'VIP', 'ENTERPRISE'].includes(tier);
};

/**
 * Gets the user's display name (synchronous version)
 * @param user The user object from useAuth()
 * @returns The user's display name, username, or email as fallback
 */
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return 'Guest';
  
  // Try to get name from user_metadata (cached from database)
  if (user.user_metadata?.name) return user.user_metadata.name;
  if (user.user_metadata?.username) return user.user_metadata.username;
  if (user.user_metadata?.full_name) return user.user_metadata.full_name;
  if (user.user_metadata?.display_name) return user.user_metadata.display_name;
  
  // Fall back to username from database (stored in users table)
  if (user.user_metadata?.db_username) return user.user_metadata.db_username;
  
  // Extract username from email as last resort
  const emailUsername = user.email?.split('@')[0];
  if (emailUsername && emailUsername !== user.email) {
    return emailUsername;
  }
  
  // Final fallback to email
  return user.email || 'User';
};

/**
 * Gets the user's display name with database lookup (async version)
 * This version fetches fresh data from the database if needed
 * @param user The user object from useAuth()
 * @returns Promise resolving to the user's display name
 */
export const getUserDisplayNameAsync = async (user: User | null): Promise<string> => {
  if (!user) return 'Guest';
  
  // First try the synchronous version
  const syncName = getUserDisplayName(user);
  if (syncName !== user.email && syncName !== 'User') {
    return syncName; // We found a good name, return it
  }
  
  try {
    // If we only have email/fallback, try to fetch from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single();
    
    if (!userError && userData?.username) {
      // Update auth metadata with the database username for future use
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          db_username: userData.username,
        }
      });
      return userData.username;
    }

    // Try to get name from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();
    
    if (!profileError && profileData?.name) {
      // Update auth metadata with the profile name for future use
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          name: profileData.name,
        }
      });
      return profileData.name;
    }
  } catch (error) {
    console.warn('Error fetching user display name from database:', error);
  }
  
  // Return the synchronous fallback if database lookup fails
  return syncName;
};

/**
 * Gets the user's role
 * @param user The user object from useAuth()
 * @returns The user's role (default: 'client')
 */
export const getUserRole = (user: User | null): string => {
  if (!user) return 'client';
  
  // 🚨 EMERGENCY BYPASS: Handle emergency admin user
  if (user.id === 'emergency-admin-bypass') {
    return 'admin';
  }
  
  // Check in user_metadata first
  if (user.user_metadata?.role) {
    return user.user_metadata.role.toLowerCase();
  }
  
  // Check in app_metadata
  if (user.app_metadata?.role) {
    return user.app_metadata.role.toLowerCase();
  }
  
  // Default to client
  return 'client';
};

/**
 * Checks if the current user can access a route based on their role
 * @param user The user object from useAuth()
 * @param allowedRoles Array of allowed roles for the route
 * @returns boolean indicating if access is allowed
 */
export const canAccessRoute = (user: User | null, allowedRoles: string[]): boolean => {
  if (!user) return false;
  
  const userRole = getUserRole(user);
  
  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(userRole)) {
    return true;
  }
  
  // Admins have access to everything
  if (userRole === 'admin') {
    return true;
  }
  
  return false;
};
