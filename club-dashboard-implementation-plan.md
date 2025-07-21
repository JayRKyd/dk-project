# Club Dashboard Implementation Plan

## Overview

This document outlines the complete implementation plan to transform the Club Dashboard from a static mock interface to a fully functional, real-time, Supabase-integrated management system for club owners.

## Current Status Assessment

### ✅ What's Working
- ✅ **Role-based routing**: Club users properly isolated to `/dashboard/club/*` routes
- ✅ **UI Layout**: Well-structured dashboard with proper sections
- ✅ **Navigation**: Links to club-specific pages (ladies, settings, etc.)
- ✅ **Visual Design**: Consistent with other dashboards
- ✅ **Basic Data Integration**: ClubDashboard now uses real Supabase data
- ✅ **Database Schema**: Complete club tables with relationships
- ✅ **Club Service**: Full CRUD operations for club data
- ✅ **Dashboard Hook**: State management and API integration

### 🔄 What Needs Implementation - REMAINING STATIC ELEMENTS

#### 🔴 **PRIORITY 1: Static Data Elements**

1. **DK Credits System**
   - **Current**: Hardcoded "170" credits
   - **Needs**: Real credits from users.credits column
   - **Implementation**: Add credits tracking, purchase history, spending logs

2. **Profile Completion Tracking**
   - **Current**: Static "85%" completion percentage
   - **Needs**: Dynamic calculation based on filled fields
   - **Implementation**: Profile completeness algorithm, missing items detection

3. **Membership Status & Expiration**
   - **Current**: Static "25 days remaining" and hardcoded progress bars
   - **Needs**: Real membership expiration dates and calculations
   - **Implementation**: Membership tracking table, expiration logic

4. **Advertisement Status**
   - **Current**: Static "Active" status and hardcoded progress
   - **Needs**: Real advertisement status, expiration tracking
   - **Implementation**: Advertisement management system

5. **Profile Views Counter**
   - **Current**: Using total_revenue as proxy for views (placeholder)
   - **Needs**: Real profile view tracking system
   - **Implementation**: View tracking table, analytics

6. **Revenue Calculations**
   - **Current**: Basic revenue from bookings only
   - **Needs**: Comprehensive revenue tracking (fees, commissions, etc.)
   - **Implementation**: Financial transaction system

#### 🔴 **PRIORITY 2: Interactive Elements**

7. **Image Upload Functionality**
   - **Current**: Camera icon overlay but no actual upload
   - **Needs**: Real image upload to Supabase Storage
   - **Implementation**: File upload service, image management

8. **Credit Purchase System**
   - **Current**: "Buy More Credits" link goes nowhere
   - **Needs**: Payment integration and credit purchasing
   - **Implementation**: Payment gateway, credit transaction system

9. **Notification Interaction**
   - **Current**: Basic click to mark as read
   - **Needs**: Full notification management (delete, actions, etc.)
   - **Implementation**: Enhanced notification system

10. **Real-time Updates**
    - **Current**: Static data on page load
    - **Needs**: Live updates for bookings, notifications, activity
    - **Implementation**: WebSocket or polling system

#### 🔴 **PRIORITY 3: Missing Features**

11. **Club Verification System**
    - **Current**: "Verify Club" button placeholder
    - **Needs**: Actual verification process and status tracking
    - **Implementation**: Verification workflow, document upload

12. **Lady Application Management**
    - **Current**: No actual lady management
    - **Needs**: Lady application review, approval/rejection
    - **Implementation**: Application workflow system

13. **Performance Analytics**
    - **Current**: Basic stats only
    - **Needs**: Comprehensive analytics dashboard
    - **Implementation**: Analytics service, charts, reporting

14. **Financial Dashboard**
    - **Current**: Basic revenue display
    - **Needs**: Detailed financial tracking and reporting
    - **Implementation**: Financial management system

### 📋 **DETAILED IMPLEMENTATION PLAN FOR STATIC ELEMENTS**

## Phase 1: Core Static Elements (Week 1)

### 1.1 DK Credits System

#### Database Updates
```sql
-- Add credits transaction tracking
CREATE TABLE club_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'spend', 'refund', 'bonus')),
  amount integer NOT NULL,
  description text,
  reference_id uuid, -- booking_id, promotion_id, etc.
  created_at timestamptz DEFAULT now()
);
```

#### Service Implementation
```typescript
// src/services/creditService.ts
export const creditService = {
  async getUserCredits(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data.credits;
  },

  async getCreditHistory(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('club_credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async spendCredits(userId: string, amount: number, description: string, referenceId?: string) {
    // Implementation for spending credits
  },

  async addCredits(userId: string, amount: number, description: string) {
    // Implementation for adding credits
  }
};
```

### 1.2 Profile Completion System

#### Completion Algorithm
```typescript
// src/utils/profileCompletion.ts
export const calculateProfileCompletion = (clubProfile: ClubProfile): {
  percentage: number;
  missingItems: string[];
  completedItems: string[];
} => {
  const requiredFields = [
    { key: 'name', label: 'Club name', weight: 15 },
    { key: 'description', label: 'Club description', weight: 10 },
    { key: 'address', label: 'Club address', weight: 10 },
    { key: 'phone', label: 'Phone number', weight: 10 },
    { key: 'email', label: 'Contact email', weight: 10 },
    { key: 'logo_url', label: 'Club logo', weight: 15 },
    { key: 'cover_photo_url', label: 'Cover photo', weight: 10 },
    { key: 'license_number', label: 'License number', weight: 10 },
    { key: 'website', label: 'Website URL', weight: 5 }
  ];

  const verification = {
    key: 'verification_status',
    label: 'Club verification',
    weight: 15,
    isComplete: clubProfile.verification_status === 'verified'
  };

  let totalWeight = 0;
  let completedWeight = 0;
  const missingItems: string[] = [];
  const completedItems: string[] = [];

  // Check regular fields
  requiredFields.forEach(field => {
    totalWeight += field.weight;
    const value = clubProfile[field.key as keyof ClubProfile];
    
    if (value && value.toString().trim() !== '') {
      completedWeight += field.weight;
      completedItems.push(field.label);
    } else {
      missingItems.push(field.label);
    }
  });

  // Check verification
  totalWeight += verification.weight;
  if (verification.isComplete) {
    completedWeight += verification.weight;
    completedItems.push(verification.label);
  } else {
    missingItems.push(verification.label);
  }

  const percentage = Math.round((completedWeight / totalWeight) * 100);

  return {
    percentage,
    missingItems,
    completedItems
  };
};
```

### 1.3 Membership & Advertisement Status

#### Database Updates
```sql
-- Add membership tracking
CREATE TABLE club_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('BASIC', 'PRO', 'PREMIUM')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add advertisement tracking
CREATE TABLE club_advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES clubs(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  views_count integer DEFAULT 0,
  clicks_count integer DEFAULT 0,
  last_bumped_at timestamptz,
  bump_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

#### Service Implementation
```typescript
// src/services/membershipService.ts
export const membershipService = {
  async getCurrentMembership(userId: string) {
    const { data, error } = await supabase
      .from('club_memberships')
      .select('*')
      .eq('user_id', userId)
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getDaysRemaining(userId: string): Promise<number> {
    const membership = await this.getCurrentMembership(userId);
    if (!membership) return 0;
    
    const now = new Date();
    const endDate = new Date(membership.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  },

  async getMembershipProgress(userId: string): Promise<number> {
    const membership = await this.getCurrentMembership(userId);
    if (!membership) return 0;
    
    const now = new Date();
    const startDate = new Date(membership.start_date);
    const endDate = new Date(membership.end_date);
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  }
};
```

### 1.4 View Tracking System

#### Database Updates
```sql
-- Add view tracking
CREATE TABLE club_profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES clubs(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  viewer_ip inet,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX club_profile_views_club_id_date_idx ON club_profile_views(club_id, created_at);
```

#### Service Implementation
```typescript
// src/services/analyticsService.ts
export const analyticsService = {
  async trackProfileView(clubId: string, viewerId?: string, metadata?: any) {
    const { error } = await supabase
      .from('club_profile_views')
      .insert({
        club_id: clubId,
        viewer_id: viewerId,
        viewer_ip: metadata?.ip,
        user_agent: metadata?.userAgent,
        referrer: metadata?.referrer
      });
    
    if (error) throw error;
  },

  async getProfileViews(clubId: string, timeframe: 'day' | 'week' | 'month' = 'month') {
    const timeAgo = new Date();
    switch (timeframe) {
      case 'day':
        timeAgo.setDate(timeAgo.getDate() - 1);
        break;
      case 'week':
        timeAgo.setDate(timeAgo.getDate() - 7);
        break;
      case 'month':
        timeAgo.setMonth(timeAgo.getMonth() - 1);
        break;
    }

    const { data, error } = await supabase
      .from('club_profile_views')
      .select('id', { count: 'exact' })
      .eq('club_id', clubId)
      .gte('created_at', timeAgo.toISOString());
    
    if (error) throw error;
    return data?.length || 0;
  }
};
```

## Phase 2: Interactive Elements (Week 2)

### 2.1 Image Upload System
```typescript
// src/services/imageUploadService.ts
export const imageUploadService = {
  async uploadClubLogo(clubId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clubId}/logo.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('club-images')
      .upload(fileName, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('club-images')
      .getPublicUrl(fileName);
    
    // Update club profile with new logo URL
    await clubService.updateClubProfile(clubId, { logo_url: publicUrl });
    
    return publicUrl;
  }
};
```

### 2.2 Credit Purchase Integration
```typescript
// src/services/paymentService.ts
export const paymentService = {
  async createCreditPurchase(userId: string, creditAmount: number, paymentMethod: string) {
    // Integration with payment gateway (Stripe/PayPal)
    // Create payment session
    // Handle successful payment
    // Add credits to user account
  }
};
```

## Phase 3: Advanced Features (Week 3)

### 3.1 Real-time Updates
### 3.2 Verification System
### 3.3 Analytics Dashboard
### 3.4 Financial Management

## Implementation Timeline

- **Week 1**: Static elements (credits, completion, membership, views)
- **Week 2**: Interactive elements (uploads, payments, notifications)
- **Week 3**: Advanced features (real-time, verification, analytics)
- **Week 4**: Testing, optimization, and polish

## Success Metrics

- [ ] All hardcoded values replaced with real data
- [ ] Profile completion accurately calculated
- [ ] Membership status dynamically updated
- [ ] Credits system fully functional
- [ ] View tracking implemented
- [ ] Image uploads working
- [ ] Real-time updates active
- [ ] All interactive elements functional

## Notes

This plan ensures a systematic approach to removing all static elements and creating a fully dynamic, data-driven club dashboard experience. 