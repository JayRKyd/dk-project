import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Star } from 'lucide-react';

export default function WriteReview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rating: 0,
    positives: [''],
    negatives: [''],
    anonymous: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Review submitted:', formData);
    // Here you would typically submit the review to your backend
    navigate(-1); // Go back to previous page after submission
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
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
          </div>

          {/* Positive Points */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Positive Points
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
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePoint('positives', index)}
                      className="text-gray-400 hover:text-gray-600"
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
                    className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePoint('negatives', index)}
                      className="text-gray-400 hover:text-gray-600"
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
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Post Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}