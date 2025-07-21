import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getClientVerificationStatus, type ClientVerificationStatus } from '../../services/clientVerificationService';

interface ClientVerificationGuardProps {
  children: React.ReactNode;
}

export default function ClientVerificationGuard({ children }: ClientVerificationGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<ClientVerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user.role === 'client') {
      checkVerificationStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await getClientVerificationStatus(user.id);
      
      if (result.success && result.data) {
        setVerificationStatus(result.data);
      } else {
        setError(result.error || 'Failed to check verification status');
      }
    } catch (error) {
      console.error('Verification status check error:', error);
      setError('Unable to verify account status');
    } finally {
      setLoading(false);
    }
  };

  // If not a client, allow access
  if (!user || user.role !== 'client') {
    return <>{children}</>;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Checking verification status...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Check Status</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={checkVerificationStatus}
              className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/verification/client'}
              className="w-full text-pink-500 py-2 px-4 rounded-lg hover:bg-pink-50 transition-colors"
            >
              Go to Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If verification is complete and approved, allow access
  if (verificationStatus?.verification_status === 'verified') {
    return <>{children}</>;
  }

  // For all other states, show verification prompt and redirect
  const getVerificationPrompt = () => {
    switch (verificationStatus?.verification_status) {
      case 'submitted':
        return {
          icon: <Clock className="h-16 w-16 text-blue-500 mx-auto mb-6" />,
          title: 'Verification Under Review',
          message: 'Your verification documents are being reviewed by our team. This typically takes 24-48 hours.',
          buttonText: 'Check Status',
          buttonAction: () => window.location.href = '/verification/client',
          showDashboardLink: false
        };
      
      case 'rejected':
        return {
          icon: <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />,
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please review the feedback and submit new documents.',
          buttonText: 'Update Documents',
          buttonAction: () => window.location.href = '/verification/client',
          showDashboardLink: false
        };
      
      default:
        return {
          icon: <Shield className="h-16 w-16 text-pink-500 mx-auto mb-6" />,
          title: 'Account Verification Required',
          message: 'To access your dashboard and all features, please verify your identity by uploading the required documents.',
          buttonText: 'Verify Now',
          buttonAction: () => window.location.href = '/verification/client',
          showDashboardLink: false
        };
    }
  };

  const prompt = getVerificationPrompt();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        {prompt.icon}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{prompt.title}</h2>
        <p className="text-gray-600 mb-6">{prompt.message}</p>
        
        {/* Verification Progress */}
        {verificationStatus && verificationStatus.completion_percentage > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-900">
                {verificationStatus.completion_percentage}%
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

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={prompt.buttonAction}
            className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
          >
            {prompt.buttonText}
          </button>
          
          {/* Why Verify Section */}
          <div className="text-left bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Why verify your account?
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Access all platform features</li>
              <li>• Build trust with service providers</li>
              <li>• Get priority support</li>
              <li>• Enhanced security protection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 