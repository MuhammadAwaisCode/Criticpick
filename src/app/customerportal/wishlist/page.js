'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function WishlistPage() {
  const router = useRouter();
  const supabase = createClient();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/signin/customer');
      return;
    }

    const { data } = await supabase
      .from('wishlist')
      .select('id, product_id, products(id, name, price, image_url, in_stock)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setWishlist(data.map((w) => ({
        id: w.id,
        productId: w.product_id,
        name: w.products?.name,
        price: w.products?.price,
        image: w.products?.image_url,
        inStock: w.products?.in_stock,
      })));
    }
  }, [supabase, router]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeProduct = async (id) => {
    setWishlist((prev) => prev.filter(item => item.id !== id));
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (error) fetchWishlist();
  };

  const addToCart = async (productId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !productId) return;
    await supabase
      .from('cart_items')
      .upsert({ user_id: user.id, product_id: productId, quantity: 1 }, { onConflict: 'user_id,product_id' });
  };

  return (
    <div className="animate-fade-in">
      {wishlist.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-semibold">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="h-48 bg-slate-100 relative">
                {/* Image Placeholder */}
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-medium">
                  [Product Image]
                </div>
                <button 
                  onClick={() => removeProduct(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{item.name}</h3>
                <p className="text-green-700 font-bold mt-1">${item.price}</p>
                <button 
                  disabled={!item.inStock}
                  onClick={() => addToCart(item.productId)}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    item.inStock ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <FiShoppingCart /> {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}