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
        setErrorMessage('');
        
        console.log('=== RESET PASSWORD DEBUG ===');
        console.log('URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash params:', window.location.hash);
        
        // Check for auth parameters in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        
        const code = urlParams.get('code') || hashParams.get('code');
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const error = urlParams.get('error') || hashParams.get('error');
        
        console.log('Auth params found:', { code, accessToken, refreshToken, error });
        
        if (error) {
          throw new Error(`Authentication error: ${error}`);
        }
        
        // If we have a code, exchange it for a session
        if (code) {
          console.log('🔄 Exchanging code for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          console.log('Exchange result:', { data, error: exchangeError });
          
          if (exchangeError) {
            console.error('Code exchange failed:', exchangeError);
            throw new Error('Invalid or expired password reset link. Please request a new one.');
          }
          
          if (data.session) {
            console.log('✅ Successfully exchanged code for session');
            console.log('Setting component state: isReady=true, errorMessage=""');
            setIsReady(true);
            setSuccess(false);
            setErrorMessage('');
            // Clean up URL parameters
            window.history.replaceState({}, document.title, '/reset-password');
            setLoading(false); // Explicitly set loading to false
            return;
          }
        }
        
        // If we have tokens directly, set the session
        if (accessToken && refreshToken) {
          console.log('🔄 Setting session from tokens...');
          const { data, error: sessionSetError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          console.log('Set session result:', { data, error: sessionSetError });
          
          if (sessionSetError) {
            throw sessionSetError;
          }
          
          if (data.session) {
            console.log('✅ Successfully set session from tokens');
            console.log('Setting component state: isReady=true, errorMessage=""');
            setIsReady(true);
            setSuccess(false);
            setErrorMessage('');
            // Clean up URL parameters
            window.history.replaceState({}, document.title, '/reset-password');
            setLoading(false); // Explicitly set loading to false
            return;
          }
        }
        
        // Check if we already have a valid session (without URL params)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Current session check:', { session, error: sessionError });
        
        if (session) {
          console.log('✅ Valid session found, ready for password reset');
          console.log('Setting component state: isReady=true, errorMessage=""');
          setIsReady(true);
          setSuccess(false);
          setErrorMessage('');
          setLoading(false); // Explicitly set loading to false
          return;
        }
        
        // If we get here, no valid auth was found
        console.log('❌ No valid authentication found');
        throw new Error('Invalid or expired password reset link. Please request a new one.');
        
      } catch (error) {
        console.error('Reset password auth error:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please request a new password reset link.');
        setIsReady(false);
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    handleAuth();
  }, []);

  // Show error state if not ready and not loading
  if (!isReady && !loading) {
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
              {errorMessage || 'The password reset link is invalid or has expired.'}
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link 
              to="/forgot-password" 
              className="text-primary hover:text-primary-dark hover:underline"
            >
              Request a new password reset link
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link 
              to="/login" 
              className="text-primary hover:text-primary-dark hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !errorMessage && !success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying Password Reset Link
            </h2>
            <p className="mt-2 text-gray-600">
              Please wait while we verify your password reset link...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

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

    setLoading(true);
    
    try {
      console.log('Attempting to update password...');
      
      // Update the password directly since we already have a valid session from verifyOtp
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error('Password update failed:', updateError);
        throw updateError;
      }
      
      console.log('Password reset successful');
      setSuccess(true);
      
      // Sign out the user after successful password reset
      await supabase.auth.signOut();
      
      // Clear any existing tokens from the URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.message || 'Failed to reset password. The link may have expired. Please request a new password reset.');
    } finally {
      setLoading(false);
    }
  };

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
              className="px-4 py-2 text-sm font-medium text-white bg-pink-500 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-gray-600">
            Please enter your new password below.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Enter your new password"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Confirm your new password"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errorMessage}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-pink-400' : 'bg-pink-500 hover:bg-pink-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : 'Reset Password'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-pink-500 hover:text-pink-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
