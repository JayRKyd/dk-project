import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, X, Check } from 'lucide-react';

interface Booking {
  id: string;
  lady: {
    name: string;
    imageUrl: string;
  };
  date: string;
  time: string;
  duration: string;
  service: string;
  price: string;
  location: 'incall' | 'outcall';
  address?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const bookings: Booking[] = [
  {
    id: '1',
    lady: {
      name: 'Alexandra',
      imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=150&q=80'
    },
    date: 'Tomorrow',
    time: '14:00',
    duration: '1 hour',
    service: 'Standard Service',
    price: '€130',
    location: 'incall',
    status: 'confirmed'
  },
  {
    id: '2',
    lady: {
      name: 'Melissa',
      imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=150&q=80'
    },
    date: 'Next Week',
    time: '18:00',
    duration: '2 hours',
    service: 'Premium Service',
    price: '€250',
    location: 'outcall',
    address: 'Hotel Amsterdam, Room 123',
    status: 'pending'
  },
  {
    id: '3',
    lady: {
      name: 'Jenny',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80'
    },
    date: 'Last Week',
    time: '20:00',
    duration: '1 hour',
    service: 'Standard Service',
    price: '€130',
    location: 'incall',
    status: 'completed'
  },
  {
    id: '4',
    lady: {
      name: 'Sophia',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    date: '2 days ago',
    time: '15:00',
    duration: '1 hour',
    service: 'Standard Service',
    price: '€130',
    location: 'incall',
    status: 'cancelled'
  }
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

export default function ClientBookings() {
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

      {/* Bookings List */}
      <div className="space-y-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              {/* Booking Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={booking.lady.imageUrl}
                    alt={booking.lady.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <Link
                      to={`/ladies/pro/${booking.lady.name.toLowerCase()}`}
                      className="font-medium text-gray-900 hover:text-pink-500"
                    >
                      {booking.lady.name}
                    </Link>
                    <div className="text-sm text-gray-500">
                      {booking.date} at {booking.time}
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
                    <div className="text-sm font-medium text-gray-900">{booking.duration}</div>
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
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Cancel Booking
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Contact Lady
                  </button>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="mt-6 flex gap-4">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Cancel Booking
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    Contact Lady
                  </button>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="mt-6 flex gap-4">
                  <Link
                    to={`/write-review/${booking.lady.name.toLowerCase()}`}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Write Review
                  </Link>
                  <Link
                    to={`/send-gift/${booking.lady.name}`}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Send Gift
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
          </div>
        )}
      </div>
    </div>
  );
}