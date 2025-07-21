# Client Verification System Implementation Plan

**Created**: January 2025  
**Priority**: 🔴 **HIGH** - Security Gap  
**Time Estimate**: 2-3 days  
**Status**: Ready for Development  

---

## 🎯 **Project Overview**

### **Problem Statement**
Currently, clients can access their full dashboard without ANY verification, while ladies and clubs are properly gated. This creates:
- **Security vulnerability**: Unverified users accessing platform features
- **Quality control issues**: No identity verification for clients
- **Inconsistent user experience**: Different verification requirements by role
- **Admin burden**: No centralized verification management for clients

### **Goal**
Implement a complete client verification system that matches the existing ladies and clubs verification workflows, ensuring all user types require verification before accessing dashboard features.

---

## 🏗️ **Implementation Strategy**

### **Phase 1: Database & Service Layer (Day 1 - Morning)**
- Create client verification database schema
- Build client verification service functions
- Implement client document upload system

### **Phase 2: Frontend Components (Day 1 - Afternoon)**  
- Create ClientVerification page component
- Build ClientVerificationGuard component
- Implement client-specific verification flow

### **Phase 3: Route Protection (Day 2 - Morning)**
- Apply ClientVerificationGuard to all client routes
- Update route hierarchy and protection logic
- Test verification flow end-to-end

### **Phase 4: Admin Integration (Day 2 - Afternoon)**
- Extend admin verification queue for clients
- Add client verification review interface
- Update admin statistics and management

### **Phase 5: Testing & Polish (Day 3)**
- Comprehensive testing of verification flow
- Fix any issues and edge cases
- Documentation and deployment

---

## 📋 **Detailed Implementation Plan**

### **PHASE 1: Database & Service Layer**

#### **1.1: Database Schema Updates (30 mins)**

**Create migration: `client_verification_documents` table**
```sql
-- Migration: client_verification_system.sql
CREATE TABLE client_verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('id_document', 'selfie_with_id')),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'success', 'error')),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(client_id, document_type)
);

-- Add indexes for performance
CREATE INDEX idx_client_verification_docs_client_id ON client_verification_documents(client_id);
CREATE INDEX idx_client_verification_docs_status ON client_verification_documents(verification_status);
CREATE INDEX idx_client_verification_docs_type ON client_verification_documents(document_type);

-- Update verification_queue view to include clients
CREATE OR REPLACE VIEW verification_queue AS
SELECT 
  u.id,
  u.username,
  u.email,
  u.role,
  u.created_at as registered_at,
  u.verification_submitted_at,
  u.is_verified,
  u.verification_status,
  CASE 
    WHEN u.role = 'lady' THEN (
      SELECT COUNT(*) FROM lady_verification_documents 
      WHERE lady_id = u.id AND verification_status = 'pending'
    )
    WHEN u.role = 'club' THEN (
      SELECT COUNT(*) FROM club_verification_documents 
      WHERE club_id = u.id AND verification_status = 'pending'
    )
    WHEN u.role = 'client' THEN (
      SELECT COUNT(*) FROM client_verification_documents 
      WHERE client_id = u.id AND verification_status = 'pending'
    )
    ELSE 0
  END as pending_documents,
  CASE 
    WHEN u.role = 'lady' THEN (
      SELECT COUNT(*) FROM lady_verification_documents 
      WHERE lady_id = u.id AND upload_status = 'success'
    )
    WHEN u.role = 'club' THEN (
      SELECT COUNT(*) FROM club_verification_documents 
      WHERE club_id = u.id AND upload_status = 'success'
    )
    WHEN u.role = 'client' THEN (
      SELECT COUNT(*) FROM client_verification_documents 
      WHERE client_id = u.id AND upload_status = 'success'
    )
    ELSE 0
  END as total_documents_uploaded,
  CASE 
    WHEN u.role = 'lady' THEN 4
    WHEN u.role = 'club' THEN 3
    WHEN u.role = 'client' THEN 2
    ELSE 0
  END as required_documents
FROM users u
WHERE u.role IN ('lady', 'club', 'client') 
  AND (u.is_verified = false OR u.verification_status != 'verified')
ORDER BY u.verification_submitted_at ASC NULLS LAST;
```

#### **1.2: Client Verification Service (45 mins)**

**Create file: `src/services/clientVerificationService.ts`**
```typescript
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

export const getClientDocumentTypes = () => [
  {
    type: 'id_document' as const,
    name: '1) Photo of your ID card / Passport or Drivers License',
    description: 'Clear photo showing your government-issued ID document',
    icon: '🆔',
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg']
  },
  {
    type: 'selfie_with_id' as const,
    name: '2) Photo of you holding your ID card',
    description: 'Selfie of you clearly holding your ID document next to your face',
    icon: '🤳',
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg']
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
        error: `Missing required documents: ${missingDocs.join(', ')}` 
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
```

### **PHASE 2: Frontend Components**

#### **2.1: Client Verification Page (90 mins)**

**Create file: `src/pages/ClientVerification.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, AlertCircle, Info, Loader2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DocumentUpload from '../components/verification/DocumentUpload';
import { 
  getClientVerificationStatus, 
  uploadClientDocument, 
  submitClientVerification,
  deleteClientDocument,
  getClientDocumentTypes,
  type ClientVerificationStatus,
  type ClientVerificationDocument 
} from '../services/clientVerificationService';

export default function ClientVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<ClientVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<Set<string>>(new Set());
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const documentTypes = getClientDocumentTypes();

  // Load verification status on component mount
  useEffect(() => {
    if (user?.id) {
      loadVerificationStatus();
    }
  }, [user?.id]);

  const loadVerificationStatus = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await getClientVerificationStatus(user.id);
      if (result.success && result.data) {
        setVerificationStatus(result.data);
      } else {
        console.error('Failed to load verification status:', result.error);
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (documentType: string, file: File) => {
    if (!user?.id) return;

    setUploadingDocs(prev => new Set(prev).add(documentType));
    try {
      const result = await uploadClientDocument(
        user.id, 
        documentType as 'id_document' | 'selfie_with_id', 
        file
      );
      
      if (result.success) {
        await loadVerificationStatus(); // Refresh data
      } else {
        console.error('Upload failed:', result.error);
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred during upload. Please try again.');
    } finally {
      setUploadingDocs(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentType);
        return newSet;
      });
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      const result = await deleteClientDocument(documentId);
      if (result.success) {
        await loadVerificationStatus(); // Refresh data
      } else {
        console.error('Delete failed:', result.error);
        alert(`Delete failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred during deletion. Please try again.');
    }
  };

  const handleSubmitVerification = async () => {
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const result = await submitClientVerification(user.id);
      if (result.success) {
        setSubmitSuccess(true);
        await loadVerificationStatus(); // Refresh data
      } else {
        alert(`Failed to submit verification: ${result.error}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50';
      case 'submitted': return 'text-blue-600 bg-blue-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'submitted': return <Info className="h-5 w-5 text-blue-600" />;
      case 'rejected': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const canSubmitVerification = () => {
    return verificationStatus && 
           verificationStatus.missing_documents.length === 0 &&
           verificationStatus.verification_status !== 'submitted' &&
           verificationStatus.verification_status !== 'verified';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading verification status...</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your identity verification has been submitted successfully. Our admin team will review your documents within 24-48 hours.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/client')}
              className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="w-full text-pink-500 py-2 px-4 rounded-lg hover:bg-pink-50 transition-colors"
            >
              View Verification Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/dashboard/client" 
            className="inline-flex items-center text-pink-500 hover:text-pink-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
              <p className="text-gray-600 mt-2">Verify your identity to access all platform features</p>
            </div>
            
            {verificationStatus && (
              <div className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${getStatusColor(verificationStatus.verification_status)}`}>
                {getStatusIcon(verificationStatus.verification_status)}
                <span className="font-medium capitalize">{verificationStatus.verification_status.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Verification Benefits */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Verify Your Identity?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Trusted Account</h3>
                <p className="text-sm text-gray-600">Get verified status and build trust with service providers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <User className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Full Access</h3>
                <p className="text-sm text-gray-600">Access all booking and communication features</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Security</h3>
                <p className="text-sm text-gray-600">Help keep the platform safe for everyone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {verificationStatus && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Verification Progress</h2>
              <span className="text-sm font-medium text-gray-600">
                {verificationStatus.completion_percentage}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${verificationStatus.completion_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Document Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
          <p className="text-gray-600 mb-6">
            Please upload clear, high-quality photos of the following documents:
          </p>
          
          <div className="space-y-6">
            {documentTypes.map((docType) => {
              const existingDoc = verificationStatus?.documents.find(doc => doc.document_type === docType.type);
              const isUploading = uploadingDocs.has(docType.type);
              
              return (
                <DocumentUpload
                  key={docType.type}
                  documentType={docType.type}
                  title={docType.name}
                  description={docType.description}
                  existingDocument={existingDoc}
                  onUpload={(file) => handleDocumentUpload(docType.type, file)}
                  onDelete={() => existingDoc && handleDocumentDelete(existingDoc.id)}
                  uploading={isUploading}
                  maxSize={docType.maxSize}
                  acceptedTypes={docType.acceptedTypes}
                />
              );
            })}
          </div>
        </div>

        {/* Submit for Verification */}
        {verificationStatus && verificationStatus.verification_status !== 'verified' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit for Verification</h3>
                <p className="text-gray-600 mt-1">
                  {canSubmitVerification() 
                    ? 'Your documents are ready for verification!'
                    : 'Please upload all required documents to submit.'
                  }
                </p>
              </div>
              
              <button
                onClick={handleSubmitVerification}
                disabled={!canSubmitVerification() || submitting}
                className="bg-pink-500 text-white py-3 px-6 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### **2.2: Client Verification Guard (45 mins)**

**Create file: `src/components/auth/ClientVerificationGuard.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, CheckCircle2, AlertCircle, Clock, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getClientVerificationStatus, type ClientVerificationStatus } from '../../services/clientVerificationService';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ClientVerificationGuardProps {
  children: React.ReactNode;
  allowSkipped?: boolean;
  redirectPath?: string;
}

export default function ClientVerificationGuard({ 
  children, 
  allowSkipped = false, 
  redirectPath = '/client-verification' 
}: ClientVerificationGuardProps) {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<ClientVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadVerificationStatus();
    }
  }, [user?.id]);

  const loadVerificationStatus = async () => {
    if (!user?.id) return;

    try {
      const result = await getClientVerificationStatus(user.id);
      if (result.success && result.data) {
        setVerificationStatus(result.data);
      } else {
        console.error('Failed to load verification status:', result.error);
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only apply guard to client users
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  if (userRole !== 'client') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Allow access if verified
  if (verificationStatus?.verification_status === 'verified') {
    return <>{children}</>;
  }

  // Allow skipped access if enabled and user chose to skip
  if (allowSkipped && showSkipPrompt) {
    return <>{children}</>;
  }

  const getStatusInfo = () => {
    switch (verificationStatus?.verification_status) {
      case 'submitted':
        return {
          icon: <Clock className="h-16 w-16 text-blue-500" />,
          title: 'Verification Under Review',
          description: 'Your identity verification is being reviewed by our team. This typically takes 24-48 hours.',
          color: 'blue',
          canProceed: allowSkipped
        };
      case 'rejected':
        return {
          icon: <X className="h-16 w-16 text-red-500" />,
          title: 'Verification Rejected',
          description: 'Your identity verification was rejected. Please review the feedback and resubmit your documents.',
          color: 'red',
          canProceed: false
        };
      default:
        return {
          icon: <Shield className="h-16 w-16 text-pink-500" />,
          title: 'Identity Verification Required',
          description: 'To access your dashboard and all features, you need to verify your identity first.',
          color: 'pink',
          canProceed: false
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-sm p-8 text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {statusInfo.icon}
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {statusInfo.title}
        </h2>
        <p className="text-gray-600 mb-8">
          {statusInfo.description}
        </p>

        {/* Verification Benefits */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Verify Your Identity?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Get verified status and build trust</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Access all booking and communication features</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Help keep the platform safe for everyone</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Priority customer support</span>
            </div>
          </div>
        </div>

        {/* Progress Display */}
        {verificationStatus && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Verification Progress</span>
              <span className="text-sm text-gray-600">{verificationStatus.completion_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${verificationStatus.completion_percentage}%` }}
              />
            </div>
            {verificationStatus.missing_documents.length > 0 && (
              <div className="mt-3 text-left">
                <p className="text-xs text-gray-600 mb-1">Missing documents:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {verificationStatus.missing_documents.map(doc => (
                    <li key={doc}>• {doc.replace('_', ' ').toUpperCase()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {verificationStatus?.verification_status === 'rejected' && verificationStatus.verification_notes && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h4>
                <p className="text-sm text-red-700">{verificationStatus.verification_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Action */}
          <Link
            to={redirectPath}
            className={`w-full bg-${statusInfo.color}-500 text-white py-3 px-4 rounded-lg hover:bg-${statusInfo.color}-600 transition-colors flex items-center justify-center space-x-2`}
          >
            <User className="h-4 w-4" />
            <span>
              {verificationStatus?.verification_status === 'rejected' 
                ? 'Fix and Resubmit' 
                : verificationStatus?.verification_status === 'submitted'
                ? 'View Status'
                : 'Start Verification'
              }
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Skip Option (if allowed) */}
          {allowSkipped && verificationStatus?.verification_status !== 'rejected' && (
            <button
              onClick={() => setShowSkipPrompt(true)}
              className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Continue with Limited Access
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team for assistance with the verification process.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### **PHASE 3: Route Protection**

#### **3.1: Update App.tsx Routes (30 mins)**

**File: `src/App.tsx`** - Add imports and update client routes:
```typescript
// Add import
import ClientVerificationGuard from './components/auth/ClientVerificationGuard';

// Add client verification route
<Route path="/client-verification" element={
  <ProtectedRoute requiredRole="client">
    <ClientVerification />
  </ProtectedRoute>
} />

// Update ALL client dashboard routes with ClientVerificationGuard
<Route path="/dashboard/client" element={
  <ProtectedRoute requiredRole="client">
    <ClientVerificationGuard>
      <ClientDashboard />
    </ClientVerificationGuard>
  </ProtectedRoute>
} />
<Route path="/dashboard/client/bookings" element={
  <ProtectedRoute requiredRole="client">
    <ClientVerificationGuard>
      <ClientBookings />
    </ClientVerificationGuard>
  </ProtectedRoute>
} />
// ... repeat for all client routes
```

### **PHASE 4: Admin Integration**

#### **4.1: Update Admin Verification Service (30 mins)**

**File: `src/services/adminVerificationService.ts`** - Add client support:
```typescript
/**
 * Get client verification details for admin review
 */
export const getClientVerificationDetails = async (
  clientId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    // Get client user info
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .select(`
        id, email, username, role, verification_status, 
        verification_submitted_at, verified_at, verification_notes, created_at
      `)
      .eq('id', clientId)
      .eq('role', 'client')
      .single();

    if (clientError || !clientData) {
      return { success: false, error: 'Client not found' };
    }

    // Get client verification documents
    const { data: documents, error: docsError } = await supabase
      .from('client_verification_documents')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (docsError) {
      return { success: false, error: 'Failed to fetch documents' };
    }

    return {
      success: true,
      data: {
        user: clientData,
        documents: documents || []
      }
    };
  } catch (error) {
    console.error('Error fetching client verification details:', error);
    throw error;
  }
};
```

#### **4.2: Update Admin Dashboard Statistics (15 mins)**

Update the admin dashboard to include client verification statistics in the existing stats display.

---

## 🧪 **Testing Plan**

### **Phase 5: Comprehensive Testing**

#### **5.1: Verification Flow Testing**
- ✅ Client registration → automatic redirect to verification
- ✅ Document upload process (both documents)
- ✅ Submission workflow and admin notification
- ✅ Admin approval/rejection process
- ✅ Client notification of verification result

#### **5.2: Route Protection Testing**
- ✅ Unverified clients blocked from dashboard
- ✅ Verified clients gain full access
- ✅ Proper redirect flows and messaging
- ✅ Skip functionality (if implemented)

#### **5.3: Error Handling Testing**
- ✅ File upload failures
- ✅ Network connectivity issues
- ✅ Database errors
- ✅ Invalid file types/sizes

#### **5.4: UI/UX Testing**
- ✅ Responsive design on all devices
- ✅ Clear progress indicators
- ✅ Appropriate error messages
- ✅ Consistent styling with existing components

---

## 📋 **Implementation Checklist**

### **Database & Backend**
- [ ] Create `client_verification_documents` table
- [ ] Update `verification_queue` view to include clients
- [ ] Create client verification service functions
- [ ] Test database operations

### **Frontend Components**
- [ ] Create `ClientVerification.tsx` page
- [ ] Create `ClientVerificationGuard.tsx` component
- [ ] Update document upload component for client usage
- [ ] Test verification flow

### **Route Protection**
- [ ] Update `App.tsx` with client verification route
- [ ] Apply `ClientVerificationGuard` to all client dashboard routes
- [ ] Test route protection
- [ ] Verify redirect flows

### **Admin Integration**
- [ ] Update admin verification queue to handle clients
- [ ] Add client verification review interface
- [ ] Update admin statistics
- [ ] Test admin workflow

### **Testing & Polish**
- [ ] End-to-end testing of verification flow
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing
- [ ] Performance testing
- [ ] Error handling testing

---

## 🚀 **Post-Implementation**

### **Success Metrics**
- ✅ All user types (ladies, clubs, clients) require verification
- ✅ Consistent verification experience across roles
- ✅ Admin can manage all verification types in one place
- ✅ No security gaps in dashboard access

### **Future Enhancements**
- Email notifications for verification status changes
- Automatic verification reminders
- Enhanced document validation
- Bulk verification actions for admins

---

**End of Implementation Plan** 