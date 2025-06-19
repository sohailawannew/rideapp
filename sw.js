const CACHE_NAME = 'rideapp-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/rideapp/',
      '/rideapp/index.html',
      '/rideapp/icon-512x512.png'
    ]))
  );
});
