/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - username (text, unique) 
      - created_at (timestamp)
      - updated_at (timestamp)
      - role (text) - 'lady' or 'client'
      - is_verified (boolean)
      - membership_tier (text) - 'FREE', 'PRO', 'PRO-PLUS', 'ULTRA'
      - credits (integer)

    - profiles
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - location (text)
      - image_url (text)
      - rating (numeric)
      - loves (integer)
      - description (text)
      - price (text)
      - is_club (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

    - profile_details
      - id (uuid, primary key)
      - profile_id (uuid, foreign key)
      - sex (text)
      - age (integer)
      - height (integer)
      - weight (integer)
      - cup_size (text)
      - body_size (text)
      - descent (text)
      - languages (text[])
      - created_at (timestamp)
      - updated_at (timestamp)

    - services
      - id (uuid, primary key)
      - profile_id (uuid, foreign key)
      - name (text)
      - price (text)
      - is_included (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

    - reviews
      - id (uuid, primary key)
      - author_id (uuid, foreign key)
      - profile_id (uuid, foreign key)
      - rating (numeric)
      - positives (text[])
      - negatives (text[])
      - likes (integer)
      - dislikes (integer)
      - created_at (timestamp)
      - updated_at (timestamp)

    - review_replies
      - id (uuid, primary key)
      - review_id (uuid, foreign key)
      - author_id (uuid, foreign key)
      - message (text)
      - created_at (timestamp)
      - updated_at (timestamp)

    - bookings
      - id (uuid, primary key)
      - client_id (uuid, foreign key)
      - profile_id (uuid, foreign key)
      - date (date)
      - time (time)
      - duration (text)
      - location_type (text) - 'incall' or 'outcall'
      - address (text)
      - message (text)
      - total_cost (numeric)
      - status (text) - 'pending', 'confirmed', 'completed', 'cancelled'
      - created_at (timestamp)
      - updated_at (timestamp)

    - booking_services
      - id (uuid, primary key)
      - booking_id (uuid, foreign key)
      - service_id (uuid, foreign key)
      - created_at (timestamp)

    - gifts
      - id (uuid, primary key)
      - sender_id (uuid, foreign key)
      - recipient_id (uuid, foreign key)
      - gift_type (text)
      - credits_cost (integer)
      - message (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  role text NOT NULL CHECK (role IN ('lady', 'client')),
  is_verified boolean DEFAULT false,
  membership_tier text DEFAULT 'FREE' CHECK (membership_tier IN ('FREE', 'PRO', 'PRO-PLUS', 'ULTRA')),
  credits integer DEFAULT 0
);

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text NOT NULL,
  image_url text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  loves integer DEFAULT 0,
  description text,
  price text,
  is_club boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profile_details table
CREATE TABLE profile_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sex text NOT NULL,
  age integer CHECK (age >= 18),
  height integer,
  weight integer,
  cup_size text,
  body_size text,
  descent text,
  languages text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  price text,
  is_included boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating numeric NOT NULL CHECK (rating >= 0 AND rating <= 10),
  positives text[],
  negatives text[],
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create review_replies table
CREATE TABLE review_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES users(id) ON DELETE SET NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time NOT NULL,
  duration text NOT NULL,
  location_type text NOT NULL CHECK (location_type IN ('incall', 'outcall')),
  address text,
  message text,
  total_cost numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking_services table
CREATE TABLE booking_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create gifts table
CREATE TABLE gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  gift_type text NOT NULL,
  credits_cost integer NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Ladies can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'lady'
  ));

CREATE POLICY "Ladies can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Profile details policies
CREATE POLICY "Profile details are viewable by everyone"
  ON profile_details
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Ladies can manage their own profile details"
  ON profile_details
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_details.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Ladies can manage their own services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = services.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'client'
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid());

-- Review replies policies
CREATE POLICY "Review replies are viewable by everyone"
  ON review_replies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Ladies can reply to their reviews"
  ON review_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN profiles ON reviews.profile_id = profiles.id
      WHERE reviews.id = review_replies.review_id
      AND profiles.user_id = auth.uid()
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'client'
    )
  );

-- Booking services policies
CREATE POLICY "Users can view their own booking services"
  ON booking_services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_services.booking_id
      AND (
        bookings.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = bookings.profile_id
          AND profiles.user_id = auth.uid()
        )
      )
    )
  );

-- Gifts policies
CREATE POLICY "Users can view gifts they sent or received"
  ON gifts
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Authenticated users can send gifts"
  ON gifts
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Create functions and triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profile_details_updated_at
  BEFORE UPDATE ON profile_details
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();