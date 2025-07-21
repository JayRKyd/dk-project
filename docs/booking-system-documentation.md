# Booking System Documentation

This document provides a comprehensive overview of the DateKelly booking system, including database structure, relationships, security policies, and implementation details.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Table Relationships](#table-relationships)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Booking Conflict Prevention](#booking-conflict-prevention)
5. [Indexes and Performance](#indexes-and-performance)
6. [Usage Examples](#usage-examples)

## Database Schema

The booking system consists of three main tables:

### Bookings Table

Stores information about client bookings with ladies.

```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  location_type TEXT NOT NULL CHECK (location_type IN ('incall', 'outcall')),
  address TEXT,
  message TEXT,
  total_cost DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Availability Table

Tracks when ladies are available for bookings.

```sql
CREATE TABLE public.availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, day_of_week, start_time, end_time)
);
```

### Blocked Slots Table

Manages specific time slots that ladies want to block off, even within their generally available hours.

```sql
CREATE TABLE public.blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT end_after_start CHECK (end_time > start_time)
);
```

## Table Relationships

The booking system has the following key relationships:

1. **Bookings to Users and Profiles**:
   - `bookings.client_id` references `public.users.id` (the client making the booking)
   - `bookings.profile_id` references `public.profiles.id` (the lady being booked)

2. **Availability and Blocked Slots to Auth Users**:
   - `availability.user_id` references `auth.users.id` (the lady setting availability)
   - `blocked_slots.user_id` references `auth.users.id` (the lady blocking time slots)

3. **Profiles to Users**:
   - `profiles.user_id` references `public.users.id` (connecting profiles to users)

This structure allows for proper relationship management between clients making bookings and ladies receiving bookings, while also enabling ladies to manage their availability.

## Row Level Security (RLS)

The booking system implements Row Level Security to ensure data privacy and access control:

### Bookings Table Policies

```sql
-- Users can view their own bookings (as client or lady)
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (client_id = auth.uid() OR auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- Clients can create bookings
CREATE POLICY "Clients can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (client_id = auth.uid() AND EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid() AND role = 'client'
));

-- Profile owners can update booking status
CREATE POLICY "Profile owners can update booking status"
ON public.bookings
FOR UPDATE
USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = profile_id));

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
));
```

### Availability Table Policies

```sql
-- Users can manage their own availability
CREATE POLICY "Users can manage their own availability"
ON public.availability
FOR ALL
USING (auth.uid() = user_id);

-- Anyone can view availability
CREATE POLICY "Anyone can view availability"
ON public.availability
FOR SELECT
USING (true);

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability"
ON public.availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
));
```

### Blocked Slots Table Policies

```sql
-- Users can manage their own blocked slots
CREATE POLICY "Users can manage their own blocked slots"
ON public.blocked_slots
FOR ALL
USING (auth.uid() = user_id);

-- Users can view their own blocked slots
CREATE POLICY "Users can view their own blocked slots"
ON public.blocked_slots
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all blocked slots
CREATE POLICY "Admins can manage all blocked slots"
ON public.blocked_slots
FOR ALL
USING (EXISTS (
  SELECT 1 FROM auth.users
  WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
));
```

## Booking Conflict Prevention

The system includes a sophisticated booking conflict prevention mechanism implemented as a database trigger:

```sql
CREATE OR REPLACE FUNCTION check_booking_conflict()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for overlapping bookings
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE profile_id = NEW.profile_id
    AND date = NEW.date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    AND (
      (time <= NEW.time AND time + (duration * INTERVAL '1 minute') > NEW.time) OR  -- New booking starts during existing booking
      (time < NEW.time + (NEW.duration * INTERVAL '1 minute') AND time + (duration * INTERVAL '1 minute') >= NEW.time + (NEW.duration * INTERVAL '1 minute')) OR  -- New booking ends during existing booking
      (time >= NEW.time AND time + (duration * INTERVAL '1 minute') <= NEW.time + (NEW.duration * INTERVAL '1 minute'))  -- New booking completely contains existing booking
    )
  ) THEN
    RAISE EXCEPTION 'Booking conflicts with an existing booking';
  END IF;
  
  -- Check for blocked slots
  IF EXISTS (
    SELECT 1 FROM public.blocked_slots
    WHERE user_id = (SELECT user_id FROM public.profiles WHERE id = NEW.profile_id)
    AND start_time <= (NEW.date + NEW.time + (NEW.duration * INTERVAL '1 minute'))
    AND end_time >= (NEW.date + NEW.time)
  ) THEN
    RAISE EXCEPTION 'The selected time slot is not available';
  END IF;
  
  -- Check if the time is within the user's availability
  IF NOT EXISTS (
    SELECT 1 FROM public.availability
    WHERE user_id = (SELECT user_id FROM public.profiles WHERE id = NEW.profile_id)
    AND day_of_week = EXTRACT(DOW FROM NEW.date)
    AND start_time <= NEW.time
    AND end_time >= (NEW.time + (NEW.duration * INTERVAL '1 minute'))
    AND is_available = true
  ) THEN
    RAISE EXCEPTION 'The selected time is not within the available hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check for booking conflicts
CREATE TRIGGER check_booking_conflict_trigger
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION check_booking_conflict();
```

This trigger performs three key checks:
1. **Overlapping Bookings**: Ensures no two bookings for the same lady overlap in time
2. **Blocked Slots**: Checks if the lady has specifically blocked the requested time slot
3. **Availability**: Verifies that the booking falls within the lady's set availability hours

## Indexes and Performance

To ensure optimal query performance, the following indexes have been created:

```sql
-- Bookings table indexes
CREATE INDEX idx_bookings_profile_id ON public.bookings(profile_id);
CREATE INDEX idx_bookings_client_id ON public.bookings(client_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Availability table indexes
CREATE INDEX idx_availability_user_id ON public.availability(user_id);

-- Blocked slots table indexes
CREATE INDEX idx_blocked_slots_user_id ON public.blocked_slots(user_id);
CREATE INDEX idx_blocked_slots_time_range ON public.blocked_slots(start_time, end_time);
```

These indexes improve performance for common queries such as:
- Finding upcoming bookings for a specific lady or client
- Checking availability for a specific day
- Filtering bookings by status
- Checking for blocked time slots

## Usage Examples

### Setting Availability

Ladies can set their weekly availability using the `availability` table:

```sql
-- Set Monday availability from 9 AM to 5 PM
INSERT INTO public.availability (user_id, day_of_week, start_time, end_time, is_available)
VALUES ('user-uuid', 1, '09:00:00', '17:00:00', true);

-- Set Tuesday availability from 10 AM to 6 PM
INSERT INTO public.availability (user_id, day_of_week, start_time, end_time, is_available)
VALUES ('user-uuid', 2, '10:00:00', '18:00:00', true);
```

### Blocking Specific Time Slots

Ladies can block specific time slots within their available hours:

```sql
-- Block a doctor's appointment next Monday from 2 PM to 3:30 PM
INSERT INTO public.blocked_slots (user_id, start_time, end_time, reason)
VALUES (
  'user-uuid',
  '2025-05-27 14:00:00',
  '2025-05-27 15:30:00',
  'Doctor appointment'
);
```

### Creating a Booking

Clients can create bookings with ladies:

```sql
-- Create a pending booking
INSERT INTO public.bookings (
  client_id,
  profile_id,
  date,
  time,
  duration,
  location_type,
  address,
  message,
  total_cost,
  status
)
VALUES (
  'client-uuid',
  'profile-uuid',
  '2025-06-01',
  '15:00:00',
  60,
  'incall',
  '123 Main St, Anytown, USA',
  'Looking forward to our meeting!',
  150.00,
  'pending'
);
```

### Updating Booking Status

Ladies can update the status of bookings:

```sql
-- Confirm a booking
UPDATE public.bookings
SET status = 'confirmed', updated_at = NOW()
WHERE id = 'booking-uuid';

-- Mark a booking as completed
UPDATE public.bookings
SET status = 'completed', updated_at = NOW()
WHERE id = 'booking-uuid';

-- Cancel a booking
UPDATE public.bookings
SET status = 'cancelled', updated_at = NOW()
WHERE id = 'booking-uuid';
```

### Querying Upcoming Bookings

Ladies and clients can view their upcoming bookings:

```sql
-- Lady viewing their upcoming bookings
SELECT b.*, p.name as client_name
FROM public.bookings b
JOIN public.profiles p ON b.client_id = p.user_id
WHERE b.profile_id = 'profile-uuid'
AND b.date >= CURRENT_DATE
AND b.status IN ('pending', 'confirmed')
ORDER BY b.date, b.time;

-- Client viewing their upcoming bookings
SELECT b.*, p.name as lady_name
FROM public.bookings b
JOIN public.profiles p ON b.profile_id = p.id
WHERE b.client_id = 'client-uuid'
AND b.date >= CURRENT_DATE
AND b.status IN ('pending', 'confirmed')
ORDER BY b.date, b.time;
```

---

This booking system provides a robust foundation for managing appointments between clients and ladies, with built-in safeguards to prevent booking conflicts and ensure proper access control.
