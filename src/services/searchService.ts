import { supabase } from '../lib/supabase';

export interface SearchFilters {
  query?: string;
  location?: string;
  category?: 'ladies' | 'clubs' | 'all';
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  cupSize?: string;
  bodySize?: string;
  descent?: string;
  languages?: string[];
  ethnicity?: string;
  bodyType?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availability?: string;
  sortBy?: 'relevance' | 'rating' | 'price_low' | 'price_high' | 'newest' | 'loves';
}

export interface SearchResult {
  id: string;
  name: string;
  location: string;
  description: string | null;
  price: string | null;
  image_url: string | null;
  rating: number;
  loves: number;
  is_club: boolean;
  created_at: string;
  // Profile details
  age?: number;
  sex?: string;
  height?: number;
  weight?: number;
  cup_size?: string;
  body_size?: string;
  descent?: string;
  languages?: string[];
  ethnicity?: string;
  body_type?: string;
}

export const searchProfiles = async (filters: SearchFilters): Promise<SearchResult[]> => {
  try {
    console.log('Searching with filters:', filters);

    let query = supabase
      .from('profiles')
      .select(`
        *,
        profile_details (
          age,
          sex,
          height,
          weight,
          cup_size,
          body_size,
          descent,
          languages,
          ethnicity,
          body_type
        )
      `);

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      query = query.eq('is_club', filters.category === 'clubs');
    }
    // If category is 'all' or not specified, don't filter by is_club (search both ladies and clubs)

    // Apply text search
    if (filters.query && filters.query.trim()) {
      const searchTerm = filters.query.trim();
      query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
    }

    // Apply location filter
    if (filters.location && filters.location.trim()) {
      query = query.ilike('location', `%${filters.location.trim()}%`);
    }

    // Apply rating filter
    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }

    // Apply price range filter
    if (filters.priceMin !== undefined) {
      // Extract numeric value from price string (e.g., "$100/hr" -> 100)
      // This is a simplified approach - you might want to store price as numeric
      query = query.or(`price.ilike.%${filters.priceMin}%`);
    }

    if (filters.priceMax !== undefined) {
      query = query.or(`price.ilike.%${filters.priceMax}%`);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'loves':
          query = query.order('loves', { ascending: false });
          break;
        default:
          // Default to relevance (rating + loves)
          query = query.order('rating', { ascending: false }).order('loves', { ascending: false });
      }
    } else {
      // Default sorting
      query = query.order('rating', { ascending: false }).order('loves', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Search error:', error);
      throw error;
    }

    console.log('Search results:', data);

    // Transform the data to match SearchResult interface
    const results: SearchResult[] = data?.map(profile => ({
      id: profile.id,
      name: profile.name,
      location: profile.location,
      description: profile.description,
      price: profile.price,
      image_url: profile.image_url,
      rating: profile.rating || 0,
      loves: profile.loves || 0,
      is_club: profile.is_club || false,
      created_at: profile.created_at,
      // Profile details
      age: profile.profile_details?.age,
      sex: profile.profile_details?.sex,
      height: profile.profile_details?.height,
      weight: profile.profile_details?.weight,
      cup_size: profile.profile_details?.cup_size,
      body_size: profile.profile_details?.body_size,
      descent: profile.profile_details?.descent,
      languages: profile.profile_details?.languages,
      ethnicity: profile.profile_details?.ethnicity,
      body_type: profile.profile_details?.body_type,
    })) || [];

    // Apply additional filters that can't be done at database level
    let filteredResults = results;

    // Age filter
    if (filters.ageMin !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.age === null || result.age === undefined || result.age >= filters.ageMin!
      );
    }
    if (filters.ageMax !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.age === null || result.age === undefined || result.age <= filters.ageMax!
      );
    }

    // Height filter
    if (filters.heightMin !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.height === null || result.height === undefined || result.height >= filters.heightMin!
      );
    }
    if (filters.heightMax !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.height === null || result.height === undefined || result.height <= filters.heightMax!
      );
    }

    // Weight filter
    if (filters.weightMin !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.weight === null || result.weight === undefined || result.weight >= filters.weightMin!
      );
    }
    if (filters.weightMax !== undefined) {
      filteredResults = filteredResults.filter(result => 
        result.weight === null || result.weight === undefined || result.weight <= filters.weightMax!
      );
    }

    // Cup size filter
    if (filters.cupSize) {
      filteredResults = filteredResults.filter(result => 
        result.cup_size === filters.cupSize
      );
    }

    // Body size filter
    if (filters.bodySize) {
      filteredResults = filteredResults.filter(result => 
        result.body_size === filters.bodySize
      );
    }

    // Descent filter
    if (filters.descent) {
      filteredResults = filteredResults.filter(result => 
        result.descent === filters.descent
      );
    }

    // Languages filter
    if (filters.languages && filters.languages.length > 0) {
      filteredResults = filteredResults.filter(result => 
        result.languages && filters.languages!.some(lang => 
          result.languages!.includes(lang)
        )
      );
    }

    // Ethnicity filter
    if (filters.ethnicity) {
      filteredResults = filteredResults.filter(result => 
        result.ethnicity === filters.ethnicity
      );
    }

    // Body type filter
    if (filters.bodyType) {
      filteredResults = filteredResults.filter(result => 
        result.body_type === filters.bodyType
      );
    }

    return filteredResults;

  } catch (error) {
    console.error('Search service error:', error);
    throw error;
  }
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  try {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('name, location')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Search suggestions error:', error);
      return [];
    }

    const suggestions: string[] = [];
    data?.forEach(profile => {
      if (profile.name && !suggestions.includes(profile.name)) {
        suggestions.push(profile.name);
      }
      if (profile.location && !suggestions.includes(profile.location)) {
        suggestions.push(profile.location);
      }
    });

    return suggestions.slice(0, 10);
  } catch (error) {
    console.error('Search suggestions error:', error);
    return [];
  }
};

export const getFilterOptions = async () => {
  try {
    // Get unique locations
    const { data: locations } = await supabase
      .from('profiles')
      .select('location')
      .not('location', 'is', null);

    // Get unique cup sizes
    const { data: cupSizes } = await supabase
      .from('profile_details')
      .select('cup_size')
      .not('cup_size', 'is', null);

    // Get unique body sizes
    const { data: bodySizes } = await supabase
      .from('profile_details')
      .select('body_size')
      .not('body_size', 'is', null);

    // Get unique descents
    const { data: descents } = await supabase
      .from('profile_details')
      .select('descent')
      .not('descent', 'is', null);

    // Get unique ethnicities
    const { data: ethnicities } = await supabase
      .from('profile_details')
      .select('ethnicity')
      .not('ethnicity', 'is', null);

    // Get unique body types
    const { data: bodyTypes } = await supabase
      .from('profile_details')
      .select('body_type')
      .not('body_type', 'is', null);

    return {
      locations: [...new Set(locations?.map(l => l.location) || [])],
      cupSizes: [...new Set(cupSizes?.map(c => c.cup_size) || [])],
      bodySizes: [...new Set(bodySizes?.map(b => b.body_size) || [])],
      descents: [...new Set(descents?.map(d => d.descent) || [])],
      ethnicities: [...new Set(ethnicities?.map(e => e.ethnicity) || [])],
      bodyTypes: [...new Set(bodyTypes?.map(b => b.body_type) || [])],
    };
  } catch (error) {
    console.error('Get filter options error:', error);
    return {
      locations: [],
      cupSizes: [],
      bodySizes: [],
      descents: [],
      ethnicities: [],
      bodyTypes: [],
    };
  }
}; 