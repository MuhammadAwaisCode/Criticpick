'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Pencil, Trash2, Loader2, Package, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((item) =>
    (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Products Listing</h1>
          <p className="text-xs text-slate-500">Manage, edit, or remove store products</p>
        </div>

        <Link
          href="/vendoradmin/products/add"
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* Control Bar: Search & Refresh */}
      <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-2xl">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          onClick={fetchProducts}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs font-semibold">Loading product list...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Package className="w-8 h-8 stroke-1" />
            <span className="text-xs font-semibold">No products found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((item) => {
                  const thumb = item.images?.[0] || item.image_url || '/placeholder.png';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Title & Image */}
                      <td className="p-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumb}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-50"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name || 'Untitled'}</p>
                            <p className="text-[10px] text-slate-400">SKU: {item.sku || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-medium">{item.category || 'Uncategorized'}</td>
                      
                      <td className="p-4 font-bold text-slate-900">
                        PKR {Number(item.price || 0).toLocaleString()}
                      </td>

                      <td className="p-4 text-slate-600 font-medium">{item.stock ?? 0} units</td>

                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'out_of_stock'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.status || 'draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Route Link */}
                          <Link
                            href={`/vendoradmin/products/edit/${item.id}`}
                            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                            title="Edit Product"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="p-1.5 border border-slate-200 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                            title="Delete Product"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}