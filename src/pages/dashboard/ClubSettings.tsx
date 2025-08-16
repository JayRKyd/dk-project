import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Camera,
  MapPin,
  Clock,
  Building2,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { clubSettingsService, ClubPhoto, ClubFacility, ClubHours, ClubService } from '../../services/clubSettingsService';
import { supabase } from '../../lib/supabase';
import { uploadImage, uploadMultipleImages } from '../../services/imageService';

interface FormData {
  // Club Info
  name: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  
  // Location
  address: string;
  city: string;
  postalCode: string;
  country: string;
  region: string;
  latitude: number | undefined;
  longitude: number | undefined;
  parkingInfo: string;
  publicTransportInfo: string;
  
  // Photos
  logoUrl: string;
  coverPhotoUrl: string;
  
  // Facilities
  facilities: {
    [key: string]: boolean;
  };
  
  // Opening Hours
  openingHours: {
    [key: string]: {
      isOpen: boolean;
      open: string;
      close: string;
    };
  };
  
  // Pricing
  entryFee: string;
  roomFee: string;
  drinkPrices: {
    softDrinks: string;
    beer: string;
    wine: string;
    cocktails: string;
  };
}

// initial sample data removed

const tabs = [
  { id: 'info', label: 'Club Info', icon: Building2 },
  { id: 'photos', label: 'Photos', icon: Camera },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'facilities', label: 'Facilities', icon: Building2 },
  { id: 'hours', label: 'Opening Hours', icon: Clock },
  { id: 'pricing', label: 'Pricing', icon: DollarSign }
] as const;

type TabId = typeof tabs[number]['id'];

export default function ClubSettings() {
  const { clubProfile, loading, actions } = useClubDashboard();
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Germany',
    region: '',
    latitude: undefined,
    longitude: undefined,
    parkingInfo: '',
    publicTransportInfo: '',
    logoUrl: '',
    coverPhotoUrl: '',
    
    // Facilities - initialize with default facilities
    facilities: {},
    
    // Opening Hours - initialize with default hours
    openingHours: {
      monday: { isOpen: true, open: '12:00', close: '03:00' },
      tuesday: { isOpen: true, open: '12:00', close: '03:00' },
      wednesday: { isOpen: true, open: '12:00', close: '03:00' },
      thursday: { isOpen: true, open: '12:00', close: '03:00' },
      friday: { isOpen: true, open: '12:00', close: '05:00' },
      saturday: { isOpen: true, open: '12:00', close: '05:00' },
      sunday: { isOpen: true, open: '14:00', close: '03:00' }
    },
    
    // Pricing - initialize with default pricing
    entryFee: '50',
    roomFee: '80',
    drinkPrices: {
      softDrinks: '3',
      beer: '4',
      wine: '5',
      cocktails: '8'
    }
  });
  
  // Additional state for complex data
  // Local buffers (not used directly in UI)
  const [photos, setPhotos] = useState<ClubPhoto[]>([]);
  const [facilitiesData, setFacilitiesData] = useState<ClubFacility[]>([]);
  const [hoursData, setHoursData] = useState<ClubHours[]>([]);
  const [servicesData, setServicesData] = useState<ClubService[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{text: string; type: 'success' | 'error' | 'info' | null}>({text: '', type: null});

  const DEFAULT_FACILITIES: string[] = [
    'Private Rooms',
    'VIP Lounge',
    'Parking',
    'Taxi Service',
    'Discrete entrance',
    'Wifi',
    'Smoking area',
    'Lounge area',
    'Bar with alcoholic drinks',
    'Bar with non-alcoholic drinks',
    'Restaurant with snacks',
    'Restaurant with buffet',
    'Sex shop',
    'Cinema',
    'Disco/dancing',
    'ATM Machine',
    'Slot machines',
    'Sauna',
    'Jacuzzi',
    'Swimming pool',
    'Dressing room',
    'Showers',
    'Towels',
    'Bathrobe',
    'Garden/outdoor area',
    'Relaxing massage',
    'Erotic massage',
    'Striptease',
    'Lapdance',
    'Sex show',
    'Private rooms',
    'BDSM room',
    'Bar Service',
    'Private Parking',
    'Shower Facilities',
    'Air Conditioning',
    'Credit Card Payment',
    'Security Service',
    'Champagne Room',
    'VIP Package',
    'Bachelor Party',
    'Private Event'
  ];
  
  // Load club settings data
  useEffect(() => {
    const loadClubSettings = async () => {
      // If no club profile exists yet, allow the form to render with defaults
      // so the user can complete setup and create the profile on save.
      if (!clubProfile?.id) {
        setLoadingData(false);
        return;
      }
      setLoadingData(true);
      try {
        // Load all club settings data
        const [photosData, facilitiesData, hoursData, servicesData] = await Promise.all([
          clubSettingsService.getClubPhotos(clubProfile.id),
          clubSettingsService.getClubFacilities(clubProfile.id),
          clubSettingsService.getClubHours(clubProfile.id),
          clubSettingsService.getClubServices(clubProfile.id)
        ]);
        
        setPhotos(photosData);
        setFacilitiesData(facilitiesData);
        setHoursData(hoursData);
        setServicesData(servicesData);
        
        // Convert facilities data to form format; if none, initialize defaults as false
        const facilitiesMap: { [key: string]: boolean } = {};
        facilitiesData.forEach(facility => {
          facilitiesMap[facility.facility_name] = facility.is_available;
        });
        if (Object.keys(facilitiesMap).length === 0) {
          DEFAULT_FACILITIES.forEach(name => { facilitiesMap[name] = false; });
        }
        
        // Convert hours data to form format
        const hoursMap: { [key: string]: { isOpen: boolean; open: string; close: string } } = {
          monday: { isOpen: false, open: '12:00', close: '03:00' },
          tuesday: { isOpen: false, open: '12:00', close: '03:00' },
          wednesday: { isOpen: false, open: '12:00', close: '03:00' },
          thursday: { isOpen: false, open: '12:00', close: '03:00' },
          friday: { isOpen: false, open: '12:00', close: '05:00' },
          saturday: { isOpen: false, open: '12:00', close: '05:00' },
          sunday: { isOpen: false, open: '14:00', close: '03:00' }
        };
        
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        hoursData.forEach(hour => {
          const dayName = dayNames[hour.day_of_week];
          if (dayName) {
            hoursMap[dayName] = {
              isOpen: hour.is_open,
              open: hour.open_time || '12:00',
              close: hour.close_time || '03:00'
            };
          }
        });
        
        // Find entry and room services for pricing
        const entryService = servicesData.find(s => s.service_type === 'entrance');
        const roomService = servicesData.find(s => s.service_type === 'room');
        const drinkServices = servicesData.filter(s => s.service_type === 'drink');
        
        const drinkPrices = {
          softDrinks: drinkServices.find(d => d.service_name.toLowerCase().includes('soft'))?.price?.toString() || '3',
          beer: drinkServices.find(d => d.service_name.toLowerCase().includes('beer'))?.price?.toString() || '4',
          wine: drinkServices.find(d => d.service_name.toLowerCase().includes('wine'))?.price?.toString() || '5',
          cocktails: drinkServices.find(d => d.service_name.toLowerCase().includes('cocktail'))?.price?.toString() || '8'
        };
        
        // Populate form with club profile data
        setFormData(prev => ({
          ...prev,
          name: clubProfile.name || '',
          description: clubProfile.description || '',
          website: clubProfile.website || '',
          email: clubProfile.email || '',
          phone: clubProfile.phone || '',
          address: clubProfile.address || '',
          city: clubProfile.city || '',
          postalCode: clubProfile.postal_code || '',
          country: clubProfile.country || 'Germany',
          region: clubProfile.region || '',
          latitude: clubProfile.latitude || undefined,
          longitude: clubProfile.longitude || undefined,
          parkingInfo: clubProfile.parking_info || '',
          publicTransportInfo: clubProfile.public_transport_info || '',
          logoUrl: clubProfile.logo_url || '',
          coverPhotoUrl: clubProfile.cover_photo_url || '',
          facilities: facilitiesMap,
          openingHours: hoursMap,
          entryFee: entryService?.price?.toString() || '50',
          roomFee: roomService?.price?.toString() || '80',
          drinkPrices: drinkPrices
        }));
        
      } catch (error) {
        console.error('Error loading club settings:', error);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadClubSettings();
  }, [clubProfile?.id]);

  // Load gallery images for club
  useEffect(() => {
    const fetchGallery = async () => {
      if (!clubProfile?.id) return;
      try {
        const { data, error } = await supabase.storage
          .from('gallery-images')
          .list(clubProfile.id, { sortBy: { column: 'name', order: 'asc' } });
        if (error) throw error;
        if (data && data.length > 0) {
          const imageUrls = data.map(file => {
            const { data: urlData } = supabase.storage
              .from('gallery-images')
              .getPublicUrl(`${clubProfile.id}/${file.name}`);
            return urlData.publicUrl;
          });
          setGalleryImages(imageUrls);
        }
      } catch (err) {
        console.error('Error fetching club gallery:', err);
      }
    };
    fetchGallery();
  }, [clubProfile?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // If profile does not exist yet, create it from form data via actions.updateClubProfile
    setIsSubmitting(true);
    try {
      // Update or create club profile basic info
      const updatedProfile = await actions.updateClubProfile({
        name: formData.name,
        description: formData.description,
        website: formData.website,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        country: formData.country,
        region: formData.region,
        latitude: formData.latitude,
        longitude: formData.longitude,
        parking_info: formData.parkingInfo,
        public_transport_info: formData.publicTransportInfo,
        logo_url: formData.logoUrl,
        cover_photo_url: formData.coverPhotoUrl
      });
      const clubId = (updatedProfile && (updatedProfile as any).id) || clubProfile?.id;
      if (clubId) {
        // Persist facilities
        try {
          const facilitiesArray = Object.entries(formData.facilities).map(([facility_name, is_available]) => ({
            facility_name,
            is_available: Boolean(is_available),
            category: 'amenities' as const,
          }));
          await clubSettingsService.updateClubFacilities(clubId, facilitiesArray as any);
        } catch (err) {
          console.warn('Saving facilities failed:', err);
        }

        // Persist hours
        try {
          const dayToIdx: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
          const hoursArray = Object.entries(formData.openingHours).map(([day, v]) => ({
            day_of_week: dayToIdx[day] ?? 0,
            is_open: Boolean(v.isOpen),
            open_time: v.open || null,
            close_time: v.close || null,
            is_24_hours: false,
            special_note: null as any,
          }));
          await clubSettingsService.updateClubHours(clubId, hoursArray as any);
        } catch (err) {
          console.warn('Saving hours failed:', err);
        }

        // Persist pricing/services
        try {
          const toNum = (s: string) => {
            const n = parseFloat(String(s).replace(/[^0-9.]/g, ''));
            return isNaN(n) ? 0 : n;
          };
          const servicesArray = [
            {
              service_name: 'Entrance',
              service_type: 'entrance' as const,
              price: toNum(formData.entryFee),
              currency: 'EUR',
              duration_minutes: null as any,
              description: null as any,
              is_active: true,
              display_order: 1,
            },
            {
              service_name: 'Room (per hour)',
              service_type: 'room' as const,
              price: toNum(formData.roomFee),
              currency: 'EUR',
              duration_minutes: 60,
              description: null as any,
              is_active: true,
              display_order: 2,
            },
            { service_name: 'Soft Drinks', service_type: 'drink' as const, price: toNum(formData.drinkPrices.softDrinks), currency: 'EUR', is_active: true, display_order: 10 } as any,
            { service_name: 'Beer', service_type: 'drink' as const, price: toNum(formData.drinkPrices.beer), currency: 'EUR', is_active: true, display_order: 11 } as any,
            { service_name: 'Wine', service_type: 'drink' as const, price: toNum(formData.drinkPrices.wine), currency: 'EUR', is_active: true, display_order: 12 } as any,
            { service_name: 'Cocktails', service_type: 'drink' as const, price: toNum(formData.drinkPrices.cocktails), currency: 'EUR', is_active: true, display_order: 13 } as any,
          ];
          await clubSettingsService.updateClubServices(clubId, servicesArray as any);
        } catch (err) {
          console.warn('Saving services failed:', err);
        }
      }
      
      // Success notification could be added here
      console.log('Club settings updated successfully');
      
    } catch (error) {
      console.error('Error updating club settings:', error);
      // Error notification could be added here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  // loading from hook is a boolean; allow form if either loading is done or we purposely allowed when no profile
  if (loading || loadingData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading club settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/club"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
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
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Club Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Club Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Describe your club..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="h-4 w-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Website (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="https://yourclub.com (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Photos</h2>

                {photoMessage.text && (
                  <div className={`mb-4 p-4 rounded-lg flex items-center ${
                    photoMessage.type === 'success' ? 'bg-green-100 text-green-700 border-l-4 border-green-500' :
                    photoMessage.type === 'error' ? 'bg-red-100 text-red-700 border-l-4 border-red-500' :
                    'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                  }`}>
                    {photoMessage.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {photoMessage.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
                    {photoMessage.type === 'info' && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                    <p>{photoMessage.text}</p>
                  </div>
                )}

                <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500 mb-2"></div>
                        <span className="text-sm text-gray-700">Uploading photo...</span>
                      </div>
                    </div>
                  )}

                  {/* Logo Upload */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                    {formData.logoUrl ? (
                      <>
                        <img src={`${formData.logoUrl}?t=${Date.now()}`} alt="Logo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-white font-medium z-10 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">Logo</span>
                          <label className="cursor-pointer p-2 bg-pink-500 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={async (e) => {
                                if (!clubProfile?.id || !e.target.files || e.target.files.length === 0) return;
                                try {
                                  setIsUploadingPhoto(true);
                                  setPhotoMessage({text: 'Uploading logo...', type: 'info'});
                                  const file = e.target.files[0];
                                  const { url } = await uploadImage(file, 'profile-pictures', '', clubProfile.id);
                                  setFormData(prev => ({ ...prev, logoUrl: url }));
                                  await actions.updateClubProfile({ logo_url: url });
                                  setPhotoMessage({text: 'Logo updated successfully!', type: 'success'});
                                  setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                                } catch (err) {
                                  console.error('Error uploading logo:', err);
                                  setPhotoMessage({text: err instanceof Error ? err.message : 'Failed to upload logo', type: 'error'});
                                  setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                                } finally {
                                  setIsUploadingPhoto(false);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-full hover:bg-gray-200 transition-colors">
                        <Camera className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-base font-medium text-gray-700">Logo</span>
                        <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={async (e) => {
                            if (!clubProfile?.id || !e.target.files || e.target.files.length === 0) return;
                            try {
                              setIsUploadingPhoto(true);
                              setPhotoMessage({text: 'Uploading logo...', type: 'info'});
                              const file = e.target.files[0];
                              const { url } = await uploadImage(file, 'profile-pictures', '', clubProfile.id);
                              setFormData(prev => ({ ...prev, logoUrl: url }));
                              await actions.updateClubProfile({ logo_url: url });
                              setPhotoMessage({text: 'Logo updated successfully!', type: 'success'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                            } catch (err) {
                              console.error('Error uploading logo:', err);
                              setPhotoMessage({text: err instanceof Error ? err.message : 'Failed to upload logo', type: 'error'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                            } finally {
                              setIsUploadingPhoto(false);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Cover Photo Upload */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                    {formData.coverPhotoUrl ? (
                      <>
                        <img src={`${formData.coverPhotoUrl}?t=${Date.now()}`} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <span className="text-white font-medium z-10 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">Cover</span>
                          <label className="cursor-pointer p-2 bg-pink-500 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={async (e) => {
                                if (!clubProfile?.id || !e.target.files || e.target.files.length === 0) return;
                                try {
                                  setIsUploadingPhoto(true);
                                  setPhotoMessage({text: 'Uploading cover photo...', type: 'info'});
                                  const file = e.target.files[0];
                                  const { url } = await uploadImage(file, 'profile-pictures', '', clubProfile.id);
                                  setFormData(prev => ({ ...prev, coverPhotoUrl: url }));
                                  await actions.updateClubProfile({ cover_photo_url: url });
                                  setPhotoMessage({text: 'Cover photo updated successfully!', type: 'success'});
                                  setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                                } catch (err) {
                                  console.error('Error uploading cover:', err);
                                  setPhotoMessage({text: err instanceof Error ? err.message : 'Failed to upload cover photo', type: 'error'});
                                  setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                                } finally {
                                  setIsUploadingPhoto(false);
                                  e.currentTarget.value = '';
                                }
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-full hover:bg-gray-200 transition-colors">
                        <Camera className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-base font-medium text-gray-700">Cover Photo</span>
                        <span className="text-xs text-gray-500 mt-1">Click to upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={async (e) => {
                            if (!clubProfile?.id || !e.target.files || e.target.files.length === 0) return;
                            try {
                              setIsUploadingPhoto(true);
                              setPhotoMessage({text: 'Uploading cover photo...', type: 'info'});
                              const file = e.target.files[0];
                              const { url } = await uploadImage(file, 'profile-pictures', '', clubProfile.id);
                              setFormData(prev => ({ ...prev, coverPhotoUrl: url }));
                              await actions.updateClubProfile({ cover_photo_url: url });
                              setPhotoMessage({text: 'Cover photo updated successfully!', type: 'success'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                            } catch (err) {
                              console.error('Error uploading cover:', err);
                              setPhotoMessage({text: err instanceof Error ? err.message : 'Failed to upload cover photo', type: 'error'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 5000);
                            } finally {
                              setIsUploadingPhoto(false);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>

                  {/* Club Gallery */}
                  {galleryImages.map((imageUrl, index) => (
                    <div key={`gallery-${index}`} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                      <img src={imageUrl.includes('?t=') ? imageUrl : `${imageUrl}?t=${Date.now()}`} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          className="p-2 bg-red-500 bg-opacity-80 rounded-full"
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!clubProfile?.id) return;
                            try {
                              setPhotoMessage({text: 'Deleting photo...', type: 'info'});
                              const baseUrl = imageUrl.split('?')[0];
                              const filename = baseUrl.split('/').pop();
                              if (!filename) throw new Error('Invalid image URL');
                              const { error } = await supabase.storage
                                .from('gallery-images')
                                .remove([`${clubProfile.id}/${filename}`]);
                              if (error) throw error;
                              setGalleryImages(prev => prev.filter(url => !url.startsWith(baseUrl)));
                              setPhotoMessage({text: 'Photo deleted successfully!', type: 'success'});
                              setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                            } catch (err) {
                              console.error('Error deleting club photo:', err);
                              setPhotoMessage({text: err instanceof Error ? err.message : 'Failed to delete photo', type: 'error'});
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
                          e.preventDefault();
                          e.stopPropagation();
                          if (!clubProfile?.id || !e.target.files || e.target.files.length === 0) return;
                          try {
                            setIsUploadingPhoto(true);
                            setPhotoMessage({text: 'Uploading gallery photos...', type: 'info'});
                            const files = Array.from(e.target.files);
                            if (galleryImages.length + files.length > 6) {
                              throw new Error(`You can only have up to 6 gallery photos. You can add ${6 - galleryImages.length} more.`);
                            }
                            const uploadedImages = await uploadMultipleImages(files, 'gallery-images', clubProfile.id, clubProfile.id);
                            try {
                              const { ContentModerationService } = await import('../../services/contentModerationService');
                              await ContentModerationService.recordUploadedImages(clubProfile.id, uploadedImages);
                            } catch (recErr) {
                              console.warn('Failed to record uploaded images for moderation:', recErr);
                            }
                            e.currentTarget.value = '';
                            const newUrls = uploadedImages.map(img => `${img.url}?t=${Date.now()}`);
                            setGalleryImages(prev => [...prev, ...newUrls]);
                            setPhotoMessage({text: 'Gallery photos uploaded successfully!', type: 'success'});
                            setTimeout(() => setPhotoMessage({text: '', type: null}), 3000);
                          } catch (err) {
                            console.error('Error uploading gallery photos:', err);
                            setPhotoMessage({text: err instanceof Error ? err.message : 'Failed to upload photos', type: 'error'});
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
                    <li>Maximum 6 photos allowed</li>
                    <li>Photos must be clear and recent</li>
                    <li>No explicit nudity allowed</li>
                    <li>Minimum resolution: 800x600 pixels</li>
                    <li>Maximum file size: 5MB per photo</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Location Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="Netherlands">Netherlands</option>
                        <option value="Germany">Germany</option>
                        <option value="Belgium">Belgium</option>
                        <option value="Austria">Austria</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Information
                    </label>
                    <textarea
                      value={formData.parkingInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, parkingInfo: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Describe parking options..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Public Transport Information
                    </label>
                    <textarea
                      value={formData.publicTransportInfo}
                      onChange={(e) => setFormData(prev => ({ ...prev, publicTransportInfo: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Describe public transport access..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Facilities Tab */}
            {activeTab === 'facilities' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(formData.facilities).length > 0 ? Object.entries(formData.facilities) : DEFAULT_FACILITIES.map(name => [name, false] as [string, boolean])).map(([facility, isAvailable]) => (
                    <label key={facility} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          facilities: {
                            ...prev.facilities,
                            [facility]: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Opening Hours Tab */}
            {activeTab === 'hours' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Opening Hours</h2>
                <div className="space-y-6">
                  {Object.entries(formData.openingHours).map(([day, hours]) => (
                    <div key={day} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hours.isOpen}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                [day]: {
                                  ...prev.openingHours[day],
                                  isOpen: e.target.checked
                                }
                              }
                            }))}
                            className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                          />
                          <span className="font-medium text-gray-900">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                        </label>
                        {hours.isOpen && (
                          <div className="text-sm text-green-600 font-medium">Open</div>
                        )}
                      </div>
                      
                      {hours.isOpen && (
                        <div className="flex items-center gap-2 pl-6">
                          <select
                            value={hours.open}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                [day]: {
                                  ...prev.openingHours[day],
                                  open: e.target.value
                                }
                              }
                            }))}
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
                            value={hours.close}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              openingHours: {
                                ...prev.openingHours,
                                [day]: {
                                  ...prev.openingHours[day],
                                  close: e.target.value
                                }
                              }
                            }))}
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

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
                <div className="space-y-6">
                  {/* Entry Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="text"
                        value={formData.entryFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, entryFee: e.target.value }))}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Room Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Fee (per hour)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="text"
                        value={formData.roomFee}
                        onChange={(e) => setFormData(prev => ({ ...prev, roomFee: e.target.value }))}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Drink Prices */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Drink Prices</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soft Drinks
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <input
                            type="text"
                            value={formData.drinkPrices.softDrinks}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              drinkPrices: {
                                ...prev.drinkPrices,
                                softDrinks: e.target.value
                              }
                            }))}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Beer
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <input
                            type="text"
                            value={formData.drinkPrices.beer}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              drinkPrices: {
                                ...prev.drinkPrices,
                                beer: e.target.value
                              }
                            }))}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wine
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <input
                            type="text"
                            value={formData.drinkPrices.wine}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              drinkPrices: {
                                ...prev.drinkPrices,
                                wine: e.target.value
                              }
                            }))}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cocktails
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <input
                            type="text"
                            value={formData.drinkPrices.cocktails}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              drinkPrices: {
                                ...prev.drinkPrices,
                                cocktails: e.target.value
                              }
                            }))}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}