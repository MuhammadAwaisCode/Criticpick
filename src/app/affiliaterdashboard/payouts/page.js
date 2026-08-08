'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  CreditCard, 
  X, 
  ArrowUpRight,
  Send,
  Shield,
  Building2,
  Wallet
} from 'lucide-react';

export default function PayoutsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [successMessage, setSuccessMessage] = useState('');

  // Financial Stats
  const availableBalance = 1850.00;
  const pendingBalance = 412.80;
  const totalWithdrawn = 6200.00;

  // Payout History Data
  const [payoutHistory, setPayoutHistory] = useState([
    {
      id: 'PAY-8821',
      date: '2026-07-20',
      method: 'Bank Transfer (Meezan Bank)',
      amount: '$500.00',
      status: 'Completed',
    },
    {
      id: 'PAY-8750',
      date: '2026-07-10',
      method: 'PayPal (user@example.com)',
      amount: '$1,200.00',
      status: 'Completed',
    },
    {
      id: 'PAY-8610',
      date: '2026-06-28',
      method: 'Wise Direct',
      amount: '$450.00',
      status: 'Pending',
    },
    {
      id: 'PAY-8400',
      date: '2026-06-12',
      method: 'Bank Transfer (Meezan Bank)',
      amount: '$800.00',
      status: 'Completed',
    },
  ]);

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }

    if (amountNum > availableBalance) {
      alert('Entered amount exceeds your available balance.');
      return;
    }

    if (amountNum < 50) {
      alert('Minimum payout request threshold is $50.00');
      return;
    }

    // Add new pending withdrawal request
    const newRequest = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      method: selectedMethod === 'bank' ? 'Bank Transfer' : selectedMethod === 'paypal' ? 'PayPal' : 'Wise Direct',
      amount: `$${amountNum.toFixed(2)}`,
      status: 'Pending',
    };

    setPayoutHistory([newRequest, ...payoutHistory]);
    setIsModalOpen(false);
    setWithdrawAmount('');
    setSuccessMessage('Withdrawal request submitted successfully!');
    
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payouts & Withdrawal Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your balance, request commission payouts, and view transaction history.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Request Payout
        </button>
      </div>

      {/* SUCCESS ALERT BANNER */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 w-4 h-4 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. FINANCIAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Available for Withdrawal */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">${availableBalance.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> Ready for immediate payout request
            </p>
          </div>
        </div>

        {/* Pending Balance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Balance</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-600">${pendingBalance.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Under 7-day refund hold period</p>
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lifetime Earnings Paid</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">${totalWithdrawn.toFixed(2)}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Cleared payouts to date</p>
          </div>
        </div>

      </div>

      {/* 2. PAYOUT HISTORY TABLE */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Withdrawal History</h3>
            <p className="text-xs text-slate-400">Track status of past payout requests and disbursements</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <th className="py-3.5 px-5">Reference ID</th>
                <th className="py-3.5 px-5">Date Requested</th>
                <th className="py-3.5 px-5">Payout Method</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payoutHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-slate-900 font-bold">{item.id}</td>
                  <td className="py-3.5 px-5 text-slate-500 font-medium">{item.date}</td>
                  <td className="py-3.5 px-5 font-bold text-slate-800 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" /> {item.method}
                  </td>
                  <td className="py-3.5 px-5 font-black text-slate-900 text-sm">{item.amount}</td>
                  <td className="py-3.5 px-5 text-right">
                    {item.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Processing
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MODAL: REQUEST WITHDRAWAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Request Commission Payout</h2>
                  <p className="text-[11px] text-slate-500">Min threshold: $50.00</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              
              {/* Available Limit Display */}
              <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Available to Withdraw:</span>
                <span className="font-black text-slate-900 text-sm">${availableBalance.toFixed(2)}</span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount (e.g. 250.00)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-mono"
                  required
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank', label: 'Bank' },
                    { id: 'paypal', label: 'PayPal' },
                    { id: 'wise', label: 'Wise' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedMethod === m.id
                          ? 'bg-purple-50 border-purple-600 text-purple-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Helper Note */}
              <div className="text-[10px] text-slate-400 flex items-start gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>Payouts are processed within 24 to 48 business hours to your registered default account details.</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Submit Request
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}