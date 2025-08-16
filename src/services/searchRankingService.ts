import { supabase } from '../lib/supabase';

export interface RankedProfile {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  loves: number;
  membershipTier: 'ULTRA' | 'PRO-PLUS' | 'PRO' | 'FREE';
  distance?: number; // Distance from search center in km
  isVerified: boolean;
  isClub: boolean;
  description: string;
  price?: string;
  searchPriority: number;
  hasFanPosts?: boolean; // Indicator for clients to guess tier
}

export interface SearchFilters {
  location?: string;
  maxDistance?: number;
  priceRange?: { min: number; max: number };
  rating?: number;
  hasFanPosts?: boolean; // Indirect tier filtering
  isVerified?: boolean;
}

/**
 * Calculate search priority based on membership tier and distance
 */
function calculateSearchPriority(
  membershipTier: string,
  distance: number = 0
): number {
  // Base tier priorities (higher = better ranking)
  const tierPriorities = {
    'ULTRA': 1000,
    'PRO-PLUS': 800,
    'PRO': 600,
    'FREE': 400
  };

  const basePriority = tierPriorities[membershipTier as keyof typeof tierPriorities] || 400;
  
  // Distance penalty: reduce priority based on distance
  // Within 5km: no penalty
  // 5-20km: -50 points
  // 20-50km: -100 points
  // 50+km: -150 points
  let distancePenalty = 0;
  if (distance > 5) distancePenalty = 50;
  if (distance > 20) distancePenalty = 100;
  if (distance > 50) distancePenalty = 150;

  return basePriority - distancePenalty;
}

/**
 * Calculate distance between two coordinates (simplified)
 */
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get location coordinates (simplified - in production use geocoding API)
 */
async function getLocationCoordinates(location: string): Promise<{ lat: number; lon: number } | null> {
  // Simplified location mapping - in production, use Google Maps Geocoding API
  const locationMap: Record<string, { lat: number; lon: number }> = {
    'London': { lat: 51.5074, lon: -0.1278 },
    'Amsterdam': { lat: 52.3676, lon: 4.9041 },
    'Rotterdam': { lat: 51.9244, lon: 4.4777 },
    'The Hague': { lat: 52.0705, lon: 4.3007 },
    'Utrecht': { lat: 52.0907, lon: 5.1214 },
    'Eindhoven': { lat: 51.4416, lon: 5.4697 },
    'Groningen': { lat: 53.2194, lon: 6.5665 },
    'Maastricht': { lat: 50.8514, lon: 5.6909 }
  };

  return locationMap[location] || null;
}

/**
 * Search and rank profiles based on membership tier and location
 */
export async function searchRankedProfiles(
  searchLocation: string = 'London',
  filters: SearchFilters = {},
  limit: number = 50
): Promise<RankedProfile[]> {
  try {
    // Get search center coordinates
    const searchCoords = await getLocationCoordinates(searchLocation);
    
    // Build query
  let query = supabase
      .from('profiles')
      .select(`
        id,
        name,
        location,
        image_url,
        rating,
        loves,
        membership_tier,
        is_verified,
        is_club,
        description,
        price,
        latitude,
        longitude,
        user_id,
        users!inner(is_blocked)
      `)
      .eq('role', 'lady')
      .eq('is_active', true)
      .eq('users.is_blocked', false);

    // Apply filters
    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }
    
    if (filters.isVerified !== undefined) {
      query = query.eq('is_verified', filters.isVerified);
    }

    const { data: profiles, error } = await query.limit(limit * 2); // Get more to allow for filtering

    if (error) throw error;
    if (!profiles) return [];

    // Check for fan posts if filter is applied
    let profilesWithFanPosts: string[] = [];
    if (filters.hasFanPosts) {
      const { data: fanPostProfiles } = await supabase
        .from('fan_posts')
        .select('lady_id')
        .eq('is_active', true);
      
      profilesWithFanPosts = fanPostProfiles?.map(fp => fp.lady_id) || [];
    }

    // Process and rank profiles
    const rankedProfiles: RankedProfile[] = profiles
      .map(profile => {
        let distance = 0;
        
        // Calculate distance if coordinates are available
        if (searchCoords && profile.latitude && profile.longitude) {
          distance = calculateDistance(
            searchCoords.lat, searchCoords.lon,
            profile.latitude, profile.longitude
          );
        }

        // Check if profile has fan posts
        const hasFanPosts = profilesWithFanPosts.includes(profile.user_id);

        return {
          id: profile.id,
          name: profile.name,
          location: profile.location,
          imageUrl: profile.image_url,
          rating: profile.rating || 0,
          loves: profile.loves || 0,
          membershipTier: profile.membership_tier || 'FREE',
          distance,
          isVerified: profile.is_verified || false,
          isClub: profile.is_club || false,
          description: profile.description || '',
          price: profile.price,
          searchPriority: calculateSearchPriority(profile.membership_tier || 'FREE', distance),
          hasFanPosts
        } as RankedProfile;
      })
      .filter(profile => {
        // Apply distance filter
        if (filters.maxDistance && profile.distance && profile.distance > filters.maxDistance) {
          return false;
        }
        
        // Apply fan posts filter (indirect tier filtering)
        if (filters.hasFanPosts && !profile.hasFanPosts) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Primary sort: Search priority (tier + distance)
        if (b.searchPriority !== a.searchPriority) {
          return b.searchPriority - a.searchPriority;
        }
        
        // Secondary sort: Rating
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        
        // Tertiary sort: Loves
        return b.loves - a.loves;
      })
      .slice(0, limit);

    return rankedProfiles;
    
  } catch (error) {
    console.error('Error searching ranked profiles:', error);
    return [];
  }
}

/**
 * Get geographic expansion results
 * Searches in expanding circles: 5km → 20km → 50km → 100km
 */
export async function getGeographicExpansionResults(
  searchLocation: string,
  existingResults: RankedProfile[],
  targetCount: number = 50
): Promise<RankedProfile[]> {
  if (existingResults.length >= targetCount) {
    return existingResults;
  }

  const expansionRanges = [
    { min: 5, max: 20, label: '5-20km from London' },
    { min: 20, max: 50, label: '20-50km from London' },
    { min: 50, max: 100, label: '50-100km from London' }
  ];

  let allResults = [...existingResults];
  const existingIds = new Set(existingResults.map(r => r.id));

  for (const range of expansionRanges) {
    if (allResults.length >= targetCount) break;

    const expandedResults = await searchRankedProfiles(
      searchLocation,
      { maxDistance: range.max },
      targetCount - allResults.length
    );

    // Add new results that aren't already included and are within the range
    const newResults = expandedResults.filter(result => 
      !existingIds.has(result.id) && 
      result.distance && 
      result.distance >= range.min && 
      result.distance <= range.max
    );

    allResults.push(...newResults);
    newResults.forEach(result => existingIds.add(result.id));
  }

  return allResults.slice(0, targetCount);
}

/**
 * Search with automatic geographic expansion
 */
export async function searchWithExpansion(
  searchLocation: string = 'London',
  filters: SearchFilters = {},
  targetCount: number = 50
): Promise<{
  results: RankedProfile[];
  sections: {
    ultra: RankedProfile[];
    pro: RankedProfile[];
    free: RankedProfile[];
    expanded: RankedProfile[];
  };
}> {
  // Get initial results within the primary location
  const primaryResults = await searchRankedProfiles(searchLocation, filters, targetCount);
  
  // Get expanded results if needed
  const allResults = await getGeographicExpansionResults(
    searchLocation, 
    primaryResults, 
    targetCount
  );

  // Categorize results for analytics/debugging
  const sections = {
    ultra: allResults.filter(r => r.membershipTier === 'ULTRA'),
    pro: allResults.filter(r => ['PRO', 'PRO-PLUS'].includes(r.membershipTier)),
    free: allResults.filter(r => r.membershipTier === 'FREE' && (!r.distance || r.distance <= 5)),
    expanded: allResults.filter(r => r.distance && r.distance > 5)
  };

  return {
    results: allResults,
    sections
  };
} 