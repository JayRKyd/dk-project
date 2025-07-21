import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Image,
  Video,
  Lock,
  MessageCircle,
  Heart,
  Trash2,
  Edit,
  X,
  Check,
  Camera,
  Eye,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useFanPosts } from '../../hooks/useProtectedApi';
import { MembershipGuard } from '../../components/auth/MembershipGuard';

type Theme = 'Happy' | 'Romantic' | 'No comment' | 'Sexy' | 'Wild' | 'Hardcore';

interface FanPost {
  id: string;
  content: string;
  theme: Theme;
  imageUrls: string[];
  videoUrls?: string[];
  isPremium: boolean;
  unlockPrice: number;
  createdAt: string;
  likes: number;
  comments: Comment[];
  allowComments: boolean;
}

interface Comment {
  id: string;
  author: {
    name: string;
    imageUrl: string;
  };
  content: string;
  createdAt: string;
}

const samplePosts: FanPost[] = [
  {
    id: '1',
    content: 'Special content for my premium subscribers 💋\n\nTheme: Naughty\n5 Photos + 1 Fan Video',
    theme: 'Sexy',
    imageUrls: [
      'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80'
    ],
    videoUrls: ['video1.mp4'],
    isPremium: true,
    unlockPrice: 10,
    createdAt: '2024-01-15T10:00:00Z',
    likes: 245,
    comments: [
      {
        id: 'c1',
        author: {
          name: 'John D.',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
        },
        content: 'Beautiful photos! When can we meet?',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'c2',
        author: {
          name: 'Mike R.',
          imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
        },
        content: 'You look amazing as always! 😍',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ],
    allowComments: true
  },
  {
    id: '2',
    content: 'Here\'s a free photo for all my fans! 💕\n\nTheme: Happy\n1 Photo',
    theme: 'Happy',
    imageUrls: [
      'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=800&q=80'
    ],
    isPremium: false,
    unlockPrice: 0,
    createdAt: '2024-01-14T15:00:00Z',
    likes: 178,
    comments: [
      {
        id: 'c3',
        author: {
          name: 'David K.',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
        },
        content: 'Stunning! When are you available?',
        createdAt: '2024-01-14T15:30:00Z'
      }
    ],
    allowComments: true
  }
];

export default function ManageFanPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FanPost[]>(samplePosts);
  const [editingPost, setEditingPost] = useState<FanPost | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FanPost | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Protected API integration
  const { list: fanPostsApi, createFanPost } = useFanPosts();

  const themes: Theme[] = ['Happy', 'Romantic', 'No comment', 'Sexy', 'Wild', 'Hardcore'];

  // Load fan posts with membership validation
  useEffect(() => {
    const loadFanPosts = async () => {
      await fanPostsApi.execute();
    };
    loadFanPosts();
  }, [fanPostsApi]);

  const [newPost, setNewPost] = useState({
    content: '',
    images: [] as File[],
    videos: [] as File[],
    isPremium: false,
    unlockPrice: 10
  });

  const handleCreatePost = () => {
    // Handle post creation
    setNewPost({
      content: '',
      images: [],
      videos: [],
      isPremium: false,
      unlockPrice: 10
    });
  };

  const handleDeletePost = () => {
    if (selectedPost) {
      setPosts(posts.filter(post => post.id !== selectedPost.id));
      setShowDeleteModal(false);
      setSelectedPost(null);
    }
  };

  const handleEditPost = (post: FanPost) => {
    setEditingPost(post);
  };

  const handleSaveEdit = () => {
    if (editingPost) {
      setPosts(posts.map(post => 
        post.id === editingPost.id ? editingPost : post
      ));
      setEditingPost(null);
    }
  };

  const handleReply = (postId: string, commentId: string) => {
    if (replyText[commentId]?.trim()) {
      console.log('Sending reply:', replyText[commentId]);
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
    }
  };

  // Wrap entire component with membership protection
  return (
    <MembershipGuard requiredTier="PRO" redirectTo="/dashboard/lady/upgrade">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Membership Protection Status */}
        {fanPostsApi.membershipError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-medium text-red-900">Access Restricted</h4>
                <p className="text-sm text-red-700">
                  {fanPostsApi.membershipError.message}
                </p>
                <Link 
                  to="/dashboard/lady/upgrade" 
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Upgrade to PRO →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* API Protection Status */}
        {fanPostsApi.loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500 animate-pulse" />
              <div>
                <h4 className="font-medium text-blue-900">Validating Access</h4>
                <p className="text-sm text-blue-700">
                  Checking your membership permissions...
                </p>
              </div>
            </div>
          </div>
        )}
      {/* Back Button */}
      <Link
        to="/dashboard/lady"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Fan Posts</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your fan posts
            </p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Your Fan Posts</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
          </div>
          <Link
            to="/fan-posts/melissa"
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <Eye className="h-5 w-5" />
            <span>View as Fans</span>
          </Link>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="border-b border-pink-300">
            {editingPost?.id === post.id ? (
              // Edit Mode
              <div className="p-6 border-b border-pink-300">
                <textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                  rows={4}
                  placeholder="Write something about your post..."
                />

                {/* Theme Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Theme
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, theme })}
                        className={`p-3 rounded-lg text-center transition-colors ${
                          editingPost.theme === theme
                            ? 'bg-pink-500 text-white'
                            : 'bg-pink-50 hover:bg-pink-100 text-gray-900'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premium Settings */}
                <div className="mt-6 space-y-4">
                  {/* Post Type Selection */}
                  <div className="bg-pink-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Post Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, isPremium: false })}
                        className={`p-4 rounded-lg text-center transition-colors ${
                          !editingPost.isPremium
                            ? 'bg-green-500 text-white'
                            : 'bg-white hover:bg-green-50'
                        }`}
                      >
                        <div className="font-medium mb-1">Free Fan Post</div>
                        <div className="text-sm opacity-75">Everyone can see it for free</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, isPremium: true })}
                        className={`p-4 rounded-lg text-center transition-colors ${
                          editingPost.isPremium
                            ? 'bg-pink-500 text-white'
                            : 'bg-white hover:bg-pink-50'
                        }`}
                      >
                        <div className="font-medium mb-1">Premium Content</div>
                        <div className="text-sm opacity-75">Fans need to pay to unlock</div>
                      </button>
                    </div>
                  </div>

                  {/* Price Selection (only for premium) */}
                  {editingPost.isPremium && (
                    <div className="bg-pink-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Unlock Price</h3>
                        <Lock className="h-5 w-5 text-pink-500" />
                      </div>
                      <select
                        value={editingPost.unlockPrice}
                        onChange={(e) => setEditingPost({ ...editingPost, unlockPrice: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                      >
                        <option value={1}>1 DK Credit</option>
                        <option value={2}>2 DK Credits</option>
                        <option value={5}>5 DK Credits</option>
                        <option value={10}>10 DK Credits</option>
                      </select>
                    </div>
                  )}

                  {/* Comments Toggle */}
                  <div className="bg-pink-50 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Comments</h3>
                        <p className="text-sm text-gray-500 mt-1">Allow fans to comment on this post</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPost.allowComments}
                      onChange={(e) => setEditingPost({ ...editingPost, allowComments: e.target.checked })}
                      className="sr-only peer"
                    />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => setEditingPost(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80"
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium">Melissa</div>
                        <div className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded">
                        {post.theme}
                      </span>
                      {post.isPremium && (
                        <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {post.unlockPrice} DK
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media Preview */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6 bg-gray-50">
                  {post.imageUrls.map((url, index) => (
                    <div key={index} className="aspect-square relative group">
                      <img
                        src={url}
                        alt={`Post ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="text-white">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {post.videoUrls?.map((url, index) => (
                    <div key={`video-${index}`} className="aspect-square relative group bg-black rounded-lg flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="text-white">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Heart className={`h-5 w-5 ${post.likes > 0 ? 'text-pink-500' : 'text-gray-400'}`} />
                      <span>{post.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className={`h-5 w-5 ${post.comments.length > 0 ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span>{post.comments.length} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.allowComments ? (
                      <span className="text-green-500 text-sm">Comments enabled</span>
                    ) : (
                      <span className="text-gray-400 text-sm">Comments disabled</span>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div className="px-6 py-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-4">Comments</h3>
                  <div className="space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <img
                          src={comment.author.imageUrl}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3">
                            <div className="font-medium">{comment.author.name}</div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              className="text-sm text-gray-500 hover:text-gray-700"
                              onClick={() => setReplyText(prev => ({ 
                                ...prev, 
                                [comment.id]: `@${comment.author.name} ` 
                              }))}
                            >
                              Reply
                            </button>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {replyText[comment.id] && (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={replyText[comment.id]}
                                onChange={(e) => setReplyText(prev => ({
                                  ...prev,
                                  [comment.id]: e.target.value
                                }))}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Write a reply..."
                              />
                              <button
                                onClick={() => handleReply(post.id, comment.id)}
                                className="px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                              >
                                Send
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPost(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </MembershipGuard>
  );
}