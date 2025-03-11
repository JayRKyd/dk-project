import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Image as ImageIcon, Video as VideoIcon, Lock, X, Camera, Plus } from 'lucide-react';

type Theme = 'Happy' | 'Romantic' | 'No comment' | 'Sexy' | 'Wild' | 'Hardcore';

interface CreatePostForm {
  theme: Theme;
  content: string;
  images: File[];
  videos: File[];
  type: 'free' | 'premium';
  price: number; 
  allowComments: boolean;
}

export default function CreateFanPost() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePostForm>({
    theme: 'No comment',
    content: '',
    images: [],
    videos: [],
    type: 'free',
    price: 1,
    allowComments: false
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState<string[]>([]);

  const themes: Theme[] = ['Happy', 'Romantic', 'No comment', 'Sexy', 'Wild', 'Hardcore'];

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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ...files]
    }));

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setVideoPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
    URL.revokeObjectURL(videoPreviewUrls[index]);
    setVideoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating new fan post:', formData);
    // Here you would typically make an API call to create the post
    navigate('/fan-posts/melissa');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Back Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link
              to="/fan-posts/melissa"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
            >
              <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
              <span>Back to Fan Posts</span>
            </Link>
            <Link
              to="/dashboard/lady/fan-posts"
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <span>Manage my Fan Posts</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Fan Post</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, theme }))}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    formData.theme === theme
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 hover:bg-pink-100 text-gray-900'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Post Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
              placeholder="Write something about your post..."
            />
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos
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
                  <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Photos</span>
                </label>
              </div>
            </div>

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Videos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {videoPreviewUrls.map((url, index) => (
                  <div key={index} className="aspect-square relative group bg-black rounded-lg flex items-center justify-center">
                    <VideoIcon className="h-8 w-8 text-white" />
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <VideoIcon className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Videos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Premium Settings */}
          <div className="space-y-4">
            {/* Post Type Selection */}
            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Post Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'free' }))}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    formData.type === 'free'
                      ? 'bg-green-500 text-white'
                      : 'bg-white hover:bg-green-50'
                  }`}
                >
                  <div className="font-medium mb-1">Free Fan Post</div>
                  <div className="text-sm opacity-75">Everyone can see it for free</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'premium' }))}
                  className={`p-4 rounded-lg text-center transition-colors ${
                    formData.type === 'premium'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white hover:bg-pink-50'
                  }`}
                >
                  <div className="font-medium mb-1">Premium Content</div>
                  <div className="text-sm opacity-75">Fans need to pay to unlock</div>
                </button>
              </div>
            </div>

            {/* Price Selection (only for premium) */}
            {formData.type === 'premium' && (
              <div className="bg-pink-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Unlock Price</h3>
                  <Lock className="h-5 w-5 text-pink-500" />
                </div>
                <select
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                >
                  <option value={1}>1 DK Credit</option>
                  <option value={2}>2 DK Credits</option>
                  <option value={5}>5 DK Credits</option>
                  <option value={10}>10 DK Credits</option>
                </select>
              </div>
            )}

            {/* Comments Toggle */}
            <div className="bg-pink-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Comments</h3>
                  <p className="text-sm text-gray-500 mt-1">Allow fans to comment on this post</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowComments}
                    onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {/* Terms Agreement */}
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="termsOfService"
                className="mt-1 text-pink-500 focus:ring-pink-500 rounded"
                required
              />
              <label htmlFor="termsOfService" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-pink-500 hover:text-pink-600 underline">
                  Terms of Service
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="privacyPolicy"
                className="mt-1 text-pink-500 focus:ring-pink-500 rounded"
                required
              />
              <label htmlFor="privacyPolicy" className="text-sm text-gray-600">
                I agree to the{' '}
                and{' '}
                <Link to="/privacy" className="text-pink-500 hover:text-pink-600 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="contentOwnership"
                className="mt-1 text-pink-500 focus:ring-pink-500 rounded"
                required
              />
              <label htmlFor="contentOwnership" className="text-sm text-gray-600">
                I confirm that I am the owner of all content and have the right to publish it
              </label>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="creditAgreement"
                className="mt-1 text-pink-500 focus:ring-pink-500 rounded"
                required
              />
              <label htmlFor="creditAgreement" className="text-sm text-gray-600">
                I agree to pay 1 DK Credit for creating this Fan Post
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Fan Post
          </button>
        </form>

        {/* FAQ Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What are Fan Posts?</h3>
              <p className="text-gray-600">
                Fan Posts are a way to share exclusive content with your fans. You can share photos, videos, and updates about your activities.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What's the difference between Free and Premium posts?</h3>
              <p className="text-gray-600">
                Free posts are visible to everyone, while Premium posts require fans to pay DK Credits to unlock the content. Premium posts are a great way to monetize your exclusive content.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">How do I earn from Fan Posts?</h3>
              <p className="text-gray-600">
                When fans unlock your Premium posts using DK Credits, you earn a share of those credits. The more engaging your content, the more earnings potential you have.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">What content is allowed?</h3>
              <p className="text-gray-600">
                Content must comply with our Terms of Service. Explicit adult content is not allowed. Focus on tasteful, engaging content that showcases your personality and services.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Can I edit or delete my posts?</h3>
              <p className="text-gray-600">
                Yes, you can edit or delete your posts at any time. However, if fans have already unlocked a Premium post, they will still have access to the content.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">How do comments work?</h3>
              <p className="text-gray-600">
                You can choose to enable or disable comments on each post. When enabled, fans can interact with your content, helping build engagement and community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}