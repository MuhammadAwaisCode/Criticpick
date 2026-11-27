'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  TrendingUp, 
  MousePointer, 
  ShoppingBag, 
  DollarSign, 
  Globe, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  BarChart3,
  Smartphone,
  Monitor,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Server Action Import
import { fetchAnalyticsData } from '@/actions/affiliateActions';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState(null);

  // Financial & Analytics State
  const [analytics, setAnalytics] = useState({
    stats: {
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalEarned: 0,
      clicksChange: '0%',
      conversionsChange: '0%',
      rateChange: '0%',
      earnedChange: '0%'
    },
    devices: { mobile: 0, desktop: 0, other: 0 },
    countries: [],
    sources: []
  });

  // Server Action se Data Fetch karne ka Function
  const loadAnalytics = async (range) => {
    setError(null);
    try {
      const data = await fetchAnalyticsData('CURRENT_USER_ID', range);
      
      if (data) {
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data from the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadAnalytics(timeRange);
  }, []);

  // Filter change par smooth transition se update
  const handleRangeChange = (newRange) => {
    setTimeRange(newRange);
    startTransition(async () => {
      await loadAnalytics(newRange);
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Analytics data load ho raha hai...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track link clicks, sales conversions, device sources, and earnings velocity.
          </p>
        </div>

        {/* TIME RANGE FILTER */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-2xl p-1.5 shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400 ml-2 mr-1" />
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
            { id: 'year', label: 'This Year' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => handleRangeChange(t.id)}
              disabled={isPending}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
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

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. KPI STATS CARDS (Safe checks applied) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Clicks Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Clicks</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <MousePointer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {analytics?.stats?.totalClicks?.toLocaleString() || '0'}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {analytics?.stats?.clicksChange || '0%'} <span className="text-slate-400 font-normal">vs prev period</span>
            </p>
          </div>
        </div>

        {/* Conversions Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversions</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {analytics?.stats?.totalConversions?.toLocaleString() || '0'}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {analytics?.stats?.conversionsChange || '0%'} <span className="text-slate-400 font-normal">total orders</span>
            </p>
          </div>
        </div>

        {/* Conversion Rate Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {(analytics?.stats?.conversionRate || 0).toFixed(2)}%
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">
              Avg click-to-sale ratio
            </p>
          </div>
        </div>

        {/* Total Earned Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Earned</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              ${(analytics?.stats?.totalEarned || 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> {analytics?.stats?.earnedChange || '0%'} <span className="text-slate-400 font-normal">approved revenue</span>
            </p>
          </div>
        </div>

      </div>

      {/* 2. DEVICE & GEOGRAPHIC BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Devices */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Device Distribution</h3>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-purple-600" /> Mobile</span>
                <span>{analytics?.devices?.mobile || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${analytics?.devices?.mobile || 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-purple-600" /> Desktop</span>
                <span>{analytics?.devices?.desktop || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full transition-all duration-300" style={{ width: `${analytics?.devices?.desktop || 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-purple-600" /> Other / Tablet</span>
                <span>{analytics?.devices?.other || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-200 h-2 rounded-full transition-all duration-300" style={{ width: `${analytics?.devices?.other || 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Performing Countries</h3>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          {!analytics?.countries || analytics?.countries?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No location data found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {analytics.countries.map((c, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-xl">{c.flag}</span>
                  <p className="text-xs font-bold text-slate-900 mt-1">{c.name}</p>
                  <p className="text-[10px] text-purple-600 font-black">{c.share} Sales</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 3. TRAFFIC SOURCES TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Traffic Source Breakdown</h3>
          <p className="text-xs text-slate-400">Detailed referral links performance and conversion rates</p>
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
              {!analytics?.sources || analytics?.sources?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    No traffic records found for this time range.
                  </td>
                </tr>
              ) : (
                analytics.sources.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{row.source}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono font-medium">{Number(row.clicks || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-5 text-slate-600 font-mono font-medium">{Number(row.sales || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-5 font-bold text-purple-700">{row.conversion}</td>
                    <td className="py-3.5 px-5 font-black text-emerald-600 text-right text-sm">${Number(row.revenue || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}