import React from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import SearchBar from '../components/SearchBar';
import { Profile, PromoCard } from '../types';

const getAdvertisementRoute = (profile: Profile) => {
  return profile.membershipTier === 'PRO' || profile.membershipTier === 'PRO-PLUS' || profile.membershipTier === 'ULTRA'
    ? `/ladies/pro/${profile.id}`
    : `/ladies/${profile.id}`;
};

const clothingPromo: PromoCard = {
  id: 'clothing-promo',
  name: 'Sexy Lingerie Store',
  location: 'Amsterdam',
  imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  loves: 324,
  isVerified: true,
  isClub: false,
  description: 'Premium lingerie and adult clothing. Special offer: 20% off on all items!',
  price: '€20',
  membershipTier: 'PROMO',
  isPromo: true
};

const photoPromo: PromoCard = {
  id: 'photo-promo',
  name: 'Photo Studio',
  location: 'Amsterdam',
  imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80',
  loves: 0,
  isVerified: false,
  isClub: false,
  description: '',
  membershipTier: 'PROMO',
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
    price: '€ 50',
    membershipTier: 'ULTRA'
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
    price: '€ 50',
    membershipTier: 'PRO-PLUS'
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

export default function Ladies() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SearchBar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {/* Clothing Promo Card */}
        <Link to="/store/lingerie" className="block">
          <ProfileCard {...clothingPromo} />
        </Link>
        
        {/* Photo Studio Promo Card */}
        <Link to="/photo-studio" className="block">
          <ProfileCard {...photoPromo} />
        </Link>

        {sampleProfiles
          .sort((a, b) => {
            // Define tier priority
            const tierPriority = {
              'ULTRA': 0,
              'PRO-PLUS': 1,
              'PRO': 2,
              'FREE': 3
            };
            
            // Sort by tier priority
            return tierPriority[a.membershipTier] - tierPriority[b.membershipTier];
          })
          .map((profile) => {
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