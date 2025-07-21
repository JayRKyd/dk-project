import { supabase } from '../lib/supabase';

export type UserRole = 'lady' | 'club' | 'client';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  verification_submitted_at?: string;
  verified_at?: string;
  verification_status?: string;
  verification_notes?: string;
  image_url?: string;
}

export interface VerificationStatus {
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at?: string;
  verified_at?: string;
  notes?: string;
  required_documents: number;
  submitted_documents: number;
}

/**
 * Get a user's verification status
 */
export const getUserVerificationStatus = async (userId: string): Promise<VerificationStatus | null> => {
  try {
    // Validate user ID
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        is_verified,
        verification_status,
        verification_submitted_at,
        verified_at,
        verification_notes,
        role
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user verification status:', userError);
      throw userError;
    }

    if (!userData) {
      return null;
    }

    // Get required documents count based on role
    const requiredDocs: Record<UserRole, number> = {
      lady: 4, // ID, selfie with ID, newspaper, upper body
      club: 3, // License, proof of address, owner ID
      client: 2 // ID, selfie with ID
    };

    // Get submitted documents count
    const { count: submittedCount, error: countError } = await supabase
      .from(`${userData.role}_verification_documents`)
      .select('id', { count: 'exact' })
      .eq(`${userData.role}_id`, userId);

    if (countError) {
      console.error('Error counting submitted documents:', countError);
      throw countError;
    }

    return {
      is_verified: userData.is_verified || false,
      status: userData.verification_status || 'pending',
      submitted_at: userData.verification_submitted_at,
      verified_at: userData.verified_at,
      notes: userData.verification_notes,
      required_documents: requiredDocs[userData.role as UserRole] || 0,
      submitted_documents: submittedCount || 0
    };
  } catch (error) {
    console.error('Error in getUserVerificationStatus:', error);
    throw error;
  }
};

/**
 * Get a user's profile information
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Validate user ID
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    // Get user from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        username,
        email,
        role,
        created_at,
        verification_submitted_at,
        verified_at,
        verification_status,
        verification_notes,
        image_url
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching profile:', userError);
      throw userError;
    }

    if (!user) {
      console.error('User not found');
      return null;
    }

    // Ensure the role is valid
    if (!['lady', 'club', 'client'].includes(user.role)) {
      console.error('Invalid role:', user.role);
      return null;
    }

    return {
      id: user.id,
      username: user.username || '',
      email: user.email || '',
      role: user.role as UserRole,
      created_at: user.created_at,
      verification_submitted_at: user.verification_submitted_at,
      verified_at: user.verified_at,
      verification_status: user.verification_status,
      verification_notes: user.verification_notes,
      image_url: user.image_url
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}; 