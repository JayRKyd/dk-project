# Admin User Management Completion Plan
**Priority**: 🟡 **MEDIUM**  
**Time Estimate**: 2-3 days  
**Status**: Basic admin exists, missing user management interface

---

## 🎯 **Current Status Assessment**

### ✅ **What's Already Complete**
- **AdminDashboard.tsx**: Overview with verification stats
- **VerificationQueue.tsx**: Document review and approval workflow
- **AdminGuard.tsx**: Authentication and role protection
- **Admin routing**: /admin routes with proper protection
- **Verification management**: Full lady/club verification system

### 🔴 **What's Missing**
- User management interface for non-verification tasks
- User search and filtering functionality
- User blocking/unblocking capabilities
- User role management
- User activity monitoring
- Content moderation tools

---

## 🚀 **Implementation Plan**

### **Phase 1: Core User Management Interface (Day 1-2)**

#### **Task 1.1: Create AdminUserManagement.tsx**

**New file: src/pages/admin/AdminUserManagement.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  ShieldOff,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Mail,
  UserCheck,
  UserX
} from 'lucide-react';

interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  role: 'lady' | 'client' | 'club' | 'admin';
  membership_tier: 'FREE' | 'PRO';
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  last_login?: string;
  profile?: {
    name: string;
    location: string;
    image_url?: string;
  };
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'lady' | 'client' | 'club'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'blocked'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminUserService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      switch (statusFilter) {
        case 'verified':
          filtered = filtered.filter(user => user.is_verified);
          break;
        case 'unverified':
          filtered = filtered.filter(user => !user.is_verified);
          break;
        case 'blocked':
          filtered = filtered.filter(user => user.is_blocked);
          break;
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.profile?.name && user.profile.name.toLowerCase().includes(term))
      );
    }

    setFilteredUsers(filtered);
  };

  const handleBlockUser = async (userId: string, username: string) => {
    const confirmed = window.confirm(`Block user "${username}"? They will be unable to access the platform.`);
    if (!confirmed) return;

    try {
      setProcessing(userId);
      await adminUserService.blockUser(userId);
      await loadUsers(); // Refresh
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleUnblockUser = async (userId: string, username: string) => {
    const confirmed = window.confirm(`Unblock user "${username}"? They will regain access to the platform.`);
    if (!confirmed) return;

    try {
      setProcessing(userId);
      await adminUserService.unblockUser(userId);
      await loadUsers(); // Refresh
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'lady': return 'bg-pink-100 text-pink-800';
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'club': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by username, email, or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Roles</option>
                  <option value="lady">Ladies</option>
                  <option value="client">Clients</option>
                  <option value="club">Clubs</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'No users have registered yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profile?.image_url ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.profile.image_url}
                                  alt={user.username}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-600 font-medium">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.profile?.name || user.username}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.profile?.location && (
                                <div className="text-xs text-gray-400">{user.profile.location}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          {user.membership_tier === 'PRO' && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              PRO
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {user.is_blocked ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                <UserX className="h-3 w-3 mr-1" />
                                Blocked
                              </span>
                            ) : user.is_verified ? (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                <Calendar className="h-3 w-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimeAgo(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_login ? formatTimeAgo(user.last_login) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {user.is_blocked ? (
                              <button
                                onClick={() => handleUnblockUser(user.id, user.username)}
                                disabled={processing === user.id}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Unblock user"
                              >
                                {processing === user.id ? (
                                  <div className="h-4 w-4">
                                    <LoadingSpinner size="sm" />
                                  </div>
                                ) : (
                                  <Shield className="h-4 w-4" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBlockUser(user.id, user.username)}
                                disabled={processing === user.id}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Block user"
                              >
                                {processing === user.id ? (
                                  <div className="h-4 w-4">
                                    <LoadingSpinner size="sm" />
                                  </div>
                                ) : (
                                  <ShieldOff className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.is_verified).length}
                  </div>
                  <div className="text-sm text-gray-600">Verified</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => !u.is_verified).length}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.is_blocked).length}
                  </div>
                  <div className="text-sm text-gray-600">Blocked</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
```

#### **Task 1.2: Create Admin User Service**

**New file: src/services/adminUserService.ts**
```typescript
import { supabase } from '../lib/supabase';

export interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  role: 'lady' | 'client' | 'club' | 'admin';
  membership_tier: 'FREE' | 'PRO';
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  last_login?: string;
  profile?: {
    name: string;
    location: string;
    image_url?: string;
  };
}

export const adminUserService = {
  /**
   * Get all users with their profile information
   */
  async getAllUsers(): Promise<UserWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          username,
          role,
          membership_tier,
          is_verified,
          is_blocked,
          created_at,
          last_login,
          profiles (
            name,
            location,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }

      return (data || []).map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        membership_tier: user.membership_tier,
        is_verified: user.is_verified,
        is_blocked: user.is_blocked || false,
        created_at: user.created_at,
        last_login: user.last_login,
        profile: user.profiles?.[0] ? {
          name: user.profiles[0].name,
          location: user.profiles[0].location,
          image_url: user.profiles[0].image_url
        } : undefined
      }));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<void> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Admin authentication required');
      }

      const { error } = await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('id', userId);

      if (error) {
        console.error('Error blocking user:', error);
        throw new Error('Failed to block user');
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.id,
          action_type: 'block_user',
          target_user_id: userId,
          notes: 'User blocked by admin'
        });
    } catch (error) {
      console.error('Error in blockUser:', error);
      throw error;
    }
  },

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Admin authentication required');
      }

      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', userId);

      if (error) {
        console.error('Error unblocking user:', error);
        throw new Error('Failed to unblock user');
      }

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: currentUser.id,
          action_type: 'unblock_user',
          target_user_id: userId,
          notes: 'User unblocked by admin'
        });
    } catch (error) {
      console.error('Error in unblockUser:', error);
      throw error;
    }
  },

  /**
   * Get user activity stats
   */
  async getUserStats(): Promise<{
    total: number;
    verified: number;
    blocked: number;
    ladies: number;
    clients: number;
    clubs: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, is_verified, is_blocked');

      if (error) {
        console.error('Error fetching user stats:', error);
        throw new Error('Failed to fetch user statistics');
      }

      const stats = {
        total: data?.length || 0,
        verified: data?.filter(u => u.is_verified).length || 0,
        blocked: data?.filter(u => u.is_blocked).length || 0,
        ladies: data?.filter(u => u.role === 'lady').length || 0,
        clients: data?.filter(u => u.role === 'client').length || 0,
        clubs: data?.filter(u => u.role === 'club').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      throw error;
    }
  }
};
```

### **Phase 2: Database Schema Updates (Day 2)**

#### **Task 2.1: Add User Blocking Support**

**Add migration for user blocking:**
```sql
-- Add is_blocked column to users table
ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT false;

-- Add last_login tracking
ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;

-- Create index for admin queries
CREATE INDEX idx_users_admin_management ON users(role, is_verified, is_blocked, created_at);

-- Update admin_actions table to support user management actions
ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS action_type TEXT;

-- Add constraint for action types
ALTER TABLE admin_actions DROP CONSTRAINT IF EXISTS admin_actions_action_type_check;
ALTER TABLE admin_actions ADD CONSTRAINT admin_actions_action_type_check 
CHECK (action_type IN (
  'approve_user', 
  'reject_user', 
  'approve_document', 
  'reject_document',
  'block_user',
  'unblock_user',
  'change_role',
  'change_membership'
));
```

#### **Task 2.2: Add RLS Policies for User Management**

```sql
-- Policy for admin user management
CREATE POLICY "Admins can manage all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
    )
  );

-- Policy for admin to view all users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role = 'admin'
    )
  );
```

### **Phase 3: Add to Admin Navigation (Day 3)**

#### **Task 3.1: Update AdminLayout.tsx**

**Update navigationItems in AdminLayout.tsx:**
```typescript
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
    name: 'User Management', // NEW
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
```

#### **Task 3.2: Add Route to App.tsx**

**Add to App.tsx admin routes:**
```typescript
<Route path="/admin/users" element={
  <AdminGuard>
    <AdminUserManagement />
  </AdminGuard>
} />
```

---

## 🎯 **Success Criteria**

### **Phase 1 Complete When:**
- ✅ AdminUserManagement.tsx displays all users with profiles
- ✅ Search and filtering functionality works
- ✅ User blocking/unblocking actions work
- ✅ Admin actions are logged to admin_actions table

### **Phase 2 Complete When:**
- ✅ Database schema supports user blocking
- ✅ RLS policies allow admin user management
- ✅ Admin actions are properly tracked
- ✅ User statistics are accurate

### **Phase 3 Complete When:**
- ✅ User Management appears in admin navigation
- ✅ Route is properly protected with AdminGuard
- ✅ Navigation highlighting works correctly
- ✅ All admin features are accessible

---

## 🧪 **Testing Plan**

### **Manual Testing Checklist:**
1. **User Management Interface**
   - [ ] All users display with correct information
   - [ ] Search by username, email, name works
   - [ ] Role filtering works (ladies, clients, clubs)
   - [ ] Status filtering works (verified, unverified, blocked)

2. **User Actions**
   - [ ] Block user functionality works
   - [ ] Unblock user functionality works
   - [ ] Confirmation dialogs appear
   - [ ] Actions are logged to admin_actions

3. **Navigation & Security**
   - [ ] Only admins can access user management
   - [ ] Navigation highlighting works
   - [ ] Error handling for failed operations
   - [ ] Loading states during operations

4. **Data Accuracy**
   - [ ] User statistics are correct
   - [ ] Profile information displays properly
   - [ ] Timestamps format correctly
   - [ ] Role badges display correctly

---

**Total Estimated Time**: 2-3 days  
**Priority**: MEDIUM - Administrative efficiency feature 