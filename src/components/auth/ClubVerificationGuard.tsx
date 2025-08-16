import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building, CheckCircle2, AlertCircle, Clock, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getClubVerificationStatus, type ClubVerificationStatus } from '../../services/clubVerificationService';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ClubVerificationGuardProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export default function ClubVerificationGuard({ 
  children, 
  redirectPath = '/club-verification' 
}: ClubVerificationGuardProps) {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<ClubVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  // Limited access bypass removed per product decision

  useEffect(() => {
    if (user?.id) {
      loadVerificationStatus();
    }
  }, [user?.id]);

  const loadVerificationStatus = async () => {
    if (!user?.id) return;

    try {
      const result = await getClubVerificationStatus(user.id);
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

  // Only apply guard to club users
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  if (userRole !== 'club') {
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

  // No limited access bypass; unverified clubs are directed to verification

  const getStatusInfo = () => {
    switch (verificationStatus?.verification_status) {
      case 'submitted':
        return {
          icon: <Clock className="h-16 w-16 text-blue-500" />,
          title: 'Verification Under Review',
          description: 'Your club verification is being reviewed by our team. This typically takes 24-48 hours.',
          color: 'blue',
          canProceed: false
        };
      case 'rejected':
        return {
          icon: <X className="h-16 w-16 text-red-500" />,
          title: 'Verification Rejected',
          description: 'Your club verification was rejected. Please review the feedback and resubmit your documents.',
          color: 'red',
          canProceed: false
        };
      default:
        return {
          icon: <Shield className="h-16 w-16 text-pink-500" />,
          title: 'Club Verification Required',
          description: 'To access your club dashboard and all features, you need to verify your club first.',
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Verify Your Club?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Get a verified badge and build client trust</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Access all club management features</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Higher visibility in search results</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="h-5 w-5 text-pink-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">Join our network of verified clubs</span>
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
            <Building className="h-4 w-4" />
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

          {/* Limited access option removed */}
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