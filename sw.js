const CACHE_NAME = 'splat-v1';
const ASSETS = [
  '.',
  'index.html',
  'css/main.css',
  'css/game.css',
  'css/settings.css',
  'css/victory.css',
  'js/app.js',
  'js/game.js',
  'js/fly.js',
  'js/syllables.js',
  'js/speech.js',
  'js/sound.js',
  'js/settings.js',
  'js/ui.js',
  'img/fly.svg',
  'img/fly-splat.svg',
  'sounds/splat.mp3',
  'sounds/buzz.mp3',
  'sounds/victory.mp3',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        // Some assets may not exist yet — cache what we can
        return Promise.allSettled(ASSETS.map(url => cache.add(url)));
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        // Cache successful responses for offline use
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline and not cached — nothing we can do
      });
    })
  );
});
