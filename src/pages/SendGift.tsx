import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Coins, Heart, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService } from '../services/clientDashboardService';

interface GiftOption { id: string; name: string; emoji: string; credits: number; }

interface RecipientGift {
  emoji: string;
  sender: string;
  time: string;
}

interface RecipientProfile {
  user_id: string;
  name: string;
  image_url?: string;
}

export default function SendGift() {
  const { name } = useParams();
  const { user } = useAuth();
  const [selectedGifts, setSelectedGifts] = useState<string[]>([]);
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([]);
  const [message, setMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  
  // New state for backend integration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [recipientProfile, setRecipientProfile] = useState<RecipientProfile | null>(null);
  const [recentGifts, setRecentGifts] = useState<RecipientGift[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const totalCredits = selectedGifts.reduce((total, giftId) => {
    const gift = giftOptions.find(g => g.id === giftId);
    return total + (gift?.credits || 0);
  }, 0);

  const canAffordGifts = userCredits >= totalCredits;

  // Load initial data
  useEffect(() => {
    if (name && user?.id) {
      loadPageData();
    }
  }, [name, user?.id]);

  useEffect(() => {
    // Load gift types from DB
    const fetchGiftTypes = async () => {
      try {
        const types = await clientDashboardService.getGiftTypes();
        setGiftOptions(types);
      } catch (e) {
        console.warn('Failed to load gift types; falling back to none');
        setGiftOptions([]);
      }
    };
    fetchGiftTypes();
  }, []);

  const loadPageData = async () => {
    if (!name || !user?.id) return;
    
    try {
      setPageLoading(true);
      setError(null);

      // Load recipient profile, user credits, and recent gifts in parallel
      const [recipientData, credits, giftsData] = await Promise.all([
        clientDashboardService.getRecipientProfile(name),
        clientDashboardService.getUserCredits(user.id),
        clientDashboardService.getRecentGiftsReceived(name, 20)
      ]);

      setRecipientProfile(recipientData);
      setUserCredits(credits);
      setRecentGifts(giftsData);

      if (!recipientData) {
        setError(`Profile "${name}" not found. Please check the name and try again.`);
      }
    } catch (err) {
      console.error('Error loading page data:', err);
      setError('Unable to load profile information. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const toggleGift = (giftId: string) => {
    setSelectedGifts(prev => 
      prev.includes(giftId)
        ? prev.filter(id => id !== giftId)
        : [...prev, giftId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !name || !recipientProfile) {
      setError('Missing required information. Please refresh and try again.');
      return;
    }

    if (!canAffordGifts) {
      setError(`Insufficient credits. You need ${totalCredits} credits but only have ${userCredits}.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare gift types for sending
      const giftTypesToSend = selectedGifts.map(giftId => {
        const gift = giftOptions.find(g => g.id === giftId)!;
        return { type: gift.name, credits: gift.credits };
      });

      // Send the gifts
      await clientDashboardService.sendGift(
        user.id,
        name,
        giftTypesToSend,
        message.trim() || undefined
      );

      // Update user credits after successful send
      const newCredits = await clientDashboardService.getUserCredits(user.id);
      setUserCredits(newCredits);

      setShowConfirmation(true);
    } catch (err) {
      console.error('Error sending gift:', err);
      setError(err instanceof Error ? err.message : 'Failed to send gift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (pageLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !recipientProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="mb-6">
            <Link
              to="/ladies"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
            >
              <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
              <span>Back to Ladies</span>
            </Link>
          </div>
          
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/ladies"
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Browse Ladies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gift Sent!</h2>
          <p className="text-gray-600 mb-2">
            Your {selectedGifts.length > 1 ? 'gifts have' : 'gift has'} been sent to {recipientProfile?.name || name}.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            They will be notified immediately and can see your gift on their profile.
          </p>
          <div className="space-y-3">
            <Link
              to={`/ladies/pro/${name?.toLowerCase()}`}
              className="block w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Return to Profile
            </Link>
            <Link
              to="/dashboard/gifts"
              className="block w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View My Gifts
            </Link>
          </div>
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
              src={recipientProfile?.image_url || "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80"}
              alt={recipientProfile?.name || name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Send a Gift to <Link to={`/ladies/pro/${name?.toLowerCase()}`} className="text-pink-500">{recipientProfile?.name || name}</Link>
              </h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Your Credits</div>
            <div className="flex items-center gap-1 text-lg font-semibold text-pink-600">
              <Coins className="h-5 w-5" />
              <span>{userCredits}</span>
            </div>
          </div>
        </div>

        {/* Recent Gifts */}
        {recentGifts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Gifts Received</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentGifts.map((gift, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center min-w-[80px]"
                >
                  <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center text-2xl mb-2">
                    {gift.emoji}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[70px]">{gift.sender}</p>
                    <p className="text-xs text-gray-500">{gift.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Unable to send gift</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Credit Warning */}
          {totalCredits > 0 && !canAffordGifts && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Insufficient Credits</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You need {totalCredits} credits but only have {userCredits}. 
                    <Link to="/dashboard/credits" className="font-medium underline ml-1">
                      Purchase more credits
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Gift Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Gift</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {giftOptions.map((gift) => {
                const isSelected = selectedGifts.includes(gift.id);
                const canAffordThisGift = userCredits >= gift.credits;
                
                return (
                  <button
                    key={gift.id}
                    type="button"
                    onClick={() => canAffordThisGift && toggleGift(gift.id)}
                    disabled={!canAffordThisGift}
                    className={`p-4 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-lg scale-105'
                        : canAffordThisGift
                        ? 'bg-pink-50 hover:bg-pink-100'
                        : 'bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-4xl mb-2">{gift.emoji}</div>
                    <div className="font-medium">{gift.name}</div>
                    <div className="text-sm mt-1 flex items-center justify-center gap-1">
                      <Coins className="h-4 w-4" />
                      <span>{gift.credits} DK Credits</span>
                    </div>
                    {/* optional description removed since gift types are dynamic */}
                    {!canAffordThisGift && (
                      <div className="text-xs mt-1 text-red-500 font-medium">
                        Insufficient credits
                      </div>
                    )}
                  </button>
                );
              })}
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
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </div>
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
                  <span className={`font-medium ${canAffordGifts ? 'text-pink-500' : 'text-red-500'}`}>
                    {totalCredits} DK Credits
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Your Balance</span>
                  <span className={userCredits >= totalCredits ? 'text-green-600' : 'text-red-500'}>
                    {userCredits} DK Credits
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
            className={`w-full py-3 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 ${
              (selectedGifts.length === 0 || !confirmSend || !canAffordGifts || loading)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#E91E63] text-white hover:bg-[#D81B60]'
            }`}
            disabled={selectedGifts.length === 0 || !confirmSend || !canAffordGifts || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending Gift...
              </>
            ) : (
              'Confirm Send Gift'
            )}
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