import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ContentModerationService, MediaItem } from '../../services/contentModerationService';
import { format } from 'date-fns';
import { Image, Video, AlertCircle, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';

const MediaModeration: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    media_type: '',
    moderation_status: ''
  });
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [moderationReason, setModerationReason] = useState('');

  useEffect(() => {
    loadMediaItems();
  }, [page, filters]);

  const loadMediaItems = async () => {
    setLoading(true);
    const { items, error } = await ContentModerationService.getMediaItems(page, 20, filters);
    if (!error && items) {
      setMediaItems(items);
    }
    setLoading(false);
  };

  const handleModerateContent = async (action: 'approve' | 'reject' | 'hide' | 'delete') => {
    if (!selectedItem) return;
    if (!moderationReason.trim() && action !== 'approve') {
      alert('Please provide a reason for this action');
      return;
    }

    const { error } = await ContentModerationService.moderateContent(
      'media',
      selectedItem.id,
      action,
      moderationReason
    );

    if (!error) {
      alert('Media moderated successfully');
      setSelectedItem(null);
      setModerationReason('');
      loadMediaItems();
    } else {
      alert('Error moderating media: ' + error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Media Moderation</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Media Type</label>
              <select
                className="w-full border rounded p-2"
                value={filters.media_type}
                onChange={(e) => setFilters({ ...filters, media_type: e.target.value })}
              >
                <option value="">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
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

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mediaItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedItem(item)}
            >
              {/* Media Preview */}
              <div className="aspect-video bg-gray-100 relative">
                {item.media_type === 'image' ? (
                  <img
                    src={item.url}
                    alt="Media content"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  {item.status === 'hidden' && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                      Hidden
                    </span>
                  )}
                  {item.moderation_status === 'rejected' && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {item.media_type === 'image' ? (
                    <Image className="w-4 h-4" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Uploaded: {format(new Date(item.created_at), 'PPp')}
                </p>
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
            disabled={mediaItems.length < 20}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>

        {/* Moderation Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Moderate Content</h2>

                {/* Media Preview */}
                <div className="aspect-video bg-gray-100 mb-6 rounded overflow-hidden">
                  {selectedItem.media_type === 'image' ? (
                    <img
                      src={selectedItem.url}
                      alt="Media content"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={selectedItem.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
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
                      setSelectedItem(null);
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

export default MediaModeration; 