// src/components/CartItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartItem({ item }) {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, itemLoaders } = useCart();

  if (!product) return null;

  const isUpdating = itemLoaders[product._id] === 'updating';
  const isRemoving = itemLoaders[product._id] === 'removing';
  const isBusy = isUpdating || isRemoving;

  const itemSubtotal = (Number(product.price) || 0) * quantity;
  const isMaxStock = quantity >= product.stock;
  const originalPrice = Math.round(Number(product.price) * 1.25);
  const discountPercent = Math.round(((originalPrice - Number(product.price)) / originalPrice) * 100);

  const handleIncrement = () => {
    if (isBusy || isMaxStock) return;
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrement = () => {
    if (isBusy || quantity <= 1) return;
    updateQuantity(product._id, quantity - 1);
  };

  const handleRemove = () => {
    if (isBusy) return;
    removeFromCart(product._id);
  };

  return (
    <div
      className={`p-4 md:p-6 bg-white border-b border-gray-200 transition-all ${
        isBusy ? 'opacity-60' : ''
      }`}
      id={`cart-item-${product._id}`}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        {/* Left: Thumbnail & Details */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Link
            to={`/products/${product._id}`}
            className="w-24 h-24 md:w-28 md:h-28 rounded bg-white border border-gray-100 shrink-0 p-2 flex items-center justify-center hover:opacity-90"
          >
            <img
              src={product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </Link>

          <div className="space-y-1.5 flex-1 min-w-0">
            <Link
              to={`/products/${product._id}`}
              className="block font-semibold text-gray-800 hover:text-[#2874f0] transition-colors truncate text-sm md:text-base"
              title={product.name}
            >
              {product.name}
            </Link>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="capitalize">{product.category}</span>
              <span>·</span>
              <span className="text-gray-400">Seller: SuperComNet</span>
              <span className="bg-[#2874f0] text-white text-[10px] font-bold px-1.5 py-0.2 rounded italic">
                Assured ✓
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-sm line-through text-gray-400">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-base md:text-lg font-bold text-gray-900">
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-green-700">
                {discountPercent}% Off
              </span>
              <span className="text-[11px] text-green-600 font-semibold ml-1">
                1 offer applied
              </span>
            </div>

            {isMaxStock && (
              <span className="text-xs font-semibold text-amber-600 block">
                Max stock limit reached ({product.stock} units)
              </span>
            )}
          </div>
        </div>

        {/* Right: Delivery estimate */}
        <div className="text-left sm:text-right text-xs shrink-0 sm:pt-1">
          <p className="text-gray-700">
            Delivery by <span className="font-semibold text-gray-900">Tomorrow</span>
          </p>
          <p className="text-gray-400 mt-0.5">
            <span className="text-green-600 font-semibold">Free</span> <span className="line-through">₹40</span>
          </p>
        </div>
      </div>

      {/* Bottom Controls: Quantity Stepper + Remove CTA */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-100 text-xs">
        {/* Quantity Stepper (Flipkart style rounded circle buttons) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecrement}
            disabled={quantity <= 1 || isBusy}
            type="button"
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            id={`cart-qty-dec-${product._id}`}
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span
            className="w-9 h-7 border border-gray-300 rounded flex items-center justify-center font-bold text-xs text-gray-800"
            id={`cart-qty-val-${product._id}`}
          >
            {isUpdating ? '...' : quantity}
          </span>

          <button
            onClick={handleIncrement}
            disabled={isMaxStock || isBusy}
            type="button"
            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            id={`cart-qty-inc-${product._id}`}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Save for later mock & Remove */}
        <button
          type="button"
          className="font-bold text-gray-700 hover:text-[#2874f0] uppercase tracking-wider cursor-pointer transition-colors"
        >
          Save for later
        </button>

        <button
          onClick={handleRemove}
          disabled={isBusy}
          type="button"
          className="font-bold text-gray-700 hover:text-red-600 uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
          id={`cart-remove-${product._id}`}
        >
          {isRemoving ? (
            <span>Removing...</span>
          ) : (
            <span>Remove</span>
          )}
        </button>
      </div>
    </div>
  );
}
