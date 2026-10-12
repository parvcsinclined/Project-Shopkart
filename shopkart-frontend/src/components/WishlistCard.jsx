// src/components/WishlistCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const originalPrice = Math.round(Number(product.price) * 1.25);
  const discountPercent = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div
      className="group relative bg-white border border-gray-200 hover:shadow-md rounded-md overflow-hidden transition-all duration-200 flex flex-col p-4"
      id={`wishlist-card-${product._id}`}
    >
      {/* Remove Bin Button on Top Right */}
      <button
        onClick={handleRemove}
        disabled={removing}
        type="button"
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer z-10 p-1"
        id={`wishlist-remove-${product._id}`}
        title="Remove from Wishlist"
      >
        {removing ? (
          <span className="text-xs">...</span>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        )}
      </button>

      {/* Product Image Section */}
      <Link
        to={`/products/${product._id}`}
        className="relative aspect-square w-full overflow-hidden bg-white flex items-center justify-center p-2 mb-3"
      >
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Category Pill */}
        <span className="absolute top-1 left-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-100 text-gray-600">
          {product.category}
        </span>
      </Link>

      {/* Product Info Section */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <Link
            to={`/products/${product._id}`}
            className="block text-sm font-semibold text-gray-800 hover:text-[#2874f0] transition-colors line-clamp-1"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.2 rounded">
              4.2 ★
            </span>
            <span className="text-[11px] font-bold text-[#2874f0]">
              Assured ✓
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-base font-bold text-gray-900">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-bold text-green-700">
              {discountPercent}% off
            </span>
          </div>

          {/* Stock */}
          <div className="mt-1">
            {isOutOfStock ? (
              <span className="text-xs font-semibold text-red-600">Out of Stock</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">In Stock</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <Link
            to={`/products/${product._id}`}
            className="w-full py-2 rounded text-xs font-bold text-center text-white bg-[#2874f0] hover:bg-[#1a5ed8] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            id={`wishlist-view-${product._id}`}
          >
            <span>View Product</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
