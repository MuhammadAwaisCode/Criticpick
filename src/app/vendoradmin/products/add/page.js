'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { 
  UploadCloud, X, Plus, Trash2, ArrowLeft, 
  FlipHorizontal, FlipVertical, Crop, RotateCcw, Check, Star, Scale, Tag, Search
} from 'lucide-react';

export default function AddProductPage() {
  const router = useRouter();

  // Core Product Data
  const [title, setTitle] = useState('');
  const [taxonomy, setTaxonomy] = useState('Beauty Matrix');
  const [description, setDescription] = useState('');
  const [crossBorder, setCrossBorder] = useState(false);

  // Tags & Keywords State
  const [tags, setTags] = useState(['Skincare', 'Serum', 'Organic']);
  const [tagInput, setTagInput] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Pricing & Inventory
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('');

  // Weight & Shipping Dimensions
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [dimLength, setDimLength] = useState('');
  const [dimWidth, setDimWidth] = useState('');
  const [dimHeight, setDimHeight] = useState('');

  // Media & Photo Editor States
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [primaryIndex, setPrimaryIndex] = useState(0);

  // Variant Matrix State
  const [variants, setVariants] = useState([]);

  // Editor Sliders Initial State
  const initialEditState = {
    zoom: 100,
    rotate: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    flipH: false,
    flipV: false
  };

  const [editSettings, setEditSettings] = useState(initialEditState);

  // Add Tag on Enter or Comma
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,/g, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Upload Handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (selectedIndex >= index && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleReset = () => setEditSettings(initialEditState);

  const addVariant = () => {
    setVariants([...variants, { dimension: '', palette: '', sku: '', stock: '' }]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-xl font-bold text-gray-900">Product Engine</h1>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. Core Product Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                PRODUCT CORE TITLE
              </label>
              <input
                type="text"
                placeholder="e.g. Advanced Retinol Rejuvenator Serum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                TAXONOMY GROUP
              </label>
              <select
                value={taxonomy}
                onChange={(e) => setTaxonomy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Beauty Matrix">Beauty Matrix</option>
                <option value="Skincare">Skincare</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              PRODUCT DESCRIPTION & DETAILS
            </label>
            <textarea
              rows={3}
              placeholder="Enter product description, ingredients, or key specifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Cross Border Distribution Switch */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Automated Cross Border Distribution</h4>
              <p className="text-xs text-gray-500">Auto-convert pricing logs to active regional centers globally (USD/EUR/GBP).</p>
            </div>
            <button
              type="button"
              onClick={() => setCrossBorder(!crossBorder)}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${crossBorder ? 'bg-black justify-end' : 'bg-gray-300 justify-start'}`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* 2. Tags & SEO Keywords Section (NEW) */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 flex items-center gap-2">
            <Tag size={14} /> TAGS & SEO KEYWORDS
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Interactive Product Tags */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Product Tags <span className="text-gray-400">(Type tag & press Enter or Comma)</span>
              </label>
              <div className="border border-gray-300 rounded-lg p-2 focus-within:ring-1 focus-within:ring-black flex flex-wrap gap-2 items-center bg-white min-h-[42px]">
                {tags.map((tag, idx) => (
                  <span key={idx} className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={tags.length === 0 ? "Add tag..." : ""}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
                />
              </div>
            </div>

            {/* SEO Meta Keywords */}
            <div>
              <label className="block text-xs text-gray-600 mb-1 flex items-center gap-1">
                <Search size={12} /> Search Engine Meta Keywords
              </label>
              <input
                type="text"
                placeholder="e.g. anti-aging, serum, retinol, face glow"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* 3. Pricing & Inventory */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 border-b pb-2">
            PRICING & INVENTORY MANAGEMENT
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Base Price ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Compare Price ($)</label>
              <input
                type="number"
                placeholder="0.00"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">SKU Code</label>
              <input
                type="text"
                placeholder="PROD-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Available Stock</label>
              <input
                type="number"
                placeholder="100"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* 4. Weight & Shipping Dimensions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 flex items-center gap-2">
            <Scale size={14} /> WEIGHT & SHIPPING DIMENSIONS
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Item Weight</label>
              <div className="flex">
                <input
                  type="number"
                  placeholder="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="border border-gray-300 rounded-r-lg px-2 bg-gray-50 text-xs focus:outline-none"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Length (cm)</label>
              <input
                type="number"
                placeholder="0"
                value={dimLength}
                onChange={(e) => setDimLength(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Width (cm)</label>
              <input
                type="number"
                placeholder="0"
                value={dimWidth}
                onChange={(e) => setDimWidth(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Height (cm)</label>
              <input
                type="number"
                placeholder="0"
                value={dimHeight}
                onChange={(e) => setDimHeight(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </div>

        {/* 5. Media & Photo Editing Suite */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              PRODUCT IMAGES & VIDEOS
            </label>
            <span className="text-xs text-gray-400">
              US Files - Primary: {images[primaryIndex]?.file?.name || 'None'}
            </span>
          </div>

          <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition">
            <UploadCloud className="w-8 h-8 text-orange-500 mb-2" />
            <p className="text-sm font-medium text-gray-700">
              Drop images or videos here or <span className="text-orange-600 underline">browse</span>
            </p>
            <span className="text-xs text-gray-400 mt-1">Images & Videos - up to 5 MB each</span>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-14 h-14 rounded-lg border-2 cursor-pointer overflow-hidden flex-shrink-0 ${selectedIndex === idx ? 'border-orange-500' : 'border-gray-200'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                  {primaryIndex === idx && (
                    <span className="absolute bottom-0 inset-x-0 bg-orange-500 text-[8px] text-white text-center font-bold">
                      PRIMARY
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900 rounded-xl p-4 text-white mt-4">
              <div className="md:col-span-7 h-80 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative">
                <img
                  src={images[selectedIndex]?.url}
                  alt="Preview"
                  style={{
                    filter: `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%) saturate(${editSettings.saturation}%)`,
                    transform: `scale(${editSettings.zoom / 100}) rotate(${editSettings.rotate}deg) scaleX(${editSettings.flipH ? -1 : 1}) scaleY(${editSettings.flipV ? -1 : 1})`,
                    transition: 'transform 0.1s ease, filter 0.1s ease'
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="md:col-span-5 space-y-3 text-xs flex flex-col justify-between">
                <div className="space-y-2">
                  {[
                    { label: 'Zoom', key: 'zoom', min: 50, max: 200, unit: '%' },
                    { label: 'Rotate', key: 'rotate', min: 0, max: 360, unit: '°' },
                    { label: 'Brightness', key: 'brightness', min: 0, max: 200, unit: '%' },
                    { label: 'Contrast', key: 'contrast', min: 0, max: 200, unit: '%' },
                    { label: 'Saturation', key: 'saturation', min: 0, max: 200, unit: '%' }
                  ].map(({ label, key, min, max, unit }) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-20 text-gray-400">{label}</span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={editSettings[key]}
                        onChange={(e) => setEditSettings({ ...editSettings, [key]: Number(e.target.value) })}
                        className="w-full accent-orange-500 h-1 bg-gray-700 rounded-lg cursor-pointer"
                      />
                      <span className="w-10 text-right font-mono">{editSettings[key]}{unit}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditSettings({ ...editSettings, flipH: !editSettings.flipH })}
                    className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-[10px]"
                  >
                    <FlipHorizontal size={12} /> Flip H
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditSettings({ ...editSettings, flipV: !editSettings.flipV })}
                    className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-[10px]"
                  >
                    <FlipVertical size={12} /> Flip V
                  </button>
                  <button type="button" className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-[10px]">
                    <Crop size={12} /> Crop
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 py-1.5 rounded text-[10px]"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPrimaryIndex(selectedIndex)}
                    className="flex-1 border border-slate-700 hover:bg-slate-800 py-1.5 rounded flex items-center justify-center gap-1 text-[11px]"
                  >
                    <Star size={12} className={primaryIndex === selectedIndex ? 'fill-orange-500 text-orange-500' : ''} /> Set primary
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Edits Applied')}
                    className="flex-1 bg-black text-white hover:bg-gray-900 py-1.5 rounded font-semibold flex items-center justify-center gap-1 text-[11px]"
                  >
                    <Check size={12} /> Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Variant Matrix Table */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              PRODUCT VARIANT MATRIX CONFIGURATIONS
            </label>
            <button
              type="button"
              onClick={addVariant}
              className="text-orange-600 hover:text-orange-700 text-xs font-semibold flex items-center gap-1"
            >
              <Plus size={14} /> Append Variant Line
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                  <th className="p-3">Dimensions / Vol</th>
                  <th className="p-3">Palette / Hue</th>
                  <th className="p-3">Assigned SKU Label</th>
                  <th className="p-3">Initial Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {variants.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-400 italic">
                      No variant configurations added to processing array yet.
                    </td>
                  </tr>
                ) : (
                  variants.map((v, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2"><input type="text" className="w-full border rounded px-2 py-1" placeholder="e.g. 50ml" /></td>
                      <td className="p-2"><input type="text" className="w-full border rounded px-2 py-1" placeholder="e.g. Red" /></td>
                      <td className="p-2"><input type="text" className="w-full border rounded px-2 py-1" placeholder="SKU-001" /></td>
                      <td className="p-2"><input type="number" className="w-full border rounded px-2 py-1" placeholder="100" /></td>
                      <td className="p-2 text-right">
                        <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-500 p-1">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setTitle(''); setDescription(''); setPrice(''); setComparePrice('');
              setSku(''); setStock(''); setWeight(''); setDimLength(''); setDimWidth('');
              setDimHeight(''); setTags([]); setMetaKeywords(''); setImages([]); setVariants([]);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            Clear Changes
          </button>
          <button
            type="button"
            onClick={() => alert('Product Catalog Published Successfully!')}
            className="px-5 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-800"
          >
            Commit & Publish Catalog Entry
          </button>
        </div>

      </div>
    </div>
  );
}