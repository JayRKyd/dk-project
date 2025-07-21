-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO platform_settings (id, settings) VALUES (
  1,
  '{
    "siteName": "DateKelly",
    "siteDescription": "The leading platform for adult services in the Netherlands",
    "maintenanceMode": false,
    "allowNewRegistrations": true,
    "requireEmailVerification": true,
    "requirePhoneVerification": false,
    "autoApproveLadies": false,
    "autoApproveClubs": false,
    "requireLadyVerification": true,
    "requireClubVerification": true,
    "requireClientVerification": false,
    "verificationDocumentTypes": ["id_card", "selfie_with_id", "newspaper_photo"],
    "autoModerateReviews": false,
    "autoModerateFanPosts": false,
    "requireReviewApproval": true,
    "requireFanPostApproval": true,
    "platformCommission": 15,
    "minimumBookingAmount": 50,
    "maximumBookingAmount": 5000,
    "enableGifts": true,
    "enableCredits": true,
    "emailNotifications": true,
    "pushNotifications": true,
    "adminAlerts": true,
    "sessionTimeout": 24,
    "maxLoginAttempts": 5,
    "requireTwoFactor": false,
    "enableRateLimiting": true
  }'
) ON CONFLICT (id) DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON platform_settings TO authenticated;
GRANT SELECT ON platform_settings TO anon;

-- Create RLS policies
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow admins to read and write settings
CREATE POLICY "Admins can manage platform settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_settings_updated_at(); 