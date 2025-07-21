import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, getAuthParamsFromUrl } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();
  
  // Check for auth token on component mount
  useEffect(() => {
    const handleAuth = async () => {
      try {
        setLoading(true);
        
        // Get auth parameters from URL
        const { tokenHash, type, email, hasAuthParams } = getAuthParamsFromUrl();
        
        // If we have auth parameters in the URL, verify them
        if (hasAuthParams && type === 'recovery' && tokenHash && email) {
          console.log('Found password reset parameters in URL');
          
          // Verify the OTP token
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
            email: email
          });
          
          if (error) {
            console.error('Error verifying password reset token:', error);
            throw new Error('Invalid or expired password reset link. Please request a new one.');
          }
          
          if (data.session) {
            console.log('Password reset token verified successfully');
            setIsReady(true);
            // Clean up URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } else {
          // Check if we already have a valid session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('Active session found, ready for password reset');
            setIsReady(true);
          } else {
            throw new Error('No valid password reset session found. Please request a new password reset link.');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred during authentication');
      } finally {
        setLoading(false);
      }
    };
    
    handleAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Client-side validation
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!isReady) {
      setErrorMessage('Cannot update password. Authentication required.');
      return;
    }

    setLoading(true);
    
    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        console.error('Password update failed:', error);
        throw error;
      }
      
      console.log('Password updated successfully');
      setSuccess(true);
      
      // Sign out after password reset
      await supabase.auth.signOut();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !errorMessage && !success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isReady ? 'Updating Password...' : 'Verifying Your Link'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isReady ? 'Please wait while we update your password...' : 'Please wait while we verify your password reset link...'}
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Password Reset Error</h2>
            <p className="mt-2 text-gray-600">
              {errorMessage}
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link 
              to="/forgot-password" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Request a new password reset link
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Password Updated!</h2>
            <p className="mt-2 text-gray-600">
              Your password has been successfully updated. Redirecting you to login...
            </p>
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-gray-600">
            Please enter your new password below.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your new password"
                  minLength={8}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isReady}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || !isReady ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center">
          <Link 
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
