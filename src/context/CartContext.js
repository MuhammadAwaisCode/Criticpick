'use client';

import { createContext, useContext, useState } from 'react';

// 1. Context create kar rahe hain (Yeh hamara global store hai)
const CartContext = createContext();

// 2. Provider bana rahe hain jo poori app ko data provide karega
export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  // Yeh function jab bhi call hoga, cart mein 1 item add ho jayega
  const addToCart = () => {
    setCartCount((prevCount) => prevCount + 1);
  };

  // Jo data hum poori app mein use karna chahte hain, wo 'value' mein pass kar rahe hain
  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Custom hook bana rahe hain taake kisi bhi file mein ise asani se use kiya ja sake
export function useCart() {
  return useContext(CartContext);
}