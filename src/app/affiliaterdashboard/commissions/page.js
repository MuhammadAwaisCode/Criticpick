'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2
} from 'lucide-react';
import { fetchCommissionsLog } from '@/actions/affiliateActions';

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic user ID handled inside Server Action
  const affiliateId = 'CURRENT_USER_ID';

  useEffect(() => {
    async function loadCommissions() {
      setLoading(true);
      const data = await fetchCommissionsLog(affiliateId);

      const formatted = data.map((item) => {
        const saleAmt = Number(item.sale_amount || 0);
        const commAmt = Number(item.amount || 0);

        return {
          id: item.id ? `COMM-${item.id.slice(0, 4).toUpperCase()}` : 'COMM-0000',
          productName: item.products?.title || item.product_name || 'Commissionable Item',
          orderId: item.order_id ? `ORD-${item.order_id.slice(0, 4).toUpperCase()}` : 'ORD-N/A',
          date: new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          saleAmount: `$${saleAmt.toFixed(2)}`,
          rate: item.type === 'override' ? '1% Tier Bonus' : `${item.rate || 10}%`,
          commission: `$${commAmt.toFixed(2)}`,
          numericCommission: commAmt,
          type: item.type === 'override' ? `Sub-Affiliate (${item.source_user || 'Team'})` : 'Direct Sale',
          status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Pending'
        };
      });

      setCommissions(formatted);
      setLoading(false);
    }

    loadCommissions();
  }, []);

  const filteredCommissions = commissions.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Aggregates
  const totalEarned = commissions.reduce((acc, curr) => acc + curr.numericCommission, 0).toFixed(2);
  const clearedReady = commissions
    .filter(c => c.status === 'Cleared')
    .reduce((acc, curr) => acc + curr.numericCommission, 0).toFixed(2);
  const approvedHolding = commissions
    .filter(c => c.status === 'Approved')
    .reduce((acc, curr) => acc + curr.numericCommission, 0).toFixed(2);
  const pendingAudit = commissions
    .filter(c => c.status === 'Pending')
    .reduce((acc, curr) => acc + curr.numericCommission, 0).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Commissions Log</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed itemized record of all your direct sales commissions and sub-affiliate override bonuses.
        </p>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Earned</p>
          <p className="text-xl font-black text-slate-900 mt-1">${totalEarned}</p>
          <span className="text-[10px] text-purple-600 font-bold mt-1 inline-block">All Time Yield</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cleared & Ready</p>
          <p className="text-xl font-black text-emerald-600 mt-1">${clearedReady}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Available for Payout</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved (Holding)</p>
          <p className="text-xl font-black text-purple-600 mt-1">${approvedHolding}</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Matures in 14 days</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Audit</p>
          <p className="text-xl font-black text-amber-500 mt-1">${pendingAudit}</p>
          <span className="text-[10px] text-amber-600 font-medium mt-1 inline-block">Awaiting Clearance</span>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search order ID, product, or comm ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Cleared', 'Approved', 'Pending', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

      </div>

      {/* COMMISSIONS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Comm. ID & Date</th>
                <th className="py-3.5 px-4">Item & Order</th>
                <th className="py-3.5 px-4">Source Type</th>
                <th className="py-3.5 px-4 text-right">Sale Total</th>
                <th className="py-3.5 px-4 text-right">Rate</th>
                <th className="py-3.5 px-4 text-right">Commission</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredCommissions.length > 0 ? (
                filteredCommissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{item.id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.date}</p>
                    </td>

                    {/* Product & Order */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                      <span className="text-[10px] text-purple-600 font-mono font-semibold">{item.orderId}</span>
                    </td>

                    {/* Source Type */}
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {item.type}
                      </span>
                    </td>

                    {/* Sale Total */}
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {item.saleAmount}
                    </td>

                    {/* Rate */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {item.rate}
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                      {item.commission}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        item.status === 'Cleared'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Approved'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.status === 'Cleared' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'Pending' && <Clock className="w-3 h-3" />}
                        {item.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>

                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {!loading && filteredCommissions.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No commission records found.
          </div>
        )}
      </div>

    </div>
  );
}