'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  User,
  Mail,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Landmark,
  CreditCard,
  Smartphone,
  Truck,
  Wallet,
  Clock,
  Bell,
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { useVendorData } from '../context/VendorDataContext';

const TABS = ['Store Profile', 'Payment Details', 'Shipping Zones', 'Notifications'];

const DEFAULT_FORM_STATE = {
  // Store Profile
  storeName: '',
  contactName: '',
  supportEmail: '',
  description: '',
  // Payment Details
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  walletNumber: '',
  // Shipping Zones
  flatShippingRate: '',
  freeShippingThreshold: '',
  estimatedDeliveryDays: '',
  // Notifications
  notifyNewOrder: true,
  notifyLowStock: true,
  notifyReviewAlert: true,
};

// Small toggle switch reusing only colors/radii already present elsewhere in
// this file (slate-900 / slate-200, rounded-full) — no new design language.
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
        checked ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { vendorData, updateStoreSettings } = useVendor();
  const { showToast } = useVendorData();

  const [activeTab, setActiveTab] = useState(0);
  const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Seed the form once vendorData loads from context (async fetch under the hood).
  // Switching tabs never touches this state, so values persist across tabs.
  useEffect(() => {
    if (vendorData) {
      setFormState((prev) => ({
        ...prev,
        storeName: vendorData.storeName ?? prev.storeName,
        contactName: vendorData.contactName ?? prev.contactName,
        supportEmail: vendorData.supportEmail ?? prev.supportEmail,
        description: vendorData.description ?? prev.description,
        bankName: vendorData.bankName ?? prev.bankName,
        accountTitle: vendorData.accountTitle ?? prev.accountTitle,
        accountNumber: vendorData.accountNumber ?? prev.accountNumber,
        walletNumber: vendorData.walletNumber ?? prev.walletNumber,
        flatShippingRate: vendorData.flatShippingRate ?? prev.flatShippingRate,
        freeShippingThreshold: vendorData.freeShippingThreshold ?? prev.freeShippingThreshold,
        estimatedDeliveryDays: vendorData.estimatedDeliveryDays ?? prev.estimatedDeliveryDays,
        notifyNewOrder: vendorData.notifyNewOrder ?? prev.notifyNewOrder,
        notifyLowStock: vendorData.notifyLowStock ?? prev.notifyLowStock,
        notifyReviewAlert: vendorData.notifyReviewAlert ?? prev.notifyReviewAlert,
      }));
    }
  }, [vendorData]);

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleToggle = (field) => (nextValue) => {
    setFormState((prev) => ({ ...prev, [field]: nextValue }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const { error } = await updateStoreSettings(formState);

    setIsSaving(false);
    setSaveStatus(error ? 'error' : 'success');
    window.setTimeout(() => setSaveStatus(null), 3000);

    if (error) {
      showToast?.('Failed to save preferences. Please try again.', 'error');
    } else {
      showToast?.('Preferences saved successfully', 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your public profile and backend configurations.</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Preferences
              </>
            )}
          </button>
          {saveStatus === 'success' && (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Preferences saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Save failed — try again
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Tabs */}
        <div className="col-span-1 space-y-1">
          {TABS.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-colors ${i === activeTab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Settings Form Wrapper */}
        <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {activeTab === 0 && (
            <>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Store Profile Information</h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Name</label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formState.storeName}
                      onChange={handleChange('storeName')}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formState.contactName}
                        onChange={handleChange('contactName')}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Support Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formState.supportEmail}
                        onChange={handleChange('supportEmail')}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Description</label>
                  <textarea
                    rows="4"
                    value={formState.description}
                    onChange={handleChange('description')}
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Website / Link</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="url" defaultValue="https://criticpick.com/store/beauty-outlet" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-0 outline-none text-slate-500 cursor-not-allowed" readOnly />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 1 && (
            <>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Payment Details</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</label>
                    <div className="relative">
                      <Landmark className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formState.bankName}
                        onChange={handleChange('bankName')}
                        placeholder="e.g. HBL, Meezan Bank"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Title</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formState.accountTitle}
                        onChange={handleChange('accountTitle')}
                        placeholder="Name on the account"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Number / IBAN</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formState.accountNumber}
                      onChange={handleChange('accountNumber')}
                      placeholder="PKXX XXXX XXXX XXXX XXXX XXXX"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EasyPaisa / JazzCash Number</label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formState.walletNumber}
                      onChange={handleChange('walletNumber')}
                      placeholder="03XX XXXXXXX"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 2 && (
            <>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Shipping Zones</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Flat Shipping Rate (PKR)</label>
                    <div className="relative">
                      <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={formState.flatShippingRate}
                        onChange={handleChange('flatShippingRate')}
                        placeholder="250"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Shipping Threshold (PKR)</label>
                    <div className="relative">
                      <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        value={formState.freeShippingThreshold}
                        onChange={handleChange('freeShippingThreshold')}
                        placeholder="5000"
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery Days</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formState.estimatedDeliveryDays}
                      onChange={handleChange('estimatedDeliveryDays')}
                      placeholder="e.g. 2-4 days"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 3 && (
            <>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Email Notifications</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">New Order Alert</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Get emailed the moment a new order comes in</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={formState.notifyNewOrder} onChange={handleToggle('notifyNewOrder')} />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Low Stock Warning</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Alert me when inventory runs low</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={formState.notifyLowStock} onChange={handleToggle('notifyLowStock')} />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Customer Review Alert</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Get notified when a customer leaves a review</p>
                    </div>
                  </div>
                  <ToggleSwitch checked={formState.notifyReviewAlert} onChange={handleToggle('notifyReviewAlert')} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}