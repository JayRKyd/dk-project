import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Star, Shield, Check, Sparkles, ArrowLeft, Phone, MessageCircle, Calendar, Clock } from 'lucide-react';

interface TierFeature {
  name: string;
  free: boolean;
  pro: boolean;
  proPlus: boolean;
  ultra: boolean;
}

const features: TierFeature[] = [
  {
    name: 'Basic Profile',
    free: true,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Photo Upload (max)',
    free: true,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Contact Information',
    free: true,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Verified Badge',
    free: false,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Priority Support',
    free: false,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Advanced Statistics',
    free: false,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Fan Posts',
    free: false,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Online Booking System',
    free: false,
    pro: true,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Featured in Search Results',
    free: false,
    pro: false,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Custom URL',
    free: false,
    pro: false,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Premium Support',
    free: false,
    pro: false,
    proPlus: true,
    ultra: true
  },
  {
    name: 'Top of Search Results',
    free: false,
    pro: false,
    proPlus: false,
    ultra: true
  },
  {
    name: 'Exclusive Badge',
    free: false,
    pro: false,
    proPlus: false,
    ultra: true
  },
  {
    name: 'VIP Support',
    free: false,
    pro: false,
    proPlus: false,
    ultra: true
  }
];

export default function MembershipTier() {
  const currentTier = 'PRO'; // This would come from your user data

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

      {/* Current Tier Status */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Current Membership</h1>
            <p className="text-gray-600 mt-1">
              You are currently on the PRO plan. Upgrade to unlock more features!
            </p>
          </div>
          <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
            <Star className="h-5 w-5" />
            <span className="font-medium">PRO</span>
          </div>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Free Tier */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">FREE</h2>
            <p className="text-gray-600 mb-4">Basic features to get started</p>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              €0
              <span className="text-gray-500 text-base font-normal">/per day</span>
            </div>
            <button
              disabled
              className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Features included:</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center text-sm ${
                    feature.free ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <Check className={`h-5 w-5 mr-2 ${
                    feature.free ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PRO Tier */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden relative">
          {currentTier === 'PRO' && (
            <div className="absolute top-0 right-0 bg-pink-500 text-white px-4 py-1 rounded-bl-lg text-sm">
              Current Plan
            </div>
          )}
          <div className="p-6">
            <h2 className="text-lg font-bold text-pink-500 mb-2">PRO</h2>
            <p className="text-gray-600 mb-4">Perfect for professionals</p>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              €5
              <span className="text-gray-500 text-base font-normal">/per day</span>
              <div className="text-sm text-pink-500">25 DK credits/day</div>
            </div>
            <div>
              {currentTier === 'PRO' ? (
                <div className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed text-center">
                  Current Plan
                </div>
              ) : (
                <Link
                  to="/dashboard/lady/upgrade/membership"
                  state={{ selectedTier: 'pro' }}
                  className="block w-full bg-pink-500 text-white hover:bg-pink-600 px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Upgrade to PRO
                </Link>
              )}
            </div>
          </div>
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Everything in FREE, plus:</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center text-sm ${
                    feature.pro ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <Check className={`h-5 w-5 mr-2 ${
                    feature.pro ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PRO PLUS Tier */}
        <div className="bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-sm overflow-hidden border-2 border-pink-200 relative">
          {currentTier === 'PRO-PLUS' && (
            <div className="absolute top-0 right-0 bg-pink-500 text-white px-4 py-1 rounded-bl-lg text-sm">
              Current Plan
            </div>
          )}
          <div className="p-6">
            <h2 className="text-lg font-bold text-pink-600 mb-2">PRO PLUS</h2>
            <p className="text-gray-600 mb-4">For serious professionals</p>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              €10
              <span className="text-gray-500 text-base font-normal">/per day</span>
              <div className="text-sm text-pink-500">50 DK credits/day</div>
            </div>
            <div>
              {currentTier === 'PRO-PLUS' ? (
                <div className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed text-center">
                  Current Plan
                </div>
              ) : (
                <Link
                  to="/dashboard/lady/upgrade/membership"
                  state={{ selectedTier: 'pro-plus' }}
                  className="block w-full bg-pink-500 text-white hover:bg-pink-600 px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Upgrade to PRO PLUS
                </Link>
              )}
            </div>
          </div>
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Everything in PRO, plus:</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center text-sm ${
                    feature.proPlus ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <Check className={`h-5 w-5 mr-2 ${
                    feature.proPlus ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ULTRA Tier */}
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-sm overflow-hidden border-2 border-yellow-200 relative">
          {currentTier === 'ULTRA' && (
            <div className="absolute top-0 right-0 bg-pink-500 text-white px-4 py-1 rounded-bl-lg text-sm">
              Current Plan
            </div>
          )}
          <div className="p-6">
            <h2 className="text-lg font-bold text-yellow-600 mb-2 flex items-center gap-2">
              <Crown className="h-5 w-5" />
              ULTRA
            </h2>
            <p className="text-gray-600 mb-4">Ultimate visibility & features</p>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              €50
              <span className="text-gray-500 text-base font-normal">/per day</span>
              <div className="text-sm text-pink-500">250 DK credits/day</div>
            </div>
            <div>
              {currentTier === 'ULTRA' ? (
                <div className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed text-center">
                  Current Plan
                </div>
              ) : (
                <Link
                  to="/dashboard/lady/upgrade/membership"
                  state={{ selectedTier: 'ultra' }}
                  className="block w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:from-yellow-500 hover:to-pink-600 px-4 py-2 rounded-lg transition-colors text-center"
                >
                  Upgrade to ULTRA
                </Link>
              )}
            </div>
          </div>
          <div className="px-6 pb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Everything in PRO PLUS, plus:</h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center text-sm ${
                    feature.ultra ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <Check className={`h-5 w-5 mr-2 ${
                    feature.ultra ? 'text-green-500' : 'text-gray-300'
                  }`} />
                  {feature.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Example Listing Cards Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Example Listing Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* FREE Listing Card */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">FREE Listing</h3>
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80"
                  alt="Example Profile"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-gray-500 text-white px-3 py-1 rounded-lg text-sm">
                  8.8
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-gray-800 font-medium">Sarah</h3>
                  <span className="text-gray-500">Groningen</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">❤</span>
                    <span className="text-gray-600">203 Loves</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">Basic listing with essential features</p>
          </div>

          {/* PRO Listing Card */}
          <div>
            <h3 className="text-lg font-medium text-pink-500 mb-4">PRO Listing</h3>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                  alt="Example Profile"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-pink-500 text-white px-3 py-1 rounded-lg text-sm">
                  9.2
                </div>
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-lg text-sm">
                  Verified ✓
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-pink-500 font-medium">Isabella</h3>
                  <span className="text-gray-500">Amsterdam</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Elite companion offering unforgettable experiences. Available for dinner dates and travel.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-pink-500">❤</span>
                    <span className="text-gray-600">312 Loves</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">Enhanced visibility with verified badge</p>
          </div>

          {/* PRO PLUS Listing Card */}
          <div>
            <h3 className="text-lg font-medium text-pink-600 mb-4">PRO PLUS Listing</h3>
            <div className="bg-gradient-to-br from-pink-50 to-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border-2 border-pink-200">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
                  alt="Example Profile"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-pink-500 text-white px-3 py-1 rounded-lg text-sm">
                  9.8
                </div>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-sm">
                  Verified ✓
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-pink-600 font-semibold">Jenny</h3>
                  <span className="text-gray-500">Rotterdam</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Premium escort agency with the most beautiful ladies. Luxury incall location with private parking.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-pink-500">❤</span>
                    <span className="text-gray-600">532 Loves</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">Premium listing with featured status</p>
          </div>

          {/* ULTRA Listing Card */}
          <div>
            <h3 className="text-lg font-medium text-yellow-600 flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5" />
              ULTRA Listing
            </h3>
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow border-2 border-yellow-200">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80"
                  alt="Example Profile"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-pink-500 text-white px-3 py-1 rounded-lg text-sm">
                  9.9
                </div>
                <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-sm">
                  Verified ✓
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-pink-500 font-bold">Melissa</h3>
                  <span className="text-gray-500">Utrecht</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">VIP companion offering exclusive experiences. Available for luxury dates and travel worldwide.</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1">
                    <span className="text-pink-500">❤</span>
                    <span className="text-gray-600">423 Loves</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <Phone className="h-5 w-5" />
                    </button>
                    <button className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">Elite listing with maximum visibility</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              How do I upgrade my membership?
            </h3>
            <p className="text-gray-600">
              Simply click the "Upgrade" button on your desired plan. You'll be guided through the
              payment process, and your account will be upgraded immediately after successful payment.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Can I change plans anytime?
            </h3>
            <p className="text-gray-600">
              Yes! You can upgrade your plan at any time. If you upgrade mid-billing cycle,
              you'll only be charged the prorated difference for the remainder of the month.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              What payment methods are accepted?
            </h3>
            <p className="text-gray-600">
              We accept all major credit cards, debit cards, and bank transfers. All payments
              are processed securely through our payment provider.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              What happens when I upgrade?
            </h3>
            <p className="text-gray-600">
              Your account will be instantly upgraded with all the new features of your chosen plan.
              Your profile will be automatically updated to reflect your new membership status.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}