// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import OrderSuccess from './pages/OrderSuccess';
import { CartProvider } from './context/CartContext';
import api from './services/api';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const response = await api.get('/customers/me');
        setUser(response.data);
      } catch (err) {
        setUser(null);
      }
    };
    checkInitialAuth();
  }, []);

  return (
    <BrowserRouter>
      {/* CartProvider wraps the whole app so cart state is globally accessible */}
      <CartProvider user={user}>
        <div className="min-h-screen flex flex-col font-sans" style={{ background: '#f1f3f6', color: '#212121' }}>
          <Navbar user={user} setUser={setUser} />
          <main className="flex-1">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/home" element={<Home user={user} setUser={setUser} />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetails />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          {/* Flipkart-style Footer */}
          <footer style={{ background: '#172337', color: '#fff' }} className="mt-8 py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                <div>
                  <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-3">About</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="hover:text-white cursor-pointer transition-colors">About ShopKart</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Careers</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Press</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Corporate Information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-3">Help</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="hover:text-white cursor-pointer transition-colors">Payments</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Shipping</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Return Policy</li>
                    <li className="hover:text-white cursor-pointer transition-colors">FAQ</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-3">Policy</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="hover:text-white cursor-pointer transition-colors">Return Policy</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Terms Of Use</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Sitemap</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-3">Social</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="hover:text-white cursor-pointer transition-colors">Facebook</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Twitter</li>
                    <li className="hover:text-white cursor-pointer transition-colors">YouTube</li>
                    <li className="hover:text-white cursor-pointer transition-colors">Instagram</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400 text-xs">
                © {new Date().getFullYear()} ShopKart.com — All rights reserved
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
