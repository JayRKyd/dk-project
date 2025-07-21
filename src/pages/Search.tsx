import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchProfiles, SearchFilters as ServiceSearchFilters, SearchResult } from '../services/searchService';

interface SearchFilters {
  location: string;
  radius: string;
  type: string[];
  age: { min: string; max: string };
  height: { min: string; max: string };
  weight: { min: string; max: string };
  cupSize: string;
  bodySize: string;
  origin: string[];
  languages: string[];
  services: string[];
}

export default function Search() {
  const [filters, setFilters] = useState<SearchFilters>({
    location: 'Amsterdam',
    radius: '50',
    type: ['Ladies', 'Escort'],
    age: { min: '18', max: '60' },
    height: { min: '150', max: '210' },
    weight: { min: '40', max: '150' },
    cupSize: 'B',
    bodySize: '',
    origin: [],
    languages: ['English'],
    services: ['Girlfriend Experience', 'Deep Throat', 'High Heels', 'I visit you at home'],
  });

  const radiusOptions = ['0', '5', '10', '25', '50'];
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const convertFiltersToServiceFilters = (filters: SearchFilters): ServiceSearchFilters => {
    // Determine category based on selections
    let category: 'ladies' | 'clubs' | 'all' = 'all';
    
    if (filters.type.includes('Sex Club / Escort Agency / Other') && !filters.type.includes('Ladies')) {
      category = 'clubs';
    } else if (filters.type.includes('Ladies') && !filters.type.includes('Sex Club / Escort Agency / Other')) {
      category = 'ladies';
    } else {
      // If both or neither are selected, search all
      category = 'all';
    }

    return {
      location: filters.location,
      category: category,
      ageMin: parseInt(filters.age.min),
      ageMax: parseInt(filters.age.max),
      heightMin: parseInt(filters.height.min),
      heightMax: parseInt(filters.height.max),
      weightMin: parseInt(filters.weight.min),
      weightMax: parseInt(filters.weight.max),
      cupSize: filters.cupSize || undefined,
      bodySize: filters.bodySize || undefined,
      descent: filters.origin.length > 0 ? filters.origin[0] : undefined,
      languages: filters.languages,
      ethnicity: filters.origin.length > 0 ? filters.origin[0] : undefined,
      bodyType: filters.bodySize || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    try {
      const serviceFilters = convertFiltersToServiceFilters(filters);
      console.log('Searching with filters:', serviceFilters);
      
      const results = await searchProfiles(serviceFilters);
      setSearchResults(results);
      console.log('Search results:', results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Advanced Search</h1>
        <p className="text-gray-600 mt-1">
          Find exactly what you're looking for with our powerful search filters
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm">
        {/* Location and Radius */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                placeholder="Enter city name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
              <select
                value={filters.radius}
                onChange={(e) => setFilters({...filters, radius: e.target.value})}
                className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
              >
                {radiusOptions.map((option) => (
                  <option key={option} value={option}>
                    Within {option} km
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Ladies')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Ladies']
                    : filters.type.filter(t => t !== 'Ladies');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Ladies</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Transsexuals')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Transsexuals']
                    : filters.type.filter(t => t !== 'Transsexuals');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Transsexuals</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Sex Club / Escort Agency / Other')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Sex Club / Escort Agency / Other']
                    : filters.type.filter(t => t !== 'Sex Club / Escort Agency / Other');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Sex Club / Escort Agency / Other</span>
            </label>
          </div>
        </div>

        {/* Visit Type */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Visit Type</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Private visit')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Private visit']
                    : filters.type.filter(t => t !== 'Private visit');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Private visit</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Escort')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Escort']
                    : filters.type.filter(t => t !== 'Escort');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Escort</span>
            </label>
          </div>
        </div>

        {/* Additional Options */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h2>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Verified by DateKelly')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Verified by DateKelly']
                    : filters.type.filter(t => t !== 'Verified by DateKelly');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Verified by DateKelly</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type.includes('Fan Posts')}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...filters.type, 'Fan Posts']
                    : filters.type.filter(t => t !== 'Fan Posts');
                  setFilters({...filters, type: newTypes});
                }}
                className="text-pink-500 rounded"
              />
              <span>Fan Posts</span>
            </label>
          </div>
        </div>

        {/* Physical Characteristics */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Physical Characteristics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.age.min}
                  onChange={(e) => setFilters({...filters, age: {...filters.age, min: e.target.value}})}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                >
                  {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                    <option key={age} value={age}>{age} years</option>
                  ))}
                </select>
                <select
                  value={filters.age.max}
                  onChange={(e) => setFilters({...filters, age: {...filters.age, max: e.target.value}})}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                >
                  {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                    <option key={age} value={age}>{age} years</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.height.min}
                  onChange={(e) => setFilters({...filters, height: {...filters.height, min: e.target.value}})}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                >
                  {Array.from({ length: 61 }, (_, i) => i + 150).map((height) => (
                    <option key={height} value={height}>{height} cm</option>
                  ))}
                </select>
                <select
                  value={filters.height.max}
                  onChange={(e) => setFilters({...filters, height: {...filters.height, max: e.target.value}})}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                >
                  {Array.from({ length: 61 }, (_, i) => i + 150).map((height) => (
                    <option key={height} value={height}>{height} cm</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.weight.min}
                  onChange={(e) => setFilters({...filters, weight: {...filters.weight, min: e.target.value}})}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                >
                  {Array.from({ length: 111 }, (_, i) => i + 40).map((weight) => (
                    <option key={weight} value={weight}>{weight} kg</option>
                  ))}
                </select>
                <select
                  value={filters.weight.max}
                  onChange={(e) => setFilters({...filters, weight: {...filters.weight, max: e.target.value}})}
                  className="w-full px-4 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-pink-50"
                >
                  {Array.from({ length: 111 }, (_, i) => i + 40).map((weight) => (
                    <option key={weight} value={weight}>{weight} kg</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cup Size</label>
              <div className="flex flex-wrap gap-4">
                {['A', 'B', 'C', 'D', 'DD+'].map((size) => (
                  <label key={size} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="cupSize"
                      value={size}
                      checked={filters.cupSize === size}
                      onChange={(e) => setFilters({...filters, cupSize: e.target.value})}
                      className="text-pink-500 focus:ring-pink-500"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Body Size</label>
              <div className="flex flex-wrap gap-4">
                {['Slim', 'Normal', 'Curvy', 'Chubby'].map((size) => (
                  <label key={size} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bodySize"
                      value={size}
                      checked={filters.bodySize === size}
                      onChange={(e) => setFilters({...filters, bodySize: e.target.value})}
                      className="text-pink-500 focus:ring-pink-500"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Origin and Languages */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Background & Communication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['East-European', 'West European', 'African', 'American', 'Arab', 'Asian', 'Latin'].map((origin) => (
                  <label key={origin} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.origin.includes(origin)}
                      onChange={(e) => {
                        const newOrigins = e.target.checked
                          ? [...filters.origin, origin]
                          : filters.origin.filter(o => o !== origin);
                        setFilters({...filters, origin: newOrigins});
                      }}
                      className="text-pink-500 rounded"
                    />
                    <span>{origin}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['English', 'Romanian', 'Dutch', 'German', 'French', 'Italian', 'Spanish', 'Russian', 'Bulgarian', 'Chinese', 'Arabic'].map((language) => (
                  <label key={language} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.languages.includes(language)}
                      onChange={(e) => {
                        const newLanguages = e.target.checked
                          ? [...filters.languages, language]
                          : filters.languages.filter(l => l !== language);
                        setFilters({...filters, languages: newLanguages});
                      }}
                      className="text-pink-500 rounded"
                    />
                    <span>{language}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-pink-500 mb-6">Services & extras</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {[
                'Service for Men',
                'Service for Ladies',
                'Girlfriend Experience',
                'Striptease',
                'Fingering',
                'Handjob',
                'Kissing',
                'French kissing',
                'Pussy licking',
                'Rimming (rec)',
                'Rimming (client)',
                'Blowjob with condom',
                'Blowjob without condom',
                'Deep Throat',
                'Sex with condom',
                'Sex without condom',
                'Anal sex (me)',
                'Anal sex without condom (me)',
                'Anal sex (client)',
                'Cum on body',
                'Cum on face',
                'Cum in mouth',
                'Swallowing',
                'Domina & Slave',
              ].map((service) => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.services.includes(service)}
                    onChange={(e) => {
                      const newServices = e.target.checked
                        ? [...filters.services, service]
                        : filters.services.filter(s => s !== service);
                      setFilters({...filters, services: newServices});
                    }}
                    className="text-pink-500 rounded"
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
            <div className="space-y-2">
              {[
                'Relaxing Massage',
                'Erotic Massage',
                'Anal Massage',
                'Dildo (rec)',
                'Dildo (client)',
                'Trio MFF',
                'Trio MMF',
                'Groupsex',
                'Photos',
                'Video',
                'High Heels',
                'Role Play',
                'Soft SM',
                'BDSM',
                'Domina & Slave',
                'Golden Shower (me)',
                'Golden Shower (client)',
                'I visit you at home',
                'I visit you at hotel',
                'Car sex',
                'Outdoor sex',
              ].map((service) => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.services.includes(service)}
                    onChange={(e) => {
                      const newServices = e.target.checked
                        ? [...filters.services, service]
                        : filters.services.filter(s => s !== service);
                      setFilters({...filters, services: newServices});
                    }}
                    className="text-pink-500 rounded"
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 bg-gray-50">
          <div className="max-w-xl mx-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div className="mt-8">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">😕</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h2>
              <p className="text-gray-600">Try adjusting your search filters to find more matches.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Results ({searchResults.length} found)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <div key={result.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600">{result.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{result.location}</p>
                    {result.description && (
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{result.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-pink-500 font-medium">{result.price || 'Contact for price'}</span>
                      {result.is_club && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Club</span>
                      )}
                    </div>
                    {result.age && (
                      <div className="mt-2 text-xs text-gray-500">
                        Age: {result.age} • {result.height && `${result.height}cm`} • {result.cup_size && `Cup: ${result.cup_size}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}