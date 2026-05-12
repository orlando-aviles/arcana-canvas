// tarot/sw.js

const CACHE_NAME = 'arcana-cache-v5';

const CORE_FILES = [
  './',
  './index.html',
  './splash.png',
  './manifest.json',
  './styles/main.css',
  './js/main.js',
  './js/starfield.js',
  './js/state.js',
  './js/storage.js',
  './js/meanings.js',
  './js/tarot.js',
  './js/tarotDeck.js',
  './js/ui.js',
  './js/particles-bg.js',
  './js/gildedMinima.js',
  './js/runes.js',
  './js/snowfall.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
];

// Install: cache core files and skip waiting so new SW activates immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete all old caches, then claim clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first strategy + image caching
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        const responseClone = response.clone();

        // Cache images as they are fetched
        if (event.request.destination === 'image') {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      });
    })
  );
});
