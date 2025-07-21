import React, { useState, useEffect } from 'react';
import { PaymentService, PaymentDetails } from '../../services/paymentService';
import { CreditPackage } from '../../services/creditService';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: CreditPackage;
  onPaymentComplete: (success: boolean) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  onPaymentComplete,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await PaymentService.getPaymentMethods();
        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods[0]);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        setError('Failed to load payment methods');
      }
    };

    if (isOpen) {
      loadPaymentMethods();
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate payment amount
      await PaymentService.validatePaymentAmount(selectedPackage.price);

      const paymentDetails: PaymentDetails = {
        amount: selectedPackage.price,
        currency: 'USD', // TODO: Make this configurable
        paymentMethod: selectedMethod,
        metadata: {
          packageId: selectedPackage.id,
          creditsAmount: selectedPackage.creditsAmount,
        },
      };

      // This will throw an error since payment processing is not implemented yet
      await PaymentService.processPayment(paymentDetails);
      
      onPaymentComplete(true);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed');
      onPaymentComplete(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Purchase Credits</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Selected Package</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{selectedPackage.name}</p>
            <p className="text-gray-600">{selectedPackage.creditsAmount} Credits</p>
            <p className="text-lg font-bold">${selectedPackage.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <label
                key={method}
                className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={selectedMethod === method}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="mr-3"
                />
                <span className="capitalize">
                  {method.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || !selectedMethod}
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Processing...</span>
              </div>
            ) : (
              'Complete Purchase'
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          <p>Payment processing is not yet implemented.</p>
          <p>This is a placeholder for future integration.</p>
        </div>
      </div>
    </div>
  );
}; 