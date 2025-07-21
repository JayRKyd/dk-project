import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { VerificationWelcome } from './VerificationWelcome';

interface RegistrationSuccessProps {
  onClose?: () => void;
  userRole?: string;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onClose, userRole }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showVerificationWelcome, setShowVerificationWelcome] = useState(false);

  const handleGoToLogin = () => {
    if (onClose) {
      onClose();
    }
    navigate('/login');
  };

  const handleContinue = () => {
    // If user is a lady and already logged in, show verification welcome
    if (userRole === 'lady' && user) {
      setShowVerificationWelcome(true);
    } else {
      // Otherwise go to login
      handleGoToLogin();
    }
  };

  const handleStartVerification = () => {
    setShowVerificationWelcome(false);
    if (onClose) {
      onClose();
    }
    navigate('/verification');
  };

  const handleSkipVerification = () => {
    setShowVerificationWelcome(false);
    if (onClose) {
      onClose();
    }
    // Store skip preference in localStorage for later prompts
    localStorage.setItem('verification_skipped', 'true');
    localStorage.setItem('verification_skip_date', new Date().toISOString());
    navigate('/dashboard/lady/free');
  };

  const handleCloseVerificationWelcome = () => {
    setShowVerificationWelcome(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Created Successfully!</h3>
            <p className="text-gray-600 mb-6">
              {userRole === 'lady' && user 
                ? "Welcome! Let's get your profile verified to unlock all features."
                : "Your account has been created. Please check your email to verify your account."
              }
            </p>
            <button
              onClick={handleContinue}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              {userRole === 'lady' && user ? 'Continue' : 'Go to Login'}
            </button>
          </div>
        </div>
      </div>

      <VerificationWelcome
        isOpen={showVerificationWelcome}
        onClose={handleCloseVerificationWelcome}
        onStartVerification={handleStartVerification}
        onSkipForNow={handleSkipVerification}
      />
    </>
  );
};

export default RegistrationSuccess;
