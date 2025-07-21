import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle2, AlertCircle, Info, Loader2, User, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ClientDocumentUpload from '../components/verification/ClientDocumentUpload';
import { 
  getClientVerificationStatus, 
  uploadClientDocument, 
  submitClientVerification,
  deleteClientDocument,
  getClientDocumentTypes,
  type ClientVerificationStatus 
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
              <h1 className="text-3xl font-bold text-gray-900">Verify my account</h1>
              <p className="text-gray-600 mt-2">Verify your identity to access all platform features and build trust</p>
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
          <div className="text-center mb-6">
            <p className="text-gray-600">
              We recommend to verify your account on DateKelly, because it gives trust to service providers when they know that DateKelly has 
              checked and approved your identity. Service providers will know that you are real and sincere. Verified accounts receive priority support 
              and enhanced platform features.
            </p>
          </div>
          
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
                <h3 className="font-medium text-gray-900">Enhanced Security</h3>
                <p className="text-sm text-gray-600">Help keep the platform safe for everyone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Requirements */}
        <div className="bg-pink-50 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-pink-500" />
            <div>
              <p className="text-gray-900 font-medium">Upload these 2 photos to verify your account</p>
              <p className="text-gray-600 text-sm">
                Please provide clear, high-quality photos that show all details clearly.
              </p>
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
        <div className="space-y-6 mb-8">
          {documentTypes.map((docType) => {
            const existingDoc = verificationStatus?.documents.find(doc => doc.document_type === docType.type);
            const isUploading = uploadingDocs.has(docType.type);
            
            return (
              <ClientDocumentUpload
                key={docType.type}
                documentType={docType.type}
                title={docType.name}
                description={docType.description}
                existingDocument={existingDoc}
                onUpload={(file: File) => handleDocumentUpload(docType.type, file)}
                onDelete={() => existingDoc && handleDocumentDelete(existingDoc.id)}
                uploading={isUploading}
                maxSize={docType.maxSize}
                acceptedTypes={docType.acceptedTypes}
                exampleImage={docType.exampleImage}
              />
            );
          })}
        </div>

        {/* Submit for Verification */}
        {verificationStatus && verificationStatus.verification_status !== 'verified' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ready to Submit for Verification?
              </h3>
              
              {!canSubmitVerification() && verificationStatus.missing_documents.length > 0 && (
                <p className="text-gray-600 mb-4">
                  Please upload all {documentTypes.length} required documents before submitting.
                </p>
              )}

              <button
                onClick={handleSubmitVerification}
                disabled={!canSubmitVerification() || submitting}
                className={`
                  inline-flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-all
                  ${canSubmitVerification() && !submitting
                    ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit for Verification</span>
                  </>
                )}
              </button>
              
              {canSubmitVerification() && (
                <p className="text-sm text-gray-500 mt-2">
                  Your documents will be reviewed by our admin team within 24-48 hours.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 