'use client';

import { useState } from 'react';
// Dono missing components ko import kiya gaya hai
import TopNav from '../../src/components/TopNav';
import SubNav from '../../src/components/SubNav';

// ---------------------------------------------------------------------------
// Static contact info — mirrors the "Get In Touch" panel from Contactus.html.
// ---------------------------------------------------------------------------
const CONTACT_DETAILS = [
  {
    icon: 'fa-map-marker-alt',
    label: 'Corporate HQ',
    value: 'Street 4, Sector G, Islamabad, Pakistan',
  },
  {
    icon: 'fa-phone-alt',
    label: 'Helpline Support Desk',
    value: '+92 300 1234567',
  },
  {
    icon: 'fa-envelope',
    label: 'Official Inquiries',
    value: 'support@criticpick.com',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = { name: '', email: '', subject: '', message: '' };

export default function ContactPage() {
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleFieldChange(field, value) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function validate() {
    const nextErrors = {};
    if (!formValues.name.trim()) nextErrors.name = 'Please enter your name';
    if (!EMAIL_REGEX.test(formValues.email.trim())) nextErrors.email = 'Enter a valid email address';
    if (!formValues.subject.trim()) nextErrors.subject = 'Please add a subject';
    if (!formValues.message.trim()) nextErrors.message = 'Please write a message';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitted(false);
    if (!validate()) return;

    setIsSubmitting(true);
    // TODO: replace with a real POST /api/contact call once the backend is
    // wired up.
    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormValues(INITIAL_FORM);
    }, 700);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* NOTE: Navbars aur Footer layout.js se automatic aa rahe hain.
        Aap ke original elements ko bina chede comment kar diya hai 
        taake page par duplicate double items show na hon.
      */}
      {/* <TopNav /> */}
      {/* <SubNav /> */}

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* ===============================================================
              CONTACT INFO PANEL
          =============================================================== */}
          <section className="bg-white/85 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 lg:col-span-2 space-y-6 border border-white/40">
            <div>
              <h2 className="text-2xl font-black text-purple-950">Get In Touch</h2>
              <p className="text-xs text-gray-500 mt-1">
                Reach out directly via our verified support desks.
              </p>
            </div>

            <div className="border-t border-purple-100 pt-4 space-y-4">
              {CONTACT_DETAILS.map((detail) => (
                <div key={detail.label} className="flex gap-4 items-start">
                  <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-inner">
                    <i className={`fas ${detail.icon} text-sm`} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      {detail.label}
                    </h4>
                    <p className="text-sm text-gray-700 font-medium mt-0.5">{detail.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-purple-950/5 rounded-xl p-4 border border-purple-200/40 text-center">
              <p className="text-xs text-purple-900 font-bold">
                <i className="fas fa-clock mr-1" /> Standard Operations Matrix
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Monday – Saturday: 09:00 AM – 06:00 PM (PKT)
              </p>
            </div>
          </section>

          {/* ===============================================================
              MESSAGE FORM
          =============================================================== */}
          <section className="bg-white/85 backdrop-blur rounded-2xl shadow-xl overflow-hidden lg:col-span-3 border border-white/40">
            <div className="h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />
            <div className="p-6 md:p-8">
              <h3 className="text-xl font-black text-purple-950 mb-1">Send a Message</h3>
              <p className="text-xs text-gray-500 mb-6">
                Fill the form below and an agent will follow up within 24 hours.
              </p>

              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400">
                      <i className="fas fa-user text-xs" />
                    </span>
                    <input
                      id="contact-name"
                      type="text"
                      value={formValues.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="John Doe"
                      aria-invalid={Boolean(errors.name)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800 ${
                        errors.name ? 'border-red-400 focus:border-red-500' : 'border-purple-200 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  {errors.name && <span className="text-xs text-red-500 block">{errors.name}</span>}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400">
                      <i className="fas fa-envelope text-xs" />
                    </span>
                    <input
                      id="contact-email"
                      type="email"
                      value={formValues.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      placeholder="name@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800 ${
                        errors.email ? 'border-red-400 focus:border-red-500' : 'border-purple-200 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  {errors.email && <span className="text-xs text-red-500 block">{errors.email}</span>}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-subject"
                    className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                  >
                    Subject Topic
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-purple-400">
                      <i className="fas fa-bookmark text-xs" />
                    </span>
                    <input
                      id="contact-subject"
                      type="text"
                      value={formValues.subject}
                      onChange={(e) => handleFieldChange('subject', e.target.value)}
                      placeholder="Order Tracking, Partnership, Dispute Support"
                      aria-invalid={Boolean(errors.subject)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800 ${
                        errors.subject ? 'border-red-400 focus:border-red-500' : 'border-purple-200 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  {errors.subject && <span className="text-xs text-red-500 block">{errors.subject}</span>}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-bold text-purple-900 uppercase tracking-wider block"
                  >
                    Message Body
                  </label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-0 flex items-start pl-3.5 text-purple-400">
                      <i className="fas fa-comment-alt text-xs" />
                    </span>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formValues.message}
                      onChange={(e) => handleFieldChange('message', e.target.value)}
                      placeholder="Explain your request details explicitly..."
                      aria-invalid={Boolean(errors.message)}
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-purple-200 outline-none transition bg-white/60 text-sm font-medium text-gray-800 resize-none ${
                        errors.message ? 'border-red-400 focus:border-red-500' : 'border-purple-200 focus:border-purple-500'
                      }`}
                    />
                  </div>
                  {errors.message && <span className="text-xs text-red-500 block">{errors.message}</span>}
                </div>

                {isSubmitted && (
                  <p className="text-xs font-bold text-green-600 flex items-center gap-1.5">
                    <i className="fas fa-circle-check" /> Message dispatched — an agent will follow up within 24 hours.
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg shadow-purple-600/20 hover:opacity-90 active:scale-95 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin" /> Dispatching…
                      </>
                    ) : (
                      <>
                        Dispatch Message <i className="fas fa-paper-plane ml-1 text-xs" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}