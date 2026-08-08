'use client';

import React, { useState } from 'react';
import { 
  PieChart, 
  Image as ImageIcon, 
  Tag, 
  Search, 
  Copy, 
  Check, 
  Code, 
  X 
} from 'lucide-react';

export default function MarketingCampaignsPage() {
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'banners' | 'coupons'
  const [copiedId, setCopiedId] = useState(null);
  const [embedModal, setEmbedModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const campaignStats = [
    { subId: 'instagram_bio', clicks: 4210, sales: 184, conversionRate: '4.37%', totalRevenue: '$3,680.00', commission: '$368.00' },
    { subId: 'youtube_review_vlog', clicks: 3100, sales: 142, conversionRate: '4.58%', totalRevenue: '$2,840.00', commission: '$284.00' },
    { subId: 'facebook_group_ads', clicks: 1890, sales: 52, conversionRate: '2.75%', totalRevenue: '$1,040.00', commission: '$104.00' },
    { subId: 'newsletter_july', clicks: 950, sales: 48, conversionRate: '5.05%', totalRevenue: '$960.00', commission: '$96.00' },
    { subId: 'twitter_thread', clicks: 640, sales: 12, conversionRate: '1.87%', totalRevenue: '$240.00', commission: '$24.00' },
  ];

  const banners = [
    {
      id: 'banner-1',
      title: 'Summer Sale Display Banner (728x90)',
      size: '728 x 90 Leaderboard',
      category: 'Display Ad',
      imageUrl: 'https://placehold.co/728x90/6366f1/ffffff?text=Summer+Sale+-+Get+20%+Off',
      targetUrl: 'https://yourstore.com/summer-sale?ref=aff_user123&subid=banner_728x90',
    },
    {
      id: 'banner-2',
      title: 'Headphones Special Promo (300x250)',
      size: '300 x 250 Medium Rectangle',
      category: 'Sidebar Ad',
      imageUrl: 'https://placehold.co/300x250/090d16/ffffff?text=Wireless+Headphones+Deal',
      targetUrl: 'https://yourstore.com/products/prod-1?ref=aff_user123&subid=banner_300x250',
    },
    {
      id: 'banner-3',
      title: 'Instagram / Facebook Story Asset (1080x1920)',
      size: '1080 x 1920 Story Format',
      category: 'Social Media',
      imageUrl: 'https://placehold.co/300x533/10b981/ffffff?text=Exclusive+Affiliate+Offer',
      targetUrl: 'https://yourstore.com?ref=aff_user123&subid=social_story',
    },
  ];

  const coupons = [
    { code: 'AFFILIATE10', discount: '10% OFF', description: 'Applicable site-wide on all products.', usageCount: '142 times used' },
    { code: 'VIPAUDIO20', discount: '20% OFF', description: 'Valid on Audio & Headphones category only.', usageCount: '89 times used' },
  ];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCampaigns = campaignStats.filter((c) =>
    c.subId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketing Assets & SubID Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track campaign traffic sources, grab promotional banners, and share exclusive discount codes.
        </p>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'campaigns'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <PieChart className="w-4 h-4" /> SubID Performance
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Banners & Media Kit
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'coupons'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4" /> Assigned Promo Codes
        </button>
      </div>

      {/* TAB 1: SUB-ID CAMPAIGN ANALYTICS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter by SubID name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
              Showing {filteredCampaigns.length} tracking tags
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-400 font-bold border-b border-slate-100 uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-5">Campaign / SubID</th>
                    <th className="py-3.5 px-5">Clicks</th>
                    <th className="py-3.5 px-5">Sales</th>
                    <th className="py-3.5 px-5">Conv. Rate</th>
                    <th className="py-3.5 px-5">Order Revenue</th>
                    <th className="py-3.5 px-5 text-right">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.map((item) => (
                    <tr key={item.subId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 inline-block">
                          {item.subId}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">{item.clicks.toLocaleString()}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-700">{item.sales}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {item.conversionRate}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">{item.totalRevenue}</td>
                      <td className="py-3.5 px-5 font-black text-emerald-600 text-right">{item.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANNERS & MEDIA KIT */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    {b.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{b.size}</span>
                </div>

                <h3 className="text-xs font-bold text-slate-900">{b.title}</h3>

                <div className="bg-slate-100 rounded-xl p-2 border border-slate-200/60 overflow-hidden flex items-center justify-center min-h-[120px]">
                  <img src={b.imageUrl} alt={b.title} className="max-w-full h-auto rounded object-cover" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleCopy(b.targetUrl, `${b.id}-link`)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedId === `${b.id}-link` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} Link
                </button>

                <button
                  onClick={() => setEmbedModal(b)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" /> HTML Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ASSIGNED PROMO CODES */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((coupon) => (
            <div key={coupon.code} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    Active Promo Code
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{coupon.usageCount}</span>
                </div>

                <div className="flex items-center gap-3 my-3">
                  <span className="text-xl font-mono font-black text-slate-900 bg-slate-100 border border-slate-300 border-dashed px-4 py-2 rounded-xl">
                    {coupon.code}
                  </span>
                  <span className="text-sm font-black text-emerald-600">{coupon.discount}</span>
                </div>

                <p className="text-xs text-slate-500">{coupon.description}</p>
              </div>

              <button
                onClick={() => handleCopy(coupon.code, coupon.code)}
                className="w-full bg-slate-900 hover:bg-purple-600 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedId === coupon.code ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Copied Code!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Promo Code
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* EMBED CODE MODAL */}
      {embedModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Banner HTML Embed Code</h3>
              <button onClick={() => setEmbedModal(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Copy and paste this snippet directly into your website's HTML code:
            </p>
            <textarea
              readOnly
              rows={4}
              value={`<a href="${embedModal.targetUrl}" target="_blank" rel="noopener noreferrer">\n  <img src="${embedModal.imageUrl}" alt="${embedModal.title}" />\n</a>`}
              className="w-full text-xs font-mono bg-slate-900 text-slate-100 p-3.5 rounded-xl border border-slate-800 focus:outline-none selection:bg-purple-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEmbedModal(null)}
                className="bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleCopy(`<a href="${embedModal.targetUrl}" target="_blank" rel="noopener noreferrer"><img src="${embedModal.imageUrl}" alt="${embedModal.title}" /></a>`, 'embed-code')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {copiedId === 'embed-code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}