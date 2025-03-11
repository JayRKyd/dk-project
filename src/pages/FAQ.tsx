import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'Creating an account is free and easy! Click on the "Register" button in the top menu, fill in your email, choose a username and password, select your account type (Lady or Client), and agree to our terms of service.'
  },
  {
    id: '2',
    category: 'Account',
    question: 'How can I reset my password?',
    answer: 'If you forgot your password, click on the "I forgot my password" link on the login page. Enter your email address, and we\'ll send you instructions to reset your password.'
  },
  {
    id: '3',
    category: 'Advertisements',
    question: 'How do I post an advertisement?',
    answer: 'To post an advertisement, you need to be registered as a Lady. After logging in, go to your profile dashboard and click on "Create New Advertisement". Fill in all required information and submit for review.'
  },
  {
    id: '4',
    category: 'Advertisements',
    question: 'How long does my advertisement stay active?',
    answer: 'Free advertisements stay active for 30 days. PRO and ULTRA members\' advertisements stay active until manually deactivated or the membership expires.'
  },
  {
    id: '5',
    category: 'Reviews',
    question: 'Can I write a review?',
    answer: 'Yes! Registered clients can write reviews for services they\'ve used. To write a review, visit the profile you want to review and click on the "Write Review" button.'
  },
  {
    id: '6',
    category: 'Reviews',
    question: 'What should I include in my review?',
    answer: 'A good review includes your honest experience, both positive and negative points. Be respectful and factual. Avoid sharing explicit details or personal information.'
  },
  {
    id: '7',
    category: 'Safety',
    question: 'How do I stay safe when meeting?',
    answer: 'Always meet in a safe location, inform a trusted friend about your plans, and trust your instincts. We recommend verifying profiles and reading reviews before meeting.'
  },
  {
    id: '8',
    category: 'Safety',
    question: 'How do I report inappropriate behavior?',
    answer: 'You can report inappropriate behavior by clicking the "Report" button on any profile or advertisement. Our moderation team will review your report within 24 hours.'
  },
  {
    id: '9',
    category: 'Membership',
    question: 'What are the different membership levels?',
    answer: 'We offer FREE, PRO, PRO-PLUS, and ULTRA memberships. Each level provides additional features like verified status, priority listing, and advanced search options.'
  },
  {
    id: '10',
    category: 'Membership',
    question: 'How do I upgrade my membership?',
    answer: 'To upgrade your membership, go to your profile settings and click on "Upgrade Membership". Choose your desired plan and complete the payment process.'
  }
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const toggleItem = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Frequently Asked Questions
      </h1>

      {/* Search and Category Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedCategory === 'All'
                ? 'bg-pink-500 text-white'
                : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
              }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? 'bg-pink-500 text-white'
                  : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">{item.question}</span>
              {expandedItems.includes(item.id) ? (
                <ChevronUp className="h-5 w-5 text-pink-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-pink-500" />
              )}
            </button>
            {expandedItems.includes(item.id) && (
              <div className="px-6 pb-4">
                <div className="pt-2 text-gray-600">{item.answer}</div>
              </div>
            )}
          </div>
        ))}

        {filteredFAQs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No matching questions found.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 text-pink-500 hover:text-pink-600"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-12 bg-pink-50 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Still have questions?
        </h2>
        <p className="text-gray-600 mb-4">
          Our support team is here to help you 24/7
        </p>
        <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}