/**
 * ryoko-kakeibo Service Worker
 *
 * 更新政策：
 *   - CACHE_NAME 含版本號，每次 deploy 改版本 → 舊 cache 自動清除
 *   - install 後 skipWaiting，新 SW 立刻接管
 *   - activate 時 clients.claim，已開頁面立刻使用新 SW
 *   - 收到 SKIP_WAITING message 時主動切換（給 UI 觸發更新用）
 *
 * 快取策略：
 *   - 同源資源：網路優先，失敗 fallback cache
 *   - 第三方（字型等）：cache 優先，背景更新
 */
const CACHE_NAME = 'ryoko-kakeibo-v1.1';
const ASSETS = [
  './',
  './index.html',
  './trip.config.js',
  './manifest.json',
  './icons/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(err => {
        console.warn('[sw] cache addAll partial fail (ok):', err.message);
      }))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 收到從頁面來的 SKIP_WAITING message → 立刻啟用新 SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // 第三方（字型等）：cache 優先
  if (url.origin !== location.origin) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached || fetch(req).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
          }
          return res;
        }).catch(() => cached || new Response('', { status: 504 }))
      )
    );
    return;
  }

  // 同源：網路優先，失敗 fallback cache
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok && req.url.startsWith(location.origin)) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
  );
});
