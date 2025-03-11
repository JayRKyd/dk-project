import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Coins,
  DollarSign,
  Calculator,
  ShieldCheck,
  CreditCard,
  Wallet,
  ShoppingCart
} from 'lucide-react';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'lite',
    name: 'Lite',
    credits: 25,
    price: 5
  },
  {
    id: 'lite-plus',
    name: 'Lite+',
    credits: 50,
    price: 10
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 125,
    price: 25,
    popular: true,
    bonus: 10
  },
  {
    id: 'power',
    name: 'Power',
    credits: 250,
    price: 50,
    bonus: 25
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500,
    price: 100,
    bonus: 50
  },
  {
    id: 'ultra',
    name: 'Ultra',
    credits: 1250,
    price: 250,
    bonus: 100
  }
];

export default function ClientCredits() {
  const [selectedPackages, setSelectedPackages] = useState<{ [key: string]: number }>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Calculate total cost and credits
  const totals = creditPackages.reduce((acc, pkg) => {
    const quantity = selectedPackages[pkg.id] || 0;
    return {
      cost: acc.cost + (pkg.price * quantity),
      credits: acc.credits + ((pkg.credits + (pkg.bonus || 0)) * quantity)
    };
  }, { cost: 0, credits: 0 });

  const handleQuantityChange = (packageId: string, change: number) => {
    setSelectedPackages(prev => {
      const newQuantity = (prev[packageId] || 0) + change;
      if (newQuantity <= 0) {
        const { [packageId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [packageId]: newQuantity };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buy DK Credits</h1>
            <p className="text-gray-600 mt-1">
              Purchase DK Credits to unlock fan posts and send gifts
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Available Balance</div>
              <div className="text-2xl font-bold text-gray-900">170 DK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Credit Packages Grid */}
        <div className="lg:col-span-8 space-y-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex items-center justify-between p-6 rounded-xl transition-all ${
                pkg.popular
                  ? 'bg-gradient-to-r from-pink-50 to-white border-2 border-pink-200'
                  : 'bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex-1 flex items-center gap-8">
                <div className="w-32">
                  <span className="font-medium text-gray-900 text-lg">{pkg.name}</span>
                  {pkg.popular && (
                    <span className="block text-sm text-pink-500 mt-1">Most Popular</span>
                  )}
                </div>
                <div className="w-32 text-center">
                  <span className="font-medium text-lg">{pkg.credits} DK</span>
                  {pkg.bonus && (
                    <span className="block text-sm text-green-500">+{pkg.bonus} Bonus</span>
                  )}
                </div>
                <div className="w-24 text-center">
                  <span className="font-medium text-lg text-pink-500">€{pkg.price}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(pkg.id, -1)}
                  disabled={!selectedPackages[pkg.id]}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-lg">
                  {selectedPackages[pkg.id] || 0}
                </span>
                <button
                  onClick={() => handleQuantityChange(pkg.id, 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4">
                {Object.entries(selectedPackages).map(([packageId, quantity]) => {
                  const pkg = creditPackages.find(p => p.id === packageId);
                  if (!pkg) return null;
                  return (
                    <div key={packageId} className="flex items-center">
                      <div className="w-24">
                        <span className="font-medium text-gray-900">{pkg.name}</span>
                      </div>
                      <div className="w-20 text-gray-500">
                        × {quantity}
                      </div>
                      <div className="w-24">
                        {pkg.credits * quantity} DK
                      </div>
                      <div className="w-24 text-right">
                        <span className="font-medium">€{pkg.price * quantity}</span>
                      </div>
                    </div>
                  );
                })}
                {Object.keys(selectedPackages).length > 0 && (
                  <div className="border-t pt-4 flex items-center justify-between text-lg">
                    <div>
                      <span className="font-bold">Total</span>
                      <div className="text-sm text-gray-500">{totals.credits} DK</div>
                    </div>
                    <span className="font-bold text-pink-500">€{totals.cost}</span>
                  </div>
                )}
              </div>

              {/* Terms Agreement */}
              {Object.keys(selectedPackages).length > 0 && (
                <div className="mt-6 space-y-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
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
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      agreeToTerms
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!agreeToTerms}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Confirm Purchase
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h3>
            <div className="space-y-4">
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

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              What can I do with DK Credits?
            </h3>
            <p className="text-gray-600">
              DK Credits can be used to unlock premium fan posts, send gifts to ladies, and access exclusive content.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              How long are credits valid?
            </h3>
            <p className="text-gray-600">
              DK Credits never expire. Once purchased, they remain in your account until you use them.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Are bonus credits included?
            </h3>
            <p className="text-gray-600">
              Yes! Larger packages include bonus credits that are added to your account instantly.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Can I get a refund?
            </h3>
            <p className="text-gray-600">
              DK Credits are non-refundable once purchased. Please choose your package carefully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}