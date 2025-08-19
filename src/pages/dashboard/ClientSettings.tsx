import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, XCircle, AlertTriangle, Shield, Bell, Camera } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImage } from '../../services/imageService';

export default function ClientSettings() {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(user?.user_metadata?.username || user?.email?.split('@')[0] || '');
  const [currentEmail, setCurrentEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      setUploadingAvatar(true);
      const uploaded = await uploadImage(file, 'profile-pictures', 'avatars', user.id);
      // Save to profiles.image_url (let unique constraint handle upsert)
      await supabase.from('profiles').upsert({ user_id: user.id, image_url: uploaded.url });
      // Also update auth metadata so dashboards reflect immediately
      await supabase.auth.updateUser({ data: { avatar_url: uploaded.url } });
      setAvatarUrl(uploaded.url);
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    try {
      // Supabase doesn’t require current password for update when authenticated
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('Password updated successfully');
      setShowPasswordForm(false);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update failed', err);
      alert(err?.message || 'Failed to update password');
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const { error } = await supabase.from('users').update({ username }).eq('id', user.id);
      if (error) throw error;
      const { error: authError } = await supabase.auth.updateUser({ data: { username } });
      if (authError) throw authError;
      setCurrentUsername(username);
      setShowUsernameForm(false);
      setUsername('');
    } catch (err: any) {
      console.error('Username update failed', err);
      alert(err?.message || 'Failed to update username');
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      setCurrentEmail(email);
      alert('Email update requested. Please confirm via the email link.');
      setShowEmailForm(false);
      setEmail('');
    } catch (err: any) {
      console.error('Email update failed', err);
      alert(err?.message || 'Failed to update email');
    }
  };

  const handleAccountDelete = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle account deletion logic here
    console.log('Account deletion confirmed');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/client"
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

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Account Details</h2>
        
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <img src={avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'} alt="Avatar" className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100" />
              <div>
                <h3 className="font-medium text-gray-900">Profile Photo</h3>
                <p className="text-gray-600">Upload one picture for your client profile</p>
              </div>
            </div>
            <label className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 cursor-pointer">
              <Camera className="h-5 w-5" />
              <span>{uploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          {/* Client Number */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">DK Client Number</h3>
              <p className="text-gray-600">Your unique client identification number</p>
            </div>
            <div className="bg-pink-100 px-4 py-2 rounded-lg">
              <span className="font-medium text-pink-600">DK-12345</span>
            </div>
          </div>
          
          {/* Username */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium text-gray-900">Username</h3>
                <div className="flex flex-col">
                  <p className="text-gray-600">Current username: <span className="font-medium">{currentUsername}</span></p>
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
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Update Username
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
                  <p className="text-gray-600">Current email: <span className="font-medium">{currentEmail}</span></p>
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
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Update Email
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
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-pink-100 p-2 rounded-lg">
            <Bell className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notification Settings</h2>
            <p className="text-gray-600">Control what in‑app notifications you receive</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* In‑app notification toggles (persisted) */}
          <InAppNotificationToggles />
        </div>
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
              Your reviews will be anonymized
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Your remaining DK Credits will be lost
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              All your bookings will be cancelled
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

function InAppNotificationToggles() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    booking_confirmations: true,
    booking_reminders: true,
    review_replies: true,
    gift_replies: true,
    messages: true,
    booking_updates: true,
    fan_posts_from_favorites: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setSettings({
          booking_confirmations: data.booking_confirmations,
          booking_reminders: data.booking_reminders,
          review_replies: data.review_replies,
          gift_replies: data.gift_replies,
          messages: data.messages,
          booking_updates: data.booking_updates,
          fan_posts_from_favorites: data.fan_posts_from_favorites,
        });
      }
      setLoading(false);
    };
    load();
  }, [user?.id]);

  const update = async (key: keyof typeof settings, value: boolean) => {
    if (!user?.id) return;
    const next = { ...settings, [key]: value };
    setSettings(next);
    // upsert row
    await supabase.from('user_notification_settings').upsert({
      user_id: user.id,
      ...next,
      updated_at: new Date().toISOString(),
    });
  };

  const Row = ({ label, k }: { label: string; k: keyof typeof settings }) => (
    <label className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={settings[k]}
        onChange={(e) => update(k, e.target.checked)}
        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
      />
    </label>
  );

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <Row label="Booking confirmations" k="booking_confirmations" />
      <Row label="Booking reminders" k="booking_reminders" />
      <Row label="Review replies" k="review_replies" />
      <Row label="Gift replies" k="gift_replies" />
      <Row label="New messages" k="messages" />
      <Row label="Booking updates" k="booking_updates" />
      <Row label="New fan posts from favorites" k="fan_posts_from_favorites" />
    </div>
  );
}