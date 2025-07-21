import { supabase } from '../lib/supabase';

export interface ReviewInteraction {
  id: string;
  review_id: string;
  user_id: string;
  interaction_type: 'like' | 'dislike';
  created_at: string;
}

export interface ReviewEditHistory {
  id: string;
  review_id: string;
  edited_by: string;
  old_content: any;
  new_content: any;
  edit_reason: string;
  created_at: string;
}

export interface ReviewModerationLog {
  id: string;
  review_id: string;
  moderator_id: string;
  action: 'approve' | 'reject' | 'flag' | 'edit';
  notes: string;
  created_at: string;
}

export interface AdvancedReview {
  id: string;
  authorName: string;
  serviceName: string;
  serviceLink: string;
  date: string;
  rating: number;
  positives: string[];
  negatives: string[];
  likes: number;
  dislikes: number;
  isEdited: boolean;
  editedAt?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  userInteraction?: 'like' | 'dislike' | null;
  reply?: {
    from: string;
    message: string;
  };
}

export const advancedReviewService = {
  /**
   * Like or dislike a review
   */
  async toggleReviewInteraction(reviewId: string, interactionType: 'like' | 'dislike'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to interact with reviews.');
      }

      // Check if user already has an interaction with this review
      const { data: existingInteraction } = await supabase
        .from('review_interactions')
        .select('id, interaction_type')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existingInteraction) {
        if (existingInteraction.interaction_type === interactionType) {
          // Remove the interaction (toggle off)
          const { error } = await supabase
            .from('review_interactions')
            .delete()
            .eq('review_id', reviewId)
            .eq('user_id', user.id)
            .eq('interaction_type', interactionType);

          if (error) {
            console.error('Error removing review interaction:', error);
            throw new Error('Failed to remove interaction.');
          }

          return false; // Interaction removed
        } else {
          // Change interaction type (like to dislike or vice versa)
          const { error } = await supabase
            .from('review_interactions')
            .update({ interaction_type: interactionType })
            .eq('review_id', reviewId)
            .eq('user_id', user.id);

          if (error) {
            console.error('Error updating review interaction:', error);
            throw new Error('Failed to update interaction.');
          }

          return true; // Interaction updated
        }
      } else {
        // Create new interaction
        const { error } = await supabase
          .from('review_interactions')
          .insert({
            review_id: reviewId,
            user_id: user.id,
            interaction_type: interactionType
          });

        if (error) {
          console.error('Error creating review interaction:', error);
          throw new Error('Failed to create interaction.');
        }

        return true; // Interaction created
      }
    } catch (error) {
      console.error('Error toggling review interaction:', error);
      throw error;
    }
  },

  /**
   * Get user's interaction with a review
   */
  async getUserReviewInteraction(reviewId: string): Promise<'like' | 'dislike' | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data: interaction } = await supabase
        .from('review_interactions')
        .select('interaction_type')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      return interaction?.interaction_type || null;
    } catch (error) {
      console.error('Error getting user review interaction:', error);
      return null;
    }
  },

  /**
   * Edit a review (only within 24 hours of creation)
   */
  async editReview(reviewId: string, updates: {
    rating?: number;
    positives?: string[];
    negatives?: string[];
    content?: string;
  }): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to edit reviews.');
      }

      // Check if user can edit this review
      const { data: review } = await supabase
        .from('reviews')
        .select('author_id, created_at, moderation_status')
        .eq('id', reviewId)
        .single();

      if (!review) {
        throw new Error('Review not found.');
      }

      if (review.author_id !== user.id) {
        throw new Error('You can only edit your own reviews.');
      }

      if (review.moderation_status !== 'approved') {
        throw new Error('You can only edit approved reviews.');
      }

      // Check if review is within 24 hours
      const reviewDate = new Date(review.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        throw new Error('Reviews can only be edited within 24 hours of creation.');
      }

      // Update the review
      const { error } = await supabase
        .from('reviews')
        .update({
          rating: updates.rating,
          positives: updates.positives,
          negatives: updates.negatives,
          content: updates.content,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        .eq('author_id', user.id);

      if (error) {
        console.error('Error updating review:', error);
        throw new Error('Failed to update review. Please try again.');
      }

      return true;
    } catch (error) {
      console.error('Error editing review:', error);
      throw error;
    }
  },

  /**
   * Get edit history for a review
   */
  async getReviewEditHistory(reviewId: string): Promise<ReviewEditHistory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to view edit history.');
      }

      // Check if user is admin or review author
      const { data: review } = await supabase
        .from('reviews')
        .select('author_id')
        .eq('id', reviewId)
        .single();

      if (!review) {
        throw new Error('Review not found.');
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const isAdmin = userData?.role === 'admin';
      const isAuthor = review.author_id === user.id;

      if (!isAdmin && !isAuthor) {
        throw new Error('You do not have permission to view this edit history.');
      }

      const { data: editHistory, error } = await supabase
        .from('review_edit_history')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching edit history:', error);
        throw new Error('Failed to load edit history.');
      }

      return editHistory || [];
    } catch (error) {
      console.error('Error getting review edit history:', error);
      throw error;
    }
  },

  /**
   * Moderate a review (admin only)
   */
  async moderateReview(reviewId: string, action: 'approve' | 'reject' | 'flag', notes?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to moderate reviews.');
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        throw new Error('Only administrators can moderate reviews.');
      }

      // Update review moderation status
      const { error: reviewError } = await supabase
        .from('reviews')
        .update({
          moderation_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
          moderation_notes: notes
        })
        .eq('id', reviewId);

      if (reviewError) {
        console.error('Error updating review moderation status:', reviewError);
        throw new Error('Failed to update review moderation status.');
      }

      // Log the moderation action
      const { error: logError } = await supabase
        .from('review_moderation_log')
        .insert({
          review_id: reviewId,
          moderator_id: user.id,
          action,
          notes
        });

      if (logError) {
        console.error('Error logging moderation action:', logError);
        // Don't throw error here as the main action succeeded
      }

      return true;
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  },

  /**
   * Get moderation log for a review
   */
  async getReviewModerationLog(reviewId: string): Promise<ReviewModerationLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to view moderation logs.');
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        throw new Error('Only administrators can view moderation logs.');
      }

      const { data: moderationLog, error } = await supabase
        .from('review_moderation_log')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching moderation log:', error);
        throw new Error('Failed to load moderation log.');
      }

      return moderationLog || [];
    } catch (error) {
      console.error('Error getting review moderation log:', error);
      throw error;
    }
  },

  /**
   * Get reviews pending moderation
   */
  async getPendingModerationReviews(): Promise<AdvancedReview[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to view moderation queue.');
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'admin') {
        throw new Error('Only administrators can view moderation queue.');
      }

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          positives,
          negatives,
          likes,
          dislikes,
          is_edited,
          edited_at,
          moderation_status,
          moderation_notes,
          created_at,
          author_id,
          profile_id,
          profiles!reviews_profile_id_fkey (
            name
          ),
          users!reviews_author_id_fkey (
            username
          )
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending reviews:', error);
        throw new Error('Failed to load pending reviews.');
      }

      return (reviews || []).map(review => ({
        id: review.id,
        authorName: (review.users as any)?.username || 'Anonymous',
        serviceName: (review.profiles as any)?.name || 'Unknown',
        serviceLink: `/ladies/${(review.profiles as any)?.name?.toLowerCase()}`,
        date: this.formatRelativeDate(review.created_at),
        rating: review.rating,
        positives: review.positives || [],
        negatives: review.negatives || [],
        likes: review.likes,
        dislikes: review.dislikes,
        isEdited: review.is_edited,
        editedAt: review.edited_at,
        moderationStatus: review.moderation_status
      }));
    } catch (error) {
      console.error('Error getting pending moderation reviews:', error);
      throw error;
    }
  },

  /**
   * Format relative date
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
}; 