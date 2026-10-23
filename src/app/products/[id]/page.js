'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiShoppingBag, 
  FiMinus, 
  FiPlus, 
  FiTruck, 
  FiShield, 
  FiRotateCcw, 
  FiHeart, 
  FiCheck 
} from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase/client';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Fetch single product from Supabase ─────────────────────────────────────
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          // Normalize image links into an array
          let imageList = [];
          if (Array.isArray(data.images) && data.images.length > 0) {
            imageList = data.images;
          } else if (data.image_url) {
            imageList = [data.image_url];
          } else if (data.image) {
            imageList = [data.image];
          } else {
            imageList = ['https://placehold.co/800x800/f3e8ff/7e22ce?text=Product+Image'];
          }

          setProduct({
            id: data.id,
            title: data.name || data.title || 'Untitled Product',
            price: Number(data.price) || 0,
            originalPrice: data.original_price ? Number(data.original_price) : (data.originalPrice ? Number(data.originalPrice) : null),
            rating: data.rating || 4.5,
            reviewsCount: data.review_count || data.reviews_count || data.reviewsCount || 100,
            vendor: data.brand || data.vendor || 'Verified Seller',
            inStock: data.in_stock !== undefined ? data.in_stock : true,
            description: data.description || 'No detailed description available for this item.',
            images: imageList,
          });
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      {
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.images[0],
      },
      quantity
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // ── Loading Skeleton State ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-semibold">Loading product details...</p>
      </div>
    );
  }

  // ── Product Not Found State ──
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Product Not Found</h2>
          <p className="text-slate-500 text-xs mb-6">The item you are looking for does not exist or has been removed.</p>
          <Link
            href="/products"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-6 py-2.5 rounded-full transition"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

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
                src={product.images[selectedImage] || product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <button 
                className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:text-red-500 transition shadow-sm"
                title="Save to Wishlist"
              />

        
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      selectedImage === idx ? 'border-purple-600 ring-2 ring-purple-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-md">
                  {product.vendor}
                </span>
                {product.inStock && (
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <FiCheck /> In Stock
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {product.title}
              </h1>
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
                  className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center"
                >
                  Buy Now
                </Link>
              </div>
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