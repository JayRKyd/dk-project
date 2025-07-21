# Database Schema Documentation

## Tables

### 1. `auth.users` (Supabase Auth)
```sql
-- Managed by Supabase Auth
-- Contains: id, email, encrypted_password, confirmation_token, etc.
```

### 2. `public.profiles`
```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('lady', 'client', 'club', 'advertiser')),
  membership_tier TEXT NOT NULL DEFAULT 'FREE' CHECK (membership_tier IN ('FREE', 'PRO', 'PRO-PLUS', 'ULTRA')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### 3. `public.profile_details`
```sql
CREATE TABLE public.profile_details (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  date_of_birth DATE,
  gender TEXT,
  height INT,
  body_type TEXT,
  ethnicity TEXT,
  languages TEXT[],
  phone_number TEXT,
  country TEXT,
  city TEXT,
  postcode TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_incall_available BOOLEAN DEFAULT false,
  is_outcall_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own details" 
  ON public.profile_details FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own details" 
  ON public.profile_details FOR UPDATE 
  USING (auth.uid() = id);
```

### 4. `public.services`
```sql
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INT NOT NULL, -- in minutes
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Services are viewable by everyone" 
  ON public.services FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own services" 
  ON public.services 
  USING (auth.uid() = profile_id);
```

### 5. `public.bookings`
```sql
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lady_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location_type TEXT CHECK (location_type IN ('incall', 'outcall', 'online')),
  address TEXT,
  special_requests TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);

-- Indexes for better query performance
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_lady_id ON public.bookings(lady_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own bookings" 
  ON public.bookings FOR SELECT 
  USING (auth.uid() = client_id OR auth.uid() = lady_id);

CREATE POLICY "Users can create bookings" 
  ON public.bookings FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own bookings" 
  ON public.bookings FOR UPDATE 
  USING (auth.uid() = client_id OR auth.uid() = lady_id);
```

### 6. `public.reviews`
```sql
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  response TEXT,
  response_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews for their bookings" 
  ON public.reviews FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = booking_id 
      AND (client_id = auth.uid() OR lady_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews FOR UPDATE 
  USING (auth.uid() = reviewer_id);
```

### 7. `public.media`
```sql
CREATE TABLE public.media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  is_public BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  position INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public media is viewable by everyone" 
  ON public.media FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Users can view their own media" 
  ON public.media FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage their own media" 
  ON public.media 
  USING (auth.uid() = profile_id);

-- Only one primary image per profile
CREATE UNIQUE INDEX idx_one_primary_image_per_profile 
  ON public.media(profile_id) 
  WHERE is_primary = true;
```

## Database Functions

### 1. Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_details_updated_at
BEFORE UPDATE ON public.profile_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Create Profile on Signup
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Database Security

### Enable RLS on All Tables
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
```

### Create Database Roles
```sql
-- Create roles
CREATE ROLE anon NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE;
CREATE ROLE authenticated NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE;
CREATE ROLE service_role BYPASSRLS NOLOGIN NOINHERIT NOCREATEDB NOCREATEROLE;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant appropriate permissions to roles
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;

-- Allow anon/authenticated users to access sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

## Supabase Setup Instructions

1. **Enable Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   ```

2. **Set Up Storage**
   - Create a `profile-pictures` bucket in Supabase Storage
   - Set appropriate bucket policies

3. **Configure Authentication**
   - Enable email/password auth
   - Configure social providers (Google, Facebook, etc.)
   - Set up email templates

4. **Set Up Database Triggers**
   - Run the functions and triggers defined above
   - Set up realtime subscriptions for chat and notifications

## Next Steps

1. Run the SQL migrations in your Supabase SQL editor
2. Set up storage buckets and policies
3. Configure authentication providers
4. Test all CRUD operations with RLS
5. Implement frontend integration with the database
