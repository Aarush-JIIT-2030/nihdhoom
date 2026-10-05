const CACHE = 'nirdhoom-shell-v6';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('nirdhoom-shell-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Never cache API responses, authenticated data, POSTs, or cross-origin content.
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      url.pathname.startsWith('/api/') || request.headers.has('authorization')) return;

  // Cache only the app shell and fingerprinted/static assets. Network-first keeps
  // the deployed UI fresh; the cache is a fallback for offline navigation/assets.
  const isShell = request.mode === 'navigate' || SHELL.includes(url.pathname);
  const isStaticAsset = /\.(?:js|css|svg|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname);
  if (!isShell && !isStaticAsset) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') return (await caches.match('/')) || Response.error();
      return Response.error();
    }
  })());
});
