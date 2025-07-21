import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook that redirects to login if user is not authenticated
 * @param redirectPath - Path to redirect to if not authenticated (default: '/login')
 * @param requireRole - Optional role required to access the route
 * @returns Object containing loading state and auth state
 */
export const useRequireAuth = (redirectPath = '/login', requireRole?: string) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    // If not authenticated, redirect to login with return URL
    if (!isAuthenticated) {
      navigate(redirectPath, { 
        state: { from: location },
        replace: true 
      });
      return;
    }

    // If role is required but user doesn't have it
    if (requireRole && user?.user_metadata?.role !== requireRole) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, location, redirectPath, requireRole, user]);

  return { loading, isAuthenticated, user };
};
