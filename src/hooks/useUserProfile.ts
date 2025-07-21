import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  getUserRole, 
  getUserMembershipTier,
  isPremiumUser,
  getUserDisplayName
} from '../utils/authUtils';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  is_verified: boolean;
  membership_tier: string;
  is_premium: boolean;
  credits: number;
  client_number?: string;
  name?: string;
  location?: string;
  image_url?: string;
  rating?: number;
  loves?: number;
  description?: string;
  price?: string;
  is_club?: boolean;
  created_at?: string;
  updated_at?: string;
  display_name: string;
  // Verification fields
  verification_status?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  verification_submitted_at?: string;
  verification_rejection_reason?: string;
  verified_at?: string;
  verified_by_admin?: string;
}

interface UserProfileHook {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
}

/**
 * Custom hook to fetch and manage user profile data
 * Combines data from auth.users, public.users, and public.profiles
 * Automatically updates user metadata in auth.users with the latest profile data
 */
export const useUserProfile = (): UserProfileHook => {
  const { user, refreshSession } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to update user metadata in auth.users
  const updateAuthMetadata = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return null;

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          ...(user.user_metadata || {}),
          ...updates,
          updated_at: new Date().toISOString(),
        },
      });

      if (updateError) throw updateError;
      
      // Refresh the session to get the updated metadata
      await refreshSession();
      return data;
    } catch (err) {
      console.error('Error updating auth metadata:', err);
      return null;
    }
  }, [user, refreshSession]);

  // Create a default user profile based on auth data
  const createDefaultProfile = useCallback((user: User): UserProfile => {
    const role = getUserRole(user);
    const membershipTier = getUserMembershipTier(user);
    const isPremium = isPremiumUser(user);
    const displayName = getUserDisplayName(user);
    const email = user.email || '';
    const username = user.user_metadata?.username || email.split('@')[0] || 'user';

    return {
      id: user.id,
      email,
      username,
      role,
      is_verified: user.user_metadata?.is_verified || false,
      membership_tier: membershipTier,
      is_premium: isPremium,
      credits: user.user_metadata?.credits || 0,
      client_number: user.user_metadata?.client_number || `CLT-${user.id.substring(0, 8).toUpperCase()}`,
      name: user.user_metadata?.name || user.user_metadata?.username || '',
      display_name: displayName,
      created_at: user.user_metadata?.created_at || new Date().toISOString(),
      updated_at: user.user_metadata?.updated_at || new Date().toISOString(),
      is_club: role === 'club',
      // Initialize verification fields
      verification_status: 'not_submitted',
    };
  }, []);

  // Function to fetch and combine user data from multiple sources
  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Start with a default profile based on auth data
      let combinedProfile = createDefaultProfile(user);
      console.log('🔍 Default profile from auth:', combinedProfile);
      
              try {
          // Try direct query to users table first
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data from database:', userError);
          } else if (userData) {
            console.log('🔍 UserData from direct query:', userData);
            combinedProfile = {
              ...combinedProfile,
              ...userData,
              // Ensure verification_status is properly mapped
              verification_status: userData.verification_status || combinedProfile.verification_status,
              // Prioritize database verification status over cached metadata
              is_verified: userData.is_verified !== undefined ? userData.is_verified : combinedProfile.is_verified,
            };
            console.log('🔍 CombinedProfile after direct query:', combinedProfile);
          } else {
            console.log('🔍 No userData returned from direct query');
          }

        // Try to get profile data from public.profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 means no rows found, which is fine for new users
          console.warn('Profile data not found, using default profile');
        } else if (profileData) {
          combinedProfile = {
            ...combinedProfile,
            ...profileData,
          };
        }
      } catch (dbError) {
        console.error('Error fetching user data from database:', dbError);
        // Continue with the default profile if there's an error
      }

      // Update auth metadata if needed
      const shouldUpdateAuth = 
        user.user_metadata?.role !== combinedProfile.role || 
        user.user_metadata?.membership_tier !== combinedProfile.membership_tier;

      if (shouldUpdateAuth) {
        await updateAuthMetadata({
          role: combinedProfile.role,
          membership_tier: combinedProfile.membership_tier,
        });
      }

      setProfile(combinedProfile);
      return combinedProfile;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user profile');
      console.error('Error in fetchProfile:', error);
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, updateAuthMetadata, createDefaultProfile]);

  // Function to update the user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user) return null;

    try {
      setLoading(true);
      
      // Create a clean object with only valid fields for each table
      const cleanUpdates = { ...updates };
      
      // Handle special case for image_url updates
      if (updates.image_url) {
        try {
          // Try to update just the profile first
          const { error: profileImageError } = await supabase
            .from('profiles')
            .upsert({
              user_id: user.id,
              image_url: updates.image_url,
              updated_at: new Date().toISOString(),
            });
          
          if (profileImageError) {
            console.warn('Error updating profile image, will try alternative approach:', profileImageError);
          } else {
            console.log('Profile image updated successfully');
            // Update auth metadata with the new image URL
            await updateAuthMetadata({
              image_url: updates.image_url,
            });
            
            // Refresh the profile and return
            return await fetchProfile();
          }
        } catch (imageError) {
          console.error('Error in profile image update:', imageError);
          // Continue with the regular update flow
        }
      }
      
      // If we're here, either there was no image_url update or it failed
      // Proceed with normal update flow
      
      // Update public.users if there are relevant fields
      if (Object.keys(cleanUpdates).length > 0) {
        const userUpdates = {
          ...cleanUpdates,
          updated_at: new Date().toISOString(),
        };

        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', user.id);

        if (userError) {
          console.error('Error updating user record:', userError);
        }
      }

      // Update public.profiles with profile-specific fields
      const profileUpdates: any = {};
      
      // Only include fields that are relevant to profiles
      if (updates.name) profileUpdates.name = updates.name;
      if (updates.location) profileUpdates.location = updates.location;
      if (updates.image_url) profileUpdates.image_url = updates.image_url;
      if (updates.description) profileUpdates.description = updates.description;
      if (updates.price) profileUpdates.price = updates.price;
      
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            ...profileUpdates,
          });

        if (profileError) {
          console.error('Error updating profile record:', profileError);
        }
      }

      // Update auth metadata
      await updateAuthMetadata(cleanUpdates);

      // Refresh the combined profile
      return await fetchProfile();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      console.error('Error updating profile:', error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile, updateAuthMetadata]);

  // Initial fetch on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateProfile,
  };
};

export default useUserProfile;
