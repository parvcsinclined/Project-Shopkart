import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/customers': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/wishlist': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/cart': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/orders': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
