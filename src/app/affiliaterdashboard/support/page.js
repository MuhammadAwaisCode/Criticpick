'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Mail, 
  BookOpen, 
  Send, 
  ChevronDown, 
  CheckCircle2 
} from 'lucide-react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ subject: '', category: 'general', message: '' });

  const faqs = [
    {
      q: 'Commissions kab aur kaise pay hote hain?',
      a: 'Commissions har maah ki 1st ko process hote hain. Aapka minimum balance $50 hona chahiye. Payment Bank Transfer ya PayPal ke zariye milti hai.'
    },
    {
      q: 'SubID tracking kaise kaam karti hai?',
      a: 'Aap Marketing page se custom SubIDs create kar sakte hain taake aap alag-alag traffic sources (jaise Instagram, YouTube, Newsletter) ki performance track kar sakein.'
    },
    {
      q: 'Cookie duration kitni hoti hai?',
      a: 'Humari affiliate links ki cookie duration 30-days hoti hai. Agar user link click karne ke 30 din ke andar khareedari kare, toh commission aapko milega.'
    },
    {
      q: 'Discount codes ke zariye sales kaise track hoti hain?',
      a: 'Jab koi customer aapka assigned promo code checkout par use karta hai, toh sale automatically aapke account me credit ho jaati hai, chahe cookie na bhi ho.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ subject: '', category: 'general', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Help & Support</h1>
        <p className="text-xs text-slate-500 mt-1">
          Have questions or need assistance? We are here to help you maximize your earnings.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Affiliate Guide</h3>
          <p className="text-xs text-slate-500">Read our documentation to learn best promotional strategies.</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Live Manager Chat</h3>
          <p className="text-xs text-slate-500">Dedicated affiliate managers available Mon-Fri (9am - 6pm).</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Email Support</h3>
          <p className="text-xs text-slate-500">Send us a direct ticket and get a response within 24 hours.</p>
        </div>
      </div>

      {/* FAQ & Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-600" /> Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full text-left p-4 text-xs font-bold text-slate-800 flex items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="p-4 pt-0 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 h-fit">
          <h2 className="text-base font-bold text-slate-900">Send Support Ticket</h2>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-xs font-bold text-emerald-900">Ticket Submitted!</h3>
              <p className="text-[11px] text-emerald-700">Aapka ticket submit ho chuka hai. Humari team jald aapse rabta karegi.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 font-medium text-slate-800"
                >
                  <option value="general">General Inquiry</option>
                  <option value="payouts">Payout / Commission Issue</option>
                  <option value="tracking">Tracking / SubID Question</option>
                  <option value="technical">Technical Bug</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Question regarding July Payout"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-purple-600 text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Submit Ticket
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}