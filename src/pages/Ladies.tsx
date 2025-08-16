import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import SearchBar from '../components/SearchBar';
import { Profile, PromoCard } from '../types';
import { supabase } from '../lib/supabase';

const getAdvertisementRoute = (profile: Profile) => {
  return profile.membershipTier === 'PRO'
    ? `/ladies/pro/${profile.id}`
    : `/ladies/${profile.id}`;
};

const clothingPromo: PromoCard = {
  id: 'clothing-promo',
  name: 'Sexy Lingerie Store',
  location: 'Amsterdam',
  imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  rating: 9.0,
  loves: 324,
  isVerified: true,
  isClub: false,
  description: 'Premium lingerie and adult clothing. Special offer: 20% off on all items!',
  membershipTier: 'PRO',
  isPromo: true
};

const photoPromo: PromoCard = {
  id: 'photo-promo',
  name: 'Photo Studio',
  location: 'Amsterdam',
  imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
  rating: 8.5,
  loves: 0,
  isVerified: false,
  isClub: false,
  description: '',
  membershipTier: 'PRO',
  isPromo: true,
  hideText: true
};

// Netherlands city proximity map for location fallback
const nearbyCities: Record<string, string[]> = {
  "Amsterdam": ["Haarlem", "Utrecht", "The Hague"],
  "Rotterdam": ["The Hague", "Utrecht", "Delft"],
  "Utrecht": ["Amsterdam", "Amersfoort", "Hilversum"],
  "The Hague": ["Rotterdam", "Amsterdam", "Delft"],
  "Eindhoven": ["Utrecht", "Tilburg", "Breda"],
  "Groningen": ["Assen", "Leeuwarden", "Zwolle"],
  "Maastricht": ["Eindhoven", "Venlo", "Roermond"]
};

// Simple function to get nearest Dutch city from coordinates
const getNearestDutchCity = (lat: number, lng: number): string => {
  // Simple distance calculation to major Dutch cities
  const cities = [
    { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
    { name: "Rotterdam", lat: 51.9244, lng: 4.4777 },
    { name: "Utrecht", lat: 52.0907, lng: 5.1214 },
    { name: "The Hague", lat: 52.0705, lng: 4.3007 },
    { name: "Eindhoven", lat: 51.4416, lng: 5.4697 },
    { name: "Groningen", lat: 53.2194, lng: 6.5665 },
    { name: "Maastricht", lat: 50.8514, lng: 5.6909 }
  ];

  let nearestCity = "Amsterdam"; // default
  let minDistance = Infinity;

  cities.forEach(city => {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city.name;
    }
  });

  return nearestCity;
};

export default function Ladies() {
  const [clientLocation, setClientLocation] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [showingNearby, setShowingNearby] = useState(false);
  const [verifiedLadies, setVerifiedLadies] = useState<Profile[]>([]);
  const [loadingLadies, setLoadingLadies] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [serviceMatchedProfileIds, setServiceMatchedProfileIds] = useState<Set<string>>(new Set());

  // Fetch verified ladies from Supabase on mount
  useEffect(() => {
    async function fetchVerifiedLadies() {
      setLoadingLadies(true);
      // Fetch users with role 'lady' and verification_status 'verified'
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, verification_status, membership_tier, is_blocked')
        .eq('role', 'lady')
        .eq('verification_status', 'verified')
        .eq('is_blocked', false);
      if (userError || !users || users.length === 0) {
        setVerifiedLadies([]);
        setLoadingLadies(false);
        return;
      }
      // Fetch profiles for these users
      const userIds = users.map(u => u.id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      if (profileError || !profiles) {
        setVerifiedLadies([]);
        setLoadingLadies(false);
        return;
      }
      // Map to Profile type for ProfileCard
      const mapped: Profile[] = profiles
        .filter((p: any) => !p.hide_listing_card)
        .map((p) => {
        // Find the user for membership tier
        const user = users.find(u => u.id === p.user_id);
        return {
          id: p.id,
          name: p.name,
          location: p.location || 'Location not specified',
          imageUrl: p.image_url || 'https://via.placeholder.com/400x400?text=No+Image',
          rating: p.rating || 0,
          loves: p.loves || 0,
          isVerified: true,
          isClub: p.is_club || false,
          description: p.description || '',
          membershipTier: (user?.membership_tier === 'PRO' || user?.membership_tier === 'PRO-PLUS' || user?.membership_tier === 'ULTRA') ? 'PRO' : 'FREE',
        };
      });
      setVerifiedLadies(mapped);
      setLoadingLadies(false);
    }
    fetchVerifiedLadies();
  }, []);

  // Detect viewer location (browser geolocation → nearest known city)
  useEffect(() => {
    const detect = async () => {
      try {
        if (!navigator.geolocation) {
          setLocationLoading(false);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const city = getNearestDutchCity(latitude, longitude);
            setClientLocation(city);
            setLocationLoading(false);
          },
          () => setLocationLoading(false),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      } catch {
        setLocationLoading(false);
      }
    };
    detect();
  }, []);

  // When a popular tag is selected, fetch matching services and record profile_ids
  useEffect(() => {
    const fetchServiceMatches = async () => {
      if (!selectedTag) {
        setServiceMatchedProfileIds(new Set());
        return;
      }

      // Map tag to likely service keywords
      const tag = selectedTag.toLowerCase();
      const keywordMap: Record<string, string[]> = {
        'escort': ['escort'],
        'safe sex': ['safe', 'protected', 'condom'],
        'blowjob with condom': ['blowjob', 'bj', 'condom'],
        'anal sex': ['anal'],
        's&m': ['s&m', 'bdsm', 'fetish', 'dominance'],
        'ladyboys': ['ladyboy', 'trans', 'transgender'],
        'positive reviews': [],
        'new ladies': []
      };

      const keywords = keywordMap[tag] || [tag];
      // Build OR filter for Supabase: name.ilike.%kw1%,name.ilike.%kw2%
      const orFilter = keywords
        .filter(Boolean)
        .map(kw => `name.ilike.%${kw}%`)
        .join(',');

      try {
        if (orFilter.length === 0) {
          setServiceMatchedProfileIds(new Set());
          return;
        }
        const { data, error } = await supabase
          .from('services')
          .select('profile_id, name')
          .or(orFilter)
          .limit(500);
        if (error) {
          console.warn('Service match fetch error:', error);
          setServiceMatchedProfileIds(new Set());
          return;
        }
        const ids = new Set<string>((data || []).map((r: any) => r.profile_id));
        setServiceMatchedProfileIds(ids);
      } catch (e) {
        console.warn('Service match error:', e);
        setServiceMatchedProfileIds(new Set());
      }
    };
    fetchServiceMatches();
  }, [selectedTag]);

  // Build ordered list: PRO in-city → FREE in-city → PRO nearby → FREE nearby
  useEffect(() => {
    const source = verifiedLadies;
    if (!clientLocation) {
      // No location detected - just apply tier sort globally
      const tierPriority = { PRO: 1, FREE: 2 } as any;
      let base = [...source].sort((a, b) => tierPriority[a.membershipTier] - tierPriority[b.membershipTier]);
      // Apply tag filter if any
      if (selectedTag) {
        const tagLc = selectedTag.toLowerCase();
        base = base.filter(p =>
          p.description?.toLowerCase().includes(tagLc) || serviceMatchedProfileIds.has(p.id)
        );
      }
      setFilteredProfiles(base);
      setShowingNearby(false);
      return;
    }

    let inCity = source.filter(p => p.location?.toLowerCase().includes(clientLocation.toLowerCase()));
    const nearbyList = (nearbyCities[clientLocation] || []);
    let inNearby = source.filter(p => nearbyList.some(city => p.location?.toLowerCase().includes(city.toLowerCase())));

    // Apply tag filter if selected
    if (selectedTag) {
      const tagLc = selectedTag.toLowerCase();
      const matches = (p: Profile) => p.description?.toLowerCase().includes(tagLc) || serviceMatchedProfileIds.has(p.id);
      inCity = inCity.filter(matches);
      inNearby = inNearby.filter(matches);
    }

    const pro = (list: Profile[]) => list.filter(p => p.membershipTier === 'PRO');
    const free = (list: Profile[]) => list.filter(p => p.membershipTier !== 'PRO');

    const ordered: Profile[] = [
      ...pro(inCity),
      ...free(inCity),
      ...pro(inNearby),
      ...free(inNearby),
    ];

    setFilteredProfiles(ordered.length > 0 ? ordered : []);
    setShowingNearby(inNearby.length > 0);
  }, [clientLocation, verifiedLadies, selectedTag, serviceMatchedProfileIds]);

  // Sort profiles by tier (PRO first, then FREE)
  const sortedProfiles = filteredProfiles.sort((a, b) => {
    const tierPriority = { 'PRO': 1, 'FREE': 2 };
    return tierPriority[a.membershipTier] - tierPriority[b.membershipTier];
  });
  // Use the sorted list directly (avoid duplicating with verifiedLadies)
  const allProfiles = sortedProfiles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SearchBar
        valueCity={clientLocation || ''}
        onCityChange={(city) => setClientLocation(city || null)}
        onTagSelect={(tag) => setSelectedTag(tag)}
      />

      {selectedTag && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 -mt-4 mb-6 text-pink-700 text-sm">
          Filtering by: <strong>{selectedTag}</strong>
          <button
            className="ml-3 text-pink-600 underline"
            onClick={() => setSelectedTag(null)}
          >
            Clear
          </button>
        </div>
      )}
      
      {/* Location Status Banner */}
      {locationLoading ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center">
          <Loader className="h-5 w-5 text-blue-500 animate-spin mr-3" />
          <span className="text-blue-700">Detecting your location...</span>
        </div>
      ) : clientLocation ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
          <MapPin className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">
            Showing ladies in {clientLocation}
            {showingNearby && " and nearby cities"}
            {" "}({filteredProfiles.length} results)
          </span>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 flex items-center">
          <MapPin className="h-5 w-5 text-gray-500 mr-3" />
          <span className="text-gray-700">
            Showing all ladies ({filteredProfiles.length} results)
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {/* Clothing Promo Card */}
        <Link to="/store/lingerie" className="block">
          <ProfileCard {...clothingPromo} />
        </Link>
        
        {/* Photo Studio Promo Card */}
        <Link to="/photo-studio" className="block">
          <ProfileCard {...photoPromo} />
        </Link>
        {/* Show loading spinner while fetching real ladies */}
        {loadingLadies && (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-pink-500" />
            <span className="ml-2 text-pink-500">Loading verified ladies...</span>
          </div>
        )}
        {/* Show real and mock profiles */}
        {allProfiles.map((profile) => {
          const ProfileCardWrapper = () => (
            <Link to={getAdvertisementRoute(profile)} className="block">
              <ProfileCard key={profile.id} {...profile} />
            </Link>
          );
          return <ProfileCardWrapper key={profile.id} />;
        })}
      </div>
    </div>
  );
}