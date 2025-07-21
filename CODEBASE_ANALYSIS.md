# DateKelly - Comprehensive Codebase Analysis

## Project Overview
DateKelly is a sophisticated dating and entertainment platform connecting clients with companions ("Ladies") and clubs. This document provides an in-depth analysis of the codebase structure, components, and functionality.

## Core Features

### 1. User Types & Roles
- **Ladies**: Professional companions offering services
- **Clients**: Users booking services
- **Clubs**: Venues managing entertainers
- **Advertisers**: Promotional accounts

### 2. Membership Tiers
- **FREE**: Basic features with limitations
- **PRO**: Enhanced visibility and features
- **PRO-PLUS**: Premium features and priority
- **ULTRA**: Top-tier with all features

## Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API + Local State
- **Styling**: Tailwind CSS with custom theming
- **Routing**: React Router v6 with protected routes
- **Icons**: Lucide Icons
- **Build Tool**: Vite

### Backend (Supabase)
- **Authentication**: Email/Password & Social Logins
- **Database**: PostgreSQL with Row-Level Security
- **Storage**: File storage for media
- **Realtime**: WebSocket connections

## Codebase Structure

### Key Components

#### 1. Authentication
- **Login**: Email/password with role-based redirection
- **Registration**: Multi-step form with role selection
- **Password Recovery**: Secure reset flow

#### 2. Profile Management
- **ProfileCard**: Reusable component for displaying user profiles
  - Supports different membership tiers
  - Shows verification status
  - Displays ratings and likes
  - Responsive design

#### 3. Booking System
- **Booking Flow**:
  - Service selection with pricing
  - Date/time selection
  - Location (incall/outcall)
  - Contact information
  - Special requests
- **Service Catalog**:
  - Extensive service list
  - Dynamic pricing
  - Optional add-ons

#### 4. Dashboard System
- **Lady Dashboard**:
  - Booking management
  - Earnings tracking
  - Profile statistics
  - Service menu editor

- **Client Dashboard**:
  - Booking history
  - Favorites
  - Messages
  - Payment methods

- **Club Dashboard**:
  - Venue management
  - Entertainer roster
  - Promotions
  - Financial reports

## Database Schema

### Users Table
```typescript
{
  id: string;                    // UUID
  email: string;                 // User's email
  username: string;              // Unique username
  role: 'lady' | 'client' | 'club' | 'advertiser';
  is_verified: boolean;         // Email verification status
  membership_tier: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA';
  credits: number;              // Available credits
  client_number: string | null;  // Contact number
  created_at: string;            // Timestamp
  updated_at: string;            // Timestamp
}
```

### Profiles Table
```typescript
{
  id: string;                    // Profile ID
  user_id: string;               // Reference to users table
  name: string;                  // Display name
  location: string;              // Primary location
  image_url: string | null;      // Profile picture
  rating: number;                // 0-10 rating
  loves: number;                 // Number of likes
  description: string | null;    // Profile bio
  price: string | null;          // Starting price
  is_club: boolean;              // Club profile flag
  created_at: string;            // Timestamp
  updated_at: string;            // Timestamp
}
```

### Bookings Table
```typescript
{
  id: string;                    // Booking ID
  client_id: string;             // Client reference
  lady_id: string;               // Lady reference
  date_time: string;             // Booking start time
  duration: number;              // Minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  amount: number;               // Total in credits
  location_type: 'incall' | 'outcall' | 'online';
  special_requests?: string;     // Client notes
  cancellation_reason?: string;  // If cancelled
  created_at: string;            // Timestamp
  updated_at: string;            // Timestamp
}
```

## Key Implementation Details

### 1. Membership Tiers
- Visual distinction in UI
- Feature gating
- Tier-based permissions
- Upgrade paths

### 2. Booking System
- Real-time availability
- Service customization
- Multi-step booking flow
- Confirmation and notifications

### 3. Profile Management
- Rich media support
- Verification system
- Dynamic pricing
- Service menu configuration

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development server: `npm run dev`

## Areas for Improvement

1. **Testing**: Add comprehensive test coverage
2. **State Management**: Consider Redux or Zustand
3. **Performance**: Implement code splitting
4. **Accessibility**: Improve ARIA attributes
5. **Documentation**: Add JSDoc comments

## Security Considerations

- Input validation
- XSS protection
- CSRF protection
- Rate limiting
- Data encryption

## Future Enhancements

1. Mobile app development
2. Video call functionality
3. Advanced analytics
4. Multi-language support
5. Enhanced security features
