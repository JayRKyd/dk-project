import { supabase } from '../lib/supabase';

// Types for club settings data
export interface ClubPhoto {
  id: string;
  club_id: string;
  photo_url: string;
  photo_type: 'logo' | 'cover' | 'gallery' | 'facility';
  caption?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubFacility {
  id: string;
  club_id: string;
  facility_name: string;
  is_available: boolean;
  description?: string;
  category: 'entertainment' | 'amenities' | 'services' | 'rooms';
  created_at: string;
  updated_at: string;
}

export interface ClubHours {
  id: string;
  club_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  is_open: boolean;
  open_time?: string;
  close_time?: string;
  is_24_hours: boolean;
  special_note?: string;
  created_at: string;
  updated_at: string;
}

export interface ClubService {
  id: string;
  club_id: string;
  service_name: string;
  service_type: 'entrance' | 'drink' | 'room' | 'special' | 'membership';
  price?: number;
  currency: string;
  duration_minutes?: number;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const clubSettingsService = {
  // Club Photos
  async getClubPhotos(clubId: string): Promise<ClubPhoto[]> {
    const { data, error } = await supabase
      .from('club_photos')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async addClubPhoto(clubId: string, photoData: Omit<ClubPhoto, 'id' | 'club_id' | 'created_at' | 'updated_at'>): Promise<ClubPhoto> {
    const { data, error } = await supabase
      .from('club_photos')
      .insert({
        club_id: clubId,
        ...photoData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClubPhoto(photoId: string, updates: Partial<ClubPhoto>): Promise<ClubPhoto> {
    const { data, error } = await supabase
      .from('club_photos')
      .update(updates)
      .eq('id', photoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClubPhoto(photoId: string): Promise<void> {
    const { error } = await supabase
      .from('club_photos')
      .update({ is_active: false })
      .eq('id', photoId);

    if (error) throw error;
  },

  // Club Facilities
  async getClubFacilities(clubId: string): Promise<ClubFacility[]> {
    const { data, error } = await supabase
      .from('club_facilities')
      .select('*')
      .eq('club_id', clubId)
      .order('facility_name');

    if (error) throw error;
    return data || [];
  },

  async updateClubFacilities(clubId: string, facilities: Array<{ facility_name: string; is_available: boolean; category: string }>): Promise<void> {
    // Delete existing facilities for this club
    await supabase
      .from('club_facilities')
      .delete()
      .eq('club_id', clubId);

    // Insert new facilities
    const facilitiesWithClubId = facilities.map(facility => ({
      club_id: clubId,
      ...facility
    }));

    const { error } = await supabase
      .from('club_facilities')
      .insert(facilitiesWithClubId);

    if (error) throw error;
  },

  // Club Operating Hours
  async getClubHours(clubId: string): Promise<ClubHours[]> {
    const { data, error } = await supabase
      .from('club_operating_hours')
      .select('*')
      .eq('club_id', clubId)
      .order('day_of_week');

    if (error) throw error;
    return data || [];
  },

  async updateClubHours(clubId: string, hours: Array<Omit<ClubHours, 'id' | 'club_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    // Delete existing hours for this club
    await supabase
      .from('club_operating_hours')
      .delete()
      .eq('club_id', clubId);

    // Insert new hours
    const hoursWithClubId = hours.map(hour => ({
      club_id: clubId,
      ...hour
    }));

    const { error } = await supabase
      .from('club_operating_hours')
      .insert(hoursWithClubId);

    if (error) throw error;
  },

  // Club Services
  async getClubServices(clubId: string): Promise<ClubService[]> {
    const { data, error } = await supabase
      .from('club_services')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  async updateClubServices(clubId: string, services: Array<Omit<ClubService, 'id' | 'club_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    // Delete existing services for this club
    await supabase
      .from('club_services')
      .delete()
      .eq('club_id', clubId);

    // Insert new services
    const servicesWithClubId = services.map(service => ({
      club_id: clubId,
      ...service
    }));

    const { error } = await supabase
      .from('club_services')
      .insert(servicesWithClubId);

    if (error) throw error;
  },

  // Club Promotions
  async getClubPromotions(clubId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('club_promotions')
      .select('*')
      .eq('club_id', clubId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createClubPromotion(clubId: string, promotionData: any): Promise<any> {
    const { data, error } = await supabase
      .from('club_promotions')
      .insert({
        club_id: clubId,
        ...promotionData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Club Verification Documents
  async getClubVerificationDocuments(clubId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('club_verification_documents')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async uploadVerificationDocument(clubId: string, documentData: any): Promise<any> {
    const { data, error } = await supabase
      .from('club_verification_documents')
      .insert({
        club_id: clubId,
        ...documentData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}; 