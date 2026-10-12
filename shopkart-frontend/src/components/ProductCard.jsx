// src/components/ProductCard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, itemLoaders } = useCart();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });
  const [heartPop, setHeartPop] = useState(false);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const isOutOfStock = product.stock <= 0;
  const cartQty = getItemQuantity(product._id);
  const isAddingToCart = itemLoaders[product._id] === 'adding';

  // Mock discount for Flipkart feel (10-40% off)
  const discountPct = Math.floor((((product.price * 1.3) - product.price) / (product.price * 1.3)) * 100) || 22;
  const mrp = Math.round(product.price * (100 / (100 - discountPct)));

  // Mock rating
  const rating = ((product.name.charCodeAt(0) % 20) + 35) / 10; // 3.5–5.4 range
  const ratingDisplay = Math.min(rating, 5).toFixed(1);
  const ratingCount = ((product.name.charCodeAt(1) || 65) * 73 + 1000).toLocaleString();

  const showFeedback = (text, type = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg({ text: '', type: '' });
    }, 2500);
  };

  // Toggle Wishlist
  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 300);
    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        showFeedback('Removed from Wishlist', 'info');
        if (onWishlistChange) onWishlistChange(product._id, false);
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: product._id, added: false } }));
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        showFeedback('♥ Added to Wishlist!', 'success');
        if (onWishlistChange) onWishlistChange(product._id, true);
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: product._id, added: true } }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { message: 'Please log in to manage your wishlist' } });
        return;
      }
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        showFeedback('Already in Wishlist', 'info');
      } else {
        showFeedback(err.response?.data?.message || 'Unable to save product', 'error');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add to Cart
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || isOutOfStock) return;

    const res = await addToCart(product._id);
    if (res.success) {
      showFeedback('Added to cart! 🛒', 'success');
    } else {
      if (res.status === 401) {
        navigate('/login', { state: { message: 'Please log in to add items to your cart' } });
      } else {
        showFeedback(res.message || 'Could not add to cart', 'error');
      }
    }
  };

  return (
    <div
      className="fk-card group relative flex flex-col overflow-hidden cursor-pointer"
      style={{ borderRadius: 4 }}
      id={`product-card-${product._id}`}
    >
      {/* Product Image */}
      <div className="relative bg-white flex items-center justify-center overflow-hidden" style={{ aspectRatio: '1/1', padding: 16 }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          style={{ maxHeight: 200 }}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-gray-500 font-semibold text-sm border border-gray-400 px-3 py-1 rounded">Out of Stock</span>
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all cursor-pointer border border-gray-200 hover:border-red-300 ${heartPop ? 'heart-pop' : ''}`}
          id={`wishlist-heart-btn-${product._id}`}
        >
          {wishlistLoading ? (
            <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg
              className="w-4 h-4 transition-transform"
              fill={isWishlisted ? '#ff6161' : 'none'}
              stroke={isWishlisted ? '#ff6161' : '#878787'}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          )}
        </button>

        {/* Discount Badge */}
        <span
          className="absolute top-2 left-2 text-white text-[11px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: '#ff6161' }}
        >
          {discountPct}% off
        </span>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Category */}
        <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{product.category}</span>

        {/* Name */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <span className="fk-rating text-xs">
            {ratingDisplay}
            <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </span>
          <span className="text-xs text-gray-500">({ratingCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="fk-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <span className="fk-mrp">₹{mrp.toLocaleString('en-IN')}</span>
          <span className="fk-discount">{discountPct}% off</span>
        </div>

        {/* Stock */}
        <div>
          {isOutOfStock ? (
            <span className="text-xs font-medium" style={{ color: '#ff6161' }}>Out of Stock</span>
          ) : product.stock < 10 ? (
            <span className="text-xs font-medium text-orange-500">Only {product.stock} left!</span>
          ) : (
            <span className="text-xs text-green-600 font-medium">✓ In Stock</span>
          )}
        </div>

        {/* Feedback */}
        {feedbackMsg.text && (
          <div
            className={`text-xs px-3 py-1.5 rounded animate-fade-in font-medium ${
              feedbackMsg.type === 'error'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/products/${product._id}`}
              className="py-2 text-xs font-semibold text-center rounded transition-all border border-blue-200 text-blue-600 hover:bg-blue-50"
              id={`view-details-${product._id}`}
            >
              View Details
            </Link>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              type="button"
              className={`py-2 text-xs font-semibold rounded transition-all border cursor-pointer ${
                isWishlisted
                  ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              id={`wishlist-btn-${product._id}`}
            >
              {isWishlisted ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
            type="button"
            className={`w-full py-2.5 text-xs font-bold rounded transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : isAddingToCart
                ? 'opacity-70 cursor-wait'
                : ''
            }`}
            style={
              !isOutOfStock
                ? { background: '#2874f0', color: 'white', boxShadow: '0 2px 8px rgba(40,116,240,0.3)' }
                : {}
            }
            id={`add-to-cart-btn-${product._id}`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAddingToCart ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : cartQty > 0 ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add Another ({cartQty} in cart)</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
