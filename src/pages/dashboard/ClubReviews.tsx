import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MessageCircle, Heart, ThumbsDown, Calendar, User, Reply, Send, Loader2, AlertCircle } from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { ladyService } from '../../services/ladyService';

interface Review {
  id: string;
  author: { name: string; isAnonymous: boolean };
  rating: number;
  positives: string[];
  negatives: string[];
  likes: number;
  dislikes: number;
  createdAt: string;
  reply?: { id: string; message: string; createdAt: string };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  totalLikes: number;
  replyRate: number;
}

export default function ClubReviews() {
  const { clubProfile } = useClubDashboard() as any;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!clubProfile?.id) return;
      try {
        setLoading(true);
        const received = await ladyService.getReceivedReviews(clubProfile.id);
        setReviews(received as any);
        const s = await ladyService.getReviewStats(clubProfile.id);
        setStats(s as any);
      } catch (e) {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubProfile?.id]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      await ladyService.replyToReview(reviewId, replyText);
      setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, reply: { id: `reply_${Date.now()}`, message: replyText, createdAt: new Date().toISOString() } } : r)));
      setReplyingTo(null);
      setReplyText('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getRatingColor = (rating: number) => (rating >= 9 ? 'text-green-600' : rating >= 7 ? 'text-yellow-600' : 'text-red-600');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <Link to="/dashboard/club" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 group">
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Reviews</h1>
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.averageRating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.replyRate}%</div>
              <div className="text-sm text-gray-600">Reply Rate</div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{review.author.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>{review.rating}</div>
                <div className="flex">
                  {[...Array(10)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {review.positives.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Positive Points:</h4>
                  <ul className="space-y-1">
                    {review.positives.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-green-500 mt-1">+</span>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {review.negatives.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Areas for Improvement:</h4>
                  <ul className="space-y-1">
                    {review.negatives.map((n, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-red-500 mt-1">-</span>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1 text-sm text-gray-600"><Heart className="h-4 w-4 text-pink-500" />{review.likes} likes</div>
              <div className="flex items-center gap-1 text-sm text-gray-600"><ThumbsDown className="h-4 w-4 text-gray-400" />{review.dislikes} dislikes</div>
            </div>
            {review.reply && (
              <div className="mt-4 bg-pink-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Reply className="h-5 w-5 text-pink-500 mt-0.5" />
                  <div className="flex-grow">
                    <div className="text-sm font-medium text-pink-700 mb-1">Your Reply</div>
                    <p className="text-sm text-gray-700">{review.reply.message}</p>
                    <div className="text-xs text-gray-500 mt-2">{formatDate(review.reply.createdAt)}</div>
                  </div>
                </div>
              </div>
            )}
            {!review.reply && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {replyingTo === review.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a thoughtful reply to this review..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">{replyText.length}/500 characters</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setReplyingTo(null); setReplyText(''); }} disabled={submittingReply} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50">Cancel</button>
                        <button onClick={() => handleReply(review.id)} disabled={submittingReply || !replyText.trim()} className="px-4 py-2 bg-pink-500 text-white text-sm rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                          {submittingReply ? (<><Loader2 className="h-4 w-4 animate-spin" />Sending...</>) : (<><Send className="h-4 w-4" />Send Reply</>)}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyingTo(review.id)} className="flex items-center gap-2 text-pink-500 hover:text-pink-600 text-sm font-medium">
                    <MessageCircle className="h-4 w-4" />
                    Reply to this review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">When clients write reviews about your club, they'll appear here.</p>
        </div>
      )}
    </div>
  );
}

