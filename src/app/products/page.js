'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';

const CATEGORY_FILTERS = ['All', 'Fashion', 'Beauty', 'Electronics', 'Books', 'Home', 'Sports', 'Kids', 'Health'];

const SORT_OPTIONS = [
  { value: 'featured',     label: 'Featured' },
  { value: 'price-asc',   label: 'Price: Low to High' },
  { value: 'price-desc',  label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Best Rated' },
  { value: 'reviews-desc',label: 'Most Reviewed' },
];
const PAGE_SIZE = 12;

function ProductsInner() {
  const searchParams     = useSearchParams();
  const router           = useRouter();
  const { addToCart }    = useCart();
  
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [sortBy, setSortBy]               = useState('featured');
  const [isSortOpen, setIsSortOpen]       = useState(false);
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedProducts = (data || []).map((p) => ({
          id: p.id,
          name: p.title || p.name || 'Product',
          title: p.title || p.name || 'Product',
          brand: p.brand || 'Brand',
          category: p.category || 'General',
          price: Number(p.price) || 0,
          originalPrice: p.original_price ? Number(p.original_price) : (p.originalPrice ? Number(p.originalPrice) : null),
          rating: p.rating || 4.5,
          reviewCount: p.review_count || p.reviews_count || p.reviewCount || 100,
          image: p.image_url || p.image || (Array.isArray(p.images) && p.images[0]) || 'https://placehold.co/260x200/f3e8ff/7e22ce?text=Product',
          badge: p.badge || (p.discount_percent ? 'SALE' : null),
        }));

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching Supabase products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const urlQuery    = (searchParams.get('q')        || '').trim().toLowerCase();
  const urlCategory = (searchParams.get('category') || '').trim();
  const urlSort     = (searchParams.get('sort')     || '').trim();

  const activeCategory = CATEGORY_FILTERS.includes(urlCategory) ? urlCategory : 'All';

  useEffect(() => {
    if (urlSort === 'deals') setSortBy('price-asc');
  }, [urlSort]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [urlQuery, urlCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category?.toLowerCase() === activeCategory.toLowerCase());
    }

    if (urlQuery) {
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(urlQuery) ||
          p.brand?.toLowerCase().includes(urlQuery) ||
          p.category?.toLowerCase().includes(urlQuery),
      );
    }

    // Sort
    const sorted = [...list];
    switch (sortBy) {
      case 'price-asc':    sorted.sort((a, b) => a.price - b.price);             break;
      case 'price-desc':   sorted.sort((a, b) => b.price - a.price);             break;
      case 'rating-desc':  sorted.sort((a, b) => b.rating - a.rating);           break;
      case 'reviews-desc': sorted.sort((a, b) => b.reviewCount - a.reviewCount); break;
      default: break;
    }
    return sorted;
  }, [products, activeCategory, urlQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore         = visibleCount < filteredProducts.length;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Featured';

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

      {/* ── RESULTS BAR ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 mb-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-3 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <span className="text-xs text-gray-500">
            {loading ? 'Loading products...' : `${filteredProducts.length.toLocaleString()} result${filteredProducts.length === 1 ? '' : 's'} found`}
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

      {/* ── PRODUCT GRID / LOADING / EMPTY STATE ── */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4">
        {loading ? (
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-12 text-center">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-purple-900">Fetching live products...</p>
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
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

        {hasMore && !loading && (
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