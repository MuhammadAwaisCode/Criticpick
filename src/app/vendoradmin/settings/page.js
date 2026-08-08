'use client';

import React from 'react';
import { Store, User, Mail, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your public profile and backend configurations.</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm">
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Tabs (UI representation only) */}
        <div className="col-span-1 space-y-1">
          {['Store Profile', 'Payment Details', 'Shipping Zones', 'Notifications'].map((tab, i) => (
            <button key={i} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors ${i === 0 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Settings Form Wrapper */}
        <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Store Profile Information</h2>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" defaultValue="Criticpick Beauty Outlet" className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" defaultValue="Jane Doe" className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="email" defaultValue="support@criticpickbeauty.com" className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Description</label>
              <textarea rows="4" defaultValue="Premium skincare and beauty wellness products." className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none" />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Website / Link</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="url" defaultValue="https://criticpick.com/store/beauty-outlet" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-0 outline-none text-slate-500 cursor-not-allowed" readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}