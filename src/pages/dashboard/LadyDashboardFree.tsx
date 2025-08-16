import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { FeatureGate } from '../../components/auth/FeatureGate';
import { 
  Heart, 
  Settings,
  Star, 
  MessageCircle, 
  Gift, 
  Camera, 
  DollarSign, 
  Calendar, 
  Clock,
  Eye,
  Bell,
  ArrowUp,
  Coins,
  Shield,
  AlertCircle,
  Loader,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
// import { supabase } from '../../lib/supabase';
// import { uploadImage } from '../../services/imageService';
import { getProfileStats, getRecentActivities, getProfileCompletion, Activity } from '../../services/profileStatsService';
import { notificationsService, NotificationItem } from '../../services/notificationsService';
import { getAdvertisementStatus, bumpAdvertisement, formatTimeUntilExpiry, AdvertisementStatus } from '../../services/advertisementService';
import { getUpcomingBookings, getBookingStats, Booking } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardState {
  membershipTier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';
  stats: {
    profileViews: number;
    profileViewsChange: number;
    loves: number;
    lovesChange: number;
    reviews: number;
    reviewsChange: number;
    giftsReceived: number;
    giftsReceivedChange: number;
    gifts: number;
    earnings: number;
    nextBookings: number;
  };
  upcomingBookings: Booking[];
  recentActivities: Activity[];
  notifications: (NotificationItem & { is_read?: boolean })[];
  profileCompletion: {
    completionPercentage: number;
    missingItems: string[];
    detailedSuggestions: string[];
    profileStrength: string;
    prioritizedMissingItems: string[];
  };
  advertisementStatus: AdvertisementStatus | undefined | null;
  credits: number;
  loading: {
    profile: boolean;
    stats: boolean;
    bookings: boolean;
    activities: boolean;
    notifications: boolean;
    profileCompletion: boolean;
    advertisementStatus: boolean;
    bumpOperation: boolean;
  };
  bumpMessage: {
    text: string;
    type: 'success' | 'error' | 'info' | null;
  };
}

export default function LadyDashboardFree() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const { user } = useAuth();
  
  const [dashboardData, setDashboardData] = useState<DashboardState>({
    membershipTier: 'FREE',
    stats: {
      profileViews: 0,
      profileViewsChange: 0,
      loves: 0,
      lovesChange: 0,
      reviews: 0,
      reviewsChange: 0,
      giftsReceived: 0,
      giftsReceivedChange: 0,
      gifts: 0,
      earnings: 0,
      nextBookings: 0
    },
    upcomingBookings: [],
    recentActivities: [],
    notifications: [],
    profileCompletion: {
      completionPercentage: 0,
      missingItems: [],
      detailedSuggestions: [],
      profileStrength: 'Weak',
      prioritizedMissingItems: []
    },
    advertisementStatus: undefined,
    credits: 0,
    loading: {
      profile: true,
      stats: true,
      bookings: true,
      activities: true,
      notifications: true,
      profileCompletion: true,
      advertisementStatus: true,
      bumpOperation: false
    },
    bumpMessage: {
      text: '',
      type: null
    }
  });

  // Redirect if not a lady
  useEffect(() => {
    if (profile && profile.role !== 'lady') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Ensure the avatar spinner stops once profile state has finished loading
  useEffect(() => {
    if (!profileLoading) {
      setDashboardData(prev => ({
        ...prev,
        loading: { ...prev.loading, profile: false },
      }));
    }
  }, [profileLoading]);

  // Load profile stats
  useEffect(() => {
    if (!profile) return;

    const fetchProfileStats = async () => {
      try {
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, stats: true }
        }));

        const stats = await getProfileStats(profile.id);
        const bookingStats = await getBookingStats(profile.id);
        
        setDashboardData(prev => ({
          ...prev,
          stats: {
            profileViews: stats.profileViews,
            profileViewsChange: stats.profileViewsChange,
            loves: stats.loves,
            lovesChange: stats.lovesChange,
            reviews: stats.reviews,
            reviewsChange: stats.reviewsChange,
            giftsReceived: stats.giftsReceived,
            giftsReceivedChange: stats.giftsReceivedChange,
            gifts: stats.gifts,
            earnings: bookingStats.earnings,
            nextBookings: bookingStats.nextBookings
          },
          loading: { ...prev.loading, stats: false }
        }));
      } catch (error) {
        console.error('Error fetching profile stats:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, stats: false }
        }));
      }
    };

    fetchProfileStats();
  }, [profile]);

  // Load upcoming bookings
  useEffect(() => {
    if (!profile) return;

    const fetchUpcomingBookings = async () => {
      try {
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, bookings: true }
        }));

        const bookings = await getUpcomingBookings(profile.id, 3);
        
        setDashboardData(prev => ({
          ...prev,
          upcomingBookings: bookings,
          loading: { ...prev.loading, bookings: false }
        }));
      } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, bookings: false }
        }));
      }
    };

    fetchUpcomingBookings();
  }, [profile]);

  // Load recent activities
  useEffect(() => {
    if (!profile) return;

    const fetchRecentActivities = async () => {
      try {
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, activities: true }
        }));

        const activities = await getRecentActivities(profile.id, 5);
        
        setDashboardData(prev => ({
          ...prev,
          recentActivities: activities,
          loading: { ...prev.loading, activities: false }
        }));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, activities: false }
        }));
      }
    };

    fetchRecentActivities();
  }, [profile]);

  // Load notifications
  useEffect(() => {
    if (!profile) return;

    const fetchNotifications = async () => {
      try {
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, notifications: true }
        }));

        const notifications = await notificationsService.list(profile.id, 3);
        
        setDashboardData(prev => ({
          ...prev,
          notifications,
          loading: { ...prev.loading, notifications: false }
        }));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, notifications: false }
        }));
      }
    };

    fetchNotifications();
  }, [profile]);

  // Load profile completion
  useEffect(() => {
    if (!profile) return;

    const fetchProfileCompletion = async () => {
      try {
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, profileCompletion: true }
        }));
        
        const completion = await getProfileCompletion(profile.id);
        
        setDashboardData(prev => ({
          ...prev,
          profileCompletion: completion,
          loading: { ...prev.loading, profileCompletion: false }
        }));
      } catch (error) {
        console.error('Error fetching profile completion:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, profileCompletion: false }
        }));
      }
    };

    fetchProfileCompletion();
  }, [profile]);

  // Load membership tier and credits
  useEffect(() => {
    if (!profile) return;

    setDashboardData(prev => ({
      ...prev,
      membershipTier: (profile.membership_tier as any) || 'FREE',
      credits: profile.credits || 0
    }));
  }, [profile]);
  
  // Load advertisement status
  useEffect(() => {
    if (!profile) return;
    
    const fetchAdvertisementStatus = async () => {
      try {
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, advertisementStatus: true }
        }));
        
        const status = await getAdvertisementStatus(profile.id);
        
        setDashboardData(prev => ({
          ...prev,
          advertisementStatus: status,
          loading: { ...prev.loading, advertisementStatus: false }
        }));
      } catch (error) {
        console.error('Error fetching advertisement status:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: { ...prev.loading, advertisementStatus: false }
        }));
      }
    };
    
    fetchAdvertisementStatus();
  }, [profile]);

  // Handle profile picture upload (legacy no-op; avatar managed in settings)
  // Removed profile picture upload handler from this page

  // Format date for display
  const formatBookingDate = (dateStr: string) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    const bookingDate = new Date(dateStr);
    
    if (bookingDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return bookingDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };
  
  // Handle advertisement bump
  const handleBumpAdvertisement = async (bumpType: 'free' | 'paid' | 'credit' = 'free', creditsUsed: number = 0) => {
    if (!profile) return;
    
    try {
      setDashboardData(prev => ({
        ...prev,
        loading: { ...prev.loading, bumpOperation: true },
        bumpMessage: { text: '', type: null }
      }));
      
      const result = await bumpAdvertisement(profile.id, bumpType, creditsUsed);
      
      setDashboardData(prev => ({
        ...prev,
        loading: { ...prev.loading, bumpOperation: false },
        bumpMessage: { 
          text: result.message, 
          type: result.success ? 'success' : 'error' 
        },
        advertisementStatus: result.newStatus || prev.advertisementStatus,
        credits: bumpType === 'credit' && result.success ? 
                prev.credits - creditsUsed : 
                prev.credits
      }));
      
      // Refresh advertisement status after a short delay
      setTimeout(async () => {
        const updatedStatus = await getAdvertisementStatus(profile.id);
        setDashboardData(prev => ({
          ...prev,
          advertisementStatus: updatedStatus
        }));
      }, 2000);
      
    } catch (error) {
      console.error('Error bumping advertisement:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: { ...prev.loading, bumpOperation: false },
        bumpMessage: { 
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          type: 'error' 
        }
      }));
    }
  };

  // Format time ago for activities
  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const activityDate = new Date(dateStr);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-pink-500 animate-spin" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden">
              {dashboardData.loading.profile ? (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <Loader className="h-8 w-8 text-pink-500 animate-spin" />
                </div>
              ) : (
                <img 
                  src={(profile?.image_url || user?.user_metadata?.image_url) ? `${(profile?.image_url || user?.user_metadata?.image_url)}?t=${Date.now()}` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">Upload Photo</text></svg>'} 
                  alt="Profile" 
                  className="h-full w-full object-cover profile-img"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="%236b7280" text-anchor="middle" dominant-baseline="middle">Upload Photo</text></svg>';
                  }}
                />
              )}
            </div>
            {/* Avatar upload removed; profile picture managed in settings */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.name || profile?.username || 'Lady'}!</h1>
            <p className="text-gray-500">
              {profile?.membership_tier || 'Free'} Account · Member since {profile?.created_at ? 
                new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 
                new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Link to={`/ladies/${profile?.id}`} className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              <Eye className="h-4 w-4" />
              View my Advertisement
            </Link>
            <Link to="/dashboard/lady/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-4 w-4" />
              Advertisement Settings
            </Link>
            <Link to="/dashboard/lady/verify" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Shield className="h-4 w-4" />
              Verify my Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Reminder Banner for Unverified Users */}
      {profile?.verification_status !== 'verified' && !profile?.verification_submitted_at && (
        <div className="mb-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Get Verified & Boost Your Profile!</h3>
                <p className="text-pink-100">
                  Verified profiles get 175% more client interest and unlock premium features
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/verification"
                className="bg-white text-pink-600 px-6 py-3 rounded-lg font-medium hover:bg-pink-50 transition-colors"
              >
                Verify Now
              </Link>
              <button
                onClick={() => {
                  localStorage.setItem('verification_reminder_dismissed', new Date().toISOString());
                  // Hide banner for 24 hours
                }}
                className="bg-white bg-opacity-20 text-white px-4 py-3 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats Grid */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Profile Views</h3>
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {dashboardData.loading.stats ? (
                    <Loader className="h-5 w-5 text-pink-500 animate-spin" />
                  ) : (
                    dashboardData.stats.profileViews.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {dashboardData.stats.profileViewsChange > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{dashboardData.stats.profileViewsChange}%</span>
                    </>
                  ) : dashboardData.stats.profileViewsChange < 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-red-500 transform rotate-180" />
                      <span className="text-red-500">{Math.abs(dashboardData.stats.profileViewsChange)}%</span>
                    </>
                  ) : (
                    <span>0%</span>
                  )}
                  {' vs last week'}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Loves</h3>
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {dashboardData.loading.stats ? (
                    <Loader className="h-5 w-5 text-pink-500 animate-spin" />
                  ) : (
                    dashboardData.stats.loves.toLocaleString()
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {dashboardData.stats.lovesChange > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{dashboardData.stats.lovesChange}%</span>
                    </>
                  ) : dashboardData.stats.lovesChange < 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-red-500 transform rotate-180" />
                      <span className="text-red-500">{Math.abs(dashboardData.stats.lovesChange)}%</span>
                    </>
                  ) : (
                    <span>0%</span>
                  )}
                  {' vs last week'}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Reviews</h3>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {dashboardData.loading.stats ? (
                    <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    dashboardData.stats.reviews
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {dashboardData.stats.reviewsChange > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{dashboardData.stats.reviewsChange}%</span>
                    </>
                  ) : dashboardData.stats.reviewsChange < 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-red-500 transform rotate-180" />
                      <span className="text-red-500">{Math.abs(dashboardData.stats.reviewsChange)}%</span>
                    </>
                  ) : (
                    <span>0%</span>
                  )}
                  {' vs last week'}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Gifts Received</h3>
                <Gift className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {dashboardData.loading.stats ? (
                    <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    dashboardData.stats.giftsReceived
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {dashboardData.stats.giftsReceivedChange > 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{dashboardData.stats.giftsReceivedChange}%</span>
                    </>
                  ) : dashboardData.stats.giftsReceivedChange < 0 ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-red-500 transform rotate-180" />
                      <span className="text-red-500">{Math.abs(dashboardData.stats.giftsReceivedChange)}%</span>
                    </>
                  ) : (
                    <span>0%</span>
                  )}
                  {' vs last week'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membership Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Membership Status</h2>
                <p className="text-gray-600 mt-1">Your current membership tier and status</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-full">
                <Star className="h-5 w-5" />
                <span className="font-medium">{dashboardData.membershipTier}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Advertisement Status (summary) */}
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Advertisement Status</span>
                  <span
                    className={`font-bold ${
                      dashboardData.advertisementStatus?.ad_status === 'active'
                        ? 'text-green-600'
                        : dashboardData.advertisementStatus?.ad_status === 'bumped'
                        ? 'text-blue-600'
                        : dashboardData.advertisementStatus?.ad_status === 'inactive'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {dashboardData.advertisementStatus?.ad_status
                      ? dashboardData.advertisementStatus.ad_status.charAt(0).toUpperCase() +
                        dashboardData.advertisementStatus.ad_status.slice(1)
                      : 'Unknown'}
                  </span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: `${dashboardData.advertisementStatus?.ad_status === 'expired' ? 0 : 65}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {dashboardData.advertisementStatus
                    ? `${formatTimeUntilExpiry(dashboardData.advertisementStatus)} remaining until your ${dashboardData.membershipTier} advertisement expires`
                    : 'Loading status...'}
                </p>
              </div>

              {/* Limitations Notice */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold text-gray-700">FREE Tier Limitations</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• No Fan Posts</li>
                  <li>• Limited visibility in search</li>
                  <li>• Basic profile features only</li>
                  <li>• Advertisement expires in 90 days</li>
                </ul>
              </div>
            </div>

            {/* Advertisement Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Advertisement Status</h2>
                {dashboardData.advertisementStatus?.ad_status === 'expired' && (
                  <Link 
                    to="/dashboard/lady/upgrade"
                    className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    Renew Now
                  </Link>
                )}
              </div>
              
              {dashboardData.loading.advertisementStatus ? (
                <div className="flex justify-center py-4">
                  <Loader className="h-6 w-6 text-pink-500 animate-spin" />
                </div>
              ) : (
                <div>
                  {/* Status indicator */}
                  <div className="flex items-center mb-4">
                    <div className={`h-3 w-3 rounded-full mr-2 ${dashboardData.advertisementStatus?.ad_status === 'active' ? 'bg-green-500' : 
                      dashboardData.advertisementStatus?.ad_status === 'bumped' ? 'bg-blue-500' : 
                      dashboardData.advertisementStatus?.ad_status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      Status: {dashboardData.advertisementStatus?.ad_status === 'active' ? 'Active' : 
                      dashboardData.advertisementStatus?.ad_status === 'bumped' ? 'Bumped (Featured)' : 
                      dashboardData.advertisementStatus?.ad_status === 'inactive' ? 'Inactive' : 'Expired'}
                    </span>
                  </div>
                  
                  {/* Expiry countdown */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Expires in:</div>
                    <div className="text-lg font-bold text-gray-900">
                      {dashboardData.advertisementStatus ? 
                        formatTimeUntilExpiry(dashboardData.advertisementStatus) : 
                        'Unknown'}
                    </div>
                  </div>
                  
                  {/* Membership tier info */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Membership Tier:</div>
                    <div className="text-base font-medium text-gray-900">
                      {dashboardData.membershipTier} 
                      {dashboardData.membershipTier !== 'FREE' && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Premium</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Bump info */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Remaining Free Bumps:</div>
                    <div className="text-base font-medium text-gray-900">
                      {dashboardData.advertisementStatus?.remaining_free_bumps || 0} this month
                    </div>
                  </div>
                  
                  {/* Bump action buttons */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <button
                      onClick={() => handleBumpAdvertisement('free')}
                      disabled={dashboardData.loading.bumpOperation || (dashboardData.advertisementStatus?.remaining_free_bumps || 0) <= 0}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${(dashboardData.advertisementStatus?.remaining_free_bumps || 0) <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      {dashboardData.loading.bumpOperation ? (
                        <Loader className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                      <span>Free Bump</span>
                    </button>
                    
                    <button
                      onClick={() => handleBumpAdvertisement('credit', 5)}
                      disabled={dashboardData.loading.bumpOperation || (dashboardData.credits || 0) < 5}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${(dashboardData.credits || 0) < 5 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-pink-500 text-white hover:bg-pink-600'}`}
                    >
                      {dashboardData.loading.bumpOperation ? (
                        <Loader className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <Coins className="h-4 w-4" />
                      )}
                      <span>Use 5 Credits</span>
                    </button>
                    
                    <Link
                      to="/dashboard/lady/bump"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Premium Bump</span>
                    </Link>
                  </div>
                  
                  {/* Bump message */}
                  {dashboardData.bumpMessage.text && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${dashboardData.bumpMessage.type === 'success' ? 'bg-green-50 text-green-800' : 
                      dashboardData.bumpMessage.type === 'error' ? 'bg-red-50 text-red-800' : 
                      'bg-blue-50 text-blue-800'}`}>
                      {dashboardData.bumpMessage.text}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Want to unlock all features?
              </div>
              <div className="flex gap-4">
                <Link
                  to="/dashboard/lady/upgrade"
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  <span>Upgrade to PRO</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Bookings</h2>
              <Link 
                to="/dashboard/lady/bookings"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.loading.bookings ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 text-pink-500 animate-spin" />
                </div>
              ) : dashboardData.upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming bookings
                </div>
              ) : dashboardData.upcomingBookings.map((booking, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-pink-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{booking.client?.username || 'Client'}</div>
                      <div className="text-sm text-gray-500">
                        {formatBookingDate(booking.date)} • {booking.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">€{booking.total_cost}</div>
                    <div className="text-sm text-gray-500">{booking.duration}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Profile Completion</h2>
              <Link 
                to="/dashboard/lady/settings"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                Complete Profile
              </Link>
            </div>
            
            {dashboardData.loading.profileCompletion ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 text-pink-500 animate-spin" />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-500">
                    Profile Strength: <span className={`font-bold ${dashboardData.profileCompletion.profileStrength === 'Excellent' ? 'text-green-500' : 
                      dashboardData.profileCompletion.profileStrength === 'Good' ? 'text-blue-500' : 
                      dashboardData.profileCompletion.profileStrength === 'Average' ? 'text-yellow-500' : 'text-red-500'}`}>
                      {dashboardData.profileCompletion.profileStrength}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {dashboardData.profileCompletion.completionPercentage}% Complete
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full ${dashboardData.profileCompletion.completionPercentage >= 80 ? 'bg-green-500' : 
                      dashboardData.profileCompletion.completionPercentage >= 60 ? 'bg-blue-500' : 
                      dashboardData.profileCompletion.completionPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${dashboardData.profileCompletion.completionPercentage}%` }}
                  ></div>
                </div>
                
                {/* Missing items */}
                {dashboardData.profileCompletion.missingItems.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Complete these items to improve your profile:</h3>
                    <div className="space-y-2">
                      {dashboardData.profileCompletion.missingItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                      {dashboardData.profileCompletion.missingItems.length > 3 && (
                        <Link 
                          to="/dashboard/lady/settings"
                          className="flex items-center justify-center gap-1 text-sm text-pink-500 hover:text-pink-600 mt-2"
                        >
                          <span>View {dashboardData.profileCompletion.missingItems.length - 3} more items</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Detailed suggestions */}
                {dashboardData.profileCompletion.detailedSuggestions && dashboardData.profileCompletion.detailedSuggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Profile improvement tips:</h3>
                    <div className="space-y-2">
                      {dashboardData.profileCompletion.detailedSuggestions.slice(0, 2).map((suggestion: string, index: number) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Benefits of complete profile */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600 italic">
                    Profiles with 80%+ completion get up to 5x more views and bookings!
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link 
                to="/dashboard/lady/activity"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.loading.activities ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 text-pink-500 animate-spin" />
                </div>
              ) : dashboardData.recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              ) : dashboardData.recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-pink-100 p-3 rounded-lg">
                      {activity.type === 'view' && <Eye className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'love' && <Heart className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'message' && <MessageCircle className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'gift' && <Gift className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'review' && <Star className="h-6 w-6 text-pink-500" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.user?.username || 'Someone'}{' '}
                        {activity.type === 'view' && 'viewed your profile'}
                        {activity.type === 'love' && 'loved your profile'}
                        {activity.type === 'message' && 'sent you a message'}
                        {activity.type === 'gift' && 'sent you a gift'}
                        {activity.type === 'review' && 'left a review'}
                      </div>
                      <div className="text-sm text-gray-500">{formatTimeAgo(activity.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* DK Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">DK Credits</h2>
              <Coins className="h-5 w-5 text-pink-500" />
            </div>
            <div className="bg-pink-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Available Credits</span>
                <span className="text-2xl font-bold text-pink-500">{dashboardData.credits}</span>
              </div>
              <div className="text-sm text-gray-500">
                Use credits to unlock fan posts and send gifts
              </div>
            </div>
            <Link
              to="/dashboard/lady/credits"
              className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="h-5 w-5" />
              <span>Buy More Credits</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/dashboard/lady/upgrade"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Star className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Upgrade to PRO</span>
              </Link>
              <FeatureGate requiresVerification={true} feature="Bump Advertisement">
                <Link
                  to="/dashboard/lady/bump"
                  className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <ArrowUp className="h-6 w-6 text-pink-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900 text-center">Bump Advertisement</span>
                </Link>
              </FeatureGate>
              <Link
                to="/dashboard/lady/account"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Settings className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Account Settings</span>
              </Link>
              <Link
                to="/dashboard/lady/settings"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Settings className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Advertisement Settings</span>
              </Link>
             <Link
               to="/dashboard/lady/reviews"
               className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
             >
               <Star className="h-6 w-6 text-pink-500 mb-2" />
               <span className="text-sm font-medium text-gray-900 text-center">Reviews</span>
             </Link>
            </div>
          </div>

          {/* PRO/ULTRA Only Features */}
          <FeatureGate requiresVerification={true} feature="Premium Features">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-pink-500" />
                <h2 className="text-lg font-bold text-gray-900">PRO / ULTRA Only</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg cursor-not-allowed">
                  <Gift className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-400 text-center">Gifts Received</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg cursor-not-allowed">
                  <DollarSign className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-400 text-center">Fan Posts Earnings</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg cursor-not-allowed">
                  <Clock className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-400 text-center">Online Bookings</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg cursor-not-allowed">
                  <Camera className="h-6 w-6 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-400 text-center">Fan Posts</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  Upgrade to PRO to unlock all features and earn more!{' '}
                  <Link to="/dashboard/lady/upgrade" className="text-pink-500 hover:text-pink-600 font-medium">
                    Learn More
                  </Link>
                </p>
              </div>
            </div>
          </FeatureGate>

          {/* Profile Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="text-gray-900 font-medium">{dashboardData.profileCompletion.completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${dashboardData.profileCompletion.completionPercentage}%` }}></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Missing Items:</h3>
                {dashboardData.loading.profile ? (
                  <div className="flex justify-center py-4">
                    <Loader className="h-5 w-5 text-pink-500 animate-spin" />
                  </div>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-600">
                    {dashboardData.profileCompletion.missingItems.length > 0 ? (
                      dashboardData.profileCompletion.missingItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-green-600">Your profile is complete!</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                {dashboardData.notifications.filter(n => !n.is_read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {dashboardData.notifications.filter(n => !n.is_read).length}
                  </span>
                )}
              </div>
            </div>
            {dashboardData.loading.notifications ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 text-pink-500 animate-spin" />
              </div>
            ) : dashboardData.notifications.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.notifications.slice(0, 3).map((notification) => {
                  let icon, bgColor, iconColor;
                  switch (notification.type as any) {
                    case 'gift':
                      icon = <Gift className="h-5 w-5 text-pink-500" />;
                      bgColor = notification.is_read ? 'bg-pink-50' : 'bg-pink-100';
                      iconColor = 'bg-pink-200';
                      break;
                    case 'message':
                      icon = <MessageCircle className="h-5 w-5 text-blue-500" />;
                      bgColor = notification.is_read ? 'bg-blue-50' : 'bg-blue-100';
                      iconColor = 'bg-blue-200';
                      break;
                    case 'review':
                      icon = <Star className="h-5 w-5 text-yellow-500" />;
                      bgColor = notification.is_read ? 'bg-yellow-50' : 'bg-yellow-100';
                      iconColor = 'bg-yellow-200';
                      break;
                    case 'love':
                      icon = <Heart className="h-5 w-5 text-red-500" />;
                      bgColor = notification.is_read ? 'bg-red-50' : 'bg-red-100';
                      iconColor = 'bg-red-200';
                      break;
                    case 'booking':
                      icon = <Calendar className="h-5 w-5 text-purple-500" />;
                      bgColor = notification.is_read ? 'bg-purple-50' : 'bg-purple-100';
                      iconColor = 'bg-purple-200';
                      break;
                    case 'view':
                    default:
                      icon = <Eye className="h-5 w-5 text-green-500" />;
                      bgColor = notification.is_read ? 'bg-green-50' : 'bg-green-100';
                      iconColor = 'bg-green-200';
                      break;
                  }
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`flex items-center gap-4 p-3 ${bgColor} rounded-lg cursor-pointer transition-colors hover:opacity-80`}
                      onClick={async () => {
                        if (!notification.is_read) {
                          await notificationsService.markRead(notification.id);
                          setDashboardData(prev => ({
                            ...prev,
                            notifications: prev.notifications.map(n => 
                              n.id === notification.id ? { ...n, is_read: true } : n
                            )
                          }));
                        }
                      }}
                    >
                      <div className={`${iconColor} p-2 rounded-lg`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.type === 'view' && 'Profile viewed'}
                          {notification.type === 'love' && 'New love received'}
                          {notification.type === 'message' && 'New message'}
                          {notification.type === 'gift' && 'New gift received'}
                          {notification.type === 'review' && 'New review received'}
                          {notification.type === 'booking' && 'New booking request'}
                        </p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                      )}
                    </div>
                  );
                })}
                <div className="pt-2 text-center">
                  <Link 
                    to="/dashboard/lady/notifications"
                    className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No notifications</p>
              </div>
            )}
          </div>

          {/* Development Test Interface removed for production */}
        </div>
      </div>
    </div>
  );
}