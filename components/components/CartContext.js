"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const KEY = "ungriff_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem(KEY) || "[]"); setItems(saved); } catch (e) {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }, [items, ready]);

  function addItem(product, size, color, qty = 1) {
    setItems(prev => {
      const key = product.id + "|" + size + "|" + color;
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + qty } : i);
      return [...prev, {
        key, productId: product.id, name: product.name, image: product.images?.[0] || "",
        price: product.promo_price ?? product.price, size, color, qty
      }];
    });
  }
  function updateQty(key, qty) { setItems(prev => qty <= 0 ? prev.filter(i => i.key !== key) : prev.map(i => i.key === key ? { ...i, qty } : i)); }
  function removeItem(key) { setItems(prev => prev.filter(i => i.key !== key)); }
  function clearCart() { setItems([]); }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clearCart, subtotal, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() { return useContext(CartContext); }
