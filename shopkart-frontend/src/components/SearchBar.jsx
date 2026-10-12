// src/components/SearchBar.jsx
import React from 'react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const SORT_OPTIONS = [
  { label: 'Popularity / Newest', value: '' },
  { label: 'Price -- Low to High', value: 'price_asc' },
  { label: 'Price -- High to Low', value: 'price_desc' },
];

export default function SearchBar({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
}) {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center gap-4 transition-all">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <svg className="w-5 h-5 text-[#2874f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for products, brands and more..."
          id="product-search-input"
          className="w-full pl-10 pr-10 py-2.5 rounded-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#2874f0] focus:bg-white text-sm transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex items-center gap-3">
        {/* Category Dropdown */}
        <div className="relative min-w-[160px] flex-1 md:flex-initial">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            id="category-filter-select"
            className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-sm bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium focus:outline-none focus:border-[#2874f0] focus:bg-white transition-all cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[180px] flex-1 md:flex-initial">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            id="sort-filter-select"
            className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-sm bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium focus:outline-none focus:border-[#2874f0] focus:bg-white transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
