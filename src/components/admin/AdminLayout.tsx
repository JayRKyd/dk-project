import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { getQuickStats } from '../../services/adminVerificationService';
import { 
  Shield, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Home,
  Loader2
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface VerificationStats {
  pending: number;
  verified: number;
  rejected: number;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<VerificationStats>({ pending: 0, verified: 0, rejected: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const verificationStats = await getQuickStats();
        setStats(verificationStats);
      } catch (error) {
        console.error('Error fetching verification stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      current: location.pathname === '/admin'
    },
    {
      name: 'Verification Queue',
      href: '/admin/verifications',
      icon: CheckCircle,
      current: location.pathname === '/admin/verifications'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname === '/admin/analytics'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    }
  ];

  // If there's a profile error, show an error message
  if (profileError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-800">Error Loading Profile</h2>
          <p className="text-red-600 mt-2">{profileError.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Shield className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">DateKelly Platform Management</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                {profileLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">{profile?.username || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      item.current
                        ? 'bg-pink-50 text-pink-700 border border-pink-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${item.current ? 'text-pink-500' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Stats in Sidebar */}
          <div className="p-4 border-t border-gray-200 mt-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              {statsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Verified</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.verified}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">Rejected</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stats.rejected}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}; 