'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Clock, 
  DownloadCloud, 
  Loader2, 
  Building2, 
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';

// PKR Currency Formatter
const formatPKR = (amount) => {
  const num = Number(amount) || 0;
  return `PKR ${num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function EarningsPage() {
  const { vendorData, isLoadingVendor, requestWithdrawal } = useVendor();

  const [isRequesting, setIsRequesting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const notify = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Database Dynamic Values with Fallbacks
  const availableBalance = vendorData?.availableBalance ?? 0;
  const pendingClearance = vendorData?.pendingClearance ?? 0;
  const totalWithdrawn = vendorData?.totalWithdrawn ?? 0;
  const minThreshold = vendorData?.payoutSettingsJson?.minPayoutThreshold ?? 5000;
  const transactions = vendorData?.transactions || [];

  // Verification status checked strictly from server state
  const verificationStatus = vendorData?.payoutStatus || (vendorData?.isVerified ? 'verified' : 'unverified');

  // Handle Withdrawal Request with DB Validation
  const handleRequestWithdrawal = async () => {
    if (verificationStatus !== 'verified') {
      notify('Please set up and verify your payout account details first.', 'error');
      return;
    }

    if (availableBalance < minThreshold) {
      notify(`Minimum withdrawal limit is ${formatPKR(minThreshold)}. Your balance is insufficient.`, 'error');
      return;
    }

    setIsRequesting(true);
    try {
      const { error } = await requestWithdrawal({ amount: availableBalance });
      if (error) {
        notify(error.message || 'Failed to process withdrawal request.', 'error');
      } else {
        notify('Withdrawal request submitted successfully!');
      }
    } catch (err) {
      notify('Database connection error.', 'error');
    } finally {
      setIsRequesting(false);
    }
  };

  // Export CSV Statement Functionality
  const handleExportCSV = () => {
    if (!transactions.length) {
      notify('No transaction history available to export.', 'error');
      return;
    }
    const headers = 'Transaction ID,Date,Description,Type,Amount,Status\n';
    const rows = transactions.map(t => `"${t.id}","${t.date}","${t.desc}","${t.type}","${t.amount}","${t.status}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    notify('Statement downloaded successfully!');
  };

  if (isLoadingVendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-xs font-medium text-slate-500">Loading earnings matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
          <div className="bg-slate-900 text-white shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700 text-sm font-medium animate-fade-in">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">Track your revenue, withdrawals, and account statements.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <DownloadCloud className="w-4 h-4" /> Export Statement
        </button>
      </div>

      {/* Unverified Warning Banner if payout details are missing/unverified */}
      {verificationStatus !== 'verified' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold">Payout Method Action Required</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">Setup and verify your bank details to enable balance withdrawals.</p>
            </div>
          </div>
          <Link 
            href="/vendoradmin/payments" 
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition-colors"
          >
            Configure Bank
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{formatPKR(availableBalance)}</p>
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleRequestWithdrawal}
              disabled={isRequesting || availableBalance < minThreshold || verificationStatus !== 'verified'}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request Withdrawal'}
            </button>

            <Link 
              href="/vendoradmin/payments"
              className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Payout & Bank Settings"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Clearance</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{formatPKR(pendingClearance)}</p>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-4">Funds from recent delivered orders clearing in 3-5 days.</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Withdrawn</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">{formatPKR(totalWithdrawn)}</p>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-4">Lifetime payout transfers processed to your bank/wallet.</p>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Transaction Ledger</h2>
          <span className="text-xs font-medium text-slate-400">{transactions.length} total entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No ledger transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono text-slate-500">{trx.id}</td>
                    <td className="p-4">{trx.date}</td>
                    <td className="p-4 font-semibold text-slate-800">{trx.desc}</td>
                    <td className={`p-4 font-bold ${trx.type === 'earning' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      <div className="flex items-center gap-1">
                        {trx.type === 'earning' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5 text-slate-400" />}
                        {trx.amount}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${
                        trx.status === 'Completed' || trx.status === 'Cleared' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : trx.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {trx.status}
                      </span>
                    </td>
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