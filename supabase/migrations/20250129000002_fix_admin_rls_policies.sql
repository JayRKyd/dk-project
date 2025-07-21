-- Drop conflicting policies
DROP POLICY IF EXISTS "Admins can update user status" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "admin_users_policy" ON users;

-- Create a single, comprehensive admin policy
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Also allow users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public read access for basic user info
CREATE POLICY "Public can view basic user info" ON users
  FOR SELECT USING (true);

-- Allow authenticated users to insert (for registration)
CREATE POLICY "Authenticated users can insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id); 