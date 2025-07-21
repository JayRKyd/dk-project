# Profile Stats and Activities Implementation Plan

This document outlines the implementation plan for adding profile stats tracking with percentage calculations and activities/notifications tracking to the LadyDashboardFree component.

## 1. Profile Stats Tracking

### Database Requirements

1. **Create a `profile_stats` Table**
   ```sql
   CREATE TABLE public.profile_stats (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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

2. **Create a `profile_views` Table to Track Individual Views**
   ```sql
   CREATE TABLE public.profile_views (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
     viewed_at TIMESTAMPTZ DEFAULT now(),
     is_anonymous BOOLEAN DEFAULT false
   );
   ```

### Service Implementation

1. **Enhance `profileStatsService.ts`**
   - Add functions to fetch stats with percentage changes
   - Add functions to record new profile views
   - Add weekly stats aggregation logic

2. **Stats Calculation Logic**
   - Calculate percentage changes between current and previous periods
   - Handle edge cases (zero previous values, etc.)
   - Format numbers for display

### UI Implementation

1. **Update Stats Grid in LadyDashboardFree**
   - Replace hardcoded percentage values with calculated ones
   - Add proper loading states and error handling
   - Format numbers consistently

## 2. Activities and Notifications Tracking

### Database Requirements

1. **Create an `activities` Table**
   ```sql
   CREATE TABLE public.activities (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
     user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
     type TEXT NOT NULL CHECK (type IN ('view', 'love', 'message', 'gift', 'review', 'booking')),
     data JSONB DEFAULT NULL,
     is_read BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ```

2. **Create Indexes for Efficient Queries**
   ```sql
   CREATE INDEX activities_profile_id_idx ON public.activities(profile_id);
   CREATE INDEX activities_created_at_idx ON public.activities(created_at);
   CREATE INDEX activities_is_read_idx ON public.activities(is_read);
   ```

### Service Implementation

1. **Create `notificationsService.ts`**
   - Add functions to fetch recent activities
   - Add functions to mark activities as read
   - Add functions to create new activity records

2. **Activity Creation Triggers**
   - Implement logic to create activity records when:
     - A profile is viewed
     - A profile receives a love
     - A message is received
     - A gift is received
     - A review is received
     - A booking is made

### UI Implementation

1. **Update Recent Activity Section in LadyDashboardFree**
   - Connect to the new activities service
   - Display activities with appropriate icons
   - Show real timestamps with relative time formatting

2. **Update Notifications Section in LadyDashboardFree**
   - Connect to the new notifications service
   - Display unread notifications with appropriate styling
   - Add ability to mark notifications as read

## Implementation Phases

### Phase 1: Database Setup
- Create the required tables and indexes
- Set up test data for development

### Phase 2: Service Implementation
- Implement the enhanced profileStatsService
- Implement the new notificationsService
- Add unit tests for both services

### Phase 3: UI Integration
- Update the Stats Grid to use real data with percentages
- Update the Recent Activity section to use the activities service
- Update the Notifications section to use the notifications service

### Phase 4: Testing and Refinement
- Test with various user profiles and data scenarios
- Optimize queries for performance
- Add any missing features or edge case handling

## Next Steps After Implementation

1. **Real-time Updates**
   - Consider implementing WebSockets for real-time notifications

2. **Notification Preferences**
   - Add user preferences for notification types

3. **Activity Analytics**
   - Consider adding analytics dashboards for activity trends
