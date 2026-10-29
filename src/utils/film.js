/**
 * film.js — the short film that plays the first time they open the letter box:
 * a few photos with a line each, and (optionally) the sender's voice underneath.
 */
export const FILM_MAX_PHOTOS = 12

const isRef = (v) => typeof v === 'string' && (v.startsWith('media:') || v.startsWith('data:'))

export function normalizeFilm(raw) {
  const photos = (Array.isArray(raw?.photos) ? raw.photos : [])
    .filter((p) => p && isRef(p.photo))
    .slice(0, FILM_MAX_PHOTOS)
    .map((p, i) => ({ id: typeof p.id === 'string' ? p.id.slice(0, 40) : `f${i}`, photo: p.photo, caption: typeof p.caption === 'string' ? p.caption.slice(0, 120) : '' }))
  return { photos, voice: isRef(raw?.voice) ? raw.voice : null }
}

/** Seconds each photo stays on screen: long enough to follow the voice note, never rushed or dragging. */
export function slideSeconds(count, voiceSeconds) {
  if (!count) return 0
  const fit = voiceSeconds ? voiceSeconds / count : 0
  return Math.min(9, Math.max(4.5, fit || 5))
}

/** Film data from the server (signed URLs) in the shape the player takes. */
export function filmFrom(raw) {
  const photos = (raw?.photos || []).filter((p) => p.photo?.url).map((p) => ({ id: p.id, url: p.photo.url, caption: p.caption || '' }))
  if (!photos.length) return null
  return { photos, voiceUrl: raw.voice?.url || null }
}
