# Club Dashboard Integration Guide

This document outlines how all the club dashboard pages tie into the main `/dashboard/club` page and work together to provide a comprehensive club management system.

## Overview

The Club Dashboard (`/dashboard/club`) serves as the central hub for all club management activities. It provides an overview of key metrics, quick actions, and links to specialized management pages.

## Main Dashboard Features

### Core Metrics Display
- **Profile Views**: Real-time analytics from `/dashboard/club/analytics`
- **Revenue Summary**: Financial data from analytics service
- **Bookings**: Upcoming appointments and calendar management
- **Ladies Count**: Total active ladies from `/dashboard/club/ladies`
- **DK Credits**: Current balance with links to credit management

### Quick Actions Hub
The dashboard provides direct navigation to all specialized management pages through:
- Quick action buttons
- Navigation menu items
- Contextual links within widgets

## Integrated Pages

### 1. `/dashboard/club/settings`
**Purpose**: Complete club profile and configuration management

**Integration with Main Dashboard**:
- Profile completion percentage widget
- Missing fields notifications
- Direct "Complete Setup" link when no profile exists
- "Club Settings" button in header

**Key Features**:
- Multi-tab interface (Club Info, Photos, Location, Facilities, Hours, Pricing)
- Real-time profile completion tracking
- Form validation and auto-save functionality

### 2. `/dashboard/club/ladies`
**Purpose**: Manage all ladies working at the club

**Integration with Main Dashboard**:
- Ladies count statistic
- Quick action button "Manage Ladies"
- Recent activity notifications for lady applications

**Key Features**:
- Lady listing with status filters (active, inactive, pending)
- Add/edit/remove ladies
- Performance metrics (ratings, loves, reviews)
- Photo management
- Status management

### 3. `/dashboard/club/promo`
**Purpose**: Create promotional advertisements and special offers

**Integration with Main Dashboard**:
- Quick action button "Create Promo"
- Marketing-focused interface
- Links to credit spending for promotion boosts

**Key Features**:
- Multiple promotion types (discount, special, event)
- Image upload and management
- Date range selection
- Pricing configuration

### 4. `/dashboard/club/settings` (Reviews Management)
**Purpose**: View and respond to club reviews

**Integration with Main Dashboard**:
- Reviews count in stats
- Quick action button "Reviews"
- Notification system for new reviews

**Key Features**:
- Review listing and filtering
- Response management
- Rating analytics
- Customer feedback tracking

### 5. `/dashboard/club/upgrade`
**Purpose**: Membership tier management and upgrades

**Integration with Main Dashboard**:
- Membership status widget showing current tier
- Days remaining progress bar
- "Upgrade Membership" call-to-action button
- Advertisement status tracking

**Key Features**:
- Tier comparison and benefits
- Payment processing
- Membership history
- Auto-renewal settings

### 6. `/dashboard/club/bump`
**Purpose**: Boost club advertisement visibility

**Integration with Main Dashboard**:
- "Bump Advertisement" button
- Direct integration with DK Credits system
- Visibility boost options

**Key Features**:
- Advertisement positioning options
- Credit cost calculation
- Boost duration selection
- Performance tracking

### 7. `/dashboard/club/analytics`
**Purpose**: Detailed analytics and reporting

**Integration with Main Dashboard**:
- Revenue & Analytics widget summary
- "View Detailed Analytics" link
- Key metrics display (views, growth)

**Key Features**:
- View analytics (daily/monthly/yearly)
- Revenue breakdown
- Growth trends
- Customer demographics
- Performance comparisons

### 8. `/dashboard/club/credits/buy`
**Purpose**: Purchase DK Credits for club operations

**Integration with Main Dashboard**:
- Current credit balance display
- "Buy Credits" button in DK Credits widget
- Credit spending notifications

**Key Features**:
- Credit package selection
- Payment processing
- Bulk purchase discounts
- Transaction confirmation

### 9. `/dashboard/club/credits/history`
**Purpose**: View credit transaction history

**Integration with Main Dashboard**:
- "Transaction History" link in DK Credits widget
- Spending pattern integration with analytics

**Key Features**:
- Transaction timeline
- Spending categories
- Credit earnings tracking
- Export functionality

### 10. `/dashboard/club/verify`
**Purpose**: Club verification process and status

**Integration with Main Dashboard**:
- "Verify Club" button in header
- Verification status indicators
- Trust score display

**Key Features**:
- Document upload
- Verification checklist
- Status tracking
- Compliance management

## Data Flow Integration

### State Management
The main dashboard uses the `useClubDashboard` hook which:
- Centralizes all data fetching
- Provides loading states for each section
- Handles error management
- Offers action methods for data updates

### Real-time Updates
- Analytics data refreshes automatically
- Credit balance updates after transactions
- Membership status reflects current state
- Notifications update in real-time

### Navigation Flow
```
/dashboard/club (Main Hub)
├── /settings (Profile Management)
├── /ladies (Staff Management)
├── /promo (Marketing)
├── /reviews (Customer Feedback)
├── /upgrade (Membership)
├── /bump (Advertisement Boost)
├── /analytics (Detailed Reports)
├── /credits/buy (Credit Purchase)
├── /credits/history (Transaction Log)
└── /verify (Verification Process)
```

## Key Integration Points

### 1. Credit System Integration
- All pages that require credits (promo, bump, upgrade) check balance
- Automatic redirect to credit purchase when insufficient funds
- Real-time balance updates across all pages

### 2. Membership Tier Restrictions
- Feature availability based on membership level
- Upgrade prompts when accessing premium features
- Progress tracking and expiration warnings

### 3. Profile Completion
- Guided setup process for new clubs
- Missing information warnings across relevant pages
- Completion incentives and progress tracking

### 4. Analytics Integration
- All user actions are tracked and reported
- Performance data feeds back into main dashboard
- Revenue tracking across all revenue-generating features

### 5. Notification System
- Centralized notification management
- Action-required notifications link to specific pages
- Read/unread status tracking

## User Experience Flow

### New Club Setup
1. Land on main dashboard → Profile setup prompt
2. Complete club settings → Profile completion tracking
3. Add ladies → Staff management
4. Create promotions → Marketing setup
5. Purchase credits → Operational readiness

### Daily Operations
1. Check main dashboard → Overview of key metrics
2. Manage bookings → Customer interactions
3. Monitor analytics → Performance tracking
4. Respond to reviews → Customer service
5. Adjust promotions → Marketing optimization

### Growth Activities
1. Analyze performance → Data-driven decisions
2. Upgrade membership → Enhanced features
3. Boost advertisements → Increased visibility
4. Expand staff → Capacity growth
5. Monitor ROI → Financial tracking

This integrated approach ensures that all club management activities are interconnected, providing a seamless experience for club owners while maintaining comprehensive oversight of their business operations. 