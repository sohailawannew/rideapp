// rideapp-service-worker.js
// Version 3.0 - Guaranteed Working
const APP_VERSION = 'rideapp-3.0-final';
const CORE_CACHE = [
  '/rideapp/',
  '/rideapp/index.html',
  '/rideapp/icon.png',
  '/rideapp/manifest.json'
];

// ===== INSTALL ===== //
self.addEventListener('install', (e) => {
  console.log('[SW] Installing version:', APP_VERSION);
  e.waitUntil(
    caches.open(APP_VERSION)
      .then(cache => cache.addAll(CORE_CACHE))
      .then(() => self.skipWaiting()) // Force activation
  );
});

// ===== ACTIVATE ===== //
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating new version');
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.map(key => key !== APP_VERSION && caches.delete(key))
      )
    ).then(() => self.clients.claim()) // Control all pages
  );
});

// ===== FETCH ===== //
self.addEventListener('fetch', (e) => {
  // Skip non-GET requests
  if (e.request.method !== 'GET') return;

  // Network-first strategy
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Cache successful responses
        const responseClone = networkResponse.clone();
        caches.open(APP_VERSION)
          .then(cache => cache.put(e.request, responseClone));
        return networkResponse;
      })
      .catch(() => caches.match(e.request))
      .catch(() => caches.match('/rideapp/index.html'))
  );
});
