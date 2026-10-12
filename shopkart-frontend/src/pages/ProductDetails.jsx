// src/pages/ProductDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const { addToCart, getItemQuantity, itemLoaders } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistFeedback, setWishlistFeedback] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProductAndWishlist = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/products/${id}`);
        if (isMounted) {
          if (response.data?.success && response.data.product) {
            setProduct(response.data.product);
          } else {
            setProduct(response.data);
          }
        }

        // Check if item is in wishlist
        try {
          const wRes = await api.get('/wishlist');
          if (isMounted && wRes.data?.wishlist) {
            const hasIt = wRes.data.wishlist.some(
              (item) => (typeof item === 'object' ? item._id : item) === id
            );
            setIsWishlisted(hasIt);
          }
        } catch (wErr) {
          // not logged in or wishlist error
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load product details:', err);
          if (err.response?.status === 404) {
            setError('Product not found. The product may have been removed or does not exist.');
          } else if (err.response?.status === 400) {
            setError('Invalid product identifier.');
          } else {
            setError('Something went wrong while fetching product details.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProductAndWishlist();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    setWishlistFeedback('');

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
        setWishlistFeedback('Removed from Wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: id, added: false } }));
      } else {
        await api.post(`/wishlist/${id}`);
        setIsWishlisted(true);
        setWishlistFeedback('Added to Wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { productId: id, added: true } }));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', { state: { message: 'Please log in to manage your wishlist' } });
        return;
      }
      setWishlistFeedback(err.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setWishlistFeedback(''), 3000);
    }
  };

  const handleAddToCart = async () => {
    if (itemLoaders[id] === 'adding') return;
    const res = await addToCart(id);
    if (res.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    } else if (res.status === 401) {
      navigate('/login', { state: { message: 'Please log in to add items to cart' } });
    } else {
      setAddedNotice(false);
      setWishlistFeedback(res.message || 'Could not add to cart');
      setTimeout(() => setWishlistFeedback(''), 4000);
    }
  };

  const handleBuyNow = async () => {
    const res = await addToCart(id);
    if (res.success) {
      navigate('/cart');
    } else if (res.status === 401) {
      navigate('/login', { state: { message: 'Please log in to proceed to checkout' } });
    } else {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#f1f3f6] text-gray-800 p-4">
        <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mb-3" />
        <p className="text-gray-600 font-medium text-sm">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[#f1f3f6] text-gray-800">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-md p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Unable to Display Product</h2>
          <p className="text-xs text-gray-500">{error || 'Product not found.'}</p>
          <Link
            to="/products"
            className="inline-block px-6 py-2 rounded font-semibold text-sm text-white bg-[#2874f0] hover:bg-[#1a5ed8] transition-all cursor-pointer"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const originalPrice = Math.round(Number(product.price) * 1.25);
  const discountPercent = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/home" className="hover:text-[#2874f0] transition-colors">Home</Link>
          <span>›</span>
          <Link to="/products" className="hover:text-[#2874f0] transition-colors">Products</Link>
          <span>›</span>
          <span className="text-gray-400 font-normal">{product.category}</span>
          <span>›</span>
          <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Details Card (Flipkart 2-Column Layout) */}
        <div className="bg-white rounded-md border border-gray-200 p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image + CTAs */}
          <div className="md:col-span-5 space-y-5 sticky top-20">
            <div className="relative aspect-square rounded-md overflow-hidden bg-white border border-gray-100 flex items-center justify-center p-4 group">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />

              {/* Wishlist Heart on top right */}
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center transition-all cursor-pointer ${
                  isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                id="details-wishlist-btn"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              {/* Flipkart Assured Badge */}
              <div className="absolute top-3 left-3 bg-[#2874f0] text-white text-[11px] font-bold px-2 py-0.5 rounded italic">
                Assured ✓
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || itemLoaders[id] === 'adding'}
                className={`py-3.5 px-4 rounded font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow ${
                  isOutOfStock
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-[#ff9f00] hover:bg-[#f39700]'
                }`}
                id="add-to-cart-btn"
              >
                {itemLoaders[id] === 'adding' ? (
                  <span className="text-xs">Adding...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>
                      {getItemQuantity(id) > 0 ? `GO TO CART (${getItemQuantity(id)})` : 'ADD TO CART'}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-3.5 px-4 rounded font-bold text-sm text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow ${
                  isOutOfStock
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-[#fb641b] hover:bg-[#e85b17]'
                }`}
                id="buy-now-btn"
              >
                <span>⚡ BUY NOW</span>
              </button>
            </div>

            {addedNotice && (
              <div className="p-2.5 rounded bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <span>✓</span> Item added to cart successfully!
              </div>
            )}

            {wishlistFeedback && (
              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[#2874f0] text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <span>ℹ</span> {wishlistFeedback}
              </div>
            )}
          </div>

          {/* Right Column: Title, Ratings, Price, Offers, Specs */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
                {product.category}
              </p>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug">
                {product.name}
              </h1>

              {/* Ratings & Reviews */}
              <div className="flex items-center gap-3 mt-2.5">
                <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded">
                  4.3 ★
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  2,841 Ratings & 342 Reviews
                </span>
                <span className="text-xs font-bold text-[#2874f0]">
                  Flipkart Assured
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="space-y-1 pb-4 border-b border-gray-100">
              <span className="text-xs text-green-700 font-bold">Special Price</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold text-green-700">
                  {discountPercent}% off
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Inclusive of all taxes</p>
            </div>

            {/* Available Offers */}
            <div className="space-y-2.5 pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800">Available Offers</h3>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">🏷 Bank Offer:</span>
                  <span>5% Cashback on Flipkart Axis Bank Card</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">🏷 Special Price:</span>
                  <span>Get extra ₹500 off (price inclusive of discount)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold shrink-0">🏷 Partner Offer:</span>
                  <span>Make a purchase and get a surprise cashback coupon</span>
                </div>
              </div>
            </div>

            {/* Delivery & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100 text-xs">
              <div>
                <span className="text-gray-500 font-semibold block mb-1">Delivery</span>
                <p className="font-semibold text-gray-800">Delivery by Tomorrow | <span className="text-green-600 font-bold">Free</span></p>
                <p className="text-gray-400 mt-0.5">Cash on Delivery also available</p>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block mb-1">Stock Status</span>
                {isOutOfStock ? (
                  <span className="text-red-600 font-bold">Currently Out of Stock</span>
                ) : (
                  <span className="text-green-700 font-semibold">
                    In Stock ({product.stock} units available)
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500">Select Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-xs text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Product Description</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Back link */}
            <div className="pt-2">
              <Link
                to="/products"
                className="text-xs font-semibold text-[#2874f0] hover:underline inline-flex items-center gap-1"
              >
                ← Back to All Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
