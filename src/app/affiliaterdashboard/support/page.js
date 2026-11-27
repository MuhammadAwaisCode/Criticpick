'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  BookOpen, 
  Send, 
  ChevronDown, 
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ subject: '', category: 'general', message: '' });

  // English Translated FAQs
  const faqs = [
    {
      q: 'When and how are commissions paid?',
      a: 'Commissions are processed on the 1st of every month. The minimum payout threshold is $50. Payments are disbursed via Bank Transfer or PayPal.'
    },
    {
      q: 'How does SubID tracking work?',
      a: 'You can create custom SubIDs from the Marketing page to track performance across different traffic sources such as Instagram, YouTube, or Email Newsletters.'
    },
    {
      q: 'What is the cookie duration?',
      a: 'Our affiliate links come with a 30-day cookie duration. If a user completes a purchase within 30 days of clicking your link, the commission will be credited to your account.'
    },
    {
      q: 'How are sales tracked via promo codes?',
      a: 'When a customer uses your assigned promo code at checkout, the sale is automatically credited to your account even if no tracking cookie is present.'
    }
  ];

  // Async Submission Handler (Database Connection Point)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Connect your Database / API / Server Action here:
      // const res = await fetch('/api/support', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      // Temporary delay simulation
      await new Promise((resolve) => setTimeout(resolve, 800));

      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-reset state
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setFormData({ subject: '', category: 'general', message: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 py-6 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-xs text-slate-500 mt-1">
          Have questions or need assistance? We are here to help you maximize your earnings.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a 
          href="#docs" 
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 hover:border-purple-300 hover:shadow-sm transition-all group cursor-pointer block"
        >
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Affiliate Guide</h3>
          <p className="text-xs text-slate-500">Read our documentation to learn best promotional strategies.</p>
        </a>

        <a 
          href="#chat" 
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 hover:border-emerald-300 hover:shadow-sm transition-all group cursor-pointer block"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Live Manager Chat</h3>
          <p className="text-xs text-slate-500">Dedicated affiliate managers available Mon-Fri (9am - 6pm).</p>
        </a>

        <a 
          href="#support-form" 
          className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2 hover:border-blue-300 hover:shadow-sm transition-all group cursor-pointer block"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Email Support</h3>
          <p className="text-xs text-slate-500">Send us a direct ticket and get a response within 24 hours.</p>
        </a>
      </div>

      {/* FAQ & Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600" /> Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 text-xs font-bold text-slate-800 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <div id="support-form" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-900">Send Support Ticket</h2>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-2 animate-in fade-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-xs font-bold text-emerald-900">Ticket Submitted!</h3>
              <p className="text-[11px] text-emerald-700">
                Your ticket has been submitted successfully. Our support team will reach out to you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label htmlFor="category" className="block font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select 
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white font-medium text-slate-800 transition-all cursor-pointer"
                >
                  <option value="general">General Inquiry</option>
                  <option value="payouts">Payout / Commission Issue</option>
                  <option value="tracking">Tracking / SubID Question</option>
                  <option value="technical">Technical Bug</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <input 
                  id="subject"
                  type="text" 
                  required
                  placeholder="e.g. Question regarding July Payout"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-semibold text-slate-700 mb-1">
                  Message
                </label>
                <textarea 
                  id="message"
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 focus:bg-white text-slate-800 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Submit Ticket
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}