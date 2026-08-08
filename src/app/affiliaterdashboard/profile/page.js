'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Save 
} from 'lucide-react';

export default function ProfilePage() {
  const [verificationStatus, setVerificationStatus] = useState('PENDING');
  const [selectedPayout, setSelectedPayout] = useState('bank');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    country: 'United States',
    address: '123 Tech Street, Suite 400, New York, NY 10001',
    bankName: 'Global City Bank',
    accountHolder: 'John Doe',
    accountNumber: '**** **** 8829',
    routingNumber: '021000021',
    paypalEmail: 'john.payouts@example.com',
    wiseEmail: 'john.wise@example.com'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Payout Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your personal information, KYC verification status, and withdrawal accounts.</p>
      </div>

      {/* ADMIN VERIFICATION STATUS BANNER */}
      {verificationStatus === 'APPROVED' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Account Approved</h4>
              <p className="text-xs text-emerald-700 mt-0.5">Your identity and payout details are verified. You can generate product links and withdraw earnings.</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full uppercase shrink-0">Approved</span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">Verification Pending Admin Approval</h4>
              <p className="text-xs text-amber-700 mt-0.5">Your profile is currently under review by our team. Link generation will be fully active once approved.</p>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-3 py-1 rounded-full uppercase shrink-0">Pending</span>
        </div>
      )}

      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold p-4 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-600" /> Profile information updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PERSONAL DETAILS SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" /> Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PAYMENT METHODS SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" /> Payout Method & Bank Details
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose where you want to receive your approved commission payouts.</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedPayout('bank')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedPayout === 'bank'
                  ? 'bg-purple-50 border-purple-600 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setSelectedPayout('paypal')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedPayout === 'paypal'
                  ? 'bg-purple-50 border-purple-600 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              PayPal
            </button>
            <button
              type="button"
              onClick={() => setSelectedPayout('wise')}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedPayout === 'wise'
                  ? 'bg-purple-50 border-purple-600 text-purple-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Wise
            </button>
          </div>

          {selectedPayout === 'bank' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Bank Name</label>
                <input
                  type="text"
                  value={profile.bankName}
                  onChange={(e) => setProfile({ ...profile, bankName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Holder Name</label>
                <input
                  type="text"
                  value={profile.accountHolder}
                  onChange={(e) => setProfile({ ...profile, accountHolder: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account / IBAN Number</label>
                <input
                  type="text"
                  value={profile.accountNumber}
                  onChange={(e) => setProfile({ ...profile, accountNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700">SWIFT / Routing Code</label>
                <input
                  type="text"
                  value={profile.routingNumber}
                  onChange={(e) => setProfile({ ...profile, routingNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          {selectedPayout === 'paypal' && (
            <div className="space-y-1 text-xs pt-2">
              <label className="font-bold text-slate-700">PayPal Email Address</label>
              <input
                type="email"
                value={profile.paypalEmail}
                onChange={(e) => setProfile({ ...profile, paypalEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
              />
            </div>
          )}

          {selectedPayout === 'wise' && (
            <div className="space-y-1 text-xs pt-2">
              <label className="font-bold text-slate-700">Wise Registered Email</label>
              <input
                type="email"
                value={profile.wiseEmail}
                onChange={(e) => setProfile({ ...profile, wiseEmail: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-medium focus:outline-none focus:border-purple-600"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" /> Save Profile Details
          </button>
        </div>
      </form>

    </div>
  );
}