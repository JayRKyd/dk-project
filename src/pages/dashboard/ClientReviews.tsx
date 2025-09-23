import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ThumbsUp, ThumbsDown, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clientDashboardService, Review } from '../../services/clientDashboardService';
import { advancedReviewService } from '../../services/advancedReviewService';

export default function ClientReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userBookingHistory, setUserBookingHistory] = useState<string[]>([]);
  const [userInteractions, setUserInteractions] = useState<Record<string, 'like' | 'dislike' | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    rating: number;
    positives: string[];
    negatives: string[];
  }>({ rating: 0, positives: [''], negatives: [''] });

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load reviews, booking history, and user interactions in parallel
      const [reviewsData, bookingHistory] = await Promise.all([
        clientDashboardService.getClientReviews(user.id),
        clientDashboardService.getUserBookingHistory(user.id)
      ]);
      
      setReviews(reviewsData);
      setUserBookingHistory(bookingHistory);
      
      // Load user interactions for each review
      if (reviewsData.length > 0) {
        const interactions: Record<string, 'like' | 'dislike' | null> = {};
        await Promise.all(
          reviewsData.map(async (review) => {
            const interaction = await clientDashboardService.getUserReviewInteraction(review.id, user.id);
            interactions[review.id] = interaction;
          })
        );
        setUserInteractions(interactions);
      }
    } catch (err) {
      console.error('Error loading reviews data:', err);
      setError('Failed to load reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!user?.id || actionLoading[reviewId]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }));
      
      await clientDashboardService.likeReview(reviewId);
      
      // Update local state
      setUserInteractions(prev => ({ ...prev, [reviewId]: 'like' }));
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              likes: review.likes + (userInteractions[reviewId] === 'like' ? 0 : userInteractions[reviewId] === 'dislike' ? 2 : 1),
              dislikes: userInteractions[reviewId] === 'dislike' ? review.dislikes - 1 : review.dislikes
            }
          : review
      ));
    } catch (err: any) {
      console.error('Error liking review:', err);
      // Show error message but don't break the UI
      alert(err.message || 'Failed to like review');
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDislikeReview = async (reviewId: string) => {
    if (!user?.id || actionLoading[reviewId]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }));
      
      await clientDashboardService.dislikeReview(reviewId);
      
      // Update local state
      setUserInteractions(prev => ({ ...prev, [reviewId]: 'dislike' }));
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              dislikes: review.dislikes + (userInteractions[reviewId] === 'dislike' ? 0 : userInteractions[reviewId] === 'like' ? 2 : 1),
              likes: userInteractions[reviewId] === 'like' ? review.likes - 1 : review.likes
            }
          : review
      ));
    } catch (err: any) {
      console.error('Error disliking review:', err);
      alert(err.message || 'Failed to dislike review');
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDeleteReview = async (reviewId: string, ladyName: string) => {
    if (!user?.id || actionLoading[reviewId]) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete your review for ${ladyName}? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }));
      
      await clientDashboardService.deleteReview(reviewId);
      
      // Remove from local state
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      
      alert('Review deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting review:', err);
      alert(err.message || 'Failed to delete review');
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleEditReview = async (reviewId: string) => {
    if (!user?.id || actionLoading[reviewId]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }));
      
      // Find the review to edit
      const reviewToEdit = reviews.find(review => review.id === reviewId);
      if (!reviewToEdit) {
        throw new Error('Review not found.');
      }
      
      // Initialize edit form with current review data
      setEditFormData({
        rating: reviewToEdit.rating,
        positives: reviewToEdit.positives.length > 0 ? [...reviewToEdit.positives] : [''],
        negatives: reviewToEdit.negatives.length > 0 ? [...reviewToEdit.negatives] : [''],
      });
      
      // Set editing mode
      setEditingReviewId(reviewId);
    } catch (err: any) {
      console.error('Error preparing review for editing:', err);
      alert(err.message || 'Failed to prepare review for editing');
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleEditFormChange = (field: 'rating' | 'positives' | 'negatives', value: any, index?: number) => {
    if (field === 'rating') {
      setEditFormData(prev => ({ ...prev, rating: value }));
    } else if (field === 'positives' || field === 'negatives') {
      if (index === undefined) return;
      setEditFormData(prev => ({
        ...prev,
        [field]: prev[field].map((item, i) => i === index ? value : item)
      }));
    }
  };

  const addEditPoint = (type: 'positives' | 'negatives') => {
    setEditFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removeEditPoint = (type: 'positives' | 'negatives', index: number) => {
    setEditFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditFormData({ rating: 0, positives: [''], negatives: [''] });
  };

  const saveEdit = async (reviewId: string) => {
    if (!user?.id || actionLoading[reviewId]) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [reviewId]: true }));
      
      // Validate form data
      if (editFormData.rating < 1 || editFormData.rating > 10) {
        throw new Error('Rating must be between 1 and 10.');
      }
      
      const validPositives = editFormData.positives.filter(p => p.trim());
      const validNegatives = editFormData.negatives.filter(n => n.trim());
      
      if (validPositives.length === 0) {
        throw new Error('Please provide at least one positive point.');
      }
      
      // Call advancedReviewService to edit the review
      await advancedReviewService.editReview(reviewId, {
        rating: editFormData.rating,
        positives: validPositives,
        negatives: validNegatives,
      });
      
      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { 
              ...review, 
              rating: editFormData.rating,
              positives: validPositives,
              negatives: validNegatives,
            }
          : review
      ));
      
      // Exit edit mode
      setEditingReviewId(null);
      setEditFormData({ rating: 0, positives: [''], negatives: [''] });
      
      alert('Review updated successfully.');
    } catch (err: any) {
      console.error('Error updating review:', err);
      alert(err.message || 'Failed to update review');
    } finally {
      setActionLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">View and manage your reviews</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading your reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">View and manage your reviews</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Unable to load reviews</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={loadData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/client"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
        <p className="text-gray-600 mt-1">
          View and manage your reviews
        </p>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => {
          const hasBookedThisLady = userBookingHistory.includes(review.lady.id);
          const userInteraction = userInteractions[review.id];
          const isActionLoading = actionLoading[review.id];
          
          return (
            <div key={review.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-pink-300">
              {/* Review Header */}
              <div className="p-6 border-b border-pink-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={review.lady.imageUrl}
                      alt={review.lady.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <Link
                        to={`/ladies/pro/${review.lady.id}`}
                        className="font-medium text-gray-900 hover:text-pink-500"
                      >
                        {review.lady.name}
                      </Link>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-bold ${
                    review.rating >= 7 ? 'bg-green-100 text-green-700' :
                    review.rating >= 5 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.rating.toFixed(1)}
                  </div>
                </div>

                {/* Positive Points */}
                {review.positives.map((positive, index) => (
                  <div key={`positive-${index}`} className="flex items-start space-x-2 mb-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-500 text-xl">+</span>
                    </div>
                    <p className="text-gray-700">{positive}</p>
                  </div>
                ))}

                {/* Negative Points */}
                {review.negatives.map((negative, index) => (
                  <div key={`negative-${index}`} className="flex items-start space-x-2 mb-2">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="text-red-500 text-xl">-</span>
                    </div>
                    <p className="text-gray-700">{negative}</p>
                  </div>
                ))}

                {/* Experienced Community Interaction */}
                <div className="mt-4">
                  {hasBookedThisLady ? (
                    // User has booked this lady - show interactive buttons
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => handleLikeReview(review.id)}
                        disabled={isActionLoading}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                          userInteraction === 'like' 
                            ? 'bg-green-100 text-green-700' 
                            : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
                        } ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4" />
                        )}
                        <span>{review.likes}</span>
                      </button>
                      <button 
                        onClick={() => handleDislikeReview(review.id)}
                        disabled={isActionLoading}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                          userInteraction === 'dislike' 
                            ? 'bg-red-100 text-red-700' 
                            : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                        } ${isActionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isActionLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ThumbsDown className="h-4 w-4" />
                        )}
                        <span>{review.dislikes}</span>
                      </button>
                    </div>
                  ) : (
                    // User hasn't booked this lady - show read-only stats with explanation
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1 text-gray-400">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{review.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-gray-400">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{review.dislikes}</span>
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        💡 Book {review.lady.name} to interact with her reviews
                      </div>
                    </div>
                  )}
                  
                  {/* Community Stats */}
                  {(review.likes + review.dislikes) > 0 && (
                    <div className="text-xs text-gray-500 mt-2">
                      Rated by {review.likes + review.dislikes} verified clients who have booked {review.lady.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Lady's Reply */}
              {review.reply && (
                <div className="p-6 bg-pink-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span className="font-medium text-gray-900">Reply from {review.lady.name}</span>
                  </div>
                  <p className="text-gray-700">{review.reply.message}</p>
                </div>
              )}

              {/* Review Actions */}
              <div className="p-6 bg-gray-50">
                {editingReviewId === review.id ? (
                  // Edit Form
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Edit Your Review</h3>
                    
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editFormData.rating}
                        onChange={(e) => handleEditFormChange('rating', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                    
                    {/* Positive Points */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What did you like?
                      </label>
                      {editFormData.positives.map((point, index) => (
                        <div key={`edit-positive-${index}`} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleEditFormChange('positives', e.target.value, index)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Something you liked about this lady"
                          />
                          {editFormData.positives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditPoint('positives', index)}
                              className="px-3 py-2 text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addEditPoint('positives')}
                        className="text-sm text-pink-500 hover:text-pink-700"
                      >
                        + Add another positive point
                      </button>
                    </div>
                    
                    {/* Negative Points */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What could be improved?
                      </label>
                      {editFormData.negatives.map((point, index) => (
                        <div key={`edit-negative-${index}`} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => handleEditFormChange('negatives', e.target.value, index)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder="Something that could be improved"
                          />
                          {editFormData.negatives.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditPoint('negatives', index)}
                              className="px-3 py-2 text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addEditPoint('negatives')}
                        className="text-sm text-pink-500 hover:text-pink-700"
                      >
                        + Add another negative point
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 text-gray-700 hover:text-gray-900"
                        disabled={isActionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(review.id)}
                        disabled={isActionLoading}
                        className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isActionLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Action Buttons
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => handleEditReview(review.id)}
                      disabled={isActionLoading}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Edit Review</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(review.id, review.lady.name)}
                      disabled={isActionLoading}
                      className={`flex items-center gap-2 text-red-500 hover:text-red-600 ${
                        isActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isActionLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                      <span>Delete Review</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {reviews.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't written any reviews yet. Share your experiences with others!
            </p>
            <Link
              to="/ladies"
              className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Browse Ladies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}