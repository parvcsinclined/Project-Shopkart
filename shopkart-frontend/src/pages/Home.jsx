// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', color: '#e3f2fd', border: '#2874f0' },
  { name: 'Fashion', icon: '👗', color: '#fce4ec', border: '#e91e63' },
  { name: 'Books', icon: '📚', color: '#e8f5e9', border: '#4caf50' },
  { name: 'Home', icon: '🏠', color: '#fff8e1', border: '#ff9800' },
  { name: 'Sports', icon: '⚽', color: '#f3e5f5', border: '#9c27b0' },
  { name: 'Toys', icon: '🧸', color: '#fbe9e7', border: '#ff5722' },
];

const DEALS_TIMER_START = 14 * 3600 + 37 * 60 + 22;

function useCountdown(seconds) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hrs = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  return {
    hrs: String(hrs).padStart(2, '0'),
    mins: String(mins).padStart(2, '0'),
    secs: String(secs).padStart(2, '0'),
  };
}

export default function Home({ user, setUser }) {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(user);
  const [loading, setLoading] = useState(!user);
  const countdown = useCountdown(DEALS_TIMER_START);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        const response = await api.get('/customers/me');
        if (isMounted) {
          setCustomer(response.data);
          if (setUser) setUser(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (setUser) setUser(null);
          navigate('/login');
        }
      }
    };

    fetchCustomerProfile();
    return () => { isMounted = false; };
  }, [navigate, setUser]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      if (setUser) setUser(null);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center" style={{ background: '#f1f3f6' }}>
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">Loading your profile...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-[calc(100vh-80px)]" style={{ background: '#f1f3f6' }}>
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

        {/* Hero Banner */}
        <div className="hero-banner rounded-lg p-8 md:p-12 text-white relative overflow-hidden" style={{ minHeight: 220 }}>
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: '#FFE11A', color: '#212121' }}>
                🎉 Welcome Back!
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Hello, <span style={{ color: '#FFE11A' }}>{customer.fullName?.split(' ')[0] || 'User'}!</span>
            </h1>
            <p className="text-blue-200 text-sm md:text-base mb-6 max-w-md">
              Discover millions of products across categories. Great deals, fast delivery!
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/products"
                className="fk-btn-yellow px-6 py-3 rounded font-bold text-sm hover:opacity-90 transition-all"
                id="home-browse-products-btn"
              >
                🛍️ Browse Products
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-3 text-sm font-semibold text-white border border-white/40 rounded hover:bg-white/10 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-40 h-40 rounded-full" style={{ background: 'rgba(255,225,26,0.15)', border: '2px solid rgba(255,225,26,0.3)' }}>
            <span className="text-6xl">🛒</span>
          </div>
        </div>

        {/* Deals of the Day */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <h2 className="fk-section-title">🔥 Deals of the Day</h2>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 font-medium">Ends in</span>
              <div className="flex gap-1">
                {[countdown.hrs, countdown.mins, countdown.secs].map((val, i) => (
                  <React.Fragment key={i}>
                    <span
                      className="countdown-timer text-white text-sm font-bold px-2 py-1 rounded min-w-[32px] text-center"
                      style={{ background: '#212121' }}
                    >
                      {val}
                    </span>
                    {i < 2 && <span className="text-gray-400 font-bold">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <Link to="/products" className="ml-auto text-sm font-semibold" style={{ color: '#2874f0' }}>
              View All →
            </Link>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electronics', 'Fashion', 'Books', 'Home'].map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${encodeURIComponent(cat)}`}
                className="flex flex-col items-center gap-2 p-4 rounded hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-200"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background: '#eaf0ff' }}>
                  {cat === 'Electronics' ? '📱' : cat === 'Fashion' ? '👗' : cat === 'Books' ? '📚' : '🏠'}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">{cat}</span>
                <span className="text-[11px] font-medium" style={{ color: '#ff6161' }}>Up to 70% off</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="fk-section-title">Shop by Category</h2>
            <Link to="/products" className="text-sm font-semibold" style={{ color: '#2874f0' }}>View All →</Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:shadow-md cursor-pointer group"
                style={{
                  background: cat.color,
                  border: `1px solid ${cat.border}20`,
                }}
              >
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                <span className="text-xs font-semibold text-gray-700 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: '#2874f0' }}>
              {(customer.fullName || customer.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Account Details</h2>
              <p className="text-xs text-gray-500">Manage your profile information</p>
            </div>
            <span className="ml-auto text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1 rounded border border-gray-200">
              ID: {(customer._id || 'N/A').substring(0, 12)}...
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Full Name', value: customer.fullName, id: 'user-fullname', icon: '👤' },
              { label: 'Email Address', value: customer.email, id: 'user-email', icon: '📧' },
              { label: 'Phone Number', value: customer.phone, id: 'user-phone', icon: '📞' },
            ].map((field) => (
              <div
                key={field.label}
                className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{field.icon}</span>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{field.label}</span>
                </div>
                <div className="text-base font-bold text-gray-800 truncate" id={field.id}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="fk-section-title mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'My Orders', icon: '📦', to: '/orders', desc: 'Track your orders' },
              { label: 'Wishlist', icon: '❤️', to: '/wishlist', desc: 'Saved for later' },
              { label: 'My Cart', icon: '🛒', to: '/cart', desc: 'Ready to buy' },
              { label: 'Browse Products', icon: '🔍', to: '/products', desc: 'Explore catalog' },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="flex flex-col gap-1 p-4 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{link.label}</span>
                <span className="text-xs text-gray-500">{link.desc}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}