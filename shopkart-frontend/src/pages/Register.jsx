// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/customers/register', formData);
      if (response.data?.success || response.status === 201) {
        navigate('/login', { state: { registered: true } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8" style={{ background: '#f1f3f6' }}>
      <div className="w-full max-w-4xl flex rounded-md overflow-hidden shadow-lg bg-white border border-gray-200">

        {/* Left Side - Flipkart Blue Branding Panel */}
        <div
          className="hidden md:flex md:w-5/12 flex-col justify-between p-10 text-white"
          style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5ed8 100%)' }}
        >
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              Shop<span style={{ color: '#FFE11A' }}>Kart</span>
            </h2>
            <p className="text-blue-100 text-sm italic">India's favourite shopping destination</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white mb-2 leading-tight">
              Looks like you're new here!
            </p>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sign up with your details to discover millions of products and exclusive member benefits.
            </p>
          </div>
          <div className="text-6xl select-none">🛍️</div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
          <p className="text-xs text-gray-500 mb-6">
            Sign up to track orders, manage wishlist and save addresses
          </p>

          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 animate-fade-in">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your name"
                className={`w-full px-3.5 py-2.5 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                  fieldErrors.fullName ? 'border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-[#2874f0]'
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-3.5 py-2.5 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                  fieldErrors.email ? 'border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-[#2874f0]'
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password (min 6 characters)"
                className={`w-full px-3.5 py-2.5 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                  fieldErrors.password ? 'border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-[#2874f0]'
                }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-3.5 py-2.5 rounded border text-sm text-gray-800 focus:outline-none transition-colors ${
                  fieldErrors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-300 focus:border-[#2874f0]'
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-[11px] text-red-500">{fieldErrors.phone}</p>
              )}
            </div>

            <p className="text-[11px] text-gray-500 leading-normal pt-1">
              By continuing, you agree to ShopKart's <span className="text-[#2874f0] cursor-pointer">Terms of Use</span> and <span className="text-[#2874f0] cursor-pointer">Privacy Policy</span>.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded font-bold text-sm text-white bg-[#fb641b] hover:bg-[#e85b17] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              id="register-submit-btn"
            >
              {loading ? <span>Creating Account...</span> : <span>CONTINUE</span>}
            </button>
          </form>

          {/* Existing user button */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/login"
              className="w-full block py-2.5 px-4 rounded font-bold text-sm text-[#2874f0] bg-white border border-gray-300 hover:shadow-sm transition-all text-center"
            >
              Existing User? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}