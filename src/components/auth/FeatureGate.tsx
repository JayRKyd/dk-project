import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Shield, Lock, Star } from 'lucide-react';

interface FeatureGateProps {
  children: React.ReactNode;
  requiresVerification?: boolean;
  feature?: string;
  className?: string;
  showTooltip?: boolean;
}

const VerificationTooltip: React.FC<{ 
  feature?: string; 
  onVerify: () => void; 
  onClose: () => void 
}> = ({ feature, onVerify, onClose }) => {
  return (
    <div className="absolute top-full left-0 mt-2 p-4 bg-white rounded-lg shadow-lg border z-50 w-80">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-pink-100 rounded-full">
          <Shield className="h-5 w-5 text-pink-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">
            Verification Required
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            {feature ? `${feature} requires profile verification.` : 'This feature requires profile verification.'} 
            Get verified to unlock all premium features!
          </p>
          <div className="flex space-x-2">
            <button
              onClick={onVerify}
              className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 rounded transition-colors"
            >
              Verify Now
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  requiresVerification = false,
  feature,
  className = '',
  showTooltip = true
}) => {
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [showTooltipState, setShowTooltipState] = useState(false);

  // Check if user is verified
  const isVerified = profile?.verification_status === 'verified';
  const isLady = profile?.role === 'lady';

  // If not a lady or already verified, show children normally
  if (!isLady || isVerified || !requiresVerification) {
    return <div className={className}>{children}</div>;
  }

  // Check if verification was skipped (reduced functionality mode)
  const verificationSkipped = localStorage.getItem('verification_skipped') === 'true';

  const handleVerify = () => {
    setShowTooltipState(false);
    navigate('/verification');
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showTooltip) {
      setShowTooltipState(!showTooltipState);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Grayed out content */}
      <div 
        className="relative cursor-not-allowed"
        onClick={handleClick}
      >
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay with lock icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-lg">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-pink-100 rounded-full">
                <Lock className="h-6 w-6 text-pink-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              Verification Required
            </p>
            <div className="flex items-center justify-center text-xs text-pink-600">
              <Star className="h-3 w-3 mr-1" />
              <span>Click to verify</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltipState && showTooltip && (
        <VerificationTooltip
          feature={feature}
          onVerify={handleVerify}
          onClose={() => setShowTooltipState(false)}
        />
      )}
    </div>
  );
}; 