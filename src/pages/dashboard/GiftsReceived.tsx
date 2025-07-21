import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Send, Calendar, ChevronLeft, ChevronRight, Coins, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { giftService, type GiftWithReplies } from '../../services/giftService';

export default function GiftsReceived() {
  const { user } = useAuth();
  const [gifts, setGifts] = useState<GiftWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [sendingReply, setSendingReply] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user?.id) {
      loadGiftsReceived();
    }
  }, [user?.id]);

  const loadGiftsReceived = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const giftsData = await giftService.getGiftsWithReplies(user.id, 'received');
      setGifts(giftsData);
    } catch (err) {
      console.error('Error loading gifts received:', err);
      setError('Failed to load gifts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (giftId: string) => {
    if (!replyText[giftId]?.trim()) return;
    
    try {
      setSendingReply(prev => ({ ...prev, [giftId]: true }));
      await giftService.sendGiftReply(giftId, replyText[giftId]);
      setReplyText(prev => ({ ...prev, [giftId]: '' }));
      // Reload gifts to show the new reply
      await loadGiftsReceived();
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(prev => ({ ...prev, [giftId]: false }));
    }
  };

// Group gifts by date
const groupGiftsByDate = (gifts: GiftWithReplies[]) => {
  const groups: { [key: string]: GiftWithReplies[] } = {};
  
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

  const groupedGifts = groupGiftsByDate(gifts);
  const dates = Object.keys(groupedGifts).sort().reverse();
  
  // Calculate total credits received (all gifts are considered collected in new system)
  const totalCredits = gifts.reduce((sum, gift) => sum + gift.type.credits, 0);
  const uncollectedCredits = 0; // In new system, all gifts are automatically collected

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = dates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    }
  };



  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/lady"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gifts Received</h1>
          <p className="text-gray-600 mt-1">Loading gifts...</p>
        </div>

        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/lady"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gifts Received</h1>
          <p className="text-gray-600 mt-1">Error loading gifts</p>
        </div>

        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Gifts</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadGiftsReceived}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                  src={gift.recipient.imageUrl}
                  alt={gift.recipient.name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{gift.recipient.name}</h3>
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

            {/* Replies Section */}
            <div className="px-6 pb-6">
              {/* Show existing replies */}
              {gift.replies && gift.replies.length > 0 && (
                <div className="mb-4 space-y-3">
                  {gift.replies.map((reply) => (
                    <div key={reply.id} className="bg-pink-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-medium text-gray-900">Reply from {reply.sender_name}</span>
                      </div>
                      <p className="text-gray-700">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply input */}
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
                  disabled={sendingReply[gift.id] || !replyText[gift.id]?.trim()}
                  className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                  <span>{sendingReply[gift.id] ? 'Sending...' : 'Reply'}</span>
                </button>
              </div>
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