'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Menu, User, Server, Settings, Tag } from 'lucide-react';

const BASE_NAV_LINKS = [
  { label: 'Home', href: '/', exact: true },
  { label: 'Dashboard', href: '/profile' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function SubNav() {
  const pathname = usePathname();
  const { user, role } = useUser();

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

  // Check if logged-in user is Super Admin
  const isSuperAdmin = role === 'superadmin';
  const userEmail = user?.email || '';

  // Screenshot ke mutabiq CPanel tab dynamic list me add hoga
  const navLinks = [
    ...BASE_NAV_LINKS,
    ...(isSuperAdmin ? [{ label: 'CPanel', href: '/cpanel' }] : []),
  ];

  return (
    <div className="bg-slate-800 text-white p-2 flex items-center justify-between px-3 sm:px-4 text-sm gap-2 sm:gap-4">
      
      {/* 1. Info Flyout Menu */}
      <div className="relative shrink-0" ref={infoRef}>
        <button
          type="button"
          onClick={() => setIsInfoOpen((prev) => !prev)}
          className="flex items-center gap-1.5 font-bold border border-transparent hover:border-white px-2 py-1 rounded-sm whitespace-nowrap"
        >
          <Menu className="w-4 h-4" /> Info
        </button>

        {isInfoOpen && (
          <div className="absolute top-full left-0 bg-white text-black w-64 shadow-2xl z-[100] mt-1 border border-purple-200 rounded-b overflow-hidden">
            <div className="bg-purple-900 text-white p-4 flex items-center gap-3">
              <img
                src="https://placehold.co/40x40/f3e8ff/7e22ce?text=U"
                className="rounded-full border border-white w-10 h-10"
                alt="User avatar"
              />
              <div className="overflow-hidden">
                <span className="font-bold block text-sm truncate">
                  {userEmail ? userEmail.split('@')[0] : 'Hello, Guest'}
                </span>
                {isSuperAdmin && (
                  <span className="inline-block text-[9px] bg-purple-700 text-purple-100 font-bold px-1.5 py-0.5 rounded border border-purple-500 uppercase tracking-wider">
                    Super Admin
                  </span>
                )}
              </div>
            </div>

            <ul className="py-2 text-sm text-gray-800">
              <li>
                <Link
                  href="/profile"
                  onClick={() => setIsInfoOpen(false)}
                  className="px-4 py-2 hover:bg-purple-50 flex items-center gap-3"
                >
                  <User className="w-4 h-4 text-gray-600" /> Profile | Accounts
                </Link>
              </li>

              {isSuperAdmin && (
                <li>
                  <Link
                    href="/cpanel"
                    onClick={() => setIsInfoOpen(false)}
                    className="px-4 py-2 hover:bg-purple-50 flex items-center gap-3 font-semibold text-purple-900 bg-purple-50/60"
                  >
                    <Server className="w-4 h-4 text-purple-700" /> CPanel
                  </Link>
                </li>
              )}

              <li className="px-4 py-2 hover:bg-purple-50 flex items-center gap-3">
                <Settings className="w-4 h-4 text-gray-600" /> Helps &amp; Settings
              </li>
              <li className="px-4 py-2 hover:bg-purple-50 flex items-center gap-3 border-t">
                <Tag className="w-4 h-4 text-gray-600" /> Customer
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 2. Primary Horizontal Nav Links */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide min-w-0 flex-1">
        {navLinks.map((link) => {
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