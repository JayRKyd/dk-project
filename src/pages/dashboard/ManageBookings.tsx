import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserProfile } from '../../hooks/useUserProfile';
import { 
  getUpcomingBookings, 
  getBookingStats, 
  updateBookingStatus, 
  setWeeklyAvailability, 
  Booking as BookingType
} from '../../services/bookingService';
import { 
  ArrowLeft,
  Calendar,
  Check,
  CalendarDays,
  CalendarOff,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface BookingDisplay {
  id: string;
  clientName: string;
  clientPhone?: string;
  date: string;
  time: string;
  duration: string;
  service?: string;
  price: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  message?: string;
  location: 'incall' | 'outcall';
  address?: string;
}

interface Availability {
  day: string;
  isWorking: boolean;
  startTime?: string;
  endTime?: string;
}

// Helper function to convert database bookings to display format
const formatBookingForDisplay = (booking: BookingType, clientName: string = 'Client'): BookingDisplay => {
  return {
    id: booking.id,
    clientName: booking.client?.username || clientName,
    clientPhone: booking.client?.email || undefined,
    date: booking.date,
    time: booking.time,
    duration: `${booking.duration} minutes`,
    price: `$${booking.total_cost}`,
    status: booking.status,
    location: booking.location_type as 'incall' | 'outcall',
    address: booking.address,
    message: booking.message
  };
};

const defaultAvailability: Availability[] = [
  { day: 'Monday', isWorking: false },
  { day: 'Tuesday', isWorking: false },
  { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '22:00' },
  { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '22:00' },
  { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '24:00' },
  { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '24:00' },
  { day: 'Sunday', isWorking: true, startTime: '09:00', endTime: '24:00' }
];

const getStatusColor = (status: BookingDisplay['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: BookingDisplay['status']) => {
  switch (status) {
    case 'pending':
      return <AlertCircle className="h-5 w-5" />;
    case 'confirmed':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'completed':
      return <Check className="h-5 w-5" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5" />;
    case 'rejected':
      return <XCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

export default function ManageBookings() {
  const { profile } = useUserProfile();
  const [availability, setAvailability] = useState<Availability[]>(defaultAvailability);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDisplay | null>(null);
  const [action, setAction] = useState<'confirm' | 'cancel' | null>(null);
  
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [stats, setStats] = useState({
    todayBookings: 0,
    pendingApproval: 0
  });
  const [loading, setLoading] = useState({
    bookings: true,
    availability: true,
    action: false,
    stats: true
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings and stats when profile is loaded
  useEffect(() => {
    if (!profile) return;
    
    const fetchBookingsAndStats = async () => {
      try {
        setLoading(prev => ({ ...prev, bookings: true, stats: true }));
        setError(null);
        
        // Get all bookings for the profile
        const allBookings = await getUpcomingBookings(profile.id, 100);
        
        // Format bookings for display
        const formattedBookings = allBookings.map(booking => 
          formatBookingForDisplay(booking)
        );
        
        setBookings(formattedBookings);
        
        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = allBookings.filter(booking => 
          booking.date === today && ['pending', 'confirmed'].includes(booking.status)
        ).length;
        
        const pendingApproval = allBookings.filter(booking => 
          booking.status === 'pending'
        ).length;
        
        setStats({
          todayBookings,
          pendingApproval
        });
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, bookings: false, stats: false }));
      }
    };
    
    fetchBookingsAndStats();
  }, [profile]);
  
  // Fetch availability when profile is loaded
  useEffect(() => {
    if (!profile) return;
    
    // TODO: Implement fetching availability from the database
    // For now, we'll use the default availability
    setLoading(prev => ({ ...prev, availability: false }));
  }, [profile]);

  const handleAvailabilityChange = (index: number, field: keyof Availability, value: any) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };
  
  const saveAvailability = async () => {
    if (!profile) return;
    
    try {
      setLoading(prev => ({ ...prev, availability: true }));
      setError(null);
      
      // Convert our UI availability format to the database format
      const availabilityData = availability.map((day, index) => ({
        day_of_week: index,
        start_time: day.startTime || '09:00',
        end_time: day.endTime || '17:00',
        is_available: day.isWorking
      }));
      
      // Save availability to the database
      const success = await setWeeklyAvailability(profile.id, availabilityData);
      
      if (!success) throw new Error('Failed to save availability');
      
      alert('Availability saved successfully!');
    } catch (err) {
      console.error('Error saving availability:', err);
      setError('Failed to save availability. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, availability: false }));
    }
  };

  const handleAction = (booking: BookingDisplay, action: 'confirm' | 'cancel') => {
    setSelectedBooking(booking);
    setAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedBooking || !action || !profile) return;
    
    try {
      setLoading(prev => ({ ...prev, action: true }));
      setError(null);
      
      const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';
      
      // Update booking status in the database
      const success = await updateBookingStatus(selectedBooking.id, newStatus);
      
      if (!success) throw new Error(`Failed to ${action} booking`);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      
      setShowConfirmDialog(false);
      setSelectedBooking(null);
      setAction(null);
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
      setError(`Failed to ${action} booking. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'confirmed'].includes(booking.status);
      case 'past':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled' || booking.status === 'rejected';
      default:
        return true;
    }
  });

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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
            <p className="text-gray-600 mt-1">
              {profile?.name ? `${profile.name}'s` : 'Your'} bookings and availability
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Today's Bookings</div>
              <div className="text-2xl font-bold text-gray-900">
                {loading.stats ? (
                  <span className="inline-block h-6 w-6 animate-pulse bg-gray-200 rounded"></span>
                ) : (
                  stats.todayBookings
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Pending Approval</div>
              <div className="text-2xl font-bold text-pink-500">
                {loading.stats ? (
                  <span className="inline-block h-6 w-6 animate-pulse bg-gray-200 rounded"></span>
                ) : (
                  stats.pendingApproval
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Bookings */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'upcoming'
                      ? 'border-pink-500 text-pink-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upcoming Bookings
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'past'
                      ? 'border-pink-500 text-pink-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Past Bookings
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === 'cancelled'
                      ? 'border-pink-500 text-pink-500'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Bookings List */}
            <div className="p-6">
              <div className="space-y-4">
                {loading.bookings ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-pink-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {booking.clientName} • <span className="text-gray-500">{booking.clientPhone}</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(booking.date).toLocaleDateString()} • {booking.time}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{booking.price}</div>
                          <div className="text-sm text-gray-500">{booking.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                          {booking.location === 'incall' ? 'Client visits you' : 'You visit client'}
                          {booking.address && ` • ${booking.address}`}
                        </div>
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAction(booking, 'confirm')}
                                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleAction(booking, 'cancel')}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleAction(booking, 'cancel')}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-500">
                      {activeTab === 'upcoming'
                        ? 'You have no upcoming bookings'
                        : activeTab === 'past'
                        ? 'No past bookings found'
                        : 'No cancelled bookings'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Availability */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Working Hours</h2>
            <div className="space-y-6">
              {availability.map((day, index) => (
                <div key={day.day} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={day.isWorking}
                        onChange={(e) => handleAvailabilityChange(index, 'isWorking', e.target.checked)}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                      />
                      <span className="font-medium text-gray-900">{day.day}</span>
                    </label>
                    {day.isWorking && (
                      <div className="text-sm text-green-600 font-medium">Available</div>
                    )}
                  </div>
                  
                  {day.isWorking && (
                    <div className="flex items-center gap-2 pl-6">
                      <select
                        value={day.startTime}
                        onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
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
                        value={day.endTime}
                        onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
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
              <button
                className={`w-full ${loading.availability ? 'bg-pink-300' : 'bg-pink-500 hover:bg-pink-600'} text-white px-4 py-2 rounded-lg transition-colors mt-6`}
                onClick={saveAvailability}
                disabled={loading.availability}
              >
                {loading.availability ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                <CalendarDays className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Set as Available</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                <CalendarOff className="h-6 w-6 text-pink-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Set as Away</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {action === 'confirm' ? 'Confirm Booking' : 'Cancel Booking'}
            </h3>
            <p className="text-gray-600 mb-6">
              {action === 'confirm'
                ? 'Are you sure you want to confirm this booking?'
                : 'Are you sure you want to cancel this booking? This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                No, go back
              </button>
              <button
                onClick={confirmAction}
                disabled={loading.action}
                className={`px-4 py-2 text-white rounded-lg ${
                  loading.action
                    ? 'bg-gray-400'
                    : action === 'confirm'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {loading.action ? 'Processing...' : `Yes, ${action === 'confirm' ? 'confirm' : 'cancel'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}