import { supabase } from '../lib/supabase';
import { notificationsService } from './notificationsService';

export interface ClientStats {
  totalBookings: number;
  completedBookings: number;
  reviewsWritten: number;
  giftsGiven: number;
  fanPostsUnlocked: number;
  favoriteProviders: number;
  creditsRemaining: number;
}

export interface ClientActivity {
  id: string;
  type: 'review' | 'gift' | 'booking' | 'fanPost' | 'favorite';
  targetName: string;
  targetProfileId: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

export interface Booking {
  id: string;
  lady: {
    name: string;
    imageUrl: string;
  };
  date: string;
  time: string;
  duration: number;
  service: string;
  price: string;
  location: 'incall' | 'outcall';
  address?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  lady: {
    id: string;
    name: string;
    imageUrl: string;
  };
  date: string;
  rating: number;
  positives: string[];
  negatives: string[];
  reply?: {
    message: string;
  };
  likes: number;
  dislikes: number;
}

export interface Gift {
  id: string;
  recipient: {
    name: string;
    imageUrl: string;
  };
  type: {
    name: string;
    emoji: string;
    credits: number;
  };
  message?: string;
  reply?: string;
  date: string;
  time: string;
}

export interface FanPost {
  id: string;
  lady: {
    name: string;
    imageUrl: string;
  };
  title: string;
  content: string;
  imageUrl?: string;
  creditsSpent: number;
  unlockedAt: string;
  likes: number;
  comments: number;
}

export interface Profile {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  loves: number;
  isVerified: boolean;
  isClub: boolean;
  description: string;
  price?: string;
  membershipTier: string;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'gift' | 'fanpost' | 'refund';
  description: string;
  referenceId?: string;
  createdAt: string;
}

export const clientDashboardService = {
  /**
   * Get available gift types from DB
   */
  async getGiftTypes(): Promise<Array<{ id: string; name: string; emoji: string; credits: number }>> {
    const { data, error } = await supabase
      .from('gift_types')
      .select('slug, name, credits_cost, icon, is_active, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching gift types:', error);
      return [];
    }

    return (
      data?.map((row: any) => ({
        id: row.slug as string,
        name: row.name as string,
        emoji: (row.icon as string) || '🎁',
        credits: Number(row.credits_cost) || 0,
      })) || []
    );
  },
  /**
   * Get client dashboard statistics
   */
  async getClientStats(clientId: string): Promise<ClientStats> {
    const { data, error } = await supabase
      .rpc('get_client_stats', { client_id_param: clientId });

    if (error) {
      console.error('Error fetching client stats:', error);
      throw error;
    }

    // The function returns an array, so we take the first (and only) result
    const stats = data?.[0];

    return {
      totalBookings: Number(stats?.total_bookings) || 0,
      completedBookings: Number(stats?.completed_bookings) || 0,
      reviewsWritten: Number(stats?.reviews_written) || 0,
      giftsGiven: Number(stats?.gifts_given) || 0,
      fanPostsUnlocked: Number(stats?.fanposts_unlocked) || 0,
      favoriteProviders: Number(stats?.favorite_providers) || 0,
      creditsRemaining: Number(stats?.credits_remaining) || 0,
    };
  },

  /**
   * Get recent client activities
   */
  async getRecentActivity(clientId: string, limit = 10): Promise<ClientActivity[]> {
    const { data, error } = await supabase
      .from('client_activities')
      .select(`
        id,
        activity_type,
        target_name,
        target_profile_id,
        created_at,
        metadata
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching client activities:', error);
      throw error;
    }

    return data?.map(activity => ({
      id: activity.id,
      type: activity.activity_type as ClientActivity['type'],
      targetName: activity.target_name,
      targetProfileId: activity.target_profile_id,
      description: this.getActivityDescription(activity.activity_type, activity.target_name),
      createdAt: activity.created_at,
      metadata: activity.metadata,
    })) || [];
  },

  /**
   * Get upcoming bookings
   */
  async getUpcomingBookings(clientId: string, limit = 5): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        date,
        time,
        duration,
        location_type,
        address,
        total_cost,
        status,
        created_at,
        profiles!bookings_profile_id_fkey (
          id,
          name,
          image_url
        )
      `)
      .eq('client_id', clientId)
      .in('status', ['pending', 'confirmed'])
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }

    return data?.map((booking: any) => ({
      id: booking.id,
      lady: {
        name: booking.profiles?.name || 'Unknown',
        imageUrl: booking.profiles?.image_url || '',
      },
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      service: `${booking.duration / 60} hour${booking.duration > 60 ? 's' : ''}`,
      price: `€${booking.total_cost}`,
      location: booking.location_type as 'incall' | 'outcall',
      address: booking.address,
      status: booking.status as Booking['status'],
      createdAt: booking.created_at,
    })) || [];
  },

  /**
   * Get all client bookings
   */
  async getClientBookings(clientId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        date,
        time,
        duration,
        location_type,
        address,
        total_cost,
        status,
        created_at,
        profiles!bookings_profile_id_fkey (
          id,
          name,
          image_url
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client bookings:', error);
      throw error;
    }

    return data?.map((booking: any) => ({
      id: booking.id,
      lady: {
        name: booking.profiles?.name || 'Unknown',
        imageUrl: booking.profiles?.image_url || '',
      },
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      service: `${booking.duration / 60} hour${booking.duration > 60 ? 's' : ''}`,
      price: `€${booking.total_cost}`,
      location: booking.location_type as 'incall' | 'outcall',
      address: booking.address,
      status: booking.status as Booking['status'],
      createdAt: booking.created_at,
    })) || [];
  },

  /**
   * Get client reviews
   */
  async getClientReviews(clientId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        positives,
        negatives,
        likes,
        dislikes,
        created_at,
        profiles!reviews_profile_id_fkey (
          id,
          name,
          image_url
        ),
        review_replies (
          message
        )
      `)
      .eq('author_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client reviews:', error);
      throw error;
    }

    return data?.map((review: any) => ({
      id: review.id,
      lady: {
        id: review.profiles?.id || '',
        name: review.profiles?.name || 'Unknown',
        imageUrl: review.profiles?.image_url || '',
      },
      date: new Date(review.created_at).toLocaleDateString(),
      rating: Number(review.rating),
      positives: review.positives || [],
      negatives: review.negatives || [],
      reply: review.review_replies?.[0] ? {
        message: review.review_replies[0].message
      } : undefined,
      likes: review.likes || 0,
      dislikes: review.dislikes || 0,
    })) || [];
  },

  /**
   * Submit a new review
   */
  async submitReview(reviewData: {
    ladyId: string;
    rating: number;
    positives: string[];
    negatives: string[];
    isAnonymous?: boolean;
  }): Promise<Review> {
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to submit a review.');
      }

      // 2. Validate lady exists by ID
      const { data: ladyProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_id, name, image_url')
        .eq('id', reviewData.ladyId)
        .single();

      if (profileError || !ladyProfile) {
        throw new Error('Lady profile not found. Please try again.');
      }

      // 3. Check if user has completed a booking with this lady (experienced community rule)
      const { data: completedBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', user.id)
        .eq('profile_id', ladyProfile.id)
        .eq('status', 'completed')
        .limit(1);

      if (!completedBookings || completedBookings.length === 0) {
        throw new Error('You can only review ladies you have booked with. This helps maintain our experienced community standards.');
      }

      // 4. Check if user already reviewed this lady
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('author_id', user.id)
        .eq('profile_id', ladyProfile.id)
        .single();

      if (existingReview) {
        throw new Error('You have already reviewed this lady. Use the edit function to update your review.');
      }

      // 5. Submit review
      const { data: review, error: insertError } = await supabase
        .from('reviews')
        .insert({
          author_id: user.id,
          profile_id: ladyProfile.id,
          rating: reviewData.rating,
          positives: reviewData.positives.filter(p => p.trim()),
          negatives: reviewData.negatives.filter(n => n.trim()),
        })
        .select(`
          id,
          rating,
          positives,
          negatives,
          likes,
          dislikes,
          created_at
        `)
        .single();

      if (insertError) {
        console.error('Error inserting review:', insertError);
        throw new Error('Failed to submit review. Please try again.');
      }

      // 6. Record activity in client_activities table
      try {
        await supabase
          .from('client_activities')
          .insert({
            client_id: user.id,
            activity_type: 'review',
            target_id: review.id,
            target_name: ladyProfile.name,
            target_profile_id: ladyProfile.id,
            metadata: {
              rating: reviewData.rating,
              positives_count: reviewData.positives.filter(p => p.trim()).length,
              negatives_count: reviewData.negatives.filter(n => n.trim()).length,
              is_anonymous: reviewData.isAnonymous || false
            }
          });
      } catch (activityError) {
        console.warn('Failed to record activity:', activityError);
        // Don't fail the whole operation for activity logging
      }

      // 7. Create a notification for the lady
      try {
        await notificationsService.create({
          profileId: ladyProfile.id,
          type: 'review',
          actorUserId: user.id,
          message: 'New review received',
          data: { review_id: review.id, rating: reviewData.rating }
        });
      } catch (notifyErr) {
        console.warn('Failed to create review notification:', notifyErr);
      }

      // 8. Return formatted review
      return {
        id: review.id,
        lady: {
          id: ladyProfile.id,
          name: ladyProfile.name,
          imageUrl: ladyProfile.image_url || '',
        },
        date: new Date(review.created_at).toLocaleDateString(),
        rating: Number(review.rating),
        positives: review.positives || [],
        negatives: review.negatives || [],
        reply: undefined,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Submit a review for a club profile
   */
  async submitClubReview(reviewData: {
    clubId: string;
    rating: number;
    positives: string[];
    negatives: string[];
    isAnonymous?: boolean;
  }): Promise<Review> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to submit a review.');

    const { data: club, error: clubErr } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('id', reviewData.clubId)
      .single();
    if (clubErr || !club) throw new Error('Club not found.');

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('author_id', user.id)
      .eq('profile_id', club.id)
      .maybeSingle();
    if (existing) throw new Error('You have already reviewed this club.');

    const { data: inserted, error: insErr } = await supabase
      .from('reviews')
      .insert({
        author_id: user.id,
        profile_id: club.id,
        rating: reviewData.rating,
        positives: reviewData.positives,
        negatives: reviewData.negatives,
        status: 'approved'
      })
      .select()
      .single();
    if (insErr) throw insErr;

    return {
      id: inserted.id,
      lady: { id: club.id, name: club.name, imageUrl: '' },
      date: new Date(inserted.created_at).toLocaleDateString(),
      rating: inserted.rating,
      positives: inserted.positives || [],
      negatives: inserted.negatives || [],
      likes: inserted.likes || 0,
      dislikes: inserted.dislikes || 0,
    } as any;
  },

  /**
   * Update an existing review
   */
  async updateReview(reviewId: string, updates: {
    rating?: number;
    positives?: string[];
    negatives?: string[];
  }): Promise<Review> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to update a review.');
      }

      const { data: review, error } = await supabase
        .from('reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('author_id', user.id) // Ensure user owns this review
        .select(`
          id,
          rating,
          positives,
          negatives,
          likes,
          dislikes,
          created_at,
          profiles!reviews_profile_id_fkey (
            id,
            name,
            image_url
          )
        `)
        .single();

      if (error) {
        console.error('Error updating review:', error);
        throw new Error('Failed to update review. Please try again.');
      }

      return {
        id: review.id,
        lady: {
          id: review.profiles?.[0]?.id || '',
          name: review.profiles?.[0]?.name || 'Unknown',
          imageUrl: review.profiles?.[0]?.image_url || '',
        },
        date: new Date(review.created_at).toLocaleDateString(),
        rating: Number(review.rating),
        positives: review.positives || [],
        negatives: review.negatives || [],
        reply: undefined,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
      };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to delete a review.');
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('author_id', user.id); // Ensure user owns this review

      if (error) {
        console.error('Error deleting review:', error);
        throw new Error('Failed to delete review. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  /**
   * Get user's booking history (profile IDs they've booked)
   */
  async getUserBookingHistory(userId: string): Promise<string[]> {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('profile_id')
        .eq('client_id', userId)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching booking history:', error);
        return [];
      }

      // Return unique profile IDs
      const profileIds = bookings?.map(b => b.profile_id) || [];
      return [...new Set(profileIds)];
    } catch (error) {
      console.error('Error fetching booking history:', error);
      return [];
    }
  },

  /**
   * Check if user can interact with a review (has booked that lady)
   */
  async canUserInteractWithReview(reviewId: string, userId: string): Promise<boolean> {
    try {
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .select('profile_id')
        .eq('id', reviewId)
        .single();

      if (reviewError || !review) {
        return false;
      }

      // Check if user has completed booking with this lady
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', userId)
        .eq('profile_id', review.profile_id)
        .eq('status', 'completed')
        .limit(1);

      if (bookingError) {
        console.error('Error checking booking history:', bookingError);
        return false;
      }

      return booking && booking.length > 0;
    } catch (error) {
      console.error('Error checking review interaction permission:', error);
      return false;
    }
  },

  /**
   * Like a review (only if user has booked that lady)
   */
  async likeReview(reviewId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to like a review.');
      }

      // Validate user can interact with this review
      const canInteract = await this.canUserInteractWithReview(reviewId, user.id);
      if (!canInteract) {
        throw new Error('You can only interact with reviews for ladies you have booked.');
      }

      // Remove existing interaction if any
      await supabase
        .from('review_interactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      // Add like interaction
      const { error } = await supabase
        .from('review_interactions')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          interaction_type: 'like'
        });

      if (error) {
        console.error('Error liking review:', error);
        throw new Error('Failed to like review. Please try again.');
      }

      // Update review likes count
      await this.updateReviewInteractionCounts(reviewId);
    } catch (error) {
      console.error('Error liking review:', error);
      throw error;
    }
  },

  /**
   * Dislike a review (only if user has booked that lady)
   */
  async dislikeReview(reviewId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to dislike a review.');
      }

      // Validate user can interact with this review
      const canInteract = await this.canUserInteractWithReview(reviewId, user.id);
      if (!canInteract) {
        throw new Error('You can only interact with reviews for ladies you have booked.');
      }

      // Remove existing interaction if any
      await supabase
        .from('review_interactions')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', user.id);

      // Add dislike interaction
      const { error } = await supabase
        .from('review_interactions')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          interaction_type: 'dislike'
        });

      if (error) {
        console.error('Error disliking review:', error);
        throw new Error('Failed to dislike review. Please try again.');
      }

      // Update review dislikes count
      await this.updateReviewInteractionCounts(reviewId);
    } catch (error) {
      console.error('Error disliking review:', error);
      throw error;
    }
  },

  /**
   * Get user's interaction with a specific review
   */
  async getUserReviewInteraction(reviewId: string, userId: string): Promise<'like' | 'dislike' | null> {
    try {
      const { data: interaction, error } = await supabase
        .from('review_interactions')
        .select('interaction_type')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (error || !interaction) {
        return null;
      }

      return interaction.interaction_type as 'like' | 'dislike';
    } catch (error) {
      console.error('Error fetching user review interaction:', error);
      return null;
    }
  },

  /**
   * Update review interaction counts
   */
  async updateReviewInteractionCounts(reviewId: string): Promise<void> {
    try {
      // Count likes and dislikes
      const { data: interactions, error } = await supabase
        .from('review_interactions')
        .select('interaction_type')
        .eq('review_id', reviewId);

      if (error) {
        console.error('Error fetching interactions for count update:', error);
        return;
      }

      const likes = interactions?.filter(i => i.interaction_type === 'like').length || 0;
      const dislikes = interactions?.filter(i => i.interaction_type === 'dislike').length || 0;

      // Update review with new counts
      const { error: updateError } = await supabase
        .from('reviews')
        .update({ likes, dislikes })
        .eq('id', reviewId);

      if (updateError) {
        console.error('Error updating review interaction counts:', updateError);
      }
    } catch (error) {
      console.error('Error updating review interaction counts:', error);
    }
  },

  /**
   * Get lady profile by name for review submission
   */
  async getLadyProfileByName(name: string): Promise<{ id: string; name: string; image_url?: string } | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, image_url')
        .ilike('name', name)
        .single();

      if (error || !profile) {
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching lady profile by name:', error);
      return null;
    }
  },

  /**
   * Get client gifts sent
   */
  async getClientGifts(clientId: string): Promise<Gift[]> {
    // Use a simpler approach similar to fan posts to avoid complex nested relationships
    const { data, error } = await supabase
      .from('gifts')
      .select(`
        id,
        gift_type,
        credits_cost,
        message,
        created_at,
        recipient_id
      `)
      .eq('sender_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client gifts:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get recipient profile information separately
    const recipientIds = [...new Set(data.map((gift: any) => gift.recipient_id))];
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name, image_url')
      .in('user_id', recipientIds);

    if (profileError) {
      console.error('Error fetching recipient profiles:', profileError);
      // Continue without profile data
    }

    // Create a lookup map for profiles
    const profileMap = new Map();
    profileData?.forEach(profile => {
      profileMap.set(profile.user_id, profile);
    });

    return data.map((gift: any) => {
      const profile = profileMap.get(gift.recipient_id);
      
      return {
        id: gift.id,
        recipient: {
          name: profile?.name || 'Unknown',
          imageUrl: profile?.image_url || '',
        },
        type: {
          name: gift.gift_type,
          emoji: this.getGiftEmoji(gift.gift_type),
          credits: gift.credits_cost,
        },
        message: gift.message,
        date: new Date(gift.created_at).toLocaleDateString(),
        time: new Date(gift.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    });
  },

  /**
   * Get client favorite providers
   */
  async getFavoriteProviders(clientId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        profiles (
          id,
          name,
          location,
          image_url,
          rating,
          loves,
          description,
          price,
          is_club,
          users!profiles_user_id_fkey (
            is_verified,
            membership_tier
          )
        )
      `)
      .eq('user_id', clientId);

    if (error) {
      console.error('Error fetching favorite providers:', error);
      throw error;
    }

    return data?.map((favorite: any) => {
      const profile = favorite.profiles;
      const user = profile?.users?.[0] || profile?.users;
      
      return {
        id: profile?.id || '',
        name: profile?.name || '',
        location: profile?.location || '',
        imageUrl: profile?.image_url || '',
        rating: Number(profile?.rating) || 0,
        loves: profile?.loves || 0,
        isVerified: user?.is_verified || false,
        isClub: profile?.is_club || false,
        description: profile?.description || '',
        price: profile?.price,
        membershipTier: user?.membership_tier || 'FREE',
      };
    }) || [];
  },

  /**
   * Add provider to favorites
   */
  async addToFavorites(clientId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: clientId,
        profile_id: profileId,
      });

    if (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  /**
   * Remove provider from favorites
   */
  async removeFromFavorites(clientId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', clientId)
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  /**
   * Get unlocked fan posts
   */
  async getUnlockedFanPosts(clientId: string): Promise<FanPost[]> {
    // Use a more direct approach to avoid complex nested relationships
    const { data, error } = await supabase
      .from('fan_post_unlocks')
      .select(`
        credits_spent,
        created_at,
        fan_post_id,
        fan_posts!inner (
          id,
          title,
          content,
          image_url,
          likes,
          comments,
          lady_id
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unlocked fan posts:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Get lady profile information separately
    const ladyIds = [...new Set(data.map((unlock: any) => unlock.fan_posts.lady_id))];
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, name, image_url')
      .in('user_id', ladyIds);

    if (profileError) {
      console.error('Error fetching lady profiles:', profileError);
      // Continue without profile data
    }

    // Create a lookup map for profiles
    const profileMap = new Map();
    profileData?.forEach(profile => {
      profileMap.set(profile.user_id, profile);
    });

    return data.map((unlock: any) => {
      const fanPost = unlock.fan_posts;
      const profile = profileMap.get(fanPost.lady_id);
      
      return {
        id: fanPost.id,
        lady: {
          name: profile?.name || 'Unknown',
          imageUrl: profile?.image_url || '',
        },
        title: fanPost.title || '',
        content: fanPost.content || '',
        imageUrl: fanPost.image_url,
        creditsSpent: unlock.credits_spent,
        unlockedAt: unlock.created_at,
        likes: fanPost.likes || 0,
        comments: fanPost.comments || 0,
      };
    });
  },

  /**
   * Unlock a fan post
   */
  async unlockFanPost(clientId: string, fanPostId: string): Promise<void> {
    // First get the fan post to check credits cost
    const { data: fanPost, error: fanPostError } = await supabase
      .from('fan_posts')
      .select('credits_cost')
      .eq('id', fanPostId)
      .single();

    if (fanPostError) {
      console.error('Error fetching fan post:', fanPostError);
      throw fanPostError;
    }

    // Check if user has enough credits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', clientId)
      .single();

    if (userError) {
      console.error('Error fetching user credits:', userError);
      throw userError;
    }

    if (user.credits < fanPost.credits_cost) {
      throw new Error('Insufficient credits');
    }

    // Process the unlock transaction
    const { error: transactionError } = await supabase
      .rpc('process_client_credit_transaction', {
        user_id_param: clientId,
        amount_param: -fanPost.credits_cost,
        type_param: 'fanpost',
        description_param: 'Unlocked fan post',
        reference_id_param: fanPostId,
      });

    if (transactionError) {
      console.error('Error processing credit transaction:', transactionError);
      throw transactionError;
    }

    // Record the unlock
    const { error: unlockError } = await supabase
      .from('fan_post_unlocks')
      .insert({
        client_id: clientId,
        fan_post_id: fanPostId,
        credits_spent: fanPost.credits_cost,
      });

    if (unlockError) {
      console.error('Error recording fan post unlock:', unlockError);
      throw unlockError;
    }
  },

  /**
   * Get credit transaction history
   */
  async getCreditTransactions(clientId: string): Promise<CreditTransaction[]> {
    const { data, error } = await supabase
      .from('client_credit_transactions')
      .select('*')
      .eq('user_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credit transactions:', error);
      throw error;
    }

    return data?.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.transaction_type as CreditTransaction['type'],
      description: transaction.description || '',
      referenceId: transaction.reference_id,
      createdAt: transaction.created_at,
    })) || [];
  },

  /**
   * Complete a credit purchase (pre-Stripe hookup):
   * - Atomically add credits via RPC (as a 'purchase')
   * - Record a general transaction row for admin financials
   */
  async completeCreditPurchase(
    userId: string,
    packages: Array<{ id: string; quantity: number }>,
    totalCredits: number,
    totalCost: number
  ): Promise<{ success: boolean; transactionId?: string }> {
    try {
      // 1) Add credits to the user's balance using the existing RPC
      const { error: rpcError } = await supabase.rpc('process_client_credit_transaction', {
        user_id_param: userId,
        amount_param: totalCredits,
        type_param: 'purchase',
        description_param: `Credit purchase: €${totalCost.toFixed(2)} for ${totalCredits} credits`,
        reference_id_param: null
      });
      if (rpcError) throw rpcError;

      // 2) Record a general transaction for admin financial dashboard (best-effort)
      try {
        const { data: tx, error: txErr } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            transaction_type: 'credit_purchase',
            amount: totalCost,
            credits_amount: totalCredits,
            status: 'completed',
            payment_provider: 'pending_stripe',
            metadata: { packages }
          })
          .select('*')
          .single();
        if (txErr) throw txErr;
        return { success: true, transactionId: tx?.id };
      } catch (e) {
        // If transactions table not available or RLS blocks, still succeed purchase
        return { success: true };
      }
    } catch (error) {
      console.error('Error completing credit purchase:', error);
      return { success: false };
    }
  },

  /**
   * Get IDs of fan posts unlocked by this client
   */
  async getUnlockedFanPostIds(clientId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('fan_post_unlocks')
        .select('fan_post_id')
        .eq('client_id', clientId);
      if (error) return [];
      return (data || []).map((r: any) => r.fan_post_id);
    } catch (e) {
      return [];
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  },

  /**
   * Helper function to get activity description
   */
  getActivityDescription(activityType: string, targetName: string): string {
    switch (activityType) {
      case 'review':
        return `Reviewed ${targetName}`;
      case 'gift':
        return `Sent a gift to ${targetName}`;
      case 'booking':
        return `Booked ${targetName}`;
      case 'fanPost':
        return `Unlocked ${targetName}'s fan post`;
      case 'favorite':
        return `Added ${targetName} to favorites`;
      default:
        return `Activity with ${targetName}`;
    }
  },

  /**
   * Helper function to get gift emoji
   */
  getGiftEmoji(giftType: string): string {
    const emojiMap: { [key: string]: string } = {
      'Diamond': '💎',
      'Rose': '🌹',
      'Crown': '👑',
      'Heart': '❤️',
      'Star': '⭐',
      'Kiss': '💋',
      'Flower': '🌸',
      'Gift': '🎁',
    };
    return emojiMap[giftType] || '🎁';
  },

  /**
   * Send a gift to a recipient
   */
  async sendGift(
    senderId: string, 
    recipientName: string, 
    giftTypes: Array<{ type: string; credits: number }>, 
    message?: string
  ): Promise<void> {
    try {
      // 1. Get recipient profile information
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .ilike('name', recipientName)
        .single();

      if (recipientError || !recipientData) {
        throw new Error('Recipient not found');
      }

      // 2. Get current user credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', senderId)
        .single();

      if (userError || !userData) {
        throw new Error('Unable to verify your account');
      }

      // 3. Calculate total cost
      const totalCost = giftTypes.reduce((sum, gift) => sum + gift.credits, 0);

      // 4. Validate sufficient credits
      if (userData.credits < totalCost) {
        throw new Error(`Insufficient credits. You need ${totalCost} credits but only have ${userData.credits}.`);
      }

      // 5. Process each gift
      for (const gift of giftTypes) {
        // Deduct credits via RPC function
        const { error: transactionError } = await supabase
          .rpc('process_client_credit_transaction', {
            user_id_param: senderId,
            amount_param: -gift.credits,
            type_param: 'gift',
            description_param: `Sent ${gift.type} gift to ${recipientData.name}`,
            reference_id_param: null
          });

        if (transactionError) {
          console.error('Credit transaction error:', transactionError);
          throw new Error('Unable to process credit transaction');
        }

        // Create gift record
        const { error: giftError } = await supabase
          .from('gifts')
          .insert({
            sender_id: senderId,
            recipient_id: recipientData.user_id,
            gift_type: gift.type,
            credits_cost: gift.credits,
            message: message || null
          });

        if (giftError) {
          console.error('Gift creation error:', giftError);
          throw new Error('Unable to create gift record');
        }
      }

      console.log(`Successfully sent ${giftTypes.length} gift(s) to ${recipientData.name}`);
    } catch (error) {
      console.error('Error sending gift:', error);
      throw error;
    }
  },

  /**
   * Get user's current credit balance
   */
  async getUserCredits(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        throw error;
      }

      return data?.credits || 0;
    } catch (error) {
      console.error('Error getting user credits:', error);
      return 0;
    }
  },

  /**
   * Get recipient profile by name
   */
  async getRecipientProfile(name: string): Promise<{ user_id: string; name: string; image_url?: string } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, name, image_url')
        .ilike('name', name)
        .single();

      if (error || !data) {
        console.error('Recipient not found:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting recipient profile:', error);
      return null;
    }
  },

  /**
   * Get recent gifts received by a recipient (for display on send gift page)
   */
  async getRecentGiftsReceived(recipientName: string, limit: number = 20): Promise<Array<{
    emoji: string;
    sender: string;
    time: string;
  }>> {
    try {
      // Get recipient profile
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('name', recipientName)
        .single();

      if (recipientError || !recipientData) {
        return [];
      }

      // Get recent gifts with sender information
      const { data: giftsData, error: giftsError } = await supabase
        .from('gifts')
        .select(`
          gift_type,
          credits_cost,
          created_at,
          sender_id
        `)
        .eq('recipient_id', recipientData.user_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (giftsError || !giftsData || giftsData.length === 0) {
        return [];
      }

      // Get sender profile information
      const senderIds = [...new Set(giftsData.map((gift: any) => gift.sender_id).filter(Boolean))];
      if (senderIds.length === 0) return [];

      const { data: senderData, error: senderError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', senderIds);

      if (senderError) {
        console.error('Error fetching sender profiles:', senderError);
      }

      // Create sender lookup map
      const senderMap = new Map();
      senderData?.forEach(sender => {
        senderMap.set(sender.user_id, sender.name);
      });

      // Format the gifts for display
      return giftsData.map((gift: any) => ({
        emoji: this.getGiftEmoji(gift.gift_type),
        sender: senderMap.get(gift.sender_id) || 'Anonymous',
        time: this.formatRelativeTime(gift.created_at)
      }));
    } catch (error) {
      console.error('Error getting recent gifts received:', error);
      return [];
    }
  },

  /**
   * Helper function to format relative time
   */
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  },

  /**
   * Get available credit packages
   */
  async getCreditPackages(): Promise<Array<{
    id: string;
    name: string;
    credits: number;
    price: number;
    popular?: boolean;
    bonus?: number;
  }>> {
    // For now, return static packages as defined in the plan
    // In future, this could be moved to database for dynamic pricing
    return [
      {
        id: 'lite',
        name: 'Lite',
        credits: 25,
        price: 5
      },
      {
        id: 'lite-plus',
        name: 'Lite+',
        credits: 50,
        price: 10
      },
      {
        id: 'popular',
        name: 'Popular',
        credits: 125,
        price: 25,
        popular: true,
        bonus: 10
      },
      {
        id: 'power',
        name: 'Power',
        credits: 250,
        price: 50,
        bonus: 25
      },
      {
        id: 'pro',
        name: 'Pro',
        credits: 500,
        price: 100,
        bonus: 50
      },
      {
        id: 'ultra',
        name: 'Ultra',
        credits: 1250,
        price: 250,
        bonus: 100
      }
    ];
  },

  /**
   * Validate if user has sufficient credits for a transaction
   */
  async validateCreditBalance(userId: string, requiredCredits: number): Promise<{
    hasEnough: boolean;
    currentBalance: number;
    shortfall: number;
  }> {
    try {
      const currentBalance = await this.getUserCredits(userId);
      const hasEnough = currentBalance >= requiredCredits;
      const shortfall = hasEnough ? 0 : requiredCredits - currentBalance;

      return {
        hasEnough,
        currentBalance,
        shortfall
      };
    } catch (error) {
      console.error('Error validating credit balance:', error);
      return {
        hasEnough: false,
        currentBalance: 0,
        shortfall: requiredCredits
      };
    }
  },

  /**
   * Get recent credit purchases (mock for now, will integrate with payment system later)
   */
  async getRecentCreditPurchases(userId: string, limit: number = 10): Promise<Array<{
    id: string;
    packageName: string;
    credits: number;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
  }>> {
    // This will be implemented when we add payment processing
    // For now, return empty array or mock data based on credit transactions
    try {
      const transactions = await this.getCreditTransactions(userId);
      
      // Filter for purchase transactions
      const purchases = transactions
        .filter(t => t.type === 'purchase')
        .slice(0, limit)
        .map(transaction => ({
          id: transaction.id,
          packageName: this.inferPackageNameFromAmount(transaction.amount),
          credits: transaction.amount,
          amount: Math.round(transaction.amount * 0.20), // Assuming €0.20 per credit
          status: 'completed' as const,
          createdAt: transaction.createdAt
        }));

      return purchases;
    } catch (error) {
      console.error('Error fetching recent credit purchases:', error);
      return [];
    }
  },

  /**
   * Helper function to infer package name from credit amount
   */
  inferPackageNameFromAmount(credits: number): string {
    if (credits <= 25) return 'Lite';
    if (credits <= 50) return 'Lite+';
    if (credits <= 135) return 'Popular'; // 125 + 10 bonus
    if (credits <= 275) return 'Power';   // 250 + 25 bonus
    if (credits <= 550) return 'Pro';     // 500 + 50 bonus
    if (credits <= 1350) return 'Ultra';  // 1250 + 100 bonus
    return 'Custom';
  },

  /**
   * Simulate credit purchase (placeholder until payment integration)
   */
  async simulateCreditPurchase(
    userId: string, 
    packages: Array<{ id: string; quantity: number }>,
    totalCredits: number,
    totalCost: number
  ): Promise<{
    success: boolean;
    message: string;
    transactionId?: string;
  }> {
    try {
      // This is a placeholder function for testing the UI
      // In production, this will be replaced with actual payment processing
      
      console.log('Simulating credit purchase:', {
        userId,
        packages,
        totalCredits,
        totalCost
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, return success without actually processing payment
      return {
        success: false, // Set to false until real payment integration
        message: 'Payment integration coming soon! This is a preview of the purchase flow.',
        transactionId: `sim_${Date.now()}`
      };
    } catch (error) {
      console.error('Error simulating credit purchase:', error);
      return {
        success: false,
        message: 'Failed to process purchase simulation'
      };
    }
  },
}; 