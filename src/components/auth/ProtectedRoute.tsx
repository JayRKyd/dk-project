import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'lady' | 'client' | 'club' | 'admin';
  loadingComponent?: ReactNode;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  loadingComponent = <LoadingSpinner />
}: ProtectedRouteProps) => {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Handle errors
  if (error) {
    console.error('ProtectedRoute error:', error);
    return <div>Error loading user data. Please try again later.</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required but profile isn't loaded yet, wait
  if (requiredRole && !profile) {
    return <>{loadingComponent}</>;
  }

  // Check if user has the required role
  if (requiredRole && profile?.role !== requiredRole) {
    // Redirect to unauthorized or home page
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // If we have a profile and role check passes, render children
  return <>{children}</>;
};
