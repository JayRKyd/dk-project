import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Crown, Lock, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  requiredTier: 'FREE' | 'PRO';
  currentTier: string;
  feature?: string;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  requiredTier,
  currentTier,
  feature,
  className = ''
}) => {
  const getUpgradeMessage = () => {
    if (requiredTier === 'PRO') {
      return {
        title: 'PRO Membership Required',
        description: feature 
          ? `Access to ${feature} requires a PRO membership.`
          : 'This feature is only available to PRO members.',
        icon: <Star className="h-12 w-12 text-pink-500" />,
        benefits: [
          'Fan Posts & Premium Content',
          'Online Booking Management',
          'Gift Management System',
          'Priority Support',
          'Reply to Reviews',
          'Advanced Analytics'
        ]
      };
    }
    
    return {
      title: 'Upgrade Required',
      description: 'You need a higher membership tier to access this feature.',
      icon: <Lock className="h-12 w-12 text-gray-400" />,
      benefits: []
    };
  };

  const upgradeInfo = getUpgradeMessage();

  return (
    <div className={`bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-6">
        {upgradeInfo.icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {upgradeInfo.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6">
        {upgradeInfo.description}
      </p>

      {/* Current vs Required Tier */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Current:</span>
            <span className="ml-2 font-medium text-gray-900">{currentTier}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div>
            <span className="text-gray-500">Required:</span>
            <span className="ml-2 font-medium text-pink-600">{requiredTier}</span>
          </div>
        </div>
      </div>

      {/* Benefits List (for PRO upgrade) */}
      {upgradeInfo.benefits.length > 0 && (
        <div className="text-left mb-6">
          <h4 className="font-medium text-gray-900 mb-3">PRO Benefits Include:</h4>
          <ul className="space-y-2">
            {upgradeInfo.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          to="/dashboard/lady/upgrade"
          className="w-full bg-pink-500 text-white py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <Crown className="h-5 w-5" />
          Upgrade to {requiredTier}
        </Link>
        
        <Link
          to="/dashboard/lady/free"
          className="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Pricing Info */}
      {requiredTier === 'PRO' && (
        <div className="mt-6 pt-6 border-t text-sm text-gray-500">
          <p>PRO Membership: Only €5/day</p>
          <p>Cancel anytime • Full feature access</p>
        </div>
      )}
    </div>
  );
};

export default UpgradePrompt; 