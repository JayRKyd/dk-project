import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check } from 'lucide-react';
import RegistrationSuccess from '../components/auth/RegistrationSuccess';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  accountType: 'lady' | 'client' | 'club' | 'advertiser';
  agreeToTerms: boolean;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    accountType: 'lady',
    agreeToTerms: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rateLimitExpiry, setRateLimitExpiry] = useState<Date | null>(null);
  const [, setFailedAttempts] = useState(0);
  const [submitError, setSubmitError] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  // Memoized function to format time remaining
  const formatTimeRemaining = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Countdown timer for rate limit cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (rateLimitExpiry) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.ceil((rateLimitExpiry.getTime() - now.getTime()) / 1000);

        if (diff <= 0) {
          setRateLimitExpiry(null);
          if (interval) clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rateLimitExpiry]);

  // Check if the user is currently rate limited
  const checkRateLimit = useCallback((): boolean => {
    if (!rateLimitExpiry) return false;

    const now = new Date();
    if (now < rateLimitExpiry) {
      const diff = Math.ceil((rateLimitExpiry.getTime() - now.getTime()) / 1000);
      setSubmitError(`Too many attempts. Please try again in ${formatTimeRemaining(diff)}`);
      return true;
    }

    setRateLimitExpiry(null);
    return false;
  }, [rateLimitExpiry, formatTimeRemaining]);

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one number, and one special character';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Terms and conditions
    if (!formData.agreeToTerms) {
      errors.terms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Check rate limit before proceeding
    if (checkRateLimit()) {
      setSubmitError('Too many attempts. Please try again later.');
      return;
    }

    // Prevent multiple submissions
    if (loading) {
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.accountType
      );

      if (signUpError) {
        console.error('Signup error details:', signUpError);
        setFailedAttempts(prev => prev + 1);
        
        // More specific error messages based on the error code
        if (signUpError.message?.includes('already registered')) {
          setSubmitError('This email is already registered. Please log in instead.');
        } else if (signUpError.message?.includes('email')) {
          setSubmitError('Please enter a valid email address.');
        } else {
          setSubmitError(signUpError.message || 'An error occurred during registration');
        }
      } else {
        // Check if we need to show email confirmation message
        if (data?.user?.identities?.length === 0) {
          // User already exists
          setSubmitError('This email is already registered. Please log in instead.');
        } else if (data?.user?.confirmed_at || data?.user?.email_confirmed_at) {
          // User is already confirmed
          setShowSuccessModal(true);
          setFailedAttempts(0);
        } else {
          // Show success but mention email confirmation
          setShowSuccessModal(true);
          setFailedAttempts(0);
        }
      }
    } catch (err) {
      console.error('Unexpected error during signup:', err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for the field being edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (showSuccessModal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center p-8 bg-white rounded-lg shadow">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Account Created Successfully!
          </h2>
          <p className="mt-2 text-gray-600">
            Your account has been created. Please check your email to verify your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Registration Form */}
        <div className="w-full md:w-[500px] bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Register for FREE!</h1>
          <p className="text-gray-600 mb-8">
            Join DateKelly to access all features and connect with our community.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    formErrors.email ? 'border-red-500' : 'border-pink-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50`}
                  aria-invalid={!!formErrors.email}
                  aria-describedby={formErrors.email ? 'email-error' : undefined}
                  required
                />
                {formErrors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    formErrors.username ? 'border-red-500' : 'border-pink-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50`}
                  aria-invalid={!!formErrors.username}
                  aria-describedby={formErrors.username ? 'username-error' : undefined}
                  required
                />
                {formErrors.username && (
                  <p id="username-error" className="mt-1 text-sm text-red-600">
                    {formErrors.username}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    formErrors.password ? 'border-red-500' : 'border-pink-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50`}
                  aria-invalid={!!formErrors.password}
                  aria-describedby={formErrors.password ? 'password-error' : undefined}
                  required
                />
                {formErrors.password && (
                  <p id="password-error" className="mt-1 text-sm text-red-600">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${
                    formErrors.confirmPassword ? 'border-red-500' : 'border-pink-300'
                  } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50`}
                  aria-invalid={!!formErrors.confirmPassword}
                  aria-describedby={formErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  required
                />
                {formErrors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1 text-sm text-red-600">
                    {formErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.accountType === 'lady' ? 'border-pink-500 bg-pink-50 shadow-sm' : 'border-gray-300 hover:border-pink-300'}`}
                  onClick={() => setFormData({
                    ...formData,
                    accountType: 'lady'
                  })}
                >
                  <div className="flex items-center mb-2">
                    <input 
                      type="radio" 
                      id="lady" 
                      name="accountType" 
                      value="lady"
                      checked={formData.accountType === 'lady'}
                      onChange={handleChange}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400"
                    />
                    <label htmlFor="lady" className="ml-2 font-medium">Lady</label>
                  </div>
                  <p className="text-sm text-gray-600">Create a profile to advertise your services</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.accountType === 'client' ? 'border-pink-500 bg-pink-50 shadow-sm' : 'border-gray-300 hover:border-pink-300'}`}
                  onClick={() => setFormData({
                    ...formData,
                    accountType: 'client'
                  })}
                >
                  <div className="flex items-center mb-2">
                    <input 
                      type="radio" 
                      id="client" 
                      name="accountType" 
                      value="client"
                      checked={formData.accountType === 'client'}
                      onChange={handleChange}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400"
                    />
                    <label htmlFor="client" className="ml-2 font-medium">Client</label>
                  </div>
                  <p className="text-sm text-gray-600">Browse profiles and book services</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${formData.accountType === 'club' ? 'border-pink-500 bg-pink-50 shadow-sm' : 'border-gray-300 hover:border-pink-300'}`}
                  onClick={() => setFormData({
                    ...formData,
                    accountType: 'club'
                  })}
                >
                  <div className="flex items-center mb-2">
                    <input 
                      type="radio" 
                      id="club" 
                      name="accountType" 
                      value="club"
                      checked={formData.accountType === 'club'}
                      onChange={handleChange}
                      className="h-4 w-4 text-pink-500 focus:ring-pink-400"
                    />
                    <label htmlFor="club" className="ml-2 font-medium">Club/Agency</label>
                  </div>
                  <p className="text-sm text-gray-600">Manage multiple ladies and club services</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`mt-1 text-pink-500 focus:ring-pink-500 rounded ${
                    formErrors.terms ? 'border-red-500' : ''
                  }`}
                  aria-invalid={!!formErrors.terms}
                  aria-describedby="terms-error"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-pink-500 hover:text-pink-600 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-pink-500 hover:text-pink-600 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {formErrors.terms && (
                <p id="terms-error" className="text-sm text-red-600">
                  {formErrors.terms}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Create Account
            </button>
          </form>
        </div>

        {/* Benefits Sidebar */}
        <div className="w-full md:w-[300px] bg-pink-100 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Member Benefits</h2>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">✓</span>
              <span>Post advertisements and reach more clients</span>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">✓</span>
              <span>Like and save your favorite profiles</span>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">✓</span>
              <span>Share your experiences through reviews</span>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2">✓</span>
              <span>Access exclusive member features</span>
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-pink-200">
            {submitError && (
              <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <p className="font-bold">Error</p>
                <p>{submitError}</p>
              </div>
            )}
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-500 hover:text-pink-600 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="text-center mt-8">
        <p className="text-gray-600">
          Questions? Find all your answers about DateKelly in our{' '}
          <Link to="/faq" className="text-pink-500 hover:text-pink-600 underline">
            FAQ
          </Link>
        </p>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <RegistrationSuccess 
          onClose={() => setShowSuccessModal(false)}
          userRole={formData.accountType}
        />
      )}
    </div>
  );
}