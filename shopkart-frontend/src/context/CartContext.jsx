// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children, user }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [itemLoaders, setItemLoaders] = useState({}); // { [productId]: 'adding' | 'updating' | 'removing' }

  // Set action loading for an individual product
  const setItemLoading = (productId, action) => {
    setItemLoaders((prev) => {
      if (!action) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: action };
    });
  };

  // Fetch cart from backend API
  const fetchCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get('/cart');
      if (response.data?.success && Array.isArray(response.data.cart)) {
        setCartItems(response.data.cart);
      } else if (Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (err.response?.status !== 401) {
        setError("We couldn't load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add product to cart (or increment quantity if already present)
  const addToCart = async (productId) => {
    setItemLoading(productId, 'adding');
    try {
      const response = await api.post(`/cart/${productId}`);
      if (response.data?.cart) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: response.data?.message || 'Added to cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add product to cart';
      return { success: false, message: msg, status: err.response?.status };
    } finally {
      setItemLoading(productId, null);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    setItemLoading(productId, 'updating');
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      if (response.data?.cart) {
        setCartItems(response.data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: response.data?.message || 'Quantity updated' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg, status: err.response?.status };
    } finally {
      setItemLoading(productId, null);
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    setItemLoading(productId, 'removing');
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data?.cart) {
        setCartItems(response.data.cart);
      } else {
        setCartItems((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
      }
      return { success: true, message: response.data?.message || 'Removed from cart' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove product from cart';
      return { success: false, message: msg, status: err.response?.status };
    } finally {
      setItemLoading(productId, null);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
      return { success: true };
    } catch (err) {
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  // Helper to check how many units of a product are currently in the cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(
      (i) => (i.product?._id || i.product) === productId
    );
    return item ? item.quantity : 0;
  };

  // Derived values:
  // Subtotal = Σ(product.price * quantity)
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.product?.price) || 0;
      return acc + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  // Cart total items count (total units: Σ(quantity))
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  // Unique products count
  const uniqueItemsCount = cartItems.length;

  const value = {
    cartItems,
    loading,
    error,
    subtotal,
    cartCount,
    uniqueItemsCount,
    itemLoaders,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
