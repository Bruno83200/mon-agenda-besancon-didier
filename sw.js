/* =========================================================================
   sw.js — mode « hors-ligne » (facultatif)
   Met en cache la coquille de l'agenda pour qu'il s'ouvre même sans réseau.
   Les données temps réel (Ginko, météo, actus) ne sont jamais mises en
   cache : elles sont toujours demandées au serveur.
   ========================================================================= */
const CACHE = 'agenda-besancon-v3';   // changer cette valeur à chaque mise à jour du site
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/config.js',
  './js/data-places.js',
  './js/data-network.js',
  './js/data-saints.js',
  './assets/fond-nebuleuse.jpg',
  './assets/icon.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // ne pas intercepter les API externes (Ginko, météo, RSS…)
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
