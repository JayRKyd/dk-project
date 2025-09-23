import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Gift, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// import { clientDashboardService } from '../../services/clientDashboardService';
import { giftService, type GiftWithReplies } from '../../services/giftService';

export default function ClientGifts() {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<GiftWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadClientGifts();
    }
  }, [user?.id]);

  const loadClientGifts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const giftsData = await giftService.getGiftsWithReplies(user.id, 'sent');
      setGifts(giftsData);
    } catch (err) {
      console.error('Error loading client gifts:', err);
      setError('Failed to load gifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatRelativeDate = (date: string) => {
    const giftDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - giftDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gifts Sent</h1>
          <p className="text-gray-600 mt-1">
            View all the gifts you've sent to ladies
          </p>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gifts Sent</h1>
          <p className="text-gray-600 mt-1">
            View all the gifts you've sent to ladies
          </p>
        </div>

        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Gifts</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadClientGifts}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Gifts Sent</h1>
        <p className="text-gray-600 mt-1">
          View all the gifts you've sent to ladies
        </p>
        {gifts.length > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            You've sent {gifts.length} gift{gifts.length !== 1 ? 's' : ''} so far
          </p>
        )}
      </div>

      {/* Gifts List */}
      <div className="space-y-6">
        {gifts.map((gift) => (
          <div key={gift.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Gift Header */}
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={gift.recipient.imageUrl || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'}
                  alt={gift.recipient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/ladies/pro/${gift.recipientProfileId || ''}`}
                    className="font-medium text-gray-900 hover:text-pink-500"
                  >
                    {gift.recipient.name}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {formatRelativeDate(gift.date)} at {gift.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-4xl">{gift.type.emoji}</div>
                <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                  <Gift className="h-4 w-4" />
                  <span>{gift.type.credits} DK</span>
                </div>
              </div>
            </div>

            {/* Gift Message */}
            {gift.message && (
              <div className="px-6 pb-4">
                <p className="text-gray-700">{gift.message}</p>
              </div>
            )}

            {/* Replies */}
            {gift.replies && gift.replies.length > 0 && (
              <div className="px-6 pb-6">
                {gift.replies.map((reply) => (
                  <div key={reply.id} className="bg-pink-50 rounded-lg p-4 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span className="font-medium text-gray-900">Reply from {reply.sender_name}</span>
                    </div>
                    <p className="text-gray-700">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4">
              <Link
                to={`/send-gift/${gift.recipientProfileId || ''}`}
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Send Another Gift
              </Link>
              <Link
                to={`/ladies/pro/${gift.recipientProfileId || ''}`}
                className="text-gray-600 hover:text-gray-900"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {gifts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Gifts Sent Yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't sent any gifts yet. Send a gift to show your appreciation!
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Browse Ladies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}