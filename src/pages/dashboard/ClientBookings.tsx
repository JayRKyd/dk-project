import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clientDashboardService, Booking } from '../../services/clientDashboardService';

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Booking['status']) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5" />;
    case 'confirmed':
      return <Check className="h-5 w-5" />;
    case 'completed':
      return <Check className="h-5 w-5" />;
    case 'cancelled':
      return <X className="h-5 w-5" />;
    default:
      return null;
  }
};

const formatBookingDate = (dateStr: string): string => {
  const bookingDate = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < -7) return 'Last week';
  if (diffDays > 7) return 'Next week';
  
  return bookingDate.toLocaleDateString();
};

const formatTime = (timeStr: string): string => {
  // Remove seconds if present (e.g., "14:00:00" -> "14:00")
  return timeStr.substring(0, 5);
};

export default function ClientBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user?.id]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await clientDashboardService.getClientBookings(user!.id);
      setBookings(bookingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on active filter
  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  // Get counts for each status
  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const handleCancelBooking = async (bookingId: string, ladyName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel your booking with ${ladyName}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setCancelingBookingId(bookingId);
      await clientDashboardService.cancelBooking(bookingId);
      // Refresh bookings after canceling
      await fetchBookings();
    } catch (err) {
      console.error('Error canceling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelingBookingId(null);
    }
  };

  const handleContactLady = (ladyName: string, bookingId: string) => {
    // Placeholder for messaging functionality
    // TODO: Implement messaging system
    alert(`Messaging functionality coming soon! You can contact ${ladyName} regarding booking ${bookingId.substring(0, 8)}...`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard/client"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
        >
          <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/dashboard/client"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-1">
          View and manage your bookings
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Bookings', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
              { key: 'completed', label: 'Completed', count: statusCounts.completed },
              { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeFilter === tab.key
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } transition-colors`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeFilter === tab.key
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              {/* Booking Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={booking.lady.imageUrl || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'}
                    alt={booking.lady.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/ladies/pro/${booking.lady.id}`}
                      className="font-medium text-gray-900 hover:text-pink-500"
                    >
                      {booking.lady.name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {formatBookingDate(booking.date)} at {formatTime(booking.time)}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span>{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.service}</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {booking.location === 'incall' ? 'Visit Lady' : 'Lady Visits You'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.address || 'Address provided after confirmation'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{booking.service}</div>
                    <div className="text-sm text-gray-500">{booking.price}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {booking.status === 'pending' && (
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => handleCancelBooking(booking.id, booking.lady.name)}
                    disabled={cancelingBookingId === booking.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelingBookingId === booking.id ? 'Canceling...' : 'Cancel Booking'}
                  </button>
                  <button 
                    onClick={() => handleContactLady(booking.lady.name, booking.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Contact Lady
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => handleCancelBooking(booking.id, booking.lady.name)}
                    disabled={cancelingBookingId === booking.id}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelingBookingId === booking.id ? 'Canceling...' : 'Cancel Booking'}
                  </button>
                  <button 
                    onClick={() => handleContactLady(booking.lady.name, booking.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Contact Lady
                  </button>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="mt-6 flex gap-4">
                  <Link
                    to={`/write-review/${booking.lady.id}`}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Write Review
                  </Link>
                  <Link
                    to={`/send-gift/${booking.lady.id}`}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Send Gift
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {activeFilter === 'all' ? (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                <p className="text-gray-500">
                  You haven't made any bookings yet. Browse our ladies and make your first booking!
                </p>
                <Link
                  to="/"
                  className="mt-4 inline-block px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  Browse Ladies
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings
                </h3>
                <p className="text-gray-500">
                  You don't have any {activeFilter} bookings at the moment.
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 inline-block px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View All Bookings
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}