import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, CreditCard } from 'lucide-react';
import { useClubDashboard } from '../../hooks/useClubDashboard';
import { getAdvertisementStatus, bumpAdvertisement, AdvertisementStatus } from '../../services/advertisementService';
import { CreditService } from '../../services/creditService';

export default function ClubBump() {
  const { clubProfile } = useClubDashboard() as any;
  const [status, setStatus] = useState<AdvertisementStatus | undefined>();
  const [remainingBumps, setRemainingBumps] = useState<number>(0);
  const [lastBumpText, setLastBumpText] = useState<string>('Never');
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  const formatRelativeTime = (iso?: string | null): string => {
    if (!iso) return 'Never';
    const now = Date.now();
    const ts = new Date(iso).getTime();
    if (isNaN(ts)) return 'Never';
    const diffMs = Math.max(0, now - ts);
    const minutes = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  useEffect(() => {
    const load = async () => {
      if (!clubProfile?.id) return;
      const s = await getAdvertisementStatus(clubProfile.id);
      setStatus(s);
      setRemainingBumps(s?.remaining_free_bumps ?? 0);
      setLastBumpText(formatRelativeTime(s?.last_bumped_at));
      try {
        const credits = await CreditService.getUserCredits(clubProfile.user_id);
        setAvailableCredits(credits.balance);
      } catch (_) {
        setAvailableCredits(0);
      }
    };
    load();
  }, [clubProfile?.id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/dashboard/club" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group">
        <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Bump Advertisement</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-pink-50">
            <div className="text-sm text-gray-600">Free bumps remaining</div>
            <div className="text-2xl font-bold text-pink-600">{remainingBumps}</div>
          </div>
          <div className="p-4 rounded-lg bg-pink-50">
            <div className="text-sm text-gray-600">Last bumped</div>
            <div className="text-2xl font-bold text-pink-600">{lastBumpText}</div>
          </div>
          <div className="p-4 rounded-lg bg-blue-50">
            <div className="text-sm text-gray-600 flex items-center gap-2"><CreditCard className="h-4 w-4" />Credits</div>
            <div className="text-2xl font-bold text-blue-600">{availableCredits}</div>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!clubProfile?.id) return;
            setProcessing(true);
            setMessage('');
            try {
              const useCredit = (status?.remaining_free_bumps || 0) <= 0;
              const creditsNeeded = 10;
              if (useCredit && availableCredits < creditsNeeded) {
                setMessage('Not enough credits. Please top up first.');
                setProcessing(false);
                return;
              }
              const result = await bumpAdvertisement(clubProfile.id, useCredit ? 'credit' : 'free', useCredit ? creditsNeeded : 0);
              setMessage(result.message);
              const s = await getAdvertisementStatus(clubProfile.id);
              setStatus(s);
              setRemainingBumps(s?.remaining_free_bumps ?? 0);
              setLastBumpText(formatRelativeTime(s?.last_bumped_at));
              if (useCredit) {
                const credits = await CreditService.getUserCredits(clubProfile.user_id);
                setAvailableCredits(credits.balance);
              }
            } catch (e: any) {
              setMessage(e?.message || 'Failed to bump');
            } finally {
              setProcessing(false);
            }
          }}
          className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
          disabled={processing}
        >
          <ArrowUp className="h-5 w-5" />
          <span>Bump your Advertisement Now</span>
        </button>

        {message && (
          <div className="mt-4 text-sm text-gray-700">{message}</div>
        )}
      </div>
    </div>
  );
}

