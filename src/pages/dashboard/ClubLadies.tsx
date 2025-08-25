import React, { useState, useEffect } from 'react';
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
  Camera,
  Loader2
} from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { clubService, ClubLady } from '../../services/clubService';

// Enhanced Lady interface to match our database structure
interface Lady {
  id: string;
  name: string;
  imageUrl?: string;
  age?: number;
  nationality?: string;
  rating?: number;
  loves?: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'left';
  // Additional database fields
  club_id: string;
  lady_id: string;
  join_date: string;
  revenue_share_percentage: number;
  monthly_fee?: number;
  lady?: {
    id: string;
    username: string;
    email: string;
  };
  profile?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export default function ClubLadies() {
  const { clubProfile, ladies, loading, actions } = useClubDashboard();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedLady, setSelectedLady] = useState<Lady | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedLadyForUpgrade, setSelectedLadyForUpgrade] = useState<Lady | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert ClubLady[] to Lady[] format for UI compatibility
  const convertToLady = (clubLady: ClubLady): Lady => ({
    id: clubLady.id,
    name: clubLady.profile?.name || clubLady.lady?.username || 'Unknown',
    imageUrl: clubLady.profile?.image_url,
    age: undefined, // Would need to be added to profile table
    nationality: undefined, // Would need to be added to profile table
    rating: undefined, // Would need analytics data
    loves: undefined, // Would need analytics data
    isVerified: false, // Would check verification status
    status: clubLady.status,
    club_id: clubLady.club_id,
    lady_id: clubLady.lady_id,
    join_date: clubLady.join_date,
    revenue_share_percentage: clubLady.revenue_share_percentage,
    monthly_fee: clubLady.monthly_fee,
    lady: clubLady.lady,
    profile: clubLady.profile
  });

  const processedLadies = ladies.map(convertToLady);

  // Filter ladies based on search query and status
  const filteredLadies = processedLadies.filter(lady => {
    const matchesSearch = lady.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (lady.nationality && lady.nationality.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (lady.lady?.username && lady.lady.username.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lady.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (lady: Lady) => {
    setSelectedLady(lady);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedLady || !clubProfile?.id) return;
    
    setIsSubmitting(true);
    try {
      // Call API to remove lady from club
      await clubService.removeLadyFromClub(clubProfile.id, selectedLady.lady_id);
      
      // Refresh ladies data
      await actions.fetchClubLadies(clubProfile.id);
      
      console.log('Successfully removed lady:', selectedLady.name);
    } catch (error) {
      console.error('Error removing lady:', error);
      // Could add error notification here
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
      setSelectedLady(null);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedLady || !clubProfile?.id) return;
    
    setIsSubmitting(true);
    try {
      // Call API to update lady status
      await clubService.updateLadyStatus(clubProfile.id, selectedLady.lady_id, selectedStatus);
      
      // Refresh ladies data
      await actions.fetchClubLadies(clubProfile.id);
      
      console.log('Successfully changed status for:', selectedLady.name, 'to', selectedStatus);
    } catch (error) {
      console.error('Error changing lady status:', error);
      // Could add error notification here
    } finally {
      setIsSubmitting(false);
      setShowStatusModal(false);
      setSelectedLady(null);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <span className="ml-2 text-gray-600">Loading ladies...</span>
        </div>
      </div>
    );
  }

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
            <span className="ml-2 font-bold text-pink-500">{processedLadies.length}</span>
          </div>
          <div className="bg-pink-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Active Ladies:</span>
            <span className="ml-2 font-bold text-green-500">
              {processedLadies.filter(lady => lady.status === 'active').length}
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
              placeholder="Search by name or username..."
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
              onClick={() => setStatusFilter('suspended')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === 'suspended'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Suspended
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
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                {lady.imageUrl ? (
                  <img
                    src={lady.imageUrl}
                    alt={lady.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <span className="text-sm">No Photo</span>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {lady.status === 'active' && (
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-sm">
                    Active
                  </span>
                )}
                {lady.status === 'pending' && (
                  <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                    Pending
                  </span>
                )}
                {lady.status === 'inactive' && (
                  <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-sm">
                    Inactive
                  </span>
                )}
                {lady.status === 'suspended' && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                    Suspended
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
                    @{lady.lady?.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    Joined: {new Date(lady.join_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                    {lady.revenue_share_percentage}% split
                  </div>
                </div>
              </div>

              {/* Stats - placeholder for now */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Views</div>
                  <div className="font-semibold">-</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Bookings</div>
                  <div className="font-semibold">-</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Reviews</div>
                  <div className="font-semibold">-</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <Link
                  to={`/dashboard/club/lady/edit/${lady.lady_id}`}
                  className="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 min-w-[80px]"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </Link>
                <button
                  onClick={() => {
                    setSelectedLady(lady);
                    setSelectedStatus(lady.status === 'active' ? 'inactive' : 'active');
                    setShowStatusModal(true);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[100px] ${
                    lady.status === 'active'
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <span>{lady.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                </button>
                <button
                  onClick={() => handleDelete(lady)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 min-w-[80px]"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLadies.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ladies found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding your first lady to the club.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Link
              to="/dashboard/club/lady/add"
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Lady</span>
            </Link>
          )}
        </div>
      )}

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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
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
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={isSubmitting}
                className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                  selectedStatus === 'active'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-500 hover:bg-gray-600'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Confirm'
                )}
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