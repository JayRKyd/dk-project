import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Camera, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowLeft
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings updated:', formData);
  };

  const updateFormData = (path: string[], value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newData;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/lady"
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
                {/* Photo Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      {index === 0 ? (
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Main Photo</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-500">Add Photo</span>
                        </div>
                      )}
                    </div>
                  ))}
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}