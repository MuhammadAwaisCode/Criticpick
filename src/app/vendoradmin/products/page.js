'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { useVendorData } from '../context/VendorDataContext';

export default function ProductsListPage() {
  const { products, deleteProduct, triggerToast } = useVendorData() || { products: [] };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Local fallback data if context is empty
  const defaultProducts = [
    {
      id: 'prod-101',
      title: 'Advanced Retinol Rejuvenator Serum',
      category: 'Skincare',
      price: '$49.00',
      stock: 124,
      variantsCount: 3,
      status: 'Active',
      updatedAt: '2026-07-28'
    },
    {
      id: 'prod-102',
      title: 'Organic Vitamin C Glow Face Oil',
      category: 'Beauty',
      price: '$35.00',
      stock: 8,
      variantsCount: 2,
      status: 'Active',
      updatedAt: '2026-07-25'
    },
    {
      id: 'prod-103',
      title: 'Hydrating Botanical Body Balm',
      category: 'Wellness',
      price: '$28.00',
      stock: 0,
      variantsCount: 1,
      status: 'Out of Stock',
      updatedAt: '2026-07-20'
    }
  ];

  const listData = (products && products.length > 0) ? products : defaultProducts;

  // Filter Logic
  const filteredProducts = listData.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id, title) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      if (deleteProduct) {
        deleteProduct(id);
      } else if (triggerToast) {
        triggerToast('Product removed.', 'info');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your inventory, prices, and product configurations.</p>
        </div>
        <Link
          href="/vendoradmin/products/add"
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
        </div>

        {/* Category & Status Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 w-1/2 md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="All">All Categories</option>
              <option value="Beauty">Beauty</option>
              <option value="Wellness">Wellness</option>
              <option value="Skincare">Skincare</option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No products found matching your active filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                          <PackageCheck className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.variantsCount || 1} variants configured</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{item.category}</td>
                    <td className="p-4 font-bold text-slate-900">{item.price || '$39.00'}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${item.stock === 0 ? 'text-red-500' : item.stock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {item.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/vendoradmin/products/edit/${item.id}`}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}