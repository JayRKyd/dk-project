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
} 