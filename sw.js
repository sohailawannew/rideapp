// Service Worker for RideApp (Complete Version)
const CACHE_NAME = 'rideapp-v2.0';
const ASSETS = [
  // Core App Files
  '/rideapp/',
  '/rideapp/index.html',
  '/rideapp/manifest.json',
  
  // Static Assets
  '/rideapp/icon-512x512.png',
  
  // CSS (add your actual files)
  '/rideapp/css/styles.css',
  
  // JavaScript (add your actual files)
  '/rideapp/js/app.js',
  
  // Images (add your actual files)
  '/rideapp/images/logo.png',
  
  // Fonts (add your actual files)
  '/rideapp/fonts/roboto.regular.woff2',
  
  // Fallback Page
  '/rideapp/offline.html'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/rideapp/offline.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Network failed - try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            // For navigation requests, return index.html if no cache match
            if (!cachedResponse && event.request.mode === 'navigate') {
              return caches.match('/rideapp/index.html');
            }
            return cachedResponse || caches.match('/rideapp/offline.html');
          });
      })
  );
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(payload.title || 'New Notification', {
      body: payload.body || 'You have new updates',
      icon: '/rideapp/icon-512x512.png'
    })
  );
});
