// Service Worker for RideApp - Optimized v3.0
const CACHE_NAME = 'rideapp-v3.0';
const ASSETS = [
  // Core App Shell
  '/rideapp/',
  '/rideapp/index.html',
  '/rideapp/manifest.json',
  '/rideapp/offline.html',

  // Essential Assets (Update these paths!)
  '/rideapp/icon.png',
  '/rideapp/icon-192x192.png',
  '/rideapp/css/main.min.css',
  '/rideapp/js/main.min.js',
  '/rideapp/images/logo.webp',
  '/rideapp/fonts/roboto-v30-latin-regular.woff2'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(ASSETS).catch(err => {
          console.warn('[SW] Failed to cache some assets:', err);
        });
      })
      .then(() => {
        console.log('[SW] Skip waiting activated');
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// ===== FETCH STRATEGY =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Network First for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then(networkResponse => networkResponse)
        .catch(() => caches.match('/rideapp/offline.html'))
    );
    return;
  }

  // Cache First with Network Fallback for static assets
  if (ASSETS.some(asset => request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => cachedResponse || fetch(request))
    );
    return;
  }

  // Stale-While-Revalidate for other requests
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            // Update cache
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, networkResponse.clone()));
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
      .catch(() => {
        // Ultimate fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/rideapp/index.html');
        }
        return caches.match('/rideapp/offline.html');
      })
  );
});

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-rides') {
    event.waitUntil(handleBackgroundSync());
  }
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'New Update',
    body: 'There are new rides available!',
    icon: '/rideapp/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: '/rideapp/icon-192x192.png',
      vibrate: [200, 100, 200]
    })
  );
});

// Helper Functions
async function handleBackgroundSync() {
  // Implement your background sync logic here
  console.log('[SW] Background sync processing');
}
