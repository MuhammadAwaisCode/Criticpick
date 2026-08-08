'use client';

/* ==========================================================
   VENDOR DATA CONTEXT
   ----------------------------------------------------------
   The original monolithic page.js kept `inventory`, `orders`
   and `toasts` in useState at the top of one component, so
   every "tab" (really just a conditional render) shared the
   same state automatically.

   Now that each tab is a real route (/vendoradmin,
   /vendoradmin/products/add, /vendoradmin/orders,
   /vendoradmin/inventory), navigating between them unmounts
   the previous page. Plain useState would reset on every
   navigation, so publishing a product would no longer show
   up in Inventory, status updates wouldn't reflect on the
   Overview tab, etc.

   This provider is mounted once in vendoradmin/layout.js
   (which persists across child route navigations) and holds
   the shared state + handlers so all four pages stay in sync,
   exactly like the original single-component version did.
   ========================================================== */

import { createContext, useContext, useState } from 'react';

const VendorDataContext = createContext(null);

/* ---------- static config shared across pages ---------- */
export const statusFlow = ['Pending', 'Processing', 'Dispatched', 'Shipped'];

export const statusColor = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-600',
  Dispatched: 'bg-purple-100 text-purple-600',
  Shipped: 'bg-green-100 text-green-600'
};

export const titles = {
  overview: 'Seller Overview',
  engine: 'Product Engine',
  orders: 'Order Pipeline',
  inventory: 'Inventory Matrix'
};

/* ---------- shared utility helpers ---------- */
export const fmt = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const stockBadge = (stock) => {
  if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600' };
  if (stock <= 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'In Stock', color: 'bg-green-100 text-green-600' };
};

/* ---------- seed data (unchanged from the monolith) ---------- */
const initialInventory = [
  { sku: 'LB-SER-001', name: 'Rose Glow Facial Serum', category: 'Beauty', stock: 42 },
  { sku: 'LB-CRM-002', name: 'Vitamin C Day Cream', category: 'Beauty', stock: 6 },
  { sku: 'LB-MSK-003', name: 'Charcoal Detox Mask', category: 'Beauty', stock: 0 },
  { sku: 'LB-TON-004', name: 'Hydrating Toner 200ml', category: 'Beauty', stock: 18 },
  { sku: 'LB-OIL-005', name: 'Argan Hair Oil', category: 'Beauty', stock: 4 },
  { sku: 'LB-SUN-006', name: 'SPF50 Sunscreen Gel', category: 'Beauty', stock: 27 },
  { sku: 'LB-LIP-007', name: 'Tinted Lip Balm Trio', category: 'Beauty', stock: 9 },
  { sku: 'LB-CLE-008', name: 'Foaming Face Cleanser', category: 'Beauty', stock: 0 }
];

const initialOrders = [
  { id: 'ORD-8841', customer: 'Amara K.', country: 'United States', items: 'Rose Glow Facial Serum x2', total: 49.98, status: 'Pending' },
  { id: 'ORD-8842', customer: 'Yusuf T.', country: 'United Arab Emirates', items: 'Vitamin C Day Cream x1', total: 27.50, status: 'Processing' },
  { id: 'ORD-8843', customer: 'Elena R.', country: 'Germany', items: 'Hydrating Toner x1, SPF50 Sunscreen x1', total: 41.20, status: 'Dispatched' },
  { id: 'ORD-8844', customer: 'Hamid R.', country: 'Pakistan', items: 'Tinted Lip Balm Trio x1', total: 15.99, status: 'Shipped' },
  { id: 'ORD-8845', customer: 'Sofia M.', country: 'Spain', items: 'Argan Hair Oil x1', total: 18.75, status: 'Pending' }
];

export function VendorDataProvider({ children }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [orders, setOrders] = useState(initialOrders);
  const [toasts, setToasts] = useState([]);

  const triggerToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleUpdateOrderStatus = (orderId, targetStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: targetStatus } : o))
    );
    triggerToast(`${orderId} moved to "${targetStatus}".`, 'info');
  };

  const handleAdjustInventoryStock = (sku, offset) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.sku === sku ? { ...item, stock: Math.max(0, item.stock + offset) } : item
      )
    );
  };

  // Called from the Product Engine on publish — pushes the new SKU into
  // shared inventory, exactly like the monolith's handlePublishProduct did.
  const publishProduct = ({ title, category, variants }) => {
    const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 15;
    const newSku = variants[0]?.sku || `LB-NEW-${Math.floor(Math.random() * 900 + 100)}`;

    setInventory((prev) => [
      { sku: newSku, name: title, category, stock: totalStock },
      ...prev
    ]);

    triggerToast(
      `"${title}" published with ${variants.length} variant(s) across international configurations.`,
      'success'
    );
  };

  const value = {
    inventory,
    orders,
    toasts,
    triggerToast,
    handleUpdateOrderStatus,
    handleAdjustInventoryStock,
    publishProduct
  };

  return (
    <VendorDataContext.Provider value={value}>
      {children}
    </VendorDataContext.Provider>
  );
}

export function useVendorData() {
  const ctx = useContext(VendorDataContext);
  if (!ctx) {
    throw new Error('useVendorData() must be called within a <VendorDataProvider>');
  }
  return ctx;
}