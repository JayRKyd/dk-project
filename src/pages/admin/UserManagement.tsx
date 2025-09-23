import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { adminUserService, type UserWithProfile } from '../../services/adminUserService';
import { Search, Shield, UserX, Unlock, Ban, Mail, Calendar, UserCircle2, Eye, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const PAGE_SIZE = 25;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  // Load users (paged + search)
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const { rows, total } = await adminUserService.getUsers({ page, pageSize: PAGE_SIZE, search });
        setUsers(rows);
        setTotal(total);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [page, search]);

  const paged = users; // server-paged

  const handleBlockToggle = async (user: UserWithProfile) => {
    setLoading(true);
    try {
      if (user.is_blocked) await adminUserService.unblockUser(user.id);
      else await adminUserService.blockUser(user.id);
      const { rows, total } = await adminUserService.getUsers({ page, pageSize: PAGE_SIZE, search });
      setUsers(rows);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = (user: UserWithProfile): string | null => {
    if (user.role === 'lady' && user.profile_id) {
      // FREE ladies: /ladies/:profileId, PRO ladies: /ladies/pro/:profileId
      return `/${user.membership_tier === 'FREE' ? 'ladies' : 'ladies/pro'}/${user.profile_id}`;
    } else if (user.role === 'club' && user.club_id) {
      return `/clubs/${user.club_id}`;
    }
    return null;
  };

  const handleUserClick = (user: UserWithProfile) => {
    // Open read-only details drawer for any user role
    setSelectedUser(user);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedUser(null);
    setProfileUrl(null);
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">User Management</h1>
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by username, email, role..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">DLT/Client #</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td className="py-6 px-4" colSpan={7}>Loading...</td></tr>
                )}
                {!loading && paged.length === 0 && (
                  <tr><td className="py-6 px-4" colSpan={7}>No users found</td></tr>
                )}
                {!loading && paged.map(user => (
                  <tr key={user.id} className="border-t">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getProfileUrl(user) ? (
                          <Link
                            to={getProfileUrl(user)!}
                            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {user.profile?.image_url ? (
                              <img src={user.profile.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <UserCircle2 className="h-8 w-8 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium flex items-center gap-1">
                                {user.username || '—'}
                                <ExternalLink className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</div>
                            </div>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleUserClick(user)}
                            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors group text-left w-full"
                          >
                            {user.profile?.image_url ? (
                              <img src={user.profile.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <UserCircle2 className="h-8 w-8 text-gray-400" />
                            )}
                            <div>
                              <div className="font-medium flex items-center gap-1">{user.username || '—'}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</div>
                            </div>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 capitalize">{user.role}</td>
                    <td className="py-3 px-4">{user.membership_tier || 'FREE'}</td>
                    <td className="py-3 px-4">{user.client_number || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {user.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700"><Shield className="h-3 w-3" /> Verified</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending</span>
                        )}
                        {user.is_blocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><Ban className="h-3 w-3" /> Suspended</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(user.created_at), 'PP')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUserClick(user)}
                          className="p-2 rounded-lg border text-gray-600 hover:bg-gray-50 border-gray-200"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleBlockToggle(user)}
                          className={`p-2 rounded-lg border transition-colors ${user.is_blocked ? 'text-green-600 hover:bg-green-50 border-green-200' : 'text-red-600 hover:bg-red-50 border-red-200'}`}
                          title={user.is_blocked ? 'Unsuspend' : 'Suspend'}
                        >
                          {user.is_blocked ? <Unlock className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</div>
            <button
              className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>

          {/* Details Drawer (read-only) */}
          {showDetails && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Resolve profile URL when modal opens */}
                  {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                  {(() => {
                    // Compute once per open
                    if (profileUrl === null) {
                      const direct = getProfileUrl(selectedUser);
                      if (direct) {
                        setProfileUrl(direct);
                      } else {
                        (async () => {
                          try {
                            if (selectedUser.role === 'lady') {
                              const { data } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('user_id', selectedUser.id)
                                .maybeSingle();
                              if (data?.id) {
                                setProfileUrl(`/${selectedUser.membership_tier === 'FREE' ? 'ladies' : 'ladies/pro'}/${data.id}`);
                              }
                            } else if (selectedUser.role === 'club') {
                              const { data } = await supabase
                                .from('clubs')
                                .select('id')
                                .eq('user_id', selectedUser.id)
                                .maybeSingle();
                              if (data?.id) {
                                setProfileUrl(`/clubs/${data.id}`);
                              }
                            }
                          } catch (_) {
                            // ignore
                          }
                        })();
                      }
                    }
                    return null;
                  })()}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
                    <button
                      onClick={closeDetails}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-4">
                      {selectedUser.profile?.image_url ? (
                        <img src={selectedUser.profile.image_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        <UserCircle2 className="h-16 w-16 text-gray-400" />
                      )}
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">{selectedUser.username || '—'}</h4>
                        <p className="text-gray-600">{selectedUser.email}</p>
                        {selectedUser.role === 'client' && (
                          <p className="text-sm text-gray-500">Client #{selectedUser.client_number || '—'}</p>
                        )}
                        {selectedUser.role !== 'client' && (
                          <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
                        )}
                      </div>
                    </div>

                    {/* Status and Tier */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Membership</label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedUser.membership_tier || 'FREE'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser.is_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedUser.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Account Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                      <div className="flex items-center gap-2">
                        {selectedUser.is_blocked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Ban className="h-3 w-3 mr-1" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Profile Info */}
                    {selectedUser.profile && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Info</label>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {selectedUser.profile.name && (
                            <p><span className="font-medium">Name:</span> {selectedUser.profile.name}</p>
                          )}
                          {selectedUser.profile.location && (
                            <p><span className="font-medium">Location:</span> {selectedUser.profile.location}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Account Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                        <p className="text-sm text-gray-600">{format(new Date(selectedUser.created_at), 'PP')}</p>
                      </div>
                      {selectedUser.last_login && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                          <p className="text-sm text-gray-600">{format(new Date(selectedUser.last_login), 'PP')}</p>
                        </div>
                      )}
                    </div>

                    {/* Quick Links */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quick Links</label>
                      <div className="flex flex-wrap gap-2">
                        {profileUrl && (
                          <Link
                            to={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-pink-50 text-pink-600 rounded-lg text-sm hover:bg-pink-100"
                          >
                            Open profile
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t">
                      <button
                        onClick={closeDetails}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default UserManagement;