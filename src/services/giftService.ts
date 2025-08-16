import { supabase } from '../lib/supabase';

export interface GiftReply {
  id: string;
  gift_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export interface GiftWithReplies {
  id: string;
  recipient: {
    name: string;
    imageUrl: string;
  };
  type: {
    name: string;
    emoji: string;
    credits: number;
  };
  message?: string;
  replies: GiftReply[];
  date: string;
  time: string;
  status?: 'pending' | 'collected';
  collectedAt?: string | null;
}

export const giftService = {
  /**
   * Collect a gift (lady action) with membership gating handled in RPC
   */
  async collectGift(giftId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in.');

    const { error } = await supabase.rpc('collect_gift', { p_gift_id: giftId });
    if (error) {
      // surface friendly message from RPC errors
      const message = (error as any)?.message || 'Failed to collect gift';
      throw new Error(message);
    }
  },
  /**
   * Send a reply to a gift
   */
  async sendGiftReply(giftId: string, message: string): Promise<GiftReply> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to send a gift reply.');
      }

      // Verify the user received this gift
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .select('recipient_id')
        .eq('id', giftId)
        .single();

      if (giftError || !gift) {
        throw new Error('Gift not found.');
      }

      if (gift.recipient_id !== user.id) {
        throw new Error('You can only reply to gifts you received.');
      }

      // Insert the reply
      const { data: reply, error: insertError } = await supabase
        .from('gift_replies')
        .insert({
          gift_id: giftId,
          sender_id: user.id,
          message: message.trim()
        })
        .select(`
          id,
          gift_id,
          sender_id,
          message,
          created_at,
          updated_at
        `)
        .single();

      if (insertError) {
        console.error('Error inserting gift reply:', insertError);
        throw new Error('Failed to send gift reply. Please try again.');
      }

      // Get sender name
      const { data: sender } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      return {
        ...reply,
        sender_name: sender?.username || 'Anonymous'
      };
    } catch (error) {
      console.error('Error sending gift reply:', error);
      throw error;
    }
  },

  /**
   * Get all replies for a specific gift
   */
  async getGiftReplies(giftId: string): Promise<GiftReply[]> {
    try {
      const { data: replies, error } = await supabase
        .from('gift_replies')
        .select(`
          id,
          gift_id,
          sender_id,
          message,
          created_at,
          updated_at,
          users!gift_replies_sender_id_fkey (
            username
          )
        `)
        .eq('gift_id', giftId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching gift replies:', error);
        throw new Error('Failed to load gift replies.');
      }

      return (replies || []).map(reply => ({
        id: reply.id,
        gift_id: reply.gift_id,
        sender_id: reply.sender_id,
        sender_name: (reply.users as any)?.username || 'Anonymous',
        message: reply.message,
        created_at: reply.created_at,
        updated_at: reply.updated_at
      }));
    } catch (error) {
      console.error('Error getting gift replies:', error);
      throw error;
    }
  },

  /**
   * Update a gift reply
   */
  async updateGiftReply(replyId: string, message: string): Promise<GiftReply> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to update a gift reply.');
      }

      const { data: reply, error } = await supabase
        .from('gift_replies')
        .update({
          message: message.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', replyId)
        .eq('sender_id', user.id) // Ensure user owns this reply
        .select(`
          id,
          gift_id,
          sender_id,
          message,
          created_at,
          updated_at
        `)
        .single();

      if (error) {
        console.error('Error updating gift reply:', error);
        throw new Error('Failed to update gift reply. Please try again.');
      }

      // Get sender name
      const { data: sender } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      return {
        ...reply,
        sender_name: sender?.username || 'Anonymous'
      };
    } catch (error) {
      console.error('Error updating gift reply:', error);
      throw error;
    }
  },

  /**
   * Delete a gift reply
   */
  async deleteGiftReply(replyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to delete a gift reply.');
      }

      const { error } = await supabase
        .from('gift_replies')
        .delete()
        .eq('id', replyId)
        .eq('sender_id', user.id); // Ensure user owns this reply

      if (error) {
        console.error('Error deleting gift reply:', error);
        throw new Error('Failed to delete gift reply. Please try again.');
      }

      return true;
    } catch (error) {
      console.error('Error deleting gift reply:', error);
      throw error;
    }
  },

  /**
   * Get gifts with their replies for a user
   */
  async getGiftsWithReplies(userId: string, type: 'sent' | 'received'): Promise<GiftWithReplies[]> {
    try {
      const { data: gifts, error } = await supabase
        .from('gifts')
        .select(`
          id,
          sender_id,
          recipient_id,
          gift_type,
          credits_cost,
          message,
          created_at,
          status,
          collected_at,
          users!gifts_sender_id_fkey (
            username
          )
        `)
        .eq(type === 'sent' ? 'sender_id' : 'recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gifts:', error);
        throw new Error('Failed to load gifts.');
      }

      // Fetch recipient profiles in batch (needed for name/image)
      const recipientIds = Array.from(new Set((gifts || []).map(g => g.recipient_id).filter(Boolean)));
      let recipientProfileMap = new Map<string, { name: string; image_url?: string }>();
      if (recipientIds.length > 0) {
        const { data: profileRows } = await supabase
          .from('profiles')
          .select('user_id, name, image_url')
          .in('user_id', recipientIds as string[]);
        (profileRows || []).forEach((p: any) => {
          recipientProfileMap.set(p.user_id, { name: p.name, image_url: p.image_url });
        });
      }

      // Get replies for each gift
      const giftsWithReplies = await Promise.all(
        (gifts || []).map(async (gift) => {
          const replies = await this.getGiftReplies(gift.id);
          
          return {
            id: gift.id,
            recipient: {
              name: recipientProfileMap.get(gift.recipient_id)?.name || 'Unknown',
              imageUrl: recipientProfileMap.get(gift.recipient_id)?.image_url || ''
            },
            type: {
              name: gift.gift_type,
              emoji: this.getGiftEmoji(gift.gift_type),
              credits: gift.credits_cost
            },
            message: gift.message,
            replies,
            date: new Date(gift.created_at).toLocaleDateString(),
            time: new Date(gift.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            status: (gift.status as 'pending' | 'collected') || 'pending',
            collectedAt: gift.collected_at || null
          };
        })
      );

      return giftsWithReplies;
    } catch (error) {
      console.error('Error getting gifts with replies:', error);
      throw error;
    }
  },

  /**
   * Get gift emoji by type
   */
  getGiftEmoji(giftType: string): string {
    const emojiMap: Record<string, string> = {
      'wink': '😉',
      'kiss': '💋',
      'flower': '🌸',
      'heart': '❤️',
      'star': '⭐',
      'rose': '🌹',
      'diamond': '💎',
      'crown': '👑'
    };
    
    return emojiMap[giftType.toLowerCase()] || '🎁';
  }
}; 