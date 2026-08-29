import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        // Temporary compatibility ceiling for the legacy embedded lore bundle.
        // The Source/Document storage migration will remove the data payload from this JS chunk.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Diablo Lore Portal',
        short_name: 'Diablo Wiki',
        theme_color: '#0a0809',
        background_color: '#0a0809',
        display: 'standalone'
      }
    })
  ],
  build: {
    target: 'esnext'
  }
});
