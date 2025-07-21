import React, { useEffect, useState } from 'react';
import { CreditService, CreditPackage, UserCredits } from '../../services/creditService';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PaymentModal } from '../../components/credits/PaymentModal';

const CreditStore: React.FC = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [packagesData, creditsData] = await Promise.all([
          CreditService.getAvailablePackages(),
          user ? CreditService.getUserCredits(user.id) : null
        ]);
        setPackages(packagesData);
        setUserCredits(creditsData);
      } catch (error) {
        console.error('Error loading credit store data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handlePurchase = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (success: boolean) => {
    if (success) {
      // Refresh user credits after successful purchase
      if (user) {
        const updatedCredits = await CreditService.getUserCredits(user.id);
        setUserCredits(updatedCredits);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Current Balance Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Credits</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600">Current Balance</p>
            <p className="text-3xl font-bold">{userCredits?.balance || 0} Credits</p>
          </div>
          <div>
            <p className="text-gray-600">Total Purchased</p>
            <p className="text-xl">{userCredits?.totalPurchased || 0} Credits</p>
          </div>
          <div>
            <p className="text-gray-600">Total Spent</p>
            <p className="text-xl">{userCredits?.totalSpent || 0} Credits</p>
          </div>
        </div>
      </div>

      {/* Credit Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 ${
              pkg.isFeatured ? 'border-pink-500' : 'border-transparent'
            }`}
          >
            {pkg.isFeatured && (
              <div className="bg-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                Best Value
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
            <p className="text-3xl font-bold mb-4">
              {pkg.creditsAmount} Credits
            </p>
            <p className="text-gray-600 mb-4">
              ${pkg.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ${(pkg.price / pkg.creditsAmount).toFixed(3)} per credit
            </p>
            <button
              onClick={() => handlePurchase(pkg)}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 transition duration-200"
            >
              Purchase
            </button>
          </div>
        ))}
      </div>

      {/* Purchase History Link */}
      <div className="mt-8 text-center">
        <a
          href="/dashboard/credit-history"
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          View Purchase History →
        </a>
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedPackage={selectedPackage}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default CreditStore; 