// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.data?.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-semibold text-xs">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-4 py-8 md:py-16">
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        {/* Flipkart Success Card */}
        <div className="bg-white rounded-md border border-gray-200 p-8 md:p-12 space-y-6 shadow-sm">
          {/* Green Checkmark Circle */}
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600 text-3xl shadow-inner">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight" id="order-success-title">
              Order Placed Successfully!
            </h1>
            <p className="text-xs md:text-sm text-gray-500 max-w-md mx-auto">
              Your payment has been verified and your order has been confirmed. Confirmation SMS & Email have been sent.
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-gray-50 border border-gray-200 rounded p-5 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block mb-0.5">Order ID</span>
              <span className="font-mono font-bold text-[#2874f0] select-all" id="confirmed-order-id">
                {order?._id || id}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block mb-0.5">Order Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-green-700" id="confirmed-order-status">
                ● {order?.status || 'PLACED'}
              </span>
            </div>

            <div>
              <span className="text-gray-500 block mb-0.5">Payment Method</span>
              <span className="font-bold text-gray-800">
                Razorpay Online ({order?.paymentStatus || 'PAID'})
              </span>
            </div>

            <div>
              <span className="text-gray-500 block mb-0.5">Amount Paid</span>
              <span className="text-base font-bold text-gray-900" id="confirmed-order-total">
                ₹{order?.totalAmount?.toLocaleString('en-IN') || '0'}
              </span>
            </div>

            {order?.shippingAddress && (
              <div className="sm:col-span-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500 block mb-0.5">Delivery Address</span>
                <p className="text-gray-700">
                  <strong>{order.shippingAddress.fullName}</strong>, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/orders"
              className="w-full sm:w-auto px-8 py-3 rounded font-bold text-xs text-white bg-[#2874f0] hover:bg-[#1a5ed8] shadow transition-all cursor-pointer"
              id="view-my-orders-btn"
            >
              View My Orders
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-3 rounded font-bold text-xs text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
              id="continue-shopping-btn"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
