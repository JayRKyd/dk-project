import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Camera,
  Star,
  X,
  Calendar,
  DollarSign,
  Loader2,
  Check,
  CreditCard
} from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { clubSettingsService } from '../../services/clubSettingsService';
import { uploadMultipleImages } from '../../services/imageService';

interface PromoForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  images: File[];
  price: string;
  type: 'discount' | 'special' | 'event';
  discountPercentage: string;
}

const PROMO_CREDIT_COST = 25; // Cost in credits to create a promotion

export default function ClubPromo() {
  const { clubProfile, credits, actions } = useClubDashboard() as any;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<PromoForm>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    images: [],
    price: '',
    type: 'discount',
    discountPercentage: ''
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Limit to 4 images total
    const remainingSlots = 4 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }));

    // Create preview URLs
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));
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

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
      
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
      
      // Check maximum duration (30 days)
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        newErrors.endDate = 'Promotion duration cannot exceed 30 days';
      }
    }
    
    if (formData.type === 'discount' && formData.discountPercentage) {
      const percentage = parseInt(formData.discountPercentage);
      if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
        newErrors.discountPercentage = 'Discount must be between 1-100%';
      }
    }
    
    if (formData.price && isNaN(parseFloat(formData.price))) {
      newErrors.price = 'Please enter a valid price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clubProfile?.id) {
      alert('Club profile not found. Please try again.');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    // Check if user has enough credits
    if (credits < PROMO_CREDIT_COST) {
      setShowCreditWarning(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare promotion data
      const promotionData = {
        title: formData.title,
        description: formData.description,
        promo_type: formData.type,
        discount_percentage: formData.type === 'discount' && formData.discountPercentage 
          ? parseInt(formData.discountPercentage) : null,
        fixed_price: formData.price ? parseFloat(formData.price) : null,
        start_date: formData.startDate,
        end_date: formData.endDate,
        credits_spent: PROMO_CREDIT_COST,
        is_active: true
      };
      
      // Create promotion in database
      const promotion = await clubSettingsService.createClubPromotion(clubProfile.id, promotionData);

      // Upload images to storage under promo-images/{clubId}/{promotionId}
      if (formData.images.length > 0) {
        const uploads = await uploadMultipleImages(
          formData.images,
          'promo-images',
          `${promotion.id}`,
          clubProfile.id
        );
        // Use first image as main image_url
        const mainUrl = uploads[0]?.url;
        if (mainUrl) {
          await clubSettingsService.updateClubPromotion(promotion.id, { image_url: mainUrl });
        }
      }
      
      // Spend credits
      await actions.spendCredits(PROMO_CREDIT_COST, `Promotion created: ${formData.title}`);
      
      console.log('Promotion created successfully:', promotion);
      
      // Navigate back to dashboard with success message
      navigate('/dashboard/club?promo=created');
      
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert('Failed to create promotion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Promo Advertisement</h1>
          <div className="bg-pink-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-600">Cost:</div>
            <div className="font-bold text-pink-600">{PROMO_CREDIT_COST} DK Credits</div>
          </div>
        </div>

        {/* Credit Balance Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Your DK Credits</span>
            </div>
           <div className="text-lg font-bold text-blue-600">{credits?.balance ?? 0}</div>
          </div>
          <div className="text-sm text-blue-600 mt-1">
            { (credits?.balance ?? 0) >= PROMO_CREDIT_COST 
              ? `You'll have ${(credits?.balance ?? 0) - PROMO_CREDIT_COST} credits after creating this promotion`
              : `You need ${PROMO_CREDIT_COST - (credits?.balance ?? 0)} more credits to create this promotion`
            }
          </div>
        </div>

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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., '50% Off All Services', 'Happy Hour Special'"
              required
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Describe your promotion in detail..."
              required
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Discount Percentage (for discount type) */}
          {formData.type === 'discount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountPercentage: e.target.value }))}
                  className={`w-full pr-8 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.discountPercentage ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 25"
                  min="1"
                  max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.discountPercentage && <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>}
            </div>
          )}

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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
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
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., 50"
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
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
              {formData.images.length < 4 && (
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
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload up to 4 images. First image will be the main promotional image.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (credits?.balance ?? 0) < PROMO_CREDIT_COST}
            className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Promotion...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Create Promotion ({PROMO_CREDIT_COST} Credits)
              </>
            )}
          </button>
          
          {(credits?.balance ?? 0) < PROMO_CREDIT_COST && (
            <Link
              to="/dashboard/club/credits"
              className="block w-full bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium text-center"
            >
              Buy More Credits
            </Link>
          )}
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

      {/* Credit Warning Modal */}
      {showCreditWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Insufficient Credits</h3>
            <p className="text-gray-600 mb-6">
              You need {PROMO_CREDIT_COST} DK Credits to create a promotion. You currently have {credits?.balance ?? 0} credits.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreditWarning(false)}
                className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <Link
                to="/dashboard/club/credits"
                className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-center"
              >
                Buy Credits
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}