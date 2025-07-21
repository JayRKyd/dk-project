import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, Star, X, ArrowRight } from 'lucide-react';

interface VerificationWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVerification: () => void;
  onSkipForNow: () => void;
}

export const VerificationWelcome: React.FC<VerificationWelcomeProps> = ({
  isOpen,
  onClose,
  onStartVerification,
  onSkipForNow
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-xl">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-pink-100 rounded-full">
                <Shield className="h-12 w-12 text-pink-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to DateKelly! 🎉
            </h2>
            <p className="text-xl text-gray-600">
              Let's verify your profile to unlock all premium features
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              🌟 Verification Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-pink-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">175% More Client Interest</p>
                  <p className="text-sm text-gray-600">Verified profiles get significantly more views</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg">
                <Star className="h-6 w-6 text-pink-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Verified Badge</p>
                  <p className="text-sm text-gray-600">Stand out with a trust badge on your profile</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg">
                <Shield className="h-6 w-6 text-pink-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Premium Features</p>
                  <p className="text-sm text-gray-600">Access all dashboard features and tools</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-pink-50 rounded-lg">
                <Clock className="h-6 w-6 text-pink-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Priority Support</p>
                  <p className="text-sm text-gray-600">Get faster help when you need it</p>
                </div>
              </div>
            </div>
          </div>

          {/* Process Overview */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Quick 5-Minute Process:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Upload ID card photo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Take selfie with your ID</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Photo with local newspaper (location proof)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Upper body selfie</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onStartVerification}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 text-lg"
            >
              <Shield className="h-5 w-5" />
              <span>Start Verification Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={onSkipForNow}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Skip for now (Limited features)
            </button>
          </div>

          {/* Warning about skipping */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ <strong>Note:</strong> Without verification, you'll have limited access to dashboard features and reduced profile visibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 