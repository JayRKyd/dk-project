import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Shield, AlertCircle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const AccessDenied: React.FC<{ onGoBack: () => void }> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard. 
            Only administrators can view this content.
          </p>

          <button
            onClick={onGoBack}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export const AdminGuard: React.FC<AdminGuardProps> = ({
  children,
  fallback,
  redirectTo
}) => {
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();
  
  // Show loading while checking user profile
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  // Check if user has admin role
  const isAdmin = profile?.role === 'admin';

  // If not admin, show access denied or custom fallback
  if (!isAdmin) {
    // Handle redirect if specified
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      return null;
    }

    // Show custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default: show access denied page
    const handleGoBack = () => {
      // Redirect based on user role
      switch (profile?.role) {
        case 'lady':
          navigate('/dashboard/lady/free', { replace: true });
          break;
        case 'club':
          navigate('/dashboard/club', { replace: true });
          break;
        case 'client':
        default:
          navigate('/dashboard/client', { replace: true });
          break;
      }
    };

    return <AccessDenied onGoBack={handleGoBack} />;
  }

  // User is admin, show protected content
  return <>{children}</>;
}; 