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
   * Summary of comments/reviews by user with counts
   */
  static async getCommentSummaryByUser(
    page: number = 1,
    pageSize: number = 25,
    filters: { moderation_status?: string; content_type?: string } = {}
  ): Promise<{ rows: { user_id: string; username: string; email: string; role: string; count: number }[]; total: number; error: PostgrestError | null }> {
    // Fetch a window of recent comments joined to users for display
    let query = supabase
      .from('comments')
      .select('user_id, users!inner(username, email, role)')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (filters.moderation_status) query = query.eq('moderation_status', filters.moderation_status);
    if (filters.content_type) query = query.eq('content_type', filters.content_type);

    const { data, error } = await query;
    if (error) return { rows: [], total: 0, error };

    const map = new Map<string, { user_id: string; username: string; email: string; role: string; count: number }>();
    data?.forEach((row: any) => {
      const key = row.user_id;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { user_id: row.user_id, username: row.users?.username || '—', email: row.users?.email || '', role: row.users?.role || '', count: 1 });
    });

    // Also aggregate reviews by author_id
    let rQuery = supabase
      .from('reviews')
      .select('author_id, users!inner(username, email, role)')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data: rData, error: rErr } = await rQuery;
    if (rErr) return { rows: [], total: 0, error: rErr };
    rData?.forEach((row: any) => {
      const key = row.author_id;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { user_id: row.author_id, username: row.users?.username || '—', email: row.users?.email || '', role: row.users?.role || '', count: 1 });
    });

    // Also aggregate gift replies by sender_id
    let gQuery = supabase
      .from('gift_replies')
      .select('sender_id, users!inner(username, email, role)')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data: gData, error: gErr } = await gQuery;
    if (gErr) return { rows: [], total: 0, error: gErr };
    gData?.forEach((row: any) => {
      const key = row.sender_id;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { user_id: row.sender_id, username: row.users?.username || '—', email: row.users?.email || '', role: row.users?.role || '', count: 1 });
    });

    const rows = Array.from(map.values());
    return { rows, total: rows.length, error: null };
  }
  /**
   * Get compact list of media grouped by user
   */
  static async getMediaSummaryByUser(
    page: number = 1,
    pageSize: number = 25,
    filters: { media_type?: string; moderation_status?: string } = {}
  ): Promise<{ rows: { user_id: string; username: string; count: number; latest_created_at: string }[]; error: PostgrestError | null; }> {
    // Build a view-like aggregation using RPC via SQL
    let base = supabase
      .from('media_items')
      .select('user_id, created_at, users!inner(username)')
      .order('created_at', { ascending: false });

    if (filters.media_type) base = base.eq('media_type', filters.media_type);
    if (filters.moderation_status) base = base.eq('moderation_status', filters.moderation_status);

    // Fetch a window of recent items then aggregate client-side (keeps query simple without views)
    const { data, error } = await base.range((page - 1) * pageSize, page * pageSize - 1);
    if (error) return { rows: [], error };

    const map = new Map<string, { user_id: string; username: string; count: number; latest_created_at: string }>();
    data?.forEach((row: any) => {
      const key = row.user_id;
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if (new Date(row.created_at) > new Date(existing.latest_created_at)) {
          existing.latest_created_at = row.created_at;
        }
      } else {
        map.set(key, { user_id: row.user_id, username: row.users?.username || '—', count: 1, latest_created_at: row.created_at });
      }
    });

    return { rows: Array.from(map.values()), error: null };
  }
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
    // Base: comments table
    let base = supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) base = base.eq('status', filters.status);
    if (filters.content_type) base = base.eq('content_type', filters.content_type);
    if (filters.user_id) base = base.eq('user_id', filters.user_id);
    if (filters.moderation_status) base = base.eq('moderation_status', filters.moderation_status);

    base = base.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: commentRows, error: cErr } = await base;
    if (filters.content_type && filters.content_type !== 'gift') {
      return { comments: (commentRows as Comment[]) || [], error: cErr };
    }

    // If viewing gifts, include mapped gift replies
    let gq = supabase
      .from('gift_replies')
      .select('id, gift_id, sender_id, message, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (filters.user_id) gq = gq.eq('sender_id', filters.user_id);
    // pagination: reuse same window
    gq = gq.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: giftReplyRows, error: gErr } = await gq;

    const mappedGiftReplies: Comment[] = (giftReplyRows || []).map((gr: any) => ({
      id: gr.id,
      user_id: gr.sender_id,
      content_type: 'gift',
      content_id: gr.gift_id,
      comment: gr.message,
      status: 'active',
      moderation_status: 'approved',
      created_at: gr.created_at,
      updated_at: gr.updated_at,
      moderated_at: null,
      moderated_by: null,
      moderation_reason: null,
    }));

    return {
      comments: ([...(commentRows as any[] || []), ...mappedGiftReplies]) as Comment[],
      error: cErr || gErr || null,
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

  /** Delete a gift reply */
  static async deleteGiftReply(replyId: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.from('gift_replies').delete().eq('id', replyId);
    return { error };
  }

  /**
   * Record newly uploaded images to media_items for admin moderation
   */
  static async recordUploadedImages(
    userId: string,
    uploads: Array<{ url: string; path: string }>
  ): Promise<{ error: PostgrestError | null }> {
    if (!uploads || uploads.length === 0) return { error: null };
    const rows = uploads.map(u => ({
      user_id: userId,
      media_type: 'image',
      url: u.url,
      thumbnail_url: null,
      status: 'active',
      moderation_status: 'pending'
    }));

    const { error } = await supabase.from('media_items').insert(rows);
    return { error };
  }
} 