'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Product } from './supabase';

export type CartVariant = {
  id: string;
  group_name: string;
  label: string;
  color_hex: string | null;
  image_url: string | null;
};

export type CartItem = {
  product: Product;
  quantity: number;
  variant?: CartVariant;
};

// Clave única de línea de carrito: mismo producto con distinta variante
// (ej. dos colores del mismo labial) son líneas separadas.
export function cartLineKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId;
}

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: CartVariant) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'detodoymas-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, quantity = 1, variant?: CartVariant) => {
    setItems(prev => {
      const key = cartLineKey(product.id, variant?.id);
      const existing = prev.find(i => cartLineKey(i.product.id, i.variant?.id) === key);
      if (existing) {
        return prev.map(i =>
          cartLineKey(i.product.id, i.variant?.id) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity, variant }];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const key = cartLineKey(productId, variantId);
    setItems(prev => prev.filter(i => cartLineKey(i.product.id, i.variant?.id) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    const key = cartLineKey(productId, variantId);
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => cartLineKey(i.product.id, i.variant?.id) !== key));
      return;
    }
    setItems(prev =>
      prev.map(i =>
        cartLineKey(i.product.id, i.variant?.id) === key ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isCartOpen, setCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
