// src/pages/Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, loading, error, subtotal, cartCount, uniqueItemsCount, fetchCart } = useCart();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const originalTotal = Math.round(subtotal * 1.25);
  const totalSavings = originalTotal - subtotal;

  // --- UI STATE 1: LOADING STATE ---
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-4 py-8 md:py-12" id="cart-loading-state">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mb-3" />
            <p className="text-gray-700 font-semibold text-sm">Loading your cart...</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-5 rounded bg-white border border-gray-200 animate-pulse flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded bg-gray-200" />
                  <div className="space-y-2">
                    <div className="w-40 h-4 bg-gray-200 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- UI STATE 2: ERROR STATE ---
  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 flex items-center justify-center px-4 py-12" id="cart-error-state">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-md p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Unable to load your cart.</h2>
          <p className="text-xs text-gray-500">{error}</p>
          <button
            onClick={fetchCart}
            className="mt-3 px-6 py-2 rounded font-semibold text-sm text-white bg-[#2874f0] hover:bg-[#1a5ed8] cursor-pointer shadow transition-all"
            id="try-again-cart-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- UI STATE 3: EMPTY STATE ---
  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 flex items-center justify-center px-4 py-12" id="cart-empty-state">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-md p-10 text-center space-y-4 shadow-sm">
          <div className="w-24 h-24 mx-auto flex items-center justify-center text-5xl">
            🛒
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-800">
              Your cart is empty!
            </h2>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Explore our wide selection of products and discover great deals today.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-2.5 rounded font-bold text-sm text-white bg-[#2874f0] hover:bg-[#1a5ed8] shadow-md transition-all cursor-pointer"
              id="browse-products-btn"
            >
              <span>Shop Now</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- CART PAGE WITH ITEMS & PRICE DETAILS ---
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

          {/* Left Column (8 cols): Address + Items + Place Order */}
          <div className="lg:col-span-8 space-y-3">
            {/* Delivery pincode header */}
            <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Deliver to:</span>
                <span className="font-bold text-gray-800">New Delhi - 110001</span>
              </div>
              <button
                type="button"
                className="text-[#2874f0] border border-gray-200 px-3 py-1 rounded font-semibold hover:border-[#2874f0] transition-colors cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Cart Items List Container */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                <h1 className="font-bold text-gray-800 text-base">
                  Flipkart Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
                </h1>
                <Link
                  to="/products"
                  className="text-xs font-semibold text-[#2874f0] hover:underline"
                >
                  + Add More Items
                </Link>
              </div>

              <div>
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product?._id || item._id}
                    item={item}
                  />
                ))}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-4 bg-white flex items-center justify-end shadow-sm">
                <button
                  onClick={handleCheckout}
                  type="button"
                  className="py-3 px-10 rounded font-bold text-sm text-white bg-[#fb641b] hover:bg-[#e85b17] shadow-md transition-all cursor-pointer flex items-center gap-2"
                  id="proceed-to-checkout-btn"
                >
                  <span>PLACE ORDER</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): PRICE DETAILS */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-100">
                Price Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span id="summary-subtotal">₹{originalTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Discount</span>
                  <span className="text-green-600 font-semibold">− ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-semibold">FREE</span>
                </div>

                <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-baseline font-bold text-base text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl text-gray-900" id="summary-total">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="pt-2 text-xs font-semibold text-green-700 border-t border-gray-100">
                  You will save ₹{totalSavings.toLocaleString('en-IN')} on this order
                </div>
              )}
            </div>

            {/* Safe & Secure Guarantee */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-md border border-gray-200 text-xs text-gray-500">
              <svg className="w-7 h-7 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
