// rideapp-sw.js - Minimal Production-Ready Service Worker
const APP_VERSION = 'v1.0.3';
const CACHE_NAME = `rideapp-cache-${APP_VERSION}`;
const OFFLINE_URL = '/rideapp/offline.html'; // Optional fallback

// ===== INSTALL ===== //
self.addEventListener('install', (event) => {
  console.log(`[SW ${APP_VERSION}] Installing...`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache only critical files
        return cache.addAll([
          '/rideapp/',
          '/rideapp/index.html',
          '/rideapp/icon.png',
          '/rideapp/css/main.css',
          '/rideapp/js/app.js'
        ]).catch(err => {
          console.warn('[SW] Cache addAll error:', err);
        });
      })
      .then(() => {
        console.log('[SW] Skip waiting activated');
        return self.skipWaiting(); // Force activate
      })
  );
});

// ===== ACTIVATE ===== //
self.addEventListener('activate', (event) => {
  console.log(`[SW ${APP_VERSION}] Activated`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Control all tabs
  );
});

// ===== FETCH ===== //
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request)
          .then(cachedResponse => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL) || caches.match('/rideapp/index.html');
            }
            return cachedResponse;
          });
      })
  );
});

// ===== PUSH NOTIFICATIONS ===== //
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'New Ride Available',
    body: 'Tap to view details',
    icon: '/rideapp/icon.png'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      vibrate: [200, 100, 200]
    })
  );
});
