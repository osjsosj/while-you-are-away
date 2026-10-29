/* While You're Away — offline support for the recipient's letter box.
   App shell: stale-while-revalidate. Letter box data: network first, cached fallback.
   Photos: cached by file path so they still show without signal. */

const SHELL = 'wya-shell-v1'
const DATA = 'wya-data-v1'
const MEDIA = 'wya-media-v1'

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
          if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone()))
          return res
        })
        .catch(() => hit)
      return hit || net
    }),
  )
})
