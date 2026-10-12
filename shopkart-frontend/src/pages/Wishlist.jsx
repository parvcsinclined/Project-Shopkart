// src/pages/Wishlist.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';

export default function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/wishlist');
      if (response.data?.success && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      } else if (Array.isArray(response.data)) {
        setWishlist(response.data);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status === 401) {
        navigate('/login', {
          state: { message: 'Please log in to view your saved wishlist items.' },
        });
        return;
      }
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemoveProduct = async (productId) => {
    try {
      const res = await api.delete(`/wishlist/${productId}`);
      if (res.data?.success || res.status === 200) {
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        setFeedback('Product removed from your wishlist.');
        window.dispatchEvent(
          new CustomEvent('wishlist-updated', {
            detail: { productId, added: false },
          })
        );
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error('Failed to remove product:', err);
      setFeedback(err.response?.data?.message || 'Failed to remove product from wishlist.');
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Wishlist Header Card */}
        <div className="bg-white rounded-md border border-gray-200 p-4 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                My Wishlist {!loading && `(${wishlist.length})`}
              </h1>
              <p className="text-xs text-gray-500">
                Items you have saved to purchase later
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="px-4 py-2 rounded text-xs font-semibold text-[#2874f0] border border-[#2874f0] hover:bg-blue-50 transition-all inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            id="continue-shopping-btn"
          >
            <span>Continue Shopping</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3 rounded bg-blue-50 border border-blue-200 text-[#2874f0] text-xs font-medium flex items-center gap-2 animate-fade-in">
            <span>ℹ️</span> {feedback}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-md border border-gray-200">
            <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mb-3" />
            <p className="text-gray-600 text-sm font-medium">Loading wishlist items...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-md p-8 text-center max-w-md mx-auto shadow-sm space-y-3">
            <p className="text-sm text-red-600 font-semibold">{error}</p>
            <button
              onClick={fetchWishlist}
              className="px-5 py-2 rounded text-xs font-bold text-white bg-[#2874f0] hover:bg-[#1a5ed8] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center text-4xl">
              💔
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-800">Empty Wishlist</h2>
              <p className="text-xs text-gray-500">
                You have no items in your wishlist. Start adding items you love!
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/products"
                className="px-8 py-2.5 rounded font-bold text-sm text-white bg-[#2874f0] hover:bg-[#1a5ed8] shadow transition-all inline-block cursor-pointer"
              >
                Explore Products
              </Link>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
