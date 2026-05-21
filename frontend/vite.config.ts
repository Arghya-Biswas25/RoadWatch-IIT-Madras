import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'RoadWatch — Road Transparency Platform',
        short_name: 'RoadWatch',
        description: 'AI-powered road transparency and accountability platform',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        start_url: '/',
        scope: '/',
        categories: ['utilities', 'government'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/roads/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'roads-cache', expiration: { maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/analytics/,
            handler: 'NetworkFirst',
            options: { cacheName: 'analytics-cache', expiration: { maxAgeSeconds: 3600 } },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'osm-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 604800 } },
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      // All /api routes except /api/chatbot — Vite proxy handles these fine
      '/api/roads': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/complaints': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/analytics': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/admin': { target: 'http://localhost:3001', changeOrigin: true },
      '/api/health': { target: 'http://localhost:3001', changeOrigin: true },
      // /api/chatbot is called DIRECTLY to backend (bypasses Vite proxy) to prevent
      // Vite's http-proxy from buffering the Server-Sent Events stream.
    },
  },
});
