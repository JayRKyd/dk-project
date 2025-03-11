import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Star, MessageCircle, Calendar, X } from 'lucide-react';
import ProfileCard from '../../components/ProfileCard';
import { Profile } from '../../types';

const sampleFavorites: Profile[] = [
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
  }
];

export default function ClientFavorites() {
  const handleRemoveFavorite = (id: string) => {
    // Here you would make an API call to remove the favorite
    console.log('Removing favorite:', id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/client"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-1">
              View and manage your favorite ladies
            </p>
          </div>
          <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
            <Heart className="h-5 w-5" />
            <span className="font-medium">{sampleFavorites.length} Ladies</span>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      {sampleFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleFavorites.map((favorite) => (
            <div key={favorite.id} className="relative group">
              <Link to={`/ladies/${favorite.membershipTier === 'FREE' ? '' : 'pro/'}${favorite.id}`}>
                <ProfileCard {...favorite} />
              </Link>
              <button
                onClick={() => handleRemoveFavorite(favorite.id)}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                title="Remove from favorites"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
          <p className="text-gray-500 mb-6">
            You haven't added any ladies to your favorites yet.
          </p>
          <Link
            to="/"
            className="inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Browse Ladies
          </Link>
        </div>
      )}
    </div>
  );
}