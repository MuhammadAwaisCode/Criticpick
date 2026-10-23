'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Share2, 
  Save, 
  Loader2, 
  Search, 
  AlertCircle 
} from 'lucide-react';
import { useVendor } from '@/context/VendorContext';

// Safe & Exact Brand SVG Icons
const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.23V8.2a6.34 6.34 0 0 0-5.46 6.22 6.35 6.35 0 1 0 10.8-4.52V8.71a8.28 8.28 0 0 0 4.77 1.52v-3.54a4.84 4.84 0 0 1-1-.01z"/>
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const URL_REGEX = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i;

export default function SeoSocialPage() {
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

  const [seoInfo, setSeoInfo] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    facebookUrl: '',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
  });

  useEffect(() => {
    if (vendorData) {
      setSeoInfo({
        metaTitle: vendorData.metaTitle || vendorData.storeName || '',
        metaDescription: vendorData.metaDescription || '',
        metaKeywords: vendorData.metaKeywords || '',
        ...(vendorData.seoSocialSettingsJson || {}),
      });
    }
  }, [vendorData]);

  const handleChange = (field, value) => {
    setSeoInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const socialFields = ['facebookUrl', 'instagramUrl', 'tiktokUrl', 'youtubeUrl', 'twitterUrl'];

    socialFields.forEach((field) => {
      const val = seoInfo[field]?.trim();
      if (val && !URL_REGEX.test(val)) {
        newErrors[field] = 'Please enter a valid URL (e.g. https://instagram.com/yourstore)';
      }
    });

    if (seoInfo.metaTitle.length > 70) {
      newErrors.metaTitle = 'Meta title should ideally be under 70 characters.';
    }

    if (seoInfo.metaDescription.length > 160) {
      newErrors.metaDescription = 'Meta description should ideally be under 160 characters.';
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
    try {
      const { error } = await updateStoreSettings({
        seoSocialSettingsJson: seoInfo,
        metaTitle: seoInfo.metaTitle,
        metaDescription: seoInfo.metaDescription,
      });

      if (error) {
        notify('Failed to save SEO & Social settings.', 'error');
      } else {
        notify('SEO & Social Media links updated successfully!');
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
        <p className="text-xs font-medium text-slate-500">Loading SEO settings...</p>
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SEO & Social Media</h1>
          <p className="text-xs text-slate-500 mt-1">Optimize your store's search engine ranking and social channel visibility.</p>
        </div>
        <button
          form="seo-form"
          type="submit"
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-md cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save SEO Settings
        </button>
      </div>

      <form id="seo-form" onSubmit={handleSubmit} className="space-y-6">
        
        {/* Google Search Preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Search className="w-5 h-5 text-blue-600" />
            <h2>Google Search SERP Preview</h2>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 truncate block">
              https://yourdomain.com/store/{vendorData?.slug || 'your-store'}
            </span>
            <h3 className="text-sm font-medium text-blue-700 hover:underline truncate cursor-pointer">
              {seoInfo.metaTitle || vendorData?.storeName || 'Store Meta Title Preview'}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2">
              {seoInfo.metaDescription || 'Add a store description to preview how your brand appears on Google search results.'}
            </p>
          </div>
        </div>

        {/* Search Engine Metadata */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2>Search Engine Metadata</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Title</label>
                <span className={`text-[11px] ${seoInfo.metaTitle.length > 70 ? 'text-red-500' : 'text-slate-400'}`}>
                  {seoInfo.metaTitle.length}/70
                </span>
              </div>
              <input
                type="text"
                value={seoInfo.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                placeholder="e.g. Premium Electronics & Gadgets | MyStore Pakistan"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.metaTitle ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'}`}
              />
              {errors.metaTitle && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.metaTitle}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Description</label>
                <span className={`text-[11px] ${seoInfo.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                  {seoInfo.metaDescription.length}/160
                </span>
              </div>
              <textarea
                rows={3}
                value={seoInfo.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                placeholder="Describe your store offerings for search engine visitors..."
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.metaDescription ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'}`}
              />
              {errors.metaDescription && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.metaDescription}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Keywords (Comma Separated)</label>
              <input
                type="text"
                value={seoInfo.metaKeywords}
                onChange={(e) => handleChange('metaKeywords', e.target.value)}
                placeholder="electronics, mobile accessories, fashion, online shopping"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-4">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h2>Social Media Profiles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <InstagramIcon className="w-4 h-4 text-pink-600" /> Instagram Profile URL
              </label>
              <input
                type="url"
                value={seoInfo.instagramUrl}
                onChange={(e) => handleChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.instagramUrl ? 'border-red-500' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'}`}
              />
              {errors.instagramUrl && <p className="text-[11px] text-red-500 mt-1">{errors.instagramUrl}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FacebookIcon className="w-4 h-4 text-blue-600" /> Facebook Page URL
              </label>
              <input
                type="url"
                value={seoInfo.facebookUrl}
                onChange={(e) => handleChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.facebookUrl ? 'border-red-500' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'}`}
              />
              {errors.facebookUrl && <p className="text-[11px] text-red-500 mt-1">{errors.facebookUrl}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <TikTokIcon className="w-4 h-4 text-slate-900" /> TikTok Profile URL
              </label>
              <input
                type="url"
                value={seoInfo.tiktokUrl}
                onChange={(e) => handleChange('tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@yourhandle"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.tiktokUrl ? 'border-red-500' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'}`}
              />
              {errors.tiktokUrl && <p className="text-[11px] text-red-500 mt-1">{errors.tiktokUrl}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <YoutubeIcon className="w-4 h-4 text-red-600" /> YouTube Channel URL
              </label>
              <input
                type="url"
                value={seoInfo.youtubeUrl}
                onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className={`w-full px-3.5 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 ${errors.youtubeUrl ? 'border-red-500' : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'}`}
              />
              {errors.youtubeUrl && <p className="text-[11px] text-red-500 mt-1">{errors.youtubeUrl}</p>}
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
            Save SEO Settings
          </button>
        </div>
      </form>
    </div>
  );
}