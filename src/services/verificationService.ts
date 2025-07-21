import { supabase } from '../lib/supabase';

export type DocumentType = 'id_card' | 'selfie_with_id' | 'newspaper_photo' | 'upper_body_selfie';

// Base document interface with common fields
interface BaseVerificationDocument {
  id: string;
  document_type: DocumentType;
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
  created_at: string;
  updated_at: string;
}

// Role-specific document interfaces
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

// Union type for all verification document types
export type VerificationDocument = LadyVerificationDocument | ClubVerificationDocument | ClientVerificationDocument;

export interface UploadResult {
  success: boolean;
  document?: VerificationDocument;
  error?: string;
  fileUrl?: string;
}

export interface FileValidation {
  maxSize: number;
  allowedTypes: string[];
  minDimensions: { width: number; height: number };
  maxDimensions: { width: number; height: number };
}

export interface VerificationQueueItem {
  id: string;
  username: string;
  email: string;
  role: string;
  registered_at: string;
  verification_submitted_at?: string;
  is_verified: boolean;
  verified_at?: string;
  verification_notes?: string;
  can_post_premium: boolean;
  total_documents_uploaded: number;
  pending_documents: number;
  approved_documents: number;
  rejected_documents: number;
  required_documents: number;
  completion_percentage: number;
  priority_score: number;
}

// File validation constants
export const FILE_VALIDATION: FileValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minDimensions: { width: 800, height: 600 },
  maxDimensions: { width: 4000, height: 4000 }
};

// Document type configurations
export const DOCUMENT_CONFIGS = {
  id_card: {
    title: 'A photo of your ID card / Passport or Drivers License',
    description: 'Upload a clear photo showing your ID card, passport, or driver\'s license',
    instructions: 'Make sure all text is clearly visible and the document is not expired.',
    icon: '📄'
  },
  selfie_with_id: {
    title: 'A photo of you holding your ID card',
    description: 'Take a photo of yourself holding your ID card next to your face',
    instructions: 'Your face must clearly match the ID photo. Both your face and ID must be visible in the same frame.',
    icon: '🤳'
  },
  newspaper_photo: {
    title: 'A photo of you holding a newspaper of the country where you advertise',
    description: 'Hold a recent newspaper from your country showing the date clearly',
    instructions: 'Make sure we can read the date of the newspaper clearly. This proves your location and the photo is recent.',
    icon: '📰'
  },
  upper_body_selfie: {
    title: 'A clear photo/selfie of you and upper body',
    description: 'Take a clear selfie showing your face and upper body',
    instructions: 'Take a clear, well-lit photo showing your upper body. This will be used for profile verification.',
    icon: '📸'
  }
};

class VerificationService {
  private readonly STORAGE_BUCKET = 'verification-documents';

  /**
   * Validate file before upload
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > FILE_VALIDATION.maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${FILE_VALIDATION.maxSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type must be one of: ${FILE_VALIDATION.allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Validate image dimensions
   */
  private validateImageDimensions(file: File): Promise<{ isValid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const { width, height } = img;
        const { minDimensions, maxDimensions } = FILE_VALIDATION;

        if (width < minDimensions.width || height < minDimensions.height) {
          resolve({
            isValid: false,
            error: `Image must be at least ${minDimensions.width}x${minDimensions.height} pixels`
          });
          return;
        }

        if (width > maxDimensions.width || height > maxDimensions.height) {
          resolve({
            isValid: false,
            error: `Image must be no larger than ${maxDimensions.width}x${maxDimensions.height} pixels`
          });
          return;
        }

        resolve({ isValid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          isValid: false,
          error: 'Invalid image file'
        });
      };

      img.src = url;
    });
  }

  /**
   * Upload document to storage and database
   */
  async uploadDocument(
    file: File, 
    documentType: DocumentType,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get user role from database to ensure we have the latest
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (roleError || !userData) {
        return { success: false, error: 'Failed to verify user role' };
      }

      // Determine the correct verification table based on user role
      let verificationTable;
      let userIdField;
      switch (userData.role) {
        case 'lady':
          verificationTable = 'lady_verification_documents';
          userIdField = 'lady_id';
          break;
        case 'club':
          verificationTable = 'club_verification_documents';
          userIdField = 'club_id';
          break;
        case 'client':
          verificationTable = 'client_verification_documents';
          userIdField = 'client_id';
          break;
        default:
          return { success: false, error: 'Invalid user role for verification' };
      }

      // Validate file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return { success: false, error: fileValidation.error };
      }

      // Validate image dimensions
      const dimensionValidation = await this.validateImageDimensions(file);
      if (!dimensionValidation.isValid) {
        return { success: false, error: dimensionValidation.error };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${documentType}_${timestamp}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Failed to upload file' };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      // Check if document already exists for this type
      const { data: existingDoc } = await supabase
        .from(verificationTable)
        .select('id')
        .eq(userIdField, user.id)
        .eq('document_type', documentType)
        .single();

      let documentData;

      if (existingDoc) {
        // Update existing document
        const { data, error: updateError } = await supabase
          .from(verificationTable)
          .update({
            file_url: publicUrl,
            file_name: fileName,
            file_size: file.size,
            mime_type: file.type,
            upload_status: 'success',
            verification_status: 'pending',
            uploaded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingDoc.id)
          .select()
          .single();

        if (updateError) {
          console.error('Database update error:', updateError);
          return { success: false, error: 'Failed to update document record' };
        }

        documentData = data;
      } else {
        // Insert new document
        const { data, error: insertError } = await supabase
          .from(verificationTable)
          .insert({
            [userIdField]: user.id,
            document_type: documentType,
            file_url: publicUrl,
            file_name: fileName,
            file_size: file.size,
            mime_type: file.type,
            upload_status: 'success',
            verification_status: 'pending',
            uploaded_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Database insert error:', insertError);
          return { success: false, error: 'Failed to create document record' };
        }

        documentData = data;
      }

      return {
        success: true,
        document: documentData,
        fileUrl: publicUrl
      };

    } catch (error) {
      console.error('Verification upload error:', error);
      return { success: false, error: 'Failed to process document upload' };
    }
  }

  /**
   * Get verification documents for a user
   */
  async getVerificationDocuments(userId?: string): Promise<VerificationDocument[]> {
    try {
      // Get current user if no userId provided
      let targetUserId = userId;
      if (!targetUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated');
        }
        targetUserId = user.id;
      }

      // Get user role
      const { data: userData, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', targetUserId)
        .single();
      
      if (roleError || !userData) {
        throw new Error('Failed to verify user role');
      }

      // Determine the correct verification table based on user role
      let verificationTable;
      let userIdField;
      switch (userData.role) {
        case 'lady':
          verificationTable = 'lady_verification_documents';
          userIdField = 'lady_id';
          break;
        case 'club':
          verificationTable = 'club_verification_documents';
          userIdField = 'club_id';
          break;
        case 'client':
          verificationTable = 'client_verification_documents';
          userIdField = 'client_id';
          break;
        default:
          throw new Error('Invalid user role for verification');
      }

      // Get documents from the appropriate table
      const { data, error } = await supabase
        .from(verificationTable)
        .select('*')
        .eq(userIdField, targetUserId)
        .order('uploaded_at', { ascending: true });

      if (error) {
        console.error('Error fetching verification documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getVerificationDocuments:', error);
      throw error;
    }
  }

  /**
   * Submit verification for admin review
   */
  async submitVerification(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if all 4 documents are uploaded
      const documents = await this.getVerificationDocuments();
      const requiredTypes: DocumentType[] = ['id_card', 'selfie_with_id', 'newspaper_photo', 'upper_body_selfie'];
      
      const uploadedTypes = documents.map(doc => doc.document_type);
      const missingTypes = requiredTypes.filter(type => !uploadedTypes.includes(type));

      if (missingTypes.length > 0) {
        return { 
          success: false, 
          error: `Missing documents: ${missingTypes.map(type => DOCUMENT_CONFIGS[type].title).join(', ')}` 
        };
      }

      // Update user verification submitted timestamp
      const { error: updateError } = await supabase
        .from('users')
        .update({
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Submit verification error:', updateError);
        return { success: false, error: 'Failed to submit verification' };
      }

      return { success: true };
    } catch (error) {
      console.error('Submit verification error:', error);
      return { success: false, error: 'Unexpected error during submission' };
    }
  }

  /**
   * Get verification queue for admin dashboard
   */
  async getVerificationQueue(): Promise<VerificationQueueItem[]> {
    try {
      const { data, error } = await supabase
        .from('verification_queue')
        .select('*')
        .order('priority_score', { ascending: false });

      if (error) {
        console.error('Get verification queue error:', error);
        throw new Error('Failed to fetch verification queue');
      }

      return data || [];
    } catch (error) {
      console.error('Get verification queue error:', error);
      return [];
    }
  }

  /**
   * Update document verification status
   */
  async updateDocumentStatus(
    documentId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First get the document to determine which table it belongs to
      const tables = [
        { name: 'lady_verification_documents', idField: 'lady_id' },
        { name: 'club_verification_documents', idField: 'club_id' },
        { name: 'client_verification_documents', idField: 'client_id' }
      ];

      let document;
      let verificationTable;
      let userIdField;

      // Try to find the document in each table
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .eq('id', documentId)
          .single();

        if (!error && data) {
          document = data;
          verificationTable = table.name;
          userIdField = table.idField;
          break;
        }
      }

      if (!document || !verificationTable || !userIdField) {
        return { success: false, error: 'Document not found' };
      }

      // Update the document status
      const { error: updateError } = await supabase
        .from(verificationTable)
        .update({
          verification_status: status,
          rejection_reason: rejectionReason,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Error updating document status:', updateError);
        return { success: false, error: 'Failed to update document status' };
      }

      // Get the user ID from the document
      const userId = document[userIdField];

      // Check if all documents are approved to update user verification status
      const { data: documents } = await supabase
        .from(verificationTable)
        .select('verification_status')
        .eq(userIdField, userId);

      const allApproved = documents?.every(doc => doc.verification_status === 'approved');
      
      if (allApproved) {
        // Update user verification status
        const { error: userError } = await supabase
          .from('users')
          .update({
            is_verified: true,
            verification_status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (userError) {
          console.error('Error updating user verification status:', userError);
          return { success: false, error: 'Failed to update user verification status' };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateDocumentStatus:', error);
      return { success: false, error: 'Failed to process status update' };
    }
  }

  /**
   * Admin: Approve user completely (all documents approved)
   */
  async approveUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'Admin not authenticated' };
      }

      // Update user verification status
      const { error: updateError } = await supabase
        .from('users')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          can_post_premium: true,
          verified_by_admin: user.id
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Approve user error:', updateError);
        return { success: false, error: 'Failed to approve user' };
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'approve_user',
          target_user_id: userId,
          metadata: { user_id: userId }
        });

      return { success: true };
    } catch (error) {
      console.error('Approve user error:', error);
      return { success: false, error: 'Unexpected error during user approval' };
    }
  }

  /**
   * Delete document (for re-upload)
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get document details first
      const { data: document, error: fetchError } = await supabase
        .from('lady_verification_documents')
        .select('file_url, lady_id')
        .eq('id', documentId)
        .single();

      if (fetchError || !document) {
        return { success: false, error: 'Document not found' };
      }

      // Check if user owns this document
      if (document.lady_id !== user.id) {
        return { success: false, error: 'Unauthorized' };
      }

      // Delete from storage
      const filePath = document.file_url.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove([`${user.id}/${filePath}`]);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('lady_verification_documents')
        .delete()
        .eq('id', documentId);

      if (deleteError) {
        console.error('Delete document error:', deleteError);
        return { success: false, error: 'Failed to delete document' };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete document error:', error);
      return { success: false, error: 'Unexpected error during deletion' };
    }
  }
}

export const verificationService = new VerificationService(); 