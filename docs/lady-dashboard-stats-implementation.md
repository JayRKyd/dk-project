# Lady Dashboard Stats Implementation

This document outlines the database functions, triggers, and data flow implemented to support the dynamic stats display in the LadyDashboardFree component.

## Overview

The LadyDashboardFree component displays various statistics about a lady's profile, including:

- Profile views
- Loves received
- Reviews
- Gifts received

For each statistic, the dashboard shows:
- The current count
- The percentage change compared to the previous week
- Visual indicators for positive/negative changes

## Database Structure

### Core Tables

1. **profile_stats**
   - Tracks weekly statistics for each profile
   - Stores both current week and previous week values
   - Used to calculate percentage changes

   ```sql
   CREATE TABLE profile_stats (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     views_current_week INTEGER DEFAULT 0,
     views_previous_week INTEGER DEFAULT 0,
     loves_current_week INTEGER DEFAULT 0,
     loves_previous_week INTEGER DEFAULT 0,
     reviews_current_week INTEGER DEFAULT 0,
     reviews_previous_week INTEGER DEFAULT 0,
     gifts_current_week INTEGER DEFAULT 0,
     gifts_previous_week INTEGER DEFAULT 0,
     updated_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. **profile_views**
   - Records each view of a profile
   - Includes viewer information and timestamp

   ```sql
   CREATE TABLE profile_views (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
     viewed_at TIMESTAMPTZ DEFAULT now(),
     is_anonymous BOOLEAN DEFAULT false
   );
   ```

3. **profile_loves**
   - Tracks who has loved each profile
   - Enforces uniqueness to prevent duplicate loves

   ```sql
   CREATE TABLE profile_loves (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ DEFAULT now(),
     UNIQUE(user_id, profile_id)
   );
   ```

4. **activities**
   - Unified activity feed for all user interactions
   - Used for notifications and recent activity display

   ```sql
   CREATE TABLE activities (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE SET NULL,
     type TEXT NOT NULL CHECK (type IN ('view', 'love', 'message', 'gift', 'review', 'booking')),
     data JSONB DEFAULT NULL,
     is_read BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

## Database Functions

### 1. Love Management Functions

```sql
-- Increment loves count for a profile
CREATE OR REPLACE FUNCTION increment_loves(profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET loves = COALESCE(loves, 0) + 1
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Decrement loves count for a profile
CREATE OR REPLACE FUNCTION decrement_loves(profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET loves = GREATEST(COALESCE(loves, 0) - 1, 0)
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;
```

### 2. Activity Recording Functions

```sql
-- Record a profile view and update stats
CREATE OR REPLACE FUNCTION record_profile_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Create activity record for the view
  INSERT INTO activities (profile_id, user_id, type, is_read)
  VALUES (NEW.profile_id, NEW.viewer_id, 'view', false);
  
  -- Update profile_stats table
  UPDATE profile_stats
  SET views_current_week = views_current_week + 1
  WHERE profile_id = NEW.profile_id;
  
  -- If no row exists in profile_stats, create one
  IF NOT FOUND THEN
    INSERT INTO profile_stats (profile_id, views_current_week, views_previous_week)
    VALUES (NEW.profile_id, 1, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Record a profile love and update stats
CREATE OR REPLACE FUNCTION record_profile_love()
RETURNS TRIGGER AS $$
BEGIN
  -- Create activity record for the love
  INSERT INTO activities (profile_id, user_id, type, is_read)
  VALUES (NEW.profile_id, NEW.user_id, 'love', false);
  
  -- Update profile_stats table
  UPDATE profile_stats
  SET loves_current_week = loves_current_week + 1
  WHERE profile_id = NEW.profile_id;
  
  -- If no row exists in profile_stats, create one
  IF NOT FOUND THEN
    INSERT INTO profile_stats (profile_id, loves_current_week, loves_previous_week)
    VALUES (NEW.profile_id, 1, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Handle profile love deletion and update stats
CREATE OR REPLACE FUNCTION handle_profile_love_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile_stats table
  UPDATE profile_stats
  SET loves_current_week = GREATEST(loves_current_week - 1, 0)
  WHERE profile_id = OLD.profile_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
```

### 3. Weekly Stats Management

```sql
-- Rotate weekly stats (move current to previous, reset current)
CREATE OR REPLACE FUNCTION rotate_weekly_stats()
RETURNS VOID AS $$
BEGIN
  UPDATE profile_stats
  SET 
    views_previous_week = views_current_week,
    views_current_week = 0,
    loves_previous_week = loves_current_week,
    loves_current_week = 0,
    reviews_previous_week = reviews_current_week,
    reviews_current_week = 0,
    gifts_previous_week = gifts_current_week,
    gifts_current_week = 0,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Manual function to rotate weekly stats (for cron jobs)
CREATE OR REPLACE FUNCTION manual_rotate_weekly_stats()
RETURNS VOID AS $$
BEGIN
  PERFORM rotate_weekly_stats();
END;
$$ LANGUAGE plpgsql;
```

## Database Triggers

Triggers automatically update stats and create activity records when relevant actions occur:

```sql
-- Profile view trigger
CREATE TRIGGER profile_view_trigger
AFTER INSERT ON profile_views
FOR EACH ROW
EXECUTE FUNCTION record_profile_view();

-- Profile love trigger
CREATE TRIGGER profile_love_trigger
AFTER INSERT ON profile_loves
FOR EACH ROW
EXECUTE FUNCTION record_profile_love();

-- Profile love deletion trigger
CREATE TRIGGER profile_love_delete_trigger
AFTER DELETE ON profile_loves
FOR EACH ROW
EXECUTE FUNCTION handle_profile_love_deletion();

-- Review trigger
CREATE TRIGGER review_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION record_review();

-- Gift trigger
CREATE TRIGGER gift_trigger
AFTER INSERT ON gifts
FOR EACH ROW
EXECUTE FUNCTION record_gift();
```

## Frontend Implementation

The LadyDashboardFree component uses the enhanced `profileStatsService.ts` to fetch stats with percentage changes:

```typescript
export interface ProfileStats {
  profileViews: number;
  profileViewsChange: number;
  loves: number;
  lovesChange: number;
  reviews: number;
  reviewsChange: number;
  giftsReceived: number;
  giftsReceivedChange: number;
  gifts: number;
}

export const getProfileStats = async (userId: string): Promise<ProfileStats> => {
  try {
    // Fetch stats from profile_stats table
    const { data: statsData, error: statsError } = await supabase
      .from('profile_stats')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (statsData) {
      return {
        profileViews: statsData.views_current_week || 0,
        profileViewsChange: calculatePercentageChange(
          statsData.views_current_week, 
          statsData.views_previous_week
        ),
        loves: statsData.loves_current_week || 0,
        lovesChange: calculatePercentageChange(
          statsData.loves_current_week, 
          statsData.loves_previous_week
        ),
        // ... other stats with percentage changes
      };
    }
    
    // Fallback logic if no stats exist yet
    // ...
  } catch (error) {
    // Error handling
  }
};
```

The dashboard UI displays these stats with visual indicators for changes:

```tsx
<div className="text-sm text-gray-500 flex items-center gap-1">
  {dashboardData.stats.profileViewsChange > 0 ? (
    <>
      <ArrowUp className="h-3 w-3 text-green-500" />
      <span className="text-green-500">{dashboardData.stats.profileViewsChange}%</span>
    </>
  ) : dashboardData.stats.profileViewsChange < 0 ? (
    <>
      <ArrowUp className="h-3 w-3 text-red-500 transform rotate-180" />
      <span className="text-red-500">{Math.abs(dashboardData.stats.profileViewsChange)}%</span>
    </>
  ) : (
    <span>0%</span>
  )}
  {' vs last week'}
</div>
```

## Data Flow

1. **User Interaction**:
   - A user views, loves, reviews, or sends a gift to a lady's profile

2. **Database Triggers**:
   - Appropriate trigger fires based on the interaction
   - Activity record is created in the `activities` table
   - Weekly stats are updated in the `profile_stats` table

3. **Weekly Rotation**:
   - The `manual_rotate_weekly_stats` function is called weekly
   - Current week stats are moved to previous week
   - Current week counters are reset to zero

4. **Frontend Display**:
   - LadyDashboardFree component fetches stats via `getProfileStats`
   - Percentage changes are calculated comparing current to previous week
   - UI displays stats with appropriate visual indicators

## Maintenance and Scheduling

To ensure weekly stats rotation, one of these approaches should be implemented:

1. **External Cron Job**:
   - Set up a server-side cron job to call `manual_rotate_weekly_stats` every Sunday at midnight
   - This can be done via a serverless function or scheduled task

2. **Application Logic**:
   - Implement logic in the application to check if stats need rotation
   - When a user views their dashboard, check if a week has passed since the last rotation
   - If needed, call the rotation function and update the last rotation timestamp

## Security Considerations

- Row-Level Security (RLS) policies are applied to all tables
- Users can only view their own profile stats
- Activity records are created with appropriate permissions
- Love counts are protected from manipulation with proper database functions

## Future Enhancements

1. **Real-time Updates**:
   - Implement WebSockets for real-time notification of new activities
   - Update stats display without requiring page refresh

2. **Extended Time Periods**:
   - Add monthly and yearly stats comparison
   - Implement trend analysis for longer periods

3. **Advanced Analytics**:
   - Add geographical distribution of profile views
   - Track conversion rates (views to loves, loves to bookings)
   - Implement A/B testing for profile elements
