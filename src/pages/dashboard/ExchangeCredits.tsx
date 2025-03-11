import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Coins,
  DollarSign,
  Calculator,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  Clock
} from 'lucide-react';

interface ExchangeOption {
  credits: number;
  fee: number;
  rate: number;
}

const exchangeOptions: ExchangeOption[] = [
  {
    credits: 250,
    fee: 15,
    rate: 0.20 // €0.20 per credit
  },
  {
    credits: 500,
    fee: 25,
    rate: 0.20 // €0.20 per credit
  },
  {
    credits: 1250,
    fee: 50,
    rate: 0.20 // €0.20 per credit
  }
];

export default function ExchangeCredits() {
  const [selectedOption, setSelectedOption] = useState<ExchangeOption | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const availableCredits = 750; // This would come from your user data

  const calculatePayout = (option: ExchangeOption) => {
    const totalCredits = option.credits + option.fee;
    return (option.credits * option.rate).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/lady/credits"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to DK Credits</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exchange DK Credits</h1>
            <p className="text-gray-600 mt-1">
              Convert your earned DK Credits to real money
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Available Balance</div>
              <div className="text-2xl font-bold text-gray-900">{availableCredits} DK</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Exchange Options */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Select Exchange Amount</h2>
            
            <div className="space-y-4">
              {exchangeOptions.map((option) => {
                const isDisabled = availableCredits < option.credits;
                return (
                  <button
                    key={option.credits}
                    onClick={() => setSelectedOption(option)}
                    disabled={isDisabled}
                    className={`w-full p-6 rounded-xl border-2 transition-all ${
                      isDisabled
                        ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                        : selectedOption?.credits === option.credits
                        ? 'bg-green-50 border-green-500'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <Coins className="h-8 w-8 text-green-500" />
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-gray-900">
                            {option.credits} DK Credits
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Service fee: {option.fee} DK
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">
                          €{calculatePayout(option)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Rate: €{option.rate}/credit
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Terms Agreement */}
            <div className="pt-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-green-500 hover:text-green-600 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-green-500 hover:text-green-600 underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {selectedOption ? (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Exchange Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium">{selectedOption.credits} DK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium text-red-500">+{selectedOption.fee} DK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Credits Required</span>
                  <span className="font-medium">{selectedOption.credits + selectedOption.fee} DK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium">€{selectedOption.rate}/credit</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">You'll Receive</span>
                    <span className="text-2xl font-bold text-green-500">
                      €{calculatePayout(selectedOption)}
                    </span>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="pt-4">
                  <label className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-600">
                      I agree to the{' '}
                      <Link to="/terms" className="text-green-500 hover:text-green-600 underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-green-500 hover:text-green-600 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <button
                  disabled={!agreeToTerms}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    agreeToTerms
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Building2 className="h-5 w-5" />
                  Confirm Exchange
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select an Amount
              </h3>
              <p className="text-gray-500 text-sm">
                Choose an exchange amount to see the summary
              </p>
            </div>
          )}

          {/* Info Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Processing Time</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">2-3 business days</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Direct bank transfer</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Secure transaction</span>
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
              How long does it take to receive the money?
            </h3>
            <p className="text-gray-600">
              After confirming the exchange, you'll receive the money in your bank account within 2-3 business days.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Why is there a service fee?
            </h3>
            <p className="text-gray-600">
              The service fee covers transaction costs and processing. The fee is added to the amount you want to exchange.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              What's the minimum exchange amount?
            </h3>
            <p className="text-gray-600">
              The minimum exchange amount is 250 DK Credits. This helps keep transaction costs efficient.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-medium text-gray-900 mb-2">
              Can I cancel an exchange?
            </h3>
            <p className="text-gray-600">
              Once confirmed, exchanges cannot be cancelled. Please double-check all details before confirming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}