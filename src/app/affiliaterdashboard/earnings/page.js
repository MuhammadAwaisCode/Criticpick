'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  PieChart, 
  Sparkles,
  Download
} from 'lucide-react';

export default function FinancialEarningsPage() {
  const [timeRange, setTimeRange] = useState('30days');

  // Mock Earnings Data Breakdown
  const earningsSummary = {
    totalRevenue: '$3,420.50',
    availableBalance: '$1,240.00',
    pendingBalance: '$310.50',
    lifetimePayouts: '$1,870.00',
    growthPercentage: '+18.4%'
  };

  const revenueSources = [
    { name: 'Direct Product Sales', amount: '$2,850.00', percentage: '83.3%', color: 'bg-purple-600' },
    { name: 'Tier-1 Network Bonus (1%)', amount: '$420.50', percentage: '12.3%', color: 'bg-indigo-500' },
    { name: 'Tier-2 Network Bonus (0.5%)', amount: '$150.00', percentage: '4.4%', color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Earnings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor your net income, pending payout clearance, and multi-tier revenue distribution.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-xs self-start sm:self-auto">
          {['7days', '30days', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                timeRange === range 
                  ? 'bg-purple-600 text-white' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {range === '7days' ? 'Last 7 Days' : range === '30days' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* BALANCE & STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Available Balance (Main Card) */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Available for Payout</p>
              <h2 className="text-3xl font-black mt-1 text-white">{earningsSummary.availableBalance}</h2>
            </div>
            <div className="p-2.5 bg-purple-700/50 border border-purple-500/30 rounded-xl">
              <Wallet className="w-5 h-5 text-purple-200" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-700/50 flex justify-between items-center z-10">
            <span className="text-[11px] text-purple-200">Ready to transfer</span>
            <button className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer">
              Request Payout <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pending Balance Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Balance</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">{earningsSummary.pendingBalance}</h2>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            Holding window in progress for refund checks (approx 14 days).
          </p>
        </div>

        {/* Lifetime Withdrawn */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Payouts</p>
              <h2 className="text-3xl font-black text-emerald-600 mt-1">{earningsSummary.lifetimePayouts}</h2>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{earningsSummary.growthPercentage} compared to last period</span>
          </div>
        </div>

      </div>

      {/* BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Revenue Sources */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue Stream Breakdown</h2>
              <p className="text-[11px] text-slate-500">How your total income is distributed across channels</p>
            </div>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <PieChart className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {revenueSources.map((source, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{source.name}</span>
                  <div className="text-right">
                    <span className="font-black text-slate-900">{source.amount}</span>
                    <span className="text-slate-400 ml-1.5 text-[11px]">({source.percentage})</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${source.color}`} style={{ width: source.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Help / Note Card */}
        <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
              <Sparkles className="w-4 h-4" /> Payout Schedule Note
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Payouts are processed weekly every Monday for cleared balances above minimum threshold ($50.00).
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-purple-200/60 space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400">Next Scheduled Cycle</p>
            <p className="text-xs font-bold text-slate-900">Upcoming Monday (10:00 AM UTC)</p>
          </div>
        </div>

      </div>

    </div>
  );
}