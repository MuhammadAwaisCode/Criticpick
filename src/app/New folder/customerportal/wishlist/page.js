'use client';

import React, { useState } from 'react';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([
    { id: 1, name: 'Charcoal Detox Mask', price: 15.99, image: 'https://via.placeholder.com/150', inStock: true },
    { id: 2, name: 'Vitamin C Brightening Serum', price: 29.50, image: 'https://via.placeholder.com/150', inStock: false },
  ]);

  const removeProduct = (id) => {
    setWishlist(wishlist.filter(item => item.id !== id));
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