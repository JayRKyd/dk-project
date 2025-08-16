import { supabase } from '../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface Transaction {
  id: string;
  userId: string;
  transactionType: 'credit_purchase' | 'credit_usage' | 'payout' | 'refund' | 'gift' | 'subscription';
  amount: number;
  creditsAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentProvider?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface Revenue {
  id: string;
  transactionId: string;
  revenueType: 'platform_fee' | 'subscription_fee' | 'gift_fee';
  amount: number;
  createdAt: Date;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutMethod: string;
  payoutDetails: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
}

interface TransactionResponse {
  transaction: Transaction | null;
  error: PostgrestError | null;
}

interface RevenueResponse {
  revenue: Revenue | null;
  error: PostgrestError | null;
}

interface PayoutResponse {
  payout: Payout | null;
  error: PostgrestError | null;
}

export class FinancialService {
  // Transaction Management
  static async createTransaction(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<TransactionResponse> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([data])
      .select()
      .single();

    return {
      transaction: transaction as Transaction | null,
      error
    };
  }

  static async getTransaction(id: string): Promise<TransactionResponse> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    return {
      transaction: transaction as Transaction | null,
      error
    };
  }

  static async updateTransactionStatus(
    id: string,
    status: Transaction['status']
  ): Promise<TransactionResponse> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    return {
      transaction: transaction as Transaction | null,
      error
    };
  }

  static async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; error: PostgrestError | null }> {
    const offset = (page - 1) * limit;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      transactions: (transactions as Transaction[]) || [],
      error
    };
  }

  // Revenue Tracking
  static async recordRevenue(
    data: Omit<Revenue, 'id' | 'createdAt'>
  ): Promise<RevenueResponse> {
    const { data: revenue, error } = await supabase
      .from('revenue')
      .insert([data])
      .select()
      .single();

    return {
      revenue: revenue as Revenue | null,
      error
    };
  }

  static async getRevenueStats(startDate: Date, endDate: Date) {
    const { data: revenues, error } = await supabase
      .from('revenue')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      return {
        total: 0,
        byType: {},
        error
      };
    }

    const total = revenues?.reduce((sum, rev) => sum + rev.amount, 0) || 0;
    const byType = revenues?.reduce((acc, rev) => {
      acc[rev.revenue_type] = (acc[rev.revenue_type] || 0) + rev.amount;
      return acc;
    }, {} as Record<Revenue['revenueType'], number>);

    return {
      total,
      byType,
      error: null
    };
  }

  // Payout Management
  static async createPayout(
    data: Omit<Payout, 'id' | 'createdAt' | 'processedAt'>
  ): Promise<PayoutResponse> {
    const { data: payout, error } = await supabase
      .from('payouts')
      .insert([data])
      .select()
      .single();

    return {
      payout: payout as Payout | null,
      error
    };
  }

  static async updatePayoutStatus(
    id: string,
    status: Payout['status']
  ): Promise<PayoutResponse> {
    const updates: Partial<Payout> = {
      status,
      ...(status === 'completed' ? { processed_at: new Date().toISOString() } : {})
    };

    const { data: payout, error } = await supabase
      .from('payouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return {
      payout: payout as Payout | null,
      error
    };
  }

  static async getPayoutsByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ payouts: Payout[]; error: PostgrestError | null }> {
    const offset = (page - 1) * limit;

    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      payouts: (payouts as Payout[]) || [],
      error
    };
  }

  // Admin Functions
  static async getAllTransactions(
    page: number = 1,
    limit: number = 20,
    filters: Partial<{
      status: Transaction['status'];
      type: Transaction['transactionType'];
      startDate: Date;
      endDate: Date;
    }> = {}
  ) {
    const offset = (page - 1) * limit;
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('transaction_type', filters.type);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      transactions: (data as Transaction[]) || [],
      total: count || 0,
      error
    };
  }

  static async getAllPayouts(
    page: number = 1,
    limit: number = 20,
    filters: Partial<{
      status: Payout['status'];
      startDate: Date;
      endDate: Date;
    }> = {}
  ) {
    const offset = (page - 1) * limit;
    let query = supabase
      .from('payouts')
      .select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return {
      payouts: (data as Payout[]) || [],
      total: count || 0,
      error
    };
  }

  // Earnings summary (credits-based), via RPC
  static async getEarningsSummary(userId: string): Promise<{
    credits_from_gifts: number; credits_from_fanposts: number; credits_payouts: number; credits_available: number; last_payout_at: string | null; error: PostgrestError | null;
  }> {
    const { data, error } = await supabase.rpc('get_earnings_summary', { p_user_id: userId });
    return {
      credits_from_gifts: data?.[0]?.credits_from_gifts || 0,
      credits_from_fanposts: data?.[0]?.credits_from_fanposts || 0,
      credits_payouts: data?.[0]?.credits_payouts || 0,
      credits_available: data?.[0]?.credits_available || 0,
      last_payout_at: data?.[0]?.last_payout_at || null,
      error: error || null,
    };
  }

  // Request payout (credits), returns payout id
  static async requestPayout(userId: string, amountCredits: number, method: string, details: Record<string, any> = {}): Promise<{ id?: string; error: PostgrestError | null }> {
    const { data, error } = await supabase.rpc('request_payout', {
      p_user_id: userId,
      p_amount_credits: amountCredits,
      p_method: method,
      p_details: details,
    });
    return { id: data as string | undefined, error: error || null };
  }

  // Admin actions
  static async approvePayout(payoutId: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.rpc('admin_approve_payout', { p_payout_id: payoutId });
    return { error };
  }
  static async markPayoutCompleted(payoutId: string, paymentId?: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.rpc('admin_mark_payout_completed', { p_payout_id: payoutId, p_payment_id: paymentId || null });
    return { error };
  }
  static async markPayoutFailed(payoutId: string, reason: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase.rpc('admin_mark_payout_failed', { p_payout_id: payoutId, p_reason: reason });
    return { error };
  }
} 