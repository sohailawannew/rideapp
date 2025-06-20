// Nuclear Option Service Worker - Guaranteed Registration
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force immediate activation
});

self.addEventListener('activate', (e) => {
  self.clients.claim(); // Take control immediately
});

self.addEventListener('fetch', (e) => {
  // Bare minimum fetch handler
  e.respondWith(fetch(e.request));
});
