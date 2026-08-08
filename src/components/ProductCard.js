'use client';

import { useState } from 'react';
import Link from 'next/link';

// Renders a 5-star rating row (full / half / empty) based on a numeric rating.
function StarRating({ rating, reviewCount, size = 'text-[9px] sm:text-[10px]' }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center flex-wrap gap-0.5 mb-1.5">
      {[0, 1, 2, 3, 4].map((index) => {
        let iconClass = 'far fa-star';
        if (index < fullStars) {
          iconClass = 'fas fa-star';
        } else if (index === fullStars && hasHalfStar) {
          iconClass = 'fas fa-star-half-alt';
        }
        return <i key={index} className={`${iconClass} text-yellow-400 ${size}`} />;
      })}
      {typeof reviewCount === 'number' && (
        <span className="text-[9px] sm:text-[10px] text-gray-400 ml-1">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}

/**
 * Shared product card used across the homepage rows and the products grid.
 *
 * product shape:
 * {
 *   id: string,
 *   name: string,
 *   brand?: string,
 *   category: string,
 *   price: number,
 *   originalPrice?: number,
 *   rating: number,
 *   reviewCount: number,
 *   image: string,
 *   badge?: 'NEW' | 'SALE' | 'BESTSELLER',
 *   inStock?: boolean,
 * }
 *
 * `compact` renders a fixed-width card meant for horizontal scroll rows.
 */
export default function ProductCard({ product, compact = false }) {
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsAdded(true);
    window.setTimeout(() => setIsAdded(false), 2000);
  }

  function handleToggleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsWishlisted((prev) => !prev);
  }

  return (
    <div
      className={`product-card relative bg-white/90 backdrop-blur rounded-2xl overflow-hidden border border-purple-100 shadow-sm max-w-full ${
        compact ? 'w-[140px] sm:w-[170px] shrink-0 snap-start' : 'w-full'
      }`}
    >
      {/* Wishlist toggle floats above the image, outside the Link so nested
          buttons stay valid HTML (no <button> inside <a>). */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 bg-white/95 text-purple-700 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow"
      >
        <i className={`${isWishlisted ? 'fas text-pink-500' : 'far'} fa-heart text-xs sm:text-sm`} />
      </button>

      {product.badge && (
        <span
          className={`absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${
            product.badge === 'NEW'
              ? 'bg-blue-500'
              : product.badge === 'BESTSELLER'
              ? 'bg-purple-700'
              : 'bg-red-500'
          }`}
        >
          {product.badge === 'SALE' && discountPercent ? `-${discountPercent}%` : product.badge}
        </span>
      )}

      <Link href={`/products/${product.id}`} className="block">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full object-cover ${compact ? 'h-[100px] sm:h-[130px]' : 'h-[120px] sm:h-[140px] md:h-[160px]'}`}
        />

        <div className="p-2.5 sm:p-3 pb-0">
          {product.brand && (
            <p className="text-[9px] sm:text-[10px] text-purple-500 font-bold uppercase mb-0.5 truncate">
              {product.brand}
            </p>
          )}
          <p className="text-xs sm:text-sm font-bold text-gray-800 leading-snug mb-1.5 line-clamp-2 min-h-[2.2em] break-words">
            {product.name}
          </p>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>
      </Link>

      <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
        <div className="flex items-center flex-wrap gap-1 mb-2">
          <span className="text-purple-700 font-black text-xs sm:text-sm">
            Rs {product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-400 text-[10px] sm:text-xs line-through">
              Rs {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full text-[9px] sm:text-[10px] font-bold py-1.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1 whitespace-nowrap ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90'
          }`}
        >
          <i className={`fas ${isAdded ? 'fa-check' : 'fa-cart-plus'}`} />
          <span className="truncate">{isAdded ? 'Added to Cart' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
