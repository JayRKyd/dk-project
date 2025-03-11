import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, X, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';

const images = [
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461988091159-192b6df7054f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80'
];

const ladies = [
  {
    name: 'Sophia',
    age: 23,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    nationality: 'Russian'
  },
  {
    name: 'Emma',
    age: 25,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    nationality: 'Dutch'
  },
  {
    name: 'Isabella',
    age: 24,
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
    nationality: 'Italian'
  },
  {
    name: 'Victoria',
    age: 22,
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    nationality: 'Romanian'
  },
  {
    name: 'Natasha',
    age: 26,
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300&q=80',
    nationality: 'Ukrainian'
  },
  {
    name: 'Maria',
    age: 23,
    imageUrl: 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=300&q=80',
    nationality: 'Spanish'
  },
  {
    name: 'Jasmine',
    age: 24,
    imageUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=300&q=80',
    nationality: 'Thai'
  },
  {
    name: 'Nina',
    age: 25,
    imageUrl: 'https://images.unsplash.com/photo-1622396481328-7d0cd0e7b35d?auto=format&fit=crop&w=300&q=80',
    nationality: 'Czech'
  }
];

const services = [
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

const reviews = [
  {
    id: '1',
    authorName: 'James Smith',
    serviceName: 'Pink Angels Club',
    serviceLink: '/clubs/pink-angels',
    date: 'October 2020',
    rating: 8.5,
    positives: [
      'Nice club. Friendly receptionist.',
      'Many girls to choose. Some slim girls, also more curvy ones. For every men there is a girl.',
      'Can pay with credit card.'
    ],
    negatives: [
      'The price was quite high compared to other clubs. My lady also charged many extra\'s, but she is worth it. ;)'
    ],
    reply: {
      from: 'Pink Angels Club',
      message: 'Thank you for visiting us. We hope to see you again soon!'
    },
    likes: 15,
    dislikes: 1
  }
];

export default function ClubAdvertisement() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<number | null>(null);
  const [showPhone, setShowPhone] = useState(false);

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
        <div className="flex h-[600px] transition-transform duration-300 ease-in-out"
             style={{ transform: `translateX(-${selectedImage * 25}%)` }}>
          {images.map((image, index) => (
            <div key={index} className="flex-none w-1/4 relative">
              <img
                src={image}
                alt={`Pink Angels Club ${index + 1}`}
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
          <span className="bg-pink-500 text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg">Pink Angels Club</span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">9.5 ★</span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">2,258 ❤</span>
          <span className="bg-green-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">Verified! ✓</span>
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
              <h2 className="text-2xl font-bold mb-4">About Pink Angels Club</h2>
              <div className="space-y-4 text-gray-700">
                <p>Welcome to Pink Angels Club, Amsterdam's premier adult entertainment venue. We offer a luxurious and discreet environment where you can enjoy the company of our beautiful ladies.</p>
                <p>Our club features private rooms, a VIP lounge, and a full-service bar. We pride ourselves on providing a safe, clean, and professional atmosphere for our guests.</p>
              </div>
            </div>

            {/* Our Ladies */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold mb-4">Our Ladies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {ladies.map((lady, index) => (
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
                      <div className="text-sm text-gray-500">
                        <span>{lady.age} years</span>
                        <span className="mx-2">•</span>
                        <span>{lady.nationality}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Services & Facilities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-pink-500">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Link
                  to="/write-review/pink-angels"
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
                    <p className="font-medium">Amsterdam</p>
                    <p className="text-gray-600">Keizersgracht 8</p>
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
                    href="https://www.pinkangels.nl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-gray-100 rounded-lg text-center text-gray-800 hover:bg-gray-200 transition-colors block"
                  >
                    www.pinkangels.nl
                  </a>
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
                  <div>Monday</div><div>12:00 - 03:00</div>
                  <div>Tuesday</div><div>12:00 - 03:00</div>
                  <div>Wednesday</div><div>12:00 - 03:00</div>
                  <div>Thursday</div><div>12:00 - 03:00</div>
                  <div>Friday</div><div>12:00 - 05:00</div>
                  <div>Saturday</div><div>12:00 - 05:00</div>
                  <div>Sunday</div><div>14:00 - 03:00</div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Statistics</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">05/Dec/2020</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views on profile</span>
                    <span className="font-medium">23.548</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last time online</span>
                    <span className="font-medium">12/Apr/2021</span>
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