import React, { useLocation } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function SearchBar() {
  const location = useLocation();
  const showPopularSearches = location.pathname !== '/clubs';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-500">City</span>
        <input
          type="text"
          placeholder="Amsterdam"
          className="w-full pl-16 pr-12 py-3 border border-pink-300 rounded-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <MapPin className="absolute right-4 h-6 w-6 text-pink-500" />
      </div>
      {showPopularSearches && (
        <div className="mt-4 flex flex-wrap gap-4">
          <span className="text-gray-700">Popular searches:</span>
          {[
            'Positive Reviews',
            'Safe Sex',
            'Ladyboys',
            'New ladies',
            'S&M',
            'Escort',
            'Blowjob with condom',
            'Anal sex'
          ].map((tag) => (
            <a
              key={tag}
              href="#"
              className="text-[#E91E63] hover:text-white hover:bg-[#E91E63] text-sm px-3 py-1 rounded-full transition-all duration-200 hover:shadow-md transform hover:scale-105"
            >
              {tag}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}