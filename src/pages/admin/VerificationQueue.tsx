import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Calendar,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search
} from 'lucide-react';

export default function VerificationQueue() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<VerificationQueueItem[]>([]);
  const [filteredQueue, setFilteredQueue] = useState<VerificationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
    try {
      // Validate item exists
      if (!item) {
        throw new Error('No verification item provided');
      }

      // Validate ID exists and is a string
      if (!item.id || typeof item.id !== 'string' || item.id.trim() === '') {
        throw new Error(`Invalid user ID: ${item.id}`);
      }

      // Validate ID format (should be UUID)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(item.id)) {
        throw new Error(`Invalid user ID format: ${item.id}`);
      }

      // If all validations pass, navigate to details
      navigate(`/admin/verifications/${item.id}`);
    } catch (error) {
      console.error('Error viewing verification details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Cannot view verification details';
      alert(`Cannot view verification details: ${errorMessage}`);
    }
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
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.username}</h3>
                        <p className="text-gray-600">{item.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {formatTimeAgo(item.verification_submitted_at || item.registered_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-500">
                            <FileText className="h-4 w-4" />
                            <span>{item.total_documents_uploaded}/{item.required_documents} documents</span>
                          </div>
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
        </div>
      </AdminLayout>
    </AdminGuard>
  );
} 