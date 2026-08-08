'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, CheckCircle } from 'lucide-react';
import { useVendorData } from '../../../context/VendorDataContext';

export default function EditProductPage() {
  const { id } = useParams();
  const router = Router = useRouter();
  const { triggerToast } = useVendorData() || {};

  const [title, setTitle] = useState('Advanced Retinol Rejuvenator Serum');
  const [category, setCategory] = useState('Skincare');
  const [price, setPrice] = useState('49.00');
  const [stock, setStock] = useState('124');
  const [status, setStatus] = useState('Active');
  const [description, setDescription] = useState('High-performance retinol formula designed to support skin texture and tone.');

  const handleSave = (e) => {
    e.preventDefault();
    if (triggerToast) triggerToast('Product updated successfully!', 'success');
    setTimeout(() => {
      router.push('/vendoradmin/products');
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/vendoradmin/products"
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-xs text-slate-400">ID: {id}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* Edit Form Card */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none bg-white"
            >
              <option value="Beauty">Beauty</option>
              <option value="Wellness">Wellness</option>
              <option value="Skincare">Skincare</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Units</label>
            <input
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none bg-white"
            >
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (confirm('Delete this product permanently?')) {
                router.push('/vendoradmin/products');
              }
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Remove Product
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
          >
            Update Catalog Entry
          </button>
        </div>
      </form>
    </div>
  );
}