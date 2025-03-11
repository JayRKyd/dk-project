import React, { useState } from 'react';
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
  Building2
} from 'lucide-react';

interface DashboardState {
  membershipTier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';
}

export default function ClubDashboard() {
  const [dashboardData] = useState<DashboardState>({
    membershipTier: 'PRO'
  });

  const stats = {
    profileViews: 2358,
    loves: 245,
    reviews: 32,
    ladies: 8,
    nextBookings: 3
  };

  const recentActivities = [
    { type: 'view', user: 'John D.', time: '2 minutes ago' },
    { type: 'love', user: 'Mike R.', time: '5 minutes ago' },
    { type: 'message', user: 'David S.', time: '10 minutes ago' },
    { type: 'review', user: 'Robert K.', time: '30 minutes ago' },
  ];

  const upcomingBookings = [
    { 
      client: 'James M.',
      lady: 'Sophia',
      time: '14:00 - 15:00',
      date: 'Today',
      service: '1 hour',
      price: '€130'
    },
    {
      client: 'Michael P.',
      lady: 'Emma',
      time: '18:00 - 19:00',
      date: 'Today',
      service: '1 hour',
      price: '€130'
    },
    {
      client: 'Robert S.',
      lady: 'Isabella',
      time: '11:00 - 12:00',
      date: 'Tomorrow',
      service: '1 hour',
      price: '€130'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=150&q=80"
              alt="Profile"
              className="w-24 h-24 rounded-lg object-cover ring-4 ring-pink-100"
            />
            <label
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <input type="file" className="hidden" accept="image/*" />
              <Camera className="h-6 w-6 text-white" />
            </label>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Pink Angels Club!</h1>
            <p className="text-gray-600">Here's what's happening with your club today.</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/clubs/5"
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Profile Views</h3>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900">{stats.profileViews}</div>
            <div className="flex items-center text-green-500 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>12%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Loves</h3>
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.loves}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Reviews</h3>
            <Star className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.reviews}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Ladies</h3>
            <Users className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.ladies}</div>
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
                <span className="font-medium">PRO</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Membership Info */}
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Days Remaining</span>
                  <span className="font-bold text-pink-600">25 days</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Your PRO membership will expire on April 12, 2024
                </p>
              </div>

              {/* Advertisement Status */}
              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700">Advertisement Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
                <div className="w-full bg-pink-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {dashboardData.membershipTier === 'FREE' 
                    ? '58 days remaining until your FREE advertisement expires'
                    : 'Your advertisement will stay active while your membership is active'}
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
                to="/dashboard/club/bookings"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingBookings.map((booking, index) => (
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
                        {booking.date} • {booking.time} • {booking.lady}
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
                to="/dashboard/club/activity"
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-pink-100 p-3 rounded-lg">
                      {activity.type === 'view' && <Eye className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'love' && <Heart className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'message' && <MessageCircle className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'review' && <Star className="h-6 w-6 text-pink-500" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.user}{' '}
                        {activity.type === 'view' && 'viewed your profile'}
                        {activity.type === 'love' && 'loved your profile'}
                        {activity.type === 'message' && 'sent you a message'}
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
        <div className="space-y-6">
          {/* DK Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">DK Credits</h2>
              <Coins className="h-5 w-5 text-pink-500" />
            </div>
            <div className="bg-pink-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Available Credits</span>
                <span className="text-2xl font-bold text-pink-500">170</span>
              </div>
              <div className="text-sm text-gray-500">
                Use credits to promote your club and create special offers
              </div>
            </div>
            <Link
              to="/dashboard/club/credits"
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
                to="/dashboard/club/ladies"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Users className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Manage Ladies</span>
              </Link>
              <Link
                to="/dashboard/club/promo"
                className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Camera className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900 text-center">Create Promo</span>
              </Link>
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
                  <span className="text-gray-900 font-medium">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Missing Items:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    Add at least 2 more photos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    Complete your services list
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                    Verify your club
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-pink-50 rounded-lg">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New lady application</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">3 new messages</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New review received</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}