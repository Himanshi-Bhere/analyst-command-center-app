// Offline support: precaches the app shell (index.html + built JS/CSS + icons) at install,
// serves from network when online (refreshing the cache) and from cache when offline.
const CACHE = 'acc-cache-v3'
const SHELL = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    await cache.addAll(SHELL)
    try {
      const html = await (await fetch('./index.html', { cache: 'no-store' })).text()
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1])
      await cache.addAll(assets)
    } catch {}
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const sameOrigin = req.url.startsWith(self.location.origin)
  const isFont = /fonts\.(googleapis|gstatic)\.com/.test(req.url)
  if (!sameOrigin && !isFont) return
  e.respondWith((async () => {
    try {
      const res = await fetch(req)
      if (res.ok || res.type === 'opaque') { const c = await caches.open(CACHE); c.put(req, res.clone()) }
      return res
    } catch {
      const hit = await caches.match(req, { ignoreSearch: true })
      if (hit) return hit
      if (req.mode === 'navigate') return caches.match('./index.html')
      return new Response('', { status: 504 })
    }
  })())
})
