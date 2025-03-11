import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Camera,
  Plus,
  Star,
  X,
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';

interface PromoForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  images: File[];
  price: string;
  type: 'discount' | 'special' | 'event';
}

export default function ClubPromo() {
  const [formData, setFormData] = useState<PromoForm>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    images: [],
    price: '',
    type: 'discount'
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating new promo:', formData);
    // Handle promo creation
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/club"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Create Promo Advertisement</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Promo Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Type
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'discount' }))}
                className={`p-4 rounded-lg text-center transition-colors ${
                  formData.type === 'discount'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 hover:bg-pink-100 text-gray-900'
                }`}
              >
                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Special Discount</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'special' }))}
                className={`p-4 rounded-lg text-center transition-colors ${
                  formData.type === 'special'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 hover:bg-pink-100 text-gray-900'
                }`}
              >
                <Star className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Special Offer</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'event' }))}
                className={`p-4 rounded-lg text-center transition-colors ${
                  formData.type === 'event'
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-50 hover:bg-pink-100 text-gray-900'
                }`}
              >
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Special Event</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="e.g., '50% Off All Services', 'Happy Hour Special'"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Describe your promotion in detail..."
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotional Price (if applicable)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promotion Images
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="aspect-square relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Add Photos</span>
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload up to 4 images. First image will be the main promotional image.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Create Promotion
          </button>
        </form>

        {/* Guidelines */}
        <div className="mt-8 bg-pink-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Promotion Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Promotions must be accurate and not misleading</li>
            <li>• All images must comply with our content guidelines</li>
            <li>• Minimum promotion duration is 1 day</li>
            <li>• Maximum promotion duration is 30 days</li>
            <li>• Prices must include VAT if applicable</li>
            <li>• Terms and conditions must be clearly stated</li>
          </ul>
        </div>
      </div>
    </div>
  );
}