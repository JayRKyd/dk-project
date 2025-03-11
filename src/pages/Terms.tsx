import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, Lock, Heart } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Shield className="h-8 w-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
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
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using DateKelly.com (the "Service") operated by DateKelly ("us", "we", or "our").
          </p>

          {/* Sections */}
          <div className="space-y-8">
            {/* Account Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Account Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>By creating an account on our Service, you agree to the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be 18 years or older to use this Service</li>
                  <li>You must provide accurate and complete information when creating your account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must not use the Service for any illegal purposes</li>
                  <li>Your account may be terminated if you violate any of these terms</li>
                </ul>
              </div>
            </section>

            {/* Content Guidelines */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Content Guidelines</h2>
              <div className="space-y-4 text-gray-600">
                <p>When using our Service, you agree to follow these content guidelines:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All photos must be recent and authentic</li>
                  <li>No explicit nudity in profile photos</li>
                  <li>No misleading or false information</li>
                  <li>No spam or automated posting</li>
                  <li>No harassment or abusive behavior</li>
                  <li>No solicitation of illegal services</li>
                </ul>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>For paid services on DateKelly:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All payments are processed securely through our payment providers</li>
                  <li>Membership fees are non-refundable</li>
                  <li>DK Credits purchases are final and non-transferable</li>
                  <li>We reserve the right to modify pricing at any time</li>
                  <li>Subscription renewals are automatic unless cancelled</li>
                </ul>
              </div>
            </section>

            {/* Privacy & Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Privacy & Security</h2>
              <div className="space-y-4 text-gray-600">
                <p>Your privacy and security are important to us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We protect your personal information as described in our Privacy Policy</li>
                  <li>You must not share your account credentials with others</li>
                  <li>Report any security concerns immediately</li>
                  <li>We use industry-standard security measures</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Termination</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may terminate or suspend your account if you violate these Terms, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Providing false information</li>
                  <li>Violating content guidelines</li>
                  <li>Engaging in illegal activities</li>
                  <li>Harassing other users</li>
                  <li>Creating multiple accounts</li>
                </ul>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Changes to Terms</h2>
              <div className="space-y-4 text-gray-600">
                <p>We reserve the right to modify these terms:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We will notify users of significant changes</li>
                  <li>Continued use of the Service constitutes acceptance of new terms</li>
                  <li>Users are responsible for reviewing terms regularly</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="bg-pink-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-900">Support Options</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-pink-500" />
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