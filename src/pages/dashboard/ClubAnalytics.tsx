import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';

export default function ClubAnalytics() {
  const { clubProfile, viewAnalytics, revenueData } = useClubDashboard() as any;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/dashboard/club"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      <h1 className="text-2xl font-bold mb-6">Analytics for {clubProfile?.name || 'your club'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Views</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between"><span>Daily Views</span><span className="font-medium">{viewAnalytics?.daily_views ?? 0}</span></div>
            <div className="flex justify-between"><span>Monthly Views</span><span className="font-medium">{viewAnalytics?.monthly_views ?? 0}</span></div>
            <div className="flex justify-between"><span>Yearly Views</span><span className="font-medium">{viewAnalytics?.yearly_views ?? 0}</span></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Revenue</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between"><span>Total Revenue</span><span className="font-medium">€{revenueData?.total_revenue?.toFixed(2) ?? '0.00'}</span></div>
            <div className="flex justify-between"><span>Booking Revenue</span><span className="font-medium">€{revenueData?.booking_revenue?.toFixed(2) ?? '0.00'}</span></div>
            <div className="flex justify-between"><span>Commission Earnings</span><span className="font-medium">€{revenueData?.commission_earnings?.toFixed(2) ?? '0.00'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}


