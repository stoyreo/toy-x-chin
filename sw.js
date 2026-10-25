const VERSION = '2026.10.24-19';
const CACHE = 'txc-' + VERSION;
const SHELL = ['/', '/index.html', '/styles.css', '/extras.css', '/todo.css', '/ui.css', '/app.js', '/map-style.js', '/panel.js', '/todo.js', '/todo-boot.js', '/todo-ai.js', '/tweaks.js', '/chatfix.js', '/chatpet.js', '/call.js', '/notify.js', '/about.js', '/ui.js', '/nav.js', '/sheets.js', '/panel-snap.js', '/i18n.js', '/config.js', '/expenses.js', '/weather.js', '/steps.js', '/steps-core.js', '/steps-art.js', '/steps.css', '/body.js', '/icons.svg', '/manifest.webmanifest', '/icon-192.png', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'skip-waiting') self.skipWaiting();
  if (e.data === 'version' && e.source) e.source.postMessage({ type: 'sw-version', version: VERSION });
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('/index.html')))
  );
});

self.addEventListener('push', (e) => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch { data = { title: 'Toy x Chin', body: e.data ? e.data.text() : '' }; }
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const apple = /iPhone|iPad|iPod|Macintosh/.test(self.navigator.userAgent || '');
    if (!apple && wins.some((w) => w.visibilityState === 'visible')) return;
    const isTodo = data.kind === 'todo' || String(data.tag || '').startsWith('txc-todo');
    const isCall = data.kind === 'call';
    const urgent = isCall || data.priority === 'urgent';
    await self.registration.showNotification(data.title || 'Toy x Chin', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'txc',
      renotify: true,
      silent: false,
      timestamp: Date.now(),
      requireInteraction: isCall,
      vibrate: isCall ? [500, 250, 500, 250, 500, 250, 500]
        : data.kind === 'nudge' ? [700, 150, 700, 150, 1100]
        : urgent ? [200, 100, 200]
        : [40],
      data: { url: isTodo ? '/#todo' : (data.url || '/#chat') },
    });
  })());
});

self.addEventListener('pushsubscriptionchange', (e) => {
  const key = e.oldSubscription && e.oldSubscription.options && e.oldSubscription.options.applicationServerKey;
  if (!key) return;
  e.waitUntil(self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }).catch(() => {}));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/#chat';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      if (wins[0]) {
        wins[0].postMessage(target.includes('#todo') ? 'open-todo' : target.includes('#steps') ? 'open-steps' : target.includes('#expenses') ? 'open-expenses' : target.includes('#chat') ? 'open-chat' : 'open-map');
        return wins[0].focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
