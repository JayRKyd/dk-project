import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ContentModerationService, Comment } from '../../services/contentModerationService';
import { format } from 'date-fns';
import { MessageSquare, AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';

const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    content_type: '',
    moderation_status: ''
  });
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    loadComments();
  }, [page, filters]);

  const loadComments = async () => {
    setLoading(true);
    const { comments: items, error } = await ContentModerationService.getComments(page, 20, filters);
    if (!error && items) {
      setComments(items);
    }
    setLoading(false);
  };

  const handleModerateContent = async (action: 'approve' | 'reject' | 'hide' | 'delete') => {
    if (!selectedComment) return;
    if (!moderationReason.trim() && action !== 'approve') {
      alert('Please provide a reason for this action');
      return;
    }

    const { error } = await ContentModerationService.moderateContent(
      'comment',
      selectedComment.id,
      action,
      moderationReason
    );

    if (!error) {
      alert('Comment moderated successfully');
      setSelectedComment(null);
      setModerationReason('');
      loadComments();
    } else {
      alert('Error moderating comment: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Comment Moderation</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select
                className="w-full border rounded p-2"
                value={filters.content_type}
                onChange={(e) => setFilters({ ...filters, content_type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="photo">Photos</option>
                <option value="fan_post">Fan Posts</option>
                <option value="gift">Gifts</option>
                <option value="review">Reviews</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                className="w-full border rounded p-2"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="hidden">Hidden</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Moderation Status</label>
              <select
                className="w-full border rounded p-2"
                value={filters.moderation_status}
                onChange={(e) => setFilters({ ...filters, moderation_status: e.target.value })}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map(comment => (
            <div
              key={comment.id}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedComment(comment)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {comment.content_type.charAt(0).toUpperCase() + comment.content_type.slice(1)} Comment
                    </span>
                    {comment.status === 'hidden' && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        Hidden
                      </span>
                    )}
                    {comment.moderation_status === 'rejected' && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Rejected
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800 mb-2">{comment.comment}</p>
                  <p className="text-sm text-gray-600">
                    Posted: {format(new Date(comment.created_at), 'PPp')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-between">
          <button
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
            disabled={comments.length < 20}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>

        {/* Moderation Modal */}
        {selectedComment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Moderate Comment</h2>

                {/* Comment Content */}
                <div className="bg-gray-50 rounded p-4 mb-6">
                  <p className="text-gray-800">{selectedComment.comment}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Posted: {format(new Date(selectedComment.created_at), 'PPp')}
                  </p>
                </div>

                {/* Moderation Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Moderation Reason
                    </label>
                    <textarea
                      className="w-full border rounded p-2"
                      value={moderationReason}
                      onChange={(e) => setModerationReason(e.target.value)}
                      rows={3}
                      placeholder="Required for reject/hide/delete actions"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => handleModerateContent('approve')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={() => handleModerateContent('reject')}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      onClick={() => handleModerateContent('hide')}
                    >
                      <EyeOff className="w-4 h-4" />
                      <span>Hide</span>
                    </button>

                    <button
                      className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      onClick={() => handleModerateContent('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <button
                    className="w-full mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => {
                      setSelectedComment(null);
                      setModerationReason('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CommentModeration; 