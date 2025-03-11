import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Heart, 
  Star, 
  MessageCircle, 
  Gift, 
  Settings, 
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
  Shield
} from 'lucide-react';

interface DashboardState {
  membershipTier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';
}

export default function ClientDashboard() {
  const stats = {
    reviews: 12,
    gifts: 8,
    bookings: 15,
    fanPosts: 25
  };

  const recentActivities = [
    { type: 'review', lady: 'Alexandra', time: '2 days ago' },
    { type: 'gift', lady: 'Melissa', time: '3 days ago' },
    { type: 'booking', lady: 'Jenny', time: '1 week ago' },
    { type: 'fanPost', lady: 'Sophia', time: '1 week ago' },
  ];

  const upcomingBookings = [
    { 
      lady: 'Alexandra',
      time: '14:00 - 15:00',
      date: 'Tomorrow',
      service: '1 hour',
      price: '€130'
    },
    {
      lady: 'Melissa',
      time: '18:00 - 19:00',
      date: 'Next Week',
      service: '2 hours',
      price: '€250'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
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
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
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
          <div className="text-2xl font-bold text-gray-900">{stats.reviews}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Gifts Sent</h3>
            <Gift className="h-5 w-5 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.gifts}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Total Bookings</h3>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.bookings}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm">Fan Posts Unlocked</h3>
            <Camera className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.fanPosts}</div>
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
                      <div className="font-medium text-gray-900">{booking.lady}</div>
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
                to="/dashboard/client/activity"
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
                      {activity.type === 'review' && <Star className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'gift' && <Gift className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'booking' && <Calendar className="h-6 w-6 text-pink-500" />}
                      {activity.type === 'fanPost' && <Camera className="h-6 w-6 text-pink-500" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.type === 'review' && `Reviewed ${activity.lady}`}
                        {activity.type === 'gift' && `Sent a gift to ${activity.lady}`}
                        {activity.type === 'booking' && `Booked ${activity.lady}`}
                        {activity.type === 'fanPost' && `Unlocked ${activity.lady}'s fan post`}
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
          <div className="bg-white rounded-xl shadow-sm p-6">
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
              <div className="flex items-center gap-4 p-3 bg-pink-50 rounded-lg">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upcoming booking tomorrow</p>
                  <p className="text-xs text-gray-500">With Alexandra at 14:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New message from Melissa</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Camera className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">New fan post from Jenny</p>
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