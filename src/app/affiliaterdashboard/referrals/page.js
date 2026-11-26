'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Copy,
  Check,
  Loader2
} from 'lucide-react';
import { fetchDirectReferrals } from '@/actions/affiliateActions';

export default function DirectReferralsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic user ID handled inside Server Action
  const affiliateId = 'CURRENT_USER_ID';

  // Referral Master Link
  const masterReferralLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${affiliateId}`
    : `https://yourwebsite.com/register?ref=${affiliateId}`;

  // Fetch Live Direct Referrals from Supabase
  useEffect(() => {
    async function loadReferrals() {
      setLoading(true);
      const data = await fetchDirectReferrals(affiliateId);

      // Transform DB records into component structure
      const formatted = data.map((item) => {
        const initials = item.full_name
          ? item.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : 'AF';

        const totalSales = Number(item.total_sales || 0);
        const commissionBonus = (totalSales * 0.01).toFixed(2); // 1% Override Bonus

        return {
          id: item.id,
          name: item.full_name || 'Affiliate Partner',
          email: item.email || 'N/A',
          joinedDate: new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          status: item.verification_status === 'verified' || item.rank ? 'Active' : 'Inactive',
          totalSalesGenerated: `$${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          yourCommission: `$${commissionBonus}`,
          avatar: initials
        };
      });

      setReferrals(formatted);
      setLoading(false);
    }

    loadReferrals();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(masterReferralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredReferrals = referrals.filter(ref => {
    const matchesSearch = ref.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ref.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || ref.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate dynamic metrics
  const activePartnersCount = referrals.filter(r => r.status === 'Active').length;
  const totalTierCommissions = referrals.reduce((acc, curr) => {
    const num = parseFloat(curr.yourCommission.replace('$', '')) || 0;
    return acc + num;
  }, 0).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Direct Referrals</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track affiliates who joined directly via your master link and monitor your <span className="font-bold text-purple-600">1% Network Tier Commission</span>.
          </p>
        </div>
      </div>

      {/* QUICK INVITE BANNER */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-700/60 text-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
              Grow Your Tier Network
            </span>
          </div>
          <h2 className="text-base font-bold">Invite Affiliates & Earn 1% Override</h2>
          <p className="text-xs text-purple-200/80">
            Share your unique invite link. Every sale your direct referrals make earns you an additional 1% bonus.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto bg-purple-950/60 border border-purple-700/40 p-1.5 rounded-xl">
          <input 
            type="text" 
            readOnly 
            value={masterReferralLink} 
            className="bg-transparent text-xs text-purple-200 font-mono px-3 py-1.5 w-full md:w-64 focus:outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* METRICS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Directs</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{referrals.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Partners</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {activePartnersCount}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tier Commissions</p>
            <p className="text-2xl font-black text-purple-600 mt-0.5">${totalTierCommissions}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* TABLE CONTROLS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Active', 'Inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
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

      {/* REFERRALS TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Affiliate</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Team Sales</th>
                <th className="py-3.5 px-4 text-right">Your 1% Bonus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredReferrals.length > 0 ? (
                filteredReferrals.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                          {item.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[11px] text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.joinedDate}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {item.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>

                    {/* Generated Sales */}
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {item.totalSalesGenerated}
                    </td>

                    {/* Commission */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                      {item.yourCommission}
                    </td>

                  </tr>
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {!loading && filteredReferrals.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            No direct referrals found matching your search.
          </div>
        )}
      </div>

    </div>
  );
}