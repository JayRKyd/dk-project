import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface ContentReport {
  id: string;
  reporter_id: string;
  content_type: 'media' | 'comment' | 'review' | 'fan_post' | 'gift';
  content_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  action_taken: string | null;
  notes: string | null;
}

export interface MediaItem {
  id: string;
  user_id: string;
  media_type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  status: 'active' | 'hidden' | 'deleted';
  moderation_status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  moderation_reason: string | null;
}

export interface Comment {
  id: string;
  user_id: string;
  content_type: 'photo' | 'fan_post' | 'gift' | 'review';
  content_id: string;
  comment: string;
  status: 'active' | 'hidden' | 'deleted';
  moderation_status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  moderation_reason: string | null;
}

export class ContentModerationService {
  /**
   * Get all content reports with pagination and filters
   */
  static async getContentReports(
    page: number = 1,
    pageSize: number = 20,
    filters: {
      status?: string;
      content_type?: string;
      start_date?: Date;
      end_date?: Date;
    } = {}
  ): Promise<{
    reports: ContentReport[];
    error: PostgrestError | null;
  }> {
    let query = supabase
      .from('content_reports')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date.toISOString());
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date.toISOString());
    }

    // Apply pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: reports, error } = await query;

    return {
      reports: reports as ContentReport[] || [],
      error
    };
  }

  /**
   * Get all media items with pagination and filters
   */
  static async getMediaItems(
    page: number = 1,
    pageSize: number = 20,
    filters: {
      status?: string;
      media_type?: string;
      user_id?: string;
      moderation_status?: string;
    } = {}
  ): Promise<{
    items: MediaItem[];
    error: PostgrestError | null;
  }> {
    let query = supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.media_type) {
      query = query.eq('media_type', filters.media_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.moderation_status) {
      query = query.eq('moderation_status', filters.moderation_status);
    }

    // Apply pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: items, error } = await query;

    return {
      items: items as MediaItem[] || [],
      error
    };
  }

  /**
   * Get all comments with pagination and filters
   */
  static async getComments(
    page: number = 1,
    pageSize: number = 20,
    filters: {
      status?: string;
      content_type?: string;
      user_id?: string;
      moderation_status?: string;
    } = {}
  ): Promise<{
    comments: Comment[];
    error: PostgrestError | null;
  }> {
    let query = supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.moderation_status) {
      query = query.eq('moderation_status', filters.moderation_status);
    }

    // Apply pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: comments, error } = await query;

    return {
      comments: comments as Comment[] || [],
      error
    };
  }

  /**
   * Report content for moderation
   */
  static async reportContent(
    contentType: string,
    contentId: string,
    reason: string
  ): Promise<{
    report_id: string | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await supabase.rpc('report_content', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_reason: reason
    });

    return {
      report_id: data || null,
      error
    };
  }

  /**
   * Moderate content (approve, reject, hide, or delete)
   */
  static async moderateContent(
    contentType: string,
    contentId: string,
    action: 'approve' | 'reject' | 'hide' | 'delete',
    reason: string
  ): Promise<{
    error: PostgrestError | null;
  }> {
    const { error } = await supabase.rpc('moderate_content', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_action: action,
      p_reason: reason
    });

    return { error };
  }
} 