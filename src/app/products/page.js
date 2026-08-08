'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';


const ALL_PRODUCTS = [
  { id: 'p-01', name: 'Matte Liquid Lipstick Set',        brand: 'Huda Beauty',   category: 'Beauty',      price: 2399,  originalPrice: 3999,  rating: 5,   reviewCount: 1204, image: 'https://placehold.co/260x200/fce4ec/9b59b6?text=Lipstick',    badge: 'SALE' },
  { id: 'p-02', name: 'Vitamin C Brightening Serum',      brand: 'The Ordinary',  category: 'Beauty',      price: 1850,  originalPrice: 2500,  rating: 4,   reviewCount: 876,  image: 'https://placehold.co/260x200/f3e8ff/7e22ce?text=Serum',       badge: 'NEW' },
  { id: 'p-03', name: 'Hydrating Foundation',             brand: 'Fenty Beauty',  category: 'Beauty',      price: 3299,  rating: 4.5, reviewCount: 540,  image: 'https://placehold.co/260x200/fdf2f8/a21caf?text=Foundation' },
  { id: 'p-04', name: 'Oversized Denim Jacket',           brand: 'UrbanFit',      category: 'Fashion',     price: 4999,  originalPrice: 6999,  rating: 4.5, reviewCount: 320,  image: 'https://placehold.co/260x200/ede9fe/5b21b6?text=Jacket',      badge: 'BESTSELLER' },
  { id: 'p-05', name: 'Floral Wrap Dress',                brand: 'Chic Lane',     category: 'Fashion',     price: 3200,  rating: 4,   reviewCount: 189,  image: 'https://placehold.co/260x200/fce4ec/9b59b6?text=Dress' },
  { id: 'p-06', name: 'Classic Fit Chinos',               brand: 'Herringbone',   category: 'Fashion',     price: 2799,  originalPrice: 3499,  rating: 4.5, reviewCount: 271,  image: 'https://placehold.co/260x200/f3e8ff/7e22ce?text=Chinos',      badge: 'SALE' },
  { id: 'p-07', name: 'Smart Watch Pro',                  brand: 'PulseTech',     category: 'Electronics', price: 15999, rating: 5,   reviewCount: 310,  image: 'https://placehold.co/260x200/ddd6fe/4338ca?text=Watch',        badge: 'BESTSELLER' },
  { id: 'p-08', name: 'Wireless Noise-Cancelling Earbuds',brand: 'SoundCore',     category: 'Electronics', price: 7499,  originalPrice: 9999,  rating: 4.5, reviewCount: 812,  image: 'https://placehold.co/260x200/e0e7ff/312e81?text=Earbuds',     badge: 'SALE' },
  { id: 'p-09', name: 'Instant Camera — Retro',           brand: 'Fujiroll',      category: 'Electronics', price: 9850,  rating: 4.5, reviewCount: 201,  image: 'https://placehold.co/260x200/ede9fe/5b21b6?text=Camera',       badge: 'NEW' },
  { id: 'p-10', name: 'The Silent Garden — Novel',        brand: 'Penguin',       category: 'Books',       price: 899,   rating: 4.5, reviewCount: 156,  image: 'https://placehold.co/260x200/fef3c7/92400e?text=Novel' },
  { id: 'p-11', name: 'Atomic Habits',                    brand: 'Random House',  category: 'Books',       price: 1199,  rating: 5,   reviewCount: 2043, image: 'https://placehold.co/260x200/fde68a/78350f?text=Habits',       badge: 'BESTSELLER' },
  { id: 'p-12', name: 'Illustrated Kids Encyclopedia',    brand: 'DK',            category: 'Books',       price: 1699,  originalPrice: 2199,  rating: 4.5, reviewCount: 88,   image: 'https://placehold.co/260x200/fef9c3/854d0e?text=Encyclopedia', badge: 'SALE' },
  { id: 'p-13', name: 'Aromatherapy Candle Set',          brand: 'Lumière',       category: 'Home',        price: 2750,  rating: 5,   reviewCount: 44,   image: 'https://placehold.co/260x200/fce4ec/c2185b?text=Candles' },
  { id: 'p-14', name: 'Non-Stick Cookware Set (7pc)',     brand: 'ChefLine',      category: 'Home',        price: 8499,  originalPrice: 10999, rating: 4.5, reviewCount: 367,  image: 'https://placehold.co/260x200/e2e8f0/334155?text=Cookware',    badge: 'SALE' },
  { id: 'p-15', name: 'Indoor Plant — Monstera',          brand: 'GreenNest',     category: 'Home',        price: 650,   rating: 4,   reviewCount: 210,  image: 'https://placehold.co/260x200/dcfce7/166534?text=Plant',        badge: 'NEW' },
  { id: 'p-16', name: 'Running Shoes',                    brand: 'MoveWell',      category: 'Sports',      price: 6499,  rating: 4,   reviewCount: 523,  image: 'https://placehold.co/260x200/fce4ec/9b59b6?text=Shoes' },
  { id: 'p-17', name: 'Yoga Mat — Extra Grip',            brand: 'ZenFlex',       category: 'Sports',      price: 3100,  rating: 4.5, reviewCount: 198,  image: 'https://placehold.co/260x200/f3e8ff/7e22ce?text=Yoga+Mat' },
  { id: 'p-18', name: 'Adjustable Dumbbell Set',          brand: 'IronCore',      category: 'Sports',      price: 12999, originalPrice: 15999, rating: 5,   reviewCount: 76,   image: 'https://placehold.co/260x200/ddd6fe/4338ca?text=Dumbbells',   badge: 'SALE' },
  { id: 'p-19', name: 'Wooden Building Blocks',           brand: 'TinyTots',      category: 'Kids',        price: 1899,  rating: 4.5, reviewCount: 132,  image: 'https://placehold.co/260x200/ede9fe/5b21b6?text=Blocks',       badge: 'BESTSELLER' },
  { id: 'p-20', name: 'Plush Teddy Bear',                 brand: 'CuddleCo',      category: 'Kids',        price: 1299,  rating: 5,   reviewCount: 289,  image: 'https://placehold.co/260x200/fce4ec/9b59b6?text=Teddy' },
  { id: 'p-21', name: "Kids' Learning Tablet",            brand: 'TinyTots',      category: 'Kids',        price: 5999,  originalPrice: 7499,  rating: 4,   reviewCount: 94,   image: 'https://placehold.co/260x200/f3e8ff/7e22ce?text=Tablet',      badge: 'SALE' },
  { id: 'p-22', name: 'Multivitamin Gummies (60ct)',      brand: 'VitaBoost',     category: 'Health',      price: 1499,  rating: 4.5, reviewCount: 421,  image: 'https://placehold.co/260x200/fef3c7/92400e?text=Vitamins',     badge: 'NEW' },
  { id: 'p-23', name: 'Digital Blood Pressure Monitor',   brand: 'PulseTech',     category: 'Health',      price: 3999,  rating: 4.5, reviewCount: 167,  image: 'https://placehold.co/260x200/dbeafe/1e3a8a?text=BP+Monitor' },
  { id: 'p-24', name: 'Premium Moisturizer Cream',        brand: 'Neutrogena',    category: 'Health',      price: 1299,  rating: 4,   reviewCount: 88,   image: 'https://placehold.co/260x200/f3e8ff/7e22ce?text=Moisturizer' },
  { id: 'p-25', name: 'Rose Glow Facial Serum',           brand: 'GlowLab',       category: 'Beauty',      price: 2199,  originalPrice: 2999,  rating: 4.5, reviewCount: 312,  image: 'https://placehold.co/260x200/fde3ef/9b59b6?text=Rose+Serum',  badge: 'NEW' },
  { id: 'p-26', name: 'Ribbed Knit Sweater',              brand: 'Chic Lane',     category: 'Fashion',     price: 3599,  rating: 4,   reviewCount: 143,  image: 'https://placehold.co/260x200/e8d5f0/7c3aed?text=Sweater' },
  { id: 'p-27', name: 'Everyday Linen Shirt',             brand: 'UrbanFit',      category: 'Fashion',     price: 2499,  rating: 4.5, reviewCount: 402,  image: 'https://placehold.co/260x200/d1c4e9/4c1d95?text=Shirt',       badge: 'BESTSELLER' },
  { id: 'p-28', name: 'SPF 50 Sunscreen Gel',             brand: 'The Ordinary',  category: 'Health',      price: 1499,  rating: 4.5, reviewCount: 998,  image: 'https://placehold.co/260x200/fde3ef/9b59b6?text=Sunscreen' },
  { id: 'p-29', name: 'Nourishing Hair Mask',             brand: 'Kerastase',     category: 'Beauty',      price: 2100,  originalPrice: 2600,  rating: 4,   reviewCount: 233,  image: 'https://placehold.co/260x200/ede9fe/5b21b6?text=Hair+Mask',   badge: 'SALE' },
  { id: 'p-30', name: 'Tailored Blazer',                  brand: 'Herringbone',   category: 'Fashion',     price: 6999,  rating: 5,   reviewCount: 61,   image: 'https://placehold.co/260x200/e8d5f0/7c3aed?text=Blazer',      badge: 'NEW' },
];

const CATEGORY_FILTERS = ['All', 'Fashion', 'Beauty', 'Electronics', 'Books', 'Home', 'Sports', 'Kids', 'Health'];

const SORT_OPTIONS = [
  { value: 'featured',     label: 'Featured' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Best Rated' },
  { value: 'reviews-desc',label: 'Most Reviewed' },
];

const PAGE_SIZE = 12;

// ---------------------------------------------------------------------------
// Inner component — must be wrapped in <Suspense> because it uses
// useSearchParams() which requires Suspense in Next.js App Router.
// ---------------------------------------------------------------------------
function ProductsInner() {
  const searchParams     = useSearchParams();
  const router           = useRouter();
  const [sortBy,         setSortBy]         = useState('featured');
  const [isSortOpen,     setIsSortOpen]     = useState(false);
  const [visibleCount,   setVisibleCount]   = useState(PAGE_SIZE);

  // ── Read URL params ──────────────────────────────────────────────────────
  // ?q=           → free-text search term coming from TopNav Enter/submit
  // ?category=    → category filter coming from TopNav or category cards
  // ?sort=        → pre-set sort order (e.g. "deals" promo banner)
  const urlQuery    = (searchParams.get('q')        || '').trim().toLowerCase();
  const urlCategory = (searchParams.get('category') || '').trim();
  const urlSort     = (searchParams.get('sort')     || '').trim();

  // Derive active category from URL; fall back to 'All'
  const activeCategory =
    CATEGORY_FILTERS.includes(urlCategory) ? urlCategory : 'All';

  // Sync sort from URL param on first load only
  useEffect(() => {
    if (urlSort === 'deals') setSortBy('price-asc');
  }, [urlSort]);

  // Reset visible count whenever filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [urlQuery, urlCategory, sortBy]);

  // ── Filter + search + sort ───────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = ALL_PRODUCTS;

    // 1. Category filter
    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === activeCategory);
    }

    // 2. Free-text search across name, brand, category
    if (urlQuery) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(urlQuery) ||
          p.brand.toLowerCase().includes(urlQuery) ||
          p.category.toLowerCase().includes(urlQuery),
      );
    }

    // 3. Sort
    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':    sorted.sort((a, b) => a.price - b.price);             break;
      case 'price-desc':   sorted.sort((a, b) => b.price - a.price);             break;
      case 'rating-desc':  sorted.sort((a, b) => b.rating - a.rating);           break;
      case 'reviews-desc': sorted.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: break;
    }
    return sorted;
  }, [activeCategory, urlQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore         = visibleCount < filteredProducts.length;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Featured';

  // Navigate to /products?category=X, keeping the search query if present
  function handleCategorySelect(category) {
    const params = new URLSearchParams();
    if (urlQuery) params.set('q', urlQuery);
    if (category !== 'All') params.set('category', category);
    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ''}`);
  }

  function handleSortSelect(value) {
    setSortBy(value);
    setIsSortOpen(false);
  }

  // ── Page label ────────────────────────────────────────────────────────────
  const pageTitle = urlQuery
    ? `Results for "${urlQuery}"${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}`
    : activeCategory === 'All'
    ? 'All Products'
    : activeCategory;

  return (
    <div className="bg-hero-gradient min-h-[calc(100vh-100px)] pb-10 overflow-x-hidden">
      {/* ── PAGE HEADER ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <nav className="text-xs text-purple-900/70 mb-3 overflow-x-auto whitespace-nowrap scrollbar-hide" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1.5">/</span>
          {urlQuery && (
            <>
              <Link href="/products" className="hover:underline">All Products</Link>
              <span className="mx-1.5">/</span>
            </>
          )}
          <span className="font-bold">{pageTitle}</span>
        </nav>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5 mb-4">
          <h1 className="text-xl sm:text-2xl font-black text-purple-900 mb-1 break-words">
            {pageTitle}
          </h1>
          {urlQuery ? (
            <p className="text-xs text-gray-500">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found
              — <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Clear search
                </button>
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Browse our full catalog, backed by honest, verified customer reviews.
            </p>
          )}
        </div>
      </div>

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1 -mx-1 px-1">
          {CATEGORY_FILTERS.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                className={`shrink-0 text-xs font-bold px-3.5 sm:px-4 py-2 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow'
                    : 'bg-white/80 text-purple-700 border-purple-200 hover:bg-purple-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RESULTS BAR: count + sort dropdown ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 mb-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-3 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <span className="text-xs text-gray-500">
            {filteredProducts.length.toLocaleString()} result{filteredProducts.length === 1 ? '' : 's'} found
            {urlQuery && (
              <span className="ml-1 text-purple-700 font-bold">
                for &ldquo;{urlQuery}&rdquo;
              </span>
            )}
          </span>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex items-center gap-1 border border-purple-200 text-xs font-bold text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 whitespace-nowrap"
              aria-haspopup="true"
              aria-expanded={isSortOpen}
            >
              Sort: {currentSortLabel} <i className="fas fa-caret-down text-[10px]" />
            </button>

            {isSortOpen && (
              <ul className="absolute right-0 top-full mt-1 bg-white shadow-xl rounded-xl border border-purple-100 w-44 sm:w-48 py-1 z-20 text-xs max-w-[calc(100vw-2rem)]">
                {SORT_OPTIONS.map((option) => (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSortSelect(option.value)}
                      className={`w-full text-left px-4 py-2 hover:bg-purple-50 ${
                        option.value === sortBy ? 'font-bold text-purple-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── PROMO STRIP ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 mb-4">
        <div
          className="rounded-2xl overflow-hidden px-4 py-4 sm:px-6 sm:py-5 md:px-8 flex items-center justify-between flex-wrap gap-3 sm:gap-4"
          style={{ background: 'linear-gradient(120deg,#fce4ec 0%,#5f2f5edd 60%,#c2185b 100%)' }}
        >
          <div className="min-w-0">
            <span className="deal-badge inline-block bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">
              New Arrivals
            </span>
            <h3 className="text-white font-black text-base sm:text-lg break-words">
              Storewide Sale — <span className="text-yellow-200">Up to 50% Off</span>
            </h3>
            <p className="text-pink-100 text-xs">Limited time offer. Shop now!</p>
          </div>
          <button
            type="button"
            onClick={() => handleSortSelect('price-asc')}
            className="shrink-0 bg-white text-purple-700 font-black px-5 py-2 rounded-full text-xs hover:bg-purple-50 shadow transition"
          >
            Shop Sale
          </button>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* ── No results state ── */
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 sm:p-10 text-center">
            <i className="fas fa-search text-4xl text-purple-300 mb-3" />
            <p className="text-sm font-bold text-gray-700 mb-1">
              {urlQuery
                ? `No products found for "${urlQuery}"`
                : 'No products found in this category yet.'}
            </p>
            <p className="text-xs text-gray-500 mb-4">Try a different search term or browse another category.</p>
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="mt-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 rounded-full hover:opacity-90 transition"
            >
              View all products
            </button>
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm px-8 py-2.5 rounded-full shadow hover:opacity-90 transition"
            >
              Load More Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Default export — wraps inner component in Suspense (required by Next.js
// when useSearchParams() is used inside a Client Component).
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-hero-gradient min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-purple-900 font-bold text-sm">Loading products…</p>
          </div>
        </div>
      }
    >
      <ProductsInner />
    </Suspense>
  );
}