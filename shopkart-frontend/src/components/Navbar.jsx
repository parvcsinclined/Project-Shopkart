// src/components/Navbar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount, fetchCart } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchWishlistCount = useCallback(async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await api.get('/wishlist/count');
      if (res.data?.success && typeof res.data.count === 'number') {
        setWishlistCount(res.data.count);
      }
    } catch (err) {
      // silence
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistCount();

    const handleWishlistUpdated = () => fetchWishlistCount();
    window.addEventListener('wishlist-updated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdated);
  }, [fetchWishlistCount]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('shopkart_token');
      if (setUser) setUser(null);
      setWishlistCount(0);
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5ed8 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">

          {/* Logo */}
          <Link to="/home" className="flex flex-col items-start shrink-0 group" id="navbar-logo">
            <span className="text-white font-black text-2xl tracking-tight leading-none group-hover:opacity-90 transition-opacity">
              Shop<span style={{ color: '#FFE11A' }}>Kart</span>
            </span>
            <span className="text-blue-200 text-[10px] font-medium italic leading-none mt-0.5">
              Explore Plus ✦
            </span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl hidden sm:flex">
            <div className="flex w-full rounded overflow-hidden shadow-sm">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-800 outline-none border-none"
                style={{ background: '#fff', color: '#212121' }}
                id="navbar-search-input"
              />
              <button
                type="submit"
                className="px-5 py-2.5 flex items-center justify-center transition-all hover:opacity-90"
                style={{ background: '#FFE11A', color: '#2874f0', minWidth: 48 }}
                id="navbar-search-btn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right Nav */}
          <nav className="flex items-center gap-1 ml-auto">

            {/* Home */}
            <Link
              to="/home"
              className={`px-3 py-2 rounded text-sm font-medium transition-all flex flex-col items-center gap-0.5 ${
                isActive('/home') ? 'text-yellow-300' : 'text-white hover:text-yellow-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[11px]">Home</span>
            </Link>

            {/* Products */}
            <Link
              to="/products"
              className={`px-3 py-2 rounded text-sm font-medium transition-all flex flex-col items-center gap-0.5 ${
                isActive('/products') || location.pathname.startsWith('/products/')
                  ? 'text-yellow-300'
                  : 'text-white hover:text-yellow-200'
              }`}
              id="nav-products-link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              <span className="text-[11px]">Products</span>
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={`px-3 py-2 rounded text-sm font-medium transition-all flex flex-col items-center gap-0.5 relative ${
                isActive('/wishlist') ? 'text-yellow-300' : 'text-white hover:text-yellow-200'
              }`}
              id="nav-wishlist-link"
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                {user && wishlistCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ background: '#ff6161' }}
                    id="wishlist-badge"
                  >
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px]">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className={`px-3 py-2 rounded text-sm font-medium transition-all flex flex-col items-center gap-0.5 relative ${
                isActive('/cart') ? 'text-yellow-300' : 'text-white hover:text-yellow-200'
              }`}
              id="nav-cart-link"
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {user && cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ background: '#ff6161' }}
                    id="cart-badge"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px]">Cart</span>
            </Link>

            {/* Orders */}
            {user && (
              <Link
                to="/orders"
                className={`px-3 py-2 rounded text-sm font-medium transition-all flex flex-col items-center gap-0.5 ${
                  isActive('/orders') || location.pathname.startsWith('/orders/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-yellow-200'
                }`}
                id="nav-orders-link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
                <span className="text-[11px]">Orders</span>
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <div className="flex flex-col items-center px-3 py-2 gap-0.5">
                <div className="relative group cursor-pointer">
                  <div className="flex items-center gap-1 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[11px] text-white block text-center">{(user.fullName || user.email || '').split(' ')[0]}</span>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      id="logout-btn"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-blue-700 bg-white rounded hover:bg-blue-50 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded transition-all"
                  style={{ background: '#FFE11A', color: '#212121' }}
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearchSubmit} className="flex sm:hidden mt-2">
          <div className="flex w-full rounded overflow-hidden shadow-sm">
            <input
              type="text"
              placeholder="Search for products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none"
              style={{ background: '#fff' }}
            />
            <button
              type="submit"
              className="px-4 py-2 flex items-center justify-center"
              style={{ background: '#FFE11A' }}
            >
              <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </header>
  );
}
