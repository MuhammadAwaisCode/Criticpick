'use client';

import React, { useState, useEffect } from 'react';

export default function SuperAdminDashboard() {
  /* ==========================================================
     STATE MANAGEMENT
     ========================================================== */
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modFilter, setModFilter] = useState('all');
  const [toasts, setToasts] = useState([]);

  // Business Logic States
  const [applications, setApplications] = useState([
    { id: 'APP-201', name: 'Lumière Beauty Co.', type: 'Vendor', country: 'France', date: '2026-07-14', split: 15, avatar: 'LB' },
    { id: 'APP-202', name: 'Sana Kids Wear', type: 'Vendor', country: 'Pakistan', date: '2026-07-15', split: 12, avatar: 'SK' },
    { id: 'APP-203', name: 'Zara M.', type: 'Affiliate', country: 'UAE', date: '2026-07-16', split: 8, avatar: 'ZM' }
  ]);

  const [shippingZones, setShippingZones] = useState([
    { id: 'Z1', name: 'North America', countries: 'USA, Canada, Mexico', rate: 9.99, days: '3-5', active: true },
    { id: 'Z2', name: 'Europe', countries: 'UK, France, Germany, Spain', rate: 14.50, days: '5-8', active: true },
    { id: 'Z3', name: 'Middle East & South Asia', countries: 'UAE, Pakistan, India, KSA', rate: 11.00, days: '4-7', active: true }
  ]);
  const [zoneCounter, setZoneCounter] = useState(3);

  const [taxOverrides, setTaxOverrides] = useState([
    { id: 'T1', country: 'United Kingdom', rate: 20, active: true },
    { id: 'T2', country: 'Germany', rate: 19, active: true },
    { id: 'T3', country: 'United Arab Emirates', rate: 5, active: false }
  ]);
  const [taxCounter, setTaxCounter] = useState(3);

  const [ledgerRows, setLedgerRows] = useState([
    { id: 'PO-501', recipient: 'Lumière Beauty Co.', type: 'Vendor', amount: 3240.50, due: '2026-07-20', status: 'Pending' },
    { id: 'PO-502', recipient: 'Zara M.', type: 'Affiliate', amount: 412.80, due: '2026-07-19', status: 'Pending' },
    { id: 'PO-503', recipient: 'NovaTech Gadgets', type: 'Vendor', amount: 8110.00, due: '2026-07-22', status: 'Pending' },
    { id: 'PO-504', recipient: 'Hamid R.', type: 'Affiliate', amount: 155.20, due: '2026-07-18', status: 'Pending' }
  ]);

  const [releasedTotal, setReleasedTotal] = useState(0);
  const [overrideCount, setOverrideCount] = useState(0);
  const [crossBorderActive, setCrossBorderActive] = useState(true);
  const [isSavingLogistics, setIsSavingLogistics] = useState(false);

  // Modal Control State
  const [payoutModal, setPayoutModal] = useState({ isOpen: false, row: null });

  // Override Form States
  const [overrideForm, setOverrideForm] = useState({ recipient: '', amount: '', reason: '' });

  // Activity Log
  const activityLog = [
    { time: '15:35:37', event: 'Payout requested', entity: 'Lumière Beauty Co.', status: 'Pending', color: 'orange' },
    { time: '15:20:12', event: 'Vendor application submitted', entity: 'Sana Kids Wear', status: 'New', color: 'blue' },
    { time: '14:58:03', event: 'Affiliate link flagged', entity: 'Zara M.', status: 'Review', color: 'orange' },
    { time: '14:40:11', event: 'Order dispatched', entity: 'ORD-7743', status: 'Shipped', color: 'green' }
  ];

  /* ==========================================================
     UTILITIES & HELPERS
     ========================================================== */
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const badgeColor = (color) => {
    const mappings = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return mappings[color] || 'bg-slate-100 text-slate-600';
  };

  const triggerToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3100);
  };

  /* ==========================================================
     ACTION HANDLERS
     ========================================================== */
  // Moderation Handlers
  const handleSplitChange = (id, val) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, split: Number(val) } : app)));
  };

  const handleApplicationDecision = (id, action) => {
    const app = applications.find((a) => a.id === id);
    if (!app) return;

    if (action === 'approve') {
      triggerToast(`${app.name} approved with ${app.split}% commission split.`, 'success');
    } else {
      triggerToast(`${app.name}'s application was rejected.`, 'error');
    }
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  // Logistics Handlers
  const handleAddZone = () => {
    const nextId = zoneCounter + 1;
    setZoneCounter(nextId);
    setShippingZones((prev) => [
      ...prev,
      { id: `Z${nextId}`, name: 'New Zone', countries: 'Add countries...', rate: 0.00, days: '—', active: true }
    ]);
    triggerToast('New shipping zone added — edit the details.', 'info');
  };

  const handleUpdateZone = (id, field, value) => {
    setShippingZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: field === 'rate' ? parseFloat(value) || 0 : value } : z))
    );
  };

  const handleRemoveZone = (id) => {
    setShippingZones((prev) => prev.filter((z) => z.id !== id));
    triggerToast('Shipping zone removed.', 'error');
  };

  const handleAddTaxOverride = () => {
    const nextId = taxCounter + 1;
    setTaxCounter(nextId);
    setTaxOverrides((prev) => [
      ...prev,
      { id: `T${nextId}`, country: 'New Country', rate: 0, active: false }
    ]);
    triggerToast('Tax override row added.', 'info');
  };

  const handleUpdateTax = (id, field, value) => {
    setTaxOverrides((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: field === 'rate' ? parseFloat(value) || 0 : value } : t))
    );
  };

  const handleToggleTax = (id) => {
    setTaxOverrides((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  };

  const handleRemoveTax = (id) => {
    setTaxOverrides((prev) => prev.filter((t) => t.id !== id));
    triggerToast('Tax override removed.', 'error');
  };

  const handleSaveLogistics = () => {
    setIsSavingLogistics(true);
    setTimeout(() => {
      setIsSavingLogistics(false);
      triggerToast('Global logistics configuration saved successfully.', 'success');
    }, 900);
  };

  // Ledger Handlers
  const triggerReleasePayoutModal = (row) => {
    setPayoutModal({ isOpen: true, row });
  };

  const handleConfirmPayout = () => {
    const targetRow = payoutModal.row;
    if (!targetRow) return;

    setLedgerRows((prev) =>
      prev.map((r) => (r.id === targetRow.id ? { ...r, status: 'Released' } : r))
    );
    setReleasedTotal((prev) => prev + targetRow.amount);
    triggerToast(`Payout of ${fmt(targetRow.amount)} released to ${targetRow.recipient}.`, 'success');
    setPayoutModal({ isOpen: false, row: null });
  };

  const handleApplyOverrideForm = (e) => {
    e.preventDefault();
    const { recipient, amount, reason } = overrideForm;
    const parsedAmount = parseFloat(amount);

    if (!recipient.trim() || isNaN(parsedAmount) || parsedAmount === 0) {
      triggerToast('Enter a recipient and a non-zero amount to apply an override.', 'error');
      return;
    }

    const nextOverrideCount = overrideCount + 1;
    setOverrideCount(nextOverrideCount);

    const newRow = {
      id: `OV-${100 + nextOverrideCount}`,
      recipient: recipient.trim(),
      type: parsedAmount >= 0 ? 'Vendor' : 'Affiliate',
      amount: Math.abs(parsedAmount),
      due: new Date().toISOString().slice(0, 10),
      status: 'Released'
    };

    setLedgerRows((prev) => [newRow, ...prev]);
    setReleasedTotal((prev) => prev + Math.abs(parsedAmount));
    setOverrideForm({ recipient: '', amount: '', reason: '' });
    triggerToast(`Manual override applied for ${recipient}${reason ? ' — ' + reason : ''}.`, 'info');
  };

  // Compute stats values dynamically
  const pendingTotal = ledgerRows.filter((r) => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
  const filteredApplications = modFilter === 'all' ? applications : applications.filter((a) => a.type === modFilter);
  const pageTitles = {
    overview: 'Ecosystem Performance',
    moderation: 'User Moderation',
    logistics: 'Global Logistics',
    ledger: 'Financial Ledger'
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col selection:bg-purple-100 selection:text-purple-900">
      
      {/* Dynamic Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="animate-fade-in bg-white shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-100 min-w-[240px] pointer-events-auto transition-all duration-300">
            <span className={`w-2 h-2 rounded-full ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-purple-500'}`} />
            <span className="text-sm font-medium text-slate-700">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Main Admin Header Panel */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
          >
            <span className="block w-6 h-0.5 bg-slate-600 mb-1" />
            <span className="block w-6 h-0.5 bg-slate-600 mb-1" />
            <span className="block w-6 h-0.5 bg-slate-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{pageTitles[activeTab]}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-purple-200">HQ</div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:inline-block">Critipick Core</span>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar Layer */}
        <>
          {sidebarOpen && (
            <div 
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            />
          )}
          <aside className={`fixed lg:sticky top-0 lg:top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <nav className="p-4 flex flex-col gap-1 h-full">
              {[
                { id: 'overview', label: 'Overview Metrics', icon: '⚡' },
                { id: 'moderation', label: 'User Approvals', icon: '🛡️', badge: applications.length },
                { id: 'logistics', label: 'Global Logistics', icon: '🌐' },
                { id: 'ledger', label: 'Financial Matrix', icon: '💼' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeTab === item.id ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black tracking-wide">{item.badge}</span>
                  ) : null}
                </button>
              ))}
            </nav>
          </aside>
        </>

        {/* Dashboard Active Route Component Container */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden max-w-7xl mx-auto w-full">
          
          {/* TAB 1: GENERAL OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pipeline Payout</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">{fmt(pendingTotal + releasedTotal)}</h3>
                </div>
                <div onClick={() => setActiveTab('moderation')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Validations</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">{applications.length} Profiles</h3>
                </div>
                <div onClick={() => setActiveTab('ledger')} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Released Funds Balance</p>
                  <h3 className="text-2xl font-black text-purple-600 mt-2">{fmt(releasedTotal)}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Manual Operations</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">{overrideCount} Overrides</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:col-span-2">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Ecosystem Operational Stream</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3">Event Description</th>
                          <th className="pb-3">Involved Entity</th>
                          <th className="pb-3">System Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLog.map((row, i) => (
                          <tr key={i} className="border-b last:border-0 border-slate-50">
                            <td className="py-4 text-slate-500">{row.time}</td>
                            <td className="py-4 font-semibold text-slate-700">{row.event}</td>
                            <td className="py-4 font-bold text-slate-900">{row.entity}</td>
                            <td className="py-4">
                              <span className={`${badgeColor(row.color)} px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wide`}>{row.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  <h3 className="text-base font-bold text-slate-900 mb-4">Direct Ledger Override</h3>
                  <form onSubmit={handleApplyOverrideForm} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Target Recipient Legal Name</label>
                      <input 
                        type="text" 
                        value={overrideForm.recipient}
                        onChange={(e) => setOverrideForm({ ...overrideForm, recipient: e.target.value })}
                        className="w-full mt-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                        placeholder="e.g. Acme Corp" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Operational Funding Impact</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={overrideForm.amount}
                        onChange={(e) => setOverrideForm({ ...overrideForm, amount: e.target.value })}
                        className="w-full mt-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" 
                        placeholder="e.g. 500 or -200" 
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase">Regulatory Justification Reason</label>
                      <textarea 
                        rows={2}
                        value={overrideForm.reason}
                        onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                        className="w-full mt-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none" 
                        placeholder="Internal notes..." 
                      />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-colors tracking-wide uppercase">
                      Commit Manual Adjustment
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM USER MODERATION */}
          {activeTab === 'moderation' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Queue Filtering Matrix:</span>
                  <span className="bg-purple-100 text-purple-700 text-xs font-black px-2.5 py-0.5 rounded-full">{applications.length} Pending</span>
                </div>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  {['all', 'Vendor', 'Affiliate'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setModFilter(filter)}
                      className={`px-4 py-2 rounded-lg capitalize transition-all ${modFilter === filter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="font-bold text-slate-700 text-sm">All verification structures completed.</p>
                  <p className="text-xs text-slate-400 mt-1">No pending verification components await platform moderation layout views.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredApplications.map((app) => (
                    <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        
                        <div className="flex items-center gap-4 md:w-1/3">
                          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">{app.avatar}</div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{app.name}</p>
                            <p className="text-xs font-semibold text-slate-400 mt-0.5">{app.id} &middot; {app.country}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 md:w-1/6">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${app.type === 'Vendor' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>{app.type}</span>
                          <span className="text-xs font-bold text-slate-400">{app.date}</span>
                        </div>

                        <div className="flex-grow md:w-1/3">
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Commission Split Engine Mapping</label>
                            <span className="text-sm font-black text-purple-600">{app.split}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="40" 
                            value={app.split} 
                            onChange={(e) => handleSplitChange(app.id, e.target.value)}
                            className="w-full h-1.5 rounded-full bg-slate-100 accent-purple-600 cursor-pointer"
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 justify-end xl:w-auto">
                          <button 
                            onClick={() => handleApplicationDecision(app.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 w-full sm:w-auto"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleApplicationDecision(app.id, 'reject')}
                            className="bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all w-full sm:w-auto"
                          >
                            Reject
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GLOBAL LOGISTICS CONFIGURATION */}
          {activeTab === 'logistics' && (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">International Cargo Cross-Border Protocol</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Toggle automated worldwide fulfillment parameters natively platform-wide.</p>
                  </div>
                  <button 
                    onClick={() => setCrossBorderActive(!crossBorderActive)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${crossBorderActive ? 'bg-purple-600' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${crossBorderActive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipping Zones & Dynamic Multi-tier Rates</h4>
                    <button 
                      onClick={handleAddZone}
                      className="text-purple-600 hover:text-purple-700 font-bold text-xs flex items-center gap-1"
                    >
                      + Add New Zone
                    </button>
                  </div>

                  <div className="space-y-3">
                    {shippingZones.map((z) => (
                      <div key={z.id} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/50 hover:border-purple-200 transition-colors">
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input 
                            value={z.name} 
                            onChange={(e) => handleUpdateZone(z.id, 'name', e.target.value)}
                            className="text-sm font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-purple-400 outline-none" 
                          />
                          <input 
                            value={z.countries} 
                            onChange={(e) => handleUpdateZone(z.id, 'countries', e.target.value)}
                            className="text-xs font-medium text-slate-400 bg-transparent border-b border-transparent focus:border-purple-400 outline-none md:col-span-2" 
                          />
                        </div>
                        <div className="flex items-center gap-3 shrink-0 justify-end">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={z.rate} 
                              onChange={(e) => handleUpdateZone(z.id, 'rate', e.target.value)}
                              className="w-24 pl-6 pr-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white outline-none" 
                            />
                          </div>
                          <input 
                            value={z.days} 
                            onChange={(e) => handleUpdateZone(z.id, 'days', e.target.value)}
                            className="w-20 px-2 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg text-center focus:ring-2 focus:ring-purple-500 bg-white outline-none" 
                            placeholder="days" 
                          />
                          <button 
                            onClick={() => handleRemoveZone(z.id)}
                            className="text-slate-300 hover:text-red-500 p-1.5 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Country-Specific Tax Compliance Matrix Overrides</h4>
                    <button 
                      onClick={handleAddTaxOverride}
                      className="text-purple-600 hover:text-purple-700 font-bold text-xs flex items-center gap-1"
                    >
                      + Add Tax Override
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto">
                    <table className="min-w-[700px] w-full text-left text-xs sm:text-sm bg-white">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-4">Jurisdiction Country</th>
                          <th className="p-4">Statutory Rate (%)</th>
                          <th className="p-4">Activation Switch</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {taxOverrides.map((t) => (
                          <tr key={t.id} className="border-b last:border-0 border-slate-100">
                            <td className="p-4">
                              <input 
                                value={t.country} 
                                onChange={(e) => handleUpdateTax(t.id, 'country', e.target.value)}
                                className="font-bold text-slate-700 bg-transparent border-b border-transparent focus:border-purple-400 outline-none w-full" 
                              />
                            </td>
                            <td className="p-4">
                              <input 
                                type="number" 
                                step="0.1" 
                                value={t.rate} 
                                onChange={(e) => handleUpdateTax(t.id, 'rate', e.target.value)}
                                className="w-20 px-2 py-1 text-xs border border-slate-200 rounded font-semibold focus:ring-2 focus:ring-purple-500 outline-none" 
                              />
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={() => handleToggleTax(t.id)}
                                className={`w-9 h-5 rounded-full transition-colors relative ${t.active ? 'bg-purple-600' : 'bg-slate-200'}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${t.active ? 'translate-x-4' : 'translate-x-0'}`} />
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleRemoveTax(t.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleSaveLogistics}
                    disabled={isSavingLogistics}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all tracking-wide uppercase flex items-center gap-2 shadow-md shadow-purple-100"
                  >
                    {isSavingLogistics ? 'Processing...' : 'Save Logistics Parameters'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pending Execution Queue</p>
                  <h3 className="text-xl font-black mt-1 text-yellow-400">{fmt(pendingTotal)}</h3>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Released Settlement Assets</p>
                  <h3 className="text-xl font-black mt-1 text-green-400">{fmt(releasedTotal)}</h3>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total System Injections</p>
                  <h3 className="text-xl font-black mt-1 text-purple-400">{overrideCount} Adjustments</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">Recipient Structure</th>
                        <th className="p-4">Operational Class</th>
                        <th className="p-4">Net Allocation</th>
                        <th className="p-4">Maturity Date</th>
                        <th className="p-4">Fulfillment Status</th>
                        <th className="p-4 text-right">Execution Controls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRows.map((row) => (
                        <tr key={row.id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{row.recipient}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${row.type === 'Vendor' ? 'bg-orange-100 text-orange-600' : 'bg-pink-100 text-pink-600'}`}>{row.type}</span>
                          </td>
                          <td className="p-4 font-bold text-slate-800">{fmt(row.amount)}</td>
                          <td className="p-4 font-semibold text-slate-400">{row.due}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{row.status}</span>
                          </td>
                          <td className="p-4 text-right">
                            {row.status === 'Pending' ? (
                              <button 
                                onClick={() => triggerReleasePayoutModal(row)}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Release Payout
                              </button>
                            ) : (
                              <span className="text-xs font-bold text-green-600 flex items-center justify-end gap-1">✓ Cleared</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Verification Payout Modal Overlay */}
      {payoutModal.isOpen && payoutModal.row && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-base font-bold text-slate-900">Authorize Platform Disbursal</h3>
            <p className="text-xs text-slate-400 mt-1">Confirming this step instantly releases cleared system funds ledger-wide.</p>
            
            <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursal Target Amount</p>
              <p className="text-xl font-black text-slate-900">{fmt(payoutModal.row.amount)}</p>
              <p className="text-xs font-semibold text-purple-600 mt-1">To: {payoutModal.row.recipient}</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setPayoutModal({ isOpen: false, row: null })}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPayout}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-purple-100"
              >
                Confirm Release
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}