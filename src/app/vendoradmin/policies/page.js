'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  RotateCcw, 
  ShieldCheck, 
  Save, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';

export default function StorePoliciesPage() {
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

  const [policyInfo, setPolicyInfo] = useState({
    returnWindowDays: 7,
    acceptReturns: true,
    returnPolicyDetails: '',
    warrantyDetails: '',
    termsAndConditions: '',
  });

  useEffect(() => {
    if (vendorData) {
      setPolicyInfo((prev) => ({
        ...prev,
        ...(vendorData.storePoliciesJson || {}),
      }));
    }
  }, [vendorData]);

  const handleChange = (field, value) => {
    setPolicyInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const returnDays = Number(policyInfo.returnWindowDays);
    if (isNaN(returnDays) || returnDays < 0) {
      newErrors.returnWindowDays = 'Return window must be a valid positive number of days.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      notify('Please correct highlighted validation errors.', 'error');
      return;
    }

    setIsSaving(true);
    const payload = {
      ...policyInfo,
      returnWindowDays: Number(policyInfo.returnWindowDays),
    };

    try {
      const { error } = await updateStoreSettings({
        storePoliciesJson: payload,
      });

      if (error) {
        notify('Failed to save store policies.', 'error');
      } else {
        notify('Store policies updated successfully!');
      }
    } catch (err) {
      notify('Database connection error.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingVendor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
        <p className="text-xs font-medium text-slate-500">Loading store policies...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 relative">
      {toast && (
        <div className="fixed top-20 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
          <div className="bg-slate-900 text-white shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700 text-sm font-medium">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Policies</h1>
          <p className="text-xs text-slate-500 mt-1">Configure return, refund, warranty, and customer terms for your shop storefront.</p>
        </div>
        <button
          form="policies-form"
          type="submit"
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Policies
        </button>
      </div>

      <form id="policies-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Return & Refund Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <RotateCcw className="w-5 h-5 text-amber-600" />
            <h2>Return & Refund Policy</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="block text-xs font-bold text-slate-800">Accept Product Returns</span>
                <span className="text-[11px] text-slate-400">Allow customers to submit return requests for eligible items.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyInfo.acceptReturns}
                  onChange={(e) => handleChange('acceptReturns', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Return Window (Days)</label>
              <input
                type="number"
                min="0"
                value={policyInfo.returnWindowDays}
                onChange={(e) => handleChange('returnWindowDays', e.target.value)}
                className={`w-48 px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.returnWindowDays ? 'border-red-500' : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-600'}`}
              />
              {errors.returnWindowDays && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.returnWindowDays}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Return & Refund Terms</label>
              <textarea
                rows={4}
                value={policyInfo.returnPolicyDetails}
                onChange={(e) => handleChange('returnPolicyDetails', e.target.value)}
                placeholder="Specify conditions, non-returnable categories, original packaging requirements, etc."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Warranty & Terms */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2>Warranty & Product Support Terms</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Warranty Details & Replacement Guidelines</label>
              <textarea
                rows={3}
                value={policyInfo.warrantyDetails}
                onChange={(e) => handleChange('warrantyDetails', e.target.value)}
                placeholder="State your brand warranty coverage (e.g., 6 months seller warranty, replacement process)."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">General Terms & Store Conditions</label>
              <textarea
                rows={4}
                value={policyInfo.termsAndConditions}
                onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                placeholder="Custom terms of service for customers purchasing from your storefront..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Policies
          </button>
        </div>
      </form>
    </div>
  );
}