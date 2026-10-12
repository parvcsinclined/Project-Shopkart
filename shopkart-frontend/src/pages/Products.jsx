// src/pages/Products.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const [wishlistIds, setWishlistIds] = useState(new Set());

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.get('/wishlist');
      if (res.data?.wishlist) {
        const ids = new Set(res.data.wishlist.map((item) => (typeof item === 'object' ? item._id : item)));
        setWishlistIds(ids);
      }
    } catch (err) {
      // Unauthenticated or network issue, leave empty set
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleWishlistChange = (productId, isAdded) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isAdded) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (sort) params.sort = sort;

      const response = await api.get('/products', { params });
      if (response.data?.success) {
        setProducts(response.data.products || []);
      } else {
        setProducts(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Something went wrong while loading products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f1f3f6] text-gray-800 px-3 md:px-6 py-4 md:py-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Flipkart-Style Header Banner */}
        <div className="bg-gradient-to-r from-[#2874f0] to-[#1a5ed8] text-white rounded-md p-5 md:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[#FFE11A] text-xs font-bold uppercase tracking-wider mb-1.5">
              ⚡ Flipkart Assured & Deals
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              All Products Catalog
            </h1>
            <p className="text-blue-100 text-xs md:text-sm mt-0.5">
              Explore best offers across Electronics, Fashion, Home & Books with extra bank discounts.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-white/10 px-4 py-2 rounded border border-white/20 text-xs">
            <span className="text-lg">🚚</span>
            <span>Fast Delivery Available</span>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
        />

        {/* Results Meta Info */}
        {!loading && !error && (
          <div className="flex items-center justify-between px-2 text-xs text-gray-500">
            <span>
              Showing <strong className="text-gray-800">{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
              {category && <span> in <strong className="text-[#2874f0]">{category}</strong></span>}
              {search && <span> matching "<strong className="text-[#2874f0]">{search}</strong>"</span>}
            </span>
            {(search || category || sort) && (
              <button
                onClick={handleResetFilters}
                className="text-[#2874f0] hover:underline font-medium cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* --- UI STATE 1: LOADING STATE --- */}
        {loading && (
          <div className="space-y-6" id="products-loading-state">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#2874f0]/30 border-t-[#2874f0] rounded-full animate-spin mb-3" />
              <p className="text-gray-700 font-medium text-sm">Loading products...</p>
            </div>

            {/* Skeleton Grid Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white border border-gray-200 rounded-md p-4 animate-pulse space-y-3 shadow-sm">
                  <div className="aspect-4/3 bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded mt-3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- UI STATE 2: ERROR STATE --- */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-md p-8 md:p-12 text-center max-w-lg mx-auto shadow-sm space-y-4" id="products-error-state">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Something went wrong while loading products.</h2>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 rounded font-semibold text-sm text-white bg-[#2874f0] hover:bg-[#1a5ed8] cursor-pointer shadow transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* --- UI STATE 3: EMPTY STATE --- */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-10 md:p-14 text-center max-w-lg mx-auto shadow-sm space-y-4" id="products-empty-state">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-3xl">
              📦
            </div>
            <h2 className="text-xl font-bold text-gray-800">No products found</h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We couldn't find any products matching your search criteria. Try modifying your search keywords or switching categories.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 rounded text-sm font-semibold text-white bg-[#2874f0] hover:bg-[#1a5ed8] shadow transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* --- DYNAMIC PRODUCT GRID --- */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
