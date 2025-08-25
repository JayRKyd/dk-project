import { supabase } from '../lib/supabase';

export interface ClubVerificationDocument {
  id: string;
  club_id: string;
  document_type: 'business_license' | 'registration_certificate' | 'tax_document' | 'additional_document';
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  upload_status: 'pending' | 'uploading' | 'success' | 'error';
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  admin_notes?: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by_admin?: string;
  created_at: string;
  updated_at: string;
}

export interface ClubBusinessInfo {
  business_name: string;
  business_type: string;
  business_phone: string;
  business_website: string;
}

export interface ClubVerificationStatus {
  verification_status: 'not_submitted' | 'pending' | 'submitted' | 'verified' | 'rejected';
  verification_submitted_at?: string;
  verified_at?: string;
  verification_notes?: string;
  documents: ClubVerificationDocument[];
  business_info: ClubBusinessInfo;
  completion_percentage: number;
  required_documents: string[];
  missing_documents: string[];
}

/**
 * Upload a club verification document
 */
export const uploadClubDocument = async (
  file: File,
  documentType: ClubVerificationDocument['document_type'],
  clubId: string
): Promise<{ success: boolean; document?: ClubVerificationDocument; error?: string }> => {
  try {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 10MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'File must be PDF, JPEG, PNG, or WebP' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${documentType}_${timestamp}.${fileExtension}`;
    // Storage RLS policy requires the first folder to be the auth user's id
    // So the object key must start with `${auth.uid()}/...`
    const filePath = `${clubId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: 'Failed to upload file' };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath);

    // Save document record to database
    const { data: documentData, error: dbError } = await supabase
      .from('club_verification_documents')
      .insert({
        // Satisfy both legacy and current schemas
        club_id: clubId,
        user_id: clubId,
        document_type: documentType,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        upload_status: 'success',
        verification_status: 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file
      await supabase.storage
        .from('verification-documents')
        .remove([filePath]);
      return { success: false, error: 'Failed to save document record' };
    }

    return { success: true, document: documentData };
  } catch (error) {
    console.error('Upload document error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Update club business information
 */
export const updateClubBusinessInfo = async (
  clubId: string,
  businessInfo: ClubBusinessInfo
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate business info
    if (!businessInfo.business_name?.trim()) {
      return { success: false, error: 'Business name is required' };
    }
    
    if (!businessInfo.business_phone?.trim()) {
      return { success: false, error: 'Business phone is required' };
    }
    
    if (!businessInfo.business_website?.trim()) {
      return { success: false, error: 'Business website is required' };
    }

    // Validate and normalize website URL format
    const websiteValidation = validateBusinessWebsite(businessInfo.business_website);
    if (!websiteValidation.valid) {
      return { success: false, error: websiteValidation.error };
    }

    // Normalize the website URL to ensure it has https:// protocol
    let normalizedWebsite = businessInfo.business_website.trim();
    if (!normalizedWebsite.match(/^https?:\/\//i)) {
      normalizedWebsite = 'https://' + normalizedWebsite;
    }

    // Update user record
    const { error } = await supabase
      .from('users')
      .update({
        business_name: businessInfo.business_name.trim(),
        business_type: businessInfo.business_type.trim(),
        business_phone: businessInfo.business_phone.trim(),
        business_website: normalizedWebsite,
        updated_at: new Date().toISOString()
      })
      .eq('id', clubId);

    if (error) {
      console.error('Update business info error:', error);
      return { success: false, error: 'Failed to update business information' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update business info error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Submit club verification request
 */
export const submitClubVerification = async (
  clubId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Simplified: Clubs do not need to upload documents. Only require business info to be complete.
    // Check if business info is complete
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('business_name, business_phone, business_website')
      .eq('id', clubId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Failed to check business information' };
    }

    if (!userData.business_name || !userData.business_phone || !userData.business_website) {
      return { success: false, error: 'Please complete all business information fields' };
    }

    // Update verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({
        verification_status: 'submitted',
        verification_submitted_at: new Date().toISOString()
      })
      .eq('id', clubId);

    if (updateError) {
      console.error('Submit verification error:', updateError);
      return { success: false, error: 'Failed to submit verification request' };
    }

    return { success: true };
  } catch (error) {
    console.error('Submit verification error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Get club verification status and documents
 */
export const getClubVerificationStatus = async (
  clubId: string
): Promise<{ success: boolean; data?: ClubVerificationStatus; error?: string }> => {
  try {
    // Get user verification status and business info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        verification_status,
        verification_submitted_at,
        verified_at,
        verification_notes,
        business_name,
        business_type,
        business_phone,
        business_website
      `)
      .eq('id', clubId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Failed to get verification status' };
    }

    // Documents are no longer required for clubs
    const { data: documents } = await supabase
      .from('club_verification_documents')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    // Completion based on business info fields filled
    const fields = [userData.business_name, userData.business_type, userData.business_phone, userData.business_website];
    const filled = fields.filter((v: any) => !!(v && String(v).trim())).length;
    const completionPercentage = Math.round((filled / 4) * 100);

    const verificationStatus: ClubVerificationStatus = {
      verification_status: userData.verification_status as any,
      verification_submitted_at: userData.verification_submitted_at,
      verified_at: userData.verified_at,
      verification_notes: userData.verification_notes,
      documents: documents || [],
      business_info: {
        business_name: userData.business_name || '',
        business_type: userData.business_type || '',
        business_phone: userData.business_phone || '',
        business_website: userData.business_website || ''
      },
      completion_percentage: completionPercentage,
      required_documents: [],
      missing_documents: []
    };

    return { success: true, data: verificationStatus };
  } catch (error) {
    console.error('Get verification status error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Delete a club verification document
 */
export const deleteClubDocument = async (
  documentId: string,
  clubId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get document info first
    const { data: document, error: getError } = await supabase
      .from('club_verification_documents')
      .select('file_url, club_id')
      .eq('id', documentId)
      .eq('club_id', clubId) // Ensure user owns the document
      .single();

    if (getError || !document) {
      return { success: false, error: 'Document not found or access denied' };
    }

    // Extract file path from URL relative to the bucket
    // Expected URL format: .../object/public/verification-documents/<path>
    let filePath: string;
    const bucketPrefix = '/object/public/verification-documents/';
    const prefixIndex = document.file_url.indexOf(bucketPrefix);
    if (prefixIndex !== -1) {
      filePath = document.file_url.substring(prefixIndex + bucketPrefix.length);
    } else {
      // Fallback: use last two segments (e.g., `${userId}/${filename}`)
      const urlParts = document.file_url.split('/');
      filePath = urlParts.slice(-2).join('/');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('verification-documents')
      .remove([filePath]);

    if (storageError) {
      console.warn('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('club_verification_documents')
      .delete()
      .eq('id', documentId)
      .eq('club_id', clubId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: 'Failed to delete document record' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete document error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

/**
 * Get document types with their display names and requirements
 */
export const getClubDocumentTypes = () => {
  // Clubs do not need to upload documents anymore
  return [] as const;
};

/**
 * Validate business website URL
 */
export const validateBusinessWebsite = (url: string): { valid: boolean; error?: string } => {
  if (!url.trim()) {
    return { valid: false, error: 'Website URL is required' };
  }

  // Remove whitespace and check for empty string
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { valid: false, error: 'Website URL is required' };
  }

  try {
    // If no protocol is provided, prepend https:// for validation
    let urlToValidate = cleanUrl;
    if (!urlToValidate.match(/^https?:\/\//i)) {
      urlToValidate = 'https://' + urlToValidate;
    }

    const urlObj = new URL(urlToValidate);

    // Validate hostname exists and has valid format
    if (!urlObj.hostname) {
      return { valid: false, error: 'Please enter a valid website URL or domain' };
    }

    // Check for valid domain format (basic check for TLD)
    const hostnameParts = urlObj.hostname.split('.');
    if (hostnameParts.length < 2) {
      return { valid: false, error: 'Please enter a valid domain (e.g., example.com)' };
    }

    // Check that TLD is at least 2 characters (allows any TLD like .nl, .com, .co.uk, etc.)
    const tld = hostnameParts[hostnameParts.length - 1];
    if (tld.length < 2) {
      return { valid: false, error: 'Please enter a valid domain with proper TLD' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid website URL or domain (e.g., https://example.com or example.nl)' };
  }
};

/**
 * Validate business phone number
 */
export const validateBusinessPhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }

  // Remove all non-digit characters except + for international prefix
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');

  // Support international formats:
  // - +31 6 11 222 333 (Dutch mobile)
  // - 0031 6 11 222 333 (Dutch international)
  // - 0611222333 (Dutch local)
  // - +44 20 7123 4567 (UK)
  // - +1 234 567 8900 (US)
  // - 0044 20 7123 4567 (UK international)
  const internationalRegex = /^\+[1-9]\d{1,14}$/; // E.164 format with + prefix
  const internationalWithoutPlus = /^00[1-9]\d{1,14}$/; // International format with 00 prefix
  const localFormat = /^[1-9]\d{1,15}$/; // Local format without international prefix

  if (!internationalRegex.test(cleanPhone) &&
      !internationalWithoutPlus.test(cleanPhone) &&
      !localFormat.test(cleanPhone)) {
    return { valid: false, error: 'Please enter a valid phone number (e.g., +31 6 11 222 333, 0031 6 11 222 333, or 0611222333)' };
  }

  return { valid: true };
}; 