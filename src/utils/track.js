/* First-party funnel tracking. Sends a name, a normalized path and a few short labels to /api/track.
 * Never sends names, emails, letter text or box links. Respects Do Not Track and Global Privacy Control. */

const AID_KEY = 'wya_aid'
const FT_KEY = 'wya_ft'

const isLocal = () => ['localhost', '127.0.0.1'].includes(window.location.hostname)

const off = () =>
  typeof window === 'undefined' ||
  navigator.doNotTrack === '1' ||
  window.doNotTrack === '1' ||
  navigator.globalPrivacyControl === true ||
  navigator.webdriver === true ||
  (isLocal() && !window.__WYA_TRACK_DEV__)

function read(key) {
  try { return window.localStorage.getItem(key) } catch { return null }
}
function write(key, value) {
  try { window.localStorage.setItem(key, value) } catch { /* private mode: no stored id */ }
}

export function anonId() {
  let id = read(AID_KEY)
  if (!id) {
    id = crypto.randomUUID
      ? crypto.randomUUID()
      : [...crypto.getRandomValues(new Uint8Array(16))].map((x) => x.toString(16).padStart(2, '0')).join('')
    write(AID_KEY, id)
  }
  return id
}

/** utm_* or the referrer host, kept from the first visit. */
function firstTouch() {
  const saved = read(FT_KEY)
  if (saved) {
    try { return JSON.parse(saved) } catch { /* fall through and rebuild */ }
  }
  const q = new URLSearchParams(window.location.search)
  let host = ''
  try { host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '' } catch { /* ignore */ }
  if (host === window.location.hostname) host = ''
  const ft = { src: q.get('utm_source') || host || '', medium: q.get('utm_medium') || '', campaign: q.get('utm_campaign') || '' }
  write(FT_KEY, JSON.stringify(ft))
  return ft
}

/** Route without private parts: a box link becomes /b/:token. */
export const safePath = (p) => (p.startsWith('/b/') ? '/b/:token' : p)

/** track('cta_start', { where: 'home_close' }). Pass { anon: false } on recipient pages. */
export function track(name, props = {}, { anon = true } = {}) {
  if (off()) return
  try {
    const ft = anon ? firstTouch() : {}
    const body = JSON.stringify({
      name,
      props,
      path: safePath(window.location.pathname),
      anon_id: anon ? anonId() : null,
      ...ft,
    })
    const blob = new Blob([body], { type: 'application/json' })
    if (!(navigator.sendBeacon && navigator.sendBeacon('/api/track', blob))) {
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
    }
  } catch { /* tracking must never break the page */ }
}

/** Tracking id to hand to checkout, so a payment can be tied back to the visit. Null when tracking is off. */
export const trackingId = () => (off() ? null : anonId())

/** Elements with data-track="event_name" (and optional data-track-where) report a click. */
let clickInstalled = false
export function installClickTracking() {
  if (typeof document === 'undefined' || clickInstalled) return
  clickInstalled = true
  document.addEventListener('click', (e) => {
    const el = e.target instanceof Element ? e.target.closest('[data-track]') : null
    if (el) track(el.getAttribute('data-track'), { where: el.getAttribute('data-track-where') || undefined })
  })
}
