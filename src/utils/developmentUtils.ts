/**
 * Development utilities for testing and bypassing membership restrictions
 * These functions should only work in development/staging environments
 */

export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_ENVIRONMENT === 'staging';
};

export const canBypassMembershipCheck = (user: any): boolean => {
  if (!isDevelopmentMode()) {
    return false; // Never bypass in production
  }
  
  // Check if user is marked as a test account
  const isTestAccount = user?.user_metadata?.is_test_account === true ||
                       user?.app_metadata?.is_test_account === true;
  
  if (isTestAccount) {
    console.log('🧪 TEST ACCOUNT: Membership restrictions bypassed for development');
    return true;
  }
  
  return false;
};

export const logMembershipAction = (action: string, details: any): void => {
  if (isDevelopmentMode()) {
    console.log(`🔐 MEMBERSHIP: ${action}`, details);
  }
};

/**
 * Helper function to create test user metadata
 */
export const createTestUserMetadata = (tier: 'FREE' | 'PRO') => ({
  is_test_account: true,
  membership_tier: tier,
  created_by_admin: true,
  test_environment: process.env.NODE_ENV
});

/**
 * Check if current environment allows test account creation
 */
export const canCreateTestAccounts = (): boolean => {
  return isDevelopmentMode();
}; 