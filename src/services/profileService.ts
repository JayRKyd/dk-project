import { supabase } from '../lib/supabase';

export interface ProfileData {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  loves: number;
  description: string;
  price: string;
  location: string;
  is_verified: boolean;
  member_since: string;
  last_online: string;
  views: number;
  images: string[];
  services: ServiceData[];
  rates: RateData[];
  details: ProfileDetails;
  reviews: ReviewData[];
  opening_hours: OpeningHours;
}

export interface ServiceData {
  id: string;
  service_name: string;
  is_available: boolean;
}

export interface RateData {
  duration: string;
  price: number;
}

export interface ProfileDetails {
  age: number;
  height: number;
  weight: number;
  body_type: string;
  cup_size: string;
  ethnicity: string;
  languages: string[];
  sex: string;
  body_size: string;
  descent: string;
  category: string;
}

export interface ReviewData {
  id: string;
  rating: number;
  positives: string[];
  negatives: string[];
  likes: number;
  dislikes: number;
  created_at: string;
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export const profileService = {
  async getLadyByName(name: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          image_url,
          rating,
          loves,
          description,
          price,
          location,
          created_at,
          updated_at
        `)
        .eq('name', name)
        .eq('role', 'lady')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No profile found
        }
        throw error;
      }

      // Use the same logic as getProfileById
      return this.getProfileById(data.id);
    } catch (error) {
      console.error('Error fetching lady profile:', error);
      return null;
    }
  },

  async getProfileById(id: string): Promise<ProfileData | null> {
    try {
      // Fetch main profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          image_url,
          rating,
          loves,
          description,
          price,
          location,
          created_at,
          updated_at,
          user_id
        `)
        .eq('id', id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      // Fetch profile details
      const { data: details, error: detailsError } = await supabase
        .from('profile_details')
        .select('*')
        .eq('profile_id', id)
        .single();
      
      if (detailsError) {
        console.warn('Error fetching profile details:', detailsError);
      }

      // Fetch services
      const { data: services, error: servicesError } = await supabase
        .from('lady_services')
        .select('*')
        .eq('profile_id', id);
      
      if (servicesError) {
        console.warn('Error fetching services:', servicesError);
      }

      // Fetch rates
      const { data: rates, error: ratesError } = await supabase
        .from('lady_rates')
        .select('*')
        .eq('profile_id', id);
      
      if (ratesError) {
        console.warn('Error fetching rates:', ratesError);
      }

      // Fetch reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          positives,
          negatives,
          likes,
          dislikes,
          created_at
        `)
        .eq('profile_id', id)
        .order('created_at', { ascending: false });
      
      if (reviewsError) {
        console.warn('Error fetching reviews:', reviewsError);
      }

      // Fetch images from Supabase Storage gallery for this profile
      // Files live in bucket 'gallery-images' under folder <profile_id>/
      let images: string[] = [];
      try {
        const { data: files, error: listError } = await supabase
          .storage
          .from('gallery-images')
          .list(`${id}`, { limit: 50, sortBy: { column: 'name', order: 'asc' } });

        if (!listError && files && files.length > 0) {
          images = files.map((f) => {
            const { data } = supabase.storage
              .from('gallery-images')
              .getPublicUrl(`${id}/${f.name}`);
            return data.publicUrl;
          });
        } else if (profile.image_url) {
          // Fallback: if no gallery files yet, use the profile image if present
          images = [profile.image_url];
        }
      } catch (galleryErr) {
        console.warn('Error loading gallery images:', galleryErr);
        // As a fallback, surface the profile image if available
        if (profile.image_url) {
          images = [profile.image_url];
        }
      }

      // Construct opening hours (default values for now)
      const opening_hours: OpeningHours = {
        monday: 'Closed',
        tuesday: 'Closed',
        wednesday: '09:00 - 22:00',
        thursday: '09:00 - 22:00',
        friday: '09:00 - 24:00',
        saturday: '09:00 - 24:00',
        sunday: '09:00 - 24:00'
      };

      // Check if owner is blocked; if so, prevent viewing
      try {
        const { data: owner } = await supabase
          .from('users')
          .select('is_blocked')
          .eq('id', profile?.user_id)
          .single();
        if (owner?.is_blocked) {
          return null;
        }
      } catch (_) {}

      // Construct the complete profile data
      const profileData: ProfileData = {
        id: profile.id,
        name: profile.name,
        image_url: profile.image_url,
        rating: profile.rating,
        loves: profile.loves,
        description: profile.description,
        price: profile.price,
        location: profile.location,
        is_verified: false, // Default value, would need to join with users table
        member_since: profile.created_at,
        last_online: profile.updated_at,
        views: 0, // Default value, would need to count from profile_views table
        images: images,
        services: services || [],
        rates: rates || [],
        details: {
          age: details?.age || 0,
          height: details?.height || 0,
          weight: details?.weight || 0,
          body_type: details?.body_type || '',
          cup_size: details?.cup_size || '',
          ethnicity: details?.ethnicity || '',
          languages: details?.languages || [],
          sex: details?.sex || '',
          body_size: details?.body_size || '',
          descent: details?.descent || '',
          category: details?.category || ''
        },
        reviews: reviews || [],
        opening_hours
      };

      return profileData;
    } catch (error) {
      console.error('Error fetching profile data:', error);
      return null;
    }
  },

  async getProfileBySlug(slug: string): Promise<ProfileData | null> {
    try {
      // First try to find by ID (if slug is a UUID)
      if (slug.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return this.getProfileById(slug);
      }

      // If not a UUID, try to find by name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          image_url,
          rating,
          loves,
          description,
          price,
          location,
          created_at,
          updated_at
        `)
        .eq('name', slug)
        .single();

      if (profileError) {
        console.error('Error fetching profile by slug:', profileError);
        return null;
      }

      // Use the same logic as getProfileById
      return this.getProfileById(profile.id);
    } catch (error) {
      console.error('Error fetching profile by slug:', error);
      return null;
    }
  }
}; 