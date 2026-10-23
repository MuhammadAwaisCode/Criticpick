'use client';

import React, { useState, useEffect } from 'react';
import { 
  Eye, Printer, Search, Loader2, PackageCheck, Truck, 
  ChevronLeft, ChevronRight, CheckSquare, Square, X, Phone, MapPin, CreditCard 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const STATUS_FLOW = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLOR = {
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  Shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const COURIER_PROVIDERS = ['TCS', 'Leopards', 'Trax', 'CallCourier', 'M&P', 'PostEx'];

export default function OrderPipelinePage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal Control States
  const [activeSlipOrder, setActiveSlipOrder] = useState(null);
  const [shippingTargetOrder, setShippingTargetOrder] = useState(null);
  const [courierName, setCourierName] = useState('TCS');
  const [trackingId, setTrackingId] = useState('');

  // 1. Fetch Paginated & Filtered Orders from Supabase
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });

      // Apply Status Filter Tab
      if (activeTab !== 'All') {
        query = query.eq('status', activeTab);
      }

      // Apply Search (Order ID, Customer Name, or Phone)
      if (searchQuery.trim() !== '') {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(`customer.ilike.${q},phone.ilike.${q},id.ilike.${q}`);
      }

      // Pagination Range (Limit / Offset)
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error loading orders:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, activeTab, searchQuery]);

  // 2. Handle Individual Status Changes
  const handleStatusSelect = (order, newStatus) => {
    if (newStatus === 'Shipped') {
      // Trigger Courier Information Modal
      setShippingTargetOrder(order);
      setCourierName('TCS');
      setTrackingId('');
    } else {
      updateOrderStatusInDB(order.id, { status: newStatus });
    }
  };

  // Direct Database Status Update
  const updateOrderStatusInDB = async (orderId, payload) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...payload } : o))
    );

    try {
      const { error } = await supabase
        .from('orders')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update status:', err.message);
      fetchOrders();
    }
  };

  // 3. Confirm Shipping Modal Action
  const confirmShipment = async (e) => {
    e.preventDefault();
    if (!shippingTargetOrder || !trackingId.trim()) return;

    await updateOrderStatusInDB(shippingTargetOrder.id, {
      status: 'Shipped',
      courier_name: courierName,
      tracking_id: trackingId.trim(),
    });

    setShippingTargetOrder(null);
  };

  // 4. Bulk Checkbox Handlers
  const handleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Status Update Action
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;

    setOrders((prev) =>
      prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status: newStatus } : o))
    );

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk update failed:', err.message);
      fetchOrders();
    }
  };

  const fmtCurrency = (val) => `PKR ${Number(val || 0).toLocaleString()}`;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-lg font-black tracking-tight text-slate-900">Order Pipeline</h1>
        
        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold animate-fade-in">
            <span>{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-slate-700 my-auto" />
            <button
              onClick={() => handleBulkStatusChange('Processing')}
              className="hover:text-blue-300 cursor-pointer"
            >
              Mark Processing
            </button>
            <button
              onClick={() => handleBulkStatusChange('Delivered')}
              className="hover:text-emerald-300 cursor-pointer"
            >
              Mark Delivered
            </button>
            <button
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="hover:text-amber-300 cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3 h-3" /> Print Selected
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 bg-white p-2.5 border border-slate-200 rounded-2xl flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search Order ID, Name, Phone..."
            className="w-full text-xs font-semibold px-1 outline-none bg-transparent"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-xs font-bold">
          {['All', ...STATUS_FLOW].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold">Loading Pipeline Data...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <PackageCheck className="w-8 h-8 stroke-1" />
            <span className="text-xs font-semibold">No orders matched your active criteria.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="cursor-pointer text-slate-400 hover:text-slate-700">
                      {selectedIds.length === orders.length && orders.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Waybill ID</th>
                  <th className="py-3.5 px-4">Customer & Contact</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Manifest</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Gross Bill</th>
                  <th className="py-3.5 px-4">Tracking Info</th>
                  <th className="py-3.5 px-4">Status State</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {orders.map((o) => {
                  const isSelected = selectedIds.includes(o.id);
                  return (
                    <tr key={o.id} className={`hover:bg-slate-50/40 transition-colors ${isSelected ? 'bg-slate-50/80' : ''}`}>
                      <td className="py-3.5 px-4 text-center">
                        <button onClick={() => toggleSelectOrder(o.id)} className="cursor-pointer text-slate-400">
                          {isSelected ? <CheckSquare className="w-4 h-4 text-slate-900" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        #{String(o.id).slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{o.customer || 'Guest Customer'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{o.phone || 'No Contact'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{o.city || o.country || 'Local'}</td>
                      <td className="py-3.5 px-4 max-w-[150px] truncate" title={o.items}>
                        {typeof o.items === 'object' ? JSON.stringify(o.items) : o.items || 'Package Details'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.payment_status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {o.payment_status || 'COD'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{fmtCurrency(o.total)}</td>
                      <td className="py-3.5 px-4">
                        {o.tracking_id ? (
                          <div className="flex flex-col text-[10px]">
                            <span className="font-bold text-indigo-700">{o.courier_name}</span>
                            <span className="font-mono text-slate-400">{o.tracking_id}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono text-[10px]">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={o.status || 'Pending'}
                          onChange={(e) => handleStatusSelect(o, e.target.value)}
                          className={`font-bold text-[11px] rounded-lg border-0 outline-none px-2 py-1.5 cursor-pointer ${
                            STATUS_COLOR[o.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {STATUS_FLOW.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveSlipOrder(o)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Showing Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong> ({totalCount} items)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚚 COURIER & LOGISTICS MODAL (Triggered on status change to 'Shipped') */}
      {shippingTargetOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={confirmShipment} className="bg-white rounded-2xl max-w-sm w-full border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">Shipment Details</h3>
              </div>
              <button onClick={() => setShippingTargetOrder(null)} type="button" className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter courier & consignment tracking details for order <strong className="font-mono text-slate-800">#{shippingTargetOrder.id}</strong>.
            </p>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Courier Service</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 bg-slate-50"
                >
                  {COURIER_PROVIDERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tracking / Consignment ID</label>
                <input
                  type="text"
                  required
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. TRK-9908123"
                  className="w-full p-2 border border-slate-200 rounded-xl outline-none font-mono text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShippingTargetOrder(null)}
                className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
              >
                Dispatch Order
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 📄 INSPECTION SLIP MODAL */}
      {activeSlipOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Waybill & Consignee Manifest</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  Ref ID: <span className="font-mono text-slate-700">{activeSlipOrder.id}</span>
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_COLOR[activeSlipOrder.status]}`}>
                {activeSlipOrder.status}
              </span>
            </div>

            <div className="space-y-3 text-xs font-semibold text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Consignee Contact:</span>
                <span className="text-slate-900 text-right">
                  {activeSlipOrder.customer} ({activeSlipOrder.phone || 'N/A'})
                </span>
              </div>
              
              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Address:</span>
                <span className="text-slate-900 text-right max-w-[200px]">
                  {activeSlipOrder.address || activeSlipOrder.city || 'Standard Delivery'}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-1.5">
                <span className="text-slate-400 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Payment Method:</span>
                <span className="text-slate-900 font-bold">{activeSlipOrder.payment_status || 'COD'}</span>
              </div>

              {activeSlipOrder.tracking_id && (
                <div className="flex justify-between border-b border-slate-50 pb-1.5 bg-indigo-50/50 p-2 rounded-xl">
                  <span className="text-indigo-600 flex items-center gap-1"><Truck className="w-3 h-3" /> Courier Tracker:</span>
                  <span className="text-indigo-900 font-mono font-bold">
                    {activeSlipOrder.courier_name} - {activeSlipOrder.tracking_id}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1 border-b border-slate-50 pb-1.5">
                <span className="text-slate-400">Manifest Declaration:</span>
                <span className="text-slate-900 bg-slate-50 p-2 rounded-lg font-mono text-[11px] mt-1">
                  {typeof activeSlipOrder.items === 'object' ? JSON.stringify(activeSlipOrder.items) : activeSlipOrder.items}
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-slate-400 font-bold">Total Assessment Bill:</span>
                <span className="text-sm font-black text-slate-900">{fmtCurrency(activeSlipOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveSlipOrder(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Dismiss Modal
              </button>
              <button
                type="button"
                onClick={() => typeof window !== 'undefined' && window.print()}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}