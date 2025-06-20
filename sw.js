// Ultra-simple service worker
const CACHE_NAME = 'rideapp-emergency-fix';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match('/rideapp/index.html'))
  );
});
