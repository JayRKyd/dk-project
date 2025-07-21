import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Coins,
  DollarSign,
  Calculator,
  ShieldCheck,
  CreditCard,
  Wallet,
  ShoppingCart,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clientDashboardService, type CreditTransaction } from '../../services/clientDashboardService';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

export default function ClientCredits() {
  const { user } = useAuth();
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [selectedPackages, setSelectedPackages] = useState<{ [key: string]: number }>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load credit packages, current balance, and recent transactions in parallel
      const [packages, balance, transactions] = await Promise.all([
        clientDashboardService.getCreditPackages(),
        clientDashboardService.getUserCredits(user.id),
        clientDashboardService.getCreditTransactions(user.id)
      ]);
      
      setCreditPackages(packages);
      setCurrentBalance(balance);
      setRecentTransactions(transactions.slice(0, 5)); // Show last 5 transactions
    } catch (err) {
      console.error('Error loading credit data:', err);
      setError('Failed to load credit information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!user?.id || balanceLoading) return;
    
    try {
      setBalanceLoading(true);
      const balance = await clientDashboardService.getUserCredits(user.id);
      setCurrentBalance(balance);
    } catch (err) {
      console.error('Error refreshing balance:', err);
    } finally {
      setBalanceLoading(false);
    }
  };

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

  const handlePurchase = async () => {
    if (!user?.id || !agreeToTerms || Object.keys(selectedPackages).length === 0) return;
    
    try {
      setPurchaseLoading(true);
      
      // Prepare purchase data
      const packages = Object.entries(selectedPackages).map(([id, quantity]) => ({
        id,
        quantity
      }));
      
      // Simulate the purchase (placeholder until payment integration)
      const result = await clientDashboardService.simulateCreditPurchase(
        user.id,
        packages,
        totals.credits,
        totals.cost
      );
      
      if (result.success) {
        // Reset form and refresh data
        setSelectedPackages({});
        setAgreeToTerms(false);
        await loadData();
        alert('Credits purchased successfully!');
      } else {
        alert(result.message || 'Purchase failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error processing purchase:', err);
      alert(err.message || 'Failed to process purchase. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type: CreditTransaction['type']) => {
    switch (type) {
      case 'purchase': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'spend': return <ShoppingCart className="h-4 w-4 text-red-500" />;
      case 'gift': return <span className="text-pink-500">🎁</span>;
      case 'fanpost': return <span className="text-purple-500">📸</span>;
      case 'refund': return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default: return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buy DK Credits</h1>
          <p className="text-gray-600 mt-1">Loading credit packages...</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading credit information...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Buy DK Credits</h1>
          <p className="text-gray-600 mt-1">Purchase DK Credits to unlock fan posts and send gifts</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Unable to load credit information</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={loadData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-gray-900">{currentBalance} DK</div>
                <button
                  onClick={refreshBalance}
                  disabled={balanceLoading}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="Refresh balance"
                >
                  <RefreshCw className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
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
                        {(pkg.credits + (pkg.bonus || 0)) * quantity} DK
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
                    onClick={handlePurchase}
                    disabled={!agreeToTerms || purchaseLoading}
                    className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                      agreeToTerms && !purchaseLoading
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {purchaseLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        Confirm Purchase
                      </>
                    )}
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

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(transaction.type)}
                      <span className="text-gray-700">{transaction.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} DK
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/client/transactions"
                className="text-pink-500 hover:text-pink-600 text-sm mt-3 inline-block"
              >
                View all transactions →
              </Link>
            </div>
          )}
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