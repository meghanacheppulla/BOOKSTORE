import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const CartContext = createContext(null);
const CART_KEY = 'bookstore_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((book, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.book === book._id);
      if (existing) {
        return prev.map((i) =>
          i.book === book._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...prev,
        {
          book: book._id,
          title: book.title,
          price: book.price,
          coverImage: book.coverImage,
          stock: book.stock,
          quantity,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((bookId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => (i.book === bookId ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((bookId) => {
    setItems((prev) => prev.filter((i) => i.book !== bookId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice > 500 || itemsPrice === 0 ? 0 : 40;
    return {
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      itemsPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice,
    };
  }, [items]);

  const value = { items, addToCart, updateQuantity, removeFromCart, clearCart, ...totals };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
