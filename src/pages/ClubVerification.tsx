import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Shield, CheckCircle2, AlertCircle, Info, Loader2, X, Building, Phone, Globe, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getClubVerificationStatus, 
  updateClubBusinessInfo, 
  uploadClubDocument, 
  submitClubVerification,
  deleteClubDocument,
  getClubDocumentTypes,
  validateBusinessWebsite,
  validateBusinessPhone,
  type ClubVerificationStatus,
  type ClubBusinessInfo,
  type ClubVerificationDocument 
} from '../services/clubVerificationService';

interface FormErrors {
  business_name?: string;
  business_type?: string;
  business_phone?: string;
  business_website?: string;
}

export default function ClubVerification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<ClubVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<ClubBusinessInfo>({
    business_name: '',
    business_type: '',
    business_phone: '',
    business_website: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [uploadingDocs, setUploadingDocs] = useState<Set<string>>(new Set());
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const documentTypes = getClubDocumentTypes();

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
      const result = await getClubVerificationStatus(user.id);
      if (result.success && result.data) {
        setVerificationStatus(result.data);
        setBusinessInfo(result.data.business_info);
      } else {
        console.error('Failed to load verification status:', result.error);
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInfoChange = (field: keyof ClubBusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateBusinessInfo = (): boolean => {
    const errors: FormErrors = {};

    if (!businessInfo.business_name.trim()) {
      errors.business_name = 'Business name is required';
    }

    if (!businessInfo.business_type.trim()) {
      errors.business_type = 'Business type is required';
    }

    const phoneValidation = validateBusinessPhone(businessInfo.business_phone);
    if (!phoneValidation.valid) {
      errors.business_phone = phoneValidation.error;
    }

    const websiteValidation = validateBusinessWebsite(businessInfo.business_website);
    if (!websiteValidation.valid) {
      errors.business_website = websiteValidation.error;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBusinessInfo = async () => {
    if (!user?.id || !validateBusinessInfo()) return;

    setSubmitting(true);
    try {
      const result = await updateClubBusinessInfo(user.id, businessInfo);
      if (result.success) {
        await loadVerificationStatus(); // Refresh data
      } else {
        console.error('Failed to save business info:', result.error);
        alert('Failed to save business information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving business info:', error);
      alert('An error occurred while saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: ClubVerificationDocument['document_type']) => {
    if (!user?.id) return;

    setUploadingDocs(prev => new Set(prev).add(documentType));
    
    try {
      const result = await uploadClubDocument(file, documentType, user.id);
      if (result.success) {
        await loadVerificationStatus(); // Refresh data
      } else {
        alert(`Failed to upload ${documentType}: ${result.error}`);
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

  const handleDeleteDocument = async (documentId: string, documentType: string) => {
    if (!user?.id) return;

    if (!confirm(`Are you sure you want to delete this ${documentType} document?`)) {
      return;
    }

    try {
      const result = await deleteClubDocument(documentId, user.id);
      if (result.success) {
        await loadVerificationStatus(); // Refresh data
      } else {
        alert(`Failed to delete document: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting. Please try again.');
    }
  };

  const handleSubmitVerification = async () => {
    if (!user?.id) return;

    setSubmitting(true);
    try {
      const result = await submitClubVerification(user.id);
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

  const isBusinessInfoComplete = () => {
    return businessInfo.business_name.trim() && 
           businessInfo.business_type.trim() && 
           businessInfo.business_phone.trim() && 
           businessInfo.business_website.trim();
  };

  const canSubmitVerification = () => {
    return isBusinessInfoComplete() && 
           verificationStatus && 
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
            Your club verification has been submitted successfully. Our admin team will review your documents and business information within 24-48 hours.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard/club')}
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
            to="/dashboard/club" 
            className="inline-flex items-center text-pink-500 hover:text-pink-600 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Club Verification</h1>
              <p className="text-gray-600 mt-2">Verify your club to access all platform features</p>
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
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Verify Your Club?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Trusted Status</h3>
                <p className="text-sm text-gray-600">Get a verified badge and build client trust</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Building className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Full Access</h3>
                <p className="text-sm text-gray-600">Access all club management features</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-6 w-6 text-pink-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Quality Control</h3>
                <p className="text-sm text-gray-600">Join our network of verified clubs</p>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessInfo.business_name}
                  onChange={(e) => handleBusinessInfoChange('business_name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    formErrors.business_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business name"
                />
                {formErrors.business_name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.business_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  value={businessInfo.business_type}
                  onChange={(e) => handleBusinessInfoChange('business_type', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    formErrors.business_type ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select business type</option>
                  <option value="club">Club</option>
                  <option value="agency">Agency</option>
                  <option value="entertainment_venue">Entertainment Venue</option>
                  <option value="escort_service">Escort Service</option>
                  <option value="other">Other</option>
                </select>
                {formErrors.business_type && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.business_type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Phone *
                </label>
                <input
                  type="tel"
                  value={businessInfo.business_phone}
                  onChange={(e) => handleBusinessInfoChange('business_phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    formErrors.business_phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+1 234 567 8900"
                />
                {formErrors.business_phone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.business_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Website *
                </label>
                <input
                  type="url"
                  value={businessInfo.business_website}
                  onChange={(e) => handleBusinessInfoChange('business_website', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                    formErrors.business_website ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://yourclub.com"
                />
                {formErrors.business_website && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.business_website}</p>
                )}
              </div>

              <button
                onClick={handleSaveBusinessInfo}
                disabled={submitting}
                className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4" />
                    <span>Save Business Info</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Required Documents</h2>
            
            <div className="space-y-6">
              {documentTypes.map((docType) => {
                const existingDoc = verificationStatus?.documents.find(doc => doc.document_type === docType.type);
                const isUploading = uploadingDocs.has(docType.type);
                
                return (
                  <div key={docType.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{docType.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {docType.name}
                            {docType.required && <span className="text-red-500 ml-1">*</span>}
                          </h3>
                          <p className="text-sm text-gray-600">{docType.description}</p>
                        </div>
                      </div>
                      
                      {existingDoc && (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            existingDoc.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                            existingDoc.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {existingDoc.verification_status}
                          </span>
                          <button
                            onClick={() => handleDeleteDocument(existingDoc.id, docType.name)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {existingDoc ? (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{existingDoc.file_name}</span>
                        </div>
                        {existingDoc.rejection_reason && (
                          <p className="text-sm text-red-600 mt-2">
                            Rejection reason: {existingDoc.rejection_reason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, docType.type);
                            }
                          }}
                          className="hidden"
                          id={`file-${docType.type}`}
                          disabled={isUploading}
                        />
                        <label
                          htmlFor={`file-${docType.type}`}
                          className={`cursor-pointer flex flex-col items-center space-y-2 ${
                            isUploading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isUploading ? (
                            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                          ) : (
                            <Upload className="h-8 w-8 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {isUploading ? 'Uploading...' : 'Click to upload'}
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPEG, PNG, WebP (max 10MB)
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {verificationStatus && verificationStatus.verification_status !== 'verified' && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit for Verification</h3>
                <p className="text-gray-600 mt-1">
                  {canSubmitVerification() 
                    ? 'Your club is ready for verification!'
                    : 'Complete all required fields and upload documents to submit.'
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