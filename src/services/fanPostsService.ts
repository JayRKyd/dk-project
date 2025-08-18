import { supabase } from '../lib/supabase';
import { ContentModerationService } from './contentModerationService';

export interface FanPost {
  id: string;
  authorName: string;
  authorImage: string;
  date: string;
  content: string;
  theme?: string;
  contentAmount?: {
    photos: number;
    videos: number;
  };
  imageUrl?: string;
  additionalImages?: string[];
  likes: number;
  comments: number;
  isPremium: boolean;
  isLiked?: boolean;
  unlockPrice?: number;
  commentsList?: FanPostComment[];
}

export interface FanPostComment {
  id: string;
  authorName: string;
  authorImage: string;
  content: string;
  date: string;
}

export interface CreateFanPostData {
  content: string;
  theme?: string;
  isPremium: boolean;
  mediaFiles?: File[];
  creditsCost?: number;
}

export const fanPostsService = {
  /**
   * Get lady fan earnings (unlocks of her fan posts)
   */
  async getLadyFanEarnings(ladyUserId: string): Promise<Array<{
    id: string;
    type: 'unlock';
    fan: { name: string; imageUrl: string };
    amount: number;
    description: string;
    date: string;
    time: string;
    fanPostId: string;
    fanPostTitle?: string;
  }>> {
    const { data, error } = await supabase
      .rpc('get_lady_fan_earnings', { p_lady_id: ladyUserId, p_limit: 500 });

    if (error) {
      console.error('Error fetching lady fan earnings:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      type: 'unlock' as const,
      fan: {
        name: row.client_name || 'Anonymous',
        imageUrl: row.client_image_url || '',
      },
      amount: Number(row.credits_spent) || 0,
      description: row.fan_post_title ? `Unlocked your fan post: ${row.fan_post_title}` : 'Unlocked your fan post',
      date: new Date(row.created_at).toISOString().split('T')[0],
      time: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fanPostId: row.fan_post_id,
      fanPostTitle: row.fan_post_title,
    }));
  },

  /**
   * Get posts created by a lady (current user)
   */
  async getLadyPostsByUser(userId: string): Promise<Array<{
    id: string;
    content: string;
    theme?: string;
    imageUrls: string[];
    videoUrls?: string[];
    isPremium: boolean;
    unlockPrice: number;
    createdAt: string;
    likes: number;
    commentsCount: number;
  }>> {
    // Fetch posts authored by this user
    const { data: posts, error: postsError } = await supabase
      .from('fan_posts')
      .select('*')
      .eq('lady_id', userId)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching lady posts:', postsError);
      return [];
    }

    // Fetch media for each post
    const results = await Promise.all((posts || []).map(async (post: any) => {
      const { data: media } = await supabase
        .from('fan_post_media')
        .select('file_url, media_type')
        .eq('post_id', post.id)
        .order('display_order', { ascending: true });

      const images = (media || []).filter(m => m.media_type === 'image').map(m => m.file_url);
      const videos = (media || []).filter(m => m.media_type === 'video').map(m => m.file_url);

      return {
        id: post.id,
        content: post.content || '',
        theme: post.theme,
        imageUrls: images.length > 0 ? images : (post.image_url ? [post.image_url] : []),
        videoUrls: videos,
        isPremium: Boolean(post.is_premium),
        unlockPrice: Number(post.credits_cost) || 0,
        createdAt: post.created_at,
        likes: Number(post.likes) || 0,
        commentsCount: Number(post.comments) || 0,
      };
    }));

    return results;
  },
  /**
   * Get all published fan posts
   */
  async getAllFanPosts(): Promise<FanPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to view fan posts.');
      }

      // Fetch posts with author information
      const { data: posts, error: postsError } = await supabase
        .from('fan_posts')
        .select(`
          id,
          content,
          theme,
          is_premium,
          credits_cost,
          likes_count,
          comments_count,
          created_at,
          author_id
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (postsError) {
        console.error('Error fetching fan posts:', postsError);
        throw new Error('Failed to load fan posts.');
      }

      // Fetch author profiles separately (no FK defined)
      const authorIds = [...new Set((posts || []).map((p: any) => p.author_id))];
      const { data: profileRows, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, name, image_url')
        .in('user_id', authorIds);
      if (profileErr) {
        console.warn('Warning: failed to load author profiles for fan posts:', profileErr);
      }
      const profileMap = new Map<string, { name?: string; image_url?: string }>();
      (profileRows || []).forEach((p: any) => profileMap.set(p.user_id, { name: p.name, image_url: p.image_url }));

      // Get media for each post
      const postsWithMedia = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: media } = await supabase
            .from('fan_post_media')
            .select('file_url, media_type')
            .eq('post_id', post.id)
            .order('display_order', { ascending: true });

          const images = (media || [])
            .filter(m => m.media_type === 'image')
            .map(m => m.file_url);
          const videos = (media || [])
            .filter(m => m.media_type === 'video')
            .map(m => m.file_url);

          // Check if current user liked this post
          const { data: like } = await supabase
            .from('fan_post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();

          const authorProfile = profileMap.get(post.author_id) || {} as any;
          return {
            id: post.id,
            authorName: (authorProfile as any).name || 'Anonymous',
            authorImage: (authorProfile as any).image_url || '',
            date: this.formatRelativeDate(post.created_at),
            content: post.content,
            theme: post.theme,
            contentAmount: {
              photos: images.length,
              videos: videos.length
            },
            imageUrl: images[0],
            additionalImages: images.slice(1),
            likes: post.likes_count,
            comments: post.comments_count,
            isPremium: post.is_premium,
            isLiked: !!like,
            unlockPrice: Number((post as any).credits_cost) || 0
          };
        })
      );

      return postsWithMedia;
    } catch (error) {
      console.error('Error getting fan posts:', error);
      throw error;
    }
  },

  /**
   * Get fan posts by a specific author
   */
  async getFanPostsByAuthor(authorId: string): Promise<FanPost[]> {
    try {
      const { data: posts, error } = await supabase
        .from('fan_posts')
        .select(`
          id,
          content,
          theme,
          is_premium,
          credits_cost,
          likes_count,
          comments_count,
          created_at,
          author_id
        `)
        .eq('author_id', authorId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching author fan posts:', error);
        throw new Error('Failed to load author posts.');
      }

      // Fetch author profile once
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('user_id, name, image_url')
        .eq('user_id', authorId)
        .maybeSingle();

      // Process posts similar to getAllFanPosts
      const postsWithMedia = await Promise.all(
        (posts || []).map(async (post) => {
          const { data: media } = await supabase
            .from('fan_post_media')
            .select('file_url, media_type')
            .eq('post_id', post.id)
            .order('display_order', { ascending: true });

          const images = (media || [])
            .filter(m => m.media_type === 'image')
            .map(m => m.file_url);
          const videos = (media || [])
            .filter(m => m.media_type === 'video')
            .map(m => m.file_url);

          return {
            id: post.id,
            authorName: (profileRow as any)?.name || 'Anonymous',
            authorImage: (profileRow as any)?.image_url || '',
            date: this.formatRelativeDate(post.created_at),
            content: post.content,
            theme: post.theme,
            contentAmount: {
              photos: images.length,
              videos: videos.length
            },
            imageUrl: images[0],
            additionalImages: images.slice(1),
            likes: post.likes_count,
            comments: post.comments_count,
            isPremium: post.is_premium,
            unlockPrice: Number((post as any).credits_cost) || 0
          };
        })
      );

      return postsWithMedia;
    } catch (error) {
      console.error('Error getting author fan posts:', error);
      throw error;
    }
  },

  /**
   * Create a new fan post
   */
  async createFanPost(postData: CreateFanPostData): Promise<FanPost> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create a fan post.');
      }

      // Create the post
      const { data: post, error: postError } = await supabase
        .from('fan_posts')
        .insert({
          author_id: user.id,
          content: postData.content.trim(),
          theme: postData.theme,
          is_premium: postData.isPremium,
          credits_cost: postData.isPremium ? (postData.creditsCost || 0) : 0
        })
        .select(`
          id,
          content,
          theme,
          is_premium,
          likes_count,
          comments_count,
          created_at,
          author_id
        `)
        .single();

      if (postError) {
        console.error('Error creating fan post:', postError);
        throw new Error('Failed to create fan post. Please try again.');
      }

      // Upload media files if provided
      if (postData.mediaFiles && postData.mediaFiles.length > 0) {
        await this.uploadFanPostMedia(post.id, postData.mediaFiles);
      }

      // Get the complete post with media
      const posts = await this.getFanPostsByAuthor(user.id);
      const createdPost = posts.find(p => p.id === post.id);
      
      if (!createdPost) {
        throw new Error('Failed to retrieve created post.');
      }

      return createdPost;
    } catch (error) {
      console.error('Error creating fan post:', error);
      throw error;
    }
  },

  /**
   * Upload media files for a fan post
   */
  async uploadFanPostMedia(postId: string, files: File[]): Promise<void> {
    try {
      const uploaded: Array<{ url: string; path: string }> = [];
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${postId}/${Date.now()}-${index}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('fan-post-media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('fan-post-media')
          .getPublicUrl(fileName);

        // Save media record to database
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        const { error: mediaError } = await supabase
          .from('fan_post_media')
          .insert({
            post_id: postId,
            media_type: mediaType,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            display_order: index
          });

        if (mediaError) {
          console.error('Error saving media record:', mediaError);
          throw new Error('Failed to save media record.');
        }

        if (mediaType === 'image') {
          uploaded.push({ url: publicUrl, path: fileName });
        }
      });

      await Promise.all(uploadPromises);

      // Record uploaded images for admin moderation
      const { data: { user } } = await supabase.auth.getUser();
      if (user && uploaded.length > 0) {
        await ContentModerationService.recordUploadedImages(user.id, uploaded);
      }
    } catch (error) {
      console.error('Error uploading fan post media:', error);
      throw error;
    }
  },

  /**
   * Like or unlike a fan post
   */
  async toggleLike(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to like posts.');
      }

      // Check if user already liked the post
      const { data: existingLike } = await supabase
        .from('fan_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('fan_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error unliking post:', error);
          throw new Error('Failed to unlike post.');
        }

        return false; // Now unliked
      } else {
        // Like the post
        const { error } = await supabase
          .from('fan_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          console.error('Error liking post:', error);
          throw new Error('Failed to like post.');
        }

        return true; // Now liked
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  /**
   * Get comments for a fan post
   */
  async getFanPostComments(postId: string): Promise<FanPostComment[]> {
    try {
      const { data: comments, error } = await supabase
        .from('fan_post_comments')
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles!fan_post_comments_author_id_fkey (
            name,
            image_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to load comments.');
      }

      return (comments || []).map(comment => ({
        id: comment.id,
        authorName: (comment.profiles as any)?.name || 'Anonymous',
        authorImage: (comment.profiles as any)?.image_url || '',
        content: comment.content,
        date: this.formatRelativeDate(comment.created_at)
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      throw error;
    }
  },

  /**
   * Add a comment to a fan post
   */
  async addComment(postId: string, content: string): Promise<FanPostComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to comment.');
      }

      const { data: comment, error } = await supabase
        .from('fan_post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          author_id,
          profiles!fan_post_comments_author_id_fkey (
            name,
            image_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw new Error('Failed to add comment. Please try again.');
      }

      // Mirror into unified moderation comments table (best-effort)
      try {
        await supabase.from('comments').insert({
          user_id: user.id,
          content_type: 'fan_post',
          content_id: postId,
          comment: content.trim(),
          status: 'active',
          moderation_status: 'pending'
        });
      } catch (e) {
        console.warn('Failed to mirror fan post comment into comments table:', e);
      }

              return {
          id: comment.id,
          authorName: (comment.profiles as any)?.name || 'Anonymous',
          authorImage: (comment.profiles as any)?.image_url || '',
          content: comment.content,
          date: this.formatRelativeDate(comment.created_at)
        };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Delete a fan post
   */
  async deleteFanPost(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to delete posts.');
      }

      const { error } = await supabase
        .from('fan_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) {
        console.error('Error deleting fan post:', error);
        throw new Error('Failed to delete post. Please try again.');
      }

      return true;
    } catch (error) {
      console.error('Error deleting fan post:', error);
      throw error;
    }
  },

  /**
   * Format relative date
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
}; 