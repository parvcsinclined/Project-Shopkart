// src/pages/Orders.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/orders');
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Could not load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success && res.data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return { color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
      case 'CONFIRMED':
        return { color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' };
      case 'SHIPPED':
        return { color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' };
      case 'DELIVERED':
        return { color: 'bg-green-100 text-green-800', dot: 'bg-green-600' };
      case 'PENDING_PAYMENT':
        return { color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' };
      default:
        return { color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-4 py-8 md:py-12" id="orders-loading-state">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mb-3" />
            <p className="text-gray-700 font-semibold text-sm">Loading your orders...</p>
          </div>
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 rounded bg-white border border-gray-200 animate-pulse space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="w-48 h-4 bg-gray-200 rounded" />
                <div className="w-20 h-5 bg-gray-200 rounded-full" />
              </div>
              <div className="h-12 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-md border border-gray-200 p-4 md:p-5 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">My Orders</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track, return, or buy items again ({orders.length} {orders.length === 1 ? 'order' : 'orders'})
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-[#2874f0] hover:underline"
          >
            Continue Shopping ›
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchOrders}
              className="font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && !error && (
          <div className="bg-white border border-gray-200 rounded-md p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-4xl">
              📦
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-800">No Orders Yet</h2>
              <p className="text-xs text-gray-500">
                You haven't placed any orders yet. Discover our latest deals today!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/products"
                className="px-6 py-2.5 rounded font-bold text-xs text-white bg-[#2874f0] hover:bg-[#1a5ed8] shadow transition-all inline-block"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-3">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order._id}
                className="bg-white rounded-md border border-gray-200 hover:shadow-md transition-all shadow-sm overflow-hidden"
                id={`order-card-${order._id}`}
              >
                {/* Order Card Top Bar */}
                <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">ORDER PLACED</span>
                      <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase">TOTAL</span>
                      <span className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-gray-400 block text-[10px] uppercase">SHIP TO</span>
                      <span className="font-semibold text-gray-800 truncate max-w-[150px] inline-block">
                        {order.shippingAddress?.fullName || 'Customer'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-[#2874f0] font-bold hover:underline"
                    >
                      Order Details ›
                    </Link>
                  </div>
                </div>

                {/* Items & Status Row */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Items preview */}
                  <div className="space-y-3 flex-1">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 object-contain rounded border border-gray-100 p-1"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {item.product?.name || 'Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} · ₹{(item.price || item.product?.price || 0).toLocaleString('en-IN')} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {order.status === 'DELIVERED' ? 'Your item has been delivered' : 'Expected delivery soon'}
                    </p>

                    {/* Progression Demo Dropdown */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400 text-[10px]">Update:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingStatusId === order._id}
                        className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 text-gray-700 cursor-pointer"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
