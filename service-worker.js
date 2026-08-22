// Studio Space — Service Worker
// Minimal service worker for PWA installability.
// Uses network-first so the app always loads the latest version when online,
// falling back to cache only when offline.

const CACHE_NAME = 'studio-space-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './Logos/IMG_20241026_104514_243.webp'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache when offline
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip Firebase, Google, and Apps Script requests — always go to network
  const url = event.request.url;
  if (url.includes('firebase') || url.includes('google') ||
      url.includes('gstatic') || url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update cache with fresh copy
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
