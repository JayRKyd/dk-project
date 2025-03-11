import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', credentials);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Login Form */}
        <div className="w-full md:w-[500px] bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email / Username
              </label>
              <input
                type="text"
                id="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
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
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-pink-500 hover:text-pink-600 text-sm">
                I forgot my password
              </Link>
              <button
                type="submit"
                className="bg-pink-500 text-white px-8 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                Login
              </button>
            </div>
          </form>
        </div>

        {/* Registration Sidebar */}
        <div className="w-full md:w-[300px] bg-pink-100 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Register</h2>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li>You want to advertise?</li>
            <li>You want to give likes?</li>
            <li>You want to leave a review?</li>
            <li>You want to become a member?</li>
          </ul>
          <Link
            to="/register"
            className="block text-center bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Register for FREE!
          </Link>
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