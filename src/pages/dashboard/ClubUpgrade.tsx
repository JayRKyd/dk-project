import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';

export default function ClubUpgrade() {
  const { clubProfile } = useClubDashboard() as any;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/dashboard/club" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group">
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Membership</h1>
        <p className="text-gray-600 mb-6">Current tier: {clubProfile?.membership_tier || 'FREE'}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['PRO', 'PRO-PLUS', 'ULTRA'].map(tier => (
            <div key={tier} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div className="font-semibold">{tier}</div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Priority placement and enhanced features.</p>
              <button className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">Contact Support to Upgrade</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

