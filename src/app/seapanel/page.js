'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import Server Actions
import { 
  fetchAdminDashboardData, 
  approveVendorAction, 
  resolveDisputeAction, 
  releasePayoutAction 
} from '@/actions/admin';

export default function SeaPanelPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [subTab, setSubTab] = useState('default');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Database State Variables
  const [users, setUsers] = useState([]);
  const [vendorApps, setVendorApps] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [banners, setBanners] = useState([]);
  const [logistics, setLogistics] = useState({
    crossBorderShipping: true,
    defaultTaxRate: '15%',
  });

  const fetchAllData = async () => {
    setLoading(true);
    const data = await fetchAdminDashboardData();
    if (data) {
      setUsers(data.users);
      setVendorApps(data.vendorApps);
      setReviews(data.reviews);
      setCategories(data.categories);
      setInventory(data.inventory);
      setOrders(data.orders);
      setDisputes(data.disputes);
      setAffiliates(data.affiliates);
      setCoupons(data.coupons);
      setPayouts(data.payouts);
      setGateways(data.gateways);
      setBanners(data.banners);
    } else {
      // Not an authenticated admin/superadmin — send them away from the panel.
      router.replace('/signin/customer');
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Currency Formatter Helper
  const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val) || 0);

  // =========================================================================
  // DATABASE MUTATION HANDLERS
  // =========================================================================
  const handleApproveVendor = async (id) => {
    const res = await approveVendorAction(id);
    if (res.success) {
      setVendorApps(vendorApps.map(v => v.id === id ? { ...v, status: 'Approved' } : v));
    }
  };

  const handleResolveDispute = async (id) => {
    const res = await resolveDisputeAction(id);
    if (res.success) {
      setDisputes(disputes.map(d => d.id === id ? { ...d, status: 'Resolved' } : d));
    }
  };

  const handleReleasePayout = async (id) => {
    const res = await releasePayoutAction(id);
    if (res.success) {
      setPayouts(payouts.map(p => p.id === id ? { ...p, status: 'Released' } : p));
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const headerCopy = {
    dashboard: { title: 'Criticpick Ecosystem Performance', subtitle: 'Live health dashboard of the entire ecosystem.' },
    approvals: { title: 'Approvals & Reviews', subtitle: 'Moderate pending vendor applications and flagged reviews.' },
    catalog: { title: 'Catalog & Stock', subtitle: 'Manage inventory, categories and taxonomy.' },
    orders: { title: 'Orders & Disputes', subtitle: 'Track platform orders and resolve customer disputes.' },
    promos: { title: 'Affiliates & Promos', subtitle: 'Affiliate roster, coupons and flash sales.' },
    ledger: { title: 'Financial Ledger', subtitle: 'Ecosystem GMV, platform fees and payout liability.' },
    payouts: { title: 'Payouts Queue', subtitle: 'Release pending vendor and affiliate payouts.' },
    settings: { title: 'Global Settings & CMS', subtitle: 'Logistics, payment gateways and CMS banners.' },
    usermgmt: { title: 'User Management', subtitle: 'Search and filter every account on the platform.' },
    vendordir: { title: 'Vendor Directory', subtitle: 'All verified vendor stores and platform rates.' }
  };
  const currentHeader = headerCopy[activeTab] || headerCopy.dashboard;

  return (
    <div className="bg-[#f1f5f9] flex flex-col md:flex-row min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#0f172a] text-slate-300 flex flex-col md:sticky md:top-0 md:h-screen shrink-0">
        <div className="p-6 flex items-center justify-between md:justify-start gap-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="text-xl font-bold text-white tracking-tight">Criticpick</span>
          </div>
        </div>

        <div className="p-6 flex items-center gap-3 border-b border-slate-800 md:border-b-0">
          <img src="https://ui-avatars.com/api/?name=Admin&background=random" className="w-10 h-10 rounded-full border-2 border-slate-600" alt="Admin avatar" />
          <div>
            <p className="text-sm font-bold text-white">Admin | SuperUser</p>
            <p className="text-[10px] text-slate-400">Online</p>
          </div>
        </div>

        <nav className="flex-grow px-4 py-4 md:py-0 space-y-1 overflow-y-auto">
          <Link href="/superadmin" onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); setSubTab('default'); }} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${activeTab === 'dashboard' ? 'text-white bg-slate-800 border-l-4 border-purple-500' : 'border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500'}`}>
            <i className="fas fa-th-large w-5" /> Dashboard
          </Link>
          <Link href="customerportal" className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"><i className="fas fa-users w-5" /> Users</Link>
          <Link href="/products" className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"><i className="fas fa-box w-5" /> Products</Link>
          <Link href="#" className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"><i className="fas fa-exchange-alt w-5" /> Transactions</Link>
          <Link href="/affiliaterdashboard" className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"><i className="fas fa-link w-5" /> Affiliates</Link>
          <Link href="/vendoradmin" className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"><i className="fas fa-store w-5" /> Vendors</Link>
          <Link href="#" className="flex items-center gap-3 p-3 rounded-lg border-l-4 border-transparent hover:bg-white/10 hover:border-purple-500 transition-all"><i className="fas fa-info-circle w-5" /> System Status</Link>

          <div className="pt-3 mt-3 border-t border-slate-800">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">New Features</p>

            {[
              { id: 'usermgmt', label: 'User Management', icon: 'fas fa-users-cog' },
              { id: 'approvals', label: 'Approvals & Reviews', icon: 'fas fa-shield-alt', badge: reviews.filter(r => r.status === 'Flagged').length + vendorApps.filter(v => v.status === 'Pending').length },
              { id: 'vendordir', label: 'Vendor Directory', icon: 'fas fa-store' },
              { id: 'catalog', label: 'Catalog & Stock', icon: 'fas fa-boxes' },
              { id: 'orders', label: 'Orders & Disputes', icon: 'fas fa-shopping-bag', badge: disputes.filter(d => d.status === 'Open').length },
              { id: 'promos', label: 'Affiliates & Promos', icon: 'fas fa-percentage' },
              { id: 'ledger', label: 'Financial Ledger', icon: 'fas fa-file-invoice-dollar' },
              { id: 'payouts', label: 'Payouts Queue', icon: 'fas fa-wallet', badge: payouts.filter(p => p.status === 'Pending').length },
              { id: 'settings', label: 'Global Settings & CMS', icon: 'fas fa-globe' }
            ].map((item) => (
              <button key={item.id} type="button" onClick={() => { setActiveTab(item.id); setSubTab('default'); }} className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border-l-4 transition-all ${activeTab === item.id ? 'text-white bg-slate-800 border-purple-500' : 'border-transparent hover:bg-white/10 hover:border-purple-500'}`}>
                <span className="flex items-center gap-3"><i className={`${item.icon} w-5`} /> {item.label}</span>
                {item.badge ? <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">{item.badge}</span> : null}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <Link href="/" className="flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><i className="fas fa-sign-out-alt" /> Back to Main</Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-x-hidden">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{currentHeader.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{currentHeader.subtitle}</p>
          </div>
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <button type="button" className="bg-white p-2 rounded-full shadow-sm text-slate-400 relative">
              <i className="fas fa-bell" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <img src="https://ui-avatars.com/api/?name=User" className="w-8 h-8 rounded-full border shadow-sm" alt="User avatar" />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3 text-slate-500">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading ecosystem metrics...</p>
          </div>
        ) : (
          <>
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-green-100 text-green-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">The Customer</div>
                      <i className="fas fa-shopping-cart text-green-300" />
                    </div>
                    <p className="text-slate-400 text-xs mb-1">Active Customers:</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{users.filter(u => u.role === 'customer').length}</h2>
                  </div>

                  <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">The Trader</div>
                      <i className="fas fa-sync text-blue-300" />
                    </div>
                    <p className="text-slate-400 text-xs mb-1">Active Traders:</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{users.filter(u => u.role === 'trader').length}</h2>
                  </div>

                  <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">The Affiliator</div>
                      <i className="fas fa-link text-purple-300" />
                    </div>
                    <p className="text-slate-400 text-xs mb-1">Active Affiliates:</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{affiliates.length}</h2>
                  </div>

                  <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-white">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">The Vendor</div>
                      <i className="fas fa-store text-orange-300" />
                    </div>
                    <p className="text-slate-400 text-xs mb-1">Verified Vendors:</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{vendorApps.filter(v => v.status === 'Approved').length}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="border-b last:border-0">
                              <td className="py-3">{o.timestamp || o.created_at}</td>
                              <td className="py-3 font-bold">{o.customerId || o.customer_id}</td>
                              <td className="py-3">
                                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">{o.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Inventory Status</h3>
                    <div className="space-y-4">
                      {inventory.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">{item.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.stock > 10 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {item.stock > 10 ? 'In Stock' : 'Low Stock'}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                        <span className="font-bold">Total SKUs: {inventory.length}</span>
                        <button type="button" onClick={() => setActiveTab('catalog')} className="text-purple-600 text-xs font-bold underline">Manage</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* USER MANAGEMENT TAB */}
            {activeTab === 'usermgmt' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b pb-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input type="text" placeholder="Search user name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs w-full sm:w-64 focus:outline-purple-500" />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1.5 border rounded-lg text-xs focus:outline-purple-500">
                      <option value="all">All Roles</option>
                      <option value="customer">Customers</option>
                      <option value="vendor">Vendors</option>
                      <option value="affiliate">Affiliates</option>
                      <option value="trader">Traders</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                    <thead>
                      <tr className="text-slate-400 border-b">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b last:border-0">
                          <td className="py-3 font-bold">{u.name}</td>
                          <td className="py-3">{u.email}</td>
                          <td className="py-3"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{u.role}</span></td>
                          <td className="py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{u.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* APPROVALS & REVIEWS TAB */}
            {activeTab === 'approvals' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex gap-4 border-b pb-3 text-xs font-bold">
                  <button type="button" onClick={() => setSubTab('default')} className={subTab === 'default' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}>Vendor Applications</button>
                  <button type="button" onClick={() => setSubTab('reviews')} className={subTab === 'reviews' ? 'text-purple-600 border-b-2 border-purple-600 pb-1' : 'text-slate-400'}>Flagged Reviews</button>
                </div>

                {subTab === 'default' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm min-w-[500px]">
                      <thead>
                        <tr className="text-slate-400 border-b">
                          <th className="pb-3 font-medium">Store Name</th>
                          <th className="pb-3 font-medium">Applicant Email</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-600">
                        {vendorApps.map((v) => (
                          <tr key={v.id} className="border-b last:border-0">
                            <td className="py-3 font-bold">{v.storeName || v.store_name}</td>
                            <td className="py-3">{v.email}</td>
                            <td className="py-3"><span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">{v.status}</span></td>
                            <td className="py-3 text-right">
                              {v.status === 'Pending' ? (
                                <button type="button" onClick={() => handleApproveVendor(v.id)} className="bg-green-600 text-white font-bold px-3 py-1 rounded text-[10px]">Approve</button>
                              ) : (
                                <span className="text-green-600 font-bold">Approved</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PAYOUTS TAB */}
            {activeTab === 'payouts' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 mb-2">Pending Vendor & Affiliate Payouts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-slate-400 border-b">
                        <th className="pb-3 font-medium">Recipient</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Method</th>
                        <th className="pb-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      {payouts.map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-3 font-bold">{p.recipient}</td>
                          <td className="py-3 font-bold text-green-600">{fmt(p.amount)}</td>
                          <td className="py-3">{p.method}</td>
                          <td className="py-3 text-right">
                            {p.status === 'Pending' ? (
                              <button type="button" onClick={() => handleReleasePayout(p.id)} className="bg-purple-600 text-white font-bold px-3 py-1 rounded text-[10px]">Release</button>
                            ) : (
                              <span className="text-green-600 font-bold">Released</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}