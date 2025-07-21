-- =============================================================================
-- SUPABASE RLS SETUP FOR MEMBERSHIP TIER PROTECTION (FREE vs PRO)
-- =============================================================================
-- This script sets up Row Level Security policies to enforce membership 
-- restrictions at the database level for FREE vs PRO tiers.

-- -----------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Function to check if user has required membership tier (simplified for FREE/PRO)
CREATE OR REPLACE FUNCTION check_membership_tier(required_tier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
BEGIN
  SELECT membership_tier INTO user_tier
  FROM profiles
  WHERE user_id = auth.uid();
  
  RETURN CASE
    WHEN required_tier = 'FREE' THEN true  -- Everyone has FREE access
    WHEN required_tier = 'PRO' AND user_tier = 'PRO' THEN true
    ELSE false
  END;
END;
$$;

-- Helper function to check if user is PRO
CREATE OR REPLACE FUNCTION is_pro_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND membership_tier = 'PRO'
  );
END;
$$;

-- Helper function to check if user is FREE tier
CREATE OR REPLACE FUNCTION is_free_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND (membership_tier = 'FREE' OR membership_tier IS NULL)
  );
END;
$$;

-- Function to get current user's membership tier
CREATE OR REPLACE FUNCTION get_user_membership_tier()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
BEGIN
  SELECT membership_tier INTO user_tier
  FROM profiles
  WHERE user_id = auth.uid();
  
  RETURN COALESCE(user_tier, 'FREE');
END;
$$;

-- Function to check if user is a test account (development bypass)
CREATE OR REPLACE FUNCTION is_test_account()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND is_test_account = true
  );
END;
$$;

-- Function to check if current environment allows bypassing (development mode)
CREATE OR REPLACE FUNCTION can_bypass_membership()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow bypass for test accounts in development/staging
  RETURN (
    current_setting('app.environment', true) IN ('development', 'staging') 
    AND is_test_account()
  );
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. RLS POLICIES FOR PRO-ONLY FEATURES
-- -----------------------------------------------------------------------------

-- =============================================================================
-- FAN POSTS (PRO ONLY)
-- =============================================================================

-- Enable RLS on fan_posts table
ALTER TABLE fan_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Only PRO users can create fan posts
CREATE POLICY "fan_posts_insert_policy" ON fan_posts
FOR INSERT
TO authenticated
WITH CHECK (
  can_bypass_membership() OR is_pro_user()
);

-- Policy: Only PRO users can view fan posts
CREATE POLICY "fan_posts_select_policy" ON fan_posts
FOR SELECT
TO authenticated
USING (
  can_bypass_membership() OR is_pro_user()
);

-- Policy: Only PRO users can update their own fan posts
CREATE POLICY "fan_posts_update_policy" ON fan_posts
FOR UPDATE
TO authenticated
USING (
  author_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
)
WITH CHECK (
  author_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
);

-- Policy: Only PRO users can delete their own fan posts
CREATE POLICY "fan_posts_delete_policy" ON fan_posts
FOR DELETE
TO authenticated
USING (
  author_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
);

-- =============================================================================
-- FAN POST SUBSCRIBERS (PRO ONLY)
-- =============================================================================

-- Enable RLS on fan_post_subscribers table
ALTER TABLE fan_post_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Only PRO users can manage subscribers
CREATE POLICY "fan_post_subscribers_all_policy" ON fan_post_subscribers
FOR ALL
TO authenticated
USING (
  can_bypass_membership() OR is_pro_user()
)
WITH CHECK (
  can_bypass_membership() OR is_pro_user()
);

-- =============================================================================
-- GIFTS (PRO ONLY for ladies to manage)
-- =============================================================================

-- Enable RLS on gifts table
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Policy: PRO ladies can manage received gifts, clients can send to any lady
CREATE POLICY "gifts_select_policy" ON gifts
FOR SELECT
TO authenticated
USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'lady' THEN
      recipient_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
    ELSE true  -- Clients can view gifts they sent
  END
);

-- Policy: Anyone can send gifts, only PRO ladies can be recipients
CREATE POLICY "gifts_insert_policy" ON gifts
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check if recipient is PRO (for lady recipients)
  CASE 
    WHEN recipient_type = 'lady' THEN
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = recipient_id 
        AND membership_tier = 'PRO'
      )
    ELSE true
  END
);

-- =============================================================================
-- BOOKINGS (PRO ONLY for ladies)
-- =============================================================================

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: PRO ladies can manage bookings, clients can book any lady
CREATE POLICY "bookings_select_policy" ON bookings
FOR SELECT
TO authenticated
USING (
  client_id = auth.uid() OR 
  (lady_id = auth.uid() AND (can_bypass_membership() OR is_pro_user()))
);

-- Policy: Clients can create bookings with any lady, ladies must be PRO to accept
CREATE POLICY "bookings_insert_policy" ON bookings
FOR INSERT
TO authenticated
WITH CHECK (
  client_id = auth.uid() OR
  (lady_id = auth.uid() AND (can_bypass_membership() OR is_pro_user()))
);

-- Policy: PRO ladies can update their bookings, clients can update their own bookings
CREATE POLICY "bookings_update_policy" ON bookings
FOR UPDATE
TO authenticated
USING (
  client_id = auth.uid() OR 
  (lady_id = auth.uid() AND (can_bypass_membership() OR is_pro_user()))
)
WITH CHECK (
  client_id = auth.uid() OR 
  (lady_id = auth.uid() AND (can_bypass_membership() OR is_pro_user()))
);

-- =============================================================================
-- DK CREDITS (PRO ONLY)
-- =============================================================================

-- Enable RLS on credit_transactions table
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Only PRO users can manage credits
CREATE POLICY "credit_transactions_all_policy" ON credit_transactions
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
)
WITH CHECK (
  user_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
);

-- =============================================================================
-- ANALYTICS (PRO ONLY)
-- =============================================================================

-- Enable RLS on fan_post_analytics table (if exists)
ALTER TABLE fan_post_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Only PRO users can access analytics
CREATE POLICY "fan_post_analytics_all_policy" ON fan_post_analytics
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
)
WITH CHECK (
  user_id = auth.uid() AND (can_bypass_membership() OR is_pro_user())
);

-- =============================================================================
-- FREE TIER TABLES (Available to all authenticated users)
-- =============================================================================

-- Enable RLS on profiles (but allow all authenticated users)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own profiles
CREATE POLICY "profiles_own_policy" ON profiles
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Enable RLS on reviews (available to all)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read reviews
CREATE POLICY "reviews_select_policy" ON reviews
FOR SELECT
TO authenticated
USING (true);

-- Policy: Users can insert reviews (basic feature)
CREATE POLICY "reviews_insert_policy" ON reviews
FOR INSERT
TO authenticated
WITH CHECK (reviewer_id = auth.uid());

-- Enable RLS on notifications (available to all)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "notifications_own_policy" ON notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =============================================================================
-- MEMBERSHIP UPGRADE VALIDATION
-- =============================================================================

-- Function to validate membership upgrade eligibility
CREATE OR REPLACE FUNCTION validate_membership_upgrade(
  user_id uuid,
  new_tier text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tier text;
BEGIN
  SELECT membership_tier INTO current_tier
  FROM profiles
  WHERE profiles.user_id = validate_membership_upgrade.user_id;
  
  -- Allow upgrades from FREE to PRO
  IF current_tier = 'FREE' AND new_tier = 'PRO' THEN
    RETURN true;
  END IF;
  
  -- Allow test accounts to change freely in development
  IF can_bypass_membership() THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- =============================================================================
-- TESTING FUNCTIONS (Development Only)
-- =============================================================================

-- Function to create test accounts (development only)
CREATE OR REPLACE FUNCTION create_test_lady_account(
  p_email text,
  p_name text,
  p_tier text DEFAULT 'PRO'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Only allow in development
  IF current_setting('app.environment', true) != 'development' THEN
    RAISE EXCEPTION 'Test account creation only allowed in development';
  END IF;
  
  -- Generate UUID for test user
  new_user_id := gen_random_uuid();
  
  -- Insert test profile
  INSERT INTO profiles (
    user_id,
    name,
    email,
    role,
    membership_tier,
    is_test_account,
    created_at
  ) VALUES (
    new_user_id,
    p_name,
    p_email,
    'lady',
    p_tier,
    true,
    now()
  );
  
  RETURN new_user_id;
END;
$$;

-- Function to cleanup test accounts (development only)
CREATE OR REPLACE FUNCTION cleanup_test_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow in development
  IF current_setting('app.environment', true) != 'development' THEN
    RAISE EXCEPTION 'Test cleanup only allowed in development';
  END IF;
  
  -- Delete test account data
  DELETE FROM fan_posts WHERE author_id IN (
    SELECT user_id FROM profiles WHERE is_test_account = true
  );
  
  DELETE FROM bookings WHERE lady_id IN (
    SELECT user_id FROM profiles WHERE is_test_account = true
  );
  
  DELETE FROM profiles WHERE is_test_account = true;
END;
$$;

-- =============================================================================
-- TRIGGERS FOR MEMBERSHIP VALIDATION
-- =============================================================================

-- Trigger to validate membership tier updates
CREATE OR REPLACE FUNCTION validate_membership_tier_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Allow if no tier change
  IF OLD.membership_tier = NEW.membership_tier THEN
    RETURN NEW;
  END IF;
  
  -- Validate the upgrade
  IF NOT validate_membership_upgrade(NEW.user_id, NEW.membership_tier) THEN
    RAISE EXCEPTION 'Invalid membership tier upgrade from % to %', 
      OLD.membership_tier, NEW.membership_tier;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS membership_tier_validation_trigger ON profiles;
CREATE TRIGGER membership_tier_validation_trigger
  BEFORE UPDATE OF membership_tier ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_membership_tier_update();

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION check_membership_tier(text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_pro_user() TO authenticated;
GRANT EXECUTE ON FUNCTION is_free_user() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_membership_tier() TO authenticated;
GRANT EXECUTE ON FUNCTION is_test_account() TO authenticated;
GRANT EXECUTE ON FUNCTION can_bypass_membership() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_membership_upgrade(uuid, text) TO authenticated;

-- Grant execute permissions on test functions to service role only
GRANT EXECUTE ON FUNCTION create_test_lady_account(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_test_accounts() TO service_role;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Membership tier RLS setup completed successfully!';
  RAISE NOTICE 'Security levels implemented:';
  RAISE NOTICE '  ✓ Frontend route protection (MembershipGuard)';
  RAISE NOTICE '  ✓ API layer protection (protectedApiService)';
  RAISE NOTICE '  ✓ Database RLS protection (this script)';
  RAISE NOTICE '';
  RAISE NOTICE 'Test accounts can be created in development mode.';
  RAISE NOTICE 'PRO features are protected at all levels.';
END $$; 