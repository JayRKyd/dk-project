import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface RoleBasedRedirectProps {
  children?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * Component that handles role-based redirection after authentication
 * - Uses the user's role and membership tier to determine the correct dashboard
 * - Shows loading state while user data is being fetched
 * - Handles errors during profile loading
 */
export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({
  children,
  loadingComponent = <LoadingSpinner />
}) => {
  const { user } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything if still loading or no user
    if (loading || !user) return;

    // If there's an error, log it but continue with default role
    if (error) {
      console.error('Error in RoleBasedRedirect:', error);
    }

    // Get the user's role and membership tier
    const userRole = profile?.role || 'client'; // Default to client if no role
    const membershipTier = profile?.membership_tier?.toUpperCase() || 'FREE';
    
    // Get the redirect path from location state or use the default
    const fromPath = location.state?.from?.pathname || '/';
    
    // Log the redirection for debugging
    console.log(`RoleBasedRedirect: Redirecting user with role: ${userRole}, tier: ${membershipTier}`);

    // Redirect based on role and membership tier
    switch (userRole.toLowerCase()) {
      case 'lady':
        // Check if already on a lady dashboard to prevent infinite redirects
        if (!window.location.pathname.startsWith('/dashboard/lady')) {
          // Check if this is a new user (created within last 5 minutes) and hasn't submitted verification
          const isNewUser = profile?.created_at && 
            (Date.now() - new Date(profile.created_at).getTime()) < 5 * 60 * 1000;
          const hasNotSubmittedVerification = !profile?.verification_submitted_at;
          const verificationSkipped = localStorage.getItem('verification_skipped') === 'true';
          
          // If new user and hasn't submitted verification or skipped, redirect to verification
          if (isNewUser && hasNotSubmittedVerification && !verificationSkipped) {
            console.log('Redirecting new lady to verification');
            navigate('/verification', { 
              replace: true,
              state: { from: fromPath, isNewUser: true }
            });
          } else {
            // Normal dashboard redirect
            const ladyDashboardPath = membershipTier === 'PRO' ? '/dashboard/lady' : '/dashboard/lady/free';
            console.log(`Redirecting lady to: ${ladyDashboardPath}`);
            navigate(ladyDashboardPath, { 
              replace: true,
              state: { from: fromPath }
            });
          }
        }
        break;
        
      case 'club':
        if (!window.location.pathname.startsWith('/dashboard/club')) {
          console.log('Redirecting to club dashboard');
          navigate('/dashboard/club', { 
            replace: true,
            state: { from: fromPath }
          });
        }
        break;
        
      case 'admin':
        if (!window.location.pathname.startsWith('/admin')) {
          console.log('Redirecting to admin dashboard');
          navigate('/admin', { 
            replace: true,
            state: { from: fromPath }
          });
        }
        break;
        
      case 'client':
      default:
        if (!window.location.pathname.startsWith('/dashboard/client')) {
          console.log('Redirecting to client dashboard');
          navigate('/dashboard/client', { 
            replace: true,
            state: { from: fromPath }
          });
        }
    }
  }, [user, profile, loading, error, navigate, location]);

  // Show loading state while checking authentication and profile
  if (loading) {
    return <>{loadingComponent}</>;
  }

  // Show error state if there was an error loading the profile
  if (error) {
    return (
      <div className="p-4 text-red-600">
        Error loading your profile. Please try refreshing the page.
      </div>
    );
  }

  // If we have a user but no profile yet, show loading
  if (user && !profile) {
    return <>{loadingComponent}</>;
  }

  // If we have a profile but no redirection happened yet, show children
  return <>{children}</>;
};
