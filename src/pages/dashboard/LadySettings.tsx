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
  CheckCircle,
  XCircle
} from 'lucide-react';

import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../lib/supabase';
import { uploadImage, uploadMultipleImages } from '../../services/imageService';

interface FormData {
  // Profile
  displayName: string;
  bio: string;
  category: 'Ladies' | 'Transsexuals';
  age: string;
  height: string;
  weight: string;
  cupSize: string;
  bodyType: string;
  ethnicity: string;
  languages: string[];
  
  // Location
  city: string;
  area: string;
  incall: boolean;
  outcall: boolean;
  travelFee: string;
  
  // Services and Rates
  rates: {
    [key: string]: string;
  };
  services: {
    [key: string]: boolean | string;
  };
  
  // Availability
  workingDays: {
    [key: string]: boolean;
  };
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
}

const initialFormData: FormData = {
  displayName: 'Melissa',
  bio: 'Hi, I\'m Melissa! I love going out and I\'m looking for fun partners to enjoy some time together.',
  category: 'Ladies',
  age: '22',
  height: '170',
  weight: '50',
  cupSize: 'B',
  bodyType: 'Slim',
  ethnicity: 'Bulgarian',
  languages: ['English', 'Bulgarian', 'Italian'],
  
  city: 'Amsterdam',
  area: 'Keizersgracht',
  incall: true,
  outcall: true,
  travelFee: '50',
  
  rates: {
    '15min': '50',
    '20min': '',
    '30min': '100',
    '1hour': '130',
    '2hours': '250',
    '3hours': '',
    '6hours': '',
    '12hours': '',
    'night': '600',
    'weekend': ''
  },
  
  services: {
    'Service for Men': true,
    'Service for Ladies': true,
    'Girlfriend Experience': true,
    'Striptease': true,
    'Fingering': true,
    'Handjob': true,
    'Kissing': true,
    'French kissing': false,
    'Pussy licking': true,
    'Rimming (me)': true,
    'Rimming (client)': false,
    'Blowjob with condom': true,
    'Blowjob without condom': true,
    'Deep Throat': true,
    'Sex with condom': true,
    'Sex without condom': false,
    'Anal sex (me)': false,
    'Anal sex without condom (me)': false,
    'Anal sex (client)': false,
    'Cum on body': true,
    'Cum on face': false,
    'Cum in mouth': false,
    'Swallowing': false,
    'Relaxing Massage': true,
    'Erotic Massage': true,
    'Anal Massage': false,
    'Dildo (me)': true,
    'Dildo (client)': false,
    'Trio MFF': false,
    'Trio MMF': false,
    'Groupsex': false,
    'Photo\'s': false,
    'Video': false,
    'High Heels': true,
    'Role Play': false,
    'Soft SM': false,
    'BDSM': false,
    'Domina & Slave': false,
    'Golden Shower (me)': false,
    'Golden Shower (client)': false,
    'I visit you at home': true,
    'I visit you at hotel': true,
    'Car sex': false,
    'Outdoor sex': false
  },
  
  workingDays: {
    monday: false,
    tuesday: false,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  },
  
  workingHours: {
    wednesday: { start: '09:00', end: '22:00' },
    thursday: { start: '09:00', end: '22:00' },
    friday: { start: '09:00', end: '24:00' },
    saturday: { start: '09:00', end: '24:00' },
    sunday: { start: '09:00', end: '24:00' }
  }
};

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'services', label: 'Services & Rates', icon: DollarSign },
  { id: 'availability', label: 'Availability', icon: Clock }
] as const;

type TabId = typeof tabs[number]['id'];

export default function LadySettings() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{text: string; type: 'success' | 'error' | 'info' | null}>({text: '', type: null});

  // Redirect if not a lady
  useEffect(() => {
    if (profile && profile.role !== 'lady') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Load gallery images
  useEffect(() => {
    const fetchGalleryImages = async () => {
      if (!profile) return;
      
      try {
        // Fetch gallery images from storage
        const { data, error } = await supabase.storage
          .from('gallery-images')
          .list(profile.id, {
            sortBy: { column: 'name', order: 'asc' }
          });

        if (error) throw error;

        // Get public URLs for all images
        if (data && data.length > 0) {
          const imageUrls = data.map(file => {
            const { data: urlData } = supabase.storage
              .from('gallery-images')
              .getPublicUrl(`${profile.id}/${file.name}`);
            return urlData.publicUrl;
          });

          setGalleryImages(imageUrls);
        }
      } catch (error) {
        console.error('Error fetching gallery images:', error);
      }
    };

    fetchGalleryImages();
  }, [profile]);

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
        const { data: profileDetails, error: detailsError } = await supabase
          .from('profile_details')
          .select('*')
          .eq('profile_id', profile.id)
          .single();

        if (!detailsError && profileDetails) {
          Object.assign(updatedFormData, {
            category: profileDetails.category || 'Ladies',
            age: profileDetails.age?.toString() || '',
            height: profileDetails.height?.toString() || '',
            weight: profileDetails.weight?.toString() || '',
            cupSize: profileDetails.cup_size || '',
            bodyType: profileDetails.body_type || '',
            ethnicity: profileDetails.ethnicity || '',
            languages: profileDetails.languages || [],
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

      // Update or create profile details
      const { error: detailsError } = await supabase
        .from('profile_details')
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

  const updateFormData = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

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

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-pink-500 text-white'
                  : 'hover:bg-pink-50 text-gray-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content for each tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      {/* Category Selection */}
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value="Ladies"
                            checked={formData.category === 'Ladies'}
                            onChange={(e) => updateFormData(['category'], e.target.value)}
                            className="text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2">Ladies</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value="Transsexuals" 
                            checked={formData.category === 'Transsexuals'}
                            onChange={(e) => updateFormData(['category'], e.target.value)}
                            className="text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2">Transsexuals</span>
                        </label>
                      </div>
                      {/* Display Name */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => updateFormData(['displayName'], e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      {/* Age */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => updateFormData(['age'], e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      About Me (Advertisement text)
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => updateFormData(['bio'], e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>

                  {/* Physical Characteristics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => updateFormData(['height'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => updateFormData(['weight'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cup Size
                      </label>
                      <select
                        value={formData.cupSize}
                        onChange={(e) => updateFormData(['cupSize'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        {['A', 'B', 'C', 'D', 'DD', 'E', 'F'].map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Type
                      </label>
                      <select
                        value={formData.bodyType}
                        onChange={(e) => updateFormData(['bodyType'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        {['Slim', 'Athletic', 'Average', 'Curvy', 'BBW'].map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ethnicity
                      </label>
                      <select
                        value={formData.ethnicity}
                        onChange={(e) => updateFormData(['ethnicity'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        {[
                          'Asian',
                          'Black',
                          'Bulgarian',
                          'Caucasian',
                          'Hispanic',
                          'Indian',
                          'Middle Eastern',
                          'Mixed'
                        ].map((ethnicity) => (
                          <option key={ethnicity} value={ethnicity}>{ethnicity}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        'English',
                        'Dutch',
                        'German',
                        'French',
                        'Spanish',
                        'Italian',
                        'Romanian',
                        'Bulgarian',
                        'Russian',
                        'Arabic',
                        'Chinese',
                        'Japanese'
                      ].map((language) => (
                        <label key={language} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.languages.includes(language)}
                            onChange={(e) => {
                              const newLanguages = e.target.checked
                                ? [...formData.languages, language]
                                : formData.languages.filter(lang => lang !== language);
                              updateFormData(['languages'], newLanguages);
                            }}
                            className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="ml-2 text-gray-700">{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Photos</h2>
                
                {/* Success/Error Messages */}
                {photoMessage.text && (
                  <div className={`mb-4 p-4 rounded-lg flex items-center ${
                    photoMessage.type === 'success' ? 'bg-green-100 text-green-700 border-l-4 border-green-500' :
                    photoMessage.type === 'error' ? 'bg-red-100 text-red-700 border-l-4 border-red-500' :
                    'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                  }`}>
                    {photoMessage.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {photoMessage.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                    {photoMessage.type === 'info' && <Loader className="h-5 w-5 mr-2 animate-spin" />}
                    <p>{photoMessage.text}</p>
                  </div>
                )}
                
                {/* Photo Grid */}
                <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-2"></div>
                        <span className="text-sm text-gray-700">Uploading photo...</span>
                      </div>
                    </div>
                  )}
                  {/* Main Photo Upload */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                    {profile?.image_url ? (
                      <>
                        <img 
                          src={`${profile.image_url}?t=${Date.now()}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover profile-main-img"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-white font-medium z-10 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">Main Photo</span>
                          <label className="cursor-pointer p-2 bg-pink-500 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/jpeg,image/png,image/webp"
                              onChange={async (e) => {
                                // Prevent form submission
                                e.preventDefault();
                                e.stopPropagation();
                                
                                if (!profile || !e.target.files || e.target.files.length === 0) return;
                                
                                try {
                                  setIsUploadingPhoto(true);
                                  setPhotoMessage({text: 'Uploading main photo...', type: 'info'});
                                  
                                  const file = e.target.files[0];
                                  
                                  // Upload to Supabase
                                  const { url } = await uploadImage(file, 'profile-pictures', '', profile.id);
                                  
                                  // Clear the file input
                                  e.target.value = '';
                                  
                                  // Update profile with new image URL
                                  await updateProfile({ 
                                    image_url: url
                                  });
                                  
                                  // Force re-render by adding a timestamp to the image URL
                                  const imgElement = document.querySelector('.profile-main-img') as HTMLImageElement;
                                  if (imgElement) {
                                    imgElement.src = `${url}?t=${Date.now()}`;
                                  }
                                  
                                  setPhotoMessage({text: 'Main photo updated successfully!', type: 'success'});
                                  setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                                } catch (error) {
                                  console.error('Error uploading main photo:', error);
                                  setPhotoMessage({
                                    text: error instanceof Error ? error.message : 'Failed to upload photo',
                                    type: 'error'
                                  });
                                  setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                                } finally {
                                  setIsUploadingPhoto(false);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-full hover:bg-gray-200 transition-colors">
                        <Camera className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-base font-medium text-gray-700">Main Photo</span>
                        <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/webp"
                          onChange={async (e) => {
                            if (!profile || !e.target.files || e.target.files.length === 0) return;
                            
                            try {
                              setIsUploadingPhoto(true);
                              setPhotoMessage({text: 'Uploading main photo...', type: 'info'});
                              
                              const file = e.target.files[0];
                              const { url } = await uploadImage(file, 'profile-pictures', '', profile.id);
                              
                              // Update profile with new image URL
                              await updateProfile({ image_url: url });
                              
                              setPhotoMessage({text: 'Main photo updated successfully!', type: 'success'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                            } catch (error) {
                              console.error('Error uploading main photo:', error);
                              setPhotoMessage({
                                text: error instanceof Error ? error.message : 'Failed to upload photo',
                                type: 'error'
                              });
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                            } finally {
                              setIsUploadingPhoto(false);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                  
                  {/* Gallery Photos */}
                  {galleryImages.map((imageUrl, index) => (
                    <div key={`gallery-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                      <img 
                        src={imageUrl.includes('?t=') ? imageUrl : `${imageUrl}?t=${Date.now()}`} 
                        alt={`Gallery ${index + 1}`} 
                        className="w-full h-full object-cover gallery-img"
                        data-index={index}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button"
                          className="p-2 bg-red-500 bg-opacity-80 rounded-full"
                          onClick={async (e) => {
                            // Prevent form submission
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (!profile) return;
                            
                            try {
                              setPhotoMessage({text: 'Deleting photo...', type: 'info'});
                              
                              // Get the base URL without cache-busting parameters
                              const baseUrl = imageUrl.split('?')[0];
                              
                              // Extract filename from URL
                              const filename = baseUrl.split('/').pop();
                              if (!filename) throw new Error('Invalid image URL');
                              
                              // Delete from storage
                              const { error } = await supabase.storage
                                .from('gallery-images')
                                .remove([`${profile.id}/${filename}`]);
                                
                              if (error) throw error;
                              
                              // Update state - filter by base URL to handle cache-busting parameters
                              setGalleryImages(prev => prev.filter(url => !url.startsWith(baseUrl)));
                              setPhotoMessage({text: 'Photo deleted successfully!', type: 'success'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                            } catch (error) {
                              console.error('Error deleting photo:', error);
                              setPhotoMessage({
                                text: error instanceof Error ? error.message : 'Failed to delete photo',
                                type: 'error'
                              });
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                            }
                          }}
                        >
                          <XCircle className="h-6 w-6 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Gallery Photo */}
                  {galleryImages.length < 6 && (
                    <label className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                      <Camera className="h-12 w-12 text-gray-400 mb-3" />
                      <span className="text-base font-medium text-gray-700">Add Photo</span>
                      <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={async (e) => {
                          // Prevent form submission
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (!profile || !e.target.files || e.target.files.length === 0) return;
                          
                          try {
                            setIsUploadingPhoto(true);
                            setPhotoMessage({text: 'Uploading gallery photos...', type: 'info'});
                            
                            // Convert FileList to array
                            const files = Array.from(e.target.files);
                            
                            // Check if adding these would exceed the limit
                            if (galleryImages.length + files.length > 6) {
                              throw new Error(`You can only have up to 6 gallery photos. You can add ${6 - galleryImages.length} more.`);
                            }
                            
                            // Upload all files with watermark
                            const uploadedImages = await uploadMultipleImages(files, 'gallery-images', profile.id, profile.id);
                            
                            // Clear the file input
                            e.target.value = '';
                            
                            // Update state with new URLs and add timestamp to prevent caching
                            const newUrls = uploadedImages.map(img => `${img.url}?t=${Date.now()}`);
                            setGalleryImages(prev => [...prev, ...newUrls]);
                            
                            setPhotoMessage({text: 'Gallery photos uploaded successfully!', type: 'success'});
                            setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                          } catch (error) {
                            console.error('Error uploading gallery photos:', error);
                            setPhotoMessage({
                              text: error instanceof Error ? error.message : 'Failed to upload photos',
                              type: 'error'
                            });
                            setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                          } finally {
                            setIsUploadingPhoto(false);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="bg-pink-50 rounded-lg p-4 text-sm text-gray-600">
                  <h3 className="font-medium text-gray-900 mb-2">Photo Guidelines:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Maximum 7 photos allowed</li>
                    <li>First photo will be your main profile photo</li>
                    <li>Photos must be clear and recent</li>
                    <li>No explicit nudity allowed</li>
                    <li>No watermarks or text overlays</li>
                    <li>Minimum resolution: 800x600 pixels</li>
                    <li>Maximum file size: 5MB per photo</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'location' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Location</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateFormData(['city'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area
                      </label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => updateFormData(['area'], e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Visit Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.incall}
                          onChange={(e) => updateFormData(['incall'], e.target.checked)}
                          className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="ml-2 text-gray-700">Incall (Clients visit you)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.outcall}
                          onChange={(e) => updateFormData(['outcall'], e.target.checked)}
                          className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                        />
                        <span className="ml-2 text-gray-700">Outcall (You visit clients)</span>
                      </label>
                    </div>
                  </div>

                  {formData.outcall && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center justify-between">
                          <span>Travel Fee for Escort/Outcall</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.travelFee !== '0'}
                              onChange={(e) => updateFormData(['travelFee'], e.target.checked ? '50' : '0')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                      </label>
                      <div className={`flex items-center gap-2 mt-2 ${formData.travelFee === '0' ? 'opacity-50' : ''}`}>
                        <span className="text-gray-500">€</span>
                        <select
                          value={formData.travelFee}
                          onChange={(e) => updateFormData(['travelFee'], e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-100"
                          disabled={formData.travelFee === '0'}
                        >
                          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((fee) => (
                            <option key={fee} value={fee}>{fee}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Services & Rates</h2>
                {/* Rates Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: '15min', label: '15 min' },
                      { key: '20min', label: '20 min' },
                      { key: '30min', label: '30 min' },
                      { key: '1hour', label: '1 hour' },
                      { key: '2hours', label: '2 hours' },
                      { key: '3hours', label: '3 hours' },
                      { key: '6hours', label: '6 hours' },
                      { key: '12hours', label: '12 hours' },
                      { key: 'night', label: 'Whole night' },
                      { key: 'weekend', label: 'Weekend' }
                    ].map(({ key, label }) => (
                      <div key={key} className="bg-pink-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            {label}
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.rates[key] !== ''}
                              onChange={(e) => updateFormData(
                                ['rates', key],
                                e.target.checked ? (formData.rates[key] || '50') : ''
                              )}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                        <div className={`flex items-center ${formData.rates[key] === '' ? 'opacity-50' : ''}`}>
                          <span className="text-gray-500 mr-2">€</span>
                          <input
                            type="number"
                            value={formData.rates[key]}
                            onChange={(e) => updateFormData(['rates', key], e.target.value)}
                            className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            disabled={formData.rates[key] === ''}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Services Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {Object.entries(formData.services).map(([service, included]) => (
                      <div key={service} className="py-2 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={included !== false}
                              onChange={(e) => updateFormData(['services', service], e.target.checked)}
                              className="rounded border-pink-300 text-pink-500 focus:ring-pink-500"
                            />
                            <span className="text-gray-700">{service}</span>
                          </label>
                          {included !== false && (
                            <select
                              value={included === true ? 'Included' : included}
                              onChange={(e) => updateFormData(
                                ['services', service],
                                e.target.value === 'Included' ? true : e.target.value
                              )}
                              className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            >
                              <option value="Included">Included</option>
                             <option value="10">€ 10</option>
                             <option value="20">€ 20</option>
                             <option value="30">€ 30</option>
                             <option value="40">€ 40</option>
                             <option value="50">€ 50</option>
                             <option value="60">€ 60</option>
                             <option value="70">€ 70</option>
                             <option value="80">€ 80</option>
                             <option value="90">€ 90</option>
                             <option value="100">€ 100</option>
                             <option value="125">€ 125</option>
                             <option value="150">€ 150</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Availability</h2>
                <div className="space-y-6">
                  {/* Working Days */}
                  {Object.entries(formData.workingDays).map(([day, isWorking]) => (
                    <div key={day} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isWorking}
                            onChange={(e) => updateFormData(['workingDays', day], e.target.checked)}
                            className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="font-medium text-gray-900">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                        </label>
                        {isWorking && (
                          <div className="text-sm text-green-600 font-medium">Available</div>
                        )}
                      </div>
                      
                      {isWorking && (
                        <div className="flex items-center gap-2 pl-6">
                          <select
                            value={formData.workingHours[day]?.start || '09:00'}
                            onChange={(e) => updateFormData(
                              ['workingHours', day, 'start'],
                              e.target.value
                            )}
                            className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {`${i.toString().padStart(2, '0')}:00`}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-500">to</span>
                          <select
                            value={formData.workingHours[day]?.end || '22:00'}
                            onChange={(e) => updateFormData(
                              ['workingHours', day, 'end'],
                              e.target.value
                            )}
                            className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {`${i.toString().padStart(2, '0')}:00`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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