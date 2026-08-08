'use client';

import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Clock, DownloadCloud } from 'lucide-react';

export default function EarningsPage() {
  const transactions = [
    { id: 'TRX-1092', date: '2026-07-30', desc: 'Payout to Bank Account', amount: '-$450.00', type: 'withdrawal', status: 'Completed' },
    { id: 'TRX-1093', date: '2026-07-29', desc: 'Order Settlement (ORD-8841)', amount: '+$45.00', type: 'earning', status: 'Cleared' },
    { id: 'TRX-1094', date: '2026-07-28', desc: 'Order Settlement (ORD-8842)', amount: '+$24.75', type: 'earning', status: 'Cleared' },
    { id: 'TRX-1095', date: '2026-07-27', desc: 'Order Settlement (ORD-8843)', amount: '+$37.08', type: 'earning', status: 'Pending' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Earnings Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">Track your revenue, withdrawals, and account statements.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all">
          <DownloadCloud className="w-4 h-4" /> Export Statement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</h3>
          </div>
          <p className="text-3xl font-black text-slate-900">$1,240.50</p>
          <button className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
            Request Withdrawal
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Clearance</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">$385.00</p>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-4">Funds from recent orders clearing in 3-5 days.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Withdrawn</h3>
            </div>
            <p className="text-3xl font-black text-slate-900">$8,450.00</p>
          </div>
          <p className="text-[11px] font-medium text-slate-400 mt-4">Lifetime withdrawals to attached bank accounts.</p>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Transaction Ledger</h2>
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
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-mono text-slate-500">{trx.id}</td>
                  <td className="p-4">{trx.date}</td>
                  <td className="p-4 font-semibold text-slate-800">{trx.desc}</td>
                  <td className={`p-4 font-bold ${trx.type === 'earning' ? 'text-emerald-600' : 'text-slate-900'}`}>
                    <div className="flex items-center gap-1">
                      {trx.type === 'earning' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {trx.amount}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${
                      trx.status === 'Completed' || trx.status === 'Cleared' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}