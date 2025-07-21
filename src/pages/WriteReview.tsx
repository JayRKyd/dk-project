import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Star, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { clientDashboardService } from '../services/clientDashboardService';

export default function WriteReview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ladyName } = useParams<{ ladyName: string }>();
  
  const [formData, setFormData] = useState({
    rating: 0,
    positives: [''],
    negatives: [''],
    anonymous: false,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setError('You must be logged in to submit a review.');
      return;
    }
    
    if (!ladyName) {
      setError('Lady name is required.');
      return;
    }
    
    // Validation
    if (formData.rating === 0) {
      setError('Please select a rating.');
      return;
    }
    
    const validPositives = formData.positives.filter(p => p.trim());
    if (validPositives.length === 0) {
      setError('Please add at least one positive point.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await clientDashboardService.submitReview({
        ladyName: decodeURIComponent(ladyName),
        rating: formData.rating,
        positives: validPositives,
        negatives: formData.negatives.filter(n => n.trim()),
        isAnonymous: formData.anonymous
      });
      
      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard/client/reviews');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error submitting review:', error);
      setError(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const addPoint = (type: 'positives' | 'negatives') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removePoint = (type: 'positives' | 'negatives', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updatePoint = (type: 'positives' | 'negatives', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for sharing your experience. Your review helps other clients make informed decisions.
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to your reviews...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/client/reviews"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Reviews</span>
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h1>
        {ladyName && (
          <p className="text-gray-600 mb-6">
            Share your experience with <span className="font-medium">{decodeURIComponent(ladyName)}</span>
          </p>
        )}
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Unable to submit review</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleRatingChange(num)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    formData.rating >= num
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            {formData.rating > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Rating: {formData.rating}/10
              </p>
            )}
          </div>

          {/* Positive Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Positive Points <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.positives.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-500 text-xl">+</span>
                  </div>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updatePoint('positives', index, e.target.value)}
                    placeholder="What did you like?"
                    maxLength={500}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePoint('positives', index)}
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPoint('positives')}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add another positive point
              </button>
            </div>
          </div>

          {/* Negative Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Negative Points
            </label>
            <div className="space-y-3">
              {formData.negatives.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-500 text-xl">-</span>
                  </div>
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updatePoint('negatives', index, e.target.value)}
                    placeholder="What could be improved?"
                    maxLength={500}
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePoint('negatives', index)}
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addPoint('negatives')}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium flex items-center gap-1"
              >
                <Minus className="h-4 w-4" />
                Add another negative point
              </button>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData(prev => ({ ...prev, anonymous: e.target.checked }))}
              className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-600">
              Post anonymously
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={submitting}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || formData.rating === 0}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Post Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}