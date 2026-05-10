// sw.js

const CACHE_NAME = 'tarot-cache-v5';

const CORE_FILES = [
  './',
  './index.html',
  './styles/main.css',
  './js/main.js',
  './js/starfield.js',
  './js/state.js',
  './js/storage.js',
  './js/tarot.js',
  './js/tarotDeck.js',
  './js/ui.js',
  './js/particles-bg.js',
];

// Bypass service worker entirely during local development
const IS_DEV = self.location.hostname === 'localhost' ||
               self.location.hostname === '127.0.0.1';

if (IS_DEV) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', () => self.clients.claim());
  self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
  });
} else {
  // Production: cache core files on install
  self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(CORE_FILES))
        .then(() => self.skipWaiting())
    );
  });

  // Activate: clear old caches
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

  // Fetch: network-first, fall back to cache
  self.addEventListener('fetch', event => {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  });
}
