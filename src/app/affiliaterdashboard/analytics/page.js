'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  MousePointer, 
  ShoppingBag, 
  DollarSign, 
  Globe, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar,
  BarChart3,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Key Performance Indicators (KPIs)
  const stats = [
    {
      label: 'Total Clicks',
      value: '14,820',
      change: '+18.4%',
      isPositive: true,
      icon: MousePointer,
      subText: 'vs. previous period',
    },
    {
      label: 'Conversions',
      value: '482',
      change: '+12.1%',
      isPositive: true,
      icon: ShoppingBag,
      subText: 'Total paid orders',
    },
    {
      label: 'Conversion Rate',
      value: '3.25%',
      change: '-0.4%',
      isPositive: false,
      icon: TrendingUp,
      subText: 'Avg click-to-sale ratio',
    },
    {
      label: 'Total Earned',
      value: '$3,840.50',
      change: '+24.8%',
      isPositive: true,
      icon: DollarSign,
      subText: 'Approved commissions',
    },
  ];

  // Traffic Source Breakdown
  const trafficSources = [
    { source: 'YouTube (Video Descriptions)', clicks: '6,420', sales: 215, conversion: '3.35%', revenue: '$1,720.00' },
    { source: 'Blog / Review Website', clicks: '4,100', sales: 140, conversion: '3.41%', revenue: '$1,120.00' },
    { source: 'Twitter / X Bio Link', clicks: '2,300', sales: 72, conversion: '3.13%', revenue: '$576.00' },
    { source: 'Instagram Stories (Swipe up)', clicks: '1,200', sales: 38, conversion: '3.16%', revenue: '$304.50' },
    { source: 'Direct / Email Newsletter', clicks: '800', sales: 17, conversion: '2.12%', revenue: '$120.00' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track deep-link clicks, conversion behavior, traffic origins, and revenue velocity.
          </p>
        </div>

        {/* TIME FILTER */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: 'year', label: 'This Year' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeRange(t.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                timeRange === t.id 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. KPI STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-2xl font-black text-slate-900">{item.value}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    item.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {item.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {item.change}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.subText}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DEVICE & GEOGRAPHIC OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Device Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Device Distribution</h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile</span>
                <span>64%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-purple-600" /> Desktop</span>
                <span>31%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '31%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-purple-600" /> Tablets & Other</span>
                <span>5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-200 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Demographics */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Performing Countries</h3>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-xl">🇺🇸</span>
              <p className="text-xs font-bold text-slate-900 mt-1">United States</p>
              <p className="text-[10px] text-purple-600 font-black">42% Sales</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-xl">🇬🇧</span>
              <p className="text-xs font-bold text-slate-900 mt-1">United Kingdom</p>
              <p className="text-[10px] text-purple-600 font-black">22% Sales</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-xl">🇨🇦</span>
              <p className="text-xs font-bold text-slate-900 mt-1">Canada</p>
              <p className="text-[10px] text-purple-600 font-black">16% Sales</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
              <span className="text-xl">🇩🇪</span>
              <p className="text-xs font-bold text-slate-900 mt-1">Germany</p>
              <p className="text-[10px] text-purple-600 font-black">12% Sales</p>
            </div>
          </div>
        </div>

      </div>

      {/* 3. TRAFFIC SOURCES & CAMPAIGN BREAKDOWN TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Traffic Source Performance</h3>
            <p className="text-xs text-slate-400">Detailed breakdown of referral channels and conversion yields</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3.5 px-5">Source / Channel</th>
                <th className="py-3.5 px-5">Clicks</th>
                <th className="py-3.5 px-5">Conversions</th>
                <th className="py-3.5 px-5">Conv. Rate</th>
                <th className="py-3.5 px-5 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trafficSources.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">{row.source}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono font-medium">{row.clicks}</td>
                  <td className="py-3.5 px-5 text-slate-600 font-mono font-medium">{row.sales}</td>
                  <td className="py-3.5 px-5 font-bold text-purple-700">{row.conversion}</td>
                  <td className="py-3.5 px-5 font-black text-emerald-600 text-right text-sm">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}