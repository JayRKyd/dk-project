import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Star, 
  MessageCircle, 
  Gift, 
  Settings, 
  Camera, 
  DollarSign, 
  Calendar, 
  Bell,
  Coins,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  clientDashboardService, 
  ClientStats, 
  ClientActivity, 
  Booking 
} from '../../services/clientDashboardService';
import { supabase } from '../../lib/supabase';

// Dashboard state type was unused; removed for lint clean

export default function ClientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<ClientActivity[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [inAppNotices, setInAppNotices] = useState<Array<{ id: string; type: string; title: string; message: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all dashboard data in parallel
        const [statsData, activitiesData, bookingsData] = await Promise.all([
          clientDashboardService.getClientStats(user.id),
          clientDashboardService.getRecentActivity(user.id, 5),
          clientDashboardService.getUpcomingBookings(user.id, 3)
        ]);

        setStats(statsData);
        setRecentActivities(activitiesData);
        setUpcomingBookings(bookingsData);

        // Load in-app notices (from user_notification_settings derived rules)
        try {
          const notices: Array<{ id: string; type: string; title: string; message: string }> = [];
          const { data: settings } = await supabase
            .from('user_notification_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          if (settings) {
            if (settings.booking_updates && bookingsData.length > 0) {
              const b = bookingsData[0];
              notices.push({ id: 'upcoming', type: 'booking', title: `Upcoming booking ${formatBookingDate(b.date).toLowerCase()}`, message: `With ${b.lady.name} at ${b.time}` });
            }
            if (settings.messages) {
              // Placeholder for real message alerts
            }
            if (settings.fan_posts_from_favorites) {
              // Could surface last fan-posts unlocked or fav posts updates – placeholder
            }
          }
          setInAppNotices(notices);
        } catch (_) {
          setInAppNotices([]);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-3">
            <Loader className="h-8 w-8 animate-spin text-pink-500" />
            <span className="text-lg text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-100"
            />
            <label
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <input type="file" className="hidden" accept="image/*" />
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your account.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/client/settings"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Account Settings</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Reviews Written</h3>
            <Star className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.reviewsWritten || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Gifts Sent</h3>
            <Gift className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.giftsGiven || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Total Bookings</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Fan Posts Unlocked</h3>
            <Camera className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.fanPostsUnlocked || 0}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Bookings</h2>
              <Link 
                to="/dashboard/client/bookings"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-pink-500" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{booking.lady.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatBookingDate(booking.date)} • {booking.time}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{booking.price}</div>
                      <div className="text-sm text-gray-500">{booking.service}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming bookings</p>
                  <Link 
                    to="/providers" 
                    className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                  >
                    Book your first appointment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-pink-100 p-3 rounded-lg">
                        {activity.type === 'review' && <Star className="h-6 w-6 text-pink-500" />}
                        {activity.type === 'gift' && <Gift className="h-6 w-6 text-pink-500" />}
                        {activity.type === 'booking' && <Calendar className="h-6 w-6 text-pink-500" />}
                        {activity.type === 'fanPost' && <Camera className="h-6 w-6 text-pink-500" />}
                        {activity.type === 'favorite' && <Heart className="h-6 w-6 text-pink-500" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{activity.description}</div>
                        <div className="text-sm text-gray-500">{formatRelativeTime(activity.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                  <p className="text-sm">Start exploring to see your activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* DK Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">DK Credits</h2>
              <Coins className="h-5 w-5 text-pink-500" />
            </div>
            <div className="bg-pink-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Available Credits</span>
                <span className="text-2xl font-bold text-pink-500">{stats?.creditsRemaining || 0}</span>
              </div>
              <div className="text-sm text-gray-500">
                Use credits to unlock fan posts and send gifts
              </div>
            </div>
            <Link
              to="/dashboard/client/credits"
              className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="h-5 w-5" />
              <span>Buy More Credits</span>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/dashboard/client/reviews"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Star className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">My Reviews</span>
              </Link>
              <Link
                to="/dashboard/client/gifts"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Gift className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Gifts Sent</span>
              </Link>
              <Link
                to="/dashboard/client/bookings"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Calendar className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">My Bookings</span>
              </Link>
              <Link
                to="/dashboard/client/fan-posts"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Camera className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Fan Posts</span>
              </Link>
              <Link
                to="/dashboard/client/favorites"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Heart className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">My Favorites</span>
              </Link>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {inAppNotices.find(n => n.type === 'booking') && (
                <div className="flex items-center gap-4 p-3 bg-pink-50 rounded-lg">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inAppNotices.find(n => n.type === 'booking')?.title}</p>
                    <p className="text-xs text-gray-500">{inAppNotices.find(n => n.type === 'booking')?.message}</p>
                  </div>
                </div>
              )}
              {stats && stats.creditsRemaining <= 10 && (
                <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Coins className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Low credits balance</p>
                    <p className="text-xs text-gray-500">You have {stats.creditsRemaining} credits remaining</p>
                  </div>
                </div>
              )}
              {recentActivities.length === 0 && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Welcome to DateKelly!</p>
                    <p className="text-xs text-gray-500">Your account is ready to use</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}