// RideApp Service Worker - Minimal v3.2
const CACHE_NAME = 'rideapp-v3.2';
const ASSETS = [
  '/rideapp/',
  '/rideapp/index.html',
  '/rideapp/manifest.json',
  '/rideapp/icon.png',
  '/rideapp/icon-192x192.png'
  // Add other files here
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
      .catch(() => caches.match('/rideapp/index.html'))
  );
});
