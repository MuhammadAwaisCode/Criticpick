'use client';

import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Check 
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payout' | 'security'
  const [saved, setSaved] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.affiliate@example.com',
    phone: '+1 (555) 019-2834',
    website: 'https://alexreviews.com',
  });

  // Payout Form State
  const [payout, setPayout] = useState({
    method: 'paypal', // 'paypal' | 'bank'
    paypalEmail: 'alex.payments@example.com',
    bankName: 'Global City Bank',
    accountNumber: '**** **** **** 8821',
    swiftCode: 'GCBKUS33',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, payment methods, and account security.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('payout')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'payout'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payout Details
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Security & Password
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Website / Channel</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {saved ? 'Changes Saved!' : 'Save Profile'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PAYOUT DETAILS */}
      {activeTab === 'payout' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Payout Method Selection</h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPayout({ ...payout, method: 'paypal' })}
              className={`p-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                payout.method === 'paypal'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              PayPal Transfer
            </button>

            <button
              type="button"
              onClick={() => setPayout({ ...payout, method: 'bank' })}
              className={`p-4 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                payout.method === 'bank'
                  ? 'border-purple-600 bg-purple-50/50 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Direct Bank Wire
            </button>
          </div>

          {payout.method === 'paypal' ? (
            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-slate-700">PayPal Email Address</label>
              <input
                type="email"
                value={payout.paypalEmail}
                onChange={(e) => setPayout({ ...payout, paypalEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={payout.bankName}
                  onChange={(e) => setPayout({ ...payout, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account / IBAN</label>
                <input
                  type="text"
                  value={payout.accountNumber}
                  onChange={(e) => setPayout({ ...payout, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SWIFT / BIC Code</label>
                <input
                  type="text"
                  value={payout.swiftCode}
                  onChange={(e) => setPayout({ ...payout, swiftCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Payout Info'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Change Password</h2>

          <div className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              {saved ? 'Password Updated!' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}