'use client';

import { useState } from 'react';
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
  LogOut
} from 'lucide-react';
import { VendorDataProvider, useVendorData } from './context/VendorDataContext';

const sidebarLinks = [
  { name: 'Dashboard', href: '/vendoradmin', icon: LayoutDashboard },
  { name: 'Profile', href: '/vendoradmin/profile', icon: User },
  { name: 'Store Settings', href: '/vendoradmin/store', icon: Store },
  { name: 'Products', href: '/vendoradmin/products/add', icon: Package },
  { name: 'Inventory', href: '/vendoradmin/inventory', icon: ClipboardList },
  { name: 'Orders', href: '/vendoradmin/orders', icon: ShoppingCart },
  { name: 'Reviews', href: '/vendoradmin/reviews', icon: Star },
  { name: 'Earnings', href: '/vendoradmin/earnings', icon: Wallet },
  { name: 'Analytics', href: '/vendoradmin/analytics', icon: LineChart },
  { name: 'Notifications', href: '/vendoradmin/notifications', icon: Bell },
  { name: 'Settings', href: '/vendoradmin/settings', icon: Settings },
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

export default function VendorLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <VendorDataProvider>
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
              <h2 className="text-sm font-semibold text-gray-800 hidden sm:block">My Store</h2>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                V
              </div>
            </div>
          </header>

          {/* Children Pages Render Here */}
          <div className="flex-1 overflow-auto p-4 sm:p-6">
            {children}
          </div>
        </main>

      </div>
    </VendorDataProvider>
  );
}