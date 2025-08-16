import React, { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Lock, X, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { fanPostsService } from '../services/fanPostsService';
import { supabase } from '../lib/supabase';
import { clientDashboardService } from '../services/clientDashboardService';

interface FanPost {
  id: string;
  authorName: string;
  authorImage: string;
  date: string;
  content: string;
  contentAmount?: {
    photos: number;
    videos: number;
  };
  imageUrl?: string;
  likes: number;
  comments: number;
  isPremium: boolean;
  unlockPrice?: number;
  commentsList?: {
    authorName: string;
    authorImage: string;
    content: string;
    date: string;
  }[];
}

const samplePosts: FanPost[] = [
  {
    id: 'melissa-1',
    authorName: 'Melissa',
    authorImage: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80',
    date: '2 hours ago',
    content: 'Special content for my premium subscribers 💋\n\nTheme: Naughty\n5 Photos + 1 Fan Video',
    contentAmount: {
      photos: 5,
      videos: 1
    },
    imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
    likes: 245,
    comments: 32,
    isPremium: true
  },
  {
    id: 'melissa-2',
    authorName: 'Melissa',
    authorImage: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80',
    date: '1 day ago',
    content: 'Here\'s a free photo for all my fans! 💕\n\nTheme: Happy\n1 Photo',
    imageUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=800&q=80',
    likes: 178,
    comments: 15,
    isPremium: false,
    commentsList: [
      {
        authorName: "John",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "Beautiful photo! When can we meet?",
        date: "1 hour ago"
      },
      {
        authorName: "Mike",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        content: "You look amazing as always! 😍",
        date: "2 hours ago"
      },
      {
        authorName: "David",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        content: "Can't wait to see you again!",
        date: "3 hours ago"
      },
      {
        authorName: "Peter",
        authorImage: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&q=80",
        content: "Stunning! When are you available?",
        date: "4 hours ago"
      },
      {
        authorName: "Robert",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "Love your style! 🔥",
        date: "5 hours ago"
      },
      {
        authorName: "James",
        authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        content: "Absolutely gorgeous! 😍",
        date: "6 hours ago"
      },
      {
        authorName: "William",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "When is your next photo shoot?",
        date: "7 hours ago"
      },
      {
        authorName: "Thomas",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        content: "Perfect as always! ❤️",
        date: "8 hours ago"
      }
    ]
  },
  {
    id: 'melissa-3',
    authorName: 'Melissa',
    authorImage: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80',
    date: '2 days ago',
    content: 'Exclusive content for my subscribers only 💋\n\nTheme: Sexy\n3 Photos + 2 Fan Videos',
    contentAmount: {
      photos: 3,
      videos: 2
    },
    imageUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
    likes: 156,
    comments: 19,
    isPremium: true
  },
  {
    id: 'alexandra-1',
    authorName: 'Alexandra',
    authorImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80',
    date: '1 hour ago',
    content: 'Special content for my premium subscribers 💋 Subscribe to see more!\n\nTheme: Naughty\n3 Photos + 1 Video',
    contentAmount: {
      photos: 3,
      videos: 1
    },
    imageUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=800&q=80',
    likes: 156,
    comments: 19,
    isPremium: true
  },
  {
    id: 'jenny-1',
    authorName: 'Jenny',
    authorImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    date: '2 hours ago',
    content: 'I made 3 photos for you. They are free, so I hope you enjoy!\n\nTheme: Happy\n3 Photos',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80'
    ],
    likes: 178,
    comments: 15,
    isPremium: false,
    commentsList: [
      {
        authorName: "Mark",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "Love your style! The denim jacket looks amazing on you 😊",
        date: "1 hour ago"
      },
      {
        authorName: "Sarah",
        authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        content: "Such a cute and casual look! When can we do a photoshoot together?",
        date: "2 hours ago"
      },
      {
        authorName: "Alex",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        content: "That smile is everything! 💕",
        date: "3 hours ago"
      },
      {
        authorName: "Emma",
        authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        content: "Love the casual vibes! Looking great Jenny!",
        date: "4 hours ago"
      },
      {
        authorName: "Daniel",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "Perfect combination with the hoodie and denim! 👌",
        date: "5 hours ago"
      },
      {
        authorName: "Lisa",
        authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        content: "Your photos always make me smile! Keep them coming!",
        date: "6 hours ago"
      }
    ]
  },
  {
    id: 'sophia-1',
    authorName: 'Sophia',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    date: '3 hours ago',
    content: 'Hardcore pics for you*kiss* Call me now, I wait for you!\n\nTheme: Hardcore\n3 Photos',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622396481328-7d0cd0e7b35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
    ],
    likes: 245,
    comments: 32,
    isPremium: false,
    commentsList: [
      {
        authorName: "Kevin",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "The lighting in this photo is incredible! 💙",
        date: "1 hour ago"
      },
      {
        authorName: "Rachel",
        authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        content: "You look stunning in this blue light!",
        date: "2 hours ago"
      },
      {
        authorName: "Michael",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        content: "Absolutely mesmerizing shot! 😍",
        date: "3 hours ago"
      },
      {
        authorName: "Jessica",
        authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        content: "The composition is perfect! Love the mood",
        date: "4 hours ago"
      },
      {
        authorName: "Chris",
        authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        content: "This photo gives me cyberpunk vibes! Amazing! 🔥",
        date: "5 hours ago"
      },
      {
        authorName: "Anna",
        authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        content: "The neon lighting suits you so well!",
        date: "6 hours ago"
      },
      {
        authorName: "Tom",
        authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
        content: "Can't wait for more photos like this! 💫",
        date: "7 hours ago"
      }
    ]
  },
  {
    id: 'alexandra-2',
    authorName: 'Alexandra',
    authorImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80',
    date: '5 hours ago',
    content: 'Special content for my premium subscribers 💋 Subscribe to see more!\n\nTheme: Sexy\n5 Photos + 1 Video',
    contentAmount: {
      photos: 5,
      videos: 1
    },
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    likes: 189,
    comments: 24,
    isPremium: true
  },
  {
    id: 'sophia-2',
    authorName: 'Sophia',
    authorImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    date: '2 days ago',
    content: 'Special content for my premium subscribers 💋\n\nTheme: Naughty\n3 Photos + 1 Fan Video',
    contentAmount: {
      photos: 3,
      videos: 1
    },
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    likes: 156,
    comments: 19,
    isPremium: true
  }
];

export default function FanPosts() {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FanPost | null>(null);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const { name } = useParams();
  const [posts, setPosts] = useState<FanPost[]>([]);
  const [author, setAuthor] = useState<{ authorName: string; authorImage: string } | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'liked'>('newest');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // If viewing a particular author by name, try to resolve their profile
        let authorUserId: string | null = null;
        if (name) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, name, image_url')
            .ilike('name', name)
            .maybeSingle();
          if (profile) {
            authorUserId = profile.user_id;
            setAuthor({ authorName: profile.name, authorImage: profile.image_url || '' });
          }
        }
        // Fetch posts
        if (authorUserId) {
          const rows = await fanPostsService.getFanPostsByAuthor(authorUserId);
          // Check if author hides fan posts
          const { data: vis } = await supabase
            .from('profiles')
            .select('hide_fan_posts')
            .eq('user_id', authorUserId)
            .maybeSingle();
          const hidden = Boolean(vis?.hide_fan_posts);
          setPosts(hidden ? [] : rows.map(r => ({
            id: r.id,
            authorName: author?.authorName || name || 'Unknown',
            authorImage: author?.authorImage || '',
            date: r.date,
            content: r.content,
            contentAmount: r.contentAmount,
            imageUrl: r.imageUrl,
            likes: r.likes,
            comments: r.comments,
            isPremium: r.isPremium,
            unlockPrice: (r as any).unlockPrice || 0,
          })));
        } else {
          // No name provided: show all posts from everyone
          const rows = await fanPostsService.getAllFanPosts();
          setPosts(rows.map(r => ({
            id: r.id,
            authorName: r.authorName,
            authorImage: r.authorImage,
            date: r.date,
            content: r.content,
            contentAmount: r.contentAmount,
            imageUrl: r.imageUrl,
            likes: r.likes,
            comments: r.comments,
            isPremium: r.isPremium,
            unlockPrice: (r as any).unlockPrice || 0,
          })));
        }

        // Load unlocked post ids for current user
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser?.id) {
            const ids = await clientDashboardService.getUnlockedFanPostIds(authUser.id);
            setUnlockedIds(ids);
          } else {
            setUnlockedIds([]);
          }
        } catch {}
      } catch (e) {
        console.error('Error loading fan posts page:', e);
        setPosts([]);
      }
    };
    load();
  }, [name]);

  // Filter posts by author name if provided
  const filteredPosts = useMemo(() => {
    const base = name 
      ? posts.filter(post => post.authorName.toLowerCase() === (author?.authorName || name).toLowerCase()) 
      : posts;
    const sorted = [...base].sort((a, b) => {
      if (sortBy === 'liked') {
        return b.likes - a.likes;
      }
      // newest by relative time (fallback heuristic)
      const getMinutes = (timeStr: string) => {
        if (timeStr.includes('hour')) return parseInt(timeStr) * 60;
        if (timeStr.includes('day')) return parseInt(timeStr) * 24 * 60;
        return 0;
      };
      return getMinutes(a.date) - getMinutes(b.date);
    });
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [posts, name, author, sortBy, page]);

  // Get author info if viewing specific author's posts
  const resolvedAuthor = author || (name ? { authorName: name, authorImage: '' } : null);

  const handleUnlock = (post: FanPost) => {
    setSelectedPost(post);
    setShowUnlockModal(true);
  };

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    document.body.style.overflow = 'auto';
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={sortBy}
            onChange={(e) => { setPage(1); setSortBy(e.target.value as any); }}
          >
            <option value="newest">Newest</option>
            <option value="liked">Most liked</option>
          </select>
        </div>
      </div>
      {resolvedAuthor ? (
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left">
          <img
            src={resolvedAuthor.authorImage}
            alt={resolvedAuthor.authorName}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{resolvedAuthor.authorName}'s Fan Posts</h1>
            <p className="text-gray-600">Subscribe to see all exclusive content</p>
          </div>
          <Link
            to={`/ladies/${resolvedAuthor.authorName.toLowerCase()}`}
            className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 transition-colors text-white px-4 py-2 rounded-lg text-center mt-4 sm:mt-0"
          >
            Subscribe to {resolvedAuthor.authorName}
          </Link>
        </div>
      ) : (
        <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center sm:text-left">Fan Posts</h1>
      )}

      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div 
            key={post.id} 
            className="bg-white rounded-xl shadow-md border border-pink-200/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-pink-50/50 group"
          >
            {/* Author Info */}
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors bg-pink-50/30 group-hover:bg-pink-100/50">
              <div className="flex items-center space-x-3">
                <img
                  src={post.authorImage}
                  alt={post.authorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-pink-300 transition-all"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/ladies/${post.authorName.toLowerCase()}`}
                     className={`font-medium hover:text-pink-600 transition-colors ${
                       post.authorName === 'Melissa' ? 'text-pink-500' : 'text-gray-900'
                     }`}
                    >
                      {post.authorName}
                    </Link>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{post.date}</span>
                  </div>
                </div>
              </div>
              {post.isPremium ? (
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2">
                  <button 
                    onClick={() => handleUnlock(post)}
                    className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 group"
                  >
                    <Lock className="w-4 h-4" />
                   <span>Unlock</span>
                  </button>
                  <Link
                    to={`/ladies/${post.authorName.toLowerCase()}`}
                    className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-3 py-1 rounded-full text-sm"
                  >
                    Subscribe to {post.authorName}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Free
                  </span>
                 <Link
                   to={`/ladies/${post.authorName.toLowerCase()}`}
                    className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-3 py-1 rounded-full text-sm text-center"
                 >
                   Subscribe to {post.authorName}
                 </Link>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>

            {/* Image */}
            {post.imageUrl && (
              <div className="relative group-hover:opacity-95 transition-opacity">
                {/* Main Photo */}
                <div 
                  className={`cursor-pointer ${post.isPremium ? '' : 'hover:opacity-95'}`}
                  onClick={() => !post.isPremium && openFullscreen(post.additionalImages ? post.additionalImages[selectedPhotoIndex] : post.imageUrl)}
                >
                  <img
                    src={post.additionalImages ? post.additionalImages[selectedPhotoIndex] : post.imageUrl}
                    alt="Post content"
                    className={`w-full h-[400px] object-cover ${post.isPremium && !unlockedIds.includes(post.id) ? 'blur-[8px]' : ''}`}
                  />
                </div>
                
                {/* Thumbnails */}
                {!post.isPremium && post.additionalImages && post.additionalImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
                    {post.additionalImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhotoIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                          selectedPhotoIndex === index ? 'ring-2 ring-pink-500 scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {post.isPremium && !unlockedIds.includes(post.id) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-none">
                    <div className="space-y-2">
                      <div className="bg-black/50 backdrop-blur-none px-6 py-3 rounded-lg text-center">
                      <p className="text-white font-medium">
                        {post.contentAmount && (
                          <>
                            {post.contentAmount.photos} Fan Photos + {post.contentAmount.videos} Fan Video
                          </>
                        )}
                      </p>
                      </div>
                      <button
                        onClick={() => handleUnlock(post)}
                        className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-6 py-2 rounded-lg font-medium mx-auto block"
                      >
                       {(post as any).unlockPrice || 0} DK Credits
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 flex items-center justify-between border-t transition-colors group-hover:bg-pink-50/80">
              <div className="flex items-center space-x-6">
                <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500">
                  <Heart className="w-5 h-5 transition-transform duration-300 hover:scale-125" />
                  <span>{post.likes}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-500 hover:text-pink-500">
                  <MessageCircle className="w-5 h-5 transition-transform duration-300 hover:scale-125" />
                  <span>{post.comments}</span>
                </button>
              </div>
              <button className="text-pink-500 hover:text-pink-600 text-sm font-medium">
                Share
              </button>
            </div>
            
            {/* Comments Section for Free Posts */}
            {!post.isPremium && post.commentsList && (
              <div className="border-t border-pink-100">
                <div className="px-4 py-3 space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Comments</h3>
                  <div className="mt-3 space-y-3">
                    {post.commentsList
                      .slice(0, expandedComments.includes(post.id) ? undefined : 5)
                      .map((comment, index) => (
                      <div key={`${post.id}-comment-${index}`} className="flex space-x-3">
                        <img
                          src={comment.authorImage}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{comment.authorName}</span>
                            <span className="text-gray-500 text-sm">{comment.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {post.commentsList.length > 5 && (
                    <button
                      onClick={() => toggleComments(post.id)}
                      className="text-pink-500 hover:text-pink-600 text-sm font-medium"
                    >
                      {expandedComments.includes(post.id) 
                        ? 'Show Less Comments' 
                        : `Show All Comments (${post.commentsList.length})`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <div className="text-sm text-gray-600">Page {page}</div>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => (posts.length > page * pageSize ? p + 1 : p))}
          disabled={posts.length <= page * pageSize}
        >
          Next
        </button>
      </div>

      {/* Unlock Modal */}
      {showUnlockModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Unlock Content</h3>
              <button
                onClick={() => setShowUnlockModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3 mb-6">
              <img
                src={selectedPost.authorImage}
                alt={selectedPost.authorName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{selectedPost.authorName}</h4>
                <p className="text-sm text-gray-500">{selectedPost.date}</p>
              </div>
            </div>

            <div className="bg-pink-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-pink-500">
                <Coins className="w-6 h-6" />
                <span>{selectedPost.isPremium ? (selectedPost as any).unlockPrice || 0 : 0} DK Credits</span>
              </div>
            </div>

            <button
              onClick={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) throw new Error('Please log in');
                  await clientDashboardService.unlockFanPost(user.id, selectedPost.id);
                  setShowUnlockModal(false);
                  // reflect unlock immediately
                  setUnlockedIds(prev => Array.from(new Set([...prev, selectedPost.id])));
                } catch (e: any) {
                  alert(e?.message || 'Failed to unlock');
                }
              }}
              className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Unlock Now
            </button>
            
            <p className="text-sm text-gray-500 text-center mt-4">
              You can purchase DK Credits in your account settings
            </p>
          </div>
        </div>
      )}
      
      {/* Fullscreen Photo Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 z-20"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Main Image */}
          <img
            src={fullscreenImage}
            alt="Full screen content"
            className="max-h-screen max-w-screen object-contain relative"
          />
          
          {/* Watermark */}
          <div className="absolute bottom-4 right-4 pointer-events-none select-none">
            <div className="text-pink-500/30 text-[40px] font-bold rotate-[-30deg] whitespace-nowrap">
              DateKelly.ro
            </div>
          </div>
        </div>
      )}
    </div>
  );
}