import React from 'react';
import { Link } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import SearchBar from '../components/SearchBar';
import { Profile } from '../types';

const sampleClubs: Profile[] = [
  {
    id: '1',
    name: 'Pink Angels Club',
    location: 'Amsterdam',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
    rating: 9.8,
    loves: 532,
    isVerified: true,
    isClub: true,
    description: 'Premium escort club with VIP rooms and luxury amenities. Private parking available.',
    membershipTier: 'ULTRA'
  },
  {
    id: '2',
    name: 'Diamond Lounge',
    location: 'Rotterdam',
    imageUrl: 'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?auto=format&fit=crop&w=800&q=80',
    rating: 9.7,
    loves: 423,
    isVerified: true,
    isClub: true,
    description: 'Exclusive club with VIP rooms and luxury amenities. Private parking available.',
    membershipTier: 'PRO-PLUS'
  },
  {
    id: '3',
    name: 'Royal Escorts',
    location: 'The Hague',
    imageUrl: 'https://images.unsplash.com/photo-1461988091159-192b6df7054f?auto=format&fit=crop&w=800&q=80',
    rating: 9.5,
    loves: 312,
    isVerified: true,
    isClub: true,
    description: 'Elite escort agency offering unforgettable experiences. Available for dinner dates and travel.',
    membershipTier: 'PRO'
  },
  {
    id: '4',
    name: 'VIP Club Paradise',
    location: 'Utrecht',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    rating: 9.2,
    loves: 245,
    isVerified: true,
    isClub: true,
    description: 'Luxury club with private rooms and professional staff. Discreet location.',
    membershipTier: 'PRO'
  },
  {
    id: '5',
    name: 'Elite Escorts Agency',
    location: 'Eindhoven',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80',
    rating: 8.8,
    loves: 156,
    isVerified: false,
    isClub: true,
    description: 'Professional escort agency with experienced staff. 24/7 service available.',
    membershipTier: 'FREE'
  },
  {
    id: '6',
    name: 'Luxury Club Sapphire',
    location: 'Groningen',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    rating: 9.1,
    loves: 203,
    isVerified: true,
    isClub: true,
    description: 'High-end club with exclusive VIP areas. Professional and discreet service.',
    membershipTier: 'PRO-PLUS'
  }
];

const getAdvertisementRoute = (profile: Profile) => {
  return profile.membershipTier === 'PRO' || profile.membershipTier === 'PRO-PLUS' || profile.membershipTier === 'ULTRA'
    ? `/clubs/pro/${profile.id}`
    : `/clubs/${profile.id}`;
};

export default function Clubs() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SearchBar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {sampleClubs
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