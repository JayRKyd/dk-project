import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Send, Calendar, ChevronLeft, ChevronRight, Coins, Gift } from 'lucide-react';

interface Gift {
  id: string;
  sender: {
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
  collected: boolean;
  date: string;
  time: string;
}

const gifts: Gift[] = [
  {
    id: '1',
    sender: {
      name: 'William T.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Diamond',
      emoji: '💎',
      credits: 200
    },
    message: 'You are absolutely stunning! Hope to see you again soon.',
    collected: false,
    date: '2024-01-12',
    time: '15:30'
  },
  {
    id: '2',
    sender: {
      name: 'Michael P.',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Rose',
      emoji: '🌹',
      credits: 10
    },
    message: 'Thank you for the wonderful time!',
    reply: 'Thank you for the lovely rose! 😊',
    collected: true,
    date: '2024-01-12',
    time: '12:45'
  },
  {
    id: '3',
    sender: {
      name: 'James R.',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Crown',
      emoji: '👑',
      credits: 250
    },
    message: 'You deserve to be treated like a queen!',
    date: '2024-01-11',
    time: '18:20'
  },
  {
    id: '4',
    sender: {
      name: 'David K.',
      imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&q=80'
    },
    type: {
      name: 'Gift Box',
      emoji: '💝',
      credits: 50
    },
    message: 'Looking forward to our next meeting!',
    reply: 'Thank you for the gift! See you soon! 💋',
    collected: false,
    date: '2024-01-11',
    time: '14:15'
  }
];

// Group gifts by date
const groupGiftsByDate = (gifts: Gift[]) => {
  const groups: { [key: string]: Gift[] } = {};
  
  gifts.forEach(gift => {
    if (!groups[gift.date]) {
      groups[gift.date] = [];
    }
    groups[gift.date].push(gift);
  });
  
  return groups;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function GiftsReceived() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  const groupedGifts = groupGiftsByDate(gifts);
  const dates = Object.keys(groupedGifts).sort().reverse();
  
  // Calculate total uncollected credits
  const uncollectedCredits = groupedGifts[selectedDate]?.reduce((total, gift) => {
    if (!gift.collected) {
      return total + gift.type.credits;
    }
    return total;
  }, 0) || 0;

  // Calculate total credits received
  const totalCredits = gifts.reduce((sum, gift) => sum + gift.type.credits, 0);

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = dates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    }
  };

  const handleReply = (giftId: string) => {
    if (replyText[giftId]?.trim()) {
      console.log('Sending reply for gift', giftId, ':', replyText[giftId]);
      // Here you would typically make an API call to save the reply
      setReplyText(prev => ({ ...prev, [giftId]: '' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Gifts Received</h1>
            <p className="text-gray-600 mt-1">
              View and respond to gifts from your admirers
            </p>
            <p className="text-sm text-pink-500 mt-1">
              Total received: {totalCredits} DK Credits • Uncollected: {uncollectedCredits} DK Credits
            </p>
          </div>
          <div className="flex items-center gap-4">
            {uncollectedCredits > 0 && (
              <button
                onClick={() => {
                  // Handle collecting credits
                  console.log('Collecting credits:', uncollectedCredits);
                }}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
              >
                <Gift className="h-5 w-5" />
                <span>Collect {uncollectedCredits} DK Credits</span>
              </button>
            )}
            <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
              <Heart className="h-5 w-5" />
              <span className="font-medium">{gifts.length} Gifts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={dates.indexOf(selectedDate) === dates.length - 1}
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-pink-500" />
            <span className="text-lg font-medium text-gray-900">
              {formatDate(selectedDate)}
            </span>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={dates.indexOf(selectedDate) === 0}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Date Quick Select */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                date === selectedDate
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Gifts List */}
      <div className="space-y-6">
        {groupedGifts[selectedDate]?.map((gift) => (
          <div key={gift.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Gift Header */}
            <div className="p-6 flex flex-col sm:flex-row items-start gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={gift.sender.imageUrl}
                  alt={gift.sender.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{gift.sender.name}</h3>
                  <p className="text-sm text-gray-500">
                    {gift.date} at {gift.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <div className="text-5xl transform transition-all hover:scale-110">{gift.type.emoji}</div>
                <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                  <Coins className="h-4 w-4" />
                  <span>{gift.type.credits} DK</span>
                </div>
              </div>
            </div>

            {/* Gift Message */}
            {gift.message && (
              <div className="px-6 pb-6">
                <p className="text-gray-700">{gift.message}</p>
              </div>
            )}

            {/* Reply Section */}
            <div className="px-6 pb-6">
              {gift.reply ? (
                <div className="bg-pink-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {gift.collected ? (
                      <span className="text-green-600">Collected</span>
                    ) : (
                      <>
                        <Coins className="h-4 w-4" />
                        <span>{gift.type.credits} DK</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-700">{gift.reply}</p>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText[gift.id] || ''}
                    onChange={(e) => setReplyText(prev => ({
                      ...prev,
                      [gift.id]: e.target.value
                    }))}
                    placeholder="Write a thank you message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleReply(gift.id)}
                    className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 font-medium"
                  >
                    <Send className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* No Gifts Message */}
        {(!groupedGifts[selectedDate] || groupedGifts[selectedDate].length === 0) && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gifts received on this date</h3>
            <p className="text-gray-500">Check other dates or wait for new gifts from your admirers</p>
          </div>
        )}
      </div>
    </div>
  );
}