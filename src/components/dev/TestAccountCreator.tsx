/**
 * Development Test Interface for Creating Membership Test Accounts
 * Only available in development mode
 */

import React, { useState } from 'react';
import { Plus, Trash2, User, Crown, Shield, Info } from 'lucide-react';
import { createAllTestAccounts, cleanupTestAccounts, testCredentials } from '../../scripts/createTestAccounts';
import { isDevelopmentMode } from '../../utils/developmentUtils';

export const TestAccountCreator: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Don't render in production
  if (!isDevelopmentMode()) {
    return null;
  }

  const handleCreateAccounts = async () => {
    setIsCreating(true);
    setStatus('Creating test accounts...');
    
    try {
      await createAllTestAccounts();
      setStatus('✅ Test accounts created successfully!');
    } catch (error) {
      setStatus(`❌ Error creating accounts: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCleanupAccounts = async () => {
    setIsCleaning(true);
    setStatus('Cleaning up test accounts...');
    
    try {
      await cleanupTestAccounts();
      setStatus('🧹 Test accounts cleaned up successfully!');
    } catch (error) {
      setStatus(`❌ Error cleaning up accounts: ${error}`);
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 m-4">
      {/* Development Warning */}
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-bold text-yellow-800">
          🧪 Development Test Interface
        </h3>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Membership Testing</h4>
            <p className="text-sm text-blue-700 mb-3">
              Create test accounts with different membership tiers to test access controls.
            </p>
            <div className="text-xs text-blue-600">
              <p>• Test accounts bypass membership restrictions in development</p>
              <p>• Use these accounts to test FREE vs PRO feature access</p>
              <p>• All accounts use password: <code className="bg-blue-100 px-1 rounded">test123456</code></p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Account Credentials */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">FREE Account</h4>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Email:</strong> {testCredentials.FREE.email}</p>
            <p><strong>Password:</strong> {testCredentials.FREE.password}</p>
            <p><strong>Tier:</strong> {testCredentials.FREE.tier}</p>
          </div>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-pink-600" />
            <h4 className="font-medium text-pink-900">PRO Account</h4>
          </div>
          <div className="text-sm text-pink-700">
            <p><strong>Email:</strong> {testCredentials.PRO.email}</p>
            <p><strong>Password:</strong> {testCredentials.PRO.password}</p>
            <p><strong>Tier:</strong> {testCredentials.PRO.tier}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCreateAccounts}
          disabled={isCreating || isCleaning}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? 'Creating...' : 'Create Test Accounts'}
        </button>

        <button
          onClick={handleCleanupAccounts}
          disabled={isCreating || isCleaning}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
          {isCleaning ? 'Cleaning...' : 'Cleanup Test Accounts'}
        </button>
      </div>

      {/* Status Messages */}
      {status && (
        <div className="bg-white border rounded-lg p-3">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{status}</pre>
        </div>
      )}

      {/* Testing Instructions */}
      <div className="mt-6 pt-4 border-t text-xs text-gray-500">
        <h5 className="font-medium mb-2">Testing Instructions:</h5>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create test accounts using the button above</li>
          <li>Login with FREE account → should only access <code>/dashboard/lady/free</code></li>
          <li>Try accessing PRO routes → should be blocked and redirected</li>
          <li>Login with PRO account → should access all features</li>
          <li>Check console logs for membership access decisions</li>
        </ol>
      </div>
    </div>
  );
};

export default TestAccountCreator; 