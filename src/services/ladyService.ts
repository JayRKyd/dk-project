import { supabase } from '../lib/supabase';

export interface LadyReview {
  id: string;
  author: {
    name: string;
    isAnonymous: boolean;
  };
  rating: number;
  positives: string[];
  negatives: string[];
  likes: number;
  dislikes: number;
  createdAt: string;
  reply?: {
    id: string;
    message: string;
    createdAt: string;
  };
}

export interface LadyReviewStats {
  totalReviews: number;
  averageRating: number;
  totalLikes: number;
  replyRate: number;
}

export const ladyService = {
  /**
   * Get all reviews received by a lady
   */
  async getReceivedReviews(ladyUserId: string): Promise<LadyReview[]> {
    try {
      // First get the lady's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', ladyUserId)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching lady profile:', profileError);
        return [];
      }

      // Get reviews for this profile with author information (from users)
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          positives,
          negatives,
          likes,
          dislikes,
          created_at,
          users!reviews_author_id_fkey (
            username
          ),
          review_replies (
            id,
            message,
            created_at
          )
        `)
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        throw new Error('Failed to load reviews');
      }

      return reviews?.map(review => {
        const authorUser = Array.isArray(review.users) ? review.users[0] : review.users;
        return {
          id: review.id,
          author: {
            name: authorUser?.username || 'Anonymous',
            isAnonymous: !authorUser?.username
          },
          rating: Number(review.rating),
          positives: review.positives || [],
          negatives: review.negatives || [],
          likes: review.likes || 0,
          dislikes: review.dislikes || 0,
          createdAt: review.created_at,
          reply: review.review_replies?.[0] ? {
            id: review.review_replies[0].id,
            message: review.review_replies[0].message,
            createdAt: review.review_replies[0].created_at
          } : undefined
        };
      }) || [];

    } catch (error) {
      console.error('Error in getReceivedReviews:', error);
      throw error;
    }
  },

  /**
   * Get review statistics for a lady
   */
  async getReviewStats(ladyUserId: string): Promise<LadyReviewStats> {
    try {
      // First get the lady's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', ladyUserId)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching lady profile:', profileError);
        return {
          totalReviews: 0,
          averageRating: 0,
          totalLikes: 0,
          replyRate: 0
        };
      }

      // Get review statistics
      const { data: stats, error: statsError } = await supabase
        .rpc('get_lady_review_stats', { profile_id_param: profile.id });

      if (statsError) {
        console.error('Error fetching review stats:', statsError);
        // Return default stats if RPC function doesn't exist
        return {
          totalReviews: 0,
          averageRating: 0,
          totalLikes: 0,
          replyRate: 0
        };
      }

      const result = stats?.[0] || {};
      return {
        totalReviews: Number(result.total_reviews) || 0,
        averageRating: Number(result.average_rating) || 0,
        totalLikes: Number(result.total_likes) || 0,
        replyRate: Number(result.reply_rate) || 0
      };

    } catch (error) {
      console.error('Error in getReviewStats:', error);
      // Return default stats on error
      return {
        totalReviews: 0,
        averageRating: 0,
        totalLikes: 0,
        replyRate: 0
      };
    }
  },

  /**
   * Reply to a review
   */
  async replyToReview(reviewId: string, message: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to reply to reviews.');
      }

      // Verify the review belongs to this lady
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Profile not found.');
      }

      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .select('id, profile_id')
        .eq('id', reviewId)
        .eq('profile_id', profile.id)
        .single();

      if (reviewError || !review) {
        throw new Error('Review not found or you do not have permission to reply to it.');
      }

      // Check if reply already exists
      const { data: existingReply } = await supabase
        .from('review_replies')
        .select('id')
        .eq('review_id', reviewId)
        .single();

      if (existingReply) {
        throw new Error('You have already replied to this review.');
      }

      // Insert the reply
      const { error: insertError } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          author_id: user.id,
          message: message.trim()
        });

      if (insertError) {
        console.error('Error inserting reply:', insertError);
        throw new Error('Failed to submit reply. Please try again.');
      }

    } catch (error) {
      console.error('Error in replyToReview:', error);
      throw error;
    }
  },

  /**
   * Update a reply to a review
   */
  async updateReply(replyId: string, message: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to update replies.');
      }

      const { error } = await supabase
        .from('review_replies')
        .update({
          message: message.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId)
        .eq('author_id', user.id); // Ensure user owns this reply

      if (error) {
        console.error('Error updating reply:', error);
        throw new Error('Failed to update reply. Please try again.');
      }

    } catch (error) {
      console.error('Error in updateReply:', error);
      throw error;
    }
  },

  /**
   * Delete a reply to a review
   */
  async deleteReply(replyId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to delete replies.');
      }

      const { error } = await supabase
        .from('review_replies')
        .delete()
        .eq('id', replyId)
        .eq('author_id', user.id); // Ensure user owns this reply

      if (error) {
        console.error('Error deleting reply:', error);
        throw new Error('Failed to delete reply. Please try again.');
      }

    } catch (error) {
      console.error('Error in deleteReply:', error);
      throw error;
    }
  },

  /**
   * Search ladies by name (ILIKE) and merge with user email/username.
   * Returns disambiguators for UI listing (avatar, location, rating, age, languages, lastActive).
   */
  async searchLadies(query: string, limit: number = 10): Promise<Array<{
    userId: string;
    profileId?: string;
    name?: string;
    email?: string;
    username?: string;
    imageUrl?: string;
    location?: string;
    rating?: number;
    age?: number;
    languages?: string[];
    lastActive?: string;
  }>> {
    try {
      const search = (query || '').trim();
      if (!search) return [];

      // 1) Search users (email/username) who are ladies
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, username, role')
        .or(`email.ilike.%${search}%,username.ilike.%${search}%`)
        .eq('role', 'lady')
        .limit(limit);
      if (usersError) throw usersError;

      // 2) Search profiles by name (case-insensitive, supports duplicates)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, name, image_url, location, rating, updated_at')
        .ilike('name', `%${search}%`)
        .limit(limit);
      if (profilesError) throw profilesError;

      const resultByUserId = new Map<string, any>();

      // Seed with users
      (usersData || []).forEach((u: any) => {
        resultByUserId.set(u.id, {
          userId: u.id,
          email: u.email,
          username: u.username
        });
      });

      // Attach profiles; also collect profileIds for details fetch
      const profileIds: string[] = [];
      (profilesData || []).forEach((p: any) => {
        profileIds.push(p.id);
        const existing = resultByUserId.get(p.user_id) || { userId: p.user_id };
        resultByUserId.set(p.user_id, {
          ...existing,
          profileId: p.id,
          name: p.name,
          imageUrl: p.image_url,
          location: p.location,
          rating: typeof p.rating === 'number' ? p.rating : undefined,
          lastActive: p.updated_at
        });
      });

      // 3) Fetch profile details for age/languages, if any profiles found
      if (profileIds.length > 0) {
        const { data: detailsData } = await supabase
          .from('profile_details')
          .select('profile_id, age, languages')
          .in('profile_id', profileIds);

        (detailsData || []).forEach((d: any) => {
          // Find owning user by profileId
          const entry = Array.from(resultByUserId.values()).find((r: any) => r.profileId === d.profile_id);
          if (entry) {
            entry.age = typeof d.age === 'number' ? d.age : undefined;
            entry.languages = Array.isArray(d.languages) ? d.languages : undefined;
          }
        });
      }

      return Array.from(resultByUserId.values());
    } catch (error) {
      console.error('Error in searchLadies:', error);
      return [];
    }
  }
}; 