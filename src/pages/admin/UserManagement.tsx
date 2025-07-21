import React, { useState, useEffect } from 'react';
import { AdminModerationService, ModerationLog } from '../../services/adminModerationService';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  is_locked: boolean;
  locked_at: string | null;
  locked_reason: string | null;
  lock_expires_at: string | null;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [lockDuration, setLockDuration] = useState('permanent');
  const [customDays, setCustomDays] = useState(1);

  // Load locked users
  useEffect(() => {
    const loadLockedUsers = async () => {
      setLoading(true);
      const { users, error } = await AdminModerationService.getLockedUsers(page);
      if (!error && users) {
        setUsers(users);
      }
      setLoading(false);
    };

    loadLockedUsers();
  }, [page]);

  // Load moderation logs for selected user
  useEffect(() => {
    const loadModerationLogs = async () => {
      if (selectedUser) {
        const { logs } = await AdminModerationService.getUserModerationLogs(selectedUser.id);
        setModerationLogs(logs);
      }
    };

    loadModerationLogs();
  }, [selectedUser]);

  const handleLockUser = async (user: User) => {
    if (!lockReason.trim()) {
      alert('Please provide a reason for locking the account');
      return;
    }

    let expiresAt: Date | undefined;
    if (lockDuration === 'custom') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + customDays);
    }

    const { error } = await AdminModerationService.lockUser({
      userId: user.id,
      reason: lockReason,
      expiresAt: lockDuration === 'permanent' ? undefined : expiresAt
    });

    if (!error) {
      alert('User account locked successfully');
      // Refresh the user list
      const { users: updatedUsers } = await AdminModerationService.getLockedUsers(page);
      setUsers(updatedUsers || []);
    } else {
      alert('Error locking user account: ' + error.message);
    }
  };

  const handleUnlockUser = async (user: User) => {
    const { error } = await AdminModerationService.unlockUser(user.id);
    
    if (!error) {
      alert('User account unlocked successfully');
      // Refresh the user list
      const { users: updatedUsers } = await AdminModerationService.getLockedUsers(page);
      setUsers(updatedUsers || []);
    } else {
      alert('Error unlocking user account: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Management</h1>

      {/* User List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Locked Users</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <div 
                  key={user.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">
                    Locked: {user.locked_at ? format(new Date(user.locked_at), 'PPp') : 'No'}
                  </p>
                  {user.lock_expires_at && (
                    <p className="text-sm text-gray-600">
                      Expires: {format(new Date(user.lock_expires_at), 'PPp')}
                    </p>
                  )}
                  <button
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnlockUser(user);
                    }}
                  >
                    Unlock Account
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex justify-between">
            <button
              className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button
              className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
              disabled={users.length < 20}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* User Details and Lock Form */}
        <div>
          {selectedUser ? (
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">
                {selectedUser.username}'s Details
              </h2>
              
              {/* Lock Account Form */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Lock Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Reason for Lock
                    </label>
                    <textarea
                      className="w-full border rounded p-2"
                      value={lockReason}
                      onChange={(e) => setLockReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lock Duration
                    </label>
                    <select
                      className="w-full border rounded p-2"
                      value={lockDuration}
                      onChange={(e) => setLockDuration(e.target.value)}
                    >
                      <option value="permanent">Permanent</option>
                      <option value="custom">Custom Duration</option>
                    </select>
                  </div>

                  {lockDuration === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Number of Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full border rounded p-2"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value))}
                      />
                    </div>
                  )}

                  <button
                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => handleLockUser(selectedUser)}
                  >
                    Lock Account
                  </button>
                </div>
              </div>

              {/* Moderation History */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Moderation History</h3>
                <div className="space-y-2">
                  {moderationLogs.map(log => (
                    <div key={log.id} className="border rounded p-3">
                      <p className="font-medium">{log.action_type}</p>
                      <p className="text-sm text-gray-600">{log.reason}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(log.created_at), 'PPp')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 text-center text-gray-500">
              Select a user to view details and moderation options
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 