/*
  # Initialize DateBilly Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `username` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `role` (text)
      - `is_verified` (boolean)
      - `membership_tier` (text)
      - `credits` (integer)
      - `client_number` (text)

    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `gender` (text)
      - `location` (text)
      - `image_url` (text)
      - `rating` (numeric)
      - `loves` (integer)
      - `description` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `profile_details`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `age` (integer)
      - `height` (integer)
      - `weight` (integer)
      - `body_type` (text)
      - `languages` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `reviews`
      - `id` (uuid, primary key)
      - `author_id` (uuid, references users)
      - `profile_id` (uuid, references profiles)
      - `rating` (numeric)
      - `positives` (text array)
      - `negatives` (text array)
      - `likes` (integer)
      - `dislikes` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `review_replies`
      - `id` (uuid, primary key)
      - `review_id` (uuid, references reviews)
      - `author_id` (uuid, references users)
      - `message` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

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
  role text NOT NULL CHECK (role IN ('man', 'client')),
  is_verified boolean DEFAULT false,
  membership_tier text DEFAULT 'FREE' CHECK (membership_tier IN ('FREE', 'PRO', 'PRO-PLUS', 'ULTRA')),
  credits integer DEFAULT 0,
  client_number text UNIQUE
);

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  location text NOT NULL,
  image_url text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  loves integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profile_details table
CREATE TABLE profile_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  age integer CHECK (age >= 18),
  height integer,
  weight integer,
  body_type text,
  languages text[],
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Men can create their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'man'
  ));

CREATE POLICY "Men can update their own profile"
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

CREATE POLICY "Men can manage their own profile details"
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

CREATE POLICY "Men can reply to their reviews"
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

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();