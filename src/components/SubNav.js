'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Primary secondary-bar navigation. `href` is matched (with prefix support
// for nested routes) against the current pathname to drive active styling.
const NAV_LINKS = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Dashboard', href: '/profile' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Sea Panel', href: '/seapanel' },
];

export default function SubNav() {
  const pathname = usePathname();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const infoRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (infoRef.current && !infoRef.current.contains(event.target)) {
        setIsInfoOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function isLinkActive(link) {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }

  return (
    <div className="bg-slate-800 text-white p-2 flex items-center justify-between px-3 sm:px-4 text-sm gap-2 sm:gap-4">
      {/* -------------------------------------------------------------
          Info flyout: Anchored locally using absolute positioning
          so it moves dynamically with the navbar when scrolling.
      ------------------------------------------------------------- */}
      <div className="relative shrink-0" ref={infoRef}>
        <button
          type="button"
          onClick={() => setIsInfoOpen((prev) => !prev)}
          className="flex items-center gap-1 font-bold border border-transparent hover:border-white px-2 py-1 rounded-sm whitespace-nowrap"
          aria-haspopup="true"
          aria-expanded={isInfoOpen}
        >
          <i className="fas fa-bars" /> Info
        </button>

        {isInfoOpen && (
          <div className="absolute top-full left-0 bg-white text-black w-64 max-w-[calc(100vw-1.5rem)] shadow-2xl z-[100] mt-1 border border-purple-200 rounded-b overflow-hidden">
            <div className="bg-purple-900 text-white p-4 flex items-center gap-3">
              <img
                src="https://placehold.co/40x40/f3e8ff/7e22ce?text=U"
                className="rounded-full border border-white"
                alt="User avatar"
              />
              <span className="font-bold">Hello, Sign in</span>
            </div>
            <ul className="py-2 text-sm">
              <li>
                <Link
                  href="/profile"
                  onClick={() => setIsInfoOpen(false)}
                  className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-3"
                >
                  <i className="fas fa-user-circle" /> Profile | Accounts
                </Link>
              </li>
              <li>
                <Link
                  href="/seapanel"
                  onClick={() => setIsInfoOpen(false)}
                  className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-3"
                >
                  <i className="fas fa-chart-line" /> SeaPanel
                </Link>
              </li>
              <li className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-3">
                <i className="fas fa-cog" /> Helps &amp; Settings
              </li>
              <li className="px-4 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-3 border-t">
                <i className="fas fa-user-tag" /> Customer
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Primary link set with active-route highlighting.
      ------------------------------------------------------------- */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide min-w-0 flex-1">
        {NAV_LINKS.map((link) => {
          const active = isLinkActive(link);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`shrink-0 whitespace-nowrap px-2 py-1 rounded-sm border transition-colors ${
                active
                  ? 'border-white bg-white/10 font-bold text-white'
                  : 'border-transparent hover:border-white text-gray-200'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}