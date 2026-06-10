// contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'plantShop_cart';
const MAX_CART_QUANTITY = 1000;

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function clampQuantity(quantity: number): number {
  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

function isPositiveIntegerString(value: string): boolean {
  const numericId = Number(value);
  return Number.isInteger(numericId) && numericId > 0;
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<CartItem>;
  const id = typeof candidate.id === 'string' ? candidate.id.trim() : '';
  const name = typeof candidate.name === 'string' ? candidate.name.trim() : '';
  const image =
    typeof candidate.image === 'string' ? candidate.image.trim() : '';
  const price = Number(candidate.price);
  const quantity = Number(candidate.quantity);

  if (
    !id ||
    !isPositiveIntegerString(id) ||
    !name ||
    !image ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  return {
    id,
    name,
    price,
    image,
    quantity: clampQuantity(quantity),
  };
}

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!savedCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .map((item) => normalizeCartItem(item))
      .filter((item): item is CartItem => item !== null);
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [hasLoadedStoredCart, setHasLoadedStoredCart] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCartItems(readStoredCart());
      setHasLoadedStoredCart(true);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredCart) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, hasLoadedStoredCart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const normalizedItem = normalizeCartItem({ ...item, quantity: 1 });
    if (!normalizedItem) {
      return;
    }

    setCartItems(prev => {
      const existingItem = prev.find(
        cartItem => cartItem.id === normalizedItem.id,
      );
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === normalizedItem.id
            ? { ...cartItem, quantity: clampQuantity(cartItem.quantity + 1) }
            : cartItem
        );
      } else {
        return [...prev, normalizedItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: clampQuantity(quantity) } : item,
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
