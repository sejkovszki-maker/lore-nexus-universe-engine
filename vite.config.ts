import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const isEmailPackage = process.env.EMAIL_PACKAGE === '1';

export default defineConfig({
  base: isEmailPackage ? './' : (process.env.VITE_BASE_PATH || '/'),
  plugins: isEmailPackage ? [] : [
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        // Temporary compatibility ceiling for the legacy embedded lore bundle.
        // The Source/Document storage migration will remove the data payload from this JS chunk.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,svg,wasm}'],
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'lore-nexus-images-v1',
            expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 90 },
            cacheableResponse: { statuses: [0, 200] },
          },
        }, {
          urlPattern: ({ url }) => url.pathname.endsWith('/reader-library/articles.json'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'lore-nexus-reader-library-v1',
            expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        }]
      },
      manifest: {
        id: './',
        name: 'Lore Nexus – Diablo Universe Engine',
        short_name: 'Lore Nexus',
        description: 'Magyar nyelvű, helyben futó Diablo-enciklopédia és történetolvasó.',
        lang: 'hu',
        start_url: './#/wiki',
        scope: './',
        theme_color: '#0a0809',
        background_color: '#0a0809',
        display: 'standalone',
        icons: [
          { src: 'assets/lore-nexus-icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'assets/lore-nexus-icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      }
    })
  ],
  build: {
    target: 'esnext'
  }
});
