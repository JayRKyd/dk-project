import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { adminUserService, type UserWithProfile } from '../../services/adminUserService';
import { Search, Shield, UserX, Unlock, Ban, Mail, Calendar, UserCircle2 } from 'lucide-react';

const PAGE_SIZE = 25;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

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
                        {user.profile?.image_url ? (
                          <img src={user.profile.image_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <UserCircle2 className="h-8 w-8 text-gray-400" />
                        )}
                        <div>
                          <div className="font-medium">{user.username || '—'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</div>
                        </div>
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
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default UserManagement; 