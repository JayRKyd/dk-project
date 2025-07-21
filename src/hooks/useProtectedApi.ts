/**
 * React Hook for Protected API Calls
 * Provides easy integration with membership validation
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { protectedApiCall, protectedApiService, MembershipAccessError } from '../services/protectedApiService';
import { logMembershipAction } from '../utils/developmentUtils';

interface UseProtectedApiOptions {
  feature?: string;
  endpoint?: string;
  requiredTier?: 'FREE' | 'PRO';
  onMembershipError?: (error: MembershipAccessError) => void;
}

interface UseProtectedApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  membershipError: MembershipAccessError | null;
  execute: () => Promise<T | null>;
  reset: () => void;
}

/**
 * Main hook for protected API calls
 */
export function useProtectedApi<T = any>(
  apiCall: () => Promise<{ data: T; error: any }>,
  options: UseProtectedApiOptions = {}
): UseProtectedApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipError, setMembershipError] = useState<MembershipAccessError | null>(null);
  
  const { user } = useAuth();

  const execute = useCallback(async (): Promise<T | null> => {
    if (!user) {
      setError('Authentication required');
      return null;
    }

    setLoading(true);
    setError(null);
    setMembershipError(null);

    try {
      const result = await protectedApiCall(apiCall, options);
      
      if (result.error) {
        if (result.error.code === 'MEMBERSHIP_REQUIRED') {
          const membershipErr = new MembershipAccessError(
            result.error.message,
            result.error.userTier,
            result.error.requiredTier,
            result.error.feature
          );
          setMembershipError(membershipErr);
          
          if (options.onMembershipError) {
            options.onMembershipError(membershipErr);
          }
        } else {
          setError(result.error.message || 'An error occurred');
        }
        return null;
      }

      setData(result.data);
      logMembershipAction('Protected API call successful', {
        userId: user.id,
        feature: options.feature,
        endpoint: options.endpoint
      });
      
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      logMembershipAction('Protected API call failed', {
        userId: user.id,
        feature: options.feature,
        endpoint: options.endpoint,
        error: errorMessage
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiCall, options, user]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setMembershipError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    membershipError,
    execute,
    reset
  };
}

/**
 * Specialized hooks for common PRO features
 */

export function useFanPosts() {
  const listHook = useProtectedApi(
    protectedApiService.fanPosts.list,
    { feature: 'fan_posts', endpoint: 'fan_posts' }
  );

  const createFanPost = useCallback(async (fanPostData: any) => {
    return protectedApiCall(
      () => protectedApiService.fanPosts.create(fanPostData),
      { feature: 'fan_posts_create', endpoint: 'fan_posts' }
    );
  }, []);

  return {
    list: listHook,
    createFanPost
  };
}

export function useGifts() {
  const receivedHook = useProtectedApi(
    protectedApiService.gifts.getReceived,
    { feature: 'gifts_received', endpoint: 'gifts' }
  );

  const transactionsHook = useProtectedApi(
    protectedApiService.gifts.getTransactions,
    { feature: 'gifts_management', endpoint: 'gift_transactions' }
  );

  return {
    received: receivedHook,
    transactions: transactionsHook
  };
}

export function useBookings() {
  const listHook = useProtectedApi(
    protectedApiService.bookings.list,
    { feature: 'booking_management', endpoint: 'bookings' }
  );

  const createBooking = useCallback(async (bookingData: any) => {
    return protectedApiCall(
      () => protectedApiService.bookings.create(bookingData),
      { feature: 'online_bookings', endpoint: 'bookings' }
    );
  }, []);

  return {
    list: listHook,
    createBooking
  };
}

export function useCredits() {
  const balanceHook = useProtectedApi(
    protectedApiService.credits.getBalance,
    { feature: 'dk_credits', endpoint: 'dk_credits' }
  );

  const transactionsHook = useProtectedApi(
    protectedApiService.credits.getTransactions,
    { feature: 'dk_credits', endpoint: 'credit_transactions' }
  );

  return {
    balance: balanceHook,
    transactions: transactionsHook
  };
}

/**
 * Hook for checking membership access without making API calls
 */
export function useMembershipCheck() {
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);

  const checkAccess = useCallback(async (feature: string): Promise<boolean> => {
    if (!user) return false;
    
    setChecking(true);
    try {
      // This is a lightweight check that doesn't require actual API calls
      const result = await protectedApiCall(
        async () => ({ data: true, error: null }),
        { feature, requireAuth: true }
      );
      
      return !result.error;
    } catch (error) {
      return false;
    } finally {
      setChecking(false);
    }
  }, [user]);

  return {
    checkAccess,
    checking
  };
}

export default useProtectedApi; 