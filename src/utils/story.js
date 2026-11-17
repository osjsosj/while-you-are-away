/**
 * story.js — what we learned about the two of them (from their chat and the planning talk),
 * turned into things the sender can use while writing:
 *  - findings: moments, things they always say, earlier goodbyes, small numbers
 *  - letter slots made in advance from those findings (empty until the sender writes; unwritten ones never ship)
 *  - "pins": a finding attached to one letter, shown on the recipient's paper next to the sender's words
 * The words of the letters stay the sender's. Shared by the browser and the server (no DOM).
 *
 * story = {
 *   about, callEachOther: a line about the two of them and what they call each other
 *   memories: [{ id, title, date, place, sticker, prompt }],
 *   catchphrases: [{ id, who, text }],
 *   partings: [{ id, date, place, what, back }],
 *   stats: chatStats() output (see utils/chat/stats.js)
 * }
 */

import { getPlan, normalizePlan } from './plan.js'

const str = (v, n) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, n) : '')
const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const iso = (s) => (isISO(s) ? s : '')

export function normalizeStory(raw) {
  if (!raw || typeof raw !== 'object') return null
  const list = (arr, n = 24) => (Array.isArray(arr) ? arr.filter((x) => x && typeof x === 'object').slice(0, n) : [])
  const story = {
    about: str(raw.about, 400),
    callEachOther: str(raw.callEachOther, 80),
    memories: list(raw.memories).map((m, i) => ({ id: str(m.id, 40) || `m${i}`, title: str(m.title, 80), date: iso(m.date), place: str(m.place, 40), sticker: str(m.sticker, 40), prompt: str(m.prompt, 160) })).filter((m) => m.title),
    catchphrases: list(raw.catchphrases).map((c, i) => ({ id: str(c.id, 40) || `c${i}`, who: str(c.who, 30), text: str(c.text, 80) })).filter((c) => c.text),
    partings: list(raw.partings, 12).map((p, i) => ({ id: str(p.id, 40) || `p${i}`, date: iso(p.date), place: str(p.place, 40), what: str(p.what, 60), back: iso(p.back) })).filter((p) => p.date || p.what),
    stats: raw.stats && typeof raw.stats === 'object' ? raw.stats : null,
  }
  return story.memories.length || story.catchphrases.length || story.partings.length || story.stats ? story : null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function shortDate(d) {
  if (!isISO(d)) return ''
  const [y, m, day] = d.split('-').map(Number)
  return `${MONTHS[m - 1]} ${day}, ${y}`
}
function clock(at) {
  if (!at) return ''
  const h = Number(at.slice(11, 13))
  const m = at.slice(14, 16)
  return `${h % 12 || 12}:${m} ${h < 12 ? 'a.m.' : 'p.m.'}`
}
const n = (v) => Number(v || 0).toLocaleString('en-US')

/** Small true numbers from their chat, worded the way they could sit on a letter. Shared facts only. */
export function statFacts(stats) {
  if (!stats) return []
  const out = []
  const p = stats.phrases || {}
  if (stats.first?.text) out.push({ id: 'first', text: `“${stats.first.text}”`, sub: `The first message${stats.first.at ? `, ${shortDate(stats.first.at.slice(0, 10))}` : ''}` })
  if (stats.daysTalked) out.push({ id: 'days', text: `${n(stats.daysTalked)} days`, sub: `that we talked${stats.from ? `, since ${shortDate(stats.from)}` : ''}` })
  if (stats.callMinutes >= 60) out.push({ id: 'calls', text: `${n(Math.round(stats.callMinutes / 60))} hours`, sub: `on the phone, over ${n(stats.calls)} calls` })
  if (stats.lateNight?.at) out.push({ id: 'late', text: clock(stats.lateNight.at), sub: `the latest we stayed up talking, ${shortDate(stats.lateNight.at.slice(0, 10))}` })
  if (p.goodnight >= 3) out.push({ id: 'goodnight', text: `${n(p.goodnight)} good nights`, sub: 'said in our messages' })
  if (p.missYou >= 2) out.push({ id: 'miss', text: `“I miss you” ${n(p.missYou)} times`, sub: 'and that’s just the ones we typed' })
  if (p.thanks >= 3) out.push({ id: 'thanks', text: `${n(p.thanks)} thank-yous`, sub: 'back and forth' })
  if (stats.busiest?.count >= 20) out.push({ id: 'busiest', text: `${n(stats.busiest.count)} messages`, sub: `in one day, ${shortDate(stats.busiest.date)}` })
  return out
}

/** Everything found, grouped for the panel. Each entry carries the pin it would become. */
export function storyFindings(story) {
  if (!story) return []
  const groups = [
    {
      id: 'moments',
      title: 'Moments',
      items: story.memories.map((m) => ({ key: `memory:${m.id}`, title: m.title, sub: [m.place, shortDate(m.date)].filter(Boolean).join(' · '), prompt: m.prompt, sticker: m.sticker, pin: { kind: 'memory', ref: m.id, text: m.title, sub: [m.place, shortDate(m.date)].filter(Boolean).join(' · ') } })),
    },
    {
      id: 'sayings',
      title: 'Things you always say',
      items: story.catchphrases.map((c) => ({ key: `quote:${c.id}`, title: `“${c.text}”`, sub: c.who ? `${c.who} says this a lot` : '', pin: { kind: 'quote', ref: c.id, text: c.text, sub: c.who } })),
    },
    {
      id: 'goodbyes',
      title: 'Goodbyes before this one',
      items: story.partings.map((p) => ({ key: `parting:${p.id}`, title: p.what || 'A goodbye', sub: [p.place, shortDate(p.date), p.back && `back ${shortDate(p.back)}`].filter(Boolean).join(' · '), pin: { kind: 'parting', ref: p.id, text: p.what || 'A goodbye', sub: [p.place, shortDate(p.date)].filter(Boolean).join(' · ') } })),
    },
    {
      id: 'numbers',
      title: 'By the numbers',
      items: statFacts(story.stats).map((f) => ({ key: `stat:${f.id}`, title: f.text, sub: f.sub, pin: { kind: 'stat', ref: f.id, text: f.text, sub: f.sub } })),
    },
  ]
  return groups.filter((g) => g.items.length)
}

/** The letter a finding would start: which section, a title, and a question to start from. */
export function letterFromFinding(item) {
  const k = item.pin.kind
  if (k === 'quote') return { list: 'anytime', label: `Open when you need to hear “${item.pin.text}”`.slice(0, 80), hint: 'Why do those words matter between you?' }
  if (k === 'parting') return { list: 'neverSaid', label: `The last time we said goodbye`, hint: `${item.pin.sub ? `${item.pin.sub}. ` : ''}What do you remember, and what do you wish you’d said?`.slice(0, 120) }
  if (k === 'stat') return { list: 'neverSaid', label: item.pin.text.replace(/^“|”$/g, '').slice(0, 80), hint: 'What’s behind this number?' }
  return { list: 'neverSaid', label: item.title.slice(0, 80), hint: (item.prompt || 'What do you remember most about it?').slice(0, 120) }
}

/**
 * Letter slots made in advance from the story: one per moment and earlier goodbye, one for the
 * phrase they say most. Added once (each carries `from`), empty until the sender writes.
 * Returns the new plan and, per new letter, the finding pinned to it to start from.
 */
export function applyStoryToPlan(plan, story, max = 6) {
  if (!story) return { plan, pins: {} }
  const have = new Set([...plan.neverSaid, ...plan.anytime].map((x) => x.from).filter(Boolean))
  const groups = storyFindings(story)
  // a goodbye on the same day as a moment is the same story: one letter, not two
  const momentDays = new Set(story.memories.map((m) => m.date).filter(Boolean))
  const sameDay = (it) => it.pin.kind === 'parting' && momentDays.has(story.partings.find((p) => p.id === it.pin.ref)?.date)
  const picks = [
    ...(groups.find((g) => g.id === 'moments')?.items || []),
    ...(groups.find((g) => g.id === 'goodbyes')?.items || []).filter((it) => !sameDay(it)).slice(0, 1),
    ...(groups.find((g) => g.id === 'sayings')?.items || []).slice(0, 1),
  ].filter((it) => !have.has(it.key)).slice(0, max)
  if (!picks.length) return { plan, pins: {} }
  const pins = {}
  const next = { ...plan, neverSaid: [...plan.neverSaid], anytime: [...plan.anytime] }
  picks.forEach((it, i) => {
    const l = letterFromFinding(it)
    const prefix = l.list === 'anytime' ? 's' : 'n'
    const id = `${prefix}st${Date.now().toString(36)}${i}`
    next[l.list].push({ id, label: l.label, hint: l.hint, from: it.key })
    pins[id] = [it.pin]
  })
  return { plan: next, pins }
}

export const MAX_PINS = 3
/**
 * What changes in the draft when a story comes in: the story itself, letters made in advance
 * from it, and the finding pinned to each of those letters. Returns null for an empty story.
 */
export function draftWithStory(draft, raw) {
  const st = normalizeStory(raw)
  if (!st) return null
  const { plan, pins } = applyStoryToPlan(getPlan(draft), st)
  const caps = { ...(draft.capsuleData || {}) }
  for (const [id, list] of Object.entries(pins)) caps[id] = { ...(caps[id] || {}), pins: cleanPins(list) }
  return { story: raw, plan: normalizePlan(plan), capsuleData: caps }
}

const PIN_KINDS = new Set(['memory', 'quote', 'parting', 'stat'])

/** Pins as stored on a letter: known kinds, short text, at most three. */
export function cleanPins(pins) {
  if (!Array.isArray(pins)) return []
  const seen = new Set()
  return pins
    .filter((p) => p && PIN_KINDS.has(p.kind) && str(p.text, 90))
    .map((p) => ({ kind: p.kind, ref: str(p.ref, 40), text: str(p.text, 90), sub: str(p.sub, 120) }))
    .filter((p) => { const k = `${p.kind}:${p.ref}`; if (seen.has(k)) return false; seen.add(k); return true })
    .slice(0, MAX_PINS)
}
