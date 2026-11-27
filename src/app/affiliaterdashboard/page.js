'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Copy, 
  Check, 
  Clock, 
  Share2,
  Loader2 
} from 'lucide-react';
import { fetchAffiliateDashboardData } from '@/actions/affiliateActions';
import { RANK_TIERS, QUALIFICATION_HEADCOUNT } from '@/lib/mlmLogic';

export default function AffiliateDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic States from Supabase
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch Supabase Data on Load
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // NOTE: Pass actual logged-in affiliate ID here from your Auth session
      const res = await fetchAffiliateDashboardData('CURRENT_USER_ID'); 
      if (res) {
        setDashboardData(res);
      }
      setLoading(false);
    }
    loadData();
  }, [timeRange]);

  // Derived Values from MLM Logic & DB Data
  const profile = dashboardData?.profile || {};
  const currentRank = profile.rank || 'BASIC';
  const rankConfig = RANK_TIERS[currentRank] || RANK_TIERS.BASIC;

  // Direct Network Count & Targets
  const directReferralsCount = dashboardData?.directReferralsCount || 0;
  const currentMilestoneTarget = currentRank === 'BASIC' ? 100 : 500;
  
  // Dynamic Network Info
  const networkInfo = {
    referralCode: profile.referral_code || 'JOHN123',
    referralLink: dashboardData?.links?.[0]?.url || `https://yourwebsite.com/register?ref=${profile.referral_code || 'JOHN123'}`,
    linkExpiresAt: '2027-01-01',
    directReferralsCount: directReferralsCount,
    nextMilestoneTarget: currentMilestoneTarget,
    ownCommissionRate: `${(rankConfig.personalCommissionRate * 100).toFixed(0)}%`,
    referralCommissionRate: `${(rankConfig.tier2OverrideRate * 100).toFixed(0)}%`,
    unlockedMilestone1: currentRank === 'SILVER' || currentRank === 'GOLD' || currentRank === 'DIAMOND',
    unlockedMilestone2: currentRank === 'GOLD' || currentRank === 'DIAMOND'
  };

  // Dynamic Metrics
  const stats = dashboardData?.stats || {};
  const metrics = {
    totalEarnings: `$${(stats.totalEarned || 0).toFixed(2)}`,
    ownSalesEarnings: `$${(stats.ownSalesEarnings || 0).toFixed(2)}`,
    referralEarnings: `$${(stats.referralEarnings || 0).toFixed(2)}`,
    totalClicks: dashboardData?.totalClicks || 0,
    pendingBalance: `$${(stats.pendingBalance || 0).toFixed(2)}`,
    availableBalance: `$${(stats.approvedBalance || 0).toFixed(2)}`
  };

  // Recent Conversions Mapping from Database
  const recentConversions = (dashboardData?.commissions || []).slice(0, 5).map(c => ({
    id: c.orders?.order_number || `ORD-${c.id.toString().substring(0,4)}`,
    date: new Date(c.created_at).toISOString().split('T')[0],
    type: c.type === 'personal' ? 'Own Sale' : 'Referral',
    rate: `${((c.rate || 0.06) * 100).toFixed(0)}%`,
    product: c.orders?.product_name || 'Marketplace Item',
    orderValue: `$${Number(c.orders?.total_amount || 0).toFixed(2)}`,
    commission: `$${Number(c.amount || 0).toFixed(2)}`
  }));

  // Traffic Trend Chart Data
  const chartData = dashboardData?.chartData || [
    { day: 'Day 1', clicks: 0, sales: 0 },
    { day: 'Day 2', clicks: 0, sales: 0 },
    { day: 'Day 3', clicks: 0, sales: 0 },
    { day: 'Day 4', clicks: 0, sales: 0 },
    { day: 'Day 5', clicks: 0, sales: 0 },
    { day: 'Day 6', clicks: 0, sales: 0 },
    { day: 'Day 7', clicks: 0, sales: 0 },
  ];

  const maxClicks = Math.max(...chartData.map((d) => d.clicks), 1);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(networkInfo.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Affiliate Performance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Track your personal sales, sub-affiliate network, and milestone unlocks.</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === '7d' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeRange === '30d' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* 1. MILESTONE PROGRESS CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">Current Milestone Tier</h2>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Tier: {currentRank}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Invite direct referrals to unlock <span className="font-bold text-slate-700">1% Referral Commission</span> & increase own commission to <span className="font-bold text-slate-700">10-15%</span>.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500">Active Rate</p>
            <p className="text-lg font-black text-purple-600">{networkInfo.ownCommissionRate} <span className="text-xs font-normal text-slate-400">Own Sales</span></p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-700">Direct Referrals: {networkInfo.directReferralsCount} / {networkInfo.nextMilestoneTarget}</span>
            <span className="text-purple-600">
              {networkInfo.nextMilestoneTarget - networkInfo.directReferralsCount > 0 
                ? `Need ${networkInfo.nextMilestoneTarget - networkInfo.directReferralsCount} more to reach next tier`
                : 'Target Reached!'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div 
              className="bg-purple-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((networkInfo.directReferralsCount / networkInfo.nextMilestoneTarget) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Silver Rank (100 Referrals)</p>
              <p className="text-[11px] text-slate-500">Unlocks 1% override on direct personal team sales</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${networkInfo.unlockedMilestone1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {networkInfo.unlockedMilestone1 ? 'Unlocked' : 'Locked'}
            </span>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Gold Rank (5 Silver Directs)</p>
              <p className="text-[11px] text-slate-500">Upgrades own sales commission from 6% to 10%</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded ${networkInfo.unlockedMilestone2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
              {networkInfo.unlockedMilestone2 ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>
      </div>
{/* 2. REFERRAL LINK & ATTRIBUTION WINDOW */}
<div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      <Share2 className="w-4 h-4 text-purple-600" />
      <h3 className="text-sm font-bold text-slate-900">Your Master Referral Link</h3>
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> Valid for 365 Days
      </span>
    </div>
    <p className="text-xs text-slate-400">
      New affiliates must register before expiry ({networkInfo.linkExpiresAt}). Once joined, they are permanently in your network!
    </p>
  </div>

  <div className="flex items-center gap-2 w-full md:w-auto">
    <input 
      type="text" 
      readOnly 
      value={networkInfo.referralLink} 
      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 w-full md:w-80 font-mono focus:outline-none"
    />
    
    {/* Copy Button */}
    <button
      onClick={handleCopyLink}
      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>

    {/* Share Button (Native & Social Share Trigger) */}
    <button
      onClick={async () => {
        const shareData = {
          title: 'Join My Affiliate Network',
          text: 'Register using my referral link and start earning commissions!',
          url: networkInfo.referralLink,
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            console.log('Share canceled or failed', err);
          }
        } else {
          // Fallback for Desktop: Open WhatsApp Share directly
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareData.text + " " + shareData.url)}`;
          window.open(waUrl, '_blank');
        }
      }}
      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
    >
      <Share2 className="w-3.5 h-3.5" />
      Share
    </button>
  </div>
</div>

      {/* 3. METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Earnings</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.totalEarnings}</p>
          <div className="flex items-center justify-between text-[10px] font-bold mt-2">
            <span className="text-slate-500">Own: {metrics.ownSalesEarnings}</span>
            <span className="text-purple-600">Network: {metrics.referralEarnings}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Clicks</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics.totalClicks.toLocaleString()}</p>
          <span className="inline-block text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded mt-2">Organic & Referral</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Network</p>
          <p className="text-2xl font-black text-slate-900 mt-2">{networkInfo.directReferralsCount} <span className="text-xs font-normal text-slate-400">Affiliates</span></p>
          <span className="inline-block text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded mt-2">Active Team Members</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Clearance</p>
          <p className="text-2xl font-black text-amber-600 mt-2">{metrics.pendingBalance}</p>
          <span className="inline-block text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded mt-2">Escrow clearance in 14d</span>
        </div>
      </div>

      {/* 4. PERFORMANCE CHART */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Traffic & Sales Trend</h3>
            <p className="text-xs text-slate-400">Daily clickstream volume and converted order count ({timeRange})</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> Clicks</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Sales</span>
          </div>
        </div>

        <div className="h-48 flex items-end justify-between gap-2 pt-8 px-2 border-b border-slate-100">
          {chartData.map((d, idx) => {
            const clickHeight = Math.round((d.clicks / maxClicks) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex justify-center items-end gap-1 h-full">
                  <div 
                    style={{ height: `${clickHeight}%` }} 
                    className="w-full max-w-[20px] bg-purple-200 group-hover:bg-purple-500 rounded-t transition-all relative"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-0.5 px-1.5 rounded transition-all whitespace-nowrap z-10">
                      {d.clicks} Clicks
                    </span>
                  </div>
                  <div 
                    style={{ height: `${clickHeight * 0.4}%` }} 
                    className="w-full max-w-[12px] bg-emerald-400 rounded-t transition-all"
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-400">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. RECENT CONVERSIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Conversions & Network Ledger</h3>
            <p className="text-xs text-slate-400">Orders placed through your direct links and sub-affiliate network</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 text-slate-400 font-bold border-b border-slate-100">
                <th className="py-3 px-5">Date</th>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Commission Source</th>
                <th className="py-3 px-5">Product Name</th>
                <th className="py-3 px-5">Order Total</th>
                <th className="py-3 px-5 text-right">Commission Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentConversions.length > 0 ? (
                recentConversions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-500">{item.date}</td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">{item.id}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.type.includes('Own') 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {item.type} ({item.rate})
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800">{item.product}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">{item.orderValue}</td>
                    <td className="py-3.5 px-5 font-black text-emerald-600 text-right">{item.commission}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400 text-xs">
                    No recent conversions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}