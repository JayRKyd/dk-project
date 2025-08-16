import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../lib/supabase';
// import { getUserMembershipTier } from '../../utils/authUtils';

export default function AccountSettings() {
  const { profile, loading } = useUserProfile();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(profile?.username || '');
  const [currentEmail, setCurrentEmail] = useState(profile?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{text: string; type: 'success' | 'error' | null}>({text: '', type: null});

  // Get user's membership tier
  const userTier = profile?.membership_tier || 'FREE';
  const isProOrHigher = userTier === 'PRO' || userTier === 'PRO-PLUS' || userTier === 'ULTRA';

  const [hideListingCard, setHideListingCard] = useState<boolean>(Boolean((profile as any)?.hide_listing_card));
  const [hideFanPosts, setHideFanPosts] = useState<boolean>(Boolean((profile as any)?.hide_fan_posts));
  const [hideReviews, setHideReviews] = useState<boolean>(Boolean((profile as any)?.hide_reviews));

  const saveVisibility = async (updates: Partial<{ hide_listing_card: boolean; hide_fan_posts: boolean; hide_reviews: boolean }>) => {
    if (!profile?.id) return;
    setIsUpdating(true);
    setUpdateMessage({ text: '', type: null });
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (error) throw error;
      setUpdateMessage({ text: 'Settings saved', type: 'success' });
    } catch (e) {
      console.error('Failed saving visibility flags', e);
      setUpdateMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({text: '', type: null});

    try {
      if (newPassword !== confirmPassword) {
        setUpdateMessage({text: 'New passwords do not match', type: 'error'});
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setUpdateMessage({text: 'Password updated successfully', type: 'success'});
      setShowPasswordForm(false);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setUpdateMessage({text: 'Failed to update password', type: 'error'});
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({text: '', type: null});

    try {
      // Update username in users table
      const { error } = await supabase
        .from('users')
        .update({ username: username })
        .eq('id', profile?.id);

      if (error) throw error;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { username: username }
      });

      if (authError) throw authError;

      setCurrentUsername(username);
      setUpdateMessage({text: 'Username updated successfully', type: 'success'});
      setShowUsernameForm(false);
      setUsername('');
    } catch (error) {
      console.error('Error updating username:', error);
      setUpdateMessage({text: 'Failed to update username', type: 'error'});
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({text: '', type: null});

    try {
      const { error } = await supabase.auth.updateUser({
        email: email
      });

      if (error) throw error;

      setCurrentEmail(email);
      setUpdateMessage({text: 'Email updated successfully. Please check your email to confirm the change.', type: 'success'});
      setShowEmailForm(false);
      setEmail('');
    } catch (error) {
      console.error('Error updating email:', error);
      setUpdateMessage({text: 'Failed to update email', type: 'error'});
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccountDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage({ text: '', type: null });

    try {
      // Call RPC to delete app data for the current user (profiles, users)
      const { error } = await supabase.rpc('close_account_soft_delete');
      if (error) throw error;

      // Sign out and redirect
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error closing account:', err);
      setUpdateMessage({ text: 'Failed to close account. Please try again.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/lady"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">Loading account information...</span>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {updateMessage.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          updateMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {updateMessage.text}
        </div>
      )}

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Account Details</h2>
        
        <div className="space-y-6">
          {/* Client Number */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">DK Client Number</h3>
              <p className="text-gray-600">Your unique client identification number</p>
            </div>
            <div className="bg-pink-100 px-4 py-2 rounded-lg">
              <span className="font-medium text-pink-600">{profile?.client_number || 'Loading...'}</span>
            </div>
          </div>
          
          {/* Username */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Username</h3>
                <div className="flex flex-col">
                  <p className="text-gray-600">Current username: <span className="font-medium">{profile?.username || currentUsername}</span></p>
                  <p className="text-gray-500 text-sm">Change your username</p>
                </div>
              </div>
              <button
                onClick={() => setShowUsernameForm(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Change Username
              </button>
            </div>

            {showUsernameForm && (
              <form onSubmit={handleUsernameChange} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowUsernameForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Username'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Email */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Email Address</h3>
                <div className="flex flex-col">
                  <p className="text-gray-600">Current email: <span className="font-medium">{profile?.email || currentEmail}</span></p>
                  <p className="text-gray-500 text-sm">Change your email address</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailForm(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Change Email
              </button>
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailChange} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Email'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Change Password */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Password</h3>
                <p className="text-gray-600">Change your account password</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                <Key className="h-5 w-5" />
                <span>Change Password</span>
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* PRO/ULTRA Settings */}
      <div className={`rounded-xl shadow-sm p-8 mb-8 ${
        isProOrHigher ? 'bg-white' : 'bg-gray-100'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${
            isProOrHigher ? 'bg-pink-100' : 'bg-gray-200'
          }`}>
            <Shield className={`h-6 w-6 ${
              isProOrHigher ? 'text-pink-500' : 'text-gray-400'
            }`} />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${
              isProOrHigher ? 'text-gray-900' : 'text-gray-500'
            }`}>PRO / ULTRA Settings</h2>
            <p className={`${
              isProOrHigher ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {isProOrHigher 
                ? 'Control visibility of your profile features'
                : 'Upgrade to PRO or higher to access these settings'
              }
            </p>
          </div>
        </div>

        {isProOrHigher ? (
          <div className="space-y-6">
            {/* Listing Card Visibility */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Hide Listing Card</h3>
                <p className="text-gray-600">Temporarily hide your card from the Ladies page</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideListingCard}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setHideListingCard(val);
                    saveVisibility({ hide_listing_card: val });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Fan Posts Visibility */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Hide Fan Posts</h3>
                <p className="text-gray-600">Disable and hide your fan posts section</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideFanPosts}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setHideFanPosts(val);
                    saveVisibility({ hide_fan_posts: val });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Reviews Visibility */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Hide Reviews</h3>
                <p className="text-gray-600">Disable and hide your reviews section</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideReviews}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setHideReviews(val);
                    saveVisibility({ hide_reviews: val });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <div className="bg-gray-200 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Upgrade Required</h3>
              <p className="text-gray-500 mb-4">
                These advanced settings are available for PRO, PRO-PLUS, and ULTRA members.
              </p>
              <Link
                to="/dashboard/lady/upgrade/membership"
                className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Upgrade to PRO
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Close Account Section */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-pink-100 p-2 rounded-lg">
            <XCircle className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Close Account</h2>
            <p className="text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Before you go...</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              All your profile data will be permanently deleted
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Your advertisement will be removed immediately
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              All your reviews and ratings will be deleted
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Your remaining DK Credits will be lost
            </li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <XCircle className="h-5 w-5" />
            <span>Close Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Close Account</h3>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                For security reasons, please type <span className="font-mono font-bold">DELETE</span> below to confirm that you want to permanently close your account.
              </p>
            </div>

            <form onSubmit={handleAccountDelete} className="space-y-4">
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder='Type "DELETE" to confirm'
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono"
                required
              />
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteConfirmation !== 'DELETE'}
                  className={`px-6 py-2 rounded-lg ${
                    deleteConfirmation === 'DELETE'
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Close Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}