import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clubService, ClubProfile } from '../services/clubService';
import { calculateProfileCompletion } from '../utils/profileCompletion';

export interface ClubSettingsFormData {
  // Club Info
  name: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  license_number: string;
  
  // Location
  address: string;
  
  // Images
  logo_url: string;
  cover_photo_url: string;
}

const defaultFormData: ClubSettingsFormData = {
  name: '',
  description: '',
  website: '',
  email: '',
  phone: '',
  license_number: '',
  address: '',
  logo_url: '',
  cover_photo_url: ''
};

export const useClubSettings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ClubSettingsFormData>(defaultFormData);
  const [clubProfile, setClubProfile] = useState<ClubProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Convert ClubProfile to form data
  const profileToFormData = useCallback((profile: ClubProfile): ClubSettingsFormData => {
    return {
      name: profile.name || '',
      description: profile.description || '',
      website: profile.website || '',
      email: profile.email || '',
      phone: profile.phone || '',
      license_number: profile.license_number || '',
      address: profile.address || '',
      logo_url: profile.logo_url || '',
      cover_photo_url: profile.cover_photo_url || ''
    };
  }, []);

  // Convert form data to ClubProfile updates
  const formDataToProfileUpdates = useCallback((data: ClubSettingsFormData): Partial<ClubProfile> => {
    return {
      name: data.name,
      description: data.description,
      website: data.website,
      email: data.email,
      phone: data.phone,
      license_number: data.license_number,
      address: data.address,
      logo_url: data.logo_url,
      cover_photo_url: data.cover_photo_url
    };
  }, []);

  // Load club profile data
  const loadClubProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const profile = await clubService.getClubProfile(user.id);
      setClubProfile(profile);
      
      if (profile) {
        setFormData(profileToFormData(profile));
      }
    } catch (err) {
      console.error('Error loading club profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load club profile');
    } finally {
      setLoading(false);
    }
  }, [user?.id, profileToFormData]);

  // Create club profile if it doesn't exist
  const createClubProfile = useCallback(async (data: ClubSettingsFormData) => {
    if (!user?.id) return;

    setSaving(true);
    setError(null);

    try {
      const profileData = formDataToProfileUpdates(data);
      const newProfile = await clubService.createClubProfile(user.id, profileData);
      setClubProfile(newProfile);
      setSuccessMessage('Club profile created successfully!');
      return newProfile;
    } catch (err) {
      console.error('Error creating club profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create club profile');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id, formDataToProfileUpdates]);

  // Update club profile
  const updateClubProfile = useCallback(async (data: ClubSettingsFormData) => {
    if (!user?.id || !clubProfile) return;

    setSaving(true);
    setError(null);

    try {
      const profileUpdates = formDataToProfileUpdates(data);
      const updatedProfile = await clubService.updateClubProfile(user.id, profileUpdates);
      setClubProfile(updatedProfile);
      setSuccessMessage('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
      return updatedProfile;
    } catch (err) {
      console.error('Error updating club profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id, clubProfile, formDataToProfileUpdates]);

  // Save settings (create or update)
  const saveSettings = useCallback(async (data: ClubSettingsFormData) => {
    if (clubProfile) {
      return await updateClubProfile(data);
    } else {
      return await createClubProfile(data);
    }
  }, [clubProfile, updateClubProfile, createClubProfile]);

  // Update form field
  const updateField = useCallback((field: keyof ClubSettingsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Get profile completion
  const getProfileCompletion = useCallback(() => {
    return calculateProfileCompletion(clubProfile);
  }, [clubProfile]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Load data on mount
  useEffect(() => {
    if (user?.id) {
      loadClubProfile();
    }
  }, [user?.id, loadClubProfile]);

  return {
    // Data
    formData,
    clubProfile,
    
    // State
    loading,
    saving,
    error,
    successMessage,
    
    // Actions
    updateField,
    saveSettings,
    loadClubProfile,
    getProfileCompletion,
    clearMessages,
    
    // Computed
    isNewClub: !clubProfile,
    hasUnsavedChanges: clubProfile ? JSON.stringify(formData) !== JSON.stringify(profileToFormData(clubProfile)) : false
  };
}; 