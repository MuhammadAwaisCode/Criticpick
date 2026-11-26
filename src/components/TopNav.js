'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BsCart, 
  BsSearch, 
  BsGeoAlt, 
  BsChevronDown, 
  BsChevronRight, 
  BsMap, 
  BsX, 
  BsBoxArrowRight, 
  BsPerson 
} from 'react-icons/bs';

import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext'; // Path updated for consistency

const CATEGORIES = [
  'Arts & Crafts',
  'Beauty & Personal Care',
  'Health & Household',
  'Cosmetics',
  'Home & Kitchen',
];
const FASHION_SUBCATEGORIES = ['Boys Fashion', 'Girls Fashion', 'Women', "Men's"];

const LANGUAGES = [
  { code: 'EN', label: 'English - EN', flag: 'https://flagcdn.com/w20/gb.png' },
  { code: 'UR', label: 'Urdu - UR', flag: 'https://flagcdn.com/w20/pk.png' },
  { code: 'ES', label: 'Spanish - ES', flag: 'https://flagcdn.com/w20/es.png' },
];

const SIGNIN_ROLES = [
  { label: 'The Vendor', href: '/signin/vendor' },
  { label: 'The Customer', href: '/signin/customer' },
  { label: 'The Affiliater', href: '/signin/affiliater' },
];

export default function TopNav({ isAuthenticated = false, userName = '' }) {
  const { cartCount } = useCart();
  const supabase = createClient();
  const router = useRouter();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Hydration state check (Prevents Next.js SSR mismatch)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navRef = useRef(null);

  // Logout Handler Function
  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      closeAll();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push('/signin/customer');
      router.refresh();
    } catch (err) {
      console.error('Logout Error:', err.message);
    } finally {
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      const hasSeenPopup = sessionStorage.getItem('hasSeenSignInPopup');
      
      if (!hasSeenPopup) {
        setShowSignInPopup(true);
        sessionStorage.setItem('hasSeenSignInPopup', 'true');
        
        const timer = setTimeout(() => {
          setShowSignInPopup(false);
        }, 20000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (openDropdown === 'account') {
      setShowSignInPopup(false);
    }
  }, [openDropdown]);

  const toggleDropdown = (key) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
    setIsSubMenuOpen(false);
  };

  const closeAll = () => {
    setOpenDropdown(null);
    setIsSubMenuOpen(false);
    setShowSignInPopup(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        closeAll();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') closeAll();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    
    closeAll();
    router.push(`/search?${params.toString()}`);
  }

  function handleCategoryPick(category) {
    setSelectedCategory(category);
    closeAll();
    
    const queryParam = searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : '';
    
    switch (category) {
      case 'All':
      case 'Arts & Crafts':
      case 'Beauty & Personal Care':
      case 'Health & Household':
      case 'Cosmetics':
      case 'Home & Kitchen':
      case 'Boys Fashion':
      case 'Girls Fashion':
      case 'Women':
      case "Men's":
        router.push(`/products${queryParam}`);
        break;
      default:
        router.push(`/search${queryParam}`);
    }
  }

  return (
    <nav
      ref={navRef}
      className="bg-slate-900 text-white p-2 flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-4 sticky top-0 z-50"
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center px-1.5 sm:px-2 border border-transparent hover:border-white p-1 cursor-pointer shrink-0"
        onClick={closeAll}
      >
        <span className="text-lg sm:text-xl font-bold italic">Criticpick</span>
      </Link>

      {/* Deliver-to location picker */}
      <div className="hidden md:block relative">
        <button
          type="button"
          onClick={() => toggleDropdown('delivery')}
          className="flex flex-col border border-transparent hover:border-white p-1 cursor-pointer text-left"
        >
          <span className="text-xs text-gray-400">Deliver to</span>
          <span className="text-sm font-bold flex items-center">
            <BsGeoAlt className="mr-1" /> Pakistan
          </span>
        </button>

        {openDropdown === 'delivery' && (
          <div className="absolute top-full left-0 bg-white text-black p-4 rounded shadow-2xl w-64 z-[100] mt-1 border border-gray-200">
            <p className="font-bold text-sm mb-2">Select your live location</p>
            <div className="bg-gray-100 h-24 rounded mb-2 flex items-center justify-center text-gray-400">
              <BsMap className="text-2xl" />
            </div>
            <button
              type="button"
              onClick={closeAll}
              className="w-full bg-purple-600 hover:bg-purple-700 transition text-white py-1 rounded text-xs font-bold"
            >
              Use Precise Location
            </button>
          </div>
        )}
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="order-3 md:order-none w-full md:flex-grow flex h-10 min-w-0"
      >
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => toggleDropdown('category')}
            className="bg-gray-200 hover:bg-gray-300 transition text-gray-700 text-sm h-full px-3 rounded-l border-r border-gray-300 flex items-center gap-1 cursor-pointer"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'category'}
          >
            {selectedCategory}
            <BsChevronDown className="text-xs" />
          </button>

          {openDropdown === 'category' && (
            <ul className="absolute top-full left-0 bg-white text-black py-2 w-56 max-w-[calc(100vw-1.5rem)] shadow-2xl z-[100] border-t-2 border-purple-600">
              <li
                className="px-4 py-2 hover:bg-purple-100 cursor-pointer text-sm"
                onClick={() => handleCategoryPick('All')}
              >
                All Categories
              </li>
              {CATEGORIES.map((category) => (
                <li
                  key={category}
                  className="px-4 py-2 hover:bg-purple-100 cursor-pointer text-sm"
                  onClick={() => handleCategoryPick(category)}
                >
                  {category}
                </li>
              ))}

              <li
                className="px-4 py-2 hover:bg-purple-100 cursor-pointer relative flex justify-between items-center font-bold text-sm"
                onMouseEnter={() => setIsSubMenuOpen(true)}
                onMouseLeave={() => setIsSubMenuOpen(false)}
              >
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsSubMenuOpen((prev) => !prev);
                  }}
                >
                  Category
                </span>
                <BsChevronRight className="text-xs" />

                {isSubMenuOpen && (
                  <ul className="absolute left-full top-0 bg-white w-40 shadow-xl border-l border-purple-200 py-2">
                    {FASHION_SUBCATEGORIES.map((sub) => (
                      <li
                        key={sub}
                        className="px-4 py-2 hover:bg-purple-100 text-xs font-normal"
                        onClick={() => handleCategoryPick(sub)}
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          )}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="flex-grow px-3 text-black outline-none focus:ring-2 focus:ring-purple-500 min-w-0"
          placeholder="Search Criticpick"
          aria-label="Search Criticpick"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-r transition shrink-0 cursor-pointer flex items-center justify-center"
          aria-label="Submit search"
        >
          <BsSearch className="text-[16px]" />
        </button>
      </form>

      {/* Language / Account / Logout / Cart */}
      <div className="order-2 md:order-none flex items-center gap-2 sm:gap-4 shrink-0 ml-auto md:ml-0">
        <div className="relative hidden lg:block">
          <button
            type="button"
            onClick={() => toggleDropdown('lang')}
            className="text-sm font-bold flex items-center gap-1 uppercase border border-transparent hover:border-white p-2 cursor-pointer"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'lang'}
          >
            <img
              src={LANGUAGES.find((lang) => lang.code === selectedLanguage)?.flag}
              width="20"
              alt={selectedLanguage}
            />
            {selectedLanguage}
            <BsChevronDown className="text-xs" />
          </button>

          {openDropdown === 'lang' && (
            <div className="absolute top-full right-0 bg-white text-black py-2 w-40 shadow-xl z-[100] mt-1">
              {LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setOpenDropdown(null);
                  }}
                  className="w-full text-left block px-4 py-1 hover:bg-purple-100 text-xs cursor-pointer"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Account Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('account')}
            className="border border-transparent hover:border-white p-1 cursor-pointer text-left"
            aria-haspopup="true"
            aria-expanded={openDropdown === 'account'}
          >
            <span className="hidden sm:block text-xs text-gray-400">
              {isAuthenticated ? `Hello, ${userName || 'User'}` : 'Hello, sign in'}
            </span>
            <span className="text-xs sm:text-sm font-bold flex items-center gap-1 whitespace-nowrap">
              <span className="hidden sm:inline">Account &amp; Lists</span>
              <span className="sm:hidden">Account</span>
              <BsChevronDown className="text-gray-400 text-xs" />
            </span>
          </button>

          {/* Account Dropdown */}
          {openDropdown === 'account' && (
            <div className="absolute top-full right-0 bg-white text-black p-4 w-60 max-w-[calc(100vw-1.5rem)] shadow-2xl z-[100] mt-1 border-t-4 border-purple-600 rounded-b">
              {isAuthenticated ? (
                <div>
                  <p className="font-bold text-sm mb-3 border-b pb-1 text-purple-900">Your Account</p>
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      onClick={closeAll}
                      className="flex items-center gap-2 text-xs text-gray-700 hover:text-purple-700 transition"
                    >
                      <BsPerson className="text-sm" /> Profile & Orders
                    </Link>
                    
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left flex items-center gap-2 text-xs text-red-600 hover:text-red-800 transition font-semibold pt-2 border-t border-gray-100 cursor-pointer disabled:opacity-50"
                    >
                      <BsBoxArrowRight className="text-sm" />
                      {isLoggingOut ? 'Logging out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-sm mb-3 border-b pb-1">Choose Role to Login</p>
                  <div className="space-y-2">
                    {SIGNIN_ROLES.map((role) => (
                      <Link
                        key={role.href}
                        href={role.href}
                        onClick={closeAll}
                        className="flex items-center gap-2 text-xs text-gray-700 hover:text-purple-700 transition"
                      >
                        <BsChevronRight className="text-[10px]" /> {role.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auto-Appearing Sign In Popup for Unauthenticated Users */}
          {showSignInPopup && !isAuthenticated && (
            <div className="absolute top-full right-0 bg-white text-black p-4 w-[240px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] rounded-md z-[110] mt-2 border border-gray-200 transition-opacity duration-300">
              <div className="absolute -top-[9px] right-6 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[9px] border-b-gray-200">
                <div className="absolute -top-[8px] -left-[8px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white"></div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowSignInPopup(false); }}
                className="absolute top-1 right-2 text-gray-400 hover:text-black cursor-pointer p-1 rounded-sm focus:outline-none"
                aria-label="Close popup"
              >
                <BsX className="text-lg" />
              </button>

              <div className="flex flex-col items-center mt-3">
                <Link
                  href="/signin/customer"
                  onClick={() => setShowSignInPopup(false)}
                  className="w-full bg-gradient-to-b from-[#f7dfa5] to-[#f0c14b] hover:from-[#f5d78e] hover:to-[#eeb222] border border-[#a88734] text-black text-center py-1.5 rounded text-sm font-bold shadow-sm"
                >
                  Sign in
                </Link>
                <p className="text-[11px] mt-2 text-gray-700 font-medium">
                  New customer?{' '}
                  <Link 
                    href="/signup/customer"
                    onClick={() => setShowSignInPopup(false)}
                    className="text-blue-600 hover:text-orange-600 hover:underline"
                  >
                    Start here.
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Standalone Nav Logout / Sign In Button */}
        {isAuthenticated ? (
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm font-bold border border-transparent hover:border-white p-2 cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        ) : (
          <Link
            href="/signin/customer"
            onClick={closeAll}
            className="text-sm font-bold border border-transparent hover:border-white p-2"
          >
            Sign In
          </Link>
        )}

        {/* Cart Link with Hydrated Badge Count */}
        <Link
          href="/cart"
          onClick={closeAll}
          className="relative flex items-center border border-transparent hover:border-white p-2 cursor-pointer"
        >
          <span className="relative">
            <BsCart className="text-xl" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 bg-purple-600 text-white text-[10px] rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </span>
          <span className="ml-2 font-bold uppercase tracking-tight hidden sm:inline">Cart</span>
        </Link>
      </div>
    </nav>
  );
}