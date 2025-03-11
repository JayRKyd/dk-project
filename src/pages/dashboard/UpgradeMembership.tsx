import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Crown, 
  Star, 
  Shield, 
  Check, 
  ArrowLeft, 
  Calendar,
  CreditCard,
  Wallet,
  ShieldCheck,
  Camera,
  MessageCircle,
  Clock,
  Heart,
  TrendingUp,
  Eye,
  Coins,
  DollarSign
} from 'lucide-react';

interface MembershipTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  gradient?: string;
  border?: string;
}

const tiers: MembershipTier[] = [
  {
    id: 'pro',
    name: 'PRO',
    icon: <Star className="h-6 w-6 text-pink-500" />,
    price: 5,
    description: 'Perfect for professionals',
    features: [
      'Verified Badge',
      'Priority Support',
      'Advanced Statistics',
      'Fan Posts',
      'Online Booking System',
      'Premium Profile Features',
      'Boost Advertisement',
      'Reply to Reviews',
      'Accept Gifts',
      'Custom Profile URL'
    ]
  },
  {
    id: 'pro-plus',
    name: 'PRO PLUS',
    icon: <Shield className="h-6 w-6 text-pink-600" />,
    price: 10,
    description: 'For serious professionals',
    features: [
      'Everything in PRO',
      'Featured in Search Results',
      'Custom URL',
      'Premium Support',
      'Priority Placement',
      'Advanced Analytics',
      'Unlimited Fan Posts',
      'Custom Profile Design',
      'Priority Booking System',
      'VIP Customer Support'
    ],
    popular: true,
    gradient: 'from-pink-50 to-white',
    border: 'border-2 border-pink-200'
  },
  {
    id: 'ultra',
    name: 'ULTRA',
    icon: <Crown className="h-6 w-6 text-yellow-600" />,
    price: 50,
    description: 'Ultimate visibility & features',
    features: [
      'Everything in PRO PLUS',
      'Top of Search Results',
      'Exclusive Badge',
      'VIP Support',
      'Maximum Visibility',
      'Custom Profile Themes',
      'Priority Verification',
      'Advanced Booking Tools',
      'Premium Analytics',
      'Dedicated Account Manager'
    ],
    gradient: 'from-yellow-50 to-white',
    border: 'border-2 border-yellow-200'
  }
];

export default function UpgradeMembership() {
  const location = useLocation();
  const initialTier = location.state?.selectedTier || 'pro-plus';
  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [duration, setDuration] = useState<number>(30);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const selectedTierData = tiers.find(tier => tier.id === selectedTier);
  const totalCost = selectedTierData ? selectedTierData.price * duration : 0;

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade Membership</h1>
            <p className="text-gray-600 mt-1">
              Choose your membership tier and duration to unlock more features
            </p>
          </div>
          <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
            <Star className="h-5 w-5" />
            <span className="font-medium">FREE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Membership Tiers */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative p-6 rounded-xl text-left transition-all ${
                  tier.gradient ? `bg-gradient-to-br ${tier.gradient}` : 'bg-white'
                } ${tier.border || ''} ${
                  selectedTier === tier.id
                    ? 'ring-2 ring-pink-500 shadow-lg scale-[1.02]'
                    : 'shadow-sm hover:shadow-md'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {tier.icon}
                    <h3 className={`text-xl font-bold ${
                      tier.id === 'ultra' ? 'text-yellow-600' :
                      tier.id === 'pro-plus' ? 'text-pink-600' :
                      'text-pink-500'
                    }`}>{tier.name}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{tier.description}</p>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">€{tier.price}</span>
                    <span className="text-gray-500 text-base font-normal ml-1">/per day</span>
                  </div>
                  <div className="text-sm font-medium text-pink-500">
                    {tier.price * 5} DK credits/day
                  </div>
                </div>@@ .. @@
                <ul className="space-y-3 text-sm">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Duration Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Select Duration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 3, 7, 14, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setDuration(days)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    duration === days
                      ? 'bg-pink-500 text-white shadow-lg scale-[1.02]'
                      : 'bg-pink-50 hover:bg-pink-100'
                  }`}
                >
                  <div className="text-2xl mb-1">{days}</div>
                  <div className="text-sm">{days === 1 ? 'Day' : 'Days'}</div>
                  {days === 30 && (
                    <div className="mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full inline-block flex items-center gap-1">
                      <span>Save 10%</span>
                      <span>•</span>
                      <span>{days * 5} DK</span>
                    </div>
                  )}
                  {days === 90 && (
                    <div className="mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full inline-block flex items-center gap-1">
                      <span>Save 20%</span>
                      <span>•</span>
                      <span>{days * 5} DK</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Membership Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="bg-pink-100 p-4 rounded-lg">
                  <Eye className="h-6 w-6 text-pink-500 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Increased Visibility</h3>
                  <p className="text-sm text-gray-600">
                    Get up to 300% more profile views with premium placement
                  </p>
                </div>
                <div className="bg-pink-100 p-4 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pink-500 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Higher Earnings</h3>
                  <p className="text-sm text-gray-600">
                    PRO members earn 2.5x more on average
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-pink-100 p-4 rounded-lg">
                  <Camera className="h-6 w-6 text-pink-500 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Fan Posts</h3>
                  <p className="text-sm text-gray-600">
                    Create exclusive content and earn from unlocks
                  </p>
                </div>
                <div className="bg-pink-100 p-4 rounded-lg">
                  <Clock className="h-6 w-6 text-pink-500 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Online Booking</h3>
                  <p className="text-sm text-gray-600">
                    Accept bookings 24/7 with our booking system
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-pink-100 p-4 rounded-lg">
                  <Heart className="h-6 w-6 text-pink-500 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Gifts & Tips</h3>
                  <p className="text-sm text-gray-600">
                    Receive gifts and tips from your admirers
                  </p>
                </div>
                <div className="bg-pink-100 p-4 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-pink-500 mb-2" />
                  <h3 className="font-medium text-gray-900 mb-1">Priority Support</h3>
                  <p className="text-sm text-gray-600">
                    Get help when you need it with priority support
                  </p>
                </div>
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
                <span className="text-2xl font-bold text-pink-500">170</span>
              </div>
              <div className="text-sm text-gray-500">
                Use credits to unlock fan posts and send gifts
              </div>
            </div>
            <Link
              to="/dashboard/lady/credits"
              className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="h-5 w-5" />
              <span>Buy More Credits</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            {selectedTierData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{selectedTierData.name}</div>
                    <div className="text-sm text-gray-500">{duration} days</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">€{selectedTierData.price}/day</div>
                    <div className="text-sm text-gray-500">
                      Total: €{totalCost}
                    </div>
                    <div className="text-sm text-pink-500">
                      Total: {totalCost * 5} DK
                    </div>
                  </div>
                </div>

                {/* Savings */}
                {duration >= 30 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between text-green-700">
                      <span>Your Savings:</span>
                      <div className="text-right">
                        <div className="font-medium">
                          €{duration >= 90 ? totalCost * 0.2 : totalCost * 0.1}
                        </div>
                        <div className="text-sm">
                          {duration >= 90 ? totalCost * 5 * 0.2 : totalCost * 5 * 0.1} DK
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
                    Upgrade Now
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}