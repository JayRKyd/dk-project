import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Shield, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface VerificationGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showPrompt?: boolean;
  allowSkipped?: boolean; // Allow access with reduced functionality if verification was skipped
}

const VerificationPrompt: React.FC<{ onVerify: () => void }> = ({ onVerify }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-pink-100 rounded-full">
            <Shield className="h-8 w-8 text-pink-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Required
        </h2>
        
        <p className="text-gray-600 mb-6">
          To access your dashboard and premium features, you need to verify your profile first. 
          Verified profiles get 175% more client interest!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-4 bg-pink-50 rounded-lg">
            <CheckCircle className="h-6 w-6 text-pink-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Verified Badge</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-pink-50 rounded-lg">
            <Shield className="h-6 w-6 text-pink-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Premium Features</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-pink-50 rounded-lg">
            <Clock className="h-6 w-6 text-pink-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Priority Listing</span>
          </div>
        </div>

        <button
          onClick={onVerify}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Start Verification Process
        </button>
      </div>
    </div>
  );
};

const VerificationPending: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-pink-100 rounded-full">
            <Clock className="h-8 w-8 text-pink-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification In Progress
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your documents have been submitted and are being reviewed by our team. 
          This process typically takes 24-48 hours.
        </p>

        <div className="bg-pink-50 rounded-lg p-4">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 text-pink-500 mr-2" />
            <span className="text-gray-700 font-medium">Review in progress...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VerificationRejected: React.FC<{ onRetry: () => void; rejectionReason?: string }> = ({ 
  onRetry, 
  rejectionReason 
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-pink-100 rounded-full">
            <AlertCircle className="h-8 w-8 text-pink-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Required
        </h2>
        
        <p className="text-gray-600 mb-4">
          Your verification was not approved. Please review the feedback and submit new documents.
        </p>

        {rejectionReason && (
          <div className="bg-pink-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700 text-sm">
              <strong>Reason:</strong> {rejectionReason}
            </p>
          </div>
        )}

        <button
          onClick={onRetry}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Submit New Documents
        </button>
      </div>
    </div>
  );
};

export const VerificationGuard: React.FC<VerificationGuardProps> = ({
  children,
  fallback,
  redirectTo,
  showPrompt = true,
  allowSkipped = false
}) => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();
  
  // Show loading while checking user profile
  if (loading) {
    return <LoadingSpinner />;
  }

  // If no user, should be handled by ProtectedRoute
  if (!user) {
    return null;
  }

  // Only apply verification guard to ladies
  if (user.user_metadata?.role !== 'lady') {
    return <>{children}</>;
  }

  // Check verification status
  const isVerified = profile?.verification_status === 'verified' || profile?.is_verified === true;
  const verificationSubmitted = profile?.verification_submitted_at;
  const verificationStatus = profile?.verification_status;
  const rejectionReason = profile?.verification_rejection_reason;

  // Debug logging
  console.log('🔍 VerificationGuard Debug:', {
    profile: profile,
    verification_status: profile?.verification_status,
    is_verified: profile?.is_verified,
    isVerified: isVerified,
    role: user?.user_metadata?.role
  });

  // Check if verification was skipped
  const verificationSkipped = localStorage.getItem('verification_skipped') === 'true';
  // const skipDate = localStorage.getItem('verification_skip_date');

  // If verified, allow access
  if (isVerified) {
    return <>{children}</>;
  }

  // If verification was skipped and we allow skipped access, show children with reduced functionality
  if (allowSkipped && verificationSkipped && !verificationSubmitted) {
    return <>{children}</>;
  }

  // Handle redirect if specified
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Don't show prompt if disabled
  if (!showPrompt) {
    return null;
  }

  // Show appropriate verification prompt based on status
  const handleVerify = () => {
    navigate('/verification');
  };

  const handleRetry = () => {
    navigate('/verification');
  };

  if (verificationStatus === 'pending' && verificationSubmitted) {
    return <VerificationPending />;
  }

  if (verificationStatus === 'rejected') {
    return <VerificationRejected onRetry={handleRetry} rejectionReason={rejectionReason} />;
  }

  // Default: not submitted yet
  return <VerificationPrompt onVerify={handleVerify} />;
};

export default VerificationGuard; 