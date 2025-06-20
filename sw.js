// Force app-like experience
const CACHE_NAME = 'rideapp-ultra';
const APP_SHELL = [
  '/rideapp/',
  '/rideapp/index.html',
  '/rideapp/icon.png',
  '/rideapp/manifest.json'
];

// Install - Cache core app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Activate - Take control
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Fetch - App-like offline support
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
      .catch(() => caches.match('/rideapp/index.html'))
  );
});
