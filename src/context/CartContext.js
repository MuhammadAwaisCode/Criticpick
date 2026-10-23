'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Initial Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('critipick_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart items:', err);
      }
    }
    setIsHydrated(true);
  }, []);

  // 2. Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('critipick_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}