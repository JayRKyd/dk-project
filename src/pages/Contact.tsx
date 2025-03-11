import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Phone, Clock, MapPin, MessageSquare, Shield, ArrowRight } from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  attachments: FileList | null;
}

export default function Contact() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: searchParams.get('category') || '',
    attachments: null,
  });

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFormData(prev => ({ ...prev, category }));
    }
  }, [searchParams]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
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
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Contact Form */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h1>
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
                  <option value="report">Report User/Content</option>
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
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:w-[400px] space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Email</h3>
                  <p className="text-gray-600">support@datekelly.com</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We aim to respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Phone</h3>
                  <p className="text-gray-600">+31 (0)20 123 4567</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Mon-Fri from 9am to 6pm CET
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Office</h3>
                  <p className="text-gray-600">
                    Keizersgracht 123<br />
                    1015 CW Amsterdam<br />
                    Netherlands
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-pink-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Business Hours</h3>
                  <div className="text-gray-600">
                    <p>Monday - Friday: 9:00 - 18:00</p>
                    <p>Saturday: 10:00 - 14:00</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Link Card */}
          <div className="bg-pink-50 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="bg-pink-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Need Quick Answers?</h3>
                <p className="text-gray-600 mb-4">
                  Check our frequently asked questions for immediate answers to common questions.
                </p>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-medium"
                >
                  Visit FAQ
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}