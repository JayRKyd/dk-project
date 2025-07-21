import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Lock, Camera, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clientDashboardService, type FanPost } from '../../services/clientDashboardService';

export default function ClientFanPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUnlockedFanPosts();
    }
  }, [user?.id]);

  const loadUnlockedFanPosts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const unlockedPosts = await clientDashboardService.getUnlockedFanPosts(user.id);
      setPosts(unlockedPosts);
    } catch (err) {
      console.error('Error loading unlocked fan posts:', err);
      setError('Failed to load fan posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Unlocked Fan Posts</h1>
          <p className="text-gray-600 mt-1">Loading your unlocked content...</p>
        </div>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-48 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Unlocked Fan Posts</h1>
          <p className="text-gray-600 mt-1">View all the fan posts you've unlocked</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Failed to load fan posts</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={loadUnlockedFanPosts}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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
            <h1 className="text-2xl font-bold text-gray-900">Unlocked Fan Posts</h1>
            <p className="text-gray-600 mt-1">
              View all the fan posts you've unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-500">{posts.length}</div>
            <div className="text-sm text-gray-500">Unlocked Posts</div>
          </div>
        </div>
      </div>

      {/* Fan Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Post Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={post.lady.imageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'}
                    alt={post.lady.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/ladies/pro/${post.lady.name.toLowerCase()}`}
                      className="font-medium text-gray-900 hover:text-pink-500 transition-colors"
                    >
                      {post.lady.name}
                    </Link>
                    <div className="text-sm text-gray-500">{formatDate(post.unlockedAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    <span>✓ Unlocked</span>
                  </div>
                  <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                    <Camera className="h-4 w-4" />
                    <span>{post.creditsSpent} Credits</span>
                  </div>
                </div>
              </div>
              
              {/* Post Title */}
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
              )}
              
              {/* Post Content */}
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="relative">
                <img
                  src={post.imageUrl}
                  alt="Post content"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors">
                  <Heart className="h-5 w-5" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments}</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  Unlocked {formatDate(post.unlockedAt)}
                </span>
                <Link
                  to={`/ladies/pro/${post.lady.name.toLowerCase()}`}
                  className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Unlocked Posts Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't unlocked any fan posts yet. Browse ladies' profiles to find exclusive content!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Browse Ladies
              </Link>
              <Link
                to="/fan-posts"
                className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Discover Fan Posts
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}