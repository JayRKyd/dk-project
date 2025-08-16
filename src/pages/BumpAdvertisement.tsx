import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, Shield, Check, Sparkles, ArrowLeft, Clock, Calendar, ArrowUp, CreditCard, Wallet, ShieldCheck, Coins } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { getAdvertisementStatus, bumpAdvertisement, AdvertisementStatus } from '../services/advertisementService';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService } from '../services/clientDashboardService';

interface BumpPackage {
  id: string;
  name: string;
  price: number;
  bumps: number;
  period: string;
  savings?: number;
  credits: number;
}

const bumpPackages: BumpPackage[] = [
  {
    id: 'single',
    name: 'Single Bump',
    price: 2,
    bumps: 1,
    period: 'bump',
    credits: 10
  },
  {
    id: 'weekly',
    name: '10 Bumps Pack',
    price: 18,
    bumps: 10,
    period: 'week',
    savings: 10,
    credits: 90
  },
  {
    id: 'monthly',
    name: 'Monthly Bumps',
    price: 50,
    bumps: 30,
    period: 'month',
    savings: 17,
    credits: 250
  }
];

export default function BumpAdvertisement() {
  const [selectedPackage, setSelectedPackage] = useState<BumpPackage | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { profile } = useUserProfile();
  const [status, setStatus] = useState<AdvertisementStatus | undefined>();
  const [remainingBumps, setRemainingBumps] = useState<number>(0);
  const [lastBumpText, setLastBumpText] = useState<string>('Never');
  const [availableCredits, setAvailableCredits] = useState<number>(0); // keep 0 until credit system is wired
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  const formatRelativeTime = (iso?: string | null): string => {
    if (!iso) return 'Never';
    const now = Date.now();
    const ts = new Date(iso).getTime();
    if (isNaN(ts)) return 'Never';
    const diffMs = Math.max(0, now - ts);
    const minutes = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  useEffect(() => {
    const load = async () => {
      if (!profile?.id) return;
      // Load credits from credit system
      if (user?.id) {
        const credits = await clientDashboardService.getUserCredits(user.id);
        setAvailableCredits(credits);
      } else {
        setAvailableCredits(0);
      }
      const s = await getAdvertisementStatus(profile.id);
      setStatus(s);
      setRemainingBumps(s?.remaining_free_bumps ?? 0);
      setLastBumpText(formatRelativeTime(s?.last_bumped_at));
    };
    load();
  }, [profile?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bump Your Advertisement</h1>
            <p className="text-gray-600 mt-1">
              Increase your visibility by bumping your advertisement to the top
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="bg-pink-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Remaining bumps:</span>
                <span className="ml-2 font-bold text-pink-500">{remainingBumps}</span>
              </div>
              <div className="bg-pink-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Last bump:</span>
                <span className="ml-2 font-medium text-gray-900">{lastBumpText}</span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (!profile?.id) return;
              setProcessing(true);
              setMessage('');
              try {
                // Prefer free bump if available, else attempt credit bump using 10 DK
                const useCredit = (status?.remaining_free_bumps || 0) <= 0;
                const creditsNeeded = selectedPackage?.credits || 10;
                if (useCredit) {
                  if (availableCredits < creditsNeeded) {
                    setMessage('Not enough credits. Please top up first.');
                    setProcessing(false);
                    return;
                  }
                }
                const result = await bumpAdvertisement(profile.id, useCredit ? 'credit' : 'free', useCredit ? creditsNeeded : 0);
                setMessage(result.message);
                // Refresh status
                const s = await getAdvertisementStatus(profile.id);
                setStatus(s);
                setRemainingBumps(s?.remaining_free_bumps ?? 0);
                setLastBumpText(formatRelativeTime(s?.last_bumped_at));
                if (useCredit && result.success && user?.id) {
                  // Deduct credits already handled inside RPC; reload balance
                  const credits = await clientDashboardService.getUserCredits(user.id);
                  setAvailableCredits(credits);
                }
              } catch (e: any) {
                setMessage(e?.message || 'Failed to bump');
              } finally {
                setProcessing(false);
              }
            }}
            className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
            disabled={processing}
          >
            <ArrowUp className="h-5 w-5" />
            <span>Bump your Advertisement Now</span>
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Single Bump */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Single Bump</h3>
                <div className="text-gray-600 mb-4">
                  <p>Move your ad to the top once</p>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  €2
                  <span className="text-gray-500 text-base font-normal">/bump</span>
                  <div className="text-sm text-pink-500">10 DK credits</div>
                </div>
                <button 
                  onClick={() => setSelectedPackage(bumpPackages[0])}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    selectedPackage?.id === 'single'
                      ? 'bg-green-500 text-white'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  <ArrowUp className="h-5 w-5" />
                  <span>Get Single Bump</span>
                </button>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Move to top of search results
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Stay on top for 24 hours
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Increased visibility
                  </li>
                </ul>
              </div>
            </div>

            {/* Weekly Bumps */}
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-sm overflow-hidden border-2 border-pink-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-pink-600 mb-2">10 Bumps Pack</h3>
                <p className="text-gray-600 mb-4">10 bumps to use in one week</p>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  €18
                  <span className="text-gray-500 text-base font-normal">/week</span>
                  <div className="text-sm text-pink-500">90 DK credits</div>
                </div>
                <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-block mb-4">
                  Save 10%
                </div>
                <button
                  onClick={() => setSelectedPackage(bumpPackages[1])}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    selectedPackage?.id === 'weekly'
                      ? 'bg-green-500 text-white'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  Get Weekly Pack
                </button>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    10 bumps to use in 7 days
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Flexible usage
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Save 10% compared to single bumps
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Best for regular promotion
                  </li>
                </ul>
              </div>
            </div>

            {/* Monthly Bumps */}
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-sm overflow-hidden border-2 border-yellow-200">
              <div className="p-6">
                <h3 className="text-lg font-bold text-yellow-600 mb-2 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Monthly Bumps
                </h3>
                <p className="text-gray-600 mb-4">30 bumps to use in one month</p>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  €50
                  <span className="text-gray-500 text-base font-normal">/month</span>
                  <div className="text-sm text-pink-500">250 DK credits</div>
                </div>
                <div className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full inline-block mb-4">
                  Save 17%
                </div>
                <button
                  onClick={() => setSelectedPackage(bumpPackages[2])}
                  className={`w-full px-4 py-2 rounded-lg transition-colors ${
                    selectedPackage?.id === 'monthly'
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:from-yellow-500 hover:to-pink-600'
                  }`}
                >
                  Get Monthly Pack
                </button>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    30 bumps to use in 30 days
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Maximum flexibility
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Save 17% compared to single bumps
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Best value for money
                  </li>
                  <li className="flex items-center text-sm text-gray-900">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* DK Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">DK Credits</h2>
              <Coins className="h-5 w-5 text-pink-500" />
            </div>
            <div className="bg-pink-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Available Credits</span>
                <span className="text-2xl font-bold text-pink-500">{availableCredits}</span>
              </div>
              <div className="text-sm text-gray-500">
                Use credits to unlock fan posts and send gifts
              </div>
              {message && (
                <div className="mt-3 text-sm text-gray-700">{message}</div>
              )}
            </div>
          </div>

          {selectedPackage ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{selectedPackage.name}</div>
                    <div className="text-sm text-gray-500">{selectedPackage.bumps} bumps</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">€{selectedPackage.price}</div>
                    <div className="text-sm text-pink-500">{selectedPackage.credits} DK</div>
                  </div>
                </div>

                {/* Savings */}
                {selectedPackage.savings && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-green-700">
                      <span>Your Savings:</span>
                      <div className="text-right">
                        <div className="font-medium">
                          €{(selectedPackage.price * selectedPackage.savings / 100).toFixed(2)}
                        </div>
                        <div className="text-sm">
                          {selectedPackage.credits * selectedPackage.savings / 100} DK
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms Agreement */}
                <div className="space-y-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-pink-500 hover:text-pink-600 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-pink-500 hover:text-pink-600 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  <button
                    disabled={!agreeToTerms}
                    className={`w-full py-3 rounded-lg font-medium ${
                      agreeToTerms
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Confirm Purchase
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Accepted Payment Methods</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <CreditCard className="h-5 w-5" />
                      <span>Credit Card</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Wallet className="h-5 w-5" />
                      <span>Digital Wallet</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <ShieldCheck className="h-5 w-5" />
                      <span>Secure Payment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUp className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a Package
              </h3>
              <p className="text-gray-500 text-sm">
                Choose a bump package to see the order summary
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How Bumping Works */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">How Bumping Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Instant Visibility</h4>
              <p className="text-sm text-gray-600">
                Your advertisement moves to the top of search results immediately after bumping
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">24-Hour Effect</h4>
              <p className="text-sm text-gray-600">
                Your ad stays in top positions for 24 hours before returning to normal ranking
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-pink-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Flexible Usage</h4>
              <p className="text-sm text-gray-600">
                Use your bumps anytime within the validity period of your package
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              How often can I bump my ad?
            </h3>
            <p className="text-gray-600">
              You can bump your ad as often as you like, but each bump lasts for 24 hours.
              We recommend spacing out your bumps to maintain consistent visibility.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              What happens after I bump?
            </h3>
            <p className="text-gray-600">
              Your advertisement will immediately move to the top of search results and stay there
              for 24 hours, giving you maximum exposure to potential clients.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Can I schedule bumps?
            </h3>
            <p className="text-gray-600">
              Yes! With weekly and monthly packages, you can schedule your bumps in advance
              to ensure consistent visibility during peak hours.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Are unused bumps refundable?
            </h3>
            <p className="text-gray-600">
              Unused bumps expire at the end of their validity period (7 days for weekly pack,
              30 days for monthly pack) and are not refundable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}