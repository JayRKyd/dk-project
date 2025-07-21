import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

export interface CreditPackage {
  id: string;
  name: string;
  creditsAmount: number;
  price: number;
  isFeatured: boolean;
  isActive: boolean;
}

export interface UserCredits {
  balance: number;
  totalPurchased: number;
  totalSpent: number;
  lastPurchaseAt?: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  transactionType: 'purchase' | 'spend' | 'refund' | 'admin_adjustment';
  amount: number;
  packageId?: string;
  paymentReference?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CreditSummary {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  pendingWithdrawals: number;
  availableForWithdrawal: number;
}

export class CreditService {
  // Credit Package Management
  static async getAvailablePackages(): Promise<CreditPackage[]> {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('credits_amount', { ascending: true });

    if (error) throw error;
    return data.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      creditsAmount: pkg.credits_amount,
      price: pkg.price,
      isFeatured: pkg.is_featured,
      isActive: pkg.is_active
    }));
  }

  // User Credits Management
  static async getUserCredits(userId: string): Promise<UserCredits> {
    const { data, error } = await supabase
      .rpc('get_user_credits', { p_user_id: userId });

    if (error) throw error;
    return {
      balance: data.balance || 0,
      totalPurchased: data.total_purchased || 0,
      totalSpent: data.total_spent || 0,
      lastPurchaseAt: data.last_purchase_at
    };
  }

  // Credit History
  static async getCreditHistory(userId: string, page: number = 1): Promise<CreditTransaction[]> {
    const pageSize = 10;
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return data.map(tx => ({
      id: tx.id,
      userId: tx.user_id,
      transactionType: tx.transaction_type,
      amount: tx.amount,
      packageId: tx.package_id,
      paymentReference: tx.payment_reference,
      status: tx.status,
      metadata: tx.metadata,
      createdAt: new Date(tx.created_at)
    }));
  }

  // Club Credit Management
  static async getClubCreditSummary(clubId: string): Promise<CreditSummary> {
    const { data, error } = await supabase
      .rpc('get_club_credit_summary', { p_club_id: clubId });

    if (error) throw error;
    return {
      balance: data.balance || 0,
      totalEarned: data.total_earned || 0,
      totalSpent: data.total_spent || 0,
      pendingWithdrawals: data.pending_withdrawals || 0,
      availableForWithdrawal: data.available_for_withdrawal || 0
    };
  }

  static async spendCredits(userId: string, amount: number, description: string): Promise<void> {
    const { error } = await supabase
      .rpc('spend_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description
      });

    if (error) throw error;
  }

  static async addCredits(userId: string, amount: number, description: string): Promise<void> {
    const { error } = await supabase
      .rpc('add_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_description: description
      });

    if (error) throw error;
  }

  static async transferCredits(fromUserId: string, toUserId: string, amount: number): Promise<void> {
    const { error } = await supabase
      .rpc('transfer_credits', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_amount: amount
      });

    if (error) throw error;
  }

  static async withdrawCredits(userId: string, amount: number): Promise<void> {
    const { error } = await supabase
      .rpc('withdraw_credits', {
        p_user_id: userId,
        p_amount: amount
      });

    if (error) throw error;
  }

  // Credit Purchase Flow
  static async initiatePurchase(userId: string, packageId: string): Promise<{ transactionId: string }> {
    // Create a pending transaction
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'purchase',
        package_id: packageId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { transactionId: data.id };
  }

  // TODO: Implement when payment provider is selected
  static async processPurchase(transactionId: string, paymentDetails: any): Promise<void> {
    throw new Error('Payment processing not yet implemented');
  }

  // Internal credit management
  static async updateUserCredits(
    userId: string,
    amount: number,
    type: 'add' | 'subtract',
    metadata?: Record<string, any>
  ): Promise<void> {
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: userId,
        transaction_type: type === 'add' ? 'admin_adjustment' : 'spend',
        amount: Math.abs(amount),
        status: 'completed',
        metadata,
      });

    if (transactionError) throw transactionError;

    // Use RPC function to handle atomic updates
    const { error: updateError } = await supabase.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: type === 'add' ? amount : -amount,
      p_is_purchase: type === 'add'
    });

    if (updateError) throw updateError;
  }

  // Admin functions
  static async createCreditPackage(packageData: Omit<CreditPackage, 'id'>): Promise<CreditPackage> {
    const { data, error } = await supabase
      .from('credit_packages')
      .insert(packageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCreditPackage(id: string, packageData: Partial<CreditPackage>): Promise<CreditPackage> {
    const { data, error } = await supabase
      .from('credit_packages')
      .update(packageData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async togglePackageStatus(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('credit_packages')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) throw error;
  }
} 