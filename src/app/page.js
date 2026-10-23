'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/client';
const FALLBACK_SLIDES = [
  {
    id: 1,
    gradient: 'linear-gradient(120deg,#e8d5f0 0%,#c084d0 60%,#7c3aed 100%)',
    tag: 'New Arrivals',
    tagBg: 'bg-purple-700',
    headingStart: 'Shop the',
    highlight: 'Latest',
    headingEnd: 'Trends Today',
    highlightColor: 'text-pink-200',
    description: 'Its Criticpcik hot selling products ',
    buttonLabel: 'Shop Now',
    buttonIcon: 'fa-arrow-right',
    buttonTextColor: 'text-purple-700',
    buttonHoverBg: 'hover:bg-purple-50',
    image: 'https://placehold.co/400x260/e8d5f0/7c3aed?text=New+Arrivals',
    href: '/products',
  },
  {
    id: 2,
    gradient: 'linear-gradient(120deg,#fce4ec 0%,#d1a3c7 60%,#9b59b6 100%)',
    tag: 'Flash Sale',
    tagBg: 'bg-pink-500',
    headingStart: 'Up to',
    highlight: '60% Off',
    headingEnd: 'Beauty & Care',
    highlightColor: 'text-yellow-200',
    description: "Limited time offers on top beauty brands. Don't miss out!",
    buttonLabel: 'Grab Deals',
    buttonIcon: 'fa-bolt',
    buttonTextColor: 'text-pink-600',
    buttonHoverBg: 'hover:bg-pink-50',
    image: 'https://placehold.co/400x260/fce4ec/c2185b?text=Flash+Sale',
    href: '/products?category=Beauty',
  },
    {
    id: 3,
    gradient: 'linear-gradient(120deg,#fce4ec 0%,#d1a3c7 60%,#9b59b6 100%)',
    tag: 'Flash Sale',
    tagBg: 'bg-pink-500',
    headingStart: 'Up to',
    highlight: '60% Off',
    headingEnd: 'Beauty & Care',
    highlightColor: 'text-yellow-200',
    description: "Limited time offers on top beauty brands. Don't miss out!",
    buttonLabel: 'Grab Deals',
    buttonIcon: 'fa-bolt',
    buttonTextColor: 'text-pink-600',
    buttonHoverBg: 'hover:bg-pink-50',
    image: 'https://placehold.co/400x260/fce4ec/c2185b?text=Flash+Sale',
    href: '/products?category=Beauty',
  },
];
const FALLBACK_CATEGORIES = [
  { name: 'Fashion', href: '/products?category=Fashion', image: 'https://placehold.co/48x48/ede9fe/5b21b6?text=👗' },
  { name: 'Beauty', href: '/products?category=Beauty', image: 'https://placehold.co/48x48/fce4ec/c2185b?text=💄' },
  { name: 'Electronics', href: '/products?category=Electronics', image: 'https://placehold.co/48x48/ddd6fe/4338ca?text=🎧' },
  { name: 'Books', href: '/products?category=Books', image: 'https://placehold.co/48x48/f3e8ff/7e22ce?text=📚' },
  { name: 'Home', href: '/products?category=Home', image: 'https://placehold.co/48x48/f1e1e6/7a6fb0?text=🏠' },
  { name: 'Sports', href: '/products?category=Sports', image: 'https://placehold.co/48x48/e8d5f0/7c3aed?text=🏀' },
];
const FALLBACK_WISHLIST = [
  { id: 'wish-1', name: 'Summer Dress', price: 3200, image: 'https://placehold.co/40x40/f3e8ff/7e22ce?text=D' },
  { id: 'wish-2', name: 'Sport Sneakers', price: 5499, image: 'https://placehold.co/40x40/fce4ec/9b59b6?text=S' },
];
function normalizeProduct(item) {
  let image = 'https://placehold.co/400x400/f3e8ff/7e22ce?text=Product';
  if (Array.isArray(item.images) && item.images.length > 0) {
    image = item.images[0];
  } else if (item.image_url) {
    image = item.image_url;
  } else if (item.image) {
    image = item.image;
  }

  const price = Number(item.price) || 0;
  const originalPrice = item.original_price
    ? Number(item.original_price)
    : item.originalPrice
    ? Number(item.originalPrice)
    : null;
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : item.discount || 0;

  return {
    id: item.id,
    name: item.title || item.name || 'Product Item',
    title: item.title || item.name || 'Product Item',
    price,
    originalPrice,
    discount,
    claimed: item.claimed || Math.floor(Math.random() * 40) + 50,
    rating: item.rating || 4.5,
    reviewCount: item.review_count || item.reviewsCount || 100,
    brand: item.brand || item.vendor || 'Verified Store',
    category: item.category || 'General',
    image,
    status: item.in_stock === false ? 'Out of Stock' : 'In Stock',
    statusColor: item.in_stock === false ? 'text-red-400' : 'text-green-500',
    badge: item.badge || (discount > 0 ? 'SALE' : null),
  };
}

// Horizontal Scroll Component
function ScrollableProductRow({ title, subtitle, seeAllHref, products }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return undefined;

    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products]);

  function scroll(direction) {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-3.5 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black text-purple-900 truncate">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
        </div>
        <Link href={seeAllHref} className="text-xs text-purple-600 font-bold hover:underline shrink-0">
          See all
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={`absolute -left-2 sm:-left-3 top-[45px] sm:top-[52px] -translate-y-1/2 z-10 bg-white hover:bg-purple-50 text-purple-700 rounded-full w-8 h-8 sm:w-9 sm:h-9 items-center justify-center shadow-lg transition ${
            canScrollLeft ? 'hidden sm:flex' : 'hidden'
          }`}
        >
          <i className="fas fa-chevron-left text-xs sm:text-sm" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-1"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={`absolute -right-2 sm:-right-3 top-[45px] sm:top-[52px] -translate-y-1/2 z-10 bg-white hover:bg-purple-50 text-purple-700 rounded-full w-8 h-8 sm:w-9 sm:h-9 items-center justify-center shadow-lg transition ${
            canScrollRight ? 'hidden sm:flex' : 'hidden'
          }`}
        >
          <i className="fas fa-chevron-right text-xs sm:text-sm" />
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [heroSlides, setHeroSlides] = useState(FALLBACK_SLIDES);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [wishlistItems, setWishlistItems] = useState(FALLBACK_WISHLIST);

  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  // Dynamic Product States from Supabase
  const [todaysDeals, setTodaysDeals] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [clothingProducts, setClothingProducts] = useState([]);
  const [beautyProducts, setBeautyProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [continueShoppingProducts, setContinueShoppingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch Products from Supabase ───────────────────────────────────────────
  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. Fetch products from Supabase
        const { data: dbProducts, error: prodErr } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!prodErr && dbProducts && dbProducts.length > 0) {
          const normalized = dbProducts.map(normalizeProduct);

          setFeaturedProducts(normalized.slice(0, 12));

          const clothing = normalized.filter(
            (p) =>
              p.category?.toLowerCase().includes('fashion') ||
              p.category?.toLowerCase().includes('cloth') ||
              p.category?.toLowerCase().includes('apparel')
          );
          setClothingProducts(clothing.length > 0 ? clothing : normalized.slice(0, 8));

          const beauty = normalized.filter(
            (p) =>
              p.category?.toLowerCase().includes('beauty') ||
              p.category?.toLowerCase().includes('skincare') ||
              p.category?.toLowerCase().includes('cosmetic')
          );
          setBeautyProducts(beauty.length > 0 ? beauty : normalized.slice(2, 10));

          const deals = normalized.filter((p) => p.discount > 0 || p.originalPrice);
          setTodaysDeals(deals.length >= 2 ? deals.slice(0, 4) : normalized.slice(0, 4));

          setRecommendedProducts(normalized.slice(0, 3));
          setContinueShoppingProducts(normalized.slice(3, 9));
        }

        // 2. Fetch banners if table exists (optional fallback retained)
        const { data: dbBanners } = await supabase.from('banners').select('*');
        if (dbBanners && dbBanners.length > 0) {
          setHeroSlides(
            dbBanners.map((b, i) => ({
              id: b.id || i,
              gradient: b.gradient || 'linear-gradient(120deg,#e8d5f0 0%,#c084d0 60%,#7c3aed 100%)',
              tag: b.tag || 'Offer',
              tagBg: b.tag_bg || 'bg-purple-700',
              headingStart: b.heading_start || '',
              highlight: b.highlight || '',
              headingEnd: b.heading_end || '',
              highlightColor: b.highlight_color || 'text-pink-200',
              description: b.description || '',
              buttonLabel: b.button_label || 'Shop Now',
              buttonIcon: b.button_icon || 'fa-arrow-right',
              buttonTextColor: b.button_text_color || 'text-purple-700',
              buttonHoverBg: b.button_hover_bg || 'hover:bg-purple-50',
              image: b.image_url || b.image,
              href: b.href || '/products',
            }))
          );
        }

        // 3. Fetch categories if table exists (optional fallback retained)
        const { data: dbCats } = await supabase.from('categories').select('*');
        if (dbCats && dbCats.length > 0) {
          setCategories(
            dbCats.map((c) => ({
              name: c.name,
              href: c.href || `/products?category=${encodeURIComponent(c.name)}`,
              image: c.icon_url || c.image || 'https://placehold.co/48x48/ede9fe/5b21b6?text=📦',
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  function goToSlide(index) {
    setCurrentSlide(index);
  }

  function moveSlide(direction) {
    setCurrentSlide((prev) => (prev + direction + heroSlides.length) % heroSlides.length);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
  }

  function stopAutoplay() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [heroSlides]);

  return (
    <div className="bg-hero-gradient min-h-[calc(100vh-100px)] overflow-x-hidden">
      {/* HERO CAROUSEL */}
      <div
        className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[380px]"
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <div
          className="carousel-track h-full transition-transform duration-500 ease-out flex"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {heroSlides.map((slide) => (
            <div
              key={slide.id}
              className="carousel-slide h-full w-full shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-16"
              style={{ background: slide.gradient }}
            >
              <div className="max-w-lg min-w-0">
                <span
                  className={`${slide.tagBg} text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-widest mb-2 sm:mb-3 inline-block`}
                >
                  {slide.tag}
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-3 leading-tight drop-shadow break-words">
                  {slide.headingStart}{' '}
                  {slide.highlight && <span className={slide.highlightColor}>{slide.highlight}</span>}
                  <br />
                  {slide.headingEnd}
                </h1>
                <p className="text-purple-50 mb-3 sm:mb-5 text-xs sm:text-sm max-w-xs sm:max-w-sm md:max-w-lg">
                  {slide.description}
                </p>
                <Link
                  href={slide.href}
                  className={`inline-flex items-center bg-white ${slide.buttonTextColor} font-bold px-5 sm:px-7 py-2 sm:py-2.5 rounded-full shadow-lg ${slide.buttonHoverBg} transition text-xs sm:text-sm`}
                >
                  {slide.buttonLabel} <i className={`fas ${slide.buttonIcon} ml-1`} />
                </Link>
              </div>

              {slide.image && (
                <img
                  src={slide.image}
                  alt={slide.tag}
                  className="rounded-2xl shadow-2xl hidden lg:block h-[220px] xl:h-[260px] w-[320px] xl:w-[400px] object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          type="button"
          onClick={() => moveSlide(-1)}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-purple-700 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg z-10 transition text-sm sm:text-base"
        >
          <i className="fas fa-chevron-left" />
        </button>
        <button
          type="button"
          onClick={() => moveSlide(1)}
          aria-label="Next slide"
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-purple-700 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg z-10 transition text-sm sm:text-base"
        >
          <i className="fas fa-chevron-right" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full cursor-pointer transition ${
                index === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* DASHBOARD GRID */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 py-5 sm:py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Deals */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-3.5 sm:p-4 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Today&apos;s Deals</h2>
            <Link href="/products?sort=deals" className="text-xs text-purple-600 font-bold hover:underline shrink-0">
              See all deals
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {todaysDeals.slice(0, 2).map((deal) => (
              <Link
                key={deal.id}
                href={`/products/${deal.id}`}
                className="product-card bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-2.5 sm:p-3 cursor-pointer border border-purple-100 min-w-0 block hover:shadow-md transition"
              >
                <div className="relative mb-2">
                  <img src={deal.image} className="w-full rounded-lg object-cover h-[70px] sm:h-[90px]" alt={deal.name} />
                  {deal.discount > 0 && (
                    <span className="deal-badge absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      -{deal.discount}%
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{deal.name}</p>
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-purple-700 font-black text-xs sm:text-sm">Rs {deal.price.toLocaleString()}</span>
                  {deal.originalPrice && (
                    <span className="text-gray-400 text-[10px] sm:text-xs line-through">
                      Rs {deal.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: `${deal.claimed}%` }} />
                </div>
                <p className="text-[10px] text-red-500 font-bold mt-0.5">{deal.claimed}% claimed</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Sign-in Panel */}
        <div className="bg-white/85 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center mb-3 shadow">
            <i className="fas fa-user text-white text-2xl" />
          </div>
          <h3 className="font-black text-purple-900 text-base mb-1">Welcome Back!</h3>
          <p className="text-xs text-gray-500 mb-4">Sign in to see your orders, wishlist, and more.</p>
          <Link
            href="/signin/customer"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-xl text-sm hover:opacity-90 transition shadow mb-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup/customer"
            className="w-full border-2 border-purple-300 text-purple-700 font-bold py-2 rounded-xl text-sm hover:bg-purple-50 transition"
          >
            Create Account
          </Link>
          <p className="text-[10px] text-gray-400 mt-3">By continuing, you agree to our Terms &amp; Conditions.</p>
        </div>

        {/* Wishlist Panel */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-purple-900">Your Wishlist</h2>
            <i className="fas fa-heart text-pink-400" />
          </div>
          <ul className="space-y-2">
            {wishlistItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50 cursor-pointer">
                <img src={item.image} className="rounded-lg w-10 h-10 object-cover shrink-0" alt={item.name} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">{item.name}</p>
                  <p className="text-xs text-purple-600 font-bold">Rs {item.price.toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/profile#wishlist" className="block text-center text-xs text-purple-600 font-bold mt-3 hover:underline">
            View full wishlist →
          </Link>
        </div>
      </div>

      {/* SHOP BY CATEGORY */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Shop by Category</h2>
            <Link href="/products" className="text-xs text-purple-600 font-bold hover:underline">
              All categories
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <div className="cat-card flex flex-col items-center p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-pink-50 to-purple-50 cursor-pointer border border-purple-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2 overflow-hidden shrink-0">
                    <img src={category.image} alt={category.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-gray-700 text-center break-words">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Featured Products</h2>
            <Link href="/products" className="text-xs text-purple-600 font-bold hover:underline">
              See all
            </Link>
          </div>
          {loading ? (
            <div className="py-8 text-center text-xs font-semibold text-purple-600">Loading live products...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BEST SELLERS IN CLOTHING */}
      {clothingProducts.length > 0 && (
        <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
          <ScrollableProductRow
            title="Best Sellers in Clothing"
            subtitle="Top-rated fashion picks this week"
            seeAllHref="/products?category=Fashion"
            products={clothingProducts}
          />
        </div>
      )}

      {/* POPULAR PRODUCTS IN BEAUTY */}
      {beautyProducts.length > 0 && (
        <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
          <ScrollableProductRow
            title="Popular products in Beauty"
            subtitle="Loved by thousands of Critipick shoppers"
            seeAllHref="/products?category=Beauty"
            products={beautyProducts}
          />
        </div>
      )}

      {/* PROMO BANNER + RECOMMENDED FOR YOU */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div
          className="lg:col-span-1 rounded-2xl overflow-hidden shadow-lg relative flex items-end min-h-[180px] sm:min-h-[200px]"
          style={{ background: 'linear-gradient(135deg,#c084fc 0%,#f472b6 100%)' }}
        >
          <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-6">
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-1">Limited Offer</p>
            <h3 className="text-white font-black text-xl sm:text-2xl leading-tight mb-2">
              Free Delivery
              <br />
              on Orders
              <br />
              <span className="text-yellow-200">Rs 2000+</span>
            </h3>
            <Link
              href="/products"
              className="bg-white text-purple-700 font-bold text-xs px-5 py-2 rounded-full w-fit hover:bg-purple-50 transition shadow"
            >
              Claim Now
            </Link>
          </div>
          <span className="absolute right-4 bottom-4 text-5xl sm:text-6xl opacity-30">🚚</span>
        </div>

        <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-purple-900">Recommended For You</h2>
            <Link href="/products" className="text-xs text-purple-600 font-bold hover:underline">
              More
            </Link>
          </div>
          <div className="space-y-3">
            {recommendedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/products/${item.id}`}
                className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl hover:bg-purple-50 cursor-pointer border border-transparent hover:border-purple-200 transition"
              >
                <img
                  src={item.image}
                  className="rounded-xl shadow w-12 h-12 sm:w-14 sm:h-14 object-cover shrink-0"
                  alt={item.name}
                />
                <div className="flex-grow min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{item.name}</p>
                  <div className="flex items-center flex-wrap gap-1 mt-0.5">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const full = Math.floor(item.rating);
                      const half = item.rating - full >= 0.5;
                      let iconClass = 'far fa-star';
                      if (index < full) iconClass = 'fas fa-star';
                      else if (index === full && half) iconClass = 'fas fa-star-half-alt';
                      return <i key={index} className={`${iconClass} text-yellow-400 text-[10px]`} />;
                    })}
                    <span className="text-xs text-gray-400 ml-1">
                      {item.rating.toFixed(1)} ({item.reviewCount})
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-purple-700 font-black text-xs sm:text-sm">Rs {item.price.toLocaleString()}</p>
                  <span className={`text-[10px] font-bold ${item.statusColor}`}>{item.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CONTINUE SHOPPING */}
      {continueShoppingProducts.length > 0 && (
        <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-8">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-black text-purple-900">Continue Shopping</h2>
              <Link href="/profile#history" className="text-xs text-purple-600 font-bold hover:underline">
                See history
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
              {continueShoppingProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="product-card p-2 rounded-xl bg-purple-50/60 cursor-pointer flex flex-col items-center border border-purple-100 min-w-0 hover:shadow-sm transition"
                >
                  <img
                    src={item.image}
                    className="rounded-lg mb-2 w-full h-[60px] sm:h-[70px] object-cover"
                    alt={item.name}
                  />
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 text-center line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-purple-700 font-black text-xs mt-0.5">Rs {item.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}