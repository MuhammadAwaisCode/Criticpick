'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, X, Plus, Minus, ArrowRight, Search, 
  Loader2, History, Check, Filter, Edit3 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function InventoryMatrixPage() {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inventorySearch, setInventorySearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'out' | 'low' | 'in'
  
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);
  const [highlightAlerts, setHighlightAlerts] = useState(false);
  const inventoryGridRef = useRef(null);

  // States for Direct Editing & Audit Logs
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState('');
  
  const [logModalItem, setLogModalItem] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // 1. Fetch Inventory Data
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, category, stock, low_stock_threshold, status')
        .order('name', { ascending: true });

      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 2. Core Stock Update & Audit Log Function
  const updateStockInDatabase = async (productId, newStock, oldStock, reason = 'Manual Adjustment') => {
    const finalStock = Math.max(0, Number(newStock));
    const changeAmount = finalStock - oldStock;
    if (changeAmount === 0) return;

    // Auto Status Sync Logic
    const newStatus = finalStock === 0 ? 'out_of_stock' : 'in_stock';

    // Optimistic UI Update
    setInventory((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, stock: finalStock, status: newStatus } : item
      )
    );

    try {
      // Step A: Update products table
      const { error: productErr } = await supabase
        .from('products')
        .update({ 
          stock: finalStock, 
          status: newStatus,
          updated_at: new Date().toISOString() 
        })
        .eq('id', productId);

      if (productErr) throw productErr;

      // Step B: Insert into inventory_logs (Audit History)
      const { error: logErr } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: productId,
          old_stock: oldStock,
          new_stock: finalStock,
          change_amount: changeAmount,
          reason: reason
        });

      if (logErr) throw logErr;

    } catch (err) {
      console.error('Failed to update stock:', err.message);
      // Revert UI on failure
      fetchInventory();
    }
  };

  // 3. Fetch Audit Logs for Modal
  const openAuditLogs = async (item) => {
    setLogModalItem(item);
    setIsLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .eq('product_id', item.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Error loading audit logs:', err.message);
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Dynamic Low Stock Badge Helper (Uses Per-Product Custom Threshold)
  const getStockBadge = (stock, threshold = 10) => {
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'bg-rose-100 text-rose-700 border-rose-200' };
    }
    if (stock <= threshold) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  // Inventory Aggregates & Alerts
  const outOfStockCount = inventory.filter((i) => (i.stock || 0) === 0).length;
  const lowStockOnlyCount = inventory.filter(
    (i) => (i.stock || 0) > 0 && (i.stock || 0) <= (i.low_stock_threshold || 10)
  ).length;

  const showAlertBanner = !alertBannerDismissed && (outOfStockCount > 0 || lowStockOnlyCount > 0);

  // Filter & Search Logic
  const filteredInventory = inventory.filter((item) => {
    const stock = item.stock || 0;
    const threshold = item.low_stock_threshold || 10;

    // Search query filter
    const matchesSearch =
      (item.name || '').toLowerCase().includes(inventorySearch.trim().toLowerCase()) ||
      (item.sku || '').toLowerCase().includes(inventorySearch.trim().toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (activeTab === 'out') matchesTab = stock === 0;
    if (activeTab === 'low') matchesTab = stock > 0 && stock <= threshold;
    if (activeTab === 'in') matchesTab = stock > threshold;

    return matchesSearch && matchesTab;
  });

  const handleViewAlertDetails = () => {
    setActiveTab('all');
    inventoryGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightAlerts(true);
    setTimeout(() => setHighlightAlerts(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-2 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-xs font-semibold">Loading Inventory Matrix...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-lg font-black tracking-tight text-slate-900">Inventory Matrix</h1>
      </div>

      <div className="space-y-6">
        {/* Low Stock Alert Banner */}
        {showAlertBanner && (
          <div className="relative bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed">
                Alert: You have <span className="font-black">{outOfStockCount}</span> item{outOfStockCount !== 1 ? 's' : ''} out of stock and{' '}
                <span className="font-black">{lowStockOnlyCount}</span> item{lowStockOnlyCount !== 1 ? 's' : ''} with custom low stock levels.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleViewAlertDetails}
                className="text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlertBannerDismissed(true)}
                className="w-8 h-8 rounded-lg border border-amber-200 text-amber-500 hover:bg-amber-100 flex items-center justify-center flex-shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Tabs Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="w-full sm:w-72 bg-white p-2.5 border border-slate-200 rounded-2xl flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full text-xs font-semibold px-2 py-1 rounded-xl outline-none bg-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('out')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'out' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Out ({outOfStockCount})
            </button>
            <button
              onClick={() => setActiveTab('low')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'low' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Low ({lowStockOnlyCount})
            </button>
            <button
              onClick={() => setActiveTab('in')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'in' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              In Stock ({inventory.length - outOfStockCount - lowStockOnlyCount})
            </button>
          </div>
        </div>

        {/* Grid Cards */}
        <div ref={inventoryGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.length === 0 ? (
            <p className="col-span-full text-center text-xs text-slate-400 py-10">
              No inventory items found matching your filter criteria.
            </p>
          ) : (
            filteredInventory.map((item) => {
              const threshold = item.low_stock_threshold || 10;
              const badge = getStockBadge(item.stock || 0, threshold);
              const isFlagged = (item.stock || 0) <= threshold;
              const isEditingThis = editingStockId === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all ${
                    highlightAlerts && isFlagged
                      ? 'border-amber-400 ring-2 ring-amber-300 ring-offset-2'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{item.name}</h4>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {item.sku} · <span className="font-sans font-semibold">{item.category}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider whitespace-nowrap border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-4">
                      <span>Low alert limit: <strong className="text-slate-700">{threshold}</strong></span>
                      <button
                        onClick={() => openAuditLogs(item)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
                      >
                        <History className="w-3 h-3" /> Logs
                      </button>
                    </div>
                  </div>

                  {/* Stock Controls (Direct Editing + Quick Increment) */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateStockInDatabase(item.id, (item.stock || 0) - 1, item.stock || 0, 'Quick Decrement')}
                        disabled={item.stock === 0}
                        className="w-7 h-7 rounded-full border border-slate-200 font-bold text-slate-500 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct Input Field Trigger */}
                      {isEditingThis ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            autoFocus
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateStockInDatabase(item.id, tempStockValue, item.stock || 0, 'Direct Stock Input');
                                setEditingStockId(null);
                              }
                            }}
                            className="w-14 text-center font-black text-sm text-slate-900 border border-slate-300 rounded-lg py-0.5 outline-none bg-slate-50"
                          />
                          <button
                            onClick={() => {
                              updateStockInDatabase(item.id, tempStockValue, item.stock || 0, 'Direct Stock Input');
                              setEditingStockId(null);
                            }}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingStockId(item.id);
                            setTempStockValue(item.stock || 0);
                          }}
                          className="w-12 text-center font-black text-sm text-slate-800 cursor-pointer hover:bg-slate-100 rounded-lg py-0.5 flex items-center justify-center gap-1 group"
                          title="Click to direct edit stock"
                        >
                          <span>{item.stock ?? 0}</span>
                          <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => updateStockInDatabase(item.id, (item.stock || 0) + 1, item.stock || 0, 'Quick Increment')}
                        className="w-7 h-7 rounded-full border border-slate-200 font-bold text-slate-500 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">units</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 📜 AUDIT LOGS MODAL */}
      {logModalItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Stock Audit History</h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  Product: <span className="text-slate-800 font-bold">{logModalItem.name}</span> ({logModalItem.sku})
                </p>
              </div>
              <button
                onClick={() => setLogModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logs List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
              {isLogsLoading ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Fetching audit logs...</span>
                </div>
              ) : auditLogs.length === 0 ? (
                <p className="text-center py-6 text-slate-400">No stock change logs recorded yet.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">{log.reason || 'Stock Update'}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs font-bold">
                      <span className="text-slate-400">{log.old_stock}</span>
                      <span className="text-slate-300">→</span>
                      <span className="text-slate-900">{log.new_stock}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        log.change_amount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setLogModalItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}