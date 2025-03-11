import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';

interface Review {
  id: string;
  lady: {
    name: string;
    imageUrl: string;
  };
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

const reviews: Review[] = [
  {
    id: '1',
    lady: {
      name: 'Alexandra',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'
    },
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
    lady: {
      name: 'Jenny',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
    },
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
    lady: {
      name: 'Melissa',
      imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80'
    },
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

export default function ClientReviews() {
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
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600 mt-1">
          View and manage your reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-pink-300">
            {/* Review Header */}
            <div className="p-6 border-b border-pink-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={review.lady.imageUrl}
                    alt={review.lady.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/ladies/pro/${review.lady.name.toLowerCase()}`}
                      className="font-medium text-gray-900 hover:text-pink-500"
                    >
                      {review.lady.name}
                    </Link>
                    <div className="text-sm text-gray-500">{review.date}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold ${
                  review.rating >= 7 ? 'bg-green-100 text-green-700' :
                  review.rating >= 5 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {review.rating.toFixed(1)}
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

            {/* Lady's Reply */}
            {review.reply && (
              <div className="p-6 bg-pink-50">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <span className="font-medium text-gray-900">Reply from {review.lady.name}</span>
                </div>
                <p className="text-gray-700">{review.reply.message}</p>
              </div>
            )}

            {/* Review Actions */}
            <div className="p-6 bg-gray-50 flex justify-end gap-4">
              <Link
                to={`/write-review/${review.lady.name.toLowerCase()}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Edit className="h-5 w-5" />
                <span>Edit Review</span>
              </Link>
              <button className="flex items-center gap-2 text-red-500 hover:text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Delete Review</span>
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500">
              You haven't written any reviews yet. Share your experiences with others!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}