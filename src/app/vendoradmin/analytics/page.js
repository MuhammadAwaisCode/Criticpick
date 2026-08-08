'use client';

import React from 'react';
import { TrendingUp, Users, ShoppingBag, Eye, ArrowUp, ArrowDown } from 'lucide-react';

export default function AnalyticsPage() {
  const kpis = [
    { title: 'Total Revenue', value: '$4,285', change: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Store Visitors', value: '18,492', change: '+5.2%', isUp: true, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Orders', value: '342', change: '-2.1%', isUp: false, icon: ShoppingBag, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Conversion Rate', value: '1.85%', change: '+0.4%', isUp: true, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-50' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Monitor your traffic, sales metrics, and growth.</p>
        </div>
        <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <span className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${kpi.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {kpi.isUp ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                {kpi.change}
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.title}</h3>
            <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts / Data Area Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
          <TrendingUp className="w-12 h-12 text-slate-200 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Sales Overview Graph</h3>
          <p className="text-xs text-slate-400 mt-1">Connect a charting library (like Recharts) here for dynamic graphs.</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Top Performing Products</h3>
          <div className="space-y-4">
            {['Rose Glow Facial Serum', 'Vitamin C Day Cream', 'Hydrating Toner'].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-slate-700">{item}</p>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}