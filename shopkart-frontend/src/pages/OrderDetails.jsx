// src/pages/OrderDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success && res.data.order) {
        setOrder(res.data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      if (err.response?.status === 403) {
        setError('Forbidden: You are not authorized to view this order.');
      } else if (err.response?.status === 404) {
        setError('Order not found in ShopKart.');
      } else {
        setError(err.response?.data?.message || 'Could not load order details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.data?.success && res.data.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const getStepIndex = (st) => {
    return steps.indexOf(st);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 flex items-center justify-center px-4 py-12">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-semibold text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-md p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Unable to view order</h2>
          <p className="text-xs text-gray-500">{error || 'Order not found'}</p>
          <Link
            to="/orders"
            className="inline-block px-6 py-2 rounded font-semibold text-xs text-white bg-[#2874f0] hover:bg-[#1a5ed8] transition-all cursor-pointer"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/orders" className="hover:text-[#2874f0]">
            My Orders
          </Link>
          <span>›</span>
          <span className="text-gray-800 font-semibold font-mono">#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Top Cards: Delivery Address + Rewards / Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-md border border-gray-200 p-5 shadow-sm space-y-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Delivery Address
            </h2>
            <p className="text-sm font-bold text-gray-800">
              {order.shippingAddress?.fullName || 'Customer'}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-xs text-gray-500 pt-1">
              <span className="font-semibold text-gray-700">Phone:</span> {order.shippingAddress?.phone}
            </p>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-5 shadow-sm flex flex-col justify-between space-y-2 text-xs">
            <div>
              <span className="font-bold text-gray-500 uppercase text-[11px] block mb-1">More Actions</span>
              <p className="text-gray-600">Need help with your item or delivery?</p>
            </div>
            <button
              onClick={() => alert('Support ticket raised. Our support team will assist you within 24 hours.')}
              className="w-full py-2 border border-gray-300 rounded font-semibold text-gray-700 hover:border-[#2874f0] hover:text-[#2874f0] transition-colors cursor-pointer text-center"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Order Tracking Timeline (Flipkart Green Stepper) */}
        <div className="bg-white rounded-md border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400 block font-mono">Order #{order._id}</span>
              <h2 className="text-base font-bold text-gray-800">Tracking Timeline</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200">
              ● {order.status}
            </span>
          </div>

          {/* Stepper Steps */}
          <div className="grid grid-cols-4 gap-2 text-center relative">
            {steps.map((st, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={st} className="space-y-2 relative">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-[#388e3c] text-white shadow-sm'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-[#388e3c]'
                        : isCompleted
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {st}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Status Progression Controls */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Simulate order progression:</span>
            <div className="flex gap-2">
              {steps.map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  disabled={isUpdatingStatus || order.status === st}
                  className={`px-3 py-1 rounded border text-xs font-semibold cursor-pointer transition-colors ${
                    order.status === st
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                      : 'border-gray-300 text-gray-700 hover:border-[#2874f0] hover:text-[#2874f0]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Items in this Order</h3>
            <span className="text-xs text-gray-500">{order.items?.length || 0} Products</span>
          </div>

          <div className="p-4 space-y-4">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-contain rounded border border-gray-100 p-1"
                    />
                  )}
                  <div>
                    <Link
                      to={`/products/${item.product?._id}`}
                      className="text-sm font-bold text-gray-800 hover:text-[#2874f0] transition-colors line-clamp-1"
                    >
                      {item.product?.name || 'Product'}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Quantity: <span className="font-semibold text-gray-700">{item.quantity}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    ₹{((item.price || item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </span>
                  <p className="text-[11px] text-green-600 font-semibold">Special Offer Applied</p>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary Footer */}
          <div className="p-4 bg-gray-50/70 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Payment Status: <strong className="text-gray-800">{order.paymentStatus || 'PAID'}</strong>
            </span>
            <div className="text-right">
              <span className="text-gray-500 mr-2">Total Amount Paid:</span>
              <span className="text-base font-bold text-gray-900">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
