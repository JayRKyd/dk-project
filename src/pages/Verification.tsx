import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, Send, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DocumentUpload from '../components/verification/DocumentUpload';
import { DocumentType, VerificationDocument, verificationService } from '../services/verificationService';
import { supabase } from '../lib/supabase';

interface UserData {
  id: string;
  role: string;
  is_verified: boolean;
  verification_submitted_at: string | null;
}

interface VerificationState {
  documents: Record<DocumentType, VerificationDocument | null>;
  userData: UserData | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  completionPercentage: number;
  isSubmitted: boolean;
}

const REQUIRED_DOCUMENTS: DocumentType[] = [
  'id_card',
  'selfie_with_id', 
  'newspaper_photo',
  'upper_body_selfie'
];

export default function Verification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<VerificationState>({
    documents: {
      id_card: null,
      selfie_with_id: null,
      newspaper_photo: null,
      upper_body_selfie: null
    },
    userData: null,
    isLoading: true,
    isSubmitting: false,
    error: null,
    completionPercentage: 0,
    isSubmitted: false
  });

  // Redirect if user is already verified
  useEffect(() => {
    if (state.userData?.is_verified) {
      navigate('/dashboard/lady');
      return;
    }

    // Redirect non-ladies
    if (state.userData && state.userData.role !== 'lady') {
      navigate('/');
      return;
    }
  }, [state.userData, navigate]);

  // Load existing documents and user data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // Load user data from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, role, is_verified, verification_submitted_at')
          .eq('id', user.id)
          .single();

        if (userError) {
          throw new Error('Failed to load user data');
        }
        
        // Load verification documents
        const documents = await verificationService.getVerificationDocuments();
        const documentMap: Record<DocumentType, VerificationDocument | null> = {
          id_card: null,
          selfie_with_id: null,
          newspaper_photo: null,
          upper_body_selfie: null
        };

        // Map documents by type
        documents.forEach(doc => {
          documentMap[doc.document_type] = doc;
        });

        // Calculate completion percentage
        const uploadedCount = documents.length;
        const completionPercentage = (uploadedCount / REQUIRED_DOCUMENTS.length) * 100;
        
        // Check if already submitted
        const isSubmitted = userData?.verification_submitted_at != null;

        setState(prev => ({
          ...prev,
          userData,
          documents: documentMap,
          completionPercentage: Math.round(completionPercentage),
          isSubmitted,
          isLoading: false
        }));

      } catch (error) {
        console.error('Failed to load data:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to load your data. Please refresh the page.',
          isLoading: false
        }));
      }
    };

    loadData();
  }, [user]);

  // Handle document upload completion
  const handleUploadComplete = (documentType: DocumentType) => {
    // Reload documents to get updated data
    const reloadDocuments = async () => {
      try {
        const documents = await verificationService.getVerificationDocuments();
        const documentMap: Record<DocumentType, VerificationDocument | null> = {
          id_card: null,
          selfie_with_id: null,
          newspaper_photo: null,
          upper_body_selfie: null
        };

        documents.forEach(doc => {
          documentMap[doc.document_type] = doc;
        });

        const uploadedCount = documents.length;
        const completionPercentage = (uploadedCount / REQUIRED_DOCUMENTS.length) * 100;

        setState(prev => ({
          ...prev,
          documents: documentMap,
          completionPercentage: Math.round(completionPercentage),
          error: null
        }));

      } catch (error) {
        console.error('Failed to reload documents:', error);
      }
    };

    reloadDocuments();
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    setState(prev => ({ ...prev, error }));
  };

  // Handle verification submission
  const handleSubmitVerification = async () => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true, error: null }));

      const result = await verificationService.submitVerification();
      
      if (result.success) {
        setState(prev => ({ ...prev, isSubmitted: true, isSubmitting: false }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to submit verification',
          isSubmitting: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Unexpected error during submission',
        isSubmitting: false
      }));
    }
  };

  // Check if all documents are uploaded
  const allDocumentsUploaded = REQUIRED_DOCUMENTS.every(type => state.documents[type] !== null);
  const canSubmit = allDocumentsUploaded && !state.isSubmitted && !state.isSubmitting;

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify my account</h1>
            <p className="text-gray-600">
              We always recommend to verify your account on DateKelly, because it gives trust to your clients when they know that DateKelly has 
              checked and approved your advertisement. Your clients will know that you are real and sincere and that the pictures in the advertisement 
              match with reality. Verified advertisements receive on average 175% more interest from clients.
            </p>
          </div>
          
          <div className="text-center mb-4">
            <p className="text-gray-700 mb-2">It's mandatory to verify your account on DateKelly if:</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Your age is between 18 - 21 years old</p>
              <p>• DateKelly has doubts about your account</p>
              <p>• You want to post Premium Pictures in your advertisement and earn DateKelly credits</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-700">
              So verify your DateKelly account today and receive that trusted Verified icon in your advertisement!
            </p>
          </div>

          <div className="bg-pink-500 text-white rounded-lg p-4 text-center">
            <h2 className="text-lg font-bold mb-2">Upload these 4 photos to verify your account:</h2>
            <p className="text-sm">After receiving all 4 photos we will verify your account as soon as possible.</p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {state.completionPercentage}% Complete
            </span>
            <span className="text-sm text-gray-500">
              {Object.values(state.documents).filter(doc => doc !== null).length} of {REQUIRED_DOCUMENTS.length} photos uploaded
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${state.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-4 mb-6">
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{state.error}</p>
              </div>
            </div>
          )}

          {state.isSubmitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Verification Submitted Successfully!</p>
                  <p className="text-green-700 text-sm">Your documents are under review. You'll be notified once approved.</p>
                </div>
              </div>
            </div>
          )}

          {!state.isSubmitted && (
            <div className="bg-pink-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="text-gray-900 font-medium">Verification Required</p>
                  <p className="text-gray-600 text-sm">
                    Upload all 4 required documents to access your dashboard and premium features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Document Upload Sections */}
        <div className="space-y-6 mb-8">
          {REQUIRED_DOCUMENTS.map((documentType, index) => (
            <div key={documentType}>
              <DocumentUpload
                documentType={documentType}
                onUploadComplete={() => handleUploadComplete(documentType)}
                onUploadError={handleUploadError}
                existingDocument={state.documents[documentType] ? {
                  id: state.documents[documentType]!.id,
                  file_url: state.documents[documentType]!.file_url,
                  file_name: state.documents[documentType]!.file_name,
                  verification_status: state.documents[documentType]!.verification_status,
                  rejection_reason: state.documents[documentType]!.rejection_reason
                } : undefined}
                disabled={state.isSubmitted}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {!state.isSubmitted && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ready to Submit for Verification?
              </h3>
              
              {!allDocumentsUploaded && (
                <p className="text-gray-600 mb-4">
                  Please upload all {REQUIRED_DOCUMENTS.length} required documents before submitting.
                </p>
              )}

              <button
                onClick={handleSubmitVerification}
                disabled={!canSubmit}
                className={`
                  inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
                  ${canSubmit
                    ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {state.isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
              
              {allDocumentsUploaded && (
                <p className="text-sm text-gray-500 mt-2">
                  Your documents will be reviewed by our admin team within 24-48 hours.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submitted State */}
        {state.isSubmitted && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="mb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verification Under Review
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for submitting your verification documents. Our admin team will review them within 24-48 hours.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>What happens next?</strong><br />
                  • Our team will carefully review each document<br />
                  • You'll receive an email notification with the results<br />
                  • If approved, you'll gain access to all premium features<br />
                  • If any document needs revision, you'll be able to re-upload
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}