'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  MapPin, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';

export default function ShippingRatesPage() {
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

  const [shippingInfo, setShippingInfo] = useState({
    shippingModel: 'flat', // 'flat' | 'free' | 'threshold'
    flatRate: 200,
    freeThresholdAmount: 3000,
    estimatedDays: '2 - 4 Business Days',
    allowedCities: 'All Cities Across Pakistan',
  });

  useEffect(() => {
    if (vendorData) {
      setShippingInfo((prev) => ({
        ...prev,
        ...(vendorData.shippingSettingsJson || {}),
      }));
    }
  }, [vendorData]);

  const handleChange = (field, value) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const flat = Number(shippingInfo.flatRate);
    if (isNaN(flat) || flat < 0) {
      newErrors.flatRate = 'Flat shipping rate must be a non-negative number.';
    }

    const freeLimit = Number(shippingInfo.freeThresholdAmount);
    if (isNaN(freeLimit) || freeLimit < 0) {
      newErrors.freeThresholdAmount = 'Free shipping threshold must be a non-negative number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      notify('Please resolve highlighted validation errors.', 'error');
      return;
    }

    setIsSaving(true);
    const payload = {
      ...shippingInfo,
      flatRate: Number(shippingInfo.flatRate),
      freeThresholdAmount: Number(shippingInfo.freeThresholdAmount),
    };

    try {
      const { error } = await updateStoreSettings({
        shippingSettingsJson: payload,
      });

      if (error) {
        notify('Failed to save shipping rates.', 'error');
      } else {
        notify('Shipping and delivery rates saved successfully!');
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
        <p className="text-xs font-medium text-slate-500">Loading shipping rates...</p>
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shipping & Delivery Rates</h1>
          <p className="text-xs text-slate-500 mt-1">Manage shipping rules, delivery zone coverage, and free shipping limits.</p>
        </div>
        <button
          form="shipping-form"
          type="submit"
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Shipping Rules
        </button>
      </div>

      <form id="shipping-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Shipping Model Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Shipping Strategy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Shipping Strategy">
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                shippingInfo.shippingModel === 'flat'
                  ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/10'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="shippingModel"
                value="flat"
                checked={shippingInfo.shippingModel === 'flat'}
                onChange={() => handleChange('shippingModel', 'flat')}
                className="sr-only"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Flat Rate Shipping</span>
                  {shippingInfo.shippingModel === 'flat' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Charge a fixed delivery fee per order regardless of cart size.</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                shippingInfo.shippingModel === 'threshold'
                  ? 'bg-emerald-50/60 border-emerald-600 ring-2 ring-emerald-600/10'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="shippingModel"
                value="threshold"
                checked={shippingInfo.shippingModel === 'threshold'}
                onChange={() => handleChange('shippingModel', 'threshold')}
                className="sr-only"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Free Above Threshold</span>
                  {shippingInfo.shippingModel === 'threshold' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Free delivery when order total exceeds a specified amount.</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                shippingInfo.shippingModel === 'free'
                  ? 'bg-purple-50/60 border-purple-600 ring-2 ring-purple-600/10'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="shippingModel"
                value="free"
                checked={shippingInfo.shippingModel === 'free'}
                onChange={() => handleChange('shippingModel', 'free')}
                className="sr-only"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">100% Free Shipping</span>
                  {shippingInfo.shippingModel === 'free' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Offer free delivery on all products store-wide.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Rates & Delivery Estimates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2>Rates & Delivery Timeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Standard Flat Rate Fee (PKR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">PKR</span>
                <input
                  type="number"
                  min="0"
                  disabled={shippingInfo.shippingModel === 'free'}
                  value={shippingInfo.flatRate}
                  onChange={(e) => handleChange('flatRate', e.target.value)}
                  placeholder="200"
                  className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 disabled:bg-slate-100 ${errors.flatRate ? 'border-red-500' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'}`}
                />
              </div>
              {errors.flatRate && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.flatRate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Free Shipping Order Minimum (PKR)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">PKR</span>
                <input
                  type="number"
                  min="0"
                  disabled={shippingInfo.shippingModel !== 'threshold'}
                  value={shippingInfo.freeThresholdAmount}
                  onChange={(e) => handleChange('freeThresholdAmount', e.target.value)}
                  placeholder="3000"
                  className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 disabled:bg-slate-100 ${errors.freeThresholdAmount ? 'border-red-500' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600'}`}
                />
              </div>
              {errors.freeThresholdAmount && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.freeThresholdAmount}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Delivery Timeframe</label>
              <input
                type="text"
                value={shippingInfo.estimatedDays}
                onChange={(e) => handleChange('estimatedDays', e.target.value)}
                placeholder="e.g. 2 - 4 Business Days"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Coverage Zones */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h2>Coverage Zones</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Supported Cities / Regions</label>
            <textarea
              rows={3}
              value={shippingInfo.allowedCities}
              onChange={(e) => handleChange('allowedCities', e.target.value)}
              placeholder="e.g. Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad or All Cities"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 shadow-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Shipping Rules
          </button>
        </div>
      </form>
    </div>
  );
}