import React, { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

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

const initialFormData: FormData = {
  name: 'Pink Angels Club',
  description: 'Welcome to Pink Angels Club, Amsterdam\'s premier adult entertainment venue. We offer a luxurious and discreet environment where you can enjoy the company of our beautiful ladies.',
  website: 'www.pinkangels.nl',
  email: 'info@pinkangels.nl',
  phone: '06 12 234 678',
  
  address: 'Keizersgracht 8',
  city: 'Amsterdam',
  postalCode: '1015 CN',
  
  facilities: {
    'Private Rooms': true,
    'VIP Lounge': true,
    'Parking': true,
    'Taxi Service': true,
    'Discrete entrance': true,
    'Wifi': true,
    'Smoking area': true,
    'Lounge area': true,
    'Bar with alcoholic drinks': true,
    'Bar with non-alcoholic drinks': true,
    'Restaurant with snacks': true,
    'Restaurant with buffet': true,
    'Sex shop': true,
    'Cinema': true,
    'Disco/dancing': true,
    'ATM Machine': true,
    'Slot machines': true,
    'Sauna': true,
    'Jacuzzi': true,
    'Swimming pool': true,
    'Dressing room': true,
    'Showers': true,
    'Towels': true,
    'Bathrobe': true,
    'Garden/outdoor area': true,
    'Relaxing massage': true,
    'Erotic massage': true,
    'Striptease': true,
    'Lapdance': true,
    'Sex show': true,
    'Private rooms': true,
    'BDSM room': true,
    'Bar Service': true,
    'Private Parking': true,
    'Shower Facilities': true,
    'Air Conditioning': true,
    'Credit Card Payment': true,
    'Security Service': true,
    'Champagne Room': true,
    'VIP Package': true,
    'Bachelor Party': true,
    'Private Event': true
  },
  
  openingHours: {
    monday: { isOpen: true, open: '12:00', close: '03:00' },
    tuesday: { isOpen: true, open: '12:00', close: '03:00' },
    wednesday: { isOpen: true, open: '12:00', close: '03:00' },
    thursday: { isOpen: true, open: '12:00', close: '03:00' },
    friday: { isOpen: true, open: '12:00', close: '05:00' },
    saturday: { isOpen: true, open: '12:00', close: '05:00' },
    sunday: { isOpen: true, open: '14:00', close: '03:00' }
  },
  
  entryFee: '50',
  roomFee: '80',
  drinkPrices: {
    softDrinks: '3',
    beer: '4',
    wine: '5',
    cocktails: '8'
  }
};

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
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings updated:', formData);
  };

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
            {/* Content for each tab */}
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
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Club Photos</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
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

                <div className="mt-6 bg-pink-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Photo Guidelines:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Maximum 8 photos allowed</li>
                    <li>First photo will be your main profile photo</li>
                    <li>Photos must show your club's facilities</li>
                    <li>No explicit content allowed</li>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        required
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
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(formData.facilities).map(([facility, isAvailable]) => (
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