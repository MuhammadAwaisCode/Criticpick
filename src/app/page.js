'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

// ---------------------------------------------------------------------------
// Static content — swap for API/CMS data once the backend is wired up.
// ---------------------------------------------------------------------------

const HERO_SLIDES = [
  {
    id: 1,
    gradient: 'linear-gradient(120deg,#e8d5f0 0%,#c084d0 60%,#7c3aed 100%)',
    tag: 'New Arrivals',
    tagBg: 'bg-purple-700',
    headingStart: 'Shop the',
    highlight: 'Latest',
    headingEnd: 'Trends Today',
    highlightColor: 'text-pink-200',
    description: 'Exclusive deals across thousands of products. Fast delivery across Pakistan.',
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
    gradient: 'linear-gradient(120deg,#d1c4e9 0%,#a78bfa 60%,#4c1d95 100%)',
    tag: 'Trending',
    tagBg: 'bg-indigo-500',
    headingStart: 'Home & Kitchen',
    highlight: '',
    headingEnd: 'Essentials',
    highlightColor: 'text-purple-200',
    description: 'Premium quality home products delivered to your doorstep.',
    buttonLabel: 'Explore',
    buttonIcon: 'fa-home',
    buttonTextColor: 'text-indigo-700',
    buttonHoverBg: 'hover:bg-indigo-50',
    image: 'https://placehold.co/400x260/d1c4e9/4c1d95?text=Home+%26+Kitchen',
    href: '/products?category=Home',
  },
];

const TODAYS_DEALS = [
  {
    id: 'deal-1',
    name: 'Premium Handbag Collection',
    image: 'https://placehold.co/120x100/f3e8ff/7e22ce?text=Handbag',
    price: 2499,
    originalPrice: 4499,
    discount: 45,
    claimed: 72,
  },
  {
    id: 'deal-2',
    name: 'Luxury Cosmetics Set',
    image: 'https://placehold.co/120x100/fce4ec/9b59b6?text=Cosmetics',
    price: 1799,
    originalPrice: 2599,
    discount: 30,
    claimed: 55,
  },
];

const WISHLIST_ITEMS = [
  {
    id: 'wish-1',
    name: 'Summer Dress',
    price: 3200,
    image: 'https://placehold.co/40x40/f3e8ff/7e22ce?text=D',
  },
  {
    id: 'wish-2',
    name: 'Sport Sneakers',
    price: 5499,
    image: 'https://placehold.co/40x40/fce4ec/9b59b6?text=S',
  },
  {
    id: 'wish-3',
    name: 'Smart Watch',
    price: 12000,
    image: 'https://placehold.co/40x40/d1c4e9/4c1d95?text=W',
  },
];

const CATEGORIES = [
  { name: 'Fashion', href: '/products?category=Fashion', image: 'https://placehold.co/48x48/ede9fe/5b21b6?text=👗' },
  { name: 'Beauty', href: '/products?category=Beauty', image: 'https://placehold.co/48x48/fce4ec/c2185b?text=💄' },
  { name: 'Electronics', href: '/products?category=Electronics', image: 'https://placehold.co/48x48/ddd6fe/4338ca?text=🎧' },
  { name: 'Books', href: '/products?category=Books', image: 'https://placehold.co/48x48/f3e8ff/7e22ce?text=📚' },
  { name: 'Home', href: '/products?category=Home', image: 'https://placehold.co/48x48/f1e1e6/7a6fb0?text=🏠' },
  { name: 'Sports', href: '/products?category=Sports', image: 'https://placehold.co/48x48/e8d5f0/7c3aed?text=🏀' },
  { name: 'Health', href: '/products?category=Health', image: 'https://placehold.co/48x48/fde3ef/9b59b6?text=💊' },
  { name: 'Kids', href: '/products?category=Kids', image: 'https://placehold.co/48x48/d1c4e9/4c1d95?text=🧸' },
];

const FEATURED_PRODUCTS = [
  { id: 'feat-1', name: 'Heels Collection', category: 'Fashion', price: 3599, rating: 4.5, reviewCount: 214, image: 'https://placehold.co/160x140/fce4ec/9b59b6?text=Heels' },
  { id: 'feat-2', name: 'Gold Jewelry Set', category: 'Fashion', price: 8999, rating: 5, reviewCount: 98, image: 'https://placehold.co/160x140/fce4ec/c2185b?text=Jewelry' },
  { id: 'feat-3', name: 'Designer Backpack', category: 'Fashion', price: 4200, rating: 4, reviewCount: 452, image: 'https://placehold.co/160x140/ede9fe/5b21b6?text=Backpack' },
  { id: 'feat-4', name: 'Skincare Bundle', category: 'Beauty', price: 2100, rating: 4.5, reviewCount: 167, image: 'https://placehold.co/160x140/f3e8ff/7e22ce?text=Skincare' },
  { id: 'feat-5', name: 'Smart Watch Pro', category: 'Electronics', price: 15999, rating: 5, reviewCount: 310, image: 'https://placehold.co/160x140/ddd6fe/4338ca?text=Watch' },
  { id: 'feat-6', name: 'Running Shoes', category: 'Sports', price: 6499, rating: 4, reviewCount: 523, image: 'https://placehold.co/160x140/fce4ec/9b59b6?text=Shoes' },
];

const CLOTHING_BEST_SELLERS = [
  { id: 'cloth-1', name: 'Oversized Denim Jacket', brand: 'UrbanFit', category: 'Fashion', price: 4999, originalPrice: 6999, rating: 4.5, reviewCount: 320, image: 'https://placehold.co/170x130/ede9fe/5b21b6?text=Jacket', badge: 'BESTSELLER' },
  { id: 'cloth-2', name: 'Floral Wrap Dress', brand: 'Chic Lane', category: 'Fashion', price: 3200, rating: 4, reviewCount: 189, image: 'https://placehold.co/170x130/fce4ec/9b59b6?text=Dress' },
  { id: 'cloth-3', name: 'Classic Fit Chinos', brand: 'Herringbone', category: 'Fashion', price: 2799, originalPrice: 3499, rating: 4.5, reviewCount: 271, image: 'https://placehold.co/170x130/f3e8ff/7e22ce?text=Chinos', badge: 'SALE' },
  { id: 'cloth-4', name: 'Ribbed Knit Sweater', brand: 'Chic Lane', category: 'Fashion', price: 3599, rating: 4, reviewCount: 143, image: 'https://placehold.co/170x130/e8d5f0/7c3aed?text=Sweater' },
  { id: 'cloth-5', name: 'Everyday Linen Shirt', brand: 'UrbanFit', category: 'Fashion', price: 2499, rating: 4.5, reviewCount: 402, image: 'https://placehold.co/170x130/d1c4e9/4c1d95?text=Shirt', badge: 'BESTSELLER' },
  { id: 'cloth-6', name: 'High-Waist Trousers', brand: 'Herringbone', category: 'Fashion', price: 3100, originalPrice: 3900, rating: 4, reviewCount: 96, image: 'https://placehold.co/170x130/fde3ef/9b59b6?text=Trousers', badge: 'SALE' },
  { id: 'cloth-7', name: 'Athleisure Jogger Set', brand: 'MoveWell', category: 'Fashion', price: 3799, rating: 4.5, reviewCount: 258, image: 'https://placehold.co/170x130/ddd6fe/4338ca?text=Joggers' },
  { id: 'cloth-8', name: 'Tailored Blazer', brand: 'Herringbone', category: 'Fashion', price: 6999, rating: 5, reviewCount: 61, image: 'https://placehold.co/170x130/e8d5f0/7c3aed?text=Blazer', badge: 'NEW' },
];

const BEAUTY_POPULAR = [
  { id: 'beauty-1', name: 'Matte Liquid Lipstick Set', brand: 'Huda Beauty', category: 'Beauty', price: 2399, originalPrice: 3999, rating: 5, reviewCount: 1204, image: 'https://placehold.co/170x130/fce4ec/9b59b6?text=Lipstick', badge: 'SALE' },
  { id: 'beauty-2', name: 'Vitamin C Brightening Serum', brand: 'The Ordinary', category: 'Beauty', price: 1850, originalPrice: 2500, rating: 4, reviewCount: 876, image: 'https://placehold.co/170x130/f3e8ff/7e22ce?text=Serum', badge: 'NEW' },
  { id: 'beauty-3', name: 'Hydrating Foundation', brand: 'Fenty Beauty', category: 'Beauty', price: 3299, rating: 4.5, reviewCount: 540, image: 'https://placehold.co/170x130/fdf2f8/a21caf?text=Foundation' },
  { id: 'beauty-4', name: 'Rose Gold Eyeshadow Palette', brand: 'Huda Beauty', category: 'Beauty', price: 2899, rating: 4.5, reviewCount: 690, image: 'https://placehold.co/170x130/fce4ec/c2185b?text=Eyeshadow', badge: 'BESTSELLER' },
  { id: 'beauty-5', name: 'Nourishing Hair Mask', brand: 'Kerastase', category: 'Beauty', price: 2100, originalPrice: 2600, rating: 4, reviewCount: 233, image: 'https://placehold.co/170x130/ede9fe/5b21b6?text=Hair+Mask', badge: 'SALE' },
  { id: 'beauty-6', name: 'Luxury Perfume — Blossom', brand: 'Chanel', category: 'Beauty', price: 8999, rating: 5, reviewCount: 112, image: 'https://placehold.co/170x130/f3e8ff/7e22ce?text=Perfume' },
  { id: 'beauty-7', name: 'SPF 50 Sunscreen Gel', brand: 'The Ordinary', category: 'Beauty', price: 1499, rating: 4.5, reviewCount: 998, image: 'https://placehold.co/170x130/fde3ef/9b59b6?text=Sunscreen' },
  { id: 'beauty-8', name: 'Charcoal Face Wash', brand: 'Neutrogena', category: 'Beauty', price: 899, rating: 4, reviewCount: 344, image: 'https://placehold.co/170x130/ddd6fe/4338ca?text=Face+Wash' },
];

const RECOMMENDED = [
  { id: 'rec-1', name: 'Premium Moisturizer Cream', rating: 4, reviewCount: 88, price: 1299, status: 'In Stock', statusColor: 'text-green-500', image: 'https://placehold.co/56x56/f3e8ff/7e22ce?text=🧴' },
  { id: 'rec-2', name: 'Instant Camera — Retro', rating: 4.5, reviewCount: 201, price: 9850, status: 'Only 5 left', statusColor: 'text-red-400', image: 'https://placehold.co/56x56/ede9fe/5b21b6?text=📷' },
  { id: 'rec-3', name: 'Aromatherapy Candle Set', rating: 5, reviewCount: 44, price: 2750, status: 'In Stock', statusColor: 'text-green-500', image: 'https://placehold.co/56x56/fce4ec/c2185b?text=🕯️' },
];

const CONTINUE_SHOPPING = [
  { id: 'cont-1', name: 'Sun Hat', price: 850, image: 'https://placehold.co/80x70/f3e8ff/7e22ce?text=👒' },
  { id: 'cont-2', name: 'Silk Scarf', price: 1200, image: 'https://placehold.co/80x70/fce4ec/9b59b6?text=🧣' },
  { id: 'cont-3', name: 'Sunglasses', price: 2300, image: 'https://placehold.co/80x70/ede9fe/5b21b6?text=🕶️' },
  { id: 'cont-4', name: 'Yoga Mat', price: 3100, image: 'https://placehold.co/80x70/f3e8ff/7e22ce?text=🧘' },
  { id: 'cont-5', name: 'Earbuds', price: 7499, image: 'https://placehold.co/80x70/ddd6fe/4338ca?text=🎧' },
  { id: 'cont-6', name: 'Indoor Plant', price: 650, image: 'https://placehold.co/80x70/fce4ec/c2185b?text=🪴' },
];

// ---------------------------------------------------------------------------
// Horizontal scroll row — used for "Best Sellers in Clothing" and
// "Popular products in Beauty". Uses useRef to drive scrollBy() on the
// left/right arrow controls, and tracks scroll position to disable arrows
// at each end.
// ---------------------------------------------------------------------------
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  function goToSlide(index) {
    setCurrentSlide(index);
  }

  function moveSlide(direction) {
    setCurrentSlide((prev) => (prev + direction + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  function startAutoplay() {
    stopAutoplay();
    intervalRef.current = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-hero-gradient min-h-[calc(100vh-100px)] overflow-x-hidden">
      {/* =================================================================
          HERO CAROUSEL — the purple/pink banner at the top of the page
      ================================================================= */}
      <div
        className="relative overflow-hidden h-[300px] sm:h-[340px] md:h-[380px]"
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <div
          className="carousel-track h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="carousel-slide h-full flex items-center justify-between px-4 sm:px-6 md:px-16"
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

              <img
                src={slide.image}
                alt={slide.tag}
                className="rounded-2xl shadow-2xl hidden lg:block h-[220px] xl:h-[260px] w-[320px] xl:w-[400px] object-cover"
              />
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
          {HERO_SLIDES.map((slide, index) => (
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

      {/* =================================================================
          DASHBOARD GRID — 4-container grid (Today's Deals spans 2,
          Sign-in panel + Wishlist fill the remaining 2 columns)
      ================================================================= */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 py-5 sm:py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Container 1+2: Today's Deals (spans 2 columns on large screens) */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-3.5 sm:p-4 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Today&apos;s Deals</h2>
            <Link href="/products?sort=deals" className="text-xs text-purple-600 font-bold hover:underline shrink-0">
              See all deals
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {TODAYS_DEALS.map((deal) => (
              <div
                key={deal.id}
                className="product-card bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-2.5 sm:p-3 cursor-pointer border border-purple-100 min-w-0"
              >
                <div className="relative mb-2">
                  <img src={deal.image} className="w-full rounded-lg object-cover h-[70px] sm:h-[90px]" alt={deal.name} />
                  <span className="deal-badge absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    -{deal.discount}%
                  </span>
                </div>
                <p className="text-xs font-bold text-gray-800 leading-tight mb-1 line-clamp-2">{deal.name}</p>
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-purple-700 font-black text-xs sm:text-sm">Rs {deal.price.toLocaleString()}</span>
                  <span className="text-gray-400 text-[10px] sm:text-xs line-through">Rs {deal.originalPrice.toLocaleString()}</span>
                </div>
                <div className="mt-1.5 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: `${deal.claimed}%` }} />
                </div>
                <p className="text-[10px] text-red-500 font-bold mt-0.5">{deal.claimed}% claimed</p>
              </div>
            ))}
          </div>
        </div>

        {/* Container 3: Sign-in panel */}
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

        {/* Container 4: Wishlist */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-purple-900">Your Wishlist</h2>
            <i className="fas fa-heart text-pink-400" />
          </div>
          <ul className="space-y-2">
            {WISHLIST_ITEMS.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50 cursor-pointer"
              >
                <img
                  src={item.image}
                  className="rounded-lg w-10 h-10 object-cover shrink-0"
                  alt={item.name}
                />
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

      {/* =================================================================
          SHOP BY CATEGORY
      ================================================================= */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Shop by Category</h2>
            <Link href="/products" className="text-xs text-purple-600 font-bold hover:underline">
              All categories
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3">
            {CATEGORIES.map((category) => (
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

      {/* =================================================================
          FEATURED PRODUCTS — static responsive grid
      ================================================================= */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Featured Products</h2>
            <Link href="/products" className="text-xs text-purple-600 font-bold hover:underline">
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================
          BEST SELLERS IN CLOTHING — horizontal scroll carousel
      ================================================================= */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
        <ScrollableProductRow
          title="Best Sellers in Clothing"
          subtitle="Top-rated fashion picks this week"
          seeAllHref="/products?category=Fashion"
          products={CLOTHING_BEST_SELLERS}
        />
      </div>

      {/* =================================================================
          POPULAR PRODUCTS IN BEAUTY — horizontal scroll carousel
      ================================================================= */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-4">
        <ScrollableProductRow
          title="Popular products in Beauty"
          subtitle="Loved by thousands of Critipick shoppers"
          seeAllHref="/products?category=Beauty"
          products={BEAUTY_POPULAR}
        />
      </div>

      {/* =================================================================
          PROMO BANNER + RECOMMENDED FOR YOU
      ================================================================= */}
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
            {RECOMMENDED.map((item) => (
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

      {/* =================================================================
          CONTINUE SHOPPING
      ================================================================= */}
      <div className="w-full max-w-screen-xl mx-auto px-3 sm:px-4 pb-8">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-purple-900">Continue Shopping</h2>
            <Link href="/profile#history" className="text-xs text-purple-600 font-bold hover:underline">
              See history
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {CONTINUE_SHOPPING.map((item) => (
              <div
                key={item.id}
                className="product-card p-2 rounded-xl bg-purple-50/60 cursor-pointer flex flex-col items-center border border-purple-100 min-w-0"
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
