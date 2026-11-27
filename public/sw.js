/* While You're Away — offline support for the recipient's letter box.
   App shell: stale-while-revalidate. Letter box data: network first, cached fallback.
   Photos: cached by file path so they still show without signal. */

const SHELL = 'wya-shell-v2'
const DATA = 'wya-data-v1'
const MEDIA = 'wya-media-v1'

/* Each deploy adds new hashed files; keep the shell cache to the newest ones so it never grows without end. */
const SHELL_LIMIT = 80
async function trimShell() {
  const cache = await caches.open(SHELL)
  const keys = await cache.keys()
  const old = keys.filter((k) => new URL(k.url).pathname !== '/index.html' && new URL(k.url).pathname !== '/')
  for (const k of old.slice(0, Math.max(0, old.length - SHELL_LIMIT))) await cache.delete(k)
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/index.html'])).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  const keep = [SHELL, DATA, MEDIA]
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // letter box data
  if (url.origin === self.location.origin && url.pathname === '/api/box') {
    const key = `${url.origin}/api/box?token=${url.searchParams.get('token') || ''}`
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(DATA).then((c) => c.put(key, res.clone()))
          return res
        })
        .catch(() => caches.match(key).then((hit) => hit || Response.error())),
    )
    return
  }

  // photos from storage: signed URLs change, the file path doesn't
  if (url.pathname.includes('/storage/v1/object/sign/media/') && req.destination === 'image') {
    const key = url.origin + url.pathname
    event.respondWith(
      caches.match(key).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(MEDIA).then((c) => c.put(key, res.clone()))
            return res
          }),
      ),
    )
    return
  }

  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return
  // the letter guides are plain pages of their own: never treat them as the app (or save them as its offline copy)
  if (url.pathname.startsWith('/guides/') || url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') return

  // pages: the app is a single page, so any navigation can fall back to the cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(SHELL).then((c) => c.put('/index.html', res.clone()))
          return res
        })
        .catch(() => caches.match('/index.html').then((hit) => hit || Response.error())),
    )
    return
  }

  // built assets (hashed file names) and fonts from this origin
  event.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone())).then(trimShell).catch(() => {})
          return res
        })
        .catch(() => hit || Response.error())
      return hit || net
    }),
  )
})
