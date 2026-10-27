// Hace que la página se pueda instalar y abra rápido. Los datos siempre vienen de internet.
const CACHE = 'catalogo-v7';
const BASICOS = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASICOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

// Primero internet (así siempre ves la versión nueva); si no hay, lo guardado.
self.addEventListener('fetch', function (e) {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) { const copia = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, copia); }); }
      return res;
    }).catch(function () { return caches.match(r).then(function (g) { return g || caches.match('index.html'); }); })
  );
});
