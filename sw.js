// Minimal Service Worker - Forces instant registration
const CACHE_NAME = 'rideapp-v1';

// INSTALL - Claim control immediately
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting());  // <-- No caching delays
});

// ACTIVATE - Take control instantly
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// FETCH - Basic offline fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match('/rideapp/index.html')));
});
