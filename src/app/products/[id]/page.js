'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FiShoppingBag, 
  FiMinus, 
  FiPlus, 
  FiStar, 
  FiTruck, 
  FiShield, 
  FiRotateCcw, 
  FiHeart, 
  FiShare2, 
  FiCheck 
} from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function ProductDetailPage({ params }) {
  // Mock product details
  const product = {
    id: params?.id || '1',
    title: 'Premium Wireless Noise Canceling Headphones',
    price: 12500,
    originalPrice: 15000,
    rating: 4.5,
    reviewsCount: 128,
    vendor: 'TechZone Pakistan',
    inStock: true,
    description:
      'Experience high-fidelity sound with state-of-the-art active noise cancellation. Built for comfort during long listening sessions with up to 30 hours of battery life.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
    ],
    colors: ['#000000', '#3b82f6', '#e2e8f0'],
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
          <Link href="/" className="hover:text-purple-600 transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-purple-600 transition">Products</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* Product Layout Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-sm">
          
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 relative">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <button 
                className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:text-red-500 transition shadow-sm"
                title="Save to Wishlist"
              >
                <FiHeart className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedImage === idx ? 'border-purple-600 ring-2 ring-purple-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-md">
                  {product.vendor}
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <FiCheck /> In Stock
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-sm">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStarHalfAlt />
                </div>
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  PKR {product.price.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    PKR {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {product.description}
              </p>

              {/* Quantity Selection */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide block mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2.5 text-slate-600 hover:text-purple-600 transition"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-slate-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2.5 text-slate-600 hover:text-purple-600 transition"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md transition ${
                    addedToCart
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <FiCheck className="w-5 h-5" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <FiShoppingBag className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>

                <Link
                  href="/checkout"
                  className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition"
                >
                  Buy Now
                </Link>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 flex flex-col items-center gap-1 text-[11px] font-medium">
                  <FiTruck className="w-4 h-4 text-purple-600" /> Free Shipping
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 flex flex-col items-center gap-1 text-[11px] font-medium">
                  <FiRotateCcw className="w-4 h-4 text-purple-600" /> 7 Days Return
                </div>
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 flex flex-col items-center gap-1 text-[11px] font-medium">
                  <FiShield className="w-4 h-4 text-purple-600" /> Secure Checkout
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}