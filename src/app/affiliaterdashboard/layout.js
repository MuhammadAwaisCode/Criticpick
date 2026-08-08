'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  User, 
  ShoppingBag, 
  Link2, 
  Users, 
  Network, 
  Receipt, 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Megaphone, 
  Bell, 
  HelpCircle, 
  Settings,
  Menu,
  Award,
  LogOut,
  AlertTriangle,
  X
} from 'lucide-react';

export default function AffiliateLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // States
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

const menuItems = [
    { name: 'Dashboard', path: '/affiliaterdashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/affiliaterdashboard/profile', icon: User },
    { name: 'Products Catalog', path: '/affiliaterdashboard/products', icon: ShoppingBag },
    { name: 'Affiliate Links', path: '/affiliaterdashboard/affiliate-links', icon: Link2 },
    { name: 'Direct Referrals', path: '/affiliaterdashboard/referrals', icon: Users },
    { name: 'Referral Tree', path: '/affiliaterdashboard/referral-tree', icon: Network },
    { name: 'Commissions', path: '/affiliaterdashboard/commissions', icon: Receipt },
    { name: 'Financial Earnings', path: '/affiliaterdashboard/earnings', icon: Wallet },
    { name: 'Payout History', path: '/affiliaterdashboard/payouts', icon: CreditCard },
    { name: 'Analytics', path: '/affiliaterdashboard/analytics', icon: TrendingUp },
    { name: 'Marketing Assets', path: '/affiliaterdashboard/marketing', icon: Megaphone },
    { name: 'Notifications', path: '/affiliaterdashboard/notifications', icon: Bell },
    { name: 'Support', path: '/affiliaterdashboard/support', icon: HelpCircle },
    { name: 'Settings', path: '/affiliaterdashboard/settings', icon: Settings },
  ];

  const handleLogout = () => {
    // 1. Apni logout logic yahan add karein (clear localStorage, cookies, etc.)
    // 2. Login screen par redirect karein
    setShowLogoutModal(false);
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
       
      {/* 1. SIDEBAR (Collapsible Desktop) */}
      <aside 
        className={`hidden md:flex bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shrink-0 z-20
        ${isCollapsed ? 'w-[72px]' : 'w-64'}`}
      >
        {/* Sidebar Top Header (Branding & Toggle) */}
        <div className={`h-[60px] flex items-center border-b border-slate-200 transition-all ${isCollapsed ? 'justify-center' : 'justify-between px-4'}`}>
          {!isCollapsed && (
            <div className="text-[17px] font-black tracking-tight flex items-center">
              <span className="text-purple-600">Affiliate</span>
              <span className="text-slate-800">Panel</span>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`text-slate-500 hover:text-purple-600 transition-all flex items-center justify-center cursor-pointer
              ${isCollapsed ? 'w-10 h-10 border border-slate-200 rounded-xl bg-white shadow-xs' : 'p-1.5'}
            `}
          >
            <Menu className="w-5 h-5 shrink-0" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center relative group transition-all rounded-xl cursor-pointer
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'}
                  ${isActive 
                    ? 'bg-purple-50 text-purple-700 font-bold border border-purple-100 shadow-xs' 
                    : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                
                {/* Text only visible when expanded */}
                {!isCollapsed && (
                  <span className="text-xs truncate">{item.name}</span>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all shadow-md flex items-center">
                    {item.name}
                    {/* Tooltip arrow */}
                    <div className="absolute top-1/2 -left-1 -mt-1 border-t-4 border-t-transparent border-r-4 border-r-slate-800 border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom (Logout Section) */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className={`
              w-full flex items-center relative group transition-all rounded-xl cursor-pointer text-rose-600 hover:bg-rose-50
              ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'}
            `}
          >
            <LogOut className={`shrink-0 text-rose-500 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            
            {!isCollapsed && (
              <span className="text-xs font-bold truncate">Logout</span>
            )}

            {/* Logout Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2.5 py-1.5 bg-rose-600 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all shadow-md flex items-center">
                Logout
                <div className="absolute top-1/2 -left-1 -mt-1 border-t-4 border-t-transparent border-r-4 border-r-rose-600 border-b-4 border-b-transparent"></div>
              </div>
            )}
          </button>
        </div>
      </aside>
 
      {/* Mobile overlay for the sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-200">
          <div className="text-sm font-black tracking-tight flex items-center">
            <span className="text-purple-600">Affiliate</span>
            <span className="text-slate-800">Panel</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1.5 custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
 
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-bold border border-purple-100 shadow-xs'
                    : 'text-slate-600 font-semibold hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`shrink-0 w-5 h-5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="text-xs truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => {
              setShowLogoutModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-bold truncate">Logout</span>
          </button>
        </div>
      </aside>
 
      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-10">
           
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-slate-500 rounded-lg hover:bg-slate-100 transition md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-800">Affiliate Portal</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200">
              <Award className="w-3.5 h-3.5" /> Tier-1 Partner
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-purple-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-2 border-white bg-purple-600 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shadow-xs border border-purple-200 cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* Page Content area */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto bg-slate-50">
          {children}
        </div>
        
      </main>

      {/* 3. LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Sign Out Confirmation</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to log out of your affiliate account?
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}