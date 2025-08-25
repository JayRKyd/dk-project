import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { 
  getVerificationQueue, 
  approveUser, 
  rejectUser,
  type VerificationQueueItem 
} from '../../services/adminVerificationService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  CheckCircle,
  User,
  Calendar,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  Phone,
  Globe,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function VerificationQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [filteredQueue, setFilteredQueue] = useState<VerificationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<VerificationQueueItem | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    // Filter and search the queue
    let filtered = queue;

    // Apply filter
    if (filter === 'complete') {
      filtered = filtered.filter(item => item.total_documents_uploaded === item.required_documents);
    } else if (filter === 'incomplete') {
      filtered = filtered.filter(item => item.total_documents_uploaded < item.required_documents);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQueue(filtered);
  }, [queue, filter, searchTerm]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await getVerificationQueue();
      
      // Filter out duplicate entries based on user ID
      const uniqueData = data.reduce((acc: VerificationQueueItem[], current) => {
        const exists = acc.find(item => item.id === current.id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setQueue(uniqueData);
    } catch (error) {
      console.error('Error fetching verification queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, username: string) => {
    if (!user?.id) return;
    
    try {
      setProcessing(userId);
      await approveUser(userId, user.id, `Bulk approval by admin`);
      await fetchQueue(); // Refresh the queue
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving user. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectUser = async (userId: string, username: string) => {
    if (!user?.id) return;
    
    const reason = prompt(`Reject verification for ${username}?\n\nPlease provide a reason:`);
    if (!reason) return;
    
    try {
      setProcessing(userId);
      await rejectUser(userId, user.id, reason);
      await fetchQueue(); // Refresh the queue
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting user. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (item: VerificationQueueItem) => {
    setSelectedItem(item);
    setShowDetailsDrawer(true);
  };

  const closeDetailsDrawer = () => {
    setShowDetailsDrawer(false);
    setSelectedItem(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 70) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatPhoneForDisplay = (phone: string) => {
    // Clean and format phone for display
    return phone.replace(/[\s\-\(\)]/g, '').replace(/(\+?\d{1,3})?(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
  };

  const normalizeWebsiteUrl = (url: string) => {
    if (!url.match(/^https?:\/\//i)) {
      return 'https://' + url;
    }
    return url;
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
              <h1 className="text-3xl font-bold text-gray-900">Verification Queue</h1>
              <p className="text-gray-600 mt-2">
                {filteredQueue.length} verification{filteredQueue.length !== 1 ? 's' : ''} pending review
              </p>
            </div>
            <button
              onClick={fetchQueue}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Refresh Queue
            </button>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'complete' | 'incomplete')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="all">All Submissions</option>
                  <option value="complete">Complete (4/4 docs)</option>
                  <option value="incomplete">Incomplete (&lt;4 docs)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Queue Items */}
          <div className="space-y-4">
            {filteredQueue.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No verifications pending
                </h3>
                <p className="text-gray-600">
                  All verification requests have been processed. Great work!
                </p>
              </div>
            ) : (
              filteredQueue.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.username}</h3>
                        <p className="text-gray-600">{item.email}</p>

                        {/* Business Contact Information (for clubs) */}
                        {item.role === 'club' && (item.business_name || item.business_phone || item.business_website) && (
                          <div className="mt-2 space-y-1">
                            {item.business_name && (
                              <p className="text-sm font-medium text-gray-900">{item.business_name}</p>
                            )}

                            <div className="flex items-center space-x-3 text-sm">
                              {item.business_phone && (
                                <div className="flex items-center space-x-1">
                                  <a
                                    href={`tel:${item.business_phone.replace(/[\s\-\(\)]/g, '')}`}
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Click to call"
                                  >
                                    <Phone className="h-3 w-3" />
                                    <span>{formatPhoneForDisplay(item.business_phone)}</span>
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(item.business_phone!)}
                                    className="text-gray-400 hover:text-gray-600 p-0.5"
                                    title="Copy phone number"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              )}

                              {item.business_website && (
                                <div className="flex items-center space-x-1">
                                  <a
                                    href={normalizeWebsiteUrl(item.business_website)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Open website"
                                  >
                                    <Globe className="h-3 w-3" />
                                    <span>{item.business_website}</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(item.business_website!)}
                                    className="text-gray-400 hover:text-gray-600 p-0.5"
                                    title="Copy website URL"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {formatTimeAgo(item.verification_submitted_at || item.registered_at)}</span>
                          </div>

                          {item.role === 'club' ? (
                            <div className="flex items-center space-x-1 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>Business info only (no documents required)</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <FileText className="h-4 w-4" />
                              <span>{item.total_documents_uploaded}/{item.required_documents} documents</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Priority and Actions */}
                    <div className="flex items-center space-x-4">
                      {/* Priority Badge */}
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getPriorityColor(item.priority_score || 0)}`}>
                        {getPriorityLabel(item.priority_score || 0)} Priority
                      </div>

                      {/* Document Status */}
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${
                          item.total_documents_uploaded === item.required_documents 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {item.total_documents_uploaded}/{item.required_documents}
                        </div>
                        <div className="text-xs text-gray-500">documents</div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Review documents"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {item.total_documents_uploaded === item.required_documents && (
                          <>
                            <button
                              onClick={() => handleApproveUser(item.id, item.username)}
                              disabled={processing === item.id}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Approve all documents"
                            >
                              {processing === item.id ? (
                                <div className="h-5 w-5">
                                  <LoadingSpinner size="sm" />
                                </div>
                              ) : (
                                <ThumbsUp className="h-5 w-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleRejectUser(item.id, item.username)}
                              disabled={processing === item.id}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Reject verification"
                            >
                              <ThumbsDown className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details Drawer */}
          {showDetailsDrawer && selectedItem && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Verification Details - {selectedItem.username}
                    </h3>
                    <button
                      onClick={closeDetailsDrawer}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* User Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">User Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Username</label>
                          <p className="text-sm text-gray-900">{selectedItem.username}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-sm text-gray-900">{selectedItem.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Role</label>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {selectedItem.role}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            selectedItem.is_verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedItem.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Joined</label>
                          <p className="text-sm text-gray-900">{formatTimeAgo(selectedItem.registered_at)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Submitted</label>
                          <p className="text-sm text-gray-900">{formatTimeAgo(selectedItem.verification_submitted_at || selectedItem.registered_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Business Information (for clubs) */}
                    {selectedItem.role === 'club' && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-lg font-medium text-gray-900 mb-3">Business Information</h4>
                        <div className="grid grid-cols-1 gap-4">
                          {selectedItem.business_name && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Business Name</label>
                              <p className="text-sm text-gray-900">{selectedItem.business_name}</p>
                            </div>
                          )}
                          {selectedItem.business_type && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Business Type</label>
                              <p className="text-sm text-gray-900 capitalize">{selectedItem.business_type.replace('_', ' ')}</p>
                            </div>
                          )}
                          {selectedItem.business_phone && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={`tel:${selectedItem.business_phone.replace(/[\s\-\(\)]/g, '')}`}
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Phone className="h-4 w-4" />
                                  <span className="text-sm">{formatPhoneForDisplay(selectedItem.business_phone)}</span>
                                </a>
                                <button
                                  onClick={() => copyToClipboard(selectedItem.business_phone!)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  title="Copy phone number"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                          {selectedItem.business_website && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Business Website</label>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={normalizeWebsiteUrl(selectedItem.business_website)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Globe className="h-4 w-4" />
                                  <span className="text-sm">{selectedItem.business_website}</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                                <button
                                  onClick={() => copyToClipboard(selectedItem.business_website!)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  title="Copy website URL"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Documents</h4>
                      {selectedItem.role === 'club' ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Business info only - no documents required</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Documents Uploaded</span>
                            <span className={`font-medium ${selectedItem.total_documents_uploaded === selectedItem.required_documents ? 'text-green-600' : 'text-yellow-600'}`}>
                              {selectedItem.total_documents_uploaded}/{selectedItem.required_documents}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${selectedItem.total_documents_uploaded === selectedItem.required_documents ? 'bg-green-600' : 'bg-yellow-600'}`}
                              style={{ width: `${(selectedItem.total_documents_uploaded / selectedItem.required_documents) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Priority Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Priority</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getPriorityColor(selectedItem.priority_score || 0)}`}>
                          {getPriorityLabel(selectedItem.priority_score || 0)} Priority
                        </div>
                        <span className="text-sm text-gray-600">
                          Score: {selectedItem.priority_score || 0}/100
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                      <button
                        onClick={closeDetailsDrawer}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>

                      {selectedItem.total_documents_uploaded === selectedItem.required_documents && (
                        <>
                          <button
                            onClick={() => {
                              handleApproveUser(selectedItem.id, selectedItem.username);
                              closeDetailsDrawer();
                            }}
                            disabled={processing === selectedItem.id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {processing === selectedItem.id ? 'Processing...' : 'Approve'}
                          </button>

                          <button
                            onClick={() => {
                              handleRejectUser(selectedItem.id, selectedItem.username);
                              closeDetailsDrawer();
                            }}
                            disabled={processing === selectedItem.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
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
} 