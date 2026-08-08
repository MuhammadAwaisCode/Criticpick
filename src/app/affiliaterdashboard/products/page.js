'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  X, 
  Link as LinkIcon, 
  DollarSign, 
  Percent, 
  Tag, 
  TrendingUp,
  Headphones,
  Monitor,
  Package,
  ShoppingBag,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ProductDiscoveryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [subId, setSubId] = useState('');
  const [copied, setCopied] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (activeModalProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModalProduct]);

  // Products Data
  const products = [
    {
      id: 'prod-1',
      title: 'Wireless Noise-Canceling Headphones',
      category: 'Electronics',
      price: 199.00,
      commissionRate: 10,
      icon: Headphones,
      salesCount: '1.2k+ Sales',
    },
    {
      id: 'prod-2',
      title: 'Ergonomic Leather Chair',
      category: 'Furniture',
      price: 350.00,
      commissionRate: 12,
      icon: Package,
      salesCount: '850+ Sales',
    },
    {
      id: 'prod-3',
      title: 'Mechanical Gaming Keyboard',
      category: 'Electronics',
      price: 89.00,
      commissionRate: 8,
      icon: Layers,
      salesCount: '3.4k+ Sales',
    },
    {
      id: 'prod-4',
      title: 'Stainless Steel Water Bottle (1L)',
      category: 'Lifestyle',
      price: 25.00,
      commissionRate: 15,
      icon: ShoppingBag,
      salesCount: '5k+ Sales',
    },
    {
      id: 'prod-5',
      title: 'Ultra-Wide Monitor 34"',
      category: 'Electronics',
      price: 520.00,
      commissionRate: 7,
      icon: Monitor,
      salesCount: '420+ Sales',
    },
    {
      id: 'prod-6',
      title: 'Minimalist Travel Backpack',
      category: 'Lifestyle',
      price: 65.00,
      commissionRate: 12,
      icon: ShoppingBag,
      salesCount: '2.1k+ Sales',
    },
  ];

  // Filter Logic
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dynamic Link Generator
  const getGeneratedLink = (productId) => {
    const affiliateId = 'aff_user123';
    let url = `https://yourstore.com/products/${productId}?ref=${affiliateId}`;
    if (subId.trim()) {
      url += `&subid=${encodeURIComponent(subId.trim())}`;
    }
    return url;
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog & Affiliate Generator</h1>
        <p className="text-xs text-slate-500 mt-1">
          Discover high-converting products, analyze yields, and craft custom referral deep links.
        </p>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Electronics', 'Furniture', 'Lifestyle'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* PRODUCT CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const IconComponent = product.icon;
          const commissionAmount = ((product.price * product.commissionRate) / 100).toFixed(2);

          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
            >
              <div>
                {/* Badge & Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
                    <Tag className="w-3 h-3 text-purple-600" /> {product.category}
                  </span>
                </div>

                {/* Title & Price */}
                <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-black text-slate-900">${product.price.toFixed(2)}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-100">
                    <TrendingUp className="w-3 h-3 text-emerald-600" /> {product.salesCount}
                  </span>
                </div>

                {/* Commission Breakdown */}
                <div className="bg-slate-50/80 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs mb-5 border border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Rate</span>
                    <span className="font-black text-slate-800 flex items-center gap-0.5">
                      <Percent className="w-3 h-3 text-slate-400" /> {product.commissionRate}%
                    </span>
                  </div>
                  <div className="border-l border-slate-200/60 pl-3">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Est. Profit</span>
                    <span className="font-black text-emerald-600 flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> {commissionAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Trigger CTA */}
              <button
                onClick={() => {
                  setActiveModalProduct(product);
                  setSubId('');
                  setCopied(false);
                }}
                className="w-full bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <LinkIcon className="w-4 h-4" /> Generate Referral Link
              </button>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No products found</p>
          <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or category.</p>
        </div>
      )}

      {/* MODAL: LINK GENERATOR */}
      {activeModalProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Custom Tracking Link</h2>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{activeModalProduct.title}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalProduct(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub ID Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Campaign / Sub-ID Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. twitter_bio, july_promo"
                value={subId}
                onChange={(e) => setSubId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-1">Add sub-ids to isolate and measure specific marketing channels.</p>
            </div>

            {/* Generated Link Result */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Generated Deep Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={getGeneratedLink(activeModalProduct.id)}
                  className="w-full text-xs bg-slate-100/80 text-slate-700 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono selection:bg-purple-100"
                />
                <button
                  onClick={() => handleCopy(getGeneratedLink(activeModalProduct.id))}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalProduct(null)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}