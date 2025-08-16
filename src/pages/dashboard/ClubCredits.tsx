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
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { CreditService, CreditTransaction, CreditPackage } from '../../services/creditService';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  status: string;
  description: string;
  date: Date;
  referenceId?: string;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    creditsAmount: 25,
    price: 25.00,
    isFeatured: false,
    isActive: true
  },
  {
    id: 'basic',
    name: 'Basic',
    creditsAmount: 50,
    price: 45.00,
    isFeatured: false,
    isActive: true
  },
  {
    id: 'popular',
    name: 'Popular',
    creditsAmount: 125,
    price: 100.00,
    isFeatured: true,
    isActive: true
  },
  {
    id: 'pro',
    name: 'Professional',
    creditsAmount: 250,
    price: 175.00,
    isFeatured: false,
    isActive: true
  },
  {
    id: 'business',
    name: 'Business',
    creditsAmount: 500,
    price: 300.00,
    isFeatured: false,
    isActive: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    creditsAmount: 1250,
    price: 600.00,
    isFeatured: false,
    isActive: true
  }
];

const ClubCredits: React.FC = () => {
  const { clubProfile, creditSummary } = useClubDashboard();
  const [selectedPackages, setSelectedPackages] = useState<{ [key: string]: number }>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [clubProfile]);

  // Respect ?tab=buy|history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'history') {
      setShowTransactionHistory(true);
    } else if (tab === 'buy') {
      setShowTransactionHistory(false);
    }
  }, []);

  const loadTransactions = async () => {
    if (!clubProfile) return;

    setLoadingTransactions(true);
    try {
      const creditTransactions = await CreditService.getCreditHistory(clubProfile.id);
      
      const formattedTransactions: Transaction[] = creditTransactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType === 'spend' ? 'debit' : 'credit',
        amount: tx.amount,
        status: tx.status,
        description: tx.metadata?.description || '',
        date: tx.createdAt,
        referenceId: tx.paymentReference
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const calculateTotals = () => {
    return Object.entries(selectedPackages).reduce((acc, [packageId, quantity]) => {
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      if (!pkg || quantity <= 0) return acc;
      return {
        cost: acc.cost + (pkg.price * quantity),
        credits: acc.credits + (pkg.creditsAmount * quantity)
      };
    }, { cost: 0, credits: 0 });
  };

  const handlePurchase = async () => {
    if (!clubProfile) return;

    const totals = calculateTotals();
    if (totals.credits <= 0) return;

    try {
      setLoading(true);
      
      // For simulation, we'll directly add credits and record transaction
      const purchaseDescription = `Credit purchase: €${totals.cost.toFixed(2)} for ${totals.credits} credits`;
      
      // Add credits to user account
      await CreditService.addCredits(clubProfile.id, totals.credits, purchaseDescription);
      
      // Reset form
      setSelectedPackages({});
      setAgreeToTerms(false);
      setShowSuccessModal(true);
      
      // Refresh transactions
      await loadTransactions();
    } catch (error) {
      console.error('Error processing purchase:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" />;
      case 'pending':
        return <Clock className="text-yellow-500" />;
      case 'failed':
        return <XCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: 'credit' | 'debit') => {
    return type === 'credit' ? (
      <ArrowDownLeft className="text-green-500" />
    ) : (
      <ArrowUpRight className="text-red-500" />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/club"
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
              Purchase DK Credits to promote your club and create special offers
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Available Balance</div>
              <div className="text-2xl font-bold text-gray-900">{creditSummary?.balance || 0} DK</div>
            </div>
            <button
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              <span>History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      {showTransactionHistory && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h2>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading transactions...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-gray-500 py-4">No transactions yet</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(transaction.type)}
                      <div>
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()} at {new Date(transaction.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} DK
                      </div>
                      {transaction.amount > 0 && (
                        <div className="text-sm text-gray-500">€{transaction.amount.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Credit Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Credit Packages Grid */}
        <div className="lg:col-span-8 space-y-4">
          {CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative flex items-center justify-between p-6 rounded-xl transition-all ${
                pkg.isFeatured
                  ? 'bg-gradient-to-r from-purple-50 to-white border-2 border-purple-200'
                  : 'bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {pkg.isFeatured && (
                <div className="absolute -top-2 left-6 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              )}
              <div className="flex-1 flex items-center gap-8">
                <div className="w-32">
                  <span className="font-medium text-gray-900 text-lg">{pkg.name}</span>
                </div>
                <div className="w-32 text-center">
                  <span className="font-medium text-lg">{pkg.creditsAmount} DK</span>
                </div>
                <div className="w-24 text-center">
                  <span className="font-medium text-lg text-purple-500">€{pkg.price}</span>
                  <div className="text-sm text-gray-500">
                    €{(pkg.price / pkg.creditsAmount).toFixed(3)}/credit
                  </div>
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
              
              {Object.keys(selectedPackages).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Select packages to see your order summary
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(selectedPackages).map(([packageId, quantity]) => {
                    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
                    if (!pkg) return null;
                    const totalCredits = (pkg.creditsAmount) * quantity;
                    return (
                      <div key={packageId} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{pkg.name}</div>
                          <div className="text-sm text-gray-500">× {quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{totalCredits} DK</div>
                          <div className="text-sm text-gray-500">€{(pkg.price * quantity).toFixed(2)}</div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="border-t pt-4 flex items-center justify-between text-lg">
                    <div>
                      <span className="font-bold">Total</span>
                      <div className="text-sm text-gray-500">{calculateTotals().credits} DK</div>
                    </div>
                    <span className="font-bold text-purple-500">€{calculateTotals().cost.toFixed(2)}</span>
                  </div>

                  {/* Terms Agreement */}
                  <div className="mt-6 space-y-4">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        required
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{' '}
                        <Link to="/terms" className="text-purple-500 hover:text-purple-600 underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-purple-500 hover:text-purple-600 underline">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>

                    <button
                      onClick={handlePurchase}
                      disabled={!agreeToTerms || loading}
                      className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                        agreeToTerms && !loading
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          Confirm Purchase
                        </>
                      )}
                    </button>
                    
                    <div className="text-xs text-gray-500 text-center">
                      Payment processed securely via PayPal
                    </div>
                  </div>
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
                <span>Credit Card via PayPal</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Wallet className="h-5 w-5" />
                <span>PayPal Balance</span>
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
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">
              What can I do with DK Credits?
            </h3>
            <p className="text-gray-600">
              DK Credits can be used to promote your club, create special offers, and boost your visibility on the platform.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">
              How long are credits valid?
            </h3>
            <p className="text-gray-600">
              DK Credits never expire. Once purchased, they remain in your account until you use them.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">
              Are bonus credits included?
            </h3>
            <p className="text-gray-600">
              Yes! Larger packages include bonus credits that are added to your account instantly.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">
              Can I get a refund?
            </h3>
            <p className="text-gray-600">
              DK Credits are non-refundable once purchased. Please choose your package carefully.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Purchase Successful!</h3>
              <p className="text-gray-600 mb-6">
                {calculateTotals().credits} DK Credits have been added to your account.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubCredits;