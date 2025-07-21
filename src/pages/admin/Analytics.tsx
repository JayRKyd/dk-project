import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { getAnalyticsData, AnalyticsData } from '../../services/analyticsService';
import { 
  Users, 
  Calendar, 
  Star, 
  Gift, 
  FileText, 
  Shield,
  TrendingUp,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';

const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data...');
      const analyticsData = await getAnalyticsData();
      console.log('Analytics data received:', analyticsData);
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Don't use fallback data, show error instead
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  if (!data) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Failed to load analytics data</p>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Platform overview and key metrics</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalProfiles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Gift className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gifts</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalGifts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
              <div className="space-y-4">
                {data.userStats.map((stat) => (
                  <div key={stat.role} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="capitalize font-medium text-gray-700">{stat.role}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">{stat.count}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Verified</p>
                        <p className="font-semibold text-green-600">{stat.verifiedCount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Verification Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-gray-700">Verified Users</span>
                  </div>
                  <span className="font-semibold text-green-600">{data.verifiedUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <UserX className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-gray-700">Locked Users</span>
                  </div>
                  <span className="font-semibold text-red-600">{data.lockedUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-gray-700">Total Profiles</span>
                  </div>
                  <span className="font-semibold">{data.totalProfiles}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fan Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalFanPosts}</p>
                </div>
                <div className="p-2 bg-pink-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalReviews}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ladies</p>
                  <p className="text-2xl font-bold text-gray-900">{data.totalLadies}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.newUsers} new users</p>
                      <p className="text-sm text-gray-600">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default Analytics; 