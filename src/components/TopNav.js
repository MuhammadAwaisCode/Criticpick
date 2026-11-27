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
  BsX, 
  BsBoxArrowRight, 
  BsPerson,
  BsPlusLg,
  BsDashLg
} from 'react-icons/bs';

import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';

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
  
  // Hydration state check
  const [mounted, setMounted] = useState(false);

  // --- Location State & Handlers ---
  const [location, setLocation] = useState({ 
    city: '', 
    country: 'Pakistan', 
    displayLabel: 'Pakistan',
    lat: null,
    lng: null
  });
  const [isLocOpen, setIsLocOpen] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(15); // Map Zoom Level State
  const locModalRef = useRef(null);

  const navRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-detect location on load / check localStorage
  useEffect(() => {
    const saved = localStorage.getItem('criticpick_user_location');
    if (saved) {
      try { 
        setLocation(JSON.parse(saved)); 
      } catch (e) { 
        fetchIPLocation(); 
      }
    } else {
      fetchIPLocation();
    }
  }, []);

  // Close location modal on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locModalRef.current && !locModalRef.current.contains(e.target)) {
        setIsLocOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to extract detailed Area + City + Country from OpenStreetMap
  const formatDetailedAddress = (address) => {
    const area = 
      address?.suburb || 
      address?.neighbourhood || 
      address?.quarter || 
      address?.residential || 
      address?.road || 
      address?.district || 
      '';

    const city = 
      address?.city || 
      address?.town || 
      address?.village || 
      address?.municipality || 
      address?.county || 
      '';

    const country = address?.country || '';

    const shortLabel = [area, city].filter(Boolean).join(', ') || city || country;
    const fullLabel = [area, city, country].filter(Boolean).join(', ');

    return { area, city, country, shortLabel, fullLabel };
  };

  // IP Location Fetch (Includes Coordinates for Map Embed)
  const fetchIPLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data && data.country_name) {
        const city = data.city || '';
        const region = data.region || '';
        const country = data.country_name;

        const locData = {
          area: region,
          city: city,
          country: country,
          displayLabel: city ? `${city}, ${country}` : country,
          lat: data.latitude || null,
          lng: data.longitude || null,
        };

        setLocation(locData);
        localStorage.setItem('criticpick_user_location', JSON.stringify(locData));
      }
    } catch (err) {
      console.error('IP Geolocation failed:', err);
    }
  };

  // Precise GPS Location Handler (Area + City + Pinpoint Coordinates)
  const handlePreciseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          if (data && data.address) {
            const parsed = formatDetailedAddress(data.address);

            const locData = {
              area: parsed.area,
              city: parsed.city,
              country: parsed.country,
              displayLabel: parsed.shortLabel,
              lat: latitude,
              lng: longitude,
              isPrecise: true,
            };

            setLocation(locData);
            setZoomLevel(16); // Reset zoom to detailed street level on precise lock
            localStorage.setItem('criticpick_user_location', JSON.stringify(locData));
            setIsLocOpen(false);
          }
        } catch (err) {
          alert('Could not resolve GPS location.');
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        setLocLoading(false);
        alert('Location permission denied.');
      }
    );
  };

  // Zoom Handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 1));

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
    setIsLocOpen(false);
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

  // Dynamic Map Embed URL incorporating live zoom state
  const mapEmbedUrl = location.lat && location.lng
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=${zoomLevel}&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(location.displayLabel || location.country)}&z=${zoomLevel}&output=embed`;

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

      {/* Live Location Widget */}
      <div className="relative inline-block" ref={locModalRef}>
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLocOpen(!isLocOpen)}
          className="flex items-center gap-1.5 border border-gray-400 rounded px-2.5 py-1 text-white hover:bg-white/10 transition"
        >
          <BsGeoAlt className="text-white text-sm shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] leading-tight text-gray-300">Deliver to</span>
            <span className="text-xs font-bold leading-tight truncate max-w-[130px]">
              {location.displayLabel || (location.city ? `${location.city}, ${location.country}` : location.country)}
            </span>
          </div>
        </button>

        {/* Live Location Dropdown Modal */}
        {isLocOpen && (
          <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-50 text-black">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-gray-800">Select your live location</h3>
              <button 
                type="button"
                onClick={() => setIsLocOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <BsX className="text-xl" />
              </button>
            </div>

            {/* Live Interactive Google Map with Zoom Controls */}
            <div className="relative w-full h-36 rounded-lg overflow-hidden mb-3 border border-gray-200 bg-gray-100 shadow-inner">
              <iframe
                title="Live Google Map"
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                loading="lazy"
              />

              {/* Overlay Zoom Buttons (+ / -) */}
              <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-white/95 backdrop-blur rounded shadow-md border border-gray-200 p-0.5 z-10">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-bold rounded text-xs transition border-b border-gray-100"
                  title="Zoom In"
                >
                  <BsPlusLg className="text-[10px]" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-bold rounded text-xs transition"
                  title="Zoom Out"
                >
                  <BsDashLg className="text-[10px]" />
                </button>
              </div>
            </div>

            {/* Purple Action Button */}
            <button
              type="button"
              onClick={handlePreciseLocation}
              disabled={locLoading}
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:bg-purple-300 text-white font-semibold text-xs py-2 px-3 rounded transition"
            >
              {locLoading ? 'Detecting Location...' : 'Use Precise Location'}
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
                      <BsPerson className="text-sm" /> Profile &amp; Orders
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