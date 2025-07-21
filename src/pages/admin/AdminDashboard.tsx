import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { getVerificationStats, getVerificationQueue } from '../../services/adminVerificationService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Shield,
  ChevronRight,
  Image,
  MessageSquare,
  DollarSign
} from 'lucide-react';

interface DashboardStats {
  ladies: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    unsubmitted: number;
  };
  clubs: {
    total: number;
    verified: number;
    pending: number;
    rejected: number;
    unsubmitted: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, queueData] = await Promise.all([
          getVerificationStats(),
          getVerificationQueue()
        ]);
        
        setStats(statsData);
        setQueueCount(queueData.length);
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">
              Monitor platform activity and manage user verifications
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              to="/admin/verifications"
              className="bg-pink-50 border border-pink-200 rounded-xl p-6 hover:bg-pink-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-pink-900">Verification Queue</h3>
                  <p className="text-pink-700 mt-1">{queueCount} pending reviews</p>
                </div>
                <div className="p-3 bg-pink-200 rounded-lg group-hover:bg-pink-300 transition-colors">
                  <Clock className="h-6 w-6 text-pink-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-blue-50 border border-blue-200 rounded-xl p-6 hover:bg-blue-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">User Management</h3>
                  <p className="text-blue-700 mt-1">Manage user accounts</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/media"
              className="bg-purple-50 border border-purple-200 rounded-xl p-6 hover:bg-purple-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Media Moderation</h3>
                  <p className="text-purple-700 mt-1">Review photos & videos</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg group-hover:bg-purple-300 transition-colors">
                  <Image className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/comments"
              className="bg-green-50 border border-green-200 rounded-xl p-6 hover:bg-green-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">Comment Moderation</h3>
                  <p className="text-green-700 mt-1">Review user comments</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/financial"
              className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 hover:bg-yellow-100 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900">Financial Dashboard</h3>
                  <p className="text-yellow-700 mt-1">Track revenue & transactions</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg group-hover:bg-yellow-300 transition-colors">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lady Verification Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Lady Verifications</h2>
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">Total Ladies</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats?.ladies.total || 0}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700">Verified</span>
                    </div>
                    <span className="font-semibold text-green-900">{stats?.ladies.verified || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700">Pending</span>
                    </div>
                    <span className="font-semibold text-yellow-900">{stats?.ladies.pending || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Rejected</span>
                    </div>
                    <span className="font-semibold text-red-900">{stats?.ladies.rejected || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Not Started</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats?.ladies.unsubmitted || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Club Verification Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Club Verifications</h2>
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700">Total Clubs</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats?.clubs.total || 0}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700">Verified</span>
                    </div>
                    <span className="font-semibold text-green-900">{stats?.clubs.verified || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700">Pending</span>
                    </div>
                    <span className="font-semibold text-yellow-900">{stats?.clubs.pending || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">Rejected</span>
                    </div>
                    <span className="font-semibold text-red-900">{stats?.clubs.rejected || 0}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Not Started</span>
                    </div>
                    <span className="font-semibold text-gray-900">{stats?.clubs.unsubmitted || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access to Priority Items */}
          {queueCount > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Priority Actions</h2>
                <Link 
                  to="/admin/verifications"
                  className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 font-medium"
                >
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">
                      {queueCount} verification{queueCount !== 1 ? 's' : ''} awaiting review
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      Some verifications may be time-sensitive. Review them promptly to maintain user satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
} 