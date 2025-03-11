import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarOff,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  duration: string;
  service: string;
  price: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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

const sampleBookings: Booking[] = [
  {
    id: '1',
    clientName: 'James M.',
    clientPhone: '06 12 345 678',
    date: '2024-01-15',
    time: '14:00',
    duration: '1 hour',
    service: 'Standard Service',
    price: '€130',
    status: 'pending',
    location: 'incall'
  },
  {
    id: '2',
    clientName: 'Michael P.',
    clientPhone: '06 98 765 432',
    date: '2024-01-15',
    time: '18:00',
    duration: '1 hour',
    service: 'Standard Service',
    price: '€130',
    status: 'confirmed',
    location: 'outcall',
    address: 'Hotel Amsterdam, Room 123'
  },
  {
    id: '3',
    clientName: 'William T.',
    clientPhone: '06 11 223 344',
    date: '2024-01-14',
    time: '20:00',
    duration: '2 hours',
    service: 'Premium Service',
    price: '€250',
    status: 'completed',
    location: 'incall'
  },
  {
    id: '4',
    clientName: 'Robert K.',
    clientPhone: '06 55 667 788',
    date: '2024-01-13',
    time: '15:00',
    duration: '1 hour',
    service: 'Standard Service',
    price: '€130',
    status: 'cancelled',
    location: 'incall',
    message: 'Client cancelled due to emergency'
  }
];

const defaultAvailability: Availability[] = [
  { day: 'Monday', isWorking: false },
  { day: 'Tuesday', isWorking: false },
  { day: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '22:00' },
  { day: 'Thursday', isWorking: true, startTime: '09:00', endTime: '22:00' },
  { day: 'Friday', isWorking: true, startTime: '09:00', endTime: '24:00' },
  { day: 'Saturday', isWorking: true, startTime: '09:00', endTime: '24:00' },
  { day: 'Sunday', isWorking: true, startTime: '09:00', endTime: '24:00' }
];

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
      return <AlertCircle className="h-5 w-5" />;
    case 'confirmed':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'completed':
      return <Check className="h-5 w-5" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5" />;
    default:
      return null;
  }
};

export default function ManageBookings() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<Availability[]>(defaultAvailability);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [action, setAction] = useState<'confirm' | 'cancel' | null>(null);

  const handleAvailabilityChange = (index: number, field: keyof Availability, value: any) => {
    const newAvailability = [...availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setAvailability(newAvailability);
  };

  const handleAction = (booking: Booking, action: 'confirm' | 'cancel') => {
    setSelectedBooking(booking);
    setAction(action);
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    // Handle the action here
    console.log('Confirming action:', action, 'for booking:', selectedBooking);
    setShowConfirmDialog(false);
    setSelectedBooking(null);
    setAction(null);
  };

  const filteredBookings = sampleBookings.filter(booking => {
    switch (activeTab) {
      case 'upcoming':
        return ['pending', 'confirmed'].includes(booking.status);
      case 'past':
        return booking.status === 'completed';
      case 'cancelled':
        return booking.status === 'cancelled';
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
              Manage your bookings and availability
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Today's Bookings</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Pending Approval</div>
              <div className="text-2xl font-bold text-pink-500">2</div>
            </div>
          </div>
        </div>
      </div>

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
                {filteredBookings.map((booking) => (
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
                ))}

                {filteredBookings.length === 0 && (
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
                className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors mt-6"
              >
                Save Changes
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
                className={`px-4 py-2 text-white rounded-lg ${
                  action === 'confirm'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Yes, {action === 'confirm' ? 'confirm' : 'cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}