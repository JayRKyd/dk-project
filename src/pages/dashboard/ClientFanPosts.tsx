import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Lock, Camera } from 'lucide-react';

interface UnlockedPost {
  id: string;
  lady: {
    name: string;
    imageUrl: string;
  };
  date: string;
  content: string;
  contentAmount?: {
    photos: number;
    videos: number;
  };
  imageUrl: string;
  likes: number;
  comments: number;
  isPremium: boolean;
  unlockPrice: number;
}

const unlockedPosts: UnlockedPost[] = [
  {
    id: '1',
    lady: {
      name: 'Alexandra',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'
    },
    date: '2 days ago',
    content: 'Special content for my premium subscribers 💋\n\nTheme: Naughty\n5 Photos + 1 Fan Video',
    contentAmount: {
      photos: 5,
      videos: 1
    },
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    likes: 245,
    comments: 32,
    isPremium: true,
    unlockPrice: 10
  },
  {
    id: '2',
    lady: {
      name: 'Melissa',
      imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80'
    },
    date: '1 week ago',
    content: 'Here\'s a special photo set for my fans! 💕\n\nTheme: Sexy\n3 Photos',
    contentAmount: {
      photos: 3,
      videos: 0
    },
    imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
    likes: 178,
    comments: 15,
    isPremium: true,
    unlockPrice: 5
  }
];

export default function ClientFanPosts() {
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
        <h1 className="text-2xl font-bold text-gray-900">Unlocked Fan Posts</h1>
        <p className="text-gray-600 mt-1">
          View all the fan posts you've unlocked
        </p>
      </div>

      {/* Fan Posts List */}
      <div className="space-y-6">
        {unlockedPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={post.lady.imageUrl}
                    alt={post.lady.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/ladies/pro/${post.lady.name.toLowerCase()}`}
                      className="font-medium text-gray-900 hover:text-pink-500"
                    >
                      {post.lady.name}
                    </Link>
                    <div className="text-sm text-gray-500">{post.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                    <Camera className="h-4 w-4" />
                    <span>
                      {post.contentAmount?.photos} Photos
                      {post.contentAmount?.videos ? ` + ${post.contentAmount.videos} Video` : ''}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>

            {/* Post Image */}
            <div className="relative">
              <img
                src={post.imageUrl}
                alt="Post content"
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500">
                  <Heart className="h-5 w-5" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments}</span>
                </button>
              </div>
              <Link
                to={`/ladies/pro/${post.lady.name.toLowerCase()}`}
                className="text-pink-500 hover:text-pink-600 text-sm font-medium"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}

        {unlockedPosts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Unlocked Posts Yet</h3>
            <p className="text-gray-500">
              You haven't unlocked any fan posts yet. Browse ladies' profiles to find exclusive content!
            </p>
            <Link
              to="/"
              className="mt-4 inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Browse Ladies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}