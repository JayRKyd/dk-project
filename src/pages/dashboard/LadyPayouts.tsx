import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FinancialService } from '../../services/financialService';
import { useAuth } from '../../contexts/AuthContext';

export default function LadyPayouts() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{ credits_from_gifts: number; credits_from_fanposts: number; credits_payouts: number; credits_available: number; last_payout_at: string | null }>({
    credits_from_gifts: 0,
    credits_from_fanposts: 0,
    credits_payouts: 0,
    credits_available: 0,
    last_payout_at: null,
  });
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('manual');
  const [details, setDetails] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [payouts, setPayouts] = useState<any[]>([]);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const s = await FinancialService.getEarningsSummary(user.id);
    setSummary({
      credits_from_gifts: s.credits_from_gifts,
      credits_from_fanposts: s.credits_from_fanposts,
      credits_payouts: s.credits_payouts,
      credits_available: s.credits_available,
      last_payout_at: s.last_payout_at,
    });
    const list = await FinancialService.getPayoutsByUser(user.id, 1, 50);
    setPayouts(list.payouts);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const submit = async () => {
    if (!user?.id) return;
    if (amount <= 0 || amount > summary.credits_available) {
      alert('Invalid amount');
      return;
    }
    setSubmitting(true);
    const res = await FinancialService.requestPayout(user.id, amount, method, details ? { note: details } : {});
    setSubmitting(false);
    if (res.error) {
      alert(res.error.message);
    } else {
      alert('Payout requested');
      setAmount(0);
      setDetails('');
      load();
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard/lady" className="text-sm text-gray-600 hover:text-gray-900">← Back to Dashboard</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Payouts</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Credits from Gifts</div>
          <div className="text-2xl font-bold">{summary.credits_from_gifts}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Credits from Fan Posts</div>
          <div className="text-2xl font-bold">{summary.credits_from_fanposts}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Available Credits</div>
          <div className="text-2xl font-bold text-pink-600">{summary.credits_available}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Request Payout</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Amount (credits)</label>
            <input type="number" min={1} max={summary.credits_available} value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="manual">Manual</option>
              <option value="bank">Bank Transfer</option>
              <option value="stripe">Stripe Connect</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Details (optional)</label>
            <input value={details} onChange={e => setDetails(e.target.value)} placeholder="IBAN / PayPal email / notes" className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button disabled={submitting} onClick={submit} className="mt-4 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50">{submitting ? 'Submitting…' : 'Request Payout'}</button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Payout History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Amount (€)</th>
                <th className="py-2 pr-4">Credits</th>
                <th className="py-2 pr-4">Method</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 pr-4">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="py-2 pr-4">{Number(p.amount).toFixed(2)}</td>
                  <td className="py-2 pr-4">{p.credits_amount || 0}</td>
                  <td className="py-2 pr-4">{p.payout_method}</td>
                  <td className="py-2 pr-4 capitalize">{p.status}</td>
                </tr>
              ))}
              {payouts.length === 0 && (
                <tr><td className="py-4 text-gray-500" colSpan={5}>No payouts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

