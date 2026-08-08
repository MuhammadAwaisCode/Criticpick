'use client';

import Link from 'next/link';
import { BsWhatsapp, BsLinkedin, BsFacebook, BsInstagram, BsTwitterX } from "react-icons/bs";

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/critic-pick-88a074284?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    Icon: BsLinkedin,
    external: true,
  },
  {
    label: 'Whatsapp',
    href: 'https://wa.me/+15595712010',
    Icon: BsWhatsapp,
    external: true,
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1D4c3j9QcW/',
    Icon: BsFacebook,
    external: true,
  },
  {
    label: 'Twitter',
    href: 'https://x.com/criticpickmarkt',
    Icon: BsTwitterX,
    external: true,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/critic_solutions?igsh=a2NleTA0YTI0MjFp',
    Icon: BsInstagram,
    external: true,
  },
];

const FOOTER_COLUMNS = [
  {
    title: 'Get to Know Us',
    links: [
      { label: 'About Criticpick', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press Releases', href: '/press' },
      { label: 'Criticpick Cares', href: '/about-us#social-impact' },
    ],
  },
  {
    title: 'Make Money with Us',
    links: [
      { label: 'Sell on Criticpick', href: '/signup/vendor' },
      { label: 'Become an Affiliate', href: '/signup/affiliater' },
      { label: 'Advertise Your Products', href: '/advertise' },
      { label: 'Sea Panel', href: '/seapanel' },
    ],
  },
  {
    title: 'Let Us Help You',
    links: [
      { label: 'Your Account', href: '/profile' },
      { label: 'Your Orders', href: '/profile#orders' },
      { label: 'Returns Centre', href: '/returns' },
      { label: 'Shipping Rates & Policies', href: '/shipping-policy' },
      { label: 'Help Centre', href: '/contact' },
    ],
  },
  {
    title: 'Connect with Us',
    links: SOCIALS,
  },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Cookie Preferences', href: '/cookie-preferences' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="bg-slate-900 text-white mt-auto">
      {/* -------------------------------------------------------------
          Back to top strip
      ------------------------------------------------------------- */}
      <button
        type="button"
        onClick={scrollToTop}
        className="w-full bg-slate-800 hover:bg-slate-700 transition-colors py-3 text-sm font-semibold text-center cursor-pointer"
      >
        Back to top
      </button>

      {/* -------------------------------------------------------------
          Link columns
      ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-bold uppercase tracking-wide mb-4 text-white">
              {column.title}
            </h3>
            <ul className="space-y-2">
              {column.links.map((link) => {
                const IconComponent = link.Icon;
                return link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                      {IconComponent && <IconComponent className="text-sm shrink-0" />}
                      <span>{link.label}</span>
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                    >
                      {IconComponent && <IconComponent className="text-sm shrink-0" />}
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10" />

      {/* -------------------------------------------------------------
          Brand strip: logo, language/region, payment badges
      ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/" className="text-xl font-bold italic">
            Criticpick
          </Link>
          <p className="text-xs text-gray-500 max-w-xs text-center md:text-left">
            Shop smarter with a marketplace built around honest, verified reviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="flex items-center gap-2 text-xs border border-white/20 rounded px-3 py-1.5 cursor-pointer hover:border-white transition-colors">
            <img src="https://flagcdn.com/w20/pk.png" width="16" alt="Pakistan" />
            English - PKR
          </span>
          <span className="flex items-center gap-2 text-xs border border-white/20 rounded px-3 py-1.5">
            <i className="fas fa-credit-card" /> Secure Payments
          </span>
          <span className="flex items-center gap-2 text-xs border border-white/20 rounded px-3 py-1.5">
            <i className="fas fa-truck-fast" /> Nationwide Delivery
          </span>
        </div>
      </div>

      <div className="border-t border-white/10" />

      {/* -------------------------------------------------------------
          Bottom bar: copyright + legal
      ------------------------------------------------------------- */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-500 text-center md:text-left">
          &copy; {year} Criticpick. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-5">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-gray-500 hover:text-purple-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}