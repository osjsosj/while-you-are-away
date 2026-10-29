/**
 * sky.js — the moon on a given night, and where each opened letter sits in their constellation.
 * No network: the moon is computed from a known new moon and the synodic month.
 */
const SYNODIC = 29.530588853
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) // 2000-01-06 18:14 UTC
const NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent']

/** Phase for the evening of an ISO date (about 9 pm in the Americas). phase: 0 new → 0.5 full → 1 new. */
export function moonOn(iso) {
  const [y, m, d] = String(iso).split('-').map(Number)
  if (!y || !m || !d) return null
  const t = Date.UTC(y, m - 1, d + 1, 4) // ~9 pm Pacific / midnight Eastern
  const days = (t - NEW_MOON) / 86400000
  const phase = (((days / SYNODIC) % 1) + 1) % 1
  const lit = (1 - Math.cos(2 * Math.PI * phase)) / 2
  return { phase, lit, name: NAMES[Math.floor(phase * 8 + 0.5) % 8] }
}

/** Small deterministic hash → [0,1). */
function rand(str, salt) {
  let h = 2166136261 ^ salt
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  h = Math.imul(h ^ (h >>> 15), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

/**
 * Star positions (0..1 in both axes) for letters opened, in opening order.
 * Stars drift left to right so the line reads like a path walked, with a little wander.
 */
export function constellation(ids) {
  const n = ids.length
  return ids.map((id, i) => {
    const base = n === 1 ? 0.5 : 0.06 + (0.88 * i) / (n - 1)
    const x = Math.min(0.97, Math.max(0.03, base + (rand(id, 1) - 0.5) * (0.6 / Math.max(n, 2))))
    const y = 0.15 + rand(id, 2) * 0.7
    const size = 0.8 + rand(id, 3) * 0.9
    return { id, x, y, size }
  })
}

/** Signatures are stored as SVG path data in a 400×150 box. Only plain path commands get through. */
export function cleanSignature(sig) {
  if (!sig || typeof sig.d !== 'string') return null
  const d = sig.d.slice(0, 20000)
  return /^[MLQ0-9.\s,-]+$/.test(d) && d.trim() ? { d } : null
}
