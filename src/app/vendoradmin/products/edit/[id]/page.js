'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Loader2, UploadCloud, X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  /* Form States */
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Skincare');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('0');
  const [sku, setSku] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState('published');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [variants, setVariants] = useState([]);

  /* UI Statuses */
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Fetch Product Details */
  useEffect(() => {
    if (!id) return;

    async function fetchProductDetails() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setTitle(data.name || '');
          setCategory(data.category || 'Skincare');
          setPrice(data.price !== undefined ? String(data.price) : '');
          setComparePrice(data.compare_at_price ? String(data.compare_at_price) : '');
          setStock(data.stock !== undefined ? String(data.stock) : '0');
          setSku(data.sku || '');
          setWeight(data.weight !== undefined ? String(data.weight) : '');
          setStatus(data.status || 'published');
          setDescription(data.description || '');
          setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '');
          setImages(Array.isArray(data.images) ? data.images : data.image_url ? [data.image_url] : []);
          setVariants(Array.isArray(data.variants) ? data.variants : []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        showToast('Failed to load product details.', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetails();
  }, [id]);

  /* Storage Image Upload */
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    const uploadedUrls = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) uploadedUrls.push(publicUrlData.publicUrl);
      } catch (err) {
        showToast('Image upload failed.', 'error');
      }
    }

    setImages((prev) => [...prev, ...uploadedUrls]);
    setUploadingImage(false);
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  /* Variant Helpers */
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: Date.now(), name: '', size: '', color: '', price: price || '', stock: stock || '5' }
    ]);
  };

  const updateVariant = (vId, field, val) => {
    setVariants((prev) => prev.map((v) => (v.id === vId ? { ...v, [field]: val } : v)));
  };

  const removeVariant = (vId) => setVariants((prev) => prev.filter((v) => v.id !== vId));

  /* Update Product */
  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return showToast('Title is required', 'error');

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: title.trim(),
          category,
          price: Number(price),
          compare_at_price: comparePrice ? Number(comparePrice) : null,
          stock: Number(stock),
          sku,
          weight: Number(weight) || 0,
          status,
          description,
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
          images: images,
          image_url: images[0] || null,
          variants: variants,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showToast('Product updated successfully!', 'success');
      setTimeout(() => router.push('/vendoradmin/products'), 800);
    } catch (err) {
      showToast(err.message || 'Failed to update product.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /* Delete Product */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product permanently?')) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      showToast('Product deleted.', 'success');
      setTimeout(() => router.push('/vendoradmin/products'), 800);
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {toast && (
        <div className="fixed top-20 right-6 z-[99999]">
          <div className={`px-4 py-3 rounded-xl shadow-xl text-white text-xs font-semibold flex items-center gap-2 ${toast.type === 'success' ? 'bg-slate-900' : 'bg-red-600'}`}>
            <span className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-white'}`} />
            {toast.message}
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vendoradmin/products" className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-xs text-slate-400">ID: {id}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Product Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold bg-white outline-none"
              >
                <option value="Skincare">Skincare</option>
                <option value="Beauty">Beauty</option>
                <option value="Wellness">Wellness</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pricing & Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Price (PKR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Original Price</label>
              <input
                type="number"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Stock Units</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white outline-none"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Management */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Product Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative h-28 rounded-xl border border-slate-200 overflow-hidden group">
                <img src={url} alt="Product" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="h-28 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
              {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />}
              <span className="text-[10px] font-bold text-slate-500">Add Image</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Variants Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Variants</h2>
            <button type="button" onClick={addVariant} className="text-xs text-slate-900 font-bold flex items-center gap-1 hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v) => (
              <div key={v.id} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Variant Title"
                  value={v.name}
                  onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                />
                <input
                  type="text"
                  placeholder="Size"
                  value={v.size}
                  onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => updateVariant(v.id, 'stock', e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                />
                <div className="flex items-center justify-end">
                  <button type="button" onClick={() => removeVariant(v.id)} className="text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete Product
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? 'Updating...' : 'Save Product Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}