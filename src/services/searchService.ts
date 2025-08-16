import { supabase } from '../lib/supabase';

export interface SearchFilters {
  query?: string;
  location?: string;
  category?: 'ladies' | 'clubs' | 'all';
  radiusKm?: number;
  requireVerified?: boolean;
  requireFanPosts?: boolean;
  visitTypes?: string[]; // e.g., ['Private visit','Escort']
  services?: string[];
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
  user_id?: string;
  membership_tier?: string;
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
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number;
}

export const searchProfiles = async (filters: SearchFilters): Promise<SearchResult[]> => {
  try {
    console.log('Searching with filters:', filters);

    let query = supabase
      .from('profiles')
      .select(`
        *,
        users:users!profiles_user_id_fkey ( id, verification_status, membership_tier, role, is_blocked ),
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

    // Exclude blocked accounts globally
    query = query.eq('users.is_blocked', false);

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
      user_id: profile.user_id,
      name: profile.name,
      location: profile.location,
      description: profile.description,
      price: profile.price,
      image_url: profile.image_url,
      rating: profile.rating || 0,
      loves: profile.loves || 0,
      is_club: profile.is_club || false,
      created_at: profile.created_at,
      membership_tier: profile.users?.membership_tier,
      latitude: profile.latitude || null,
      longitude: profile.longitude || null,
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

    // Verified filter (users.verification_status = 'verified')
    if (filters.requireVerified) {
      filteredResults = filteredResults.filter(r => (data || []).find(p => p.id === r.id)?.users?.verification_status === 'verified');
    }

    // Fan posts filter (require at least one active fan post)
    if (filters.requireFanPosts) {
      const userIds = Array.from(new Set(filteredResults.map(r => r.user_id).filter(Boolean))) as string[];
      if (userIds.length > 0) {
        const { data: fanIds } = await supabase
          .from('fan_posts')
          .select('lady_id')
          .in('lady_id', userIds)
          .eq('is_active', true);
        const setIds = new Set((fanIds || []).map((f: any) => f.lady_id));
        filteredResults = filteredResults.filter(r => r.user_id && setIds.has(r.user_id));
      } else {
        filteredResults = [];
      }
    }

    // Services / visit type filter via services.name ilike any keyword
    const serviceKeywords: string[] = [];
    if (filters.visitTypes && filters.visitTypes.length) {
      serviceKeywords.push(...filters.visitTypes.map(v => v.toLowerCase()));
    }
    if (filters.services && filters.services.length) {
      serviceKeywords.push(...filters.services.map(s => s.toLowerCase()));
    }
    if (serviceKeywords.length) {
      const profileIds = filteredResults.map(r => r.id);
      if (profileIds.length > 0) {
        const orExpr = serviceKeywords.map(kw => `name.ilike.%${kw}%`).join(',');
        const { data: svc } = await supabase
          .from('services')
          .select('profile_id, name')
          .in('profile_id', profileIds)
          .or(orExpr);
        const svcSet = new Set((svc || []).map((s: any) => s.profile_id));
        filteredResults = filteredResults.filter(r => svcSet.has(r.id));
      } else {
        filteredResults = [];
      }
    }

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

    // Radius filter (distance km) based on simple city center fallback
    if (filters.radiusKm && filters.location) {
      const center = await (async () => {
        // lightweight city-to-coords mapping
        const cityMap: Record<string, { lat: number; lon: number }> = {
          London: { lat: 51.5074, lon: -0.1278 },
          Amsterdam: { lat: 52.3676, lon: 4.9041 },
          Rotterdam: { lat: 51.9244, lon: 4.4777 },
          'The Hague': { lat: 52.0705, lon: 4.3007 },
          Utrecht: { lat: 52.0907, lon: 5.1214 },
          Eindhoven: { lat: 51.4416, lon: 5.4697 },
          Groningen: { lat: 53.2194, lon: 6.5665 },
          Maastricht: { lat: 50.8514, lon: 5.6909 },
        };
        const key = String(filters.location);
        return cityMap[key] || null;
      })();
      if (center) {
        const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; const dLat = (lat2 - lat1) * Math.PI/180; const dLon = (lon2 - lon1) * Math.PI/180;
          const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R*c;
        };
        filteredResults = filteredResults.map(r => {
          const d = (r.latitude && r.longitude) ? calcDist(center.lat, center.lon, r.latitude, r.longitude) : undefined;
          return { ...r, distance_km: d } as SearchResult;
        }).filter(r => r.distance_km === undefined || r.distance_km <= filters.radiusKm!);
      }
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