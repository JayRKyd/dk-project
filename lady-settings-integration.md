# Lady Settings Page Integration Guide

This document provides instructions on how to integrate the Lady Settings page with the authenticated user system in the DateKelly application. The integration will ensure that the settings form loads the logged-in user's data and saves changes back to their profile.

## Overview

The Lady Settings page (`LadySettings.tsx`) currently uses static, hardcoded data. We need to modify it to:

1. Load the authenticated user's profile data when the component mounts
2. Update the user's profile when the form is submitted
3. Handle loading states and errors appropriately

## Implementation Steps

### 1. Import Required Hooks and Components

First, update the imports at the top of the `LadySettings.tsx` file to include the `useUserProfile` hook and other necessary components:

```tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowLeft,
  Loader
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../contexts/AuthContext';
```

### 2. Add Authentication Check

Add a check to redirect non-lady users away from this page:

```tsx
export default function LadySettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect if not a lady
  useEffect(() => {
    if (profile && profile.role !== 'lady') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);
```

### 3. Load User Profile Data

Add an effect to load the user's profile data when the component mounts:

```tsx
// Load profile data when component mounts
useEffect(() => {
  if (profile && !profileLoading) {
    // Map profile data to form data
    setFormData(prevFormData => ({
      ...prevFormData,
      displayName: profile.name || profile.username || '',
      bio: profile.description || '',
      // Map other fields from profile to form data
      // For fields that don't exist in the profile, keep the current form data
      
      // Example mappings:
      city: profile.location?.split(',')[0]?.trim() || prevFormData.city,
      area: profile.location?.split(',')[1]?.trim() || prevFormData.area,
      
      // For nested objects like rates, services, etc., you'll need to check
      // if they exist in the profile and map them accordingly
    }));
  }
}, [profile, profileLoading]);
```

### 4. Update the Form Submit Handler

Update the `handleSubmit` function to save the form data to the user's profile:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!profile) return;
  
  try {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    // Map form data to profile updates
    const profileUpdates = {
      name: formData.displayName,
      description: formData.bio,
      location: `${formData.city}, ${formData.area}`,
      // Map other form data to profile updates
    };
    
    // Save profile updates
    await updateProfile(profileUpdates);
    
    // Save additional data to other tables if needed
    // For example, services, rates, availability, etc.
    
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  } catch (error) {
    console.error('Error saving settings:', error);
    setSaveError('Failed to save settings. Please try again.');
  } finally {
    setSaving(false);
  }
};
```

### 5. Add Loading State

Add a loading state to the component to show a spinner while the profile is loading:

```tsx
// In the return statement, before the main content
if (profileLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader className="h-8 w-8 text-pink-500 animate-spin" />
      <span className="ml-2 text-lg">Loading settings...</span>
    </div>
  );
}
```

### 6. Add Success and Error Messages

Add success and error messages to provide feedback to the user:

```tsx
{/* Add this before the Submit Button */}
{saveSuccess && (
  <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
    <p>Settings saved successfully!</p>
  </div>
)}

{saveError && (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
    <p>{saveError}</p>
  </div>
)}

{/* Update the Submit Button */}
<button
  type="submit"
  className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
  disabled={saving}
>
  {saving ? (
    <span className="flex items-center justify-center">
      <Loader className="h-5 w-5 text-white animate-spin mr-2" />
      Saving...
    </span>
  ) : (
    'Save Changes'
  )}
</button>
```

## Database Schema Considerations

### Profile Data

The main user profile data is stored in the `profiles` table, which includes:
- `id`: The profile ID
- `user_id`: The user ID (from auth.users)
- `name`: The display name
- `location`: The location (city, area)
- `image_url`: The profile image URL
- `description`: The bio/description

### Additional Data

For more complex data like services, rates, and availability, you may need to create additional tables:

1. **Lady Details Table**: For physical attributes, languages, etc.
```sql
CREATE TABLE lady_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  category TEXT,
  age INTEGER,
  height INTEGER,
  weight INTEGER,
  cup_size TEXT,
  body_type TEXT,
  ethnicity TEXT,
  languages TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

2. **Services Table**: For services offered
```sql
CREATE TABLE lady_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  service_name TEXT,
  is_available BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

3. **Rates Table**: For pricing
```sql
CREATE TABLE lady_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  duration TEXT,
  price DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

4. **Availability Table**: For working days and hours
```sql
CREATE TABLE lady_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id),
  day_of_week TEXT,
  is_working BOOLEAN,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Complete Implementation Example

Here's a complete implementation example for the `LadySettings.tsx` component:

```tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// ... existing interfaces and initial form data ...

export default function LadySettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Redirect if not a lady
  useEffect(() => {
    if (profile && profile.role !== 'lady') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (!profile || profileLoading) return;

      try {
        // Load basic profile data
        const updatedFormData = {
          ...formData,
          displayName: profile.name || '',
          bio: profile.description || '',
        };

        // Load lady details if available
        const { data: ladyDetails, error: detailsError } = await supabase
          .from('lady_details')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (!detailsError && ladyDetails) {
          Object.assign(updatedFormData, {
            category: ladyDetails.category || 'Ladies',
            age: ladyDetails.age?.toString() || '',
            height: ladyDetails.height?.toString() || '',
            weight: ladyDetails.weight?.toString() || '',
            cupSize: ladyDetails.cup_size || '',
            bodyType: ladyDetails.body_type || '',
            ethnicity: ladyDetails.ethnicity || '',
            languages: ladyDetails.languages || [],
          });
        }

        // Load location data
        if (profile.location) {
          const [city = '', area = ''] = profile.location.split(',').map(s => s.trim());
          Object.assign(updatedFormData, { city, area });
        }

        // Load services
        const { data: services, error: servicesError } = await supabase
          .from('lady_services')
          .select('service_name, is_available')
          .eq('profile_id', profile.id);

        if (!servicesError && services && services.length > 0) {
          const servicesMap = services.reduce((acc, service) => {
            acc[service.service_name] = service.is_available;
            return acc;
          }, {} as Record<string, boolean>);

          Object.assign(updatedFormData, {
            services: { ...updatedFormData.services, ...servicesMap }
          });
        }

        // Load rates
        const { data: rates, error: ratesError } = await supabase
          .from('lady_rates')
          .select('duration, price')
          .eq('profile_id', profile.id);

        if (!ratesError && rates && rates.length > 0) {
          const ratesMap = rates.reduce((acc, rate) => {
            acc[rate.duration] = rate.price?.toString() || '';
            return acc;
          }, {} as Record<string, string>);

          Object.assign(updatedFormData, {
            rates: { ...updatedFormData.rates, ...ratesMap }
          });
        }

        // Load availability
        const { data: availability, error: availabilityError } = await supabase
          .from('lady_availability')
          .select('day_of_week, is_working, start_time, end_time')
          .eq('profile_id', profile.id);

        if (!availabilityError && availability && availability.length > 0) {
          const workingDays = { ...updatedFormData.workingDays };
          const workingHours = { ...updatedFormData.workingHours };

          availability.forEach(day => {
            const dayName = day.day_of_week.toLowerCase();
            workingDays[dayName] = day.is_working;
            
            if (day.is_working) {
              workingHours[dayName] = {
                start: day.start_time || '09:00',
                end: day.end_time || '22:00'
              };
            }
          });

          Object.assign(updatedFormData, { workingDays, workingHours });
        }

        setFormData(updatedFormData);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, [profile, profileLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      // Update basic profile information
      await updateProfile({
        name: formData.displayName,
        description: formData.bio,
        location: `${formData.city}, ${formData.area}`,
      });

      // Update or create lady details
      const { error: detailsError } = await supabase
        .from('lady_details')
        .upsert({
          profile_id: profile.id,
          category: formData.category,
          age: parseInt(formData.age) || null,
          height: parseInt(formData.height) || null,
          weight: parseInt(formData.weight) || null,
          cup_size: formData.cupSize,
          body_type: formData.bodyType,
          ethnicity: formData.ethnicity,
          languages: formData.languages,
          updated_at: new Date().toISOString()
        });

      if (detailsError) throw detailsError;

      // Update services - first delete existing services
      await supabase
        .from('lady_services')
        .delete()
        .eq('profile_id', profile.id);

      // Then insert new services
      const servicesToInsert = Object.entries(formData.services).map(([service_name, is_available]) => ({
        profile_id: profile.id,
        service_name,
        is_available: !!is_available,
      }));

      if (servicesToInsert.length > 0) {
        const { error: servicesError } = await supabase
          .from('lady_services')
          .insert(servicesToInsert);

        if (servicesError) throw servicesError;
      }

      // Update rates - first delete existing rates
      await supabase
        .from('lady_rates')
        .delete()
        .eq('profile_id', profile.id);

      // Then insert new rates
      const ratesToInsert = Object.entries(formData.rates)
        .filter(([_, price]) => price && price.trim() !== '')
        .map(([duration, price]) => ({
          profile_id: profile.id,
          duration,
          price: parseFloat(price) || 0,
        }));

      if (ratesToInsert.length > 0) {
        const { error: ratesError } = await supabase
          .from('lady_rates')
          .insert(ratesToInsert);

        if (ratesError) throw ratesError;
      }

      // Update availability - first delete existing availability
      await supabase
        .from('lady_availability')
        .delete()
        .eq('profile_id', profile.id);

      // Then insert new availability
      const availabilityToInsert = Object.entries(formData.workingDays)
        .map(([day_of_week, is_working]) => ({
          profile_id: profile.id,
          day_of_week,
          is_working: !!is_working,
          start_time: is_working ? formData.workingHours[day_of_week]?.start || '09:00' : null,
          end_time: is_working ? formData.workingHours[day_of_week]?.end || '22:00' : null,
        }));

      if (availabilityToInsert.length > 0) {
        const { error: availabilityError } = await supabase
          .from('lady_availability')
          .insert(availabilityToInsert);

        if (availabilityError) throw availabilityError;
      }

      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ... existing updateFormData function ...

  // Show loading state while profile is loading
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 text-pink-500 animate-spin" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Dashboard Link */}
      <Link to="/dashboard" className="inline-flex items-center text-gray-600 hover:text-pink-500 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row gap-6">
        {/* ... existing sidebar ... */}

        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {/* ... existing form content ... */}

            {/* Success and Error Messages */}
            {saveSuccess && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>Settings saved successfully!</p>
              </div>
            )}

            {saveError && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{saveError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <Loader className="h-5 w-5 text-white animate-spin mr-2" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

## Conclusion

By following this guide, you'll be able to integrate the Lady Settings page with the authenticated user system in the DateKelly application. The implementation ensures that:

1. The settings form loads the logged-in user's profile data
2. Changes are saved back to the user's profile
3. Loading states and errors are handled appropriately

Remember to create the necessary database tables if they don't already exist, and to update the database schema as needed to support all the features of the Lady Settings page.
