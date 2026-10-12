// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registeredSuccess = location.state?.registered;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.email || !credentials.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/customers/login', credentials);
      if (response.data?.success || response.status === 200) {
        if (response.data?.token) {
          localStorage.setItem('shopkart_token', response.data.token);
        }
        try {
          const profileRes = await api.get('/customers/me');
          if (setUser) setUser(profileRes.data);
        } catch (meErr) {
          console.log('Profile sync after login deferred', meErr);
        }
        navigate('/home');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid Credentials');
      } else {
        setError(err.response?.data?.message || 'Invalid Credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8" style={{ background: '#f1f3f6' }}>
      <div className="w-full max-w-4xl flex rounded-lg overflow-hidden shadow-lg bg-white">

        {/* Left Side - Flipkart Blue */}
        <div
          className="hidden md:flex md:w-5/12 flex-col justify-between p-10 text-white"
          style={{ background: 'linear-gradient(135deg, #2874f0 0%, #1a5ed8 100%)' }}
        >
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              Shop<span style={{ color: '#FFE11A' }}>Kart</span>
            </h2>
            <p className="text-blue-200 text-sm italic">India's favourite shopping destination</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white mb-2 leading-tight">
              Login & Get access to your wishlist, orders & cart!
            </p>
            <p className="text-blue-200 text-sm">
              Millions of products · Great deals · Fast delivery
            </p>
          </div>
          <div className="text-6xl select-none">🛒</div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-sm text-gray-500 mb-6">
            Get access to your Orders, Wishlist and Recommendations
          </p>

          {registeredSuccess && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 animate-fade-in">
              <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Account created successfully! Please log in below.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2 animate-fade-in" id="login-error">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="fk-input w-full px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="fk-input w-full px-4 py-3 text-sm"
              />
            </div>

            <p className="text-xs text-gray-500">
              By continuing, you agree to ShopKart's Terms of Use and Privacy Policy.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="fk-btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-500">New to ShopKart? </span>
            <Link to="/register" className="text-sm font-semibold" style={{ color: '#2874f0' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}