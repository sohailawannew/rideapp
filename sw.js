// Service Worker - RideApp v3.1
const CACHE_NAME = 'rideapp-v3.1';
const ASSETS = [
  // Core Files
  '/rideapp/',
  '/rideapp/index.html',
  '/rideapp/manifest.json',
  '/rideapp/offline.html',
  
  // Icons
  '/rideapp/icon.png',
  '/rideapp/icon-192x192.png',
  
  // Add your other assets below:
  '/rideapp/css/styles.css',
  '/rideapp/js/app.js'
];

// INSTALL - Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// FETCH - Smart caching strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/rideapp/index.html'))
    );
    return;
  }

  // Cache-first for assets
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
      .catch(() => {
        if (event.request.destination === 'image') {
          return caches.match('/rideapp/icon.png');
        }
        return caches.match('/rideapp/offline.html');
      })
  );
});

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  const payload = event.data?.json() || {
    title: 'New Ride Available',
    body: 'Tap to view details',
    icon: '/rideapp/icon-192x192.png',
    data: { url: '/rideapp/' }
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: '/rideapp/icon-192x192.png',
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: payload.data
    })
  );
});

// NOTIFICATION CLICKS
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view') {
    clients.openWindow(event.notification.data.url);
  }
});
