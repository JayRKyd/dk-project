import React, { useEffect, useMemo, useState } from 'react';
import { Phone, MessageCircle, MapPin, X, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';
import { clubService } from '../services/clubService';
import { clubSettingsService } from '../services/clubSettingsService';
import { supabase } from '../lib/supabase';
import { analyticsService } from '../services/analyticsService';
import { reviewsService } from '../services/reviewsService';
import { useAuth } from '../contexts/AuthContext';

// No static fallbacks for images/ladies/facilities

// Reviews will be loaded from the database

export default function ClubAdvertisement() {
	const { user } = useAuth();
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<number | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [clubName, setClubName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [verified, setVerified] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(0);
  const [loves, setLoves] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [ladiesList, setLadiesList] = useState<Array<{ id: string; name: string; imageUrl?: string; age?: number; nationality?: string }>>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [openingHours, setOpeningHours] = useState<Array<{ day: number; is_open: boolean; open?: string | null; close?: string | null }>>([]);
	const [reviews, setReviews] = useState<any[]>([]);
	const [memberSince, setMemberSince] = useState<string>('');
	const [viewsOnProfile, setViewsOnProfile] = useState<number>(0);
	const [lastOnline, setLastOnline] = useState<string>('');

	useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const club = await clubService.getClubById(id);
        if (club) {
          // Guard: block suspended clubs (owner blocked)
          try {
            const { data: owner } = await supabase
              .from('users')
              .select('is_blocked')
              .eq('id', (club as any).user_id)
              .single();
            if (owner?.is_blocked) {
              setClubName('');
              setDescription('');
              setWebsite('');
              setPhone('');
              setGallery([]);
              // Short-circuit by returning early; UI will effectively show empty sections
              return;
            }
          } catch (_) {}
          setClubName(club.name || '');
          setCity(club.city || '');
          setAddress(club.address || '');
          setVerified((club as any).verification_status === 'verified');
          setDescription((club as any).description || '');
          setWebsite((club as any).website || '');
          setPhone((club as any).phone || '');
					if ((club as any).created_at) {
						setMemberSince(new Date((club as any).created_at).toLocaleDateString());
					}
					// Last online from owning user
					if ((club as any).user_id) {
						const { data: clubUser } = await supabase
							.from('users')
							.select('last_sign_in_at')
							.eq('id', (club as any).user_id)
							.single();
						if (clubUser?.last_sign_in_at) setLastOnline(new Date(clubUser.last_sign_in_at).toLocaleDateString());
					}
        }
        // Load gallery images from storage
        const { data } = await supabase.storage.from('gallery-images').list(id, { sortBy: { column: 'name', order: 'asc' } });
        if (data && data.length > 0) {
          const urls = data.map(f => supabase.storage.from('gallery-images').getPublicUrl(`${id}/${f.name}`).data.publicUrl);
          setGallery(urls);
        }
        // Load club ladies
        try {
          const list = await clubService.getClubLadies(id);
          const mapped = (list || []).map((cl: any) => ({
            id: cl.lady_id,
            name: cl.profile?.name || cl.lady?.username || 'Lady',
            imageUrl: cl.profile?.image_url,
          }));
          setLadiesList(mapped);
        } catch (_) {}
        // Facilities
        try {
          const facs = await clubSettingsService.getClubFacilities(id);
          setFacilities((facs || []).filter((f: any) => f.is_available).map((f: any) => f.facility_name));
        } catch (_) {}
        // Hours
        try {
          const hrs = await clubSettingsService.getClubHours(id);
          setOpeningHours((hrs || []).map((h: any) => ({ day: h.day_of_week, is_open: h.is_open, open: h.open_time, close: h.close_time })));
        } catch (_) {}
				// Reviews
				try {
					const revs = await reviewsService.getReviewsByProfileId(id);
					setReviews(revs || []);
				} catch (_) {}
				// Views analytics
				try {
					const analytics = await analyticsService.getViewAnalytics(id);
					setViewsOnProfile(analytics.total_views || 0);
				} catch (_) {}
      } catch (_) {
        // ignore and keep static fallback
      }
    };
    load();
  }, [id]);

  // Track a profile view
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await analyticsService.trackProfileView(id, user ? user.id : undefined);
      } catch (_) {}
    })();
  }, [id, user ? user.id : undefined]);

	const images = useMemo(() => gallery, [gallery]);

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
      setFullscreenImage(prev => (prev > 0 ? prev - 1 : images.length - 1));
    } else {
      setFullscreenImage(prev => (prev < images.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div>
      {/* Photo Gallery */}
      <div className="relative bg-gray-900">
        {/* Photo Bar */}
        {images.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-gray-300">
            No images uploaded yet.
          </div>
        ) : (
          <div className="flex h-[600px] transition-transform duration-300 ease-in-out"
               style={{ transform: `translateX(-${selectedImage * 25}%)` }}>
            {images.map((image, index) => (
              <div key={index} className="flex-none w-1/4 relative">
                <img
                  src={image}
                  alt={`Club image ${index + 1}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openFullscreen(index)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 0 && (
          <>
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
          </>
        )}

        {/* Profile Info - Centered at bottom */}
        <div className="absolute bottom-0 left-[calc(16.666667%+1rem)] z-10 flex items-center gap-3 bg-gradient-to-t from-black/60 to-transparent w-full py-6">
          <span className="bg-pink-500 text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg">{clubName || 'Club'}</span>
          {rating > 0 && <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">{rating.toFixed(1)} ★</span>}
          {loves > 0 && <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">{loves.toLocaleString()} ❤</span>}
          {verified && <span className="bg-green-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">Verified! ✓</span>}
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
              alt={`Pink Angels Club ${fullscreenImage + 1}`}
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
            {/* About Club */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold mb-4">About {clubName || 'this Club'}</h2>
              <div className="space-y-4 text-gray-700">
                <p>{description || `Welcome to ${clubName || 'our club'}.`}</p>
              </div>
            </div>

            {/* Our Ladies */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold mb-4">Our Ladies</h2>
              {ladiesList.length === 0 ? (
                <p className="text-gray-600">No ladies linked to this club yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {ladiesList.map((lady, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-square rounded-lg overflow-hidden group relative">
                        <img
                          src={lady.imageUrl}
                          alt={lady.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-medium text-gray-900">{lady.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Services */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Services & Facilities</h2>
              {facilities.length === 0 ? (
                <p className="text-gray-600">No services or facilities listed.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                  {facilities.map((service, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-pink-500">{service}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Link
                  to={`/write-review/club/${id}`}
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  <Star className="h-5 w-5" />
                  Write Review
                </Link>
              </div>
				<div className="space-y-6">
					{reviews.length === 0 ? (
						<p className="text-gray-600">No reviews yet.</p>
					) : (
						reviews.map((review: any) => (
							<ReviewCard key={review.id} review={review} />
						))
					)}
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
                    <p className="font-medium">{city || '-'}</p>
                    <p className="text-gray-600">{address || ''}</p>
                  </div>
                </div>
              </div>

              {/* Visit Options */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Visit Options</h2>
                <div className="space-y-2 text-gray-700">
                  <p>✓ You visit us - Club visit</p>
                  <p>✓ Our ladies visit you - Escort</p>
                </div>
              </div>
              
              {/* Contact */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Contact</h2>
                <div className="space-y-3">
                  <a
                    href={website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-gray-100 rounded-lg text-center text-gray-800 hover:bg-gray-200 transition-colors block"
                  >
                    {website || '—'}
                  </a>
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full p-3 bg-gray-100 rounded-lg text-center text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Phone className="h-5 w-5 text-pink-500" />
                      <span className="font-medium">
                        {showPhone ? (phone || '—') : 'Click to show number'}
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
                {openingHours.length === 0 ? (
                  <p className="text-gray-600">Opening hours not provided.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-gray-700">
                    {openingHours.map((h, idx) => {
                      const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      return (
                        <React.Fragment key={`${h.day}-${idx}`}>
                          <div>{names[h.day]}</div>
                          <div>{h.is_open ? `${h.open || ''} - ${h.close || ''}` : 'Closed'}</div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Profile Stats */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Statistics</h2>
					<div className="space-y-3">
						<div className="flex justify-between"><span className="text-gray-600">Member since</span><span className="font-medium">{memberSince || '—'}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">Views on profile</span><span className="font-medium">{viewsOnProfile.toLocaleString()}</span></div>
						<div className="flex justify-between"><span className="text-gray-600">Last time online</span><span className="font-medium">{lastOnline || '—'}</span></div>
					</div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={async () => {
                      if (!user || !id) return;
                      try {
                        const { toggleProfileLove } = await import('../services/profileStatsService');
                        const loved = await toggleProfileLove(user.id, id);
                        // Optimistically update local loves badge near the name
                        setLoves(prev => Math.max(0, loved ? prev + 1 : prev - 1));
                      } catch (e) {
                        console.warn('Love action failed:', e);
                      }
                    }}
                    className="flex items-center justify-center space-x-2 bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    <span className="text-xl">❤️</span>
                    <span>Love</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!id) return;
                      try {
                        const reason = 'Club profile reported from public page';
                        const { ContentModerationService } = await import('../services/contentModerationService');
                        await ContentModerationService.reportContent('review', id, reason); // Use a generic path; admin will see report entry
                        alert('Report submitted. Our admins will review this profile.');
                      } catch (e) {
                        console.warn('Report failed:', e);
                      }
                    }}
                    className="flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
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