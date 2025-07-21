import { supabase } from '../lib/supabase';

export interface ClientVerificationDocument {
  id: string;
  client_id: string;
  document_type: 'id_document' | 'selfie_with_id';
  file_name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  upload_status: 'pending' | 'success' | 'error';
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientVerificationStatus {
  verification_status: string;
  verification_submitted_at: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  documents: ClientVerificationDocument[];
  missing_documents: string[];
  completion_percentage: number;
}

/**
 * Get client document types with configuration
 */
export const getClientDocumentTypes = () => [
  {
    type: 'id_document' as const,
    name: '1) Photo of your ID card / Passport or Drivers License',
    description: 'Clear, high-quality photo showing your government-issued ID document with all details visible',
    icon: '🆔',
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    exampleImage: '/images/1.IDcard.png'
  },
  {
    type: 'selfie_with_id' as const,
    name: '2) Photo of you holding your ID card',
    description: 'Clear selfie of you holding your ID document next to your face, both you and the ID should be clearly visible',
    icon: '🤳',
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    exampleImage: '/images/2.-Lady-IDcard.png'
  }
];

/**
 * Get client verification status and documents
 */
export const getClientVerificationStatus = async (
  clientId: string
): Promise<{ success: boolean; data?: ClientVerificationStatus; error?: string }> => {
  try {
    // Get user verification status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('verification_status, verification_submitted_at, verified_at, verification_notes')
      .eq('id', clientId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Failed to get verification status' };
    }

    // Get documents
    const { data: documents, error: docsError } = await supabase
      .from('client_verification_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (docsError) {
      console.error('Get documents error:', docsError);
      return { success: false, error: 'Failed to get documents' };
    }

    const requiredDocuments = ['id_document', 'selfie_with_id'];
    const uploadedDocTypes = documents?.filter(doc => doc.upload_status === 'success').map(doc => doc.document_type) || [];
    const missingDocuments = requiredDocuments.filter(doc => !uploadedDocTypes.includes(doc));
    const completionPercentage = Math.round((uploadedDocTypes.filter(type => requiredDocuments.includes(type)).length / requiredDocuments.length) * 100);

    return {
      success: true,
      data: {
        verification_status: userData.verification_status || 'not_started',
        verification_submitted_at: userData.verification_submitted_at,
        verified_at: userData.verified_at,
        verification_notes: userData.verification_notes,
        documents: documents || [],
        missing_documents: missingDocuments,
        completion_percentage: completionPercentage
      }
    };
  } catch (error) {
    console.error('Get client verification status error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Upload client verification document
 */
export const uploadClientDocument = async (
  clientId: string,
  documentType: 'id_document' | 'selfie_with_id',
  file: File
): Promise<{ success: boolean; data?: ClientVerificationDocument; error?: string }> => {
  try {
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Only JPEG and PNG images are allowed' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${Date.now()}.${fileExt}`;
    const filePath = `client-verification/${clientId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return { success: false, error: 'Failed to upload file' };
    }

    // Save document record to database
    const { data: document, error: dbError } = await supabase
      .from('client_verification_documents')
      .upsert({
        client_id: clientId,
        document_type: documentType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
        upload_status: 'success',
        verification_status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, error: 'Failed to save document record' };
    }

    return { success: true, data: document };
  } catch (error) {
    console.error('Upload client document error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Delete client verification document
 */
export const deleteClientDocument = async (
  documentId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get document details first
    const { data: document, error: getError } = await supabase
      .from('client_verification_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (getError || !document) {
      return { success: false, error: 'Document not found' };
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('verification-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('client_verification_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: 'Failed to delete document record' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete client document error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Submit client verification request
 */
export const submitClientVerification = async (
  clientId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if all required documents are uploaded
    const { data: documents, error: docsError } = await supabase
      .from('client_verification_documents')
      .select('document_type, upload_status')
      .eq('client_id', clientId)
      .eq('upload_status', 'success');

    if (docsError) {
      console.error('Check documents error:', docsError);
      return { success: false, error: 'Failed to check document status' };
    }

    const requiredDocs = ['id_document', 'selfie_with_id'];
    const uploadedDocs = documents?.map(doc => doc.document_type) || [];
    const missingDocs = requiredDocs.filter(doc => !uploadedDocs.includes(doc));

    if (missingDocs.length > 0) {
      return { 
        success: false, 
        error: `Missing required documents: ${missingDocs.map(doc => doc.replace('_', ' ')).join(', ')}` 
      };
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_status: 'submitted',
        verification_submitted_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (updateError) {
      console.error('Update verification status error:', updateError);
      return { success: false, error: 'Failed to submit verification' };
    }

    return { success: true };
  } catch (error) {
    console.error('Submit client verification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Get document URL for viewing
 */
export const getClientDocumentUrl = async (
  filePath: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from('verification-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Get document URL error:', error);
      return { success: false, error: 'Failed to get document URL' };
    }

    return { success: true, url: data.signedUrl };
  } catch (error) {
    console.error('Get client document URL error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}; 