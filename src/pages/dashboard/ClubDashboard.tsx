import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Heart, 
  Settings,
  Star, 
  MessageCircle, 
  Camera, 
  DollarSign, 
  Calendar, 
  Clock,
  TrendingUp,
  Eye,
  Bell,
  ArrowUp,
  Coins,
  ArrowRight,
  Shield,
  Building2,
  Loader
} from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import ClubFeatureGate from '../../components/auth/ClubFeatureGate';
import { useAuth } from '../../contexts/AuthContext';
import { getClubVerificationStatus, type ClubVerificationStatus } from '../../services/clubVerificationService';

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

export default function ClubDashboard() {
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = React.useState<ClubVerificationStatus | null>(null);
  const [verificationLoading, setVerificationLoading] = React.useState(true);
  
  const { 
    clubProfile, 
    stats, 
    ladies, 
    upcomingBookings, 
    recentActivity, 
    notifications,
    credits,
    creditSummary,
    profileCompletion,
    membershipStatus,
    membershipProgress,
    viewAnalytics,
    revenueData,
    loading,
    errors,
    actions
  } = useClubDashboard();

  // Load verification status
  React.useEffect(() => {
    if (user?.id) {
      loadVerificationStatus();
    }
  }, [user?.id]);

  const loadVerificationStatus = async () => {
    if (!user?.id) return;

    try {
      const result = await getClubVerificationStatus(user.id);
      if (result.success && result.data) {
        setVerificationStatus(result.data);
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  // If no club profile exists, show creation prompt
  if (!loading.profile && !clubProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Building2 className="h-16 w-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Club Dashboard</h2>
          <p className="text-gray-600 mb-6">
            To get started, please complete your club profile setup.
          </p>
          <Link
            to="/dashboard/club/settings"
            className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Complete Club Setup</span>
          </Link>
        </div>
      </div>
    );
  }

  // Real data with fallbacks
  const displayStats = {
    profileViews: viewAnalytics?.daily_views || 0,
    loves: Math.floor((stats?.average_rating || 0) * 10),
    reviews: stats?.total_reviews || 0,
    ladies: stats?.total_ladies || 0,
    nextBookings: stats?.upcoming_bookings || 0
  };

  // Calculate advertisement status
  const isAdvertisementActive = membershipProgress ? !membershipProgress.is_expired : false;
  const advertisementStatus = isAdvertisementActive ? 'Active' : 'Inactive';
  const advertisementStatusColor = isAdvertisementActive ? 'text-green-600' : 'text-red-600';

  // Format membership expiration date
  const formatExpirationDate = (membership: any) => {
    if (!membership?.end_date) return 'No active membership';
    const date = new Date(membership.end_date);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {loading.profile ? (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <Loader className="h-8 w-8 text-pink-500 animate-spin" />
              </div>
            ) : (
              <img
                src={clubProfile?.logo_url || "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=150&q=80"}
                alt="Club Logo"
                className="w-24 h-24 rounded-lg object-cover ring-4 ring-pink-100"
              />
            )}
            <label
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <input type="file" className="hidden" accept="image/*" />
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {loading.profile ? 'Loading...' : clubProfile?.name || 'Club Owner'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your club today.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/clubs/${clubProfile?.id || '5'}`}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors mb-2 sm:mb-0"
          >
            <Eye className="h-5 w-5" />
            <span>View my Advertisement</span>
          </Link>
          <Link
            to="/dashboard/club/settings"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors mb-2 sm:mb-0"
          >
            <Settings className="h-5 w-5" />
            <span>Club Settings</span>
          </Link>
          <Link 
            to="/dashboard/club/verify"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Shield className="h-5 w-5" />
            <span>Verify Club</span>
          </Link>
        </div>
      </div>

      {/* Verification Reminder Banner */}
      {!verificationLoading && verificationStatus && verificationStatus.verification_status !== 'verified' && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {verificationStatus.verification_status === 'submitted' 
                    ? 'Verification Under Review' 
                    : verificationStatus.verification_status === 'rejected'
                    ? 'Verification Rejected'
                    : 'Complete Club Verification'
                  }
                </h3>
                <p className="text-gray-600 mb-3">
                  {verificationStatus.verification_status === 'submitted' 
                    ? 'Your club verification is being reviewed. You\'ll be notified within 24-48 hours.'
                    : verificationStatus.verification_status === 'rejected'
                    ? 'Your verification was rejected. Please review the feedback and resubmit your documents.'
                    : 'Verify your club to unlock all features, get a verified badge, and increase client trust.'
                  }
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{verificationStatus.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${verificationStatus.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to="/club-verification"
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>
                      {verificationStatus.verification_status === 'rejected' 
                        ? 'Fix Issues' 
                        : verificationStatus.verification_status === 'submitted'
                        ? 'View Status'
                        : 'Verify Now'
                      }
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DK Credits Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">DK Credits</h2>
            <p className="text-pink-100 mt-1">Use credits to boost your visibility</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {loading.credits ? (
                <Loader className="h-8 w-8 animate-spin inline" />
              ) : (
                credits
              )}
            </div>
            <p className="text-pink-100 text-sm">Available Credits</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <Link
            to="/dashboard/club/credits/buy"
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Coins className="h-5 w-5" />
            <span>Buy Credits</span>
          </Link>
          <Link
            to="/dashboard/club/credits/history"
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Clock className="h-5 w-5" />
            <span>Transaction History</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Profile Views</h3>
            <Eye className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading.analytics ? <Loader className="h-6 w-6 animate-spin" /> : displayStats.profileViews}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Loves</h3>
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading.stats ? <Loader className="h-6 w-6 animate-spin" /> : displayStats.loves}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Reviews</h3>
            <MessageCircle className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading.stats ? <Loader className="h-6 w-6 animate-spin" /> : displayStats.reviews}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Next Bookings</h3>
            <Calendar className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading.bookings ? <Loader className="h-6 w-6 animate-spin" /> : displayStats.nextBookings}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Ladies</h3>
            <Users className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {loading.stats ? <Loader className="h-6 w-6 animate-spin" /> : displayStats.ladies}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Membership Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Membership Status</h2>
                <p className="text-gray-600 mt-1">Your current membership tier and status</p>
              </div>
              <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
                <Star className="h-5 w-5" />
                <span className="font-medium">{clubProfile?.membership_tier || 'BASIC'}</span>
              </div>
            </div>
            
            {loading.membership ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-8 w-8 text-pink-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading membership status...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Membership Info */}
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Days Remaining</span>
                    <span className="font-bold text-pink-600">
                      {membershipProgress?.days_remaining || 0} days
                    </span>
                  </div>
                  <div className="w-full bg-pink-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all" 
                      style={{ width: `${membershipProgress?.percentage_remaining || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Your {clubProfile?.membership_tier || 'BASIC'} membership will expire on {formatExpirationDate(membershipStatus)}
                  </p>
                </div>

                {/* Advertisement Status */}
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Advertisement Status</span>
                    <span className={`font-bold ${advertisementStatusColor}`}>
                      {advertisementStatus}
                    </span>
                  </div>
                  <div className="w-full bg-pink-200 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all" 
                      style={{ width: `${membershipProgress?.percentage_remaining || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Your advertisement will stay active while your membership is active
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Want to extend your membership?
              </div>
              <div className="flex gap-4">
                <Link
                  to="/dashboard/club/upgrade"
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  <span>Upgrade Membership</span>
                </Link>
                <ClubFeatureGate 
                  feature="Bump Advertisement" 
                  description="Verify your club to boost your advertisement to the top of search results"
                >
                  <Link
                    to="/dashboard/club/bump"
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                  >
                    <ArrowUp className="h-5 w-5" />
                    <span>Bump Advertisement</span>
                  </Link>
                </ClubFeatureGate>
              </div>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Bookings</h2>
              <Link 
                to="/dashboard/club/bookings"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {loading.bookings ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 text-pink-500 animate-spin" />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming bookings
                </div>
              ) : (
                upcomingBookings.map((booking, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.client?.username || 'Client'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(booking.booking?.date || '')} • {booking.booking?.time} • {booking.lady?.username || 'Lady'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">€{booking.booking?.total_cost}</div>
                      <div className="text-sm text-gray-500">{booking.booking?.duration}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link 
                to="/dashboard/club/activity"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {loading.activity ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 text-pink-500 animate-spin" />
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent activity
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        {activity.activity_type === 'view' && <Eye className="h-6 w-6 text-pink-500" />}
                        {activity.activity_type === 'love' && <Heart className="h-6 w-6 text-pink-500" />}
                        {activity.activity_type === 'message' && <MessageCircle className="h-6 w-6 text-pink-500" />}
                        {activity.activity_type === 'review' && <Star className="h-6 w-6 text-pink-500" />}
                        {!['view', 'love', 'message', 'review'].includes(activity.activity_type) && <Bell className="h-6 w-6 text-pink-500" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)} activity
                        </div>
                        <div className="text-sm text-gray-500">{formatTimeAgo(activity.created_at)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/dashboard/club/ladies"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Users className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Manage Ladies</span>
              </Link>
              <ClubFeatureGate 
                feature="Create Promo" 
                description="Verify your club to create promotional content and boost visibility"
              >
                <Link
                  to="/dashboard/club/promo"
                  className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
                >
                  <Camera className="h-6 w-6 text-pink-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900 text-center">Create Promo</span>
                </Link>
              </ClubFeatureGate>
              <Link
                to="/dashboard/club/settings"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Building2 className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Club Settings</span>
              </Link>
              <Link
                to="/dashboard/club/reviews"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Star className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Reviews</span>
              </Link>
            </div>
          </div>

          {/* Profile Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="text-gray-900 font-medium">
                    {loading.profile ? (
                      <Loader className="h-4 w-4 animate-spin inline" />
                    ) : (
                      `${profileCompletion.percentage}%`
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-pink-500 h-2 rounded-full transition-all" 
                    style={{ width: `${profileCompletion.percentage}%` }}
                  ></div>
                </div>
              </div>
              
              {profileCompletion.missing_fields.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Top Priority Missing Items:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {profileCompletion.missing_fields.slice(0, 3).map((field, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          field.priority === 'high' ? 'bg-red-400' : 
                          field.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}></span>
                        <span>{field.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          field.priority === 'high' ? 'bg-red-100 text-red-600' : 
                          field.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {field.priority}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/dashboard/club/settings"
                    className="inline-flex items-center gap-2 mt-4 text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    <span>Complete Profile</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
              
              {profileCompletion.percentage === 100 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Profile Complete!</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Your club profile is fully optimized for maximum visibility.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Revenue & Analytics</h2>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            
            {loading.analytics ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 text-pink-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Revenue Summary */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Total Revenue</span>
                    <span className="font-bold text-green-600">
                      €{revenueData?.total_revenue?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Booking: €{revenueData?.booking_revenue?.toFixed(2) || '0.00'} • 
                    Commission: €{revenueData?.commission_earnings?.toFixed(2) || '0.00'}
                  </div>
                </div>

                {/* View Analytics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Daily Views</div>
                    <div className="text-lg font-bold text-blue-600">
                      {viewAnalytics?.daily_views || 0}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Monthly Views</div>
                    <div className="text-lg font-bold text-purple-600">
                      {viewAnalytics?.monthly_views || 0}
                    </div>
                  </div>
                </div>

                {/* Growth Indicator */}
                {revenueData?.growth_percentage !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className={`h-4 w-4 ${
                      revenueData.growth_percentage >= 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`font-medium ${
                      revenueData.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {revenueData.growth_percentage >= 0 ? '+' : ''}{revenueData.growth_percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-600">vs last month</span>
                  </div>
                )}

                <Link
                  to="/dashboard/club/analytics"
                  className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 text-sm font-medium"
                >
                  <span>View Detailed Analytics</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {loading.notifications ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-6 w-6 text-pink-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${
                      notification.read ? 'bg-gray-50' : 'bg-pink-50'
                    }`}
                    onClick={() => actions.markNotificationAsRead(notification.id)}
                  >
                    <div className="bg-pink-100 p-2 rounded-lg">
                      {notification.type === 'new_booking' && <Calendar className="h-5 w-5 text-pink-500" />}
                      {notification.type === 'lady_application' && <Users className="h-5 w-5 text-pink-500" />}
                      {notification.type === 'payment_received' && <DollarSign className="h-5 w-5 text-green-500" />}
                      {notification.type === 'review_received' && <Star className="h-5 w-5 text-yellow-500" />}
                      {!['new_booking', 'lady_application', 'payment_received', 'review_received'].includes(notification.type) && 
                        <Bell className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}