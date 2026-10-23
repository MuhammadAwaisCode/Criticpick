'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Check, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'payout' | 'security'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

  // Form States
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
  });

  const [payout, setPayout] = useState({
    method: 'paypal',
    paypalEmail: '',
    bankName: '',
    accountNumber: '',
    swiftCode: '',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 1. Fetch User Settings from Database on Mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true);
        
        // TODO: Replace with your actual API endpoint or Server Action
        // const response = await fetch('/api/user/settings');
        // const data = await response.json();

        // Simulated Database Fetch Delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock DB Data Population
        setProfile({
          name: 'Alex Johnson',
          email: 'alex.affiliate@example.com',
          phone: '+1 (555) 019-2834',
          website: 'https://alexreviews.com',
        });

        setPayout({
          method: 'paypal',
          paypalEmail: 'alex.payments@example.com',
          bankName: 'Global City Bank',
          accountNumber: '**** **** **** 8821',
          swiftCode: 'GCBKUS33',
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load account settings.' });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Clear Status Message After 4 Seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 2. Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Connect to Database (API Route / Server Action)
      // await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(profile) });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // 3. Save Payout Details Handler
  const handleSavePayout = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // TODO: Connect to Database (API Route / Server Action)
      // await fetch('/api/user/payout', { method: 'PUT', body: JSON.stringify(payout) });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Payout settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save payout details.' });
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Update Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (security.newPassword !== security.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    if (security.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Connect to Database / Auth Provider (e.g. Supabase Auth / NextAuth / Custom DB)
      // await fetch('/api/user/password', { method: 'POST', body: JSON.stringify(security) });

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password. Check your current password.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-6 sm:px-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, payment methods, and account security.
        </p>
      </div>

      {/* Global Status Alert Banner */}
      {message.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" /> Personal Profile
        </button>

        <button
          onClick={() => setActiveTab('payout')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payout'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Payout Details
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
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
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="fullName" className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                id="fullName"
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                id="phone"
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="website" className="block font-semibold text-slate-700 mb-1">Primary Website / Channel</label>
              <input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PAYOUT DETAILS */}
      {activeTab === 'payout' && (
        <form onSubmit={handleSavePayout} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
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
              <label htmlFor="paypalEmail" className="block font-semibold text-slate-700">PayPal Email Address</label>
              <input
                id="paypalEmail"
                type="email"
                required
                value={payout.paypalEmail}
                onChange={(e) => setPayout({ ...payout, paypalEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor="bankName" className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  id="bankName"
                  type="text"
                  required
                  value={payout.bankName}
                  onChange={(e) => setPayout({ ...payout, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div>
                <label htmlFor="accountNumber" className="block font-semibold text-slate-700 mb-1">Account / IBAN</label>
                <input
                  id="accountNumber"
                  type="text"
                  required
                  value={payout.accountNumber}
                  onChange={(e) => setPayout({ ...payout, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div>
                <label htmlFor="swiftCode" className="block font-semibold text-slate-700 mb-1">SWIFT / BIC Code</label>
                <input
                  id="swiftCode"
                  type="text"
                  required
                  value={payout.swiftCode}
                  onChange={(e) => setPayout({ ...payout, swiftCode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Payout Info
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <form onSubmit={handleUpdatePassword} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900">Change Password</h2>

          <div className="space-y-4 max-w-md text-xs">
            <div>
              <label htmlFor="currentPassword" className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                required
                placeholder="••••••••"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block font-semibold text-slate-700 mb-1">New Password</label>
              <input
                id="newPassword"
                type="password"
                required
                placeholder="••••••••"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Update Password
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
}