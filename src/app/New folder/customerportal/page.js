'use client';

import React, { useState, useEffect } from 'react';
import { 
  FiBox, FiHeart, FiUser, FiMenu, FiX, FiExternalLink, 
  FiCheck, FiTrash2, FiShoppingCart, FiPlus, FiStar, 
  FiMapPin, FiGlobe, FiBell, FiLogOut
} from 'react-icons/fi';

export default function CustomerPortal() {
  // Navigation & Layout States
  const [activeTab, setActiveTab] = useState('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(true); // Desktop collapse (default to collapsed)

  // --- MOCK DATA STATES ---
  const [orders] = useState([
    {
      id: 'ORD-7743', product: 'Rose Glow Facial Serum x2', total: 49.98,
      tracking: 'DHL-88213940PK', courier: 'DHL Express',
      courierUrl: '#', currentStep: 3, placedDate: '2026-07-10'
    },
    {
      id: 'ORD-7801', product: 'Argan Hair Oil x1', total: 18.75,
      tracking: 'FDX-77410823US', courier: 'FedEx International',
      courierUrl: '#', currentStep: 1, placedDate: '2026-07-17'
    }
  ]);

  const [wishlist, setWishlist] = useState([
    { id: 1, name: 'Charcoal Detox Mask', price: 15.99, inStock: true },
    { id: 2, name: 'Vitamin C Brightening Serum', price: 29.50, inStock: false },
  ]);

  const [addresses, setAddresses] = useState([
    { id: 1, name: 'Amara K.', countryLabel: 'United States', street: '482 Maple Avenue', city: 'Austin', state: 'TX', postal: '73301', phone: '+1 512 555 0198', isDefault: true },
    { id: 2, name: 'Amara K. (Work)', countryLabel: 'United Arab Emirates', street: 'Al Wasl Road, Villa 12', city: 'Dubai', state: 'Dubai', postal: '', phone: '+971 50 123 4567', isDefault: false }
  ]);
  
  const [currency, setCurrency] = useState('USD');
  const [timelineAnimated, setTimelineAnimated] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      const timer = setTimeout(() => setTimelineAnimated(true), 150);
      return () => clearTimeout(timer);
    } else {
      setTimelineAnimated(false);
    }
  }, [activeTab]);


  // --- VIEW RENDERERS ---
  const renderOrders = () => {
    const milestones = ['Order Placed', 'Shipped', 'Customs Clearance', 'Out for Delivery', 'Delivered'];
    
    return (
      <div className="space-y-6 animate-fade-in">
        {orders.map((order) => {
          const fillPercent = ((order.currentStep - 1) / (milestones.length - 1)) * 100;
          return (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="font-bold text-slate-900 text-lg">{order.id} <span className="text-xs font-semibold text-slate-400 ml-1 font-normal">&middot; Placed {order.placedDate}</span></p>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{order.product}</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">${order.total}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">International Waybill</p>
                  <a href={order.courierUrl} className="text-sm font-black text-purple-700 hover:underline inline-flex items-center gap-1 mt-0.5">
                    {order.tracking} <FiExternalLink />
                  </a>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">via {order.courier}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pt-4 pb-2">
                <div className="absolute top-7 left-0 right-0 h-1 bg-slate-100 rounded-full z-0" />
                <div 
                  className="absolute top-7 left-0 h-1 bg-purple-600 rounded-full z-0 transition-all duration-1000 ease-out" 
                  style={{ width: timelineAnimated ? `${fillPercent}%` : '0%' }}
                />
                <div className="overflow-x-auto -mx-5 px-5 custom-scrollbar">
                  <div className="flex relative z-10 min-w-max justify-between">
                    {milestones.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isDone = stepNum < order.currentStep;
                      const isCurrent = stepNum === order.currentStep;
                      return (
                        <div key={step} className="flex flex-col items-center flex-shrink-0 min-w-[80px] sm:min-w-[100px]">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isDone ? 'bg-purple-600 text-white' : isCurrent ? 'bg-white border-2 border-purple-600 text-purple-600 shadow-sm scale-110' : 'bg-slate-100 text-slate-400'}`}>
                            {isDone ? <FiCheck strokeWidth={3} /> : stepNum}
                          </div>
                          <p className={`text-[11px] sm:text-xs font-bold text-center mt-3 max-w-[90px] leading-tight ${isCurrent ? 'text-slate-900 font-extrabold' : isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWishlist = () => (
    <div className="animate-fade-in">
      {wishlist.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-semibold">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="h-48 bg-slate-50 relative border-b border-slate-100">
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium">[Product Image]</div>
                <button 
                  onClick={() => setWishlist(wishlist.filter(w => w.id !== item.id))}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{item.name}</h3>
                <p className="text-purple-700 font-bold mt-1">${item.price}</p>
                <button 
                  disabled={!item.inStock}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-colors ${
                    item.inStock ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FiShoppingCart /> {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => {
    const handleSetDefault = (id) => setAddresses(addresses.map(addr => ({ ...addr, isDefault: addr.id === id })));
    const handleDelete = (id) => setAddresses(addresses.filter(addr => addr.id !== id));

    return (
      <div className="space-y-8 animate-fade-in">
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
            <FiGlobe className="text-xl text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">Regional Settings</h3>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Display Currency</label>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50"
            >
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="PKR">🇵🇰 PKR - Pakistani Rupee</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <FiMapPin className="text-xl text-purple-600" />
               <h3 className="text-lg font-bold text-slate-900">Address Ledger</h3>
            </div>
            <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2">
              <FiPlus size={16} /> Add Address
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className={`bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow ${a.isDefault ? 'border-purple-300 bg-purple-50/30' : 'border-slate-200'}`}>
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <p className="font-bold text-slate-900">{a.name}</p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">{a.countryLabel}</p>
                    </div>
                    {a.isDefault && (
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md flex items-center gap-1">
                        <FiStar /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {a.street}<br />{a.city}{a.state ? `, ${a.state}` : ''} {a.postal}<br />
                    <span className="text-slate-400 text-xs font-semibold block mt-2">📞 {a.phone}</span>
                  </p>
                </div>
                <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100 text-sm font-bold">
                  {!a.isDefault && (
                    <button onClick={() => handleSetDefault(a.id)} className="text-purple-600 hover:text-purple-700 transition-colors">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-600 ml-auto transition-colors flex items-center gap-1">
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // --- MAIN LAYOUT ---
  return (
    // FIX 1: Removed overflow-hidden and fixed heights from outer wrapper
    <div className="flex min-h-screen bg-[#F8F9FA] text-slate-800 font-sans antialiased selection:bg-purple-100 selection:text-purple-900">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
      
      {/* FIX 2: Added `sticky top-0 h-screen` to make sidebar lock in viewport when scrolled */}
      <aside 
        className={`sticky top-0 h-screen z-40 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex-shrink-0
          ${sidebarOpen ? 'fixed left-0 translate-x-0 w-64' : 'hidden lg:flex'} 
          ${isCollapsed ? 'lg:w-20' : 'lg:w-[260px]'}
        `}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-slate-100 px-4 flex-shrink-0 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight">
              <span className="text-purple-600">Customer</span>Panel
            </span>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors hidden lg:flex items-center justify-center bg-slate-50 border border-slate-200"
          >
            <FiMenu size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
          {[
            { id: 'orders', label: 'My Orders', icon: <FiBox className="text-xl flex-shrink-0" /> },
            { id: 'wishlist', label: 'Wishlist', icon: <FiHeart className="text-xl flex-shrink-0" /> },
            { id: 'profile', label: 'Profile', icon: <FiUser className="text-xl flex-shrink-0" /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              title={isCollapsed ? item.label : ''}
              className={`flex items-center gap-3 py-3 px-3 text-[15px] font-medium rounded-xl transition-all w-full text-left overflow-hidden ${
                activeTab === item.id 
                  ? 'bg-white text-purple-700 border border-orange-400 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              } ${isCollapsed ? 'justify-center lg:px-0' : 'justify-start'}`}
            >
              {item.icon}
              <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
           <button
             title={isCollapsed ? "Log Out" : ""}
             className={`flex items-center gap-3 py-2.5 px-3 text-[15px] font-medium rounded-xl transition-all w-full text-left overflow-hidden text-red-500 hover:bg-red-50 hover:text-red-700 ${isCollapsed ? 'justify-center lg:px-0' : 'justify-start'}`}
           >
             <FiLogOut className="text-xl flex-shrink-0" />
             <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
               Log Out
             </span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* FIX 3: Removed constrained height, allowing natural page scroll */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* FIX 4: Top Navbar made sticky to stay at top of screen while scrolling */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-colors -ml-2"
            >
              <FiMenu size={24} />
            </button>
            {/* Show dynamic title based on active tab */}
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'orders' ? 'My Orders' : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
              <FiBell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-purple-200 transition-colors">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto">
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'wishlist' && renderWishlist()}
          {activeTab === 'profile' && renderProfile()}
        </main>

      </div>
    </div>
  );
}