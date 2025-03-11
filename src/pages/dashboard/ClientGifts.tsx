import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Gift } from 'lucide-react';

interface GiftSent {
  id: string;
  recipient: {
    name: string;
    imageUrl: string;
  };
  type: {
    name: string;
    emoji: string;
    credits: number;
  };
  message?: string;
  reply?: string;
  date: string;
  time: string;
}

const giftsSent: GiftSent[] = [
  {
    id: '1',
    recipient: {
      name: 'Alexandra',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Diamond',
      emoji: '💎',
      credits: 200
    },
    message: 'You are absolutely stunning! Hope to see you again soon.',
    reply: 'Thank you so much for the lovely gift! 💋',
    date: '2024-01-12',
    time: '15:30'
  },
  {
    id: '2',
    recipient: {
      name: 'Melissa',
      imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Rose',
      emoji: '🌹',
      credits: 10
    },
    message: 'Thank you for the wonderful time!',
    date: '2024-01-11',
    time: '12:45'
  },
  {
    id: '3',
    recipient: {
      name: 'Jenny',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Crown',
      emoji: '👑',
      credits: 250
    },
    message: 'You deserve to be treated like a queen!',
    reply: 'Thank you my king! 👑',
    date: '2024-01-10',
    time: '18:20'
  }
];

export default function ClientGifts() {
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
      </div>

      {/* Gifts List */}
      <div className="space-y-6">
        {giftsSent.map((gift) => (
          <div key={gift.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Gift Header */}
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={gift.recipient.imageUrl}
                  alt={gift.recipient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/ladies/pro/${gift.recipient.name.toLowerCase()}`}
                    className="font-medium text-gray-900 hover:text-pink-500"
                  >
                    {gift.recipient.name}
                  </Link>
                  <div className="text-sm text-gray-500">
                    {gift.date} at {gift.time}
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

            {/* Reply */}
            {gift.reply && (
              <div className="px-6 pb-6">
                <div className="bg-pink-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-pink-500" />
                    <span className="font-medium text-gray-900">Reply from {gift.recipient.name}</span>
                  </div>
                  <p className="text-gray-700">{gift.reply}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4">
              <Link
                to={`/send-gift/${gift.recipient.name}`}
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Send Another Gift
              </Link>
              <Link
                to={`/ladies/pro/${gift.recipient.name.toLowerCase()}`}
                className="text-gray-600 hover:text-gray-900"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}

        {giftsSent.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Gifts Sent Yet</h3>
            <p className="text-gray-500">
              You haven't sent any gifts yet. Send a gift to show your appreciation!
            </p>
            <Link
              to="/"
              className="mt-4 inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Browse Ladies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}