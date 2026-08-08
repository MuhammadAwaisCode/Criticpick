'use client';

import React, { useState } from 'react';
import { 
  Link2, 
  Copy, 
  Check, 
  Plus, 
  ExternalLink,
  Search,
  Globe
} from 'lucide-react';

export default function AffiliateLinksPage() {
  const [targetUrl, setTargetUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for previously generated links
  const [savedLinks, setSavedLinks] = useState([
    {
      id: 'link-1',
      title: 'Summer Collection 2026',
      originalUrl: 'https://yourstore.com/collections/summer',
      affiliateUrl: 'https://yourstore.com/collections/summer?ref=alex_vip',
      clicks: 1245,
      sales: 34,
      date: 'Aug 01, 2026'
    },
    {
      id: 'link-2',
      title: 'Wireless Headphones Pro',
      originalUrl: 'https://yourstore.com/products/headphones-pro',
      affiliateUrl: 'https://yourstore.com/products/headphones-pro?ref=alex_vip',
      clicks: 890,
      sales: 12,
      date: 'Jul 28, 2026'
    },
    {
      id: 'link-3',
      title: 'Home Page Default',
      originalUrl: 'https://yourstore.com',
      affiliateUrl: 'https://yourstore.com?ref=alex_vip',
      clicks: 3420,
      sales: 89,
      date: 'Jan 15, 2026'
    }
  ]);

  const affiliateId = 'alex_vip'; // Yeh backend se aayega (logged-in user ka ID)

  const handleGenerateLink = (e) => {
    e.preventDefault();
    if (!targetUrl) return;

    // Basic URL parsing to add referral parameter safely
    try {
      const url = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      url.searchParams.set('ref', affiliateId);
      const newLink = url.toString();
      
      setGeneratedLink(newLink);
      
      // Add to saved links list (for demo purposes)
      const newSavedLink = {
        id: `link-${Date.now()}`,
        title: 'New Custom Link',
        originalUrl: targetUrl,
        affiliateUrl: newLink,
        clicks: 0,
        sales: 0,
        date: 'Today'
      };
      setSavedLinks([newSavedLink, ...savedLinks]);
      setTargetUrl(''); // Clear input

    } catch (error) {
      alert("Please enter a valid URL");
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = savedLinks.filter(link => 
    link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Affiliate Links</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate custom tracking links for any product or page to start earning commissions.
        </p>
      </div>

      {/* Link Generator Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Create New Link</h2>
            <p className="text-[11px] text-slate-500">Paste any store URL below to get your affiliate version.</p>
          </div>
        </div>

        <form onSubmit={handleGenerateLink} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="e.g. https://yourstore.com/products/shirt"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-all font-medium"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Generate Link
          </button>
        </form>

        {/* Display Generated Link */}
        {generatedLink && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
            <div className="w-full flex-1 min-w-0">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Your Affiliate Link is Ready:</span>
              <p className="text-sm font-mono font-semibold text-emerald-900 truncate mt-0.5">{generatedLink}</p>
            </div>
            <button
              onClick={() => handleCopy(generatedLink, 'new-link')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copiedId === 'new-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} 
              {copiedId === 'new-link' ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>

      {/* Saved Links Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Section Header & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Your Generated Links</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-600 transition-all"
            />
          </div>
        </div>

        {/* Links List */}
        <div className="divide-y divide-slate-100">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <div key={link.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Link Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{link.title}</h4>
                      <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-100 rounded-md">
                        {link.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 truncate transition-colors">
                        {link.originalUrl}
                      </a>
                    </div>
                    {/* Performance Stats */}
                    <div className="flex items-center gap-3 pt-1.5">
                      <span className="text-[11px] font-semibold text-slate-600"><span className="text-purple-600 font-bold">{link.clicks}</span> Clicks</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-[11px] font-semibold text-slate-600"><span className="text-emerald-600 font-bold">{link.sales}</span> Sales</span>
                    </div>
                  </div>

                  {/* Copy Action */}
                  <div className="flex items-center gap-2 shrink-0 md:w-auto w-full">
                    <div className="flex-1 md:flex-none border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-[11px] font-mono text-slate-600 truncate max-w-[200px]">
                      {link.affiliateUrl}
                    </div>
                    <button
                      onClick={() => handleCopy(link.affiliateUrl, link.id)}
                      className={`p-2 rounded-lg transition-all cursor-pointer border ${
                        copiedId === link.id 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                          : 'bg-white border-slate-200 text-slate-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50'
                      }`}
                      title="Copy Affiliate Link"
                    >
                      {copiedId === link.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Link2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700">No links found</p>
              <p className="text-[11px] text-slate-400">Create a new tracking link above or try a different search term.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}