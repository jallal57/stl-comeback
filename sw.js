// Cache hors connexion. Changer VERSION à chaque mise à jour de l'app.
const VERSION = 'stl-v2';
const FILES = ['./', './index.html', './css/style.css', './js/program.js', './js/pdf.js', './js/app.js', './manifest.json',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (pour recevoir les mises à jour), cache si hors connexion
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((r) => {
    const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
