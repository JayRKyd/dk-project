import { supabase } from '../lib/supabase';
import { UserRole } from './userVerificationService';

export type DocumentType = 'id_card' | 'selfie_with_id' | 'newspaper_photo' | 'upper_body_selfie' | 'license' | 'proof_of_address' | 'owner_id';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: DocumentType;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  upload_status: 'pending' | 'success' | 'error';
  verification_status: DocumentStatus;
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get the table name based on user role
 */
const getTableName = (role: UserRole): string => {
  return `${role}_verification_documents`;
};

/**
 * Get the ID column name based on user role
 */
const getIdColumnName = (role: UserRole): string => {
  return `${role}_id`;
};

/**
 * Get all verification documents for a user
 */
export const getDocuments = async (userId: string, userRole: UserRole): Promise<VerificationDocument[]> => {
  try {
    // Validate user ID
    if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      throw new Error('Invalid user ID format');
    }

    const tableName = getTableName(userRole);

    const { data: documents, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('user_id', userId)  // Changed from dynamic column name to always use user_id
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    // Transform the response to match our interface
    return (documents || []).map(doc => ({
      id: doc.id,
      user_id: doc.user_id, // Changed to use consistent user_id field
      document_type: doc.document_type,
      file_url: doc.file_url,
      file_name: doc.file_name,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      upload_status: doc.upload_status,
      verification_status: doc.verification_status,
      verification_notes: doc.verification_notes,
      verified_by: doc.verified_by,
      verified_at: doc.verified_at,
      created_at: doc.created_at,
      updated_at: doc.updated_at
    }));
  } catch (error) {
    console.error('Error in getDocuments:', error);
    throw error;
  }
};

/**
 * Get a single verification document
 */
export const getDocument = async (documentId: string, userRole: UserRole): Promise<VerificationDocument | null> => {
  try {
    // Validate document ID
    if (!documentId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
      throw new Error('Invalid document ID format');
    }

    const tableName = getTableName(userRole);

    const { data: document, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw error;
    }

    if (!document) {
      return null;
    }

    // Transform the response to match our interface
    return {
      ...document,
      user_id: document[getIdColumnName(userRole)],
      file_url: document.file_url // The URL should be a full path from storage
    } as VerificationDocument;
  } catch (error) {
    console.error('Error in getDocument:', error);
    throw error;
  }
};

/**
 * Approve a verification document
 */
export const approveDocument = async (
  documentId: string,
  userRole: UserRole,
  adminId: string,
  notes?: string
): Promise<void> => {
  try {
    const tableName = getTableName(userRole);

    const { error } = await supabase
      .from(tableName)
      .update({
        verification_status: 'approved',
        admin_id: adminId,
        admin_notes: notes,
        verified_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      console.error('Error approving document:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in approveDocument:', error);
    throw error;
  }
};

/**
 * Reject a verification document
 */
export const rejectDocument = async (
  documentId: string,
  userRole: UserRole,
  adminId: string,
  reason: string,
  notes?: string
): Promise<void> => {
  try {
    const tableName = getTableName(userRole);

    const { error } = await supabase
      .from(tableName)
      .update({
        verification_status: 'rejected',
        admin_id: adminId,
        rejection_reason: reason,
        admin_notes: notes,
        verified_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (error) {
      console.error('Error rejecting document:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in rejectDocument:', error);
    throw error;
  }
}; 