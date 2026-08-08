'use client';

import React, { useState } from 'react';
import { Star, MessageCircle, Search, CheckCircle2, CornerDownRight } from 'lucide-react';

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const reviews = [
    {
      id: 'REV-001',
      customer: 'Amara K.',
      product: 'Rose Glow Facial Serum',
      rating: 5,
      date: '2026-07-28',
      comment: 'Absolutely love this serum! My skin feels so hydrated and looks radiant. Will definitely buy again.',
      status: 'Responded',
      reply: 'Thank you so much Amara! We are thrilled to hear you love the results.'
    },
    {
      id: 'REV-002',
      customer: 'Elena R.',
      product: 'Hydrating Toner x1',
      rating: 4,
      date: '2026-07-26',
      comment: 'Great toner, very refreshing. Delivery was a bit slow though.',
      status: 'Pending',
      reply: ''
    },
    {
      id: 'REV-003',
      customer: 'Yusuf T.',
      product: 'Vitamin C Day Cream',
      rating: 5,
      date: '2026-07-25',
      comment: 'Perfect for my morning routine. Smells amazing and absorbs quickly.',
      status: 'Pending',
      reply: ''
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">Manage feedback, ratings, and respond to your customers.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
        </div>
        <select className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900">
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="Pending">Pending Reply</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{review.customer}</h3>
                <p className="text-[11px] text-slate-400 font-medium">on <span className="text-slate-600 font-semibold">{review.product}</span> • {review.date}</p>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed mb-4">"{review.comment}"</p>
            
            {review.status === 'Responded' ? (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-2 items-start mt-2">
                <CornerDownRight className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Reply</p>
                  <p className="text-xs text-slate-700 font-medium">{review.reply}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" /> Reply to Review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}