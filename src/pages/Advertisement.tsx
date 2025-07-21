import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, X, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import { profileService, ProfileData } from '../services/profileService';

// Default fallback data in case API fails
const defaultImages = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1622396481328-7d0cd0e7b35d?auto=format&fit=crop&w=800&q=80'
];

export default function Advertisement() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<number | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!id) {
        setError('No profile ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await profileService.getProfileBySlug(id);
        
        if (data) {
          setProfileData(data);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  // Use profile data or fallback to defaults
  const images = profileData?.images?.length ? profileData.images : defaultImages;
  const services = profileData?.services || [];
  
  // Transform reviews to match ReviewCard interface
  const reviews = profileData?.reviews?.map(review => ({
    id: review.id,
    authorName: 'Anonymous',
    serviceName: profileData?.name || 'Unknown',
    serviceLink: `/ladies/${id}`,
    date: review.created_at,
    rating: review.rating,
    positives: review.positives || [],
    negatives: review.negatives || [],
    reply: undefined,
    likes: review.likes,
    dislikes: review.dislikes
  })) || [];

  const openFullscreen = (index: number) => {
    setFullscreenImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateFullscreen = (direction: 'prev' | 'next') => {
    if (fullscreenImage === null) return;
    
    if (direction === 'prev') {
      setFullscreenImage(prev => prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : 0);
    } else {
      setFullscreenImage(prev => prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : 0);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/ladies" className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
            Back to Ladies
          </Link>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist.</p>
          <Link to="/ladies" className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
            Back to Ladies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Photo Gallery */}
      <div className="relative bg-gray-900">
        {/* Photo Bar */}
        <div className="flex h-[600px] transition-transform duration-300 ease-in-out"
             style={{ transform: `translateX(-${selectedImage * 25}%)` }}>
          {images.map((image, index) => (
            <div key={index} className="flex-none w-1/4 relative">
              <img
                src={image}
                alt={`Alexandra ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => openFullscreen(index)}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : 0)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/75 z-10"
        >
          ←
        </button>
        <button
          onClick={() => setSelectedImage(prev => prev < images.length - 4 ? prev + 1 : prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/75 z-10"
          >
          →
        </button>

        {/* Profile Info - Centered at bottom */}
        <div className="absolute bottom-0 left-[calc(16.666667%+1rem)] z-10 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent w-full py-6">
          <span className="bg-pink-500 text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg">{profileData.name}</span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">{profileData.rating} ★</span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">{profileData.loves} ❤</span>
          {profileData.is_verified && (
            <span className="bg-green-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">Verified! ✓</span>
          )}
        </div>

        {/* Fullscreen Photo Viewer */}
        {fullscreenImage !== null && (
          <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 z-20"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={() => navigateFullscreen('prev')}
              className="absolute left-4 text-white p-4 rounded-full hover:bg-white/10 z-20"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={() => navigateFullscreen('next')}
              className="absolute right-4 text-white p-4 rounded-full hover:bg-white/10 z-20"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            {/* Photo Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {fullscreenImage + 1} / {images.length}
            </div>

            {/* Watermark */}
            <div className="absolute bottom-4 right-4 pointer-events-none select-none">
              <div className="text-pink-500/30 text-[40px] font-bold rotate-[-30deg] whitespace-nowrap">
                DateKelly.ro
              </div>
            </div>

            {/* Main Image */}
            <img
              src={images[fullscreenImage]}
              alt={`Alexandra ${fullscreenImage + 1}`}
              className="max-h-screen max-w-screen object-contain relative"
            />
          </div>
        )}
      </div>

      {/* Contact and Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Main Content (70%) */}
          <div className="w-full md:w-[70%]">
            {/* About Me */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold mb-4">About me</h2>
              <div className="space-y-4 text-gray-700">
                <p>{profileData.description}</p>
              </div>
            </div>

            {/* Details and Prices */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Details */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Sex</h3>
                    <p className="font-bold">Female</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Age</h3>
                    <p className="font-bold">{profileData.details.age}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Length</h3>
                    <p className="font-bold">{profileData.details.height} cm</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Cup size</h3>
                    <p className="font-bold">{profileData.details.cup_size}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Weight</h3>
                    <p className="font-bold">{profileData.details.weight} kg</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Body size</h3>
                    <p className="font-bold">{profileData.details.body_type}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Descent</h3>
                    <p className="font-bold">{profileData.details.ethnicity}</p>
                  </div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Language</h3>
                    <div className="flex gap-2">
                      {profileData.details.languages.map((lang, index) => (
                        <p key={index} className="font-bold">{lang}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prices */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Prices</h2>
                <div className="grid gap-2">
                  {profileData.rates.map((rate, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-600 w-28">{rate.duration}</h3>
                      <p className="font-bold">€ {rate.price},-</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Service */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Service</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {services.length > 0 ? (
                  <>
                    <div>
                      {services.slice(0, Math.ceil(services.length / 2)).map((service, index) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <span className="text-pink-500">{service.service_name}</span>
                          <span className="text-gray-700">
                            {service.is_available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div>
                      {services.slice(Math.ceil(services.length / 2)).map((service, index) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <span className="text-pink-500">{service.service_name}</span>
                          <span className="text-gray-700">
                            {service.is_available ? 'Available' : 'Not Available'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-center text-gray-500 py-8">
                    No services available
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Link
                  to="/write-review/alexandra"
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  Write Review
                </Link>
              </div>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Info (30%) */}
          <div className="w-full md:w-[30%]">
            <div className="space-y-6 sticky top-4">
              {/* Location */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Location</h2>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <p className="font-medium">{profileData.location}</p>
                  </div>
                </div>
              </div>

              {/* Visit Options */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Visit Options</h2>
                <div className="space-y-2 text-gray-700">
                  <p>✓ You can visit me - Private visit</p>
                  <p>✓ I will visit you - Escort</p>
                </div>
              </div>
              
              {/* Contact */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Contact</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full p-3 bg-gray-100 rounded-lg text-center text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="h-5 w-5 text-pink-500" />
                      <span className="font-medium">
                        {showPhone ? '06 12 234 678' : 'Click to show number'}
                      </span>
                    </div>
                  </button>
                  <div className="grid grid-cols-3 gap-3">
                    <a 
                      href="tel:0612234678"
                      className="bg-pink-500 text-white p-4 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                    >
                      <Phone className="h-6 w-6" />
                    </a>
                    <button className="bg-pink-500 text-white p-4 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                      <MessageCircle className="h-6 w-6" />
                    </button>
                    <button className="bg-green-500 text-white p-4 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors">
                      <img src="https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/whatsapp-white.png" alt="WhatsApp" className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Opening Hours</h2>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>Monday</div><div>{profileData.opening_hours.monday}</div>
                  <div>Tuesday</div><div>{profileData.opening_hours.tuesday}</div>
                  <div>Wednesday</div><div>{profileData.opening_hours.wednesday}</div>
                  <div>Thursday</div><div>{profileData.opening_hours.thursday}</div>
                  <div>Friday</div><div>{profileData.opening_hours.friday}</div>
                  <div>Saturday</div><div>{profileData.opening_hours.saturday}</div>
                  <div>Sunday</div><div>{profileData.opening_hours.sunday}</div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">{new Date(profileData.member_since).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views on profile</span>
                    <span className="font-medium">{profileData.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last time online</span>
                    <span className="font-medium">{new Date(profileData.last_online).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button className="flex items-center justify-center space-x-2 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors">
                    <span className="text-xl">❤️</span>
                    <span>Love</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition-colors">
                    <span className="text-xl">⚠️</span>
                    <span>Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}