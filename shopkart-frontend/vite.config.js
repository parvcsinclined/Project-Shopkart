import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const backendTarget = process.env.VITE_BACKEND_URL || 'http://localhost:5001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/customers': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/products': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/wishlist': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/cart': {
        target: backendTarget,
        changeOrigin: true,
      },
      '/orders': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
})
