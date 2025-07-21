import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getClubVerificationStatus, type ClubVerificationStatus } from '../../services/clubVerificationService';

interface ClubFeatureGateProps {
  children: React.ReactNode;
  feature: string;
  description?: string;
  redirectPath?: string;
  showUpgradePrompt?: boolean;
}

export default function ClubFeatureGate({ 
  children, 
  feature, 
  description,
  redirectPath = '/club-verification',
  showUpgradePrompt = true 
}: ClubFeatureGateProps) {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<ClubVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only apply gate to club users
  const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
  if (userRole !== 'club') {
    return <>{children}</>;
  }

  // Allow access if verified
  if (verificationStatus?.verification_status === 'verified') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-pink-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Show gated version for unverified clubs
  return (
    <div className="relative">
      {/* Grayed out content */}
      <div className="opacity-30 pointer-events-none filter grayscale">
        {children}
      </div>
      
      {/* Overlay with verification prompt */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="max-w-sm w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg border-2 border-pink-100 p-6 text-center">
            {/* Icon */}
            <div className="mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verification Required
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {description || `To access ${feature}, please verify your club first.`}
            </p>

            {/* Verification Status */}
            {verificationStatus && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Verification Progress</span>
                  <span>{verificationStatus.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-pink-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${verificationStatus.completion_percentage}%` }}
                  />
                </div>
                {verificationStatus.verification_status === 'submitted' && (
                  <p className="text-xs text-blue-600 mt-2">Under review - typically takes 24-48 hours</p>
                )}
                {verificationStatus.verification_status === 'rejected' && (
                  <p className="text-xs text-red-600 mt-2">Verification rejected - please resubmit</p>
                )}
              </div>
            )}

            {/* Action Button */}
            {showUpgradePrompt && (
              <Link
                to={redirectPath}
                className="inline-flex items-center justify-center w-full bg-pink-500 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                <span>
                  {verificationStatus?.verification_status === 'rejected' 
                    ? 'Fix and Resubmit' 
                    : verificationStatus?.verification_status === 'submitted'
                    ? 'View Status'
                    : 'Verify Club'
                  }
                </span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            )}

            {/* Benefits */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Verified clubs get priority placement, verified badge, and access to all features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 