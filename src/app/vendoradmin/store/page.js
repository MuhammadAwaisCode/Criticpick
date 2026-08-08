'use client';

import { useState } from 'react';
import { 
  Store, 
  Globe, 
  Upload, 
  Save, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Percent, 
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { useVendorData } from '../context/VendorDataContext';

export default function StoreSettingsPage() {
  const { addToast } = useVendorData();
  const [isSaving, setIsSaving] = useState(false);

  // Store Settings State
  const [storeData, setStoreData] = useState({
    storeName: 'Criticpick Official Store',
    storeSlug: 'criticpick-official',
    tagline: 'Premium Beauty & Personal Care Products',
    description: 'Official store for certified organic and dermatologist-tested skincare products shipping worldwide.',
    businessEmail: 'support@criticpick.com',
    supportPhone: '+92 300 9876543',
    address: 'Suite 402, Business Bay, Main Boulevard',
    city: 'Lahore',
    country: 'Pakistan',
    taxId: 'NTN-8923411-9',
    currency: 'USD ($)',
    defaultShippingOrigin: 'Pakistan',
    returnPolicy: '30-day easy return policy for damaged or incorrect items.',
    shippingTerms: 'Standard delivery takes 3-5 business days domestically and 7-14 days internationally.'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setIsSaving(false);
      addToast('Store settings updated successfully!', 'success');
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings & Branding</h1>
          <p className="text-sm text-gray-500">Manage your store identity, business address, and multi-currency options.</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Store Identity & Visuals */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" /> Store Branding
          </h3>

          {/* Banner & Logo Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Store Banner Upload */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Store Cover Banner</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50 flex flex-col items-center justify-center min-h-[160px]">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-gray-600 font-medium">Click to upload banner image</p>
                <p className="text-[11px] text-gray-400 mt-1">Recommended size: 1200x300px (PNG, JPG)</p>
              </div>
            </div>

            {/* Store Logo Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">Store Logo</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50 flex flex-col items-center justify-center min-h-[160px]">
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 font-bold text-lg border border-blue-200">
                  CP
                </div>
                <p className="text-xs text-gray-600 font-medium">Upload Logo</p>
                <p className="text-[11px] text-gray-400 mt-1">500x500px</p>
              </div>
            </div>

          </div>

          {/* Store Info Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={storeData.storeName}
                onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Custom URL Slug</label>
              <div className="flex items-center">
                <span className="bg-gray-100 border border-r-0 border-gray-200 text-gray-500 text-xs px-3 py-2 rounded-l-lg">
                  criticpick.com/store/
                </span>
                <input 
                  type="text" 
                  value={storeData.storeSlug}
                  onChange={(e) => setStoreData({ ...storeData, storeSlug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Tagline</label>
              <input 
                type="text" 
                value={storeData.tagline}
                onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Biography / Description</label>
              <textarea 
                rows="3"
                value={storeData.description}
                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 2. Regional, Currency & Tax Setup */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" /> Multi-Country & Localization
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Store Primary Currency</label>
              <select 
                value={storeData.currency}
                onChange={(e) => setStoreData({ ...storeData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="USD ($)">USD ($) - US Dollar</option>
                <option value="AED (AED)">AED (AED) - UAE Dirham</option>
                <option value="PKR (Rs)">PKR (Rs) - Pakistani Rupee</option>
                <option value="EUR (€)">EUR (€) - Euro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary Warehouse / Origin</label>
              <input 
                type="text" 
                value={storeData.defaultShippingOrigin}
                onChange={(e) => setStoreData({ ...storeData, defaultShippingOrigin: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tax / VAT Number</label>
              <input 
                type="text" 
                value={storeData.taxId}
                onChange={(e) => setStoreData({ ...storeData, taxId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* 3. Contact & Business Address */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" /> Business Support Info
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Public Support Email</label>
              <input 
                type="email" 
                value={storeData.businessEmail}
                onChange={(e) => setStoreData({ ...storeData, businessEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Customer Support Phone</label>
              <input 
                type="text" 
                value={storeData.supportPhone}
                onChange={(e) => setStoreData({ ...storeData, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Physical Business Address</label>
              <input 
                type="text" 
                value={storeData.address}
                onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}