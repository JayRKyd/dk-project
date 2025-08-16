import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clubService, ClubProfile, ClubStats, ClubLady, ClubBooking, ClubActivity, ClubNotification } from '../services/clubService';
import { CreditService, CreditSummary } from '../services/creditService';
import { membershipService, ClubMembership, MembershipProgress } from '../services/membershipService';
import { analyticsService, ViewAnalytics, RevenueData } from '../services/analyticsService';
import { calculateProfileCompletion, ProfileCompletionResult } from '../utils/profileCompletion';

interface ClubDashboardState {
  clubProfile: ClubProfile | null;
  stats: ClubStats | null;
  ladies: ClubLady[];
  upcomingBookings: ClubBooking[];
  recentActivity: ClubActivity[];
  notifications: ClubNotification[];
  membership: ClubMembership | null;
  membershipProgress: MembershipProgress | null;
  viewAnalytics: ViewAnalytics | null;
  revenueData: RevenueData | null;
  credits?: import('../services/creditService').UserCredits | null;
  creditSummary: CreditSummary | null;
  loading: boolean;
  errors: {
    profile?: string;
    stats?: string;
    ladies?: string;
    bookings?: string;
    activity?: string;
    notifications?: string;
    membership?: string;
    analytics?: string;
    credits?: string;
  };
}

const initialState: ClubDashboardState = {
  clubProfile: null,
  stats: null,
  ladies: [],
  upcomingBookings: [],
  recentActivity: [],
  notifications: [],
  membership: null,
  membershipProgress: null,
  viewAnalytics: null,
  revenueData: null,
  credits: null,
  creditSummary: null,
  loading: true,
  errors: {}
};

export const useClubDashboard = () => {
  const { user } = useAuth();
  const [state, setState] = useState<ClubDashboardState>(initialState);

  // Helper function to update loading state
  const setLoading = useCallback((key: string, value: boolean) => {
    setState(prev => ({
      ...prev,
      loading: value
    }));
  }, []);

  // Helper function to update error state
  const setError = useCallback((key: string, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error }
    }));
  }, []);

  // Fetch club profile
  const fetchClubProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading('profile', true);
    setError('profile', null);

    try {
      const profile = await clubService.getClubProfile(user.id);
      setState(prev => ({ 
        ...prev, 
        clubProfile: profile,
        profileCompletion: calculateProfileCompletion(profile)
      }));
    } catch (error) {
      console.error('Error fetching club profile:', error);
      setError('profile', error instanceof Error ? error.message : 'Failed to load club profile');
    } finally {
      setLoading('profile', false);
    }
  }, [user?.id, setLoading, setError]);

  // Fetch credits
  const fetchCredits = useCallback(async () => {
    if (!user?.id) return;

    setLoading('credits', true);
    setError('credits', null);

    try {
      const credits = await CreditService.getUserCredits(user.id);
      setState(prev => ({ ...prev, credits }));
    } catch (error) {
      console.error('Error fetching credits:', error);
      setError('credits', error instanceof Error ? error.message : 'Failed to load credits');
    } finally {
      setLoading('credits', false);
    }
  }, [user?.id, setLoading, setError]);

  // Fetch credit summary
  const fetchCreditSummary = useCallback(async (clubId: string) => {
    setLoading('credits', true);
    setError('credits', null);

    try {
      const creditSummary = await CreditService.getClubCreditSummary(clubId);
      setState(prev => ({ ...prev, creditSummary }));
    } catch (error) {
      console.error('Error fetching credit summary:', error);
      setError('credits', error instanceof Error ? error.message : 'Failed to load credit summary');
    } finally {
      setLoading('credits', false);
    }
  }, [setLoading, setError]);

  // Fetch membership status
  const fetchMembershipStatus = useCallback(async (clubId: string) => {
    setLoading('membership', true);
    setError('membership', null);

    try {
      const [membershipStatus, membershipProgress] = await Promise.all([
        membershipService.getCurrentMembership(clubId),
        membershipService.getMembershipProgress(clubId)
      ]);
      
      setState(prev => ({ 
        ...prev, 
        membershipStatus,
        membershipProgress 
      }));
    } catch (error) {
      console.error('Error fetching membership status:', error);
      setError('membership', error instanceof Error ? error.message : 'Failed to load membership status');
    } finally {
      setLoading('membership', false);
    }
  }, [setLoading, setError]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async (clubId: string) => {
    setLoading('analytics', true);
    setError('analytics', null);

    try {
      const [viewAnalytics, revenueData] = await Promise.all([
        analyticsService.getViewAnalytics(clubId),
        analyticsService.getRevenueData(clubId)
      ]);
      
      setState(prev => ({ 
        ...prev, 
        viewAnalytics,
        revenueData 
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('analytics', error instanceof Error ? error.message : 'Failed to load analytics');
    } finally {
      setLoading('analytics', false);
    }
  }, [setLoading, setError]);

  // Fetch club stats
  const fetchClubStats = useCallback(async (clubId: string) => {
    setLoading('stats', true);
    setError('stats', null);

    try {
      const stats = await clubService.getClubStats(clubId);
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Error fetching club stats:', error);
      setError('stats', error instanceof Error ? error.message : 'Failed to load club stats');
    } finally {
      setLoading('stats', false);
    }
  }, [setLoading, setError]);

  // Fetch club ladies
  const fetchClubLadies = useCallback(async (clubId: string) => {
    setLoading('ladies', true);
    setError('ladies', null);

    try {
      const ladies = await clubService.getClubLadies(clubId);
      setState(prev => ({ ...prev, ladies }));
    } catch (error) {
      console.error('Error fetching club ladies:', error);
      setError('ladies', error instanceof Error ? error.message : 'Failed to load club ladies');
    } finally {
      setLoading('ladies', false);
    }
  }, [setLoading, setError]);

  // Fetch upcoming bookings
  const fetchUpcomingBookings = useCallback(async (clubId: string) => {
    setLoading('bookings', true);
    setError('bookings', null);

    try {
      const bookings = await clubService.getUpcomingBookings(clubId);
      setState(prev => ({ ...prev, upcomingBookings: bookings }));
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      setError('bookings', error instanceof Error ? error.message : 'Failed to load upcoming bookings');
    } finally {
      setLoading('bookings', false);
    }
  }, [setLoading, setError]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async (clubId: string) => {
    setLoading('activity', true);
    setError('activity', null);

    try {
      const activity = await clubService.getRecentActivity(clubId);
      setState(prev => ({ ...prev, recentActivity: activity }));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      setError('activity', error instanceof Error ? error.message : 'Failed to load recent activity');
    } finally {
      setLoading('activity', false);
    }
  }, [setLoading, setError]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (clubId: string) => {
    setLoading('notifications', true);
    setError('notifications', null);

    try {
      const notifications = await clubService.getNotifications(clubId);
      setState(prev => ({ ...prev, notifications }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('notifications', error instanceof Error ? error.message : 'Failed to load notifications');
    } finally {
      setLoading('notifications', false);
    }
  }, [setLoading, setError]);

  // Fetch all data for a club
  const fetchAllClubData = useCallback(async (clubId: string) => {
    await Promise.all([
      fetchClubStats(clubId),
      fetchClubLadies(clubId),
      fetchUpcomingBookings(clubId),
      fetchRecentActivity(clubId),
      fetchNotifications(clubId),
      fetchCreditSummary(clubId),
      fetchMembershipStatus(clubId),
      fetchAnalytics(clubId),
    ]);
  }, [
    fetchClubStats, 
    fetchClubLadies, 
    fetchUpcomingBookings, 
    fetchRecentActivity, 
    fetchNotifications,
    fetchCreditSummary,
    fetchMembershipStatus,
    fetchAnalytics
  ]);

  // Credit management actions
  const spendCredits = useCallback(async (amount: number, description: string) => {
    if (!state.clubProfile?.id) return;

    try {
      await CreditService.spendCredits(state.clubProfile.id, amount, description);
      // Refresh credits
      await fetchCredits();
      await fetchCreditSummary(state.clubProfile.id);
    } catch (error) {
      console.error('Error spending credits:', error);
      throw error;
    }
  }, [state.clubProfile?.id, fetchCredits, fetchCreditSummary]);

  const addCredits = useCallback(async (amount: number, description: string) => {
    if (!state.clubProfile?.id) return;

    try {
      await CreditService.addCredits(state.clubProfile.id, amount, description);
      // Refresh credits
      await fetchCredits();
      await fetchCreditSummary(state.clubProfile.id);
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  }, [state.clubProfile?.id, fetchCredits, fetchCreditSummary]);

  // Track profile view
  const trackProfileView = useCallback(async (viewerId?: string, ipAddress?: string) => {
    if (!state.clubProfile?.id) return;

    try {
      await analyticsService.trackProfileView(
        state.clubProfile.id,
        viewerId,
        ipAddress,
        navigator.userAgent,
        document.referrer
      );
      // Refresh analytics
      await fetchAnalytics(state.clubProfile.id);
    } catch (error) {
      console.error('Error tracking profile view:', error);
    }
  }, [state.clubProfile?.id, fetchAnalytics]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await clubService.markNotificationAsRead(notificationId);
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Create club profile
  const createClubProfile = useCallback(async (clubData: Partial<ClubProfile>) => {
    if (!user?.id) return;

    setLoading('profile', true);
    setError('profile', null);

    try {
      const profile = await clubService.createClubProfile(user.id, clubData);
      setState(prev => ({ 
        ...prev, 
        clubProfile: profile,
        profileCompletion: calculateProfileCompletion(profile)
      }));
      return profile;
    } catch (error) {
      console.error('Error creating club profile:', error);
      setError('profile', error instanceof Error ? error.message : 'Failed to create club profile');
      throw error;
    } finally {
      setLoading('profile', false);
    }
  }, [user?.id, setLoading, setError]);

  // Update club profile
  const updateClubProfile = useCallback(async (updates: Partial<ClubProfile>) => {
    if (!user?.id) return;

    setLoading('profile', true);
    setError('profile', null);

    try {
      const profile = await clubService.updateClubProfile(user.id, updates);
      setState(prev => ({ 
        ...prev, 
        clubProfile: profile,
        profileCompletion: calculateProfileCompletion(profile)
      }));
      return profile;
    } catch (error) {
      console.error('Error updating club profile:', error);
      setError('profile', error instanceof Error ? error.message : 'Failed to update club profile');
      throw error;
    } finally {
      setLoading('profile', false);
    }
  }, [user?.id, setLoading, setError]);

  // Initial data loading
  useEffect(() => {
    if (user?.id) {
      fetchClubProfile();
      fetchCredits();
    }
  }, [user?.id, fetchClubProfile, fetchCredits]);

  // Load club data when club profile is available
  useEffect(() => {
    if (state.clubProfile?.id) {
      fetchAllClubData(state.clubProfile.id);
    }
  }, [state.clubProfile?.id, fetchAllClubData]);

  return {
    ...state,
    actions: {
      fetchClubProfile,
      fetchClubStats,
      fetchClubLadies,
      fetchUpcomingBookings,
      fetchRecentActivity,
      fetchNotifications,
      fetchAllClubData,
      fetchCredits,
      fetchCreditSummary,
      fetchMembershipStatus,
      fetchAnalytics,
      markNotificationAsRead,
      createClubProfile,
      updateClubProfile,
      spendCredits,
      addCredits,
      trackProfileView,
    },
  };
}; 