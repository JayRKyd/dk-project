import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, MessageCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Review {
  id: string;
  authorName: string;
  date: string;
  rating: number;
  positives: string[];
  negatives: string[];
  reply?: {
    message: string;
  };
  likes: number;
  dislikes: number;
}

const sampleReviews: Review[] = [
  {
    id: '1',
    authorName: 'Mike van Delden',
    date: 'September 2020',
    rating: 8.0,
    positives: [
      'Ordered Alexandra. Communication was good by telephone.',
      'After 1 hour Alexandra arrived, she is great! What a beauty!'
    ],
    negatives: [
      '30 minutes went too quick! I recommend staying longer if you can afford it!'
    ],
    reply: {
      message: 'Thank you for the review. I hope to see you again soon! Kiss!'
    },
    likes: 10,
    dislikes: 0
  },
  {
    id: '2',
    authorName: 'NeverWalkAlone',
    date: 'August 2020',
    rating: 3.0,
    positives: [
      'It is the girl from the pictures'
    ],
    negatives: [
      'Only rushing, everything have to be done quickly. I will not come back.'
    ],
    likes: 8,
    dislikes: 0
  },
  {
    id: '3',
    authorName: 'James Smith',
    date: 'October 2020',
    rating: 8.5,
    positives: [
      'Nice escort. Friendly receptionist.',
      'Many girls to choose. Some slim girls, also more curvy ones. For every men there is a girl.',
      'Can pay with credit card.'
    ],
    negatives: [
      'The price was quite high compared to other escort agencies. My lady also charged many extra\'s, but she is worth it. ;)'
    ],
    reply: {
      message: 'Thank you for booking us. We hope to see you again soon!'
    },
    likes: 15,
    dislikes: 1
  }
];

export default function ReplyReviews() {
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [editingReply, setEditingReply] = useState<string | null>(null);

  const handleSubmitReply = (reviewId: string) => {
    if (!replyText[reviewId]?.trim()) return;

    // Here you would typically make an API call to save the reply
    console.log('Submitting reply for review', reviewId, ':', replyText[reviewId]);
    
    // Clear the reply text after submission
    setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    setEditingReply(null);
  };

  const handleEditReply = (reviewId: string, currentReply: string) => {
    setReplyText(prev => ({ ...prev, [reviewId]: currentReply }));
    setEditingReply(reviewId);
  };

  const handleCancelEdit = (reviewId: string) => {
    setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    setEditingReply(null);
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
        <h1 className="text-2xl font-bold text-gray-900">Your Reviews</h1>
        <p className="text-gray-600 mt-1">
          View and reply to reviews from your clients
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {sampleReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-pink-300">
            {/* Review Header */}
            <div className="p-6 border-b border-pink-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium text-gray-900">{review.authorName}</div>
                  <div className="text-sm text-gray-500">{review.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-full font-bold ${
                    review.rating >= 7 ? 'bg-green-100 text-green-700' :
                    review.rating >= 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Positive Points */}
              {review.positives.map((positive, index) => (
                <div key={`positive-${index}`} className="flex items-start space-x-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-500 text-xl">+</span>
                  </div>
                  <p className="text-gray-700">{positive}</p>
                </div>
              ))}

              {/* Negative Points */}
              {review.negatives.map((negative, index) => (
                <div key={`negative-${index}`} className="flex items-start space-x-2 mb-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-500 text-xl">-</span>
                  </div>
                  <p className="text-gray-700">{negative}</p>
                </div>
              ))}

              {/* Review Stats */}
              <div className="flex items-center space-x-4 mt-4">
                <button className="flex items-center space-x-1 text-gray-500">
                  <ThumbsUp className="h-5 w-5" />
                  <span>{review.likes}</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500">
                  <ThumbsDown className="h-5 w-5" />
                  <span>{review.dislikes}</span>
                </button>
              </div>
            </div>

            {/* Reply Section */}
            <div className="p-6 bg-gray-50">
              {review.reply && !editingReply ? (
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-900">Your Reply</span>
                  </div>
                  <p className="text-gray-700">{review.reply.message}</p>
                  <button
                    onClick={() => handleEditReply(review.id, review.reply?.message || '')}
                    className="text-pink-500 hover:text-pink-600 text-sm mt-2"
                  >
                    Edit Reply
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <MessageCircle className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-900">Write a Reply</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText[review.id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Write your reply..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    {editingReply === review.id && (
                      <button
                        onClick={() => handleCancelEdit(review.id)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      disabled={!replyText[review.id]?.trim()}
                      className={`px-6 py-2 rounded-lg font-medium ${
                        replyText[review.id]?.trim()
                          ? 'bg-pink-500 text-white hover:bg-pink-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {editingReply === review.id ? 'Save' : 'Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {sampleReviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">
              You haven't received any reviews yet. Reviews will appear here when clients leave them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}