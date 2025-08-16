import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { FinancialService } from '../../services/financialService';

const AdminPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const limit = 20;

  const load = async () => {
    const filters: any = {};
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    const res = await FinancialService.getAllPayouts(page, limit, filters);
    setPayouts(res.payouts);
    setTotal(res.total || 0);
  };

  useEffect(() => { load(); }, [page, status, startDate, endDate]);

  const refresh = async () => load();

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Payouts</h1>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select className="w-full border rounded p-2" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input type="date" className="w-full border rounded p-2" value={startDate} onChange={(e) => { setPage(1); setStartDate(e.target.value); }} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input type="date" className="w-full border rounded p-2" value={endDate} onChange={(e) => { setPage(1); setEndDate(e.target.value); }} />
            </div>
            <div className="flex items-end">
              <button className="px-4 py-2 bg-pink-500 text-white rounded" onClick={refresh}>Refresh</button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">User</th>
                    <th className="py-2 px-3">Amount (€)</th>
                    <th className="py-2 px-3">Credits</th>
                    <th className="py-2 px-3">Method</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-2 px-3">{new Date(p.created_at).toLocaleString()}</td>
                      <td className="py-2 px-3">{p.user_id?.slice(0,8)}…</td>
                      <td className="py-2 px-3">{Number(p.amount).toFixed(2)}</td>
                      <td className="py-2 px-3">{p.credits_amount || 0}</td>
                      <td className="py-2 px-3">{p.payout_method}</td>
                      <td className="py-2 px-3 capitalize">{p.status}</td>
                      <td className="py-2 px-3 text-right space-x-3">
                        <button className="text-blue-600" onClick={async () => { await FinancialService.approvePayout(p.id); load(); }}>Approve</button>
                        <button className="text-green-600" onClick={async () => { await FinancialService.markPayoutCompleted(p.id); load(); }}>Complete</button>
                        <button className="text-red-600" onClick={async () => { await FinancialService.markPayoutFailed(p.id, 'rejected'); load(); }}>Fail</button>
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr><td className="py-6 text-gray-500" colSpan={7}>No payouts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
              <div className="text-sm text-gray-600">Page {page} / {Math.max(1, Math.ceil(total / limit))}</div>
              <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminPayouts;

