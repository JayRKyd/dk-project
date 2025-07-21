import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Booking {
  id: string;
  client_id: string;
  profile_id: string;
  date: string;
  time: string;
  duration: string;
  location_type: string;
  address: string;
  message: string;
  total_cost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  created_at: string;
  updated_at: string;
  client?: {
    username: string;
    email: string;
  };
}

export interface Availability {
  id: string;
  user_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface BlockedSlot {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  reason?: string;
  created_at: string;
}

/**
 * Get upcoming bookings for a lady
 * @param userId The lady's user ID
 * @param limit Maximum number of bookings to return
 * @returns Array of upcoming bookings
 */
export const getUpcomingBookings = async (
  userId: string,
  limit: number = 3
): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        client:client_id (
          username,
          email
        )
      `)
      .eq('profile_id', userId)
      .in('status', ['pending', 'confirmed'])
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return [];
  }
};

/**
 * Get booking statistics for a lady
 * @param userId The lady's user ID
 * @returns Booking statistics
 */
export const getBookingStats = async (userId: string) => {
  try {
    // Get total earnings
    const { data: earningsData, error: earningsError } = await supabase
      .from('bookings')
      .select('total_cost')
      .eq('profile_id', userId)
      .in('status', ['confirmed', 'completed']);

    if (earningsError) throw earningsError;

    // Get next bookings count
    const { count: nextBookingsCount, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId)
      .in('status', ['pending', 'confirmed'])
      .gte('date', new Date().toISOString().split('T')[0]);

    if (countError) throw countError;

    // Calculate total earnings
    const totalEarnings = earningsData?.reduce(
      (sum, booking) => sum + (booking.total_cost || 0),
      0
    ) || 0;

    return {
      earnings: totalEarnings,
      nextBookings: nextBookingsCount || 0
    };
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return {
      earnings: 0,
      nextBookings: 0
    };
  }
};

/**
 * Set a lady's weekly availability
 * @param userId The lady's user ID
 * @param availabilityData Array of availability objects
 * @returns Success status
 */
export const setWeeklyAvailability = async (
  userId: string,
  availabilityData: Omit<Availability, 'id' | 'user_id' | 'created_at'>[]
): Promise<boolean> => {
  try {
    // Delete existing availability
    const { error: deleteError } = await supabase
      .from('availability')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Insert new availability
    const { error: insertError } = await supabase
      .from('availability')
      .insert(
        availabilityData.map(item => ({
          user_id: userId,
          ...item
        }))
      );

    if (insertError) throw insertError;
    return true;
  } catch (error) {
    console.error('Error setting weekly availability:', error);
    return false;
  }
};

/**
 * Block specific time slots
 * @param userId The lady's user ID
 * @param startTime Start time of the blocked slot
 * @param endTime End time of the blocked slot
 * @param reason Optional reason for blocking
 * @returns Success status
 */
export const blockTimeSlot = async (
  userId: string,
  startTime: string,
  endTime: string,
  reason?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('blocked_slots')
      .insert({
        user_id: userId,
        start_time: startTime,
        end_time: endTime,
        reason
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error blocking time slot:', error);
    return false;
  }
};

/**
 * Update a booking status
 * @param bookingId The booking ID
 * @param status New status
 * @returns Success status
 */
export const updateBookingStatus = async (
  bookingId: string,
  status: Booking['status']
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating booking status:', error);
    return false;
  }
};
