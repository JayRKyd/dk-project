import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Camera,
  Plus,
  Check,
  X,
	AlertTriangle
} from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { supabase } from '../../lib/supabase';
import { clubService } from '../../services/clubService';

interface LadyForm {
  // Basic Info
  name: string;
  age: string;
  nationality: string;
  languages: string[];
  
  // Physical Characteristics
  height: string;
  weight: string;
  cupSize: string;
  bodyType: string;
  
  // Contact & Availability
  phone: string;
  email: string;
  workingDays: {
    [key: string]: boolean;
  };
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
    };
  };
  
  // Services
  services: {
    [key: string]: boolean | string;
  };
  
  // Photos
  photos: File[];
}

const initialFormData: LadyForm = {
  name: '',
  age: '',
  nationality: '',
  languages: [],
  height: '',
  weight: '',
  cupSize: '',
  bodyType: '',
  phone: '',
  email: '',
  workingDays: {
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  },
  workingHours: {},
  services: {
    'Service for Men': false,
    'Service for Ladies': false,
    'Girlfriend Experience': false,
    'Striptease': false,
    'Fingering': false,
    'Handjob': false,
    'Kissing': false,
    'French kissing': false,
    'Pussy licking': false,
    'Rimming (me)': false,
    'Rimming (client)': false,
    'Blowjob with condom': false,
    'Blowjob without condom': false,
    'Deep Throat': false,
    'Sex with condom': false,
    'Sex without condom': false,
    'Relaxing Massage': false,
    'Erotic Massage': false,
    'Anal Massage': false,
    'Dildo (me)': false,
    'Dildo (client)': false,
    'Trio MFF': false,
    'Trio MMF': false,
    'Groupsex': false,
    'Photos': false,
    'Video': false,
    'High Heels': false,
    'Role Play': false,
    'Soft SM': false,
    'BDSM': false,
    'Golden Shower (me)': false,
    'Golden Shower (client)': false,
    'I visit you at home': false,
    'I visit you at hotel': false,
    'Car sex': false,
    'Outdoor sex': false
  },
  photos: []
};

export default function ClubLady() {
	const navigate = useNavigate();
	const { clubProfile, ladies, actions } = useClubDashboard() as any;
  const [formData, setFormData] = useState<LadyForm>(initialFormData);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
	const [linkSearch, setLinkSearch] = useState('');
	const [linkResult, setLinkResult] = useState<null | { id: string; email: string; username?: string }>(null);
	const [linking, setLinking] = useState(false);
	const [suggestions, setSuggestions] = useState<Array<{ id: string; email: string; username?: string }>>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [searchDebounce, setSearchDebounce] = useState<number | undefined>(undefined);
	const [findError, setFindError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.photos.length > 7) {
      alert('Maximum 7 photos allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
		setShowConfirmation(true);
  };

	const handleFindLady = async () => {
		setFindError(null);
		setLinkResult(null);
		if (!linkSearch.trim()) {
			setFindError('Enter an email or username');
			return;
		}
		try {
			// Search in public.users where role = 'lady' by email or username
			const { data, error } = await supabase
				.from('users')
				.select('id, email, username, role')
				.or(`email.ilike.%${linkSearch}%,username.ilike.%${linkSearch}%`)
				.eq('role', 'lady')
				.limit(1);
			if (error) throw error;
			if (!data || data.length === 0) {
				setFindError('No lady account found by that email/username');
				return;
			}
			setLinkResult({ id: data[0].id, email: data[0].email, username: data[0].username });
		} catch (err: any) {
			setFindError(err?.message || 'Search failed');
		}
	};

	// Live suggestions after 2+ characters with debounce
	const existingLadyIds = new Set<string>((ladies || []).map((l: any) => l.lady_id));
	React.useEffect(() => {
		if (searchDebounce) {
			window.clearTimeout(searchDebounce);
		}
		if (!linkSearch || linkSearch.trim().length < 2) {
			setSuggestions([]);
			return;
		}
		const handle = window.setTimeout(async () => {
			setSearchLoading(true);
			try {
				const { data, error } = await supabase
					.from('users')
					.select('id, email, username, role')
					.or(`email.ilike.%${linkSearch}%,username.ilike.%${linkSearch}%`)
					.eq('role', 'lady')
					.limit(10);
				if (error) throw error;
				const filtered = (data || []).filter(u => !existingLadyIds.has(u.id));
				setSuggestions(filtered);
			} catch (err) {
				// silent fail for suggestions
				setSuggestions([]);
			} finally {
				setSearchLoading(false);
			}
		}, 300);
		setSearchDebounce(handle as unknown as number);
		// cleanup
		return () => window.clearTimeout(handle);
	}, [linkSearch]);

	const handleLinkLady = async () => {
		if (!clubProfile?.id || !linkResult?.id) return;
		setLinking(true);
		try {
			await clubService.addLadyToClub(clubProfile.id, linkResult.id, 70);
			await actions.fetchClubLadies(clubProfile.id);
			navigate('/dashboard/club/ladies');
		} catch (err) {
			setFindError(err instanceof Error ? err.message : 'Failed to link lady');
		} finally {
			setLinking(false);
		}
	};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/club/ladies"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Ladies</span>
      </Link>

			<div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Lady</h1>

				{/* Link Existing Lady Account */}
				<div className="mb-8 p-4 border rounded-lg">
					<h2 className="text-lg font-semibold text-gray-900 mb-3">Link Existing Lady Account</h2>
					<div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center relative">
						<input
							type="text"
							placeholder="Search by email or username..."
							value={linkSearch}
							onChange={(e) => setLinkSearch(e.target.value)}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
						/>
						<button
							onClick={handleFindLady}
							className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
						>
							Find
						</button>
						{/* Suggestions dropdown */}
						{(suggestions.length > 0 || searchLoading) && (
							<div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow z-10 max-h-60 overflow-auto">
								{searchLoading && (
									<div className="px-4 py-2 text-sm text-gray-500">Searching...</div>
								)}
								{suggestions.map(s => (
									<button
										key={s.id}
										onClick={() => {
											setLinkResult(s);
											setSuggestions([]);
										}}
										className="w-full text-left px-4 py-2 hover:bg-pink-50"
									>
										<div className="font-medium text-gray-900">{s.username || s.email}</div>
										<div className="text-xs text-gray-600">{s.email}</div>
									</button>
								))}
								{!searchLoading && suggestions.length === 0 && (
									<div className="px-4 py-2 text-sm text-gray-500">No results</div>
								)}
							</div>
						)}
					</div>
					{findError && <p className="text-sm text-red-600 mt-2">{findError}</p>}
					{linkResult && (
						<div className="mt-4 flex items-center justify-between p-3 bg-pink-50 rounded">
							<div>
								<div className="font-medium text-gray-900">{linkResult.username || 'Lady Account'}</div>
								<div className="text-sm text-gray-600">{linkResult.email}</div>
							</div>
							<button
								onClick={handleLinkLady}
								disabled={linking}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
							>
								{linking ? 'Linking...' : 'Link to Club'}
							</button>
						</div>
					)}
				</div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
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
                  Age
                </label>
                <input
                  type="number"
                  min="18"
                  max="99"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Physical Characteristics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Physical Characteristics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="140"
                  max="200"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cup Size
                </label>
                <select
                  value={formData.cupSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, cupSize: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  {['A', 'B', 'C', 'D', 'DD', 'E', 'F'].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Type
                </label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => setFormData(prev => ({ ...prev, bodyType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  {['Slim', 'Athletic', 'Average', 'Curvy', 'BBW'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviewUrls.map((url, index) => (
                <div key={index} className="aspect-square relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.photos.length < 7 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-pink-500 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Add Photos</span>
                </label>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Upload up to 7 photos. First photo will be the main profile photo.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Working Hours</h2>
            <div className="space-y-4">
              {Object.entries(formData.workingDays).map(([day, isWorking]) => (
                <div key={day} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isWorking}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          workingDays: {
                            ...prev.workingDays,
                            [day]: e.target.checked
                          }
                        }))}
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
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day]: {
                              ...prev.workingHours[day],
                              start: e.target.value
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
                        value={formData.workingHours[day]?.end || '22:00'}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          workingHours: {
                            ...prev.workingHours,
                            [day]: {
                              ...prev.workingHours[day],
                              end: e.target.value
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

          {/* Services */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {Object.entries(formData.services).map(([service, included]) => (
                <div key={service} className="py-2 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={included !== false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            [service]: e.target.checked
                          }
                        }))}
                        className="rounded border-pink-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-gray-700">{service}</span>
                    </label>
                    {included !== false && (
                      <select
                        value={included === true ? 'Included' : included}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            [service]: e.target.value === 'Included' ? true : e.target.value
                          }
                        }))}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition-colors font-medium"
          >
            Add Lady
          </button>
        </form>

        {/* Guidelines */}
        <div className="mt-8 bg-pink-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All information must be accurate and up to date</li>
            <li>• Photos must be recent and show the actual person</li>
            <li>• No explicit content in profile photos</li>
            <li>• Working hours must be accurate</li>
            <li>• Services must be clearly listed with accurate pricing</li>
            <li>• Contact information must be valid and monitored</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-yellow-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Addition</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to add this lady to your club? Please verify that all information is accurate.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Here you would typically make an API call to save the data
                  console.log('Adding lady:', formData);
                  setShowConfirmation(false);
                  // Navigate back to ladies list
                }}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}