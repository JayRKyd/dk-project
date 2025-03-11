import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Users,
  Star,
  Heart,
  MessageCircle,
  Eye,
  Settings,
  Trash2,
  Edit,
  Camera
} from 'lucide-react';

interface Lady {
  id: string;
  name: string;
  imageUrl: string;
  age: number;
  nationality: string;
  rating: number;
  loves: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'pending';
}

const sampleLadies: Lady[] = [
  {
    id: '1',
    name: 'Sophia',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    age: 23,
    nationality: 'Russian',
    rating: 9.5,
    loves: 245,
    isVerified: true,
    status: 'active'
  },
  {
    id: '2',
    name: 'Emma',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    age: 25,
    nationality: 'Dutch',
    rating: 9.2,
    loves: 178,
    isVerified: true,
    status: 'active'
  },
  {
    id: '3',
    name: 'Isabella',
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=300&q=80',
    age: 24,
    nationality: 'Italian',
    rating: 9.7,
    loves: 312,
    isVerified: true,
    status: 'active'
  },
  {
    id: '4',
    name: 'Victoria',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    age: 22,
    nationality: 'Romanian',
    rating: 8.8,
    loves: 156,
    isVerified: false,
    status: 'pending'
  }
];

export default function ClubLadies() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLady, setSelectedLady] = useState<Lady | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLadyForUpgrade, setSelectedLadyForUpgrade] = useState<Lady | null>(null);

  // Filter ladies based on search query and status
  const filteredLadies = sampleLadies.filter(lady => {
    const matchesSearch = lady.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lady.nationality.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lady.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (lady: Lady) => {
    setSelectedLady(lady);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    console.log('Deleting lady:', selectedLady?.name);
    setShowDeleteConfirm(false);
    setSelectedLady(null);
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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Ladies</h1>
            <p className="text-gray-600 mt-1">
              Add and manage ladies working in your club
            </p>
          </div>
          <Link
            to="/dashboard/club/lady/add"
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Lady</span>
          </Link>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="bg-pink-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Total Ladies:</span>
            <span className="ml-2 font-bold text-pink-500">{sampleLadies.length}</span>
          </div>
          <div className="bg-pink-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Active Ladies:</span>
            <span className="ml-2 font-bold text-green-500">
              {sampleLadies.filter(lady => lady.status === 'active').length}
            </span>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or nationality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Inactive
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* Ladies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLadies.map((lady) => (
          <div key={lady.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Lady Header */}
            <div className="relative">
              <img
                src={lady.imageUrl}
                alt={lady.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                {lady.status === 'active' && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                    Active
                  </span>
                )}
                {lady.status === 'inactive' && (
                  <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-sm">
                    Inactive
                  </span>
                )}
                {lady.status === 'pending' && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                    Pending
                  </span>
                )}
                {lady.isVerified && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Lady Info */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lady.name}</h3>
                  <div className="text-sm text-gray-500">
                    {lady.age} years • {lady.nationality}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                    {lady.rating} ★
                  </div>
                  <div className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                    {lady.loves} ❤
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Views</div>
                  <div className="font-semibold">1,234</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Bookings</div>
                  <div className="font-semibold">56</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Reviews</div>
                  <div className="font-semibold">12</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/dashboard/club/lady/edit/${lady.id}`}
                  className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <div className="flex-1 flex gap-2">
                  <Link
                    to="/dashboard/lady/bump"
                    className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Bump</span>
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedLadyForUpgrade(lady);
                      setShowUpgradeModal(true);
                    }}
                    className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Upgrade</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedLady(lady);
                    setSelectedStatus(lady.status === 'active' ? 'inactive' : 'active');
                    setShowStatusModal(true);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    lady.status === 'active'
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <span>{lady.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button
                  onClick={() => handleDelete(lady)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedLady && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Remove Lady</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove {selectedLady.name} from your club? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedLady(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
           </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedLady && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedStatus === 'active' ? 'Activate Lady' : 'Deactivate Lady'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {selectedStatus === 'active' ? 'activate' : 'deactivate'} {selectedLady.name}?
              {selectedStatus === 'inactive' && ' This will hide her profile from search results.'}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedLady(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle status change
                  console.log('Changing status for', selectedLady.name, 'to', selectedStatus);
                  setShowStatusModal(false);
                  setSelectedLady(null);
                }}
                className={`px-6 py-2 text-white rounded-lg transition-colors ${
                  selectedStatus === 'active'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Membership Modal */}
      {showUpgradeModal && selectedLadyForUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Upgrade {selectedLadyForUpgrade.name}'s Membership
            </h3>
            <p className="text-gray-600 mb-6">
              Choose a membership tier to upgrade this lady's profile:
            </p>
            <div className="space-y-4">
              <Link
                to="/dashboard/lady/upgrade/membership"
                className="block w-full bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors text-center"
              >
                View Membership Options
              </Link>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setSelectedLadyForUpgrade(null);
                }}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}