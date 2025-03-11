import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Lock,
  Eye,
  Heart,
  MessageCircle,
  Coins
} from 'lucide-react';

interface Earning {
  id: string;
  type: 'unlock';
  fan: {
    name: string;
    imageUrl: string;
  };
  amount: number;
  description: string;
  hasComment?: boolean;
  date: string;
  time: string;
}

const earnings: Earning[] = [
  {
    id: '1',
    type: 'unlock',
    fan: {
      name: 'William T.',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
    },
    amount: 10,
    description: 'Unlocked your latest fan post',
    hasComment: true,
    date: '2024-01-12',
    time: '15:30'
  },
  {
    id: '4',
    type: 'unlock',
    fan: {
      name: 'David K.',
      imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=150&q=80'
    },
    amount: 10,
    description: 'Unlocked your fan post',
    hasComment: false,
    date: '2024-01-11',
    time: '14:15'
  }
];

// Group earnings by date
const groupEarningsByDate = (earnings: Earning[]) => {
  const groups: { [key: string]: Earning[] } = {};
  
  earnings.forEach(earning => {
    if (!groups[earning.date]) {
      groups[earning.date] = [];
    }
    groups[earning.date].push(earning);
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

const getEarningIcon = (type: Earning['type']) => {
  switch (type) {
    case 'unlock':
      return <Lock className="h-5 w-5" />
    default:
      return <DollarSign className="h-5 w-5" />;
  }
};

const getEarningColor = (type: Earning['type']) => {
  switch (type) {
    case 'unlock':
      return 'bg-purple-100 text-purple-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
};

export default function FanEarnings() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Calculate total earnings
  const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);

  const groupedEarnings = groupEarningsByDate(earnings);
  const dates = Object.keys(groupedEarnings).sort().reverse();

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
            <h1 className="text-2xl font-bold text-gray-900">Fan Posts Earnings</h1>
            <p className="text-gray-600 mt-1">
              Track your earnings from fan posts, unlocks, and tips
            </p>
            <p className="text-sm text-pink-500 mt-1">
              Total earned: {totalEarnings} DK Credits
            </p>
          </div>
          <div className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-full">
            <Coins className="h-5 w-5" />
            <span className="font-medium">{earnings.length} Transactions</span>
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

      {/* Earnings List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="divide-y divide-gray-200">
          {groupedEarnings[selectedDate]?.map((earning) => (
            <div key={earning.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${getEarningColor(earning.type)}`}>
                  {getEarningIcon(earning.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={earning.fan.imageUrl}
                        alt={earning.fan.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {earning.fan.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {earning.description}
                        </div>
                        {earning.hasComment && (
                          <div className="text-sm text-pink-500 mt-1">
                            <MessageCircle className="h-4 w-4 inline-block mr-1" />
                            Left a comment
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-sm">
                        <Coins className="h-4 w-4" />
                        <span>{earning.amount} DK</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {earning.time}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Earnings Message */}
        {(!groupedEarnings[selectedDate] || groupedEarnings[selectedDate].length === 0) && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No earnings on this date</h3>
            <p className="text-gray-500">Check other dates or create more fan posts to get unlocks</p>
          </div>
        )}
      </div>
    </div>
  );
}