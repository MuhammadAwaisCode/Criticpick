'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useVendor } from '@/context/VendorContext';
import { createClient } from '@/lib/supabase/client';

const statusColor = {
  Pending: 'bg-amber-100 text-amber-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-purple-100 text-purple-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const catColors = ['bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500'];

export default function VendorOverviewPage() {
  const { vendorData } = useVendor();
  const [supabase] = useState(() => createClient());

  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Live Data from Supabase
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    // 1. Fetch Orders for this vendor
    const { data: fetchedOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, customer_name, country, status, created_at')
      .eq('vendor_id', user.id)
      .order('created_at', { ascending: false });

    if (!ordersError && fetchedOrders) {
      setOrders(
        fetchedOrders.map((o) => ({
          id: o.id.toString().substring(0, 8),
          customer: o.customer_name || 'Guest Customer',
          country: o.country || 'N/A',
          status: o.status || 'Pending',
        }))
      );
    }

    // 2. Fetch Products/Inventory for Category Allocation
    const { data: fetchedProducts, error: productsError } = await supabase
      .from('products')
      .select('id, category, stock')
      .eq('vendor_id', user.id);

    if (!productsError && fetchedProducts) {
      setInventory(
        fetchedProducts.map((p) => ({
          category: p.category || 'General',
          stock: Number(p.stock) || 0,
        }))
      );
    }

    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /* ---------- derived analytics ---------- */
  const activeOrderCount = orders.filter((o) => o.status !== 'Shipped' && o.status !== 'Delivered').length;

  const categoryStockMetrics = {};
  inventory.forEach((i) => {
    categoryStockMetrics[i.category] = (categoryStockMetrics[i.category] || 0) + i.stock;
  });

  const grandTotalStockUnits = Object.values(categoryStockMetrics).reduce((a, b) => a + b, 0) || 1;

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-lg font-black tracking-tight text-slate-900 mb-6">
        Overview — {vendorData?.storeName || 'Vendor Dashboard'}
      </h1>

      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backlog Metric */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Active Processing Backlog
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {activeOrderCount} <span className="text-xs text-slate-400 font-normal">orders</span>
            </p>
            <Link
              href="/vendoradmin/orders"
              className="text-xs text-orange-600 font-bold hover:underline mt-4 flex items-center gap-1"
            >
              Route Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Stock Metrics */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs md:col-span-2 space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Global Volumetric Allocation Profile
            </p>
            {Object.keys(categoryStockMetrics).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No inventory categories available yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(categoryStockMetrics).map(([cat, val], idx) => {
                  const pct = Math.round((val / grandTotalStockUnits) * 100);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{cat} Matrix</span>
                        <span className="text-slate-900">
                          {val} units ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`${catColors[idx % catColors.length]} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Log */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Recent Dispatched Log
            </h3>
            <Link href="/vendoradmin/orders" className="text-xs font-bold text-orange-600 hover:underline">
              Full Registry
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                  <th className="py-3 px-5">Identifier</th>
                  <th className="py-3 px-5">Consignee</th>
                  <th className="py-3 px-5">Target Territory</th>
                  <th className="py-3 px-5">Status Token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      No orders recorded in database yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-5 font-bold text-slate-900">#{o.id}</td>
                      <td className="py-3 px-5 text-slate-800">{o.customer}</td>
                      <td className="py-3 px-5">{o.country}</td>
                      <td className="py-3 px-5">
                        <span
                          className={`${
                            statusColor[o.status] || 'bg-slate-100 text-slate-700'
                          } px-2 py-0.5 rounded text-[10px] font-black`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}