import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import SearchBar from '../components/SearchBar';
import { Profile, PromoCard } from '../types';

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
const sampleProfiles: Profile[] = [
  {
    id: '1',
    name: 'Sophia',
    location: 'Amsterdam',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    rating: 9.5,
    loves: 245,
    isVerified: true,
    isClub: false,
    description: 'Hi, I\'m Sophia! I offer a genuine GFE experience. Available for incall and outcall.',
    membershipTier: 'PRO'
  },
  {
    id: '5',
    name: 'Emma',
    location: 'Eindhoven',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    rating: 8.5,
    loves: 156,
    isVerified: false,
    isClub: false,
    description: 'Sweet and charming girl next door. Available for incall and outcall.',
    membershipTier: 'FREE'
  },
  {
    id: '6',
    name: 'Sarah',
    location: 'Groningen',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80',
    rating: 8.8,
    loves: 203,
    isVerified: false,
    isClub: false,
    description: 'Fun-loving and adventurous. Let\'s create unforgettable moments together.',
    membershipTier: 'FREE'
  },
  {
    id: '8',
    name: 'Isabella',
    location: 'Amsterdam',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    rating: 9.7,
    loves: 312,
    isVerified: true,
    isClub: false,
    description: 'Elite companion offering unforgettable experiences. Available for dinner dates and travel.',
    membershipTier: 'PRO'
  },
  {
    id: '2',
    name: 'Jenny',
    location: 'Rotterdam',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    rating: 9.8,
    loves: 532,
    isVerified: true,
    isClub: true,
    description: 'Premium escort agency with the most beautiful ladies in Rotterdam.',
    membershipTier: 'PRO'
  },
  {
    id: '7',
    name: 'Victoria',
    location: 'Maastricht',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    rating: 8.2,
    loves: 167,
    isVerified: false,
    isClub: false,
    description: 'Passionate and sensual. Available for private visits only.',
    membershipTier: 'FREE'
  },
  {
    id: '3',
    name: 'Alexandra',
    location: 'The Hague',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    rating: 9.2,
    loves: 178,
    isVerified: false,
    isClub: false,
    description: 'Hi, I\'m Alexandra! I offer a genuine GFE experience. Available for incall and outcall.',
    membershipTier: 'FREE'
  },
  {
    id: '4',
    name: 'Melissa',
    location: 'Utrecht',
    imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
    rating: 9.9,
    loves: 423,
    isVerified: true,
    isClub: true,
    description: 'Exclusive club with VIP rooms and luxury amenities. Private parking available.',
    membershipTier: 'PRO'
  }
];

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
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>(sampleProfiles);
  const [showingNearby, setShowingNearby] = useState(false);

  useEffect(() => {
    // Request user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearestCity = getNearestDutchCity(latitude, longitude);
          setClientLocation(nearestCity);
          setLocationLoading(false);
        },
        () => {
          // Permission denied or error - show all ladies
          setLocationLoading(false);
        }
      );
    } else {
      // Geolocation not supported - show all ladies
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!clientLocation) {
      // No location detected - show all ladies
      setFilteredProfiles(sampleProfiles);
      return;
    }

    // Filter ladies by client's city first
    let cityLadies = sampleProfiles.filter(lady => 
      lady.location.toLowerCase().includes(clientLocation.toLowerCase())
    );

    // If not enough results in the city, expand to nearby cities
    if (cityLadies.length < 3) {
      const nearby = nearbyCities[clientLocation] || [];
      const nearbyLadies = sampleProfiles.filter(lady => 
        nearby.some(city => lady.location.toLowerCase().includes(city.toLowerCase()))
      );
      
      if (nearbyLadies.length > 0) {
        cityLadies = [...cityLadies, ...nearbyLadies];
        setShowingNearby(true);
      }
    }

    // If still no results, show all ladies
    if (cityLadies.length === 0) {
      cityLadies = sampleProfiles;
    }

    setFilteredProfiles(cityLadies);
  }, [clientLocation]);

  // Sort profiles by tier (PRO first, then FREE)
  const sortedProfiles = filteredProfiles.sort((a, b) => {
    const tierPriority = { 'PRO': 1, 'FREE': 2 };
    return tierPriority[a.membershipTier] - tierPriority[b.membershipTier];
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SearchBar />
      
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

        {sortedProfiles.map((profile) => {
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