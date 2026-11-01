/**
 * decor.js — how a letter box is dressed: a paper style, a few hand-drawn motifs, a postmark,
 * a ticket-shaped letter. The design step picks from this library; it never draws.
 * Shared by the browser and the server (no JSX, no DOM).
 */

import { STICKERS } from './stickers.js'

/* Stickers come from a curated set of Microsoft Fluent Emoji (MIT), shown as die-cut vinyl stickers.
   The older hand-drawn ids map onto them so saved drafts keep working. */
export const LEGACY_MOTIFS = {
  tangerine: 'tangerine', strawberry: 'strawberry', cherry: 'cherries', lemon: 'lemon', coffee: 'hot-beverage', ramen: 'steaming-bowl',
  moon: 'crescent-moon', stars: 'glowing-star', daisy: 'blossom', music: 'musical-notes', camera: 'camera-with-flash',
  umbrella: 'umbrella-with-rain-drops', heart: 'red-heart', cat: 'cat-face', dog: 'dog-face', wave: 'water-wave',
  mountain: 'snow-capped-mountain', snow: 'snowflake', cake: 'birthday-cake', book: 'books', plane: 'airplane',
  popcorn: 'popcorn', gamepad: 'video-game', bicycle: 'bicycle', pizza: 'pizza',
}
export function stickerId(id) {
  if (typeof id !== 'string') return null
  if (STICKERS[id]) return id
  const mapped = LEGACY_MOTIFS[id]
  return mapped && STICKERS[mapped] ? mapped : null
}
export const stickerLabel = (id) => {
  const s = STICKERS[stickerId(id)]
  return s ? s[0].replace(/\b\w/, (c) => c.toUpperCase()) : ''
}

/* Which words may call up a sticker on their own. Precision matters more than reach: a wrong sticker
   ("stop sign" for "two more stops") is worse than none. A sticker answers to its full name, to the
   words people use for it (aliases), and to its main noun when the name is short ("cake" → birthday cake). */
const GENERIC = new Set(['with', 'face', 'and', 'the', 'place', 'button', 'symbol', 'sign', 'mark', 'medium', 'small', 'large', 'white', 'black', 'seat', 'window', 'door', 'open', 'closed', 'high', 'top', 'down', 'back', 'old', 'hand', 'hands', 'person', 'man', 'woman', 'light', 'new', 'way', 'letter', 'left', 'right', 'tilted', 'stop', 'clock', 'oclock', 'day', 'night', 'time', 'house', 'box', 'card', 'bag', 'home', 'love'])
let terms = null
function stickerTerms() {
  if (terms) return terms
  terms = []
  const df = new Map()
  const entries = Object.entries(STICKERS).map(([id, [label, words]]) => {
    const parts = label.split(' ')
    const own = new Set(parts)
    const solo = new Set(words.split(' ').filter((w) => !own.has(w))) // aliases
    if (parts.length === 1) solo.add(parts[0])
    else if (parts.length === 2) solo.add(parts[1])
    if (parts[1] === 'with') solo.add(parts[0])
    if (parts.length > 1) solo.add(label) // the full name as a phrase
    const list = [...solo].filter((w) => !GENERIC.has(w) && w.length >= (/[가-힣]/.test(w) ? 2 : 3))
    for (const w of list) df.set(w, (df.get(w) || 0) + 1)
    return [id, list]
  })
  // rarer words weigh more; the sticker's own name (a full phrase, or a one-word name) weighs most
  for (const [id, list] of entries) {
    const label = STICKERS[id][0]
    terms.push([id, list.map((w) => [w, 1 / df.get(w) + (w === label ? 0.8 : 0) + (w === label.split(' ')[1] ? 0.3 : 0)])])
  }
  return terms
}

/** Stickers whose words appear in a piece of text, best first. Used to dress each letter by what it says. */
export function stickersFor(text, limit = 2, exclude = []) {
  const t = ` ${String(text || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9가-힣\s]/g, ' ').replace(/\s+/g, ' ')} `
  if (t.trim().length < 3) return []
  const out = []
  for (const [id, list] of stickerTerms()) {
    let score = 0
    const hits = []
    for (const [w, weight] of list) {
      const hit = /[가-힣]/.test(w) ? t.includes(w) : t.includes(` ${w} `) || t.includes(` ${w}s `) || t.includes(` ${w}es `)
      if (hit) { score += weight; hits.push(w) }
    }
    if (score >= 0.2) out.push([score, id, hits])
  }
  // one sticker per thing: a word that already called up a sticker (or one already on the box) can't call another
  const used = new Set()
  for (const [, id, hits] of out) if (exclude.includes(id)) hits.forEach((w) => used.add(w))
  return out.sort((a, b) => b[0] - a[0])
    .filter(([, id, hits]) => { if (exclude.includes(id) || hits.some((w) => w.split(' ').some((x) => used.has(x)))) return false; hits.forEach((w) => w.split(' ').forEach((x) => used.add(x))); return true })
    .slice(0, limit).map((x) => x[1])
}

export const STYLES = {
  night: { name: 'Night sky', desc: 'Cream paper under our porch light. Calm and warm.', accent: '#F0B341' },
  scrapbook: { name: 'Scrapbook', desc: 'Kraft paper, tape and photos everywhere.', accent: '#E8913A' },
  flowers: { name: 'Pressed flowers', desc: 'Soft and warm, a flower tucked in each letter.', accent: '#E8918A' },
  quiet: { name: 'Quiet paper', desc: 'White paper, just your words.', accent: '#9AA4B8' },
}
export const STYLE_IDS = Object.keys(STYLES)

export const TICKETS = {
  bus: { label: 'Bus ticket', head: 'CITY BUS · ONE WAY', color: '#2F6D5B', words: ['bus', 'shuttle', '버스'] },
  train: { label: 'Train ticket', head: 'RAIL · RETURN', color: '#7A3B4B', words: ['train', 'subway', 'metro', 'ktx', 'rail', '기차', '지하철'] },
  plane: { label: 'Boarding pass', head: 'BOARDING PASS', color: '#2D4B7A', words: ['plane', 'flight', 'airport', '비행기', '공항'] },
}

const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const clean = (s, n) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, n) : '')

/**
 * Normalize a decoration plan from the design step (or a saved draft).
 * `letterIds` = ids of letters a ticket may dress (open-when / never-said / occasions).
 */
export function normalizeDecor(raw, letterIds = []) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const style = STYLES[r.style] ? r.style : 'night'
  const seen = new Set()
  const motifs = (Array.isArray(r.motifs) ? r.motifs : [])
    .map((m) => (typeof m === 'string' ? { id: m } : m))
    .map((m) => m && { ...m, id: stickerId(m.id) })
    .filter((m) => m && m.id && !seen.has(m.id) && seen.add(m.id))
    .slice(0, 4)
    .map((m) => ({ id: m.id, why: clean(m.why, 140) }))
  const pm = r.postmark && clean(r.postmark.place, 28) ? { place: clean(r.postmark.place, 28), date: isISO(r.postmark.date) ? r.postmark.date : '', why: clean(r.postmark.why, 140) } : null
  let ticket = null
  if (r.ticket && TICKETS[r.ticket.kind]) {
    const letterId = letterIds.includes(r.ticket.letterId) ? r.ticket.letterId : letterIds[0]
    if (letterId) ticket = { kind: r.ticket.kind, letterId, title: clean(r.ticket.title, 22), line: clean(r.ticket.line, 40), why: clean(r.ticket.why, 140) }
  }
  const song = r.song && clean(r.song.title, 60) ? { title: clean(r.song.title, 60), why: clean(r.song.why, 140) } : null
  const off = {}
  if (r.off && typeof r.off === 'object') for (const k of Object.keys(r.off)) if (r.off[k] === true) off[k.slice(0, 40)] = true
  return { style, motifs, postmark: pm, ticket, song, off }
}

/** The plan with anything the sender switched off removed — what the recipient actually gets. */
export function activeDecor(decor) {
  if (!decor) return null
  const off = decor.off || {}
  return {
    style: decor.style,
    motifs: decor.motifs.filter((m) => !off[`motif:${m.id}`]),
    postmark: decor.postmark && !off.postmark ? decor.postmark : null,
    ticket: decor.ticket && !off.ticket ? decor.ticket : null,
    tape: !off.tape,
    song: decor.song && !off.song ? decor.song : null,
    sealVoice: !off.sealVoice,
    celebrate: !off.celebrate,
    letterStickers: !off.letterStickers,
  }
}

/**
 * A plan built from the interview's own words, used when the design step can't run.
 * Picks motifs whose words appear in what the sender said; nothing is invented.
 */
export function fallbackDecor(phase2 = {}, letterIds = []) {
  const text = [phase2.symbols, phase2.special, phase2.nicknames, phase2.shared, phase2.jokes, phase2.song, phase2.transport, ...(Array.isArray(phase2.places) ? phase2.places.map((p) => p && p.name) : []), ...(Array.isArray(phase2.timeline) ? phase2.timeline.map((t) => t && t.label) : [])]
    .filter((s) => typeof s === 'string').join(' ').toLowerCase()
  const has = (w) => (/^[a-z ]+$/.test(w) ? new RegExp(`\\b${w}(e?s)?\\b`).test(text) : text.includes(w))
  const motifs = stickersFor(text, 3).map((id) => ({ id, why: '' }))
  if (phase2.song && !motifs.find((m) => m.id === 'musical-notes') && motifs.length < 4) motifs.push({ id: 'musical-notes', why: '' })
  const place = (Array.isArray(phase2.places) ? phase2.places : []).find((p) => p && p.name)
    || (Array.isArray(phase2.timeline) ? phase2.timeline : []).map((t) => t && { name: t.label, date: t.date }).find((p) => p && p.name && p.name.length <= 28)
  const kind = Object.keys(TICKETS).find((k) => TICKETS[k].words.some(has))
  return normalizeDecor({
    style: 'night',
    motifs,
    postmark: place ? { place: place.name, date: place.date } : null,
    ticket: kind ? { kind, letterId: letterIds[0] } : null,
    song: typeof phase2.song === 'string' && phase2.song.trim() ? { title: phase2.song } : null,
  }, letterIds)
}

/** Format a date for a postmark: "APR 2 · 2023". */
export function postmarkDate(iso) {
  if (!isISO(iso)) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][m - 1]
  return `${mon} ${d} · ${y}`
}

/** The letter that carries the postmark: the first night's letter, or else the first letter on the rhythm. */
export function postmarkLetterId(items) {
  const list = Array.isArray(items) ? items : []
  return (list.find((i) => i.id === 't0') || list.find((i) => i.section === 'scheduled') || {}).id || null
}
