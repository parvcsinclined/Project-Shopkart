// src/pages/Checkout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

// Helper to dynamically load the Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, subtotal, cartCount, loading: cartLoading, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [razorpayOrderData, setRazorpayOrderData] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const isCartEmpty = !cartLoading && cartItems.length === 0;

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setSubmitError('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    if (cartItems.length === 0) {
      setSubmitError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create Order & Razorpay Order on server
      const res = await api.post('/orders', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data?.success || !res.data.razorpayOrderId) {
        throw new Error(res.data?.message || 'Failed to initialize payment gateway.');
      }

      const { razorpayOrderId, shopKartOrderId, amount, currency, keyId } = res.data;

      setRazorpayOrderData({
        razorpayOrderId,
        shopKartOrderId,
        amount,
        currency,
        keyId,
      });

      // Step 2: Try to launch Razorpay Modal SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setShowSimulator(true);
        return;
      }

      try {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency || 'INR',
          name: 'ShopKart Online Store',
          description: `Order #${shopKartOrderId}`,
          order_id: razorpayOrderId,
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
          },
          theme: {
            color: '#2874f0',
          },
          handler: async function (response) {
            try {
              const verifyRes = await api.post('/orders/verify-payment', {
                shopKartOrderId: shopKartOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data?.success) {
                await fetchCart();
                navigate(`/order-success/${shopKartOrderId}`);
              } else {
                setSubmitError(verifyRes.data?.message || 'Payment verification failed.');
              }
            } catch (vErr) {
              setSubmitError(vErr.response?.data?.message || 'Error verifying payment signature');
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              setSubmitError('Payment modal was closed. You can retry payment below.');
            },
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (failRes) {
          setSubmitError(
            `Payment failed: ${failRes.error?.description || 'Transaction declined'}. Cart preserved.`
          );
          setIsSubmitting(false);
        });
        paymentObject.open();
      } catch (openErr) {
        setShowSimulator(true);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      const msg = err.response?.data?.message || err.message || 'Unable to place order';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for direct test simulation (ideal for Viva demo / offline testing)
  const handleSimulatePayment = async (status) => {
    if (!razorpayOrderData) return;
    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (status === 'success') {
        const testPaymentId = `pay_sim_${Date.now()}`;
        const verifyRes = await api.post('/orders/verify-payment', {
          shopKartOrderId: razorpayOrderData.shopKartOrderId,
          razorpay_order_id: razorpayOrderData.razorpayOrderId,
          razorpay_payment_id: testPaymentId,
          razorpay_signature: 'simulated_test_signature',
        });

        if (verifyRes.data?.success) {
          setShowSimulator(false);
          await fetchCart();
          navigate(`/order-success/${razorpayOrderData.shopKartOrderId}`);
        } else {
          setSubmitError(verifyRes.data?.message || 'Verification failed');
        }
      } else if (status === 'fail_signature') {
        await api.post('/orders/verify-payment', {
          shopKartOrderId: razorpayOrderData.shopKartOrderId,
          razorpay_order_id: razorpayOrderData.razorpayOrderId,
          razorpay_payment_id: 'pay_tampered_123',
          razorpay_signature: 'tampered_bad_signature',
        });
      } else {
        setShowSimulator(false);
        setSubmitError('Payment was cancelled or failed. Your cart items are preserved.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const originalTotal = Math.round(subtotal * 1.25);
  const totalSavings = originalTotal - subtotal;

  if (isCartEmpty) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-md p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-3xl">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-800">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500">
            You cannot proceed to checkout without any products in your cart.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded font-bold text-sm text-white bg-[#2874f0] hover:bg-[#1a5ed8] shadow transition-all cursor-pointer"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Breadcrumb & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/cart" className="hover:text-[#2874f0] transition-colors">
              Cart
            </Link>
            <span>›</span>
            <span className="text-gray-800 font-semibold">Secure Checkout</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-50 text-[#2874f0] font-semibold border border-blue-200">
            🛡️ 100% Safe Payments
          </span>
        </div>

        {/* Global Error Banner */}
        {submitError && (
          <div
            className="p-3.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 shadow-sm animate-fade-in"
            id="checkout-error-banner"
          >
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold">Unable to complete checkout</p>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        {/* Main Grid: Steps (Left 8 cols) + Price Details (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-3">
            {/* Step 1: Login Header */}
            <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#2874f0] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase">LOGIN ✓</span>
                  <p className="text-xs text-gray-800 font-medium">Logged in to verified account</p>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address Form */}
            <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#2874f0] text-white p-3.5 px-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-white text-[#2874f0] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-sm font-bold uppercase tracking-wider">
                  DELIVERY ADDRESS
                </span>
              </div>

              <form onSubmit={handlePlaceOrder} className="p-5 md:p-6 space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      id="shipping-fullName"
                      className={`w-full px-3 py-2 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                        errors.fullName ? 'border-red-500 bg-red-50/40' : 'border-gray-300 focus:border-[#2874f0]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-[11px] text-red-500" id="error-fullName">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      10-digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      id="shipping-phone"
                      className={`w-full px-3 py-2 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                        errors.phone ? 'border-red-500 bg-red-50/40' : 'border-gray-300 focus:border-[#2874f0]'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-red-500" id="error-phone">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Street Address / Flat / Building *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="House no., Building name, Street"
                    id="shipping-addressLine1"
                    className={`w-full px-3 py-2 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                      errors.addressLine1 ? 'border-red-500 bg-red-50/40' : 'border-gray-300 focus:border-[#2874f0]'
                    }`}
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-[11px] text-red-500" id="error-addressLine1">{errors.addressLine1}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. New Delhi"
                      id="shipping-city"
                      className={`w-full px-3 py-2 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                        errors.city ? 'border-red-500 bg-red-50/40' : 'border-gray-300 focus:border-[#2874f0]'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-[11px] text-red-500" id="error-city">{errors.city}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Delhi"
                      id="shipping-state"
                      className={`w-full px-3 py-2 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                        errors.state ? 'border-red-500 bg-red-50/40' : 'border-gray-300 focus:border-[#2874f0]'
                      }`}
                    />
                    {errors.state && (
                      <p className="mt-1 text-[11px] text-red-500" id="error-state">{errors.state}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      6-digit Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6 digits"
                      maxLength={6}
                      id="shipping-pincode"
                      className={`w-full px-3 py-2 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                        errors.pincode ? 'border-red-500 bg-red-50/40' : 'border-gray-300 focus:border-[#2874f0]'
                      }`}
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-[11px] text-red-500" id="error-pincode">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-8 rounded font-bold text-sm text-white bg-[#fb641b] hover:bg-[#e85b17] shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                    id="place-order-submit-btn"
                  >
                    {isSubmitting ? (
                      <span>Processing...</span>
                    ) : (
                      <span>DELIVER HERE & PAY ₹{subtotal.toLocaleString('en-IN')}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Step 3: Order Summary Preview */}
            <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase">ORDER SUMMARY</span>
                  <p className="text-xs text-gray-500">{cartCount} items in cart</p>
                </div>
              </div>
              <Link to="/cart" className="text-xs font-semibold text-[#2874f0] hover:underline">
                View Items
              </Link>
            </div>

            {/* Step 4: Payment Options Preview */}
            <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <div>
                  <span className="text-xs font-bold text-gray-600 uppercase">PAYMENT OPTIONS</span>
                  <p className="text-xs text-gray-500">UPI, Cards, NetBanking, Razorpay Gateway</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: PRICE DETAILS */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            <div className="bg-white rounded-md border border-gray-200 shadow-sm p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider pb-3 border-b border-gray-100">
                Price Details
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Price ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                  <span>₹{originalTotal.toLocaleString('en-IN')}</span>
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
                  <span>Total Payable</span>
                  <span className="text-xl text-gray-900" id="checkout-total-payable">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {totalSavings > 0 && (
                <div className="pt-2 text-xs font-semibold text-green-700 border-t border-gray-100">
                  Your total savings on this order: ₹{totalSavings.toLocaleString('en-IN')}
                </div>
              )}
            </div>

            <div className="p-4 bg-white rounded-md border border-gray-200 text-xs text-gray-500 flex items-center gap-2">
              <span>🔒</span>
              <span>100% Purchase Protection with Razorpay Encrypted Gateway</span>
            </div>
          </div>
        </div>

        {/* --- RAZORPAY TEST SIMULATOR MODAL --- */}
        {showSimulator && razorpayOrderData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#2874f0] text-white flex items-center justify-center font-bold text-sm">
                    ₹
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">Razorpay Payment Gateway</h3>
                    <p className="text-[11px] text-gray-500">Test Simulation Mode</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSimulator(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-gray-50 p-3 rounded text-xs space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-mono">{razorpayOrderData.shopKartOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payable Amount:</span>
                  <span className="font-bold text-gray-900">₹{(razorpayOrderData.amount / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-xs text-gray-600">
                Live Razorpay popup was simulated. Select a test outcome to complete your order verification:
              </p>

              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleSimulatePayment('success')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded font-bold text-xs text-white bg-green-600 hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✓ Simulate Successful Payment</span>
                </button>

                <button
                  onClick={() => handleSimulatePayment('failed')}
                  disabled={isSubmitting}
                  className="w-full py-2 rounded font-semibold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Simulate Payment Cancel / Fail
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
