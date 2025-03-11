import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, AlertCircle, Heart } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Lock className="h-8 w-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <p className="text-gray-600">
          Last updated: March 15, 2024
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Introduction */}
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-8">
            At DateKelly, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>

          {/* Sections */}
          <div className="space-y-8">
            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-600">
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (email, username, password)</li>
                  <li>Profile information (name, age, location, photos)</li>
                  <li>Usage data (interactions, messages, bookings)</li>
                  <li>Payment information (processed securely by our payment providers)</li>
                  <li>Device information (IP address, browser type, device type)</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our Service</li>
                  <li>Process your transactions</li>
                  <li>Send you service-related notifications</li>
                  <li>Improve our Service</li>
                  <li>Prevent fraud and abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service providers who assist in operating our platform</li>
                  <li>Law enforcement when required by law</li>
                  <li>Other users as part of your public profile</li>
                  <li>Payment processors for transaction processing</li>
                </ul>
                <p>We do NOT sell your personal information to third parties.</p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-600">
                <p>We implement security measures including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of sensitive data</li>
                  <li>Regular security assessments</li>
                  <li>Secure data storage</li>
                  <li>Access controls and authentication</li>
                  <li>Regular backups</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <div className="space-y-4 text-gray-600">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to data processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent</li>
                </ul>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use cookies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences</li>
                  <li>Understand how you use our Service</li>
                  <li>Improve user experience</li>
                  <li>Provide personalized content</li>
                  <li>Analyze site traffic</li>
                </ul>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Changes to Privacy Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may update this policy:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We will notify you of significant changes</li>
                  <li>Changes will be effective immediately upon posting</li>
                  <li>Continued use constitutes acceptance</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>For privacy-related inquiries:</p>
                <div className="bg-pink-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-900">Contact Options</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-pink-500" />
                      <Link to="/support" className="text-pink-500 hover:text-pink-600">
                        Contact Support
                      </Link>
                    </li>
                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <Link to="/faq" className="text-pink-500 hover:text-pink-600">
                        Visit FAQ
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}