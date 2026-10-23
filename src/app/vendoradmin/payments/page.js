'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Smartphone, 
  CreditCard, 
  Clock, 
  Save, 
  Loader2, 
  ShieldCheck, 
  ShieldAlert,
  Clock3,
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';

const PAKISTAN_BANKS = [
  'Meezan Bank',
  'Habib Bank Limited (HBL)',
  'United Bank Limited (UBL)',
  'MCB Bank',
  'Allied Bank Limited (ABL)',
  'Bank Alfalah',
  'Askari Bank',
  'Faysal Bank',
  'Standard Chartered Pakistan',
  'Other / International Bank',
];

const IBAN_REGEX = /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/;
const WALLET_REGEX = /^03\d{9}$/;

export default function PayoutSettingsPage() {
  const { vendorData, updateStoreSettings, isLoadingVendor } = useVendor();

  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
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

  const [payoutInfo, setPayoutInfo] = useState({
    defaultMethod: 'bank', // 'bank' | 'wallet'
    bankName: 'Meezan Bank',
    accountTitle: '',
    accountNumber: '',
    iban: '',
    swiftBranchCode: '',
    walletProvider: 'EasyPaisa',
    walletAccountTitle: '',
    walletNumber: '',
    payoutFrequency: 'Weekly',
    minPayoutThreshold: 5000,
    autoPayoutEnabled: true,
  });

  useEffect(() => {
    if (vendorData) {
      setPayoutInfo((prev) => ({
        ...prev,
        accountTitle: vendorData.accountTitle || prev.accountTitle,
        bankName: vendorData.bankName || prev.bankName,
        iban: vendorData.iban || prev.iban,
        ...(vendorData.payoutSettingsJson || {}),
      }));
    }
  }, [vendorData]);

  const handleChange = (field, value) => {
    setPayoutInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (payoutInfo.defaultMethod === 'bank') {
      if (!payoutInfo.accountTitle.trim()) {
        newErrors.accountTitle = 'Account title is required.';
      }
      const cleanIban = payoutInfo.iban.replace(/\s+/g, '').toUpperCase();
      if (!cleanIban) {
        newErrors.iban = 'IBAN is required.';
      } else if (!IBAN_REGEX.test(cleanIban)) {
        newErrors.iban = 'Invalid Pakistani IBAN (Must be 24 alphanumeric characters starting with PK).';
      }
    } else if (payoutInfo.defaultMethod === 'wallet') {
      if (!payoutInfo.walletAccountTitle.trim()) {
        newErrors.walletAccountTitle = 'Wallet account title is required.';
      }
      const cleanWallet = payoutInfo.walletNumber.replace(/\s+/g, '');
      if (!cleanWallet) {
        newErrors.walletNumber = 'Mobile wallet number is required.';
      } else if (!WALLET_REGEX.test(cleanWallet)) {
        newErrors.walletNumber = 'Invalid mobile number format (e.g. 03001234567).';
      }
    }

    const thresholdNum = Number(payoutInfo.minPayoutThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      newErrors.minPayoutThreshold = 'Threshold must be a valid non-negative number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      notify('Please resolve highlighted errors before saving.', 'error');
      return;
    }

    setIsSaving(true);
    const cleanIban = payoutInfo.iban.replace(/\s+/g, '').toUpperCase();
    const cleanWallet = payoutInfo.walletNumber.replace(/\s+/g, '');

    // Stripped isVerified from client state/payload entirely
    const payloadSettings = {
      ...payoutInfo,
      iban: cleanIban,
      walletNumber: cleanWallet,
      minPayoutThreshold: Number(payoutInfo.minPayoutThreshold),
    };

    try {
      const { error } = await updateStoreSettings({
        payoutSettingsJson: payloadSettings,
        bankName: payoutInfo.bankName,
        accountTitle: payoutInfo.accountTitle,
        iban: cleanIban,
      });

      if (error) {
        notify('Failed to save payout settings to Database.', 'error');
      } else {
        notify('Payout settings updated successfully!');
      }
    } catch (err) {
      notify('Database connection error.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Read verification status strictly from server-controlled vendorData
  const verificationStatus = vendorData?.payoutStatus || (vendorData?.isVerified ? 'verified' : 'unverified');

  if (isLoadingVendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-xs font-medium text-slate-500">Loading payout settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 relative">
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payout & Bank Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Configure where and how you want to receive your automated earnings payouts.</p>
        </div>
        <button
          form="payout-form"
          type="submit"
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Payout Settings
        </button>
      </div>

      {/* Conditional Server Status Card */}
      {verificationStatus === 'verified' && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Payout Account Status</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">Your payout account is verified. Automated transfers will process as scheduled.</p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-5 flex items-center gap-3">
          <Clock3 className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-amber-900">Verification Pending</h3>
            <p className="text-[11px] text-amber-700 mt-0.5">Your updated payout details are currently being reviewed by compliance.</p>
          </div>
        </div>
      )}

      {verificationStatus === 'unverified' && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-900 rounded-2xl p-5 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-red-900">Account Unverified</h3>
            <p className="text-[11px] text-red-700 mt-0.5">Please provide valid payout details below to activate automated payouts.</p>
          </div>
        </div>
      )}

      <form id="payout-form" onSubmit={handleSubmit} className="space-y-6">

        {/* Accessible Receiving Channel Radio Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Preferred Receiving Channel</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="radiogroup" aria-label="Receiving Channel">
            <label
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                payoutInfo.defaultMethod === 'bank'
                  ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/10'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="defaultMethod"
                value="bank"
                checked={payoutInfo.defaultMethod === 'bank'}
                onChange={() => handleChange('defaultMethod', 'bank')}
                className="sr-only"
              />
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${payoutInfo.defaultMethod === 'bank' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Direct Bank Wire (IBAN)</span>
                  {payoutInfo.defaultMethod === 'bank' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Direct wire transfer to Pakistani commercial bank accounts.</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                payoutInfo.defaultMethod === 'wallet'
                  ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600/10'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="defaultMethod"
                value="wallet"
                checked={payoutInfo.defaultMethod === 'wallet'}
                onChange={() => handleChange('defaultMethod', 'wallet')}
                className="sr-only"
              />
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${payoutInfo.defaultMethod === 'wallet' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Mobile Wallet / Raast</span>
                  {payoutInfo.defaultMethod === 'wallet' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Instant payouts via EasyPaisa, JazzCash, or Raast ID.</p>
              </div>
            </label>
          </div>
        </div>

        {/* 1. Direct Bank Transfer Settings */}
        <div className={`bg-white border rounded-2xl p-6 shadow-xs space-y-6 transition-opacity ${payoutInfo.defaultMethod !== 'bank' ? 'opacity-50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h2>Bank Account Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <select
                value={payoutInfo.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {PAKISTAN_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Title / Beneficiary Name *</label>
              <input
                type="text"
                value={payoutInfo.accountTitle}
                onChange={(e) => handleChange('accountTitle', e.target.value)}
                placeholder="Must match official bank records"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.accountTitle ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'}`}
              />
              {errors.accountTitle && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.accountTitle}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">IBAN (International Bank Account Number) *</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={payoutInfo.iban}
                  onChange={(e) => handleChange('iban', e.target.value.toUpperCase())}
                  placeholder="PK36MEZN0000110293847561"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-mono outline-none uppercase tracking-wider focus:ring-2 ${errors.iban ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'}`}
                />
              </div>
              {errors.iban ? (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.iban}</p>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">24-character Pakistani IBAN without spaces.</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Number (Optional)</label>
              <input
                type="text"
                value={payoutInfo.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="01020304050607"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch Code / SWIFT (Optional)</label>
              <input
                type="text"
                value={payoutInfo.swiftBranchCode}
                onChange={(e) => handleChange('swiftBranchCode', e.target.value)}
                placeholder="e.g. MEZNPKKA or 0214"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 2. Mobile Wallet & Instant Transfer */}
        <div className={`bg-white border rounded-2xl p-6 shadow-xs space-y-6 transition-opacity ${payoutInfo.defaultMethod !== 'wallet' ? 'opacity-50' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h2>Mobile Wallet & Raast Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Provider Service</label>
              <select
                value={payoutInfo.walletProvider}
                onChange={(e) => handleChange('walletProvider', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              >
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Raast">Raast Instant Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Wallet Account Title *</label>
              <input
                type="text"
                value={payoutInfo.walletAccountTitle}
                onChange={(e) => handleChange('walletAccountTitle', e.target.value)}
                placeholder="Account Owner Name"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.walletAccountTitle ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'}`}
              />
              {errors.walletAccountTitle && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.walletAccountTitle}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number / Raast ID *</label>
              <input
                type="text"
                value={payoutInfo.walletNumber}
                onChange={(e) => handleChange('walletNumber', e.target.value)}
                placeholder="03001234567"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.walletNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'}`}
              />
              {errors.walletNumber && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.walletNumber}</p>}
            </div>
          </div>
        </div>

        {/* 3. Payout Schedule & Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2>Payout Schedule & Threshold</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payout Frequency</label>
              <select
                value={payoutInfo.payoutFrequency}
                onChange={(e) => handleChange('payoutFrequency', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none bg-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              >
                <option value="Weekly">Weekly (Every Monday)</option>
                <option value="Bi-Weekly">Bi-Weekly (1st & 15th of Month)</option>
                <option value="Monthly">Monthly (1st of Every Month)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Payout Threshold (PKR / Rs)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">PKR</span>
                <input
                  type="number"
                  min="0"
                  value={payoutInfo.minPayoutThreshold}
                  onChange={(e) => handleChange('minPayoutThreshold', e.target.value)}
                  placeholder="5000"
                  className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.minPayoutThreshold ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-600'}`}
                />
              </div>
              {errors.minPayoutThreshold ? (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.minPayoutThreshold}</p>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">Payout triggers when available balance reaches this amount.</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="block text-xs font-bold text-slate-800">Automatic Payout Transfers</span>
              <span className="text-[11px] text-slate-400">Automatically transfer cleared balance to bank on schedule without manual request.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={payoutInfo.autoPayoutEnabled}
                onChange={(e) => handleChange('autoPayoutEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Payout Settings
          </button>
        </div>

      </form>
    </div>
  );
}