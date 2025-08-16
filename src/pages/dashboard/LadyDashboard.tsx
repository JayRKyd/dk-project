import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Heart, Settings, Star, MessageCircle, Gift, Camera, DollarSign, Calendar, Clock, TrendingUp, Eye, Bell, ArrowUp, Coins, Shield } from 'lucide-react';
import { getProfileStats, getRecentActivities, getProfileCompletion } from '../../services/profileStatsService';
import { getAdvertisementStatus, formatTimeUntilExpiry } from '../../services/advertisementService';
import { getUpcomingBookings } from '../../services/bookingService';
import { giftService } from '../../services/giftService';
import { notificationsService, NotificationItem } from '../../services/notificationsService';


interface DashboardState {
  membershipTier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';
  stats: { profileViews: number; loves: number; reviews: number; giftsReceived: number };
  advertisementStatusText: string;
  adProgressPercent: number;
  upcoming: Array<{ client: string; time: string; date: string; service: string; price: string }>;
  recent: Array<{ type: 'view' | 'love' | 'message' | 'gift' | 'review'; user: string; time: string }>;
  credits: number;
  profileCompletion: { completionPercentage: number; missingItems: string[] };
  notifications: (NotificationItem & { is_read?: boolean })[];
}

export default function LadyDashboard() {
  const { profile } = useUserProfile();
  const [dashboardData, setDashboardData] = useState<DashboardState>({
    membershipTier: 'PRO',
    stats: { profileViews: 0, loves: 0, reviews: 0, giftsReceived: 0 },
    advertisementStatusText: 'Loading...',
    adProgressPercent: 0,
    upcoming: [],
    recent: [],
    credits: 0,
    profileCompletion: { completionPercentage: 0, missingItems: [] },
    notifications: [],
  });

  useEffect(() => {
    const load = async () => {
      if (!profile) return;
      const s = await getProfileStats(profile.id);
      let giftsCount = 0;
      try {
        const gifts = await giftService.getGiftsWithReplies(profile.id, 'received');
        giftsCount = gifts.length;
      } catch {}
      const ad = await getAdvertisementStatus(profile.id);
      const adText = ad ? `${formatTimeUntilExpiry(ad)} remaining` : 'Unknown';
      const adPct = ad && !ad.is_expired ? 65 : 0;
      const bookings = await getUpcomingBookings(profile.id, 3);
      const upcoming = bookings.map(b => ({
        client: b.client?.username || 'Client',
        time: `${b.time}`,
        date: new Date(b.date).toDateString() === new Date().toDateString() ? 'Today' : 'Upcoming',
        service: `${Number(b.duration) / 60} hour${Number(b.duration) > 60 ? 's' : ''}`,
        price: `€${b.total_cost}`,
      }));
      const acts = await getRecentActivities(profile.id, 5);
      const recent = acts.map(a => ({
        type: a.type,
        user: a.user?.username || 'Anonymous',
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })) as DashboardState['recent'];

      // Profile completion
      const completion = await getProfileCompletion(profile.id);

      // Notifications
      let notifications: NotificationItem[] = [];
      try {
        notifications = await notificationsService.list(profile.id, 3);
      } catch {}

      setDashboardData(prev => ({
        ...prev,
        stats: { profileViews: s.profileViews, loves: s.loves, reviews: s.reviews, giftsReceived: giftsCount },
        advertisementStatusText: adText,
        adProgressPercent: adPct,
        upcoming,
        recent,
        credits: prev.credits,
        profileCompletion: {
          completionPercentage: completion.completionPercentage,
          missingItems: completion.missingItems,
        },
        notifications,
      }));
    };
    load();
  }, [profile]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  // Static placeholders removed; values now loaded via useEffect into dashboardData

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={(profile?.image_url) || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/></svg>'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover ring-4 ring-pink-100"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Melissa!</h1>
            <p className="text-gray-600">Here's what's happening with your profile today.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to={`/ladies/${profile?.id}`}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors mb-2 sm:mb-0"
          >
            <Eye className="h-5 w-5" />
            <span>View my Advertisement</span>
          </Link>
          <Link
            to="/dashboard/lady/settings"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors mb-2 sm:mb-0"
          >
            <Settings className="h-5 w-5" />
            <span>Advertisement Settings</span>
          </Link>
          <Link
            to="/verification"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Shield className="h-5 w-5" />
            <span>Verify my Profile</span>
          </Link>
        </div>
      </div>

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
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.profileViews}</div>
                <div className="flex items-center text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>12%</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Fan Post Subscribers</h3>
                <Camera className="h-5 w-5 text-pink-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{/* PRO: add subscribers when implemented */}0</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Loves</h3>
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.loves}</div>
                <div className="flex items-center text-green-500 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>8%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Reviews</h3>
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.reviews}</div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm">Gifts Received</h3>
                <Gift className="h-5 w-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{dashboardData.stats.giftsReceived}</div>
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
              <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
                <Star className="h-5 w-5" />
                <span className="font-medium">PRO</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Membership Info */}
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Membership</span>
                  <span className="font-bold text-pink-600">{dashboardData.membershipTier}</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {/* Implement membership expiry when tiers store expiry date */}
                  Enjoy PRO features while your membership is active
                </p>
              </div>

              {/* Advertisement Status */}
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Advertisement Status</span>
                  <span className="font-bold text-green-600">{dashboardData.advertisementStatusText.includes('Expired') ? 'Expired' : 'Active'}</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${dashboardData.adProgressPercent}%` }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {dashboardData.advertisementStatusText}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                Want to extend your membership?
              </div>
              <div className="flex gap-4">
                <Link
                  to="/dashboard/lady/upgrade"
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  <span>Upgrade Membership</span>
                </Link>
                <Link
                  to="/dashboard/lady/bump"
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <ArrowUp className="h-5 w-5" />
                  <span>Bump Advertisement</span>
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
              {dashboardData.upcoming.map((booking, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-pink-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                       <div className="font-medium text-gray-900">{booking.client}</div>
                      <div className="text-sm text-gray-500">
                        {booking.date} • {booking.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{booking.price}</div>
                       <div className="text-sm text-gray-500">{booking.service}</div>
                  </div>
                </div>
              ))}
            </div>
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
              {dashboardData.recent.map((activity, index) => (
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
                        {activity.user}{' '}
                        {activity.type === 'view' && 'viewed your profile'}
                        {activity.type === 'love' && 'loved your profile'}
                        {activity.type === 'message' && 'sent you a message'}
                        {activity.type === 'gift' && 'sent you a gift'}
                        {activity.type === 'review' && 'left a review'}
                      </div>
                       <div className="text-sm text-gray-500">{activity.time}</div>
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
                <span className="text-sm font-medium text-gray-900 text-center">Upgrade Membership</span>
              </Link>
              <Link
                to="/dashboard/lady/bump"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <ArrowUp className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Bump Advertisement</span>
              </Link>
              <Link
                to="/dashboard/lady/gifts"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Gift className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Gifts Received</span>
              </Link>
              <Link
                to="/dashboard/lady/fan-earnings"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <DollarSign className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Fan Posts Earnings</span>
              </Link>
              <Link
                to="/dashboard/lady/payouts"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <DollarSign className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Payouts</span>
              </Link>
              <Link
                to="/dashboard/lady/schedule"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Clock className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Online Bookings</span>
              </Link>
              <Link
                to="/fan-posts/create"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Camera className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Create Fan Post</span>
              </Link>
              <Link
                to="/dashboard/lady/fan-posts"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Camera className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">My Fan Posts</span>
              </Link>
              <Link
                to="/dashboard/lady/reviews"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Star className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Reviews</span>
              </Link>
              <Link
                to="/dashboard/lady/settings"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Settings className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Advertisement Settings</span>
              </Link>
              <div
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Link
                  to="/dashboard/lady/account"
                  className="flex flex-col items-center justify-center w-full"
                >
                  <Settings className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Account Settings</span>
                </Link>
              </div>
            </div>
          </div>

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
                <ul className="space-y-2 text-sm text-gray-600">
                  {dashboardData.profileCompletion.missingItems.slice(0,3).map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                      {item}
                    </li>
                  ))}
                  {dashboardData.profileCompletion.missingItems.length === 0 && (
                    <li className="text-green-600">Your profile is complete!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                {dashboardData.notifications.filter(n => !n.read_at).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {dashboardData.notifications.filter(n => !n.read_at).length}
                  </span>
                )}
              </div>
            </div>
            {dashboardData.notifications.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.notifications.slice(0, 3).map((notification) => {
                  let bgColor = notification.read_at ? 'bg-gray-50' : 'bg-pink-50';
                  let icon = <Eye className="h-5 w-5 text-green-500" />;
                  if (notification.type === 'gift') icon = <Gift className="h-5 w-5 text-pink-500" />;
                  if (notification.type === 'message') icon = <MessageCircle className="h-5 w-5 text-blue-500" />;
                  if (notification.type === 'review') icon = <Star className="h-5 w-5 text-yellow-500" />;
                  if (notification.type === 'love') icon = <Heart className="h-5 w-5 text-red-500" />;
                  return (
                    <div key={notification.id} className={`flex items-center gap-4 p-3 ${bgColor} rounded-lg`}>
                      <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notification.message || notification.type}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}