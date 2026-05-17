const CACHE_NAME  = 'arcana-cache-v73';
const IMAGE_CACHE = 'arcana-images-v6'; // separate — survives core cache bumps

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
  './js/tooltips.js',
  './js/cardData.js',
  './js/cardLore.js',
  './js/cardIndex.js',
  './Runes/algiz.png',
  './Runes/ansuz.png',
  './Runes/berkano.png',
  './Runes/dagaz.png',
  './Runes/ehwaz.png',
  './Runes/eihwaz.png',
  './Runes/fehu.png',
  './Runes/gebo.png',
  './Runes/hagalaz.png',
  './Runes/ingwaz.png',
  './Runes/isaz.png',
  './Runes/jera.png',
  './Runes/kenaz.png',
  './Runes/laguz.png',
  './Runes/mannaz.png',
  './Runes/naudhiz.png',
  './Runes/othalan.png',
  './Runes/perthro.png',
  './Runes/raidho.png',
  './Runes/sowilo.png',
  './Runes/thurisaz.png',
  './Runes/tiwaz.png',
  './Runes/uruz.png',
  './Runes/wunjo.png',
  './js/journal.js',
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

// Install: cache core files, then pre-cache the default deck (LuminousArc)
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)),
      // Pre-cache LuminousArc deck so it works offline on first launch
      caches.open(IMAGE_CACHE).then(async cache => {
        const keys = await cache.keys();
        // Only pre-cache if image cache is empty (first install)
        if (keys.length > 0) return;
        const deck = [
          'AceOfCups','AceOfPentacles','AceOfSwords','AceOfWands',
          'Death','EightOfCups','EightOfPentacles','EightOfSwords','EightOfWands',
          'FiveOfCups','FiveOfPentacles','FiveOfSwords','FiveOfWands',
          'FourOfCups','FourOfPentacles','FourOfSwords','FourOfWands',
          'Judgement','Justice',
          'KingOfCups','KingOfPentacles','KingOfSwords','KingOfWands',
          'KnightOfCups','KnightOfPentacles','KnightOfSwords','KnightOfWands',
          'NineOfCups','NineOfPentacles','NineOfSwords','NineOfWands',
          'PageOfCups','PageOfPentacles','PageOfSwords','PageOfWands',
          'QueenOfCups','QueenOfPentacles','QueenOfSwords','QueenOfWands',
          'SevenOfCups','SevenOfPentacles','SevenOfSwords','SevenOfWands',
          'SixOfCups','SixOfPentacles','SixOfSwords','SixOfWands',
          'Strength','Temperance','TheFool','TheChariot','TheDevil',
          'TheEmperor','TheEmpress','TheHangedMan','TheHermit',
          'TheHierophant','TheHighPriestess','TheLovers','TheMagician',
          'TheMoon','TheStar','TheSun','TheTower','TheWheel','TheWorld',
          'ThreeOfCups','ThreeOfPentacles','ThreeOfSwords','ThreeOfWands',
          'TwoOfCups','TwoOfPentacles','TwoOfSwords','TwoOfWands',
        ];
        // Fetch in small batches to avoid overwhelming the network
        const batchSize = 8;
        for (let i = 0; i < deck.length; i += batchSize) {
          const batch = deck.slice(i, i + batchSize).map(name =>
            fetch(`./LuminousArc/${name}.png`)
              .then(r => r.ok ? cache.put(`./LuminousArc/${name}.png`, r) : null)
              .catch(() => null) // silently skip failures
          );
          await Promise.all(batch);
        }
      }),
    ]).then(() => self.skipWaiting())
  );
});

// Activate: delete old CORE caches only, keep IMAGE_CACHE across versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== IMAGE_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: images cache-first, CSS/JS network-first, HTML network-first
self.addEventListener('fetch', event => {
  const url = event.request.url;
  const isImage = event.request.destination === 'image' ||
                  /\.(png|jpg|webp)$/i.test(url);

  event.respondWith(
    isImage
      ? caches.open(IMAGE_CACHE).then(imgCache =>
          imgCache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
              if (response.ok) imgCache.put(event.request, response.clone());
              return response;
            }).catch(() => caches.match(event.request)); // fallback to any cache
          })
        )
      : (event.request.url.includes('.css') || event.request.url.includes('.js')
          // CSS and JS: network-first so updates always apply
          ? fetch(event.request)
              .then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
              })
              .catch(() => caches.match(event.request))
          // Everything else: cache-first
          : caches.match(event.request).then(cached =>
              cached || fetch(event.request)
            )
        )
  );
});
