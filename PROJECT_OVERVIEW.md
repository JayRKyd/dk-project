# DateKelly Project Overview

## Project Description
DateKelly is a sophisticated dating and entertainment platform that connects clients with companions (referred to as "Ladies") and clubs. The platform offers various membership tiers, booking systems, and interactive features like fan posts, gifts, and reviews.

## Core Features

### 1. User Types & Roles
- **Ladies**: Companions who create profiles, receive bookings, and interact with clients
- **Clients**: Users who browse profiles, book appointments, and send gifts
- **Clubs**: Establishments that can list their venues and manage their entertainers
- **Advertisers**: Special accounts for promotional activities

### 2. Authentication System
- Email/Password registration and login
- Multi-step registration process
- Password recovery flow
- Email verification
- Role-based access control

### 3. Profile Management
- Detailed profiles with images, descriptions, and preferences
- Different profile types based on user role
- Public and private profile sections
- Profile verification system

### 4. Booking System
- Real-time availability calendar
- Appointment scheduling
- Booking management
- Notifications and reminders

### 5. Monetization Features
- Multiple membership tiers (FREE, PRO, PRO-PLUS, ULTRA)
- Credit-based system for bookings and gifts
- Payment processing integration
- Earnings tracking for ladies and clubs

### 6. Interactive Features
- Fan posts and subscriptions
- Virtual gifts
- Reviews and ratings
- Messaging system
- Favorites and bookmarks

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Icons**: Lucide Icons
- **Build Tool**: Vite

### Backend (Supabase)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL
- **Storage**: File storage for media
- **Realtime**: WebSocket connections for live updates

### Database Schema (Key Tables)

#### Users
- id (uuid)
- email (string)
- username (string)
- role (enum: 'lady' | 'client' | 'club' | 'advertiser')
- is_verified (boolean)
- membership_tier (enum: 'FREE' | 'PRO' | 'PRO-PLUS' | 'ULTRA')
- credits (number)
- created_at (timestamp)
- updated_at (timestamp)

#### Profiles
- id (uuid)
- user_id (uuid, foreign key)
- name (string)
- location (string)
- image_url (string)
- rating (number)
- loves (number)
- description (text)
- price (string)
- is_club (boolean)

#### Bookings
- id (uuid)
- client_id (uuid)
- lady_id (uuid)
- date_time (timestamp)
- duration (number)
- status (enum: 'pending' | 'confirmed' | 'completed' | 'cancelled')
- amount (number)
- created_at (timestamp)

#### Reviews
- id (uuid)
- booking_id (uuid)
- rating (number)
- comment (text)
- created_at (timestamp)
- is_anonymous (boolean)

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── AdCard.tsx
│   ├── CategoryList.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProfileCard.tsx
│   ├── ReviewCard.tsx
│   └── SearchBar.tsx
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── ForgotPassword.tsx
│   ├── dashboard/      # User dashboard pages
│   │   ├── lady/       # Lady-specific dashboard
│   │   ├── client/     # Client dashboard
│   │   └── club/       # Club management
│   ├── Advertisement.tsx
│   ├── Clubs.tsx
│   ├── Ladies.tsx
│   └── Search.tsx
├── lib/
│   ├── supabase.ts    # Supabase client
│   └── database.types.ts # Database type definitions
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```

## Key Components

### 1. Authentication Flow
- **Login**: Email/password authentication with role-based redirection
- **Registration**: Multi-step form collecting user details and preferences
- **Password Recovery**: Secure reset flow with email verification

### 2. Dashboard System
- **Lady Dashboard**: Profile management, booking calendar, earnings tracker
- **Client Dashboard**: Booking history, favorites, messages
- **Club Dashboard**: Venue management, entertainer profiles, promotions

### 3. Search & Discovery
- Advanced filtering by location, preferences, and availability
- Map integration for location-based searches
- Sorting and recommendation algorithms

### 4. Booking System
- Real-time availability checking
- Integrated calendar
- Payment processing
- Notifications and reminders

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development server: `npm run dev`

## Deployment

The application is designed to be deployed on Vercel, Netlify, or similar platforms. The Supabase backend handles all server-side functionality.

## Future Enhancements

1. Mobile app development
2. Video call functionality
3. Advanced analytics dashboard
4. Multi-language support
5. Enhanced security features

## Security Considerations

- All sensitive data is encrypted
- Role-based access control
- Secure authentication flows
- Regular security audits
- GDPR compliance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request
