import React from 'react';
import { Link } from 'react-router-dom';
import { Cookie, Shield, AlertCircle, Heart } from 'lucide-react';

export default function Cookies() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Cookie className="h-8 w-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-gray-900">Cookie Policy</h1>
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
            This Cookie Policy explains how DateKelly uses cookies and similar tracking technologies on our website. By using our service, you consent to the use of cookies as described in this policy.
          </p>

          {/* Sections */}
          <div className="space-y-8">
            {/* What Are Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. What Are Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Cookies are small text files that are stored on your device when you visit our website. They help us:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Understand how you use our website</li>
                  <li>Improve your browsing experience</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Keep your account secure</li>
                </ul>
              </div>
            </section>

            {/* Types of Cookies We Use */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="font-medium text-gray-900">Essential Cookies</h3>
                <p>Required for the website to function properly:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Authentication and security</li>
                  <li>Account preferences</li>
                  <li>Shopping cart functionality</li>
                </ul>

                <h3 className="font-medium text-gray-900 mt-6">Performance Cookies</h3>
                <p>Help us understand how visitors interact with our website:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Page load times</li>
                  <li>Error messages</li>
                  <li>User behavior analytics</li>
                </ul>

                <h3 className="font-medium text-gray-900 mt-6">Functionality Cookies</h3>
                <p>Remember your preferences and settings:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Language preferences</li>
                  <li>Location settings</li>
                  <li>Personalized features</li>
                </ul>

                <h3 className="font-medium text-gray-900 mt-6">Targeting/Advertising Cookies</h3>
                <p>Help deliver relevant advertisements:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Track advertisements you've seen</li>
                  <li>Measure ad effectiveness</li>
                  <li>Prevent repetitive ads</li>
                </ul>
              </div>
            </section>

            {/* Cookie Management */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Managing Your Cookie Preferences</h2>
              <div className="space-y-4 text-gray-600">
                <p>You can control cookies through your browser settings:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Block all cookies</li>
                  <li>Delete existing cookies</li>
                  <li>Allow cookies from specific websites</li>
                  <li>Set cookie preferences per website</li>
                </ul>
                <div className="bg-pink-50 rounded-lg p-4 mt-4">
                  <p className="font-medium text-gray-900">Please Note:</p>
                  <p>Blocking essential cookies may affect website functionality.</p>
                </div>
              </div>
            </section>

            {/* Third-Party Cookies */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>We use third-party services that may set cookies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analytics providers (e.g., Google Analytics)</li>
                  <li>Payment processors</li>
                  <li>Social media platforms</li>
                  <li>Advertising networks</li>
                </ul>
                <p>These third parties have their own privacy and cookie policies.</p>
              </div>
            </section>

            {/* Cookie Duration */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cookie Duration</h2>
              <div className="space-y-4 text-gray-600">
                <p>Cookies on our website last for different periods:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Session Cookies: Deleted when you close your browser</li>
                  <li>Persistent Cookies: Remain for a set period</li>
                  <li>Advertising Cookies: Typically 30-90 days</li>
                  <li>Analytics Cookies: Up to 2 years</li>
                </ul>
              </div>
            </section>

            {/* Updates to Cookie Policy */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Updates to Cookie Policy</h2>
              <div className="space-y-4 text-gray-600">
                <p>We may update this policy:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To reflect changes in our practices</li>
                  <li>To comply with legal requirements</li>
                  <li>To improve transparency</li>
                </ul>
                <p>Continued use of our website after changes constitutes acceptance.</p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Contact Information</h2>
              <div className="space-y-4 text-gray-600">
                <p>For questions about our cookie practices:</p>
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