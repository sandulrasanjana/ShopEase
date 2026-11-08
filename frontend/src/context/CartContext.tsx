import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart } from '../types';
import { cartService } from '../services/cartService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedCart = await cartService.getCart();
      setCart(fetchedCart);
    } catch (err: any) {
      console.warn('Could not fetch cart:', err.message);
      // Don't blow up if cart is fresh/empty
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await cartService.addToCart(productId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await cartService.updateItemQuantity(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update item quantity';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to clear cart';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = cart?.totalItems || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        isLoading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

