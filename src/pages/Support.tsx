import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, Shield, Mail } from 'lucide-react';

interface SupportForm {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  attachments: FileList | null;
}

export default function Support() {
  const [formData, setFormData] = useState<SupportForm>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    attachments: null,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request:', formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-[500px] mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Message Sent!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <div className="space-y-4">
            <Link
              to="/"
              className="block text-center bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Return to Home
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="text-pink-500 hover:text-pink-600 text-sm"
            >
              Send another message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        {/* Contact Form */}
        <div className="w-full md:w-[600px] bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Support</h1>
          <p className="text-gray-600 mb-8">
            Fill out the form below and our support team will get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                  required
                />
              </div>
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
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              >
                <option value="">Select a category</option>
                <option value="account">Account Issues</option>
                <option value="advertisement">Advertisement Problems</option>
                <option value="payment">Payment Questions</option>
                <option value="safety">Safety Concerns</option>
                <option value="technical">Technical Support</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                Attachments (optional)
              </label>
              <input
                type="file"
                id="attachments"
                onChange={(e) => setFormData({ ...formData, attachments: e.target.files })}
                multiple
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                Max file size: 5MB. Supported formats: jpg, png, pdf
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Support Info Sidebar */}
        <div className="w-full md:w-[300px] space-y-4">
          <div className="bg-pink-100 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Support Hours</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">24/7 Support</p>
                  <p className="text-sm text-gray-600">
                    Our team is available around the clock to assist you
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Priority Support</p>
                  <p className="text-sm text-gray-600">
                    PRO and ULTRA members receive priority support
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-gray-600">
                    We aim to respond within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Before contacting support</h3>
            <p className="text-sm text-gray-600 mb-4">
              Check if your question is already answered in our FAQ
            </p>
            <Link
              to="/faq"
              className="text-pink-500 hover:text-pink-600 text-sm font-medium"
            >
              Visit FAQ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}