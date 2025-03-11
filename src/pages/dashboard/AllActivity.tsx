import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Gift,
  Star,
  DollarSign,
  Lock,
  Settings,
  Shield,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Group activities by date
const groupActivitiesByDate = (activities: Activity[]) => {
  const groups: { [key: string]: Activity[] } = {};
  
  activities.forEach(activity => {
    const date = new Date();
    if (activity.time.includes('minute')) {
      date.setMinutes(date.getMinutes() - parseInt(activity.time));
    } else if (activity.time.includes('hour')) {
      date.setHours(date.getHours() - parseInt(activity.time));
    } else if (activity.time.includes('day')) {
      date.setDate(date.getDate() - parseInt(activity.time));
    }
    
    const dateKey = date.toISOString().split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
  });
  
  return groups;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
interface Activity {
  id: string;
  type: 'view' | 'love' | 'message' | 'gift' | 'review' | 'credits' | 'password' | 'settings' | 'booking' | 'membership';
  user?: string;
  description: string;
  time: string;
  amount?: string;
  status?: 'completed' | 'pending' | 'cancelled';
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'booking',
    user: 'James M.',
    description: 'New booking request',
    time: '2 minutes ago',
    status: 'pending'
  },
  {
    id: '2',
    type: 'credits',
    description: 'Purchased 100 DK Credits',
    amount: '€50',
    time: '5 minutes ago',
    status: 'completed'
  },
  {
    id: '3',
    type: 'gift',
    user: 'William T.',
    description: 'Sent you a Diamond gift',
    time: '15 minutes ago'
  },
  {
    id: '4',
    type: 'view',
    user: 'John D.',
    description: 'Viewed your profile',
    time: '30 minutes ago'
  },
  {
    id: '5',
    type: 'love',
    user: 'Mike R.',
    description: 'Loved your profile',
    time: '1 hour ago'
  },
  {
    id: '6',
    type: 'message',
    user: 'David S.',
    description: 'Sent you a message',
    time: '2 hours ago'
  },
  {
    id: '7',
    type: 'review',
    user: 'Robert K.',
    description: 'Left a review',
    time: '3 hours ago'
  },
  {
    id: '8',
    type: 'password',
    description: 'Changed account password',
    time: '5 hours ago'
  },
  {
    id: '9',
    type: 'settings',
    description: 'Updated profile settings',
    time: '6 hours ago'
  },
  {
    id: '10',
    type: 'membership',
    description: 'Upgraded to PRO membership',
    time: '1 day ago',
    status: 'completed'
  }
];

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'view':
      return <Eye className="h-5 w-5" />;
    case 'love':
      return <Heart className="h-5 w-5" />;
    case 'message':
      return <MessageCircle className="h-5 w-5" />;
    case 'gift':
      return <Gift className="h-5 w-5" />;
    case 'review':
      return <Star className="h-5 w-5" />;
    case 'credits':
      return <DollarSign className="h-5 w-5" />;
    case 'password':
      return <Lock className="h-5 w-5" />;
    case 'settings':
      return <Settings className="h-5 w-5" />;
    case 'booking':
      return <Calendar className="h-5 w-5" />;
    case 'membership':
      return <Shield className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'view':
      return 'bg-blue-100 text-blue-500';
    case 'love':
      return 'bg-pink-100 text-pink-500';
    case 'message':
      return 'bg-indigo-100 text-indigo-500';
    case 'gift':
      return 'bg-purple-100 text-purple-500';
    case 'review':
      return 'bg-yellow-100 text-yellow-500';
    case 'credits':
      return 'bg-green-100 text-green-500';
    case 'password':
      return 'bg-red-100 text-red-500';
    case 'settings':
      return 'bg-gray-100 text-gray-500';
    case 'booking':
      return 'bg-orange-100 text-orange-500';
    case 'membership':
      return 'bg-pink-100 text-pink-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

const getStatusColor = (status: Activity['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
};

export default function AllActivity() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const groupedActivities = groupActivitiesByDate(activities);
  const dates = Object.keys(groupedActivities).sort().reverse();

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = dates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    }
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

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity History</h1>
            <p className="text-gray-600 mt-1">
              View all activities and interactions on your profile
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={dates.indexOf(selectedDate) === dates.length - 1}
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-pink-500" />
            <span className="text-lg font-medium text-gray-900">
              {formatDate(selectedDate)}
            </span>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={dates.indexOf(selectedDate) === 0}
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Date Quick Select */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                date === selectedDate
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {formatDate(date)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="divide-y divide-gray-200">
          {groupedActivities[selectedDate]?.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {activity.user && <span>{activity.user} </span>}
                        {activity.description}
                      </div>
                      <div className="text-sm text-gray-500">{activity.time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {activity.amount && (
                        <span className="text-gray-900 font-medium">{activity.amount}</span>
                      )}
                      {activity.status && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No Activities Message */}
      {(!groupedActivities[selectedDate] || groupedActivities[selectedDate].length === 0) && (
        <div className="text-center py-12 text-gray-500">
          No activities found for this date
      </div>
      )}
    </div>
  );
}