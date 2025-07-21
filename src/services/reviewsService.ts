import { supabase } from '../lib/supabase';
import { Review } from '../types';

export interface DatabaseReview {
  id: string;
  rating: number;
  positives: string[];
  negatives: string[];
  likes: number;
  dislikes: number;
  created_at: string;
  author_name: string;
  service_name: string;
  service_link: string;
  profile_id: string;
}

export interface DatabaseReviewReply {
  id: string;
  message: string;
  created_at: string;
  author_name: string;
}

export const reviewsService = {
  async getAllReviews(): Promise<Review[]> {
    try {
      // Fetch reviews with joins to get author names and service names
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          author_id,
          rating,
          positives,
          negatives,
          likes,
          dislikes,
          created_at,
          profile_id
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        return [];
      }

      if (!reviews || reviews.length === 0) {
        return [];
      }

      // Get unique profile IDs to fetch names
      const profileIds = [...new Set(reviews.map(r => r.profile_id))];

      // Fetch profile names (individual ladies)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', profileIds)
        .eq('is_club', false);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Fetch club names
      const { data: clubs, error: clubsError } = await supabase
        .from('clubs')
        .select('id, name')
        .in('id', profileIds);

      if (clubsError) {
        console.error('Error fetching clubs:', clubsError);
      }

      // Create lookup maps
      const profileMap = new Map();
      const clubMap = new Map();

      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile.name);
        });
      }

      if (clubs) {
        clubs.forEach(club => {
          clubMap.set(club.id, club.name);
        });
      }

      // Transform reviews to match UI interface
      const transformedReviews: Review[] = await Promise.all(
        reviews.map(async (review) => {
          // Determine if this is a club or individual lady
          const isClub = clubMap.has(review.profile_id);
          const serviceName = isClub 
            ? clubMap.get(review.profile_id) 
            : profileMap.get(review.profile_id);
          
          const serviceLink = isClub 
            ? `/clubs/${review.profile_id}`
            : `/ladies/${review.profile_id}`;

          // Format date
          const date = new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          });

                     // Get author name from users table
           const { data: author, error: authorError } = await supabase
             .from('users')
             .select('username')
             .eq('id', review.author_id)
             .single();

           const authorName = !authorError && author ? author.username : 'Anonymous';

          // Fetch reply if exists
          const { data: replies, error: repliesError } = await supabase
            .from('review_replies')
            .select(`
              id,
              message,
              created_at,
              author_id
            `)
            .eq('review_id', review.id)
            .order('created_at', { ascending: true })
            .limit(1);

          let reply = undefined;
          if (!repliesError && replies && replies.length > 0) {
            // Get the author name for the reply
            const { data: replyAuthor, error: authorError } = await supabase
              .from('users')
              .select('name')
              .eq('id', replies[0].author_id)
              .single();

            if (!authorError && replyAuthor) {
              reply = {
                from: replyAuthor.name,
                message: replies[0].message
              };
            }
          }

          return {
            id: review.id,
            authorName,
            serviceName: serviceName || 'Unknown Service',
            serviceLink,
            date,
            rating: review.rating,
            positives: review.positives || [],
            negatives: review.negatives || [],
            reply,
            likes: review.likes || 0,
            dislikes: review.dislikes || 0
          };
        })
      );

      return transformedReviews;
    } catch (error) {
      console.error('Error in getAllReviews:', error);
      return [];
    }
  },

  async getReviewsByProfileId(profileId: string): Promise<Review[]> {
    try {
      // Similar logic but filtered by profile_id
             const { data: reviews, error: reviewsError } = await supabase
         .from('reviews')
         .select(`
           id,
           author_id,
           rating,
           positives,
           negatives,
           likes,
           dislikes,
           created_at,
           profile_id
         `)
        .eq('profile_id', profileId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error fetching reviews by profile:', reviewsError);
        return [];
      }

      if (!reviews || reviews.length === 0) {
        return [];
      }

      // Get service name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, is_club')
        .eq('id', profileId)
        .single();

      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('name')
        .eq('id', profileId)
        .single();

      const serviceName = profile?.name || club?.name || 'Unknown Service';
      const serviceLink = profile?.is_club ? `/clubs/${profileId}` : `/ladies/${profileId}`;

      // Transform reviews
      const transformedReviews: Review[] = await Promise.all(
        reviews.map(async (review) => {
          const date = new Date(review.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          });

          const authorName = 'Anonymous';

          // Fetch reply
          const { data: replies, error: repliesError } = await supabase
            .from('review_replies')
            .select(`
              id,
              message,
              created_at,
              author_id
            `)
            .eq('review_id', review.id)
            .order('created_at', { ascending: true })
            .limit(1);

          let reply = undefined;
          if (!repliesError && replies && replies.length > 0) {
            const { data: replyAuthor, error: authorError } = await supabase
              .from('users')
              .select('name')
              .eq('id', replies[0].author_id)
              .single();

            if (!authorError && replyAuthor) {
              reply = {
                from: replyAuthor.name,
                message: replies[0].message
              };
            }
          }

          return {
            id: review.id,
            authorName,
            serviceName,
            serviceLink,
            date,
            rating: review.rating,
            positives: review.positives || [],
            negatives: review.negatives || [],
            reply,
            likes: review.likes || 0,
            dislikes: review.dislikes || 0
          };
        })
      );

      return transformedReviews;
    } catch (error) {
      console.error('Error in getReviewsByProfileId:', error);
      return [];
    }
  }
}; 