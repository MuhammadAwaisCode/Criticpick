'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { 
  fetchAffiliateDashboardData, 
  fetchPayoutHistory, 
  fetchCommissionsLog, 
  requestPayout 
} from '@/actions/affiliateActions';

export default function FinancialEarningsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Dynamic Data States
  const [rawCommissions, setRawCommissions] = useState([]);
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    pendingBalance: 0,
    approvedBalance: 0,
    totalEarned: 0
  });

  // Payout Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [payoutStatus, setPayoutStatus] = useState({ loading: false, success: false, error: '' });

  // Initial Data Fetch
  const loadData = async () => {
    setLoading(true);
    try {
      const [dashData, commsLog, payoutsLog] = await Promise.all([
        fetchAffiliateDashboardData('CURRENT_USER_ID'),
        fetchCommissionsLog('CURRENT_USER_ID'),
        fetchPayoutHistory('CURRENT_USER_ID')
      ]);

      if (dashData?.stats) {
        setDashboardStats(dashData.stats);
      }
      setRawCommissions(commsLog || []);
      setPayoutHistory(payoutsLog || []);
    } catch (err) {
      console.error('Error loading earnings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter commissions by time range
  const getFilteredCommissions = () => {
    if (timeRange === 'all') return rawCommissions;

    const days = timeRange === '7days' ? 7 : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return rawCommissions.filter(c => new Date(c.created_at) >= cutoffDate);
  };

  const filteredCommissions = getFilteredCommissions();

  // Calculate Breakdown Metrics dynamically
  const directSalesTotal = filteredCommissions
    .filter(c => c.type === 'DIRECT' || !c.type)
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const tier1Total = filteredCommissions
    .filter(c => c.type === 'TIER_1' || c.type === 'TIER_1_OVERRIDE')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const tier2Total = filteredCommissions
    .filter(c => c.type === 'TIER_2' || c.type === 'TIER_2_OVERRIDE')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalFilteredRevenue = directSalesTotal + tier1Total + tier2Total || 1; // Prevent div by 0

  const lifetimePayoutsTotal = payoutHistory
    .filter(p => p.status === 'COMPLETED' || p.status === 'APPROVED')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const revenueSources = [
    { 
      name: 'Direct Product Sales', 
      amount: `$${directSalesTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      percentage: `${((directSalesTotal / totalFilteredRevenue) * 100).toFixed(1)}%`, 
      color: 'bg-purple-600' 
    },
    { 
      name: 'Tier-1 Network Bonus (1%)', 
      amount: `$${tier1Total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      percentage: `${((tier1Total / totalFilteredRevenue) * 100).toFixed(1)}%`, 
      color: 'bg-indigo-500' 
    },
    { 
      name: 'Tier-2 Network Bonus (0.5%)', 
      amount: `$${tier2Total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
      percentage: `${((tier2Total / totalFilteredRevenue) * 100).toFixed(1)}%`, 
      color: 'bg-emerald-500' 
    },
  ];

  // Handle Payout Submission
  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    setPayoutStatus({ loading: true, success: false, error: '' });

    const amountNum = parseFloat(payoutAmount);
    if (!amountNum || amountNum < 50) {
      setPayoutStatus({ loading: false, success: false, error: 'Minimum payout amount is $50.00' });
      return;
    }

    if (amountNum > dashboardStats.approvedBalance) {
      setPayoutStatus({ loading: false, success: false, error: 'Amount exceeds available balance' });
      return;
    }

    startTransition(async () => {
      const res = await requestPayout('CURRENT_USER_ID', amountNum, payoutMethod, payoutDetails);
      if (res.success) {
        setPayoutStatus({ loading: false, success: true, error: '' });
        setPayoutAmount('');
        setPayoutDetails('');
        loadData(); // Reload refreshed data
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setPayoutStatus({ loading: false, success: false, error: res.error || 'Payout request failed' });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading financial metrics...</p>
      </div>
    );
  }

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
                  ? 'bg-purple-600 text-white shadow-xs' 
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
        
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-slate-900 text-white rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[11px] font-bold text-purple-200 uppercase tracking-wider">Available for Payout</p>
              <h2 className="text-3xl font-black mt-1 text-white">
                ${dashboardStats.approvedBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-2.5 bg-purple-700/50 border border-purple-500/30 rounded-xl">
              <Wallet className="w-5 h-5 text-purple-200" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-700/50 flex justify-between items-center z-10">
            <span className="text-[11px] text-purple-200">Ready to transfer</span>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
            >
              Request Payout <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pending Balance Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Balance</p>
              <h2 className="text-3xl font-black text-slate-900 mt-1">
                ${dashboardStats.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
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
              <h2 className="text-3xl font-black text-emerald-600 mt-1">
                ${lifetimePayoutsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active Commission Program</span>
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
              <p className="text-[11px] text-slate-500">Distribution across active direct and tier commission channels</p>
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
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${source.color}`} style={{ width: source.percentage }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Schedule Note */}
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

      {/* REQUEST PAYOUT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Request Payout Withdrawal</h3>
              <p className="text-xs text-slate-500 mt-1">Available balance: ${dashboardStats.approvedBalance.toFixed(2)}</p>
            </div>

            {payoutStatus.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{payoutStatus.error}</span>
              </div>
            )}

            {payoutStatus.success ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Request Submitted!</h4>
                <p className="text-xs text-slate-500">Your payout request is pending approval by admin.</p>
              </div>
            ) : (
              <form onSubmit={handlePayoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Min $50.00"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="bank_transfer">Bank Transfer (IBAN/Wire)</option>
                    <option value="paypal">PayPal</option>
                    <option value="crypto">USDT / Crypto Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Details</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide Bank Account No / IBAN / PayPal Email / Wallet Address"
                    value={payoutDetails}
                    onChange={(e) => setPayoutDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-2 text-xs font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}