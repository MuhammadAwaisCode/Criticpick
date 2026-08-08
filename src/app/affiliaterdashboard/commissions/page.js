'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  DollarSign, 
  ShoppingBag,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock Commissions Data
  const commissionsData = [
    {
      id: 'COMM-8901',
      productName: 'Wireless Noise-Canceling Headphones',
      orderId: 'ORD-9921',
      date: 'Aug 01, 2026',
      saleAmount: '$199.00',
      rate: '10%',
      commission: '$19.90',
      type: 'Direct Sale',
      status: 'Approved',
    },
    {
      id: 'COMM-8902',
      productName: 'Ergonomic Leather Chair',
      orderId: 'ORD-9884',
      date: 'Jul 30, 2026',
      saleAmount: '$350.00',
      rate: '12%',
      commission: '$42.00',
      type: 'Direct Sale',
      status: 'Cleared',
    },
    {
      id: 'COMM-8903',
      productName: 'Ultra-Wide Monitor 34"',
      orderId: 'ORD-9810',
      date: 'Jul 28, 2026',
      saleAmount: '$520.00',
      rate: '1% Tier Bonus',
      commission: '$5.20',
      type: 'Sub-Affiliate (Sarah)',
      status: 'Cleared',
    },
    {
      id: 'COMM-8904',
      productName: 'Mechanical Gaming Keyboard',
      orderId: 'ORD-9750',
      date: 'Jul 25, 2026',
      saleAmount: '$89.00',
      rate: '8%',
      commission: '$7.12',
      type: 'Direct Sale',
      status: 'Pending',
    },
    {
      id: 'COMM-8905',
      productName: 'Stainless Steel Water Bottle (1L)',
      orderId: 'ORD-9630',
      date: 'Jul 20, 2026',
      saleAmount: '$25.00',
      rate: '15%',
      commission: '$3.75',
      type: 'Direct Sale',
      status: 'Rejected',
    },
  ];

  const filteredCommissions = commissionsData.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <p className="text-xl font-black text-slate-900 mt-1">$78.02</p>
          <span className="text-[10px] text-purple-600 font-bold mt-1 inline-block">All Time Yield</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cleared & Ready</p>
          <p className="text-xl font-black text-emerald-600 mt-1">$47.20</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Available for Payout</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved (Holding)</p>
          <p className="text-xl font-black text-purple-600 mt-1">$19.90</p>
          <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">Matures in 14 days</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Audit</p>
          <p className="text-xl font-black text-amber-500 mt-1">$7.12</p>
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
              {filteredCommissions.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>

        {filteredCommissions.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No commission records found.
          </div>
        )}
      </div>

    </div>
  );
}