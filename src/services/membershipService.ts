import { supabase } from '../lib/supabase';

export interface ClubMembership {
  id: string;
  user_id?: string; // actual schema uses user_id
  club_id?: string; // keep optional for compatibility
  tier: 'BASIC' | 'PRO' | 'PREMIUM';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipProgress {
  days_remaining: number;
  days_total: number;
  percentage_used: number;
  percentage_remaining: number;
  is_expiring_soon: boolean;
  is_expired: boolean;
}

export const membershipService = {
  // Get current membership for a club
  async getCurrentMembership(clubId: string): Promise<ClubMembership | null> {
    // clubId here represents the clubs.id; we need the owning user_id
    const { data: clubRow, error: clubErr } = await supabase
      .from('clubs')
      .select('user_id')
      .eq('id', clubId)
      .single();
    if (clubErr) throw clubErr;

    const { data, error } = await supabase
      .from('club_memberships')
      .select('*')
      .eq('user_id', clubRow.user_id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return (data as any[])?.[0] || null;
  },

  // Get days remaining until membership expires
  async getDaysRemaining(clubId: string): Promise<number> {
    const membership = await this.getCurrentMembership(clubId);
    if (!membership) return 0;

    const today = new Date();
    const endDate = new Date(membership.end_date);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  // Get membership progress
  async getMembershipProgress(clubId: string): Promise<MembershipProgress> {
    const membership = await this.getCurrentMembership(clubId);
    
    if (!membership) {
      return {
        days_remaining: 0,
        days_total: 0,
        percentage_used: 100,
        percentage_remaining: 0,
        is_expiring_soon: true,
        is_expired: true
      };
    }

    const today = new Date();
    const startDate = new Date(membership.start_date);
    const endDate = new Date(membership.end_date);
    
    const totalTime = endDate.getTime() - startDate.getTime();
    const remainingTime = endDate.getTime() - today.getTime();
    const usedTime = today.getTime() - startDate.getTime();
    
    const daysTotal = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
    const daysUsed = Math.max(0, Math.ceil(usedTime / (1000 * 60 * 60 * 24)));
    
    const percentageUsed = totalTime > 0 ? Math.min(100, (daysUsed / daysTotal) * 100) : 100;
    const percentageRemaining = 100 - percentageUsed;
    
    return {
      days_remaining: daysRemaining,
      days_total: daysTotal,
      percentage_used: Math.round(percentageUsed),
      percentage_remaining: Math.round(percentageRemaining),
      is_expiring_soon: daysRemaining <= 7 && daysRemaining > 0,
      is_expired: daysRemaining <= 0
    };
  },

  // Create a new membership
  async createMembership(
    clubId: string,
    tier: 'BASIC' | 'PRO' | 'PREMIUM',
    startDate: string,
    endDate: string,
    autoRenewal = false,
    paymentMethod?: string
  ): Promise<ClubMembership> {
    const { data, error } = await supabase
      .from('club_memberships')
      .insert({
        club_id: clubId,
        tier,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        auto_renewal: autoRenewal,
        payment_method: paymentMethod
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update membership status
  async updateMembershipStatus(membershipId: string, status: 'active' | 'expired' | 'cancelled'): Promise<ClubMembership> {
    const { data, error } = await supabase
      .from('club_memberships')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', membershipId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Check if membership allows advertisements
  async canShowAdvertisements(clubId: string): Promise<boolean> {
    const membership = await this.getCurrentMembership(clubId);
    if (!membership) return false;
    
    const progress = await this.getMembershipProgress(clubId);
    return !progress.is_expired && membership.status === 'active';
  },

  // Get membership tier benefits
  getTierBenefits(tier: 'BASIC' | 'PRO' | 'PREMIUM'): {
    max_ladies: number;
    advertisement_slots: number;
    priority_support: boolean;
    analytics_access: boolean;
    custom_branding: boolean;
  } {
    const benefits = {
      BASIC: {
        max_ladies: 10,
        advertisement_slots: 1,
        priority_support: false,
        analytics_access: false,
        custom_branding: false
      },
      PRO: {
        max_ladies: 25,
        advertisement_slots: 3,
        priority_support: true,
        analytics_access: true,
        custom_branding: false
      },
      PREMIUM: {
        max_ladies: -1, // unlimited
        advertisement_slots: 10,
        priority_support: true,
        analytics_access: true,
        custom_branding: true
      }
    };
    
    return benefits[tier];
  }
}; 