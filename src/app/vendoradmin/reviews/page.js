'use client';

import React, { useState, useEffect } from 'react';
import { 
  Star, MessageCircle, Search, CornerDownRight, Loader2, 
  CheckCircle2, EyeOff, Eye, ChevronLeft, ChevronRight, X, Send, Award, MessageSquare 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('All'); // 'All' | '5' | '4' | '3' | '2' | '1' | 'Pending'

  // Modal & Reply States
  const [replyModalReview, setReplyModalReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // 1. Fetch Reviews Data from Supabase
  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*', { count: 'exact' });

      // Apply Search Filter (Customer Name, Product Name, or Comment)
      if (searchTerm.trim() !== '') {
        const q = `%${searchTerm.trim()}%`;
        query = query.or(`customer_name.ilike.${q},product_name.ilike.${q},comment.ilike.${q}`);
      }

      // Apply Rating / Status Filters
      if (filterRating === 'Pending') {
        query = query.eq('status', 'Pending');
      } else if (filterRating !== 'All') {
        query = query.eq('rating', Number(filterRating));
      }

      // Pagination Range
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setReviews(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching reviews:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, searchTerm, filterRating]);

  // 2. Submit Reply to Database
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyModalReview || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          reply: replyText.trim(),
          status: 'Responded',
          updated_at: new Date().toISOString()
        })
        .eq('id', replyModalReview.id);

      if (error) throw error;

      // Optimistic Local State Update
      setReviews((prev) =>
        prev.map((r) =>
          r.id === replyModalReview.id ? { ...r, reply: replyText.trim(), status: 'Responded' } : r
        )
      );

      setReplyModalReview(null);
      setReplyText('');
    } catch (err) {
      console.error('Failed to submit reply:', err.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // 3. Moderation Action (Hide / Publish Review)
  const handleToggleHide = async (review) => {
    const newStatus = review.status === 'Hidden' ? 'Pending' : 'Hidden';
    
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r))
    );

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', review.id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update status:', err.message);
      fetchReviews();
    }
  };

  // Metrics calculation
  const totalReviewsCount = totalCount;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';
  const pendingCount = reviews.filter((r) => r.status === 'Pending').length;
  const respondedCount = reviews.filter((r) => r.status === 'Responded').length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Reviews</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage product feedback, moderate customer ratings, and write direct responses.
          </p>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400">Average Rating</span>
            <div className="text-lg font-black text-slate-900">{avgRating} / 5.0</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400">Total Feedback</span>
            <div className="text-lg font-black text-slate-900">{totalReviewsCount} Reviews</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400">Pending Responses</span>
            <div className="text-lg font-black text-slate-900">{pendingCount} Waiting</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product, customer name, or comment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
        </div>

        <select
          value={filterRating}
          onChange={(e) => {
            setFilterRating(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
        >
          <option value="All">All Filter Ratings</option>
          <option value="Pending">Pending Reply</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* Reviews List Component */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold">Loading Customer Reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-semibold">
            No customer reviews found matching your search or rating filters.
          </div>
        ) : (
          reviews.map((review) => {
            const isHidden = review.status === 'Hidden';

            return (
              <div
                key={review.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                  isHidden ? 'opacity-60 border-dashed border-slate-300' : 'border-slate-200 hover:shadow-sm'
                }`}
              >
                {/* Review Item Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{review.customer_name}</h3>
                      {review.status === 'Responded' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Responded
                        </span>
                      )}
                      {isHidden && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                          Hidden from Storefront
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      on <span className="text-slate-700 font-bold">{review.product_name}</span> •{' '}
                      {new Date(review.created_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Rating Star Render */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Body */}
                <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">"{review.comment}"</p>

                {/* Existing Reply Section */}
                {review.reply ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-2 items-start mt-2">
                    <CornerDownRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Your Official Reply</p>
                        <button
                          onClick={() => {
                            setReplyModalReview(review);
                            setReplyText(review.reply);
                          }}
                          className="text-[10px] text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          Edit Reply
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">{review.reply}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleHide(review)}
                      className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {isHidden ? 'Publish on Storefront' : 'Hide from Storefront'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplyModalReview(review);
                        setReplyText('');
                      }}
                      className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Reply to Review
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-500">
          <span>
            Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} total reviews)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 💬 REPLY FORM MODAL */}
      {replyModalReview && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSendReply} className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Reply to Customer Feedback</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Replying to: <span className="text-slate-800 font-bold">{replyModalReview.customer_name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyModalReview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
              <span className="font-bold text-slate-800 block mb-1">Customer Review:</span>
              "{replyModalReview.comment}"
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Vendor Public Response</label>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a polite response to your customer..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplyModalReview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingReply}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish Reply
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}