import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift, X, Coins, Heart, ArrowLeft } from 'lucide-react';

interface GiftOption {
  id: string;
  name: string;
  emoji: string;
  credits: number;
  description: string;
}

const giftOptions: GiftOption[] = [
  {
    id: 'wink',
    name: 'Wink',
    emoji: '😉',
    credits: 1,
    description: 'Send a wink to let her know that you like her'
  },
  {
    id: 'kiss',
    name: 'Kiss',
    emoji: '💋',
    credits: 5,
    description: 'Send her a sweet Kiss'
  },
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    credits: 10,
    description: 'A beautiful rose to show your appreciation'
  },
  {
    id: 'chocolate',
    name: 'Chocolate',
    emoji: '🍫',
    credits: 25,
    description: 'Sweet treats for your favorite person'
  },
  {
    id: 'gift-box',
    name: 'Gift Box',
    emoji: '💝',
    credits: 50,
    description: 'A special gift box filled with love'
  },
  {
    id: 'champagne',
    name: 'Champagne',
    emoji: '🍾',
    credits: 100,
    description: 'Celebrate special moments together'
  },
  {
    id: 'diamond',
    name: 'Diamond',
    emoji: '💎',
    credits: 200,
    description: 'The ultimate expression of admiration'
  },
  {
    id: 'crown',
    name: 'Crown',
    emoji: '👑',
    credits: 250,
    description: 'Treat your Queen like royalty'
  }
];

export default function SendGift() {
  const { name } = useParams();
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [selectedReceivedGift, setSelectedReceivedGift] = useState<string | null>(null);

  const receivedGifts = [
    { emoji: '💎', sender: 'William T.', time: '2 hours ago' },
    { emoji: '🌹', sender: 'Michael P.', time: '3 hours ago' },
    { emoji: '👑', sender: 'James R.', time: '5 hours ago' },
    { emoji: '💝', sender: 'David K.', time: '1 day ago' },
    { emoji: '🍫', sender: 'Robert S.', time: '1 day ago' }
  ];

  const totalCredits = selectedGifts.reduce((total, giftId) => {
    const gift = giftOptions.find(g => g.id === giftId);
    return total + (gift?.credits || 0);
  }, 0);

  const toggleGift = (giftId: string) => {
    setSelectedGifts(prev => 
      prev.includes(giftId)
        ? prev.filter(id => id !== giftId)
        : [...prev, giftId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  if (showConfirmation) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gift Sent!</h2>
          <p className="text-gray-600 mb-6">
            Your gift has been sent to {name}. They will be notified immediately.
          </p>
          <Link
            to={`/ladies/pro/${name?.toLowerCase()}`}
            className="block w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Return to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <Link
            to={`/ladies/pro/${name?.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
          >
            <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Advertisement</span>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80"
              alt="Melissa"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Send a Gift to <Link to={`/ladies/pro/${name?.toLowerCase()}`} className="text-pink-500">Melissa</Link>
            </h1>
          </div>
        </div>

        {/* Received Gifts */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Last 20 Recent Gifts</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {receivedGifts.map((gift, index) => (
              <button
                key={index}
                className="relative group flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-2xl hover:bg-pink-100 transition-colors">
                  {gift.emoji}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{gift.sender}</p>
                  <p className="text-xs text-gray-500">{gift.time}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Gift Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Gift</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {giftOptions.map((gift) => (
                <button
                  key={gift.id}
                  type="button"
                  onClick={() => toggleGift(gift.id)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    selectedGifts.includes(gift.id)
                      ? 'bg-pink-500 text-white shadow-lg scale-105'
                      : 'bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  <div className="text-4xl mb-2">{gift.emoji}</div>
                  <div className="font-medium">{gift.name}</div>
                  <div className="text-sm mt-1 flex items-center justify-center gap-1">
                    <Coins className="h-4 w-4" />
                    <span>{gift.credits} DK Credits</span>
                  </div>
                  <div className={`text-xs mt-2 ${
                    selectedGifts.includes(gift.id) ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    {gift.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a Personal Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
              placeholder="Write a sweet message..."
            />
          </div>

          {/* Summary */}
          {selectedGifts.length > 0 && (
            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Gift Summary</h3>
              <div className="space-y-4 text-gray-700">
                {selectedGifts.map(giftId => {
                  const gift = giftOptions.find(g => g.id === giftId);
                  return gift && (
                    <div key={gift.id} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span>{gift.emoji}</span>
                        <span>{gift.name}</span>
                      </span>
                      <span className="font-medium">{gift.credits} DK Credits</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 mt-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost</span>
                  <span className="font-medium text-pink-500">
                    {totalCredits} DK Credits
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              id="confirmSend"
              checked={confirmSend}
              onChange={(e) => setConfirmSend(e.target.checked)}
              className="rounded border-pink-300 text-pink-500 focus:ring-pink-500"
              required
            />
            <label htmlFor="confirmSend" className="text-gray-700">
              Are you 100% sure you want to send these Gifts? This can not be undone
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-[#E91E63] text-white py-3 rounded-lg font-medium text-lg hover:bg-[#D81B60] transition-colors ${
              (selectedGifts.length === 0 || !confirmSend) && 'opacity-50 cursor-not-allowed'
            }`}
            disabled={selectedGifts.length === 0 || !confirmSend}
          >
            Confirm Send Gift
          </button>
          <p className="text-sm text-gray-500 text-center">
            By sending a gift you agree to our{' '}
            <Link to="/terms" className="text-pink-500 hover:text-pink-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-pink-500 hover:text-pink-600">
              Privacy Policy
            </Link>
          </p>
        </form>

        {/* FAQ Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What are DK Credits?</h3>
              <p className="text-gray-600">
                DK Credits are our virtual currency used to send gifts and unlock exclusive content. You can purchase DK Credits in your account settings.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">How do gifts work?</h3>
              <p className="text-gray-600">
                When you send a gift, the recipient will be notified immediately. They'll see your gift and personal message on their profile.
                Gifts are a great way to show your appreciation and stand out.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Can I send multiple gifts?</h3>
              <p className="text-gray-600">
                Yes! You can send as many gifts as you like. Each gift will be displayed on the recipient's profile, showing your generosity.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Are gifts refundable?</h3>
              <p className="text-gray-600">
                Once a gift is sent, it cannot be refunded. Please make sure you select the right gift and recipient before confirming.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Where can I see my sent gifts?</h3>
              <p className="text-gray-600">
                You can view all your sent gifts in your account history. This includes the gift type, recipient, and when it was sent.
              </p>
            </div>
            
            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">How do I get more credits?</h3>
              <p className="text-gray-600">
                You can purchase DK Credits in your account settings. We offer various packages to suit your needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}