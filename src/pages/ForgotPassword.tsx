import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log('Password reset requested for:', email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-[500px] mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to your email address. Please check your inbox.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="block text-center bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Return to Login
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="text-pink-500 hover:text-pink-600 text-sm"
              >
                Try another email address
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Password Reset Form */}
        <div className="w-full md:w-[500px] bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Retrieve Password</h1>
          <p className="text-gray-600 mb-8">
            Enter your email address and we'll send you instructions to reset your password.
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
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link to="/login" className="text-pink-500 hover:text-pink-600 text-sm">
                Back to Login
              </Link>
              <button
                type="submit"
                className="bg-pink-500 text-white px-8 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Send Instructions
              </button>
            </div>
          </form>
        </div>

        {/* Help Sidebar */}
        <div className="w-full md:w-[300px] bg-pink-100 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <ul className="space-y-4 text-gray-700 mb-6">
            <li>
              <strong>Check your spam folder</strong>
              <p className="text-sm mt-1">
                If you don't see the email in your inbox, please check your spam folder.
              </p>
            </li>
            <li>
              <strong>Email not recognized?</strong>
              <p className="text-sm mt-1">
                Make sure you're using the email address you registered with.
              </p>
            </li>
            <li>
              <strong>Still having trouble?</strong>
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
          <Link to="/faq" className="text-pink-500 hover:text-pink-600 underline">
            FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}