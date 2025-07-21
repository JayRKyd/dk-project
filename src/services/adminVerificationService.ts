import { supabase } from '../lib/supabase';

// Types for admin verification system
export interface VerificationQueueItem {
  id: string;
  username: string;
  email: string;
  role: string;
  registered_at: string;
  verification_submitted_at: string | null;
  is_verified: boolean;
  pending_documents: number;
  total_documents_uploaded: number;
  required_documents: number;
  last_login?: string;
  priority_score?: number;
  profile_image?: string;
  verification_status?: string;
}

interface BaseVerificationDocument {
  id: string;
  document_type: 'id_card' | 'selfie_with_id' | 'newspaper_photo' | 'upper_body_selfie';
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  upload_status: 'pending' | 'uploading' | 'success' | 'error';
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  admin_id?: string;
  uploaded_at: string;
  verified_at?: string;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface LadyVerificationDocument extends BaseVerificationDocument {
  lady_id: string;
  club_id?: never;
  client_id?: never;
}

interface ClubVerificationDocument extends BaseVerificationDocument {
  lady_id?: never;
  club_id: string;
  client_id?: never;
}

interface ClientVerificationDocument extends BaseVerificationDocument {
  lady_id?: never;
  club_id?: never;
  client_id: string;
}

export type VerificationDocument = LadyVerificationDocument | ClubVerificationDocument | ClientVerificationDocument;

export interface UserVerificationDetails {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    created_at: string;
    verification_submitted_at?: string;
    verified_at?: string;
    verification_status?: string;
    verification_notes?: string;
    image_url?: string;
  };
  documents: VerificationDocument[];
  adminActions: AdminAction[];
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string;
  target_document_id?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  admin_username?: string;
}

interface AdminActionWithUser extends AdminAction {
  admin_user: {
    username: string;
  } | null;
}

interface AdminActionResponse {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string;
  target_document_id?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  users: {
    username: string;
  };
}

// Priority scoring algorithm
const calculatePriority = (user: VerificationQueueItem): number => {
  let score = 0;
  
  if (!user.verification_submitted_at) return 0;
  
  // Time-based urgency (older = higher priority)
  const daysOld = (Date.now() - new Date(user.verification_submitted_at).getTime()) / (1000 * 60 * 60 * 24);
  score += daysOld * 10;
  
  // Completion bonus (all docs uploaded = higher priority)
  if (user.total_documents_uploaded === user.required_documents) {
    score += 50;
  }
  
  // User activity bonus (recent login = higher priority)
  if (user.last_login && (Date.now() - new Date(user.last_login).getTime()) < 24 * 60 * 60 * 1000) {
    score += 25;
  }
  
  // Partial completion penalty
  if (user.total_documents_uploaded < user.required_documents) {
    score -= 10;
  }
  
  return Math.round(score);
};

/**
 * Get verification queue with priority scoring
 */
export const getVerificationQueue = async (): Promise<VerificationQueueItem[]> => {
  try {
    // Get queue items with additional validation
    const { data, error } = await supabase
      .from('verification_queue')
      .select('*')
      .not('id', 'is', null)  // Ensure ID is not null
      .not('username', 'is', null)  // Ensure username is not null
      .not('email', 'is', null)  // Ensure email is not null
      .in('role', ['lady', 'club', 'client'])  // Only valid roles
      .order('verification_submitted_at', { ascending: true });

    if (error) {
      console.error('Database error fetching verification queue:', error);
      throw error;
    }

    if (!data) {
      console.warn('No verification queue data returned');
      return [];
    }

    // Validate each item has required fields
    const validatedData = data.filter(item => {
      // Check if item has valid ID (UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidId = item.id && typeof item.id === 'string' && uuidRegex.test(item.id);
      
      // Check if item has required fields
      const hasRequiredFields = item.username && item.email && item.role;
      
      if (!isValidId || !hasRequiredFields) {
        console.warn('Filtering out invalid verification queue item:', {
          id: item.id,
          username: item.username,
          email: item.email,
          role: item.role,
          isValidId,
          hasRequiredFields
        });
        return false;
      }
      
      return true;
    });

    return validatedData;
  } catch (error) {
    console.error('Error fetching verification queue:', error);
    throw error;
  }
};

/**
 * Get detailed verification information for a specific user
 */
export const getVerificationDetails = async (userId: string): Promise<UserVerificationDetails> => {
  // Enhanced validation for user ID
  if (!userId || userId === 'undefined' || userId === 'null' || !/^[0-9a-fA-F-]+$/.test(userId)) {
    console.error('Invalid user ID format:', userId);
    throw new Error('Invalid user ID provided');
  }

  try {
    // Get user information
    const { data: userData, error: userError } = await supabase
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
      console.error('Error fetching user data:', userError);
      throw new Error('Failed to fetch user data');
    }
    if (!userData) {
      console.error('User not found:', userId);
      throw new Error('User not found');
    }

    // Get verification documents based on user role
    let documentsData;
    let documentsError;

    switch (userData.role) {
      case 'lady':
        ({ data: documentsData, error: documentsError } = await supabase
          .from('lady_verification_documents')
          .select('id, lady_id, document_type, file_url, file_name, file_size, mime_type, upload_status, verification_status, rejection_reason, admin_notes, uploaded_at, verified_at')
          .eq('lady_id', userId)
          .order('uploaded_at', { ascending: true }));
        break;
      case 'club':
        ({ data: documentsData, error: documentsError } = await supabase
          .from('club_verification_documents')
          .select(`
            id,
            club_id,
            document_type,
            file_url,
            file_name,
            file_size,
            mime_type,
            upload_status,
            verification_status,
            rejection_reason,
            admin_id,
            admin_notes,
            uploaded_at,
            verified_at,
            created_at,
            updated_at
          `)
          .eq('club_id', userId)
          .order('uploaded_at', { ascending: true }));
        break;
      case 'client':
        ({ data: documentsData, error: documentsError } = await supabase
          .from('client_verification_documents')
          .select(`
            id,
            client_id,
            document_type,
            file_url,
            file_name,
            file_size,
            mime_type,
            upload_status,
            verification_status,
            rejection_reason,
            admin_id,
            admin_notes,
            uploaded_at,
            verified_at,
            created_at,
            updated_at
          `)
          .eq('client_id', userId)
          .order('uploaded_at', { ascending: true }));
        break;
      default:
        throw new Error(`Unsupported user role: ${userData.role}`);
    }

    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      throw documentsError;
    }

    // Get signed URLs for each document with a longer expiry (4 hours)
    const documents = await Promise.all((documentsData || []).map(async (doc) => {
      if (!doc.file_url) {
        console.error('Document missing file URL:', doc.id);
        return doc;
      }

      try {
        // Just return the document with its public URL
        return doc;
      } catch (error) {
        console.error('Error processing document URL:', error);
        return doc;
      }
    }));

    // Get admin actions
    const { data: actionsData, error: actionsError } = await supabase
      .from('admin_actions')
      .select(`
        id,
        admin_id,
        action_type,
        target_user_id,
        target_document_id,
        reason,
        notes,
        created_at,
        admin_user:users!admin_id (
          username
        )
      `)
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false });

    if (actionsError) {
      console.error('Error fetching admin actions:', actionsError);
      throw actionsError;
    }

    return {
      user: userData,
      documents: documents || [],
      adminActions: actionsData || []
    };
  } catch (error) {
    console.error('Error in getVerificationDetails:', error);
    throw error;
  }
};

/**
 * Approve a single document
 */
export const approveDocument = async (
  documentId: string, 
  adminId: string, 
  notes?: string
): Promise<void> => {
  try {
    // Update document status
    const { error: updateError } = await supabase
      .from('lady_verification_documents')
      .update({
        verification_status: 'approved',
        admin_id: adminId,
        verified_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // Get document info for logging
    const { data: docData } = await supabase
      .from('lady_verification_documents')
      .select('lady_id, document_type')
      .eq('id', documentId)
      .single();

    if (docData) {
      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'approve_document',
          target_user_id: docData.lady_id,
          target_document_id: documentId,
          notes: `Approved ${docData.document_type} document${notes ? `: ${notes}` : ''}`
        });

      // Check if all documents are approved for this user
      await checkAndUpdateUserVerificationStatus(docData.lady_id, adminId);
    }
  } catch (error) {
    console.error('Error approving document:', error);
    throw error;
  }
};

/**
 * Reject a single document
 */
export const rejectDocument = async (
  documentId: string, 
  adminId: string, 
  reason: string, 
  notes?: string
): Promise<void> => {
  try {
    // Update document status
    const { error: updateError } = await supabase
      .from('lady_verification_documents')
      .update({
        verification_status: 'rejected',
        admin_id: adminId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason,
        admin_notes: notes
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    // Get document info for logging
    const { data: docData } = await supabase
      .from('lady_verification_documents')
      .select('lady_id, document_type')
      .eq('id', documentId)
      .single();

    if (docData) {
      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'reject_document',
          target_user_id: docData.lady_id,
          target_document_id: documentId,
          reason,
          notes: `Rejected ${docData.document_type} document: ${reason}${notes ? `. ${notes}` : ''}`
        });

      // Update user verification status to rejected
      await supabase
        .from('users')
        .update({
          verification_status: 'rejected',
          verification_notes: `Document rejected: ${reason}`
        })
        .eq('id', docData.lady_id);
    }
  } catch (error) {
    console.error('Error rejecting document:', error);
    throw error;
  }
};

/**
 * Approve entire user verification (all documents)
 */
export const approveUser = async (
  userId: string, 
  adminId: string, 
  notes?: string
): Promise<void> => {
  try {
    // Approve all pending documents
    const { error: docsError } = await supabase
      .from('lady_verification_documents')
      .update({
        verification_status: 'approved',
        admin_id: adminId,
        verified_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('lady_id', userId)
      .eq('verification_status', 'pending');

    if (docsError) throw docsError;

    // Update user verification status
    const { error: userError } = await supabase
      .from('users')
      .update({
        verification_status: 'verified',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by_admin: adminId,
        verification_notes: `Verification approved${notes ? `: ${notes}` : ''}`
      })
      .eq('id', userId);

    if (userError) throw userError;

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: 'approve_user',
        target_user_id: userId,
        notes: `Approved complete verification${notes ? `: ${notes}` : ''}`
      });
  } catch (error) {
    console.error('Error approving user:', error);
    throw error;
  }
};

/**
 * Reject entire user verification
 */
export const rejectUser = async (
  userId: string, 
  adminId: string, 
  reason: string, 
  notes?: string
): Promise<void> => {
  try {
    // Reject all pending documents
    const { error: docsError } = await supabase
      .from('lady_verification_documents')
      .update({
        verification_status: 'rejected',
        admin_id: adminId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason,
        admin_notes: notes
      })
      .eq('lady_id', userId)
      .eq('verification_status', 'pending');

    if (docsError) throw docsError;

    // Update user verification status
    const { error: userError } = await supabase
      .from('users')
      .update({
        verification_status: 'rejected',
        verified_by_admin: adminId,
        verification_notes: `Verification rejected: ${reason}${notes ? `. ${notes}` : ''}`
      })
      .eq('id', userId);

    if (userError) throw userError;

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        action_type: 'reject_user',
        target_user_id: userId,
        reason,
        notes: `Rejected complete verification: ${reason}${notes ? `. ${notes}` : ''}`
      });
  } catch (error) {
    console.error('Error rejecting user:', error);
    throw error;
  }
};

/**
 * Get admin actions audit trail
 */
export const getAdminActions = async (adminId?: string, limit: number = 50): Promise<AdminAction[]> => {
  try {
    let query = supabase
      .from('admin_actions')
      .select(`
        *,
        admin:admin_id (username),
        target_user:target_user_id (username)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (adminId) {
      query = query.eq('admin_id', adminId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format the data
    return (data || []).map(action => ({
      ...action,
      admin_username: action.admin?.username || 'Unknown Admin',
      target_username: action.target_user?.username || 'Unknown User'
    }));
  } catch (error) {
    console.error('Error fetching admin actions:', error);
    throw error;
  }
};

/**
 * Check if all documents are approved and update user verification status
 */
const checkAndUpdateUserVerificationStatus = async (userId: string, adminId: string): Promise<void> => {
  try {
    // Get all documents for this user
    const { data: documents, error } = await supabase
      .from('lady_verification_documents')
      .select('verification_status')
      .eq('lady_id', userId);

    if (error) throw error;

    const totalDocs = documents?.length || 0;
    const approvedDocs = documents?.filter(doc => doc.verification_status === 'approved').length || 0;
    const rejectedDocs = documents?.filter(doc => doc.verification_status === 'rejected').length || 0;

    // If all 4 documents are approved, mark user as verified
    if (totalDocs === 4 && approvedDocs === 4) {
      await supabase
        .from('users')
        .update({
          verification_status: 'verified',
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by_admin: adminId,
          can_post_premium: true
        })
        .eq('id', userId);

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: adminId,
          action_type: 'complete_verification',
          target_user_id: userId,
          notes: 'All documents approved - user verified'
        });
    }
    // If any document is rejected, mark as rejected
    else if (rejectedDocs > 0) {
      await supabase
        .from('users')
        .update({
          verification_status: 'rejected',
          is_verified: false
        })
        .eq('id', userId);
    }
    // Otherwise, keep as pending
    else {
      await supabase
        .from('users')
        .update({
          verification_status: 'pending',
          is_verified: false
        })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('Error checking user verification status:', error);
    throw error;
  }
};

/**
 * Get verification statistics for admin dashboard
 */
export const getVerificationStats = async (): Promise<{
  ladies: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    unsubmitted: number;
  };
  clubs: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    unsubmitted: number;
  };
}> => {
  try {
    // Get all users with their verification status
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, role, is_verified, verification_status, verification_submitted_at')
      .in('role', ['lady', 'club']);

    if (usersError) {
      console.error('Error fetching users for stats:', usersError);
      throw usersError;
    }

    if (!users) {
      return {
        ladies: { total: 0, verified: 0, pending: 0, rejected: 0, unsubmitted: 0 },
        clubs: { total: 0, verified: 0, pending: 0, rejected: 0, unsubmitted: 0 }
      };
    }

    // Initialize stats
    const stats = {
      ladies: { total: 0, verified: 0, pending: 0, rejected: 0, unsubmitted: 0 },
      clubs: { total: 0, verified: 0, pending: 0, rejected: 0, unsubmitted: 0 }
    };

    // Process each user
    users.forEach(user => {
      if (user.role === 'lady') {
        stats.ladies.total++;
        if (user.is_verified) {
          stats.ladies.verified++;
        } else if (user.verification_status === 'rejected') {
          stats.ladies.rejected++;
        } else if (user.verification_submitted_at) {
          stats.ladies.pending++;
        } else {
          stats.ladies.unsubmitted++;
        }
      } else if (user.role === 'club') {
        stats.clubs.total++;
        if (user.is_verified) {
          stats.clubs.verified++;
        } else if (user.verification_status === 'rejected') {
          stats.clubs.rejected++;
        } else if (user.verification_submitted_at) {
          stats.clubs.pending++;
        } else {
          stats.clubs.unsubmitted++;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    return {
      ladies: { total: 0, verified: 0, pending: 0, rejected: 0, unsubmitted: 0 },
      clubs: { total: 0, verified: 0, pending: 0, rejected: 0, unsubmitted: 0 }
    };
  }
};

/**
 * Get club verification details for admin review
 */
export const getClubVerificationDetails = async (
  clubId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Get club user info and business details
    const { data: clubData, error: clubError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        username,
        role,
        verification_status,
        verification_submitted_at,
        verified_at,
        verification_notes,
        business_name,
        business_type,
        business_phone,
        business_website,
        created_at
      `)
      .eq('id', clubId)
      .eq('role', 'club')
      .single();

    if (clubError || !clubData) {
      return { success: false, error: 'Club not found' };
    }

    // Get club verification documents
    const { data: documents, error: docsError } = await supabase
      .from('club_verification_documents')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (docsError) {
      return { success: false, error: 'Failed to fetch documents' };
    }

    // Get admin actions history for this club
    const { data: adminActions, error: actionsError } = await supabase
      .from('admin_actions')
      .select(`
        *,
        admin:admin_id (
          email,
          username
        )
      `)
      .eq('target_user_id', clubId)
      .order('created_at', { ascending: false })
      .limit(10);

    const clubDetails = {
      club: clubData,
      documents: documents || [],
      admin_actions: adminActions || [],
      completion_percentage: documents ? Math.round((documents.filter(doc => doc.upload_status === 'success').length / 3) * 100) : 0,
      required_documents: ['business_license', 'registration_certificate', 'tax_document'],
      missing_documents: documents ? 
        ['business_license', 'registration_certificate', 'tax_document'].filter(
          docType => !documents.some(doc => doc.document_type === docType && doc.upload_status === 'success')
        ) : ['business_license', 'registration_certificate', 'tax_document']
    };

    return { success: true, data: clubDetails };
  } catch (error) {
    console.error('Get club verification details error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Approve a club verification document
 */
export const approveClubDocument = async (
  documentId: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update document status
    const { data: document, error: updateError } = await supabase
      .from('club_verification_documents')
      .update({
        verification_status: 'approved',
        admin_notes: adminNotes,
        verified_at: new Date().toISOString(),
        verified_by_admin: user.id
      })
      .eq('id', documentId)
      .select('club_id')
      .single();

    if (updateError || !document) {
      return { success: false, error: 'Failed to approve document' };
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'approve_club_document',
        target_user_id: document.club_id,
        details: { document_id: documentId, admin_notes: adminNotes }
      });

    return { success: true };
  } catch (error) {
    console.error('Approve club document error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Reject a club verification document
 */
export const rejectClubDocument = async (
  documentId: string,
  rejectionReason: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update document status
    const { data: document, error: updateError } = await supabase
      .from('club_verification_documents')
      .update({
        verification_status: 'rejected',
        rejection_reason: rejectionReason,
        admin_notes: adminNotes,
        verified_at: new Date().toISOString(),
        verified_by_admin: user.id
      })
      .eq('id', documentId)
      .select('club_id')
      .single();

    if (updateError || !document) {
      return { success: false, error: 'Failed to reject document' };
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'reject_club_document',
        target_user_id: document.club_id,
        details: { document_id: documentId, rejection_reason: rejectionReason, admin_notes: adminNotes }
      });

    return { success: true };
  } catch (error) {
    console.error('Reject club document error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Approve entire club verification
 */
export const approveClubUser = async (
  clubId: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update club verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_status: 'verified',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by_admin: user.id,
        verification_notes: adminNotes
      })
      .eq('id', clubId)
      .eq('role', 'club');

    if (updateError) {
      return { success: false, error: 'Failed to approve club' };
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'approve_club_verification',
        target_user_id: clubId,
        details: { admin_notes: adminNotes }
      });

    return { success: true };
  } catch (error) {
    console.error('Approve club user error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Reject entire club verification
 */
export const rejectClubUser = async (
  clubId: string,
  rejectionReason: string,
  adminNotes?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Update club verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_status: 'rejected',
        is_verified: false,
        verified_at: new Date().toISOString(),
        verified_by_admin: user.id,
        verification_notes: `${rejectionReason}${adminNotes ? ` - ${adminNotes}` : ''}`
      })
      .eq('id', clubId)
      .eq('role', 'club');

    if (updateError) {
      return { success: false, error: 'Failed to reject club' };
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'reject_club_verification',
        target_user_id: clubId,
        details: { rejection_reason: rejectionReason, admin_notes: adminNotes }
      });

    return { success: true };
  } catch (error) {
    console.error('Reject club user error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}; 

/**
 * Get verification statistics for Quick Stats (simple structure)
 */
export const getQuickStats = async (): Promise<{
  pending: number;
  verified: number;
  rejected: number;
}> => {
  try {
    // Get counts from the verification_queue view
    const { data, error } = await supabase
      .from('verification_queue')
      .select('verification_status, is_verified');

    if (error) {
      console.error('Error fetching verification stats:', error);
      throw error;
    }

    if (!data) {
      return { pending: 0, verified: 0, rejected: 0 };
    }

    // Count by status
    const stats = {
      pending: 0,
      verified: 0,
      rejected: 0
    };

    data.forEach(item => {
      if (item.is_verified) {
        stats.verified++;
      } else if (item.verification_status === 'rejected') {
        stats.rejected++;
      } else {
        stats.pending++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    return { pending: 0, verified: 0, rejected: 0 };
  }
}; 