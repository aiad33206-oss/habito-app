// Habito service worker — caches the app shell for fast loads + offline
// support. Habit data always comes from Supabase (network), never cached.
const CACHE_NAME = 'habito-shell-v1';
const SHELL_FILES = [
  './', './index.html', './manifest.json',
  './css/styles.css',
  './js/config.js', './js/constants.js', './js/icons.js', './js/i18n.js',
  './js/data.js', './js/ui-core.js', './js/render.js', './js/modals.js',
  './js/auth.js', './js/terms-content.js', './js/app.js',
  './assets/logo.png',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL_FILES)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  if (url.includes('supabase.co')) return; // never cache API/auth calls
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
