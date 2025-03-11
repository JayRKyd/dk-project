import React from 'react';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-800">{review.authorName}</span>
            <span className="text-gray-500">review of</span>
            <a href={review.serviceLink} className="text-pink-500 hover:text-pink-600">
              {review.serviceName}
            </a>
          </div>
          <div className="text-sm text-gray-500">{review.date}</div>
        </div>
        <div className="text-2xl font-bold text-pink-500">{review.rating.toFixed(1)}</div>
      </div>

      {/* Positives */}
      {review.positives.map((positive, index) => (
        <div key={`positive-${index}`} className="flex items-start space-x-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-500 text-xl">+</span>
          </div>
          <p className="text-gray-700">{positive}</p>
        </div>
      ))}

      {/* Negatives */}
      {review.negatives.map((negative, index) => (
        <div key={`negative-${index}`} className="flex items-start space-x-2 mb-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-500 text-xl">-</span>
          </div>
          <p className="text-gray-700">{negative}</p>
        </div>
      ))}

      {/* Reply */}
      {review.reply && (
        <div className="mt-4 bg-pink-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <span className="font-medium text-pink-500">Reply from {review.reply.from}</span>
          </div>
          <p className="text-gray-700">{review.reply.message}</p>
        </div>
      )}

      {/* Likes and Dislikes */}
      <div className="flex items-center space-x-4 mt-4">
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <ThumbsUp className="h-5 w-5" />
          <span>{review.likes}</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
          <ThumbsDown className="h-5 w-5" />
          <span>{review.dislikes}</span>
        </button>
      </div>
    </div>
  );
}