# 🎯 Real Profile Pages Implementation Plan

## 📋 Overview

This plan outlines how to convert the current mock profile pages (`/ladies/[id]`) into real, dynamic pages that pull data from the Supabase database. The implementation will ensure data synchronization across all related pages and components.

## 🗄️ Current Database Analysis

### ✅ **Available Tables for Profile Data**

Based on the database schema analysis, we have these key tables:

#### **Core Profile Tables:**
- `profiles` - Main profile information (name, location, image_url, rating, loves, description, price)
- `profile_details` - Extended profile data (age, height, weight, body_type, languages, ethnicity)
- `users` - User account data (email, username, role, membership_tier, credits)

#### **Profile-Related Tables:**
- `lady_services` - Services offered by ladies
- `lady_rates` - Pricing information
- `lady_availability` - Availability schedule
- `reviews` - Client reviews and ratings
- `review_replies` - Lady responses to reviews
- `profile_stats` - Weekly statistics (views, loves, reviews, gifts)
- `profile_views` - Profile view tracking
- `profile_loves` - Love/heart tracking
- `gifts` - Virtual gifts sent to ladies

#### **Current Data Status:**
- ✅ **10 profiles** exist in the database
- ✅ **Profile details** table is set up but mostly empty
- ✅ **Services, rates, availability** tables exist but need data
- ✅ **Reviews system** is implemented
- ✅ **Stats tracking** is functional

## 🎯 Implementation Strategy

### **Phase 1: Core Profile Data Integration**

#### **1.1 Update Advertisement.tsx Component**

**Current State:** Hardcoded mock data
**Target State:** Dynamic data from database

```typescript
// New data fetching structure
interface ProfileData {
  profile: {
    id: string;
    name: string;
    location: string;
    image_url: string | null;
    rating: number;
    loves: number;
    description: string | null;
    price: string | null;
  };
  details: {
    age: number | null;
    height: number | null;
    weight: number | null;
    body_type: string | null;
    languages: string[] | null;
    ethnicity: string | null;
  };
  services: Array<{
    id: string;
    service_name: string;
    is_available: boolean;
  }>;
  rates: Array<{
    id: string;
    duration: string;
    price: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    positives: string[];
    negatives: string[];
    author_name: string;
    created_at: string;
  }>;
  stats: {
    views_current_week: number;
    views_previous_week: number;
    loves_current_week: number;
    loves_previous_week: number;
  };
}
```

#### **1.2 Create Profile Data Service**

```typescript
// src/services/profileService.ts
export class ProfileService {
  static async getProfileById(profileId: string): Promise<ProfileData> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_details (*),
        lady_services (*),
        lady_rates (*),
        reviews (
          *,
          author:users!reviews_author_id_fkey (username)
        ),
        profile_stats (*)
      `)
      .eq('id', profileId)
      .single();

    if (error) throw error;
    return this.transformProfileData(profile);
  }

  static async getProfileImages(profileId: string): Promise<string[]> {
    // Fetch from media_items table or profile gallery
    const { data, error } = await supabase
      .from('media_items')
      .select('url')
      .eq('user_id', profileId)
      .eq('status', 'active');

    if (error) throw error;
    return data.map(item => item.url);
  }

  static async incrementProfileView(profileId: string, viewerId?: string): Promise<void> {
    // Record profile view for analytics
    await supabase.from('profile_views').insert({
      profile_id: profileId,
      viewer_id: viewerId,
      viewed_at: new Date().toISOString()
    });
  }
}
```

### **Phase 2: Dynamic Route Implementation**

#### **2.1 Update App.tsx Routing**

```typescript
// src/App.tsx - Add dynamic route
<Route path="/ladies/:id" element={<Advertisement />} />
```

#### **2.2 Update Advertisement.tsx Component**

```typescript
// src/pages/Advertisement.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProfileService } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

export default function Advertisement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/ladies');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await ProfileService.getProfileById(id);
        setProfileData(data);
        
        // Record profile view
        await ProfileService.incrementProfileView(id, user?.id);
      } catch (err) {
        setError('Profile not found');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, user?.id, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !profileData) {
    return <ErrorComponent message={error || 'Profile not found'} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <ProfileHeader data={profileData} />
      
      {/* Profile Gallery */}
      <ProfileGallery images={profileData.images} />
      
      {/* Profile Details */}
      <ProfileDetails data={profileData} />
      
      {/* Services & Rates */}
      <ServicesSection services={profileData.services} rates={profileData.rates} />
      
      {/* Reviews */}
      <ReviewsSection reviews={profileData.reviews} />
      
      {/* Action Buttons */}
      <ActionButtons profileId={id} />
    </div>
  );
}
```

### **Phase 3: Data Synchronization Strategy**

#### **3.1 Cross-Page Data Consistency**

**Problem:** Data needs to be consistent across:
- `/ladies/[id]` - Individual profile page
- `/ladies` - Ladies listing page  
- `/dashboard/lady/profile` - Lady's own profile management
- Search results
- Favorites lists

**Solution:** Implement centralized data management

```typescript
// src/contexts/ProfileDataContext.tsx
export const ProfileDataContext = createContext<{
  profiles: ProfileData[];
  updateProfile: (id: string, data: Partial<ProfileData>) => void;
  refreshProfile: (id: string) => Promise<void>;
}>({
  profiles: [],
  updateProfile: () => {},
  refreshProfile: async () => {},
});

export const ProfileDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [cache, setCache] = useState<Map<string, ProfileData>>(new Map());

  const updateProfile = (id: string, data: Partial<ProfileData>) => {
    setProfiles(prev => prev.map(p => p.profile.id === id ? { ...p, ...data } : p));
    setCache(prev => new Map(prev.set(id, { ...prev.get(id), ...data })));
  };

  const refreshProfile = async (id: string) => {
    const data = await ProfileService.getProfileById(id);
    updateProfile(id, data);
  };

  return (
    <ProfileDataContext.Provider value={{ profiles, updateProfile, refreshProfile }}>
      {children}
    </ProfileDataContext.Provider>
  );
};
```

#### **3.2 Real-time Updates**

```typescript
// src/services/realtimeService.ts
export class RealtimeService {
  static subscribeToProfileUpdates(profileId: string, callback: (data: ProfileData) => void) {
    return supabase
      .channel(`profile-${profileId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${profileId}` },
        (payload) => {
          // Refresh profile data when changes occur
          ProfileService.getProfileById(profileId).then(callback);
        }
      )
      .subscribe();
  }
}
```

### **Phase 4: Enhanced Features**

#### **4.1 Profile Analytics Integration**

```typescript
// Display real stats from profile_stats table
const ProfileStats = ({ stats }: { stats: ProfileStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard 
      title="Profile Views" 
      value={stats.views_current_week}
      change={stats.views_current_week - stats.views_previous_week}
    />
    <StatCard 
      title="Loves" 
      value={stats.loves_current_week}
      change={stats.loves_current_week - stats.loves_previous_week}
    />
    {/* More stats... */}
  </div>
);
```

#### **4.2 Interactive Features**

```typescript
// Love/Heart functionality
const handleLove = async () => {
  if (!user) {
    navigate('/login');
    return;
  }

  try {
    await supabase.from('profile_loves').insert({
      user_id: user.id,
      profile_id: profileData.profile.id
    });
    
    // Update local state
    setProfileData(prev => ({
      ...prev,
      profile: { ...prev.profile, loves: prev.profile.loves + 1 }
    }));
  } catch (error) {
    console.error('Error adding love:', error);
  }
};
```

#### **4.3 Booking Integration**

```typescript
// Booking functionality
const handleBooking = () => {
  if (!user) {
    navigate('/login');
    return;
  }

  // Navigate to booking page with profile data
  navigate(`/booking/${profileData.profile.id}`, {
    state: { profileData }
  });
};
```

### **Phase 5: Performance Optimization**

#### **5.1 Data Caching**

```typescript
// src/hooks/useProfileData.ts
export const useProfileData = (profileId: string) => {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const cache = useRef<Map<string, { data: ProfileData; timestamp: number }>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      const cached = cache.current.get(profileId);
      const now = Date.now();
      
      // Use cached data if less than 5 minutes old
      if (cached && (now - cached.timestamp) < 5 * 60 * 1000) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      try {
        const freshData = await ProfileService.getProfileById(profileId);
        cache.current.set(profileId, { data: freshData, timestamp: now });
        setData(freshData);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileId]);

  return { data, loading };
};
```

#### **5.2 Image Optimization**

```typescript
// src/components/OptimizedImage.tsx
export const OptimizedImage = ({ src, alt, ...props }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
```

## 🚀 Implementation Steps

### **Step 1: Database Preparation**
1. ✅ Verify all required tables exist
2. ✅ Check data integrity and relationships
3. ✅ Ensure RLS policies are correct
4. ✅ Test data access permissions

### **Step 2: Service Layer Implementation**
1. Create `ProfileService` class
2. Implement data fetching methods
3. Add error handling and validation
4. Create data transformation utilities

### **Step 3: Component Updates**
1. Update `Advertisement.tsx` to use real data
2. Add loading and error states
3. Implement dynamic routing with `useParams`
4. Add profile view tracking

### **Step 4: Data Synchronization**
1. Implement `ProfileDataContext`
2. Add real-time subscriptions
3. Create cache management system
4. Test cross-page data consistency

### **Step 5: Enhanced Features**
1. Add love/heart functionality
2. Implement booking integration
3. Add profile analytics display
4. Create interactive elements

### **Step 6: Performance Optimization**
1. Implement data caching
2. Add image optimization
3. Optimize database queries
4. Add lazy loading

### **Step 7: Testing & Validation**
1. Test with real database data
2. Verify all features work correctly
3. Test error scenarios
4. Performance testing

## 📊 Expected Results

### **Before Implementation:**
- ❌ Static mock data
- ❌ No database integration
- ❌ No real-time updates
- ❌ Limited functionality

### **After Implementation:**
- ✅ Dynamic data from database
- ✅ Real-time profile updates
- ✅ Cross-page data synchronization
- ✅ Full interactive features
- ✅ Performance optimized
- ✅ Scalable architecture

## 🔧 Technical Requirements

### **Database Requirements:**
- ✅ Supabase project with all tables
- ✅ Proper RLS policies
- ✅ Indexes for performance
- ✅ Real-time subscriptions enabled

### **Frontend Requirements:**
- ✅ React Router for dynamic routing
- ✅ Context API for state management
- ✅ Error boundaries for error handling
- ✅ Loading states for UX

### **Performance Requirements:**
- ✅ Data caching (5-minute TTL)
- ✅ Image optimization
- ✅ Lazy loading for large lists
- ✅ Efficient database queries

## 🎯 Success Metrics

1. **Data Accuracy:** All profile data matches database
2. **Performance:** Page load time < 2 seconds
3. **User Experience:** Smooth transitions and loading states
4. **Functionality:** All interactive features work correctly
5. **Scalability:** System handles 100+ concurrent users

## 📝 Next Steps

1. **Start with Phase 1** - Core profile data integration
2. **Implement service layer** - Create ProfileService
3. **Update components** - Convert Advertisement.tsx
4. **Add real-time features** - Implement subscriptions
5. **Optimize performance** - Add caching and optimization
6. **Test thoroughly** - Validate all functionality

This implementation will transform the mock profile pages into a fully functional, dynamic system that pulls real data from the database and provides an excellent user experience. 