import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Star, MapPin, X, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clientDashboardService, Profile } from '../../services/clientDashboardService';

export default function ClientFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user?.id]);

  const loadFavorites = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const favoritesData = await clientDashboardService.getFavoriteProviders(user.id);
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (profileId: string, profileName: string) => {
    if (!user?.id || removingId) return;
    
    const confirmed = window.confirm(`Remove ${profileName} from your favorites?`);
    if (!confirmed) return;
    
    try {
      setRemovingId(profileId);
      await clientDashboardService.removeFromFavorites(user.id, profileId);
      
      // Remove from local state
      setFavorites(prev => prev.filter(favorite => favorite.id !== profileId));
      
      // Optional success feedback
      // alert(`${profileName} removed from favorites.`);
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      alert(err.message || 'Failed to remove favorite. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">View and manage your favorite ladies</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading your favorites...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
          <p className="text-gray-600 mt-1">View and manage your favorite ladies</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Unable to load favorites</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={loadFavorites}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="font-medium">{favorites.length} Ladies</span>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="relative group bg-white rounded-xl border border-pink-300 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Profile Card Content */}
              <Link 
                to={`/ladies/${favorite.membershipTier === 'FREE' ? '' : 'pro/'}${favorite.name.toLowerCase()}`}
                className="block"
              >
                <div className="aspect-w-3 aspect-h-4 relative">
                  <img
                    src={favorite.imageUrl}
                    alt={favorite.name}
                    className="w-full h-64 object-cover"
                  />
                  {favorite.isVerified && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
                      ✓ Verified
                    </div>
                  )}
                  {favorite.isClub && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 text-xs rounded-full">
                      Club
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{favorite.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{favorite.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{favorite.location}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {favorite.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {favorite.price && (
                      <span className="text-lg font-bold text-pink-500">{favorite.price}</span>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Heart className="h-4 w-4" />
                      <span>{favorite.loves}</span>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFavorite(favorite.id, favorite.name)}
                disabled={removingId === favorite.id}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove from favorites"
              >
                {removingId === favorite.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Favorites Yet</h3>
          <p className="text-gray-500 mb-6">
            You haven't added any ladies to your favorites yet. Start exploring to find your favorites!
          </p>
          <Link
            to="/ladies"
            className="inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Browse Ladies
          </Link>
        </div>
      )}
    </div>
  );
}