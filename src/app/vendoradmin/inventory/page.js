'use client';

import { useState, useRef } from 'react';
import { AlertTriangle, X, Plus, Minus, ArrowRight } from 'lucide-react';
import { useVendorData, stockBadge, titles } from '../context/VendorDataContext';

export default function InventoryMatrixPage() {
  const { inventory, handleAdjustInventoryStock } = useVendorData();

  const [inventorySearch, setInventorySearch] = useState('');
  const [alertBannerDismissed, setAlertBannerDismissed] = useState(false);
  const [highlightAlerts, setHighlightAlerts] = useState(false);
  const inventoryGridRef = useRef(null);

  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;
  const lowStockOnlyCount = inventory.filter((i) => i.stock > 0 && i.stock <= 10).length;
  const showAlertBanner = !alertBannerDismissed && (outOfStockCount > 0 || lowStockOnlyCount > 0);
  const filteredInventory = inventory.filter((i) =>
    i.name.toLowerCase().includes(inventorySearch.trim().toLowerCase()) ||
    i.sku.toLowerCase().includes(inventorySearch.trim().toLowerCase())
  );

  const handleViewAlertDetails = () => {
    inventoryGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightAlerts(true);
    setTimeout(() => setHighlightAlerts(false), 2500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-lg font-black tracking-tight text-slate-900 mb-6">{titles.inventory}</h1>

      <div className="space-y-6 animate-fade-in">
        {showAlertBanner && (
          <div className="relative bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 leading-relaxed">
                Alert: You have <span className="font-black">{outOfStockCount}</span> item{outOfStockCount !== 1 ? 's' : ''} out of stock and{' '}
                <span className="font-black">{lowStockOnlyCount}</span> item{lowStockOnlyCount !== 1 ? 's' : ''} with low inventory.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
              <button
                type="button" onClick={handleViewAlertDetails}
                className="text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                View Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button" onClick={() => setAlertBannerDismissed(true)} aria-label="Dismiss alert"
                className="w-8 h-8 rounded-lg border border-amber-200 text-amber-500 hover:bg-amber-100 flex items-center justify-center flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="w-full bg-white p-3 border border-slate-200 rounded-2xl">
          <input
            type="text" value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)}
            placeholder="Query system catalogs by product nomenclature name or explicit SKU strings..."
            className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-100 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-50/50"
          />
        </div>

        <div ref={inventoryGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInventory.length === 0 ? (
            <p className="col-span-full text-center text-xs text-slate-400 py-10">No stock entities intersect with matching string selection logs.</p>
          ) : (
            filteredInventory.map((item) => {
              const badge = stockBadge(item.stock);
              const isFlagged = item.stock <= 10;
              return (
                <div
                  key={item.sku}
                  className={`bg-white border rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-sm transition-all ${
                    highlightAlerts && isFlagged
                      ? 'border-amber-400 ring-2 ring-amber-300 ring-offset-2'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight leading-snug">{item.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.sku} · <span className="font-sans font-semibold">{item.category}</span></p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${badge.color}`}>{badge.label}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <button
                        type="button" onClick={() => handleAdjustInventoryStock(item.sku, -1)}
                        className="w-7 h-7 rounded-full border border-slate-200 font-bold text-slate-500 flex items-center justify-center hover:bg-slate-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-black text-sm text-slate-800">{item.stock}</span>
                      <button
                        type="button" onClick={() => handleAdjustInventoryStock(item.sku, 1)}
                        className="w-7 h-7 rounded-full border border-slate-200 font-bold text-slate-500 flex items-center justify-center hover:bg-slate-50"
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
    </div>
  );
}