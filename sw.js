// Minimal Service Worker - Forces immediate registration
const CACHE_NAME = 'rideapp-simple';

// INSTALL - Just claim control
self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting()); // Activate immediately
});

// ACTIVATE - Take over all tabs
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); 
});

// FETCH - Basic offline fallback
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match('/index.html'))
  );
});
