import { supabase } from '../lib/supabase';

export interface PlatformSettings {
  // General Settings
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  
  // User Management
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  requirePhoneVerification: boolean;
  autoApproveLadies: boolean;
  autoApproveClubs: boolean;
  
  // Verification Settings
  requireLadyVerification: boolean;
  requireClubVerification: boolean;
  requireClientVerification: boolean;
  verificationDocumentTypes: string[];
  
  // Content Moderation
  autoModerateReviews: boolean;
  autoModerateFanPosts: boolean;
  requireReviewApproval: boolean;
  requireFanPostApproval: boolean;
  
  // Financial Settings
  platformCommission: number;
  minimumBookingAmount: number;
  maximumBookingAmount: number;
  enableGifts: boolean;
  enableCredits: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  adminAlerts: boolean;
  
  // Security Settings
  sessionTimeout: number;
  maxLoginAttempts: number;
  requireTwoFactor: boolean;
  enableRateLimiting: boolean;
}

const defaultSettings: PlatformSettings = {
  siteName: 'DateKelly',
  siteDescription: 'The leading platform for adult services in the Netherlands',
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: true,
  requirePhoneVerification: false,
  autoApproveLadies: false,
  autoApproveClubs: false,
  requireLadyVerification: true,
  requireClubVerification: true,
  requireClientVerification: false,
  verificationDocumentTypes: ['id_card', 'selfie_with_id', 'newspaper_photo'],
  autoModerateReviews: false,
  autoModerateFanPosts: false,
  requireReviewApproval: true,
  requireFanPostApproval: true,
  platformCommission: 15,
  minimumBookingAmount: 50,
  maximumBookingAmount: 5000,
  enableGifts: true,
  enableCredits: true,
  emailNotifications: true,
  pushNotifications: true,
  adminAlerts: true,
  sessionTimeout: 24,
  maxLoginAttempts: 5,
  requireTwoFactor: false,
  enableRateLimiting: true
};

export const adminSettingsService = {
  // Load settings from database
  async loadSettings(): Promise<PlatformSettings> {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading settings:', error);
        // Return default settings if no settings exist
        return defaultSettings;
      }

      if (!data) {
        // Create default settings if none exist
        await this.saveSettings(defaultSettings);
        return defaultSettings;
      }

      // Merge with defaults to ensure all settings exist
      return { ...defaultSettings, ...data.settings };
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  },

  // Save settings to database
  async saveSettings(settings: PlatformSettings): Promise<void> {
    try {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          id: 1, // Single settings record
          settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  // Get a specific setting
  async getSetting<T>(key: keyof PlatformSettings): Promise<T> {
    const settings = await this.loadSettings();
    return settings[key] as T;
  },

  // Update a specific setting
  async updateSetting<T>(key: keyof PlatformSettings, value: T): Promise<void> {
    const settings = await this.loadSettings();
    (settings as any)[key] = value;
    await this.saveSettings(settings);
  },

  // Reset settings to defaults
  async resetSettings(): Promise<void> {
    await this.saveSettings(defaultSettings);
  }
}; 