import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, X, ChevronLeft, ChevronRight, Star, Eye, Heart, Shield, Clock, Calendar, Lock, Camera, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewCard from '../components/ReviewCard';

const images = [
  'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80'
];

const services = [
  { name: 'Service for Men', price: '€50' },
  { name: 'Service for Ladies', price: '€80' },
  { name: 'Girlfriend Experience', price: '€100' },
  { name: 'Striptease', price: '€70' },
  { name: 'Fingering', price: '€50' },
  { name: 'Handjob', price: '€50' },
  { name: 'Kissing', price: '€30' },
  { name: 'French kissing', price: '€40' },
  { name: 'Pussy licking', price: '€60' },
  { name: 'Rimming (rec)', price: '€80' },
  { name: 'Rimming (client)', price: '€80' },
  { name: 'Blowjob with condom', price: '€60' },
  { name: 'Blowjob without condom', price: '€80' },
  { name: 'Deep Throat', price: '€90' },
  { name: 'Sex with condom', price: '€100' },
  { name: 'Sex without condom', price: '€150' },
  { name: 'Relaxing Massage', price: '€60' },
  { name: 'Erotic Massage', price: '€80' },
  { name: 'Anal Massage', price: '€90' },
  { name: 'Dildo (rec)', price: '€70' },
  { name: 'Dildo (client)', price: '€70' },
  { name: 'Trio MFF', price: '€200' },
  { name: 'Trio MMF', price: '€200' },
  { name: 'Groupsex', price: '€250' },
  { name: 'Photos', price: '€100' },
  { name: 'Video', price: '€150' },
  { name: 'High Heels', price: '€20' },
  { name: 'Role Play', price: '€100' },
  { name: 'Soft SM', price: '€120' },
  { name: 'BDSM', price: '€150' },
  { name: 'Golden Shower (rec)', price: '€100' },
  { name: 'Golden Shower (client)', price: '€100' },
];

const reviews = [
  {
    id: '1',
    authorName: 'Mike van Delden',
    serviceName: 'Alexandra',
    serviceLink: '/ladies/alexandra',
    date: 'September 2020',
    rating: 8.0,
    positives: [
      'Ordered Alexandra. Communication was good by telephone.',
      'After 1 hour Alexandra arrived, she is great! What a beauty!'
    ],
    negatives: [
      '30 minutes went too quick! I recommend staying longer if you can afford it!'
    ],
    reply: {
      from: 'Alexandra',
      message: 'Thank you for the review. I hope to see you again soon! Kiss!'
    },
    likes: 10,
    dislikes: 0
  },
  {
    id: '2',
    authorName: 'NeverWalkAlone',
    serviceName: 'Alexandra',
    serviceLink: '/ladies/alexandra',
    date: 'August 2020',
    rating: 9.0,
    positives: [
      'Very beautiful girl',
      'Great service, took her time',
      'Speaks good English'
    ],
    negatives: [],
    likes: 8,
    dislikes: 0
  }
];

function AdvertisementPro() {
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
                alt={`Melissa ${index + 1}`}
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
          <Link
            to="/dashboard/lady"
            className="bg-pink-500 text-white px-6 py-2 rounded-full text-2xl font-bold shadow-lg hover:bg-pink-600 transition-colors"
          >
            Melissa
          </Link>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">9.5 ★</span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg">2,258 ❤</span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg flex items-center gap-2">
            <span>3</span>
            <Camera className="h-5 w-5" />
          </span>
          <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg flex items-center gap-2">
            <span>156</span>
            <Gift className="h-5 w-5" />
          </span>
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
              alt={`Melissa ${fullscreenImage + 1}`}
              className="max-h-screen max-w-screen object-contain relative"
            />
          </div>
        )}
      </div>

      {/* Contact and Details */}
      <div className="max-w-7xl mx-auto p-4">
        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Main Content (75%) */}
          <div className="w-full md:w-3/4">
            {/* About Me */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-2xl font-bold mb-4">About me</h2>
              <div className="space-y-4 text-gray-700">
                <p>Hi, I'm Melissa! It's great that you're visiting my page. I love going out and I'm looking for fun partners to enjoy some time together. Feel free to contact me and set up an appointment, I'm waiting for you! 😊</p>
                <p>I also post new <Link to="/fan-posts/melissa" className="text-pink-500 hover:text-pink-600">Fan Posts</Link> almost every day, so make sure you don't miss them! I hope you'll enjoy them. See you soon!</p>
              </div>
            </div>

            {/* Fan Posts */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Fan Posts</h2>
                  <span className="bg-pink-500 text-white px-4 py-2 rounded-full text-lg shadow-lg flex items-center gap-2">
                    <span>3</span>
                    <Camera className="h-5 w-5" />
                  </span>
                </div>
                <Link
                  to="/fan-posts/melissa"
                  className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                >
                  Go to my Fan Posts
                </Link>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Subscribe to see my exclusive content and daily updates. I post new photos and videos almost every day!
                </p>
                
                {/* Latest Fan Post */}
                <div className="mt-6 bg-pink-50 rounded-lg overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80"
                        alt="Melissa"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Melissa</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-500">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span>Unlock</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-3">
                    <p className="text-gray-700">Special content for my premium subscribers 💋</p>
                    <p className="text-gray-700">Theme: Naughty</p>
                    <p className="text-gray-700">5 Photos + 1 Fan Video</p>
                  </div>
                  
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80"
                      alt="Post content"
                      className="w-full h-48 object-cover blur-[8px]"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="bg-black/50 px-4 py-2 rounded-lg text-center">
                        <p className="text-white font-medium">5 Fan Photos + 1 Fan Video</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 flex items-center justify-between border-t bg-white">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Heart className="w-5 h-5" />
                        <span>245</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <MessageCircle className="w-5 h-5" />
                        <span>32</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details and Prices */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Details */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Details</h2>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Sex</h3>
                    <p className="font-bold">Female</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Age</h3>
                    <p className="font-bold">22</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Length</h3>
                    <p className="font-bold">170 cm</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Cup size</h3>
                    <p className="font-bold">B</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Weight</h3>
                    <p className="font-bold">50 kg</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Body size</h3>
                    <p className="font-bold">Slim</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Descent</h3>
                    <p className="font-bold">Bulgarian</p>
                  </div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Language</h3>
                    <div className="flex gap-2">
                      <p className="font-bold">English</p>
                      <p className="font-bold">Bulgarian</p>
                      <p className="font-bold">Italian</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prices */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Prices</h2>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">15 min</h3>
                    <p className="font-bold">€ 50,-</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">30 min</h3>
                    <p className="font-bold">€ 100,-</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">1 hour</h3>
                    <p className="font-bold">€ 130,-</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">2 hours</h3>
                    <p className="font-bold">€ 250,-</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Night</h3>
                    <p className="font-bold">€ 600,-</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-600 w-28">Escort extra</h3>
                    <p className="font-bold">€ 50,-</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold mb-4">Service</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Girlfriend Experience</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Striptease</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Fingering</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Handjob</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Kissing</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">French kissing</span>
                    <span className="text-gray-700">€ 20,-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Pussy licking</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Rimming (me)</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Rimming (client)</span>
                    <span className="text-gray-700">€ 20,-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Blowjob with condom</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Blowjob without condom</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Deep Throat</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Sex with condom</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Sex without condom</span>
                    <span className="text-gray-700">€ 50,-</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Relaxing Massage</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Erotic Massage</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Anal Massage</span>
                    <span className="text-gray-700">€ 30,-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Dildo (me)</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Dildo (client)</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Trio MFF</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Trio MMF</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Groupsex</span>
                    <span className="text-gray-700">€ 50,-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Photo's</span>
                    <span className="text-gray-700">€ 50,-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Video</span>
                    <span className="text-gray-700">€ 100,-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">High Heels</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Role Play</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">Soft SM</span>
                    <span className="text-gray-700">Included</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pink-500">BDSM</span>
                    <span className="text-gray-700">€ 50,-</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Link
                  to="/write-review/melissa"
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

          {/* Right Column - Sticky Info (25%) */}
          <div className="w-full md:w-1/4">
            <div className="space-y-6 sticky top-4">
              {/* Location */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Location</h2>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <p className="font-medium">Amsterdam</p>
                    <p className="text-gray-600">Keizersgracht</p>
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
              
              {/* Send Gift */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Send Gift</h2>
                <div className="space-y-4">
                  <p className="text-gray-700">Show your appreciation by sending a gift to Melissa</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="bg-white p-3 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-xl mb-1">🌹</div>
                      <div className="text-sm font-medium">Rose</div>
                      <div className="text-xs text-gray-500">5 Credits</div>
                    </button>
                    <button className="bg-white p-3 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-xl mb-1">💝</div>
                      <div className="text-sm font-medium">Gift Box</div>
                      <div className="text-xs text-gray-500">10 Credits</div>
                    </button>
                    <button className="bg-white p-3 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-xl mb-1">💎</div>
                      <div className="text-sm font-medium">Diamond</div>
                      <div className="text-xs text-gray-500">50 Credits</div>
                    </button>
                  </div>
                  <Link
                    to="/send-gift/melissa"
                    className="block w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors font-medium text-center"
                  >
                    Send Gift
                  </Link>
                </div>
              </div>

              {/* Online Booking */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Online Booking</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-white p-3 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-gray-600">Today</div>
                    </button>
                    <button className="bg-white p-3 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="font-medium text-gray-600">Tomorrow</div>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button className="bg-white p-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-sm">10:00</div>
                    </button>
                    <button className="bg-white p-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-sm">11:00</div>
                    </button>
                    <button className="bg-white p-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-sm">12:00</div>
                    </button>
                    <button className="bg-white p-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-sm">14:00</div>
                    </button>
                    <button className="bg-white p-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-sm">15:00</div>
                    </button>
                    <button className="bg-white p-2 rounded-lg text-center hover:bg-gray-50 transition-colors">
                      <div className="text-sm">16:00</div>
                    </button>
                  </div>
                  <Link
                    to="/booking/melissa"
                    className="block w-full bg-pink-500 text-white p-3 rounded-lg hover:bg-pink-600 transition-colors font-medium text-center"
                  >
                    Book Appointment
                  </Link>
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

              {/* Personal Details */}

              {/* Opening Hours */}
              <div className="bg-pink-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-3">Working Hours</h2>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>Monday</div><div>Closed</div>
                  <div>Tuesday</div><div>Closed</div>
                  <div>Wednesday</div><div>09:00 - 22:00</div>
                  <div>Thursday</div><div>09:00 - 22:00</div>
                  <div>Friday</div><div>09:00 - 24:00</div>
                  <div>Saturday</div><div>09:00 - 24:00</div>
                  <div>Sunday</div><div>09:00 - 24:00</div>
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

export default AdvertisementPro;