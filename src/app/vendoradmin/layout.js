'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Store,
  Package,
  ShoppingCart,
  ClipboardList,
  Star,
  Wallet,
  LineChart,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  CheckCheck,
  Mail,
  Globe,
  FileText,
  Truck
} from 'lucide-react';
import { VendorDataProvider, useVendorData } from './context/VendorDataContext';
import { VendorProvider, useVendor } from '@/context/VendorContext';

const sidebarLinks = [
  { name: 'Dashboard', href: '/vendoradmin', icon: LayoutDashboard },
  { name: 'Profile', href: '/vendoradmin/profile', icon: User },
  { name: 'Store Settings', href: '/vendoradmin/store', icon: Store },
  { name: 'SEO & Social', href: '/vendoradmin/seo', icon: Globe },
  { name: 'Store Policies', href: '/vendoradmin/policies', icon: FileText },
  { name: 'Shipping & Delivery', href: '/vendoradmin/shipping', icon: Truck },
  { name: 'Products', href: '/vendoradmin/products', icon: Package },
  { name: 'Inventory', href: '/vendoradmin/inventory', icon: ClipboardList },
  { name: 'Orders', href: '/vendoradmin/orders', icon: ShoppingCart },
  { name: 'Reviews', href: '/vendoradmin/reviews', icon: Star },
  { name: 'Earnings', href: '/vendoradmin/earnings', icon: Wallet },
  { name: 'Payouts Settings', href: '/vendoradmin/payments', icon: Wallet },
  { name: 'Analytics', href: '/vendoradmin/analytics', icon: LineChart },
  { name: 'Notifications', href: '/vendoradmin/notifications', icon: Bell },
  { name: 'Settings', href: '/vendoradmin/settings', icon: Settings },
];


const INITIAL_NOTIFICATIONS = [
  { id: 1, message: 'New order #WB-1042 received', time: '5m ago', read: false },
  { id: 2, message: 'Low stock warning: Vitamin C Serum', time: '1h ago', read: false },
  { id: 3, message: 'New 5-star review on Rose Clay Mask', time: '3h ago', read: false },
  { id: 4, message: 'Order #WB-1038 marked as delivered', time: '1d ago', read: true },
];

function ToastPortal() {
  const { toasts } = useVendorData();
  return (
    /* 
       1. z-[99999] sab se top layer ensure karta hai.
       2. top-20 margin lagaya hai taake agar global header fix ho to uske neechay perfectly float ho.
    */
    <div className="fixed top-20 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-white shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-200 min-w-[260px] pointer-events-auto animate-fade-in"
        >
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-orange-500'}`} />
          <span className="text-sm font-semibold text-slate-800">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// All sidebar/header UI + hooks that depend on VendorProvider/VendorDataProvider
// live here, so this component renders *inside* both providers rather than
// alongside them (that mismatch was the original bug).
function VendorLayoutContent({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const { vendorData } = useVendor();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const storeName = vendorData?.storeName || 'Vendor Panel';
  const storeInitial = (vendorData?.storeName?.trim()?.[0] || 'V').toUpperCase();

  // Close whichever dropdown is open when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <>
      {/* 🔴 CRITICAL FIX: ToastPortal ko layout container se bahar parent level par rakha gaya hai */}
      <ToastPortal />

      <div className="flex min-h-screen bg-gray-50 w-full">

        {/* 1. Sidebar (Desktop) */}
        <aside 
          className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shrink-0 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Header & Collapse Toggle */}
          <div className={`h-16 flex items-center border-b border-gray-200 ${isCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
            {!isCollapsed && <span className="text-xl font-bold text-blue-600">Vendor<span className="text-gray-900">Panel</span></span>}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
            <nav className="space-y-1 px-3">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isCollapsed ? link.name : ''}
                    className={`flex items-center gap-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
                  >
                    <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                    {!isCollapsed && <span className="whitespace-nowrap">{link.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button className={`flex items-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors rounded-lg py-2.5 w-full ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'}`}>
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* 2. Mobile Sidebar Overlay & Logic */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}
        <aside className={`fixed top-0 left-0 h-screen z-[100] w-64 bg-white shadow-2xl transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-blue-600">Vendor<span className="text-gray-900">Panel</span></h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                          isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* 3. Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
          
          {/* Top Navigation */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-semibold text-gray-800 hidden sm:block">{storeName}</h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen((prev) => !prev);
                    setIsProfileOpen(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[110] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <span className="text-sm font-bold text-gray-800">Notifications</span>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
                      </button>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 flex items-start gap-2.5 ${!n.read ? 'bg-purple-50/40' : ''}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-purple-600' : 'bg-transparent'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 leading-snug">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      href="/vendoradmin/notifications"
                      onClick={() => setIsNotifOpen(false)}
                      className="block text-center text-xs font-semibold text-gray-600 hover:bg-gray-50 py-3 border-t border-gray-100"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* Avatar / Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setIsProfileOpen((prev) => !prev);
                    setIsNotifOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm"
                >
                  {storeInitial}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-[110] overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800 truncate">{storeName}</p>
                      {vendorData?.supportEmail && (
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0" /> {vendorData.supportEmail}
                        </p>
                      )}
                    </div>

                    <div className="py-1.5">
                      <Link
                        href="/vendoradmin/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 text-gray-400" /> Profile
                      </Link>
                      <Link
                        href="/vendoradmin/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 text-gray-400" /> Store Settings
                      </Link>
                    </div>

                    <button className="flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-red-600 hover:bg-red-50 w-full border-t border-gray-100">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Children Pages Render Here */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </div>
        </main>

      </div>
    </>
  );
}

export default function VendorLayout({ children }) {
  return (
    <VendorDataProvider>
      <VendorProvider>
        <VendorLayoutContent>{children}</VendorLayoutContent>
      </VendorProvider>
    </VendorDataProvider>
  );
}