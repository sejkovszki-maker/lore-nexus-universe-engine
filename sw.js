'use strict';

const CACHE_VERSION = 'diablo-wiki-v5';
const CACHE_STATIC = `${CACHE_VERSION}-static`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './extra.js',
  './format.worker.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      return Promise.allSettled(
        STATIC_ASSETS.map(url => cache.add(url).catch(() => null))
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('diablo-wiki-') && key !== CACHE_STATIC)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!event.request.url.startsWith('http')) return;

  const ext = url.pathname.toLowerCase();
  const isStaticFile = ext.endsWith('.css') || ext.endsWith('.js') || ext.endsWith('.html') || 
                       ext.endsWith('.json') || ext.endsWith('.png') || ext.endsWith('.svg') || 
                       ext.endsWith('.ico') || ext.endsWith('.woff') || ext.endsWith('.woff2') || ext.endsWith('.ttf');

  const isStaticAsset = STATIC_ASSETS.some(asset => {
    try {
      return event.request.url === new URL(asset, self.location.origin).href ||
             event.request.url.includes(asset);
    } catch { return false; }
  }) || isStaticFile;

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;
          const responseClone = response.clone();
          caches.open(CACHE_STATIC).then(cache => cache.put(event.request, responseClone));
          return response;
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_STATIC).then(c => c.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_STATIC).then(() => {
      event.source?.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-articles') {
    event.waitUntil(
      Promise.resolve().then(() => console.log('[Service Worker] Background Sync lefutott.'))
    );
  }
});
