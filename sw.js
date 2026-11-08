// Kantin Barokah · service worker (PWA)
// Strategi:
//  - Kode aplikasi (html, css, js): jaringan dulu, cache bila offline → pembaruan langsung terasa.
//  - Library CDN & font: cache dulu → cepat dan tetap jalan bila sinyal putus.
//  - Firebase, Firestore, login, dan upload Drive: TIDAK pernah di-cache (selalu langsung ke server).
const VERSION = 'barokah-v4.1.1';
const SHELL = [
  './', './index.html', './style.css', './app.js', './logo.svg',
  './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];
const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.gstatic.com'];
const NEVER_CACHE = [
  'firestore.googleapis.com', 'identitytoolkit.googleapis.com', 'securetoken.googleapis.com',
  'firebaseinstallations.googleapis.com', 'script.google.com', 'script.googleusercontent.com',
  'kantin-barokah-7870a.firebaseapp.com'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (NEVER_CACHE.includes(url.hostname)) return;          // biarkan langsung ke jaringan

  if (url.origin === self.location.origin) {
    e.respondWith(networkFirst(req));
    return;
  }
  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(cacheFirst(req));
  }
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(req)) || (await cache.match('./index.html'));
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(VERSION);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}
