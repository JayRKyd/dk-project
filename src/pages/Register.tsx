import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  accountType: 'lady' | 'client' | 'club' | 'advertiser';
  agreeToTerms: boolean;
}

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

  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      // Handle registration and ad creation
      console.log('Registration data:', formData);
      console.log('Advertisement data:', adData);
    }
  };

  if (step === 2) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-[500px] mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Your Advertisement</h1>
          <p className="text-gray-600 mb-8">
            Set up your FREE advertisement and start receiving clients.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={adData.name}
                onChange={(e) => setAdData({ ...adData, name: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={adData.description}
                onChange={(e) => setAdData({ ...adData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={adData.location}
                onChange={(e) => setAdData({ ...adData, location: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setAdData({ ...adData, photos: Array.from(e.target.files || []) })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload up to 7 photos. First photo will be your main photo.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-pink-500 hover:text-pink-600"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
              >
                Create Advertisement
              </button>
            </div>
          </form>
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
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="flex flex-col space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="lady"
                    checked={formData.accountType === 'lady'}
                    onChange={(e) => setFormData({ ...formData, accountType: 'lady' })}
                    className="text-pink-500 focus:ring-pink-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700"><span className="font-bold">Lady</span> - I want to create an advertisement</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="client"
                    checked={formData.accountType === 'client'}
                    onChange={(e) => setFormData({ ...formData, accountType: 'client' })}
                    className="text-pink-500 focus:ring-pink-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700"><span className="font-bold">Client</span> - I want to visit a Lady</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="club"
                    checked={formData.accountType === 'club'}
                    onChange={(e) => setFormData({ ...formData, accountType: 'club' })}
                    className="text-pink-500 focus:ring-pink-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700"><span className="font-bold">Clubs & Agencies</span> - I want to advertise my club/agency</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accountType"
                    value="advertiser"
                    checked={formData.accountType === 'advertiser'}
                    onChange={(e) => setFormData({ ...formData, accountType: 'advertiser' })}
                    className="text-pink-500 focus:ring-pink-500 h-4 w-4"
                  />
                  <span className="ml-2 text-gray-700"><span className="font-bold">Advertiser</span> - I want to promote my business</span>
                </label>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                className="mt-1 text-pink-500 focus:ring-pink-500 rounded"
                required
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
    </div>
  );
}