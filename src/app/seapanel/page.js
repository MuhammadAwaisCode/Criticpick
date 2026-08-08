'use client';

import Link from 'next/link';

export default function SeaPanelPage() {
  return (
    <div className="bg-[#f1f5f9] flex flex-col md:flex-row min-h-screen">
      {/* =====================================================================
          SIDEBAR (Responsive: Stacks on mobile, stays left on desktop)
      ===================================================================== */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col md:sticky md:top-0 md:h-screen shrink-0">
        <div className="p-6 flex items-center justify-between md:justify-start gap-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              C
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Criticpick</span>
          </div>
        </div>

        {/* Admin Profile Details */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800 md:border-b-0">
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=random"
            className="w-10 h-10 rounded-full border-2 border-slate-600"
            alt="Admin avatar"
          />
          <div>
            <p className="text-sm font-bold text-white">Admin | SuperUser</p>
            <p className="text-[10px] text-slate-400">Online</p>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-grow px-4 py-4 md:py-0 space-y-1 overflow-y-auto">
          <Link
            href="/superadmin"
            className="flex items-center gap-3 p-3 rounded-lg text-white bg-slate-800 border-l-4 border-purple-500 transition-all"
          >
            <i className="fas fa-th-large w-5" /> Dashboard
          </Link>
          <Link 
            href="customerportal" 
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"
          >
            <i className="fas fa-users w-5" /> Users
          </Link>
          <Link 
            href="/products" 
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"
          >
            <i className="fas fa-box w-5" /> Products
          </Link>
          <Link 
            href="#" 
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"
          >
            <i className="fas fa-exchange-alt w-5" /> Transactions
          </Link>
          <Link 
            href="/affiliaterdashboard" 
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"
          >
            <i className="fas fa-link w-5" /> Affiliates
          </Link>
          <Link 
            href="/vendoradmin" 
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"
          >
            <i className="fas fa-store w-5" /> Vendors
          </Link>
          <Link 
            href="#" 
            className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"
          >
            <i className="fas fa-info-circle w-5" /> System Status
          </Link>
        </nav>

        {/* Back Button */}
        <div className="p-4 border-t border-slate-700">
          <Link
            href="/"
            className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <i className="fas fa-sign-out-alt" /> Back to Main
          </Link>
        </div>
      </aside>

      {/* =====================================================================
          MAIN CONTENT AREA
      ===================================================================== */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-x-hidden">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Criticpick Ecosystem Performance</h1>
            <p className="text-xs sm:text-sm text-slate-500">Live health dashboard of the entire ecosystem.</p>
          </div>
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button type="button" className="bg-white p-2 rounded-full shadow-sm text-slate-400 relative">
              <i className="fas fa-bell" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <img
              src="https://ui-avatars.com/api/?name=User"
              className="w-8 h-8 rounded-full border shadow-sm"
              alt="User avatar"
            />
          </div>
        </header>

        {/* -----------------------------------------------------------------
            STAT CARDS (Responsive Grid: 1 col mobile, 2 col tablet, 4 col desktop)
        ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Customer Stat */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                The Customer
              </div>
              <i className="fas fa-shopping-cart text-green-300" />
            </div>
            <p className="text-slate-400 text-xs mb-1">Active Customers:</p>
            <div className="flex items-end gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">4.5K</h2>
              <div className="text-green-500 text-xs mb-1">
                <i className="fas fa-chart-line" /> +12%
              </div>
            </div>
          </div>

          {/* Trader Stat */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                The Trader
              </div>
              <i className="fas fa-sync text-blue-300" />
            </div>
            <p className="text-slate-400 text-xs mb-1">Active Traders:</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">780</h2>
          </div>

          {/* Affiliator Stat */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                The Affiliator
              </div>
              <i className="fas fa-link text-purple-300" />
            </div>
            <p className="text-slate-400 text-xs mb-1">Active Affiliates:</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">1.2K</h2>
          </div>

          {/* Vendor Stat */}
          <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                The Vendor
              </div>
              <i className="fas fa-store text-orange-300" />
            </div>
            <p className="text-slate-400 text-xs mb-1">Verified Vendors:</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">310</h2>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            RECENT ORDERS + INVENTORY STATUS
        ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Orders Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[300px]">
                <thead>
                  <tr className="text-slate-400 border-b">
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Customer ID</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b last:border-0">
                    <td className="py-3">15:35:37 AM</td>
                    <td className="py-3 font-bold">CUST-883</td>
                    <td className="py-3">
                      <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        Shipped
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b last:border-0">
                    <td className="py-3">15:20:12 AM</td>
                    <td className="py-3 font-bold">CUST-104</td>
                    <td className="py-3">
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        Delivered
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Status Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Inventory Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Beauty - Facial Kit</span>
                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">
                  In Stock
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Electronics - Watch</span>
                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">
                  Low Stock
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                <span className="font-bold">Total SKUs: 1,240</span>
                <Link href="#" className="text-purple-600 text-xs font-bold underline">
                  Manage
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* -----------------------------------------------------------------
            REFERRAL DISTRIBUTION + TRANSACTION VOLUME
        ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
            <p className="text-slate-400 text-sm mb-4">Referral Distribution</p>
            <div className="w-32 h-32 rounded-full border-8 border-purple-500 border-r-blue-500 border-b-green-400 flex items-center justify-center">
              <span className="text-xs font-bold">Sources</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm md:col-span-2">
            <h3 className="font-bold text-slate-800 mb-4">Transaction Volume (Last 30 Days)</h3>
            <div className="w-full h-32 bg-slate-50 rounded flex items-end gap-1 p-2">
              <div className="flex-grow bg-purple-200 h-[30%]" />
              <div className="flex-grow bg-purple-300 h-[60%]" />
              <div className="flex-grow bg-purple-400 h-[45%]" />
              <div className="flex-grow bg-purple-500 h-[80%]" />
              <div className="flex-grow bg-purple-600 h-[95%]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}