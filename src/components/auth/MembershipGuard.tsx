import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getUserMembershipTier } from '../../utils/authUtils';
import { canBypassMembershipCheck } from '../../utils/developmentUtils';
import { UpgradePrompt } from './UpgradePrompt';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface MembershipGuardProps {
  requiredTier: 'FREE' | 'PRO';  // Simplified to just FREE and PRO
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

// Helper function for simplified FREE vs PRO access checking
const checkMembershipAccess = (userTier: string, requiredTier: string): boolean => {
  if (requiredTier === 'FREE') return true; // Everyone can access FREE features
  if (requiredTier === 'PRO') return userTier === 'PRO'; // Only PRO users can access PRO features
  return false;
};

export const MembershipGuard: React.FC<MembershipGuardProps> = ({
  requiredTier,
  children,
  fallback,
  redirectTo
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

  const userTier = getUserMembershipTier(user);
  
  // Development bypass for testing
  if (canBypassMembershipCheck(user)) {
    console.log(`🔓 DEV BYPASS: Allowing access to ${requiredTier} feature for test account`);
    return <>{children}</>;
  }
  
  const hasAccess = checkMembershipAccess(userTier, requiredTier);
  
  if (!hasAccess) {
    console.log(`🚫 ACCESS DENIED: User tier "${userTier}" cannot access "${requiredTier}" feature`);
    
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
      return null;
    }
    
    return fallback || <UpgradePrompt requiredTier={requiredTier} currentTier={userTier} />;
  }
  
  return <>{children}</>;
};

export default MembershipGuard; 