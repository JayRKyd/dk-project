import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error('Password reset error:', error);
        if (error.message.includes('email not confirmed')) {
          setError('Please confirm your email before resetting your password.');
        } else if (error.message.includes('user not found')) {
          setError('No account found with this email address.');
        } else if (error.message.includes('rate limit')) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } else {
        console.log('Password reset email sent successfully');
        setMessage('Password reset email sent! Please check your inbox.');
        setShowForm(false);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-[500px] mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
          {message && <p className="mb-4 text-green-600">{message}</p>}
          <p className="mb-6">
            We've sent you an email with instructions to reset your password.
            If you don't see it, please check your spam folder.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Password Reset Form */}
        <div className="w-full md:w-[500px] bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}
          <p className="mb-6 text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-500 text-white py-3 px-6 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </div>
            
            <div className="text-center">
              <Link to="/login" className="text-pink-500 hover:text-pink-600 text-sm hover:underline">
                ← Back to Login
              </Link>
            </div>
          </form>
        </div>

        {/* Help Sidebar */}
        <div className="w-full md:w-[300px] bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <ul className="space-y-4 text-gray-700">
            <li>
              <strong className="text-primary">Check your spam folder</strong>
              <p className="text-sm mt-1">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
            </li>
            <li>
              <strong className="text-primary">Email not recognized?</strong>
              <p className="text-sm mt-1">
                Make sure you're using the email address you registered with.
              </p>
            </li>
            <li>
              <strong className="text-primary">Still having trouble?</strong>
              <p className="text-sm mt-1">
                Contact our support team for assistance.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* FAQ Link */}
      <div className="text-center mt-8">
        <p className="text-gray-600">
          Questions? Find all your answers about DateKelly in our{' '}
          <Link to="/faq" className="text-primary hover:text-primary-dark underline">
            FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}