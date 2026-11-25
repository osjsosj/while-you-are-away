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
import { stickersFor } from './decor.js'

/* Trim to n characters at a word, with an ellipsis, so nothing ever ends mid-word ("about abs"). */
export function clip(text, n) {
  const s = String(text).replace(/\s+/g, ' ').trim()
  if (s.length <= n) return s
  const cut = s.slice(0, n - 1)
  const at = cut.lastIndexOf(' ')
  return `${(at > n * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.\-–—]+$/, '')}…`
}
const str = (v, n) => (typeof v === 'string' ? clip(v, n) : '')
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

/**
 * What the sender told the planning guide, in the same shape as a chat story: the dates and places
 * they named become moments, a running joke becomes something they say. Each finding is marked
 * `from: 'talk'`. Not turned into letters automatically: the planning talk already shaped the plan.
 */
export function storyFromTalk(phase2) {
  const p2 = phase2 && typeof phase2 === 'object' ? phase2 : {}
  const memories = []
  const seen = new Set()
  const add = (m) => {
    const k = `${m.title}|${m.date}`.toLowerCase()
    if (!m.title || seen.has(k)) return
    seen.add(k)
    memories.push({ ...m, sticker: stickersFor(`${m.title} ${m.place}`, 1)[0] || '', prompt: m.date ? 'What do you remember most about that day?' : 'What do you remember most about it?', from: 'talk' })
  }
  ;(Array.isArray(p2.timeline) ? p2.timeline : []).forEach((t, i) => t && add({ id: `talk-t${i}`, title: str(t.label, 80), date: iso(t.date), place: '' }))
  ;(Array.isArray(p2.places) ? p2.places : []).forEach((pl, i) => pl && add({ id: `talk-p${i}`, title: str(pl.name, 80), date: iso(pl.date), place: str(pl.name, 40) }))
  const joke = str(p2.jokes, 120)
  const catchphrases = joke && joke.length <= 80 ? [{ id: 'talk-joke', who: '', text: joke, from: 'talk' }] : []
  return { memories, catchphrases, callEachOther: str(p2.nicknames || p2.relationshipWord, 80) }
}

/**
 * Everything we know about the two of them: the chat story (if any) and the planning talk, merged.
 * A moment the talk names on the same day as one from the chat is kept once (the chat's).
 * `colorWords` are the things they said are theirs, which may tint the box but never show as words.
 */
export function storyFromDraft(draft = {}) {
  const chat = normalizeStory(draft.story)
  const talk = storyFromTalk(draft.phase2)
  const p2 = draft.phase2 || {}
  const chatDays = new Set((chat?.memories || []).map((m) => m.date).filter(Boolean))
  const chatTitles = new Set((chat?.memories || []).map((m) => m.title.toLowerCase()))
  const fromTalk = talk.memories.filter((m) => !(m.date && chatDays.has(m.date)) && !chatTitles.has(m.title.toLowerCase()))
  // stickers drawn for moments the library had nothing for (see drawSticker)
  const drawn = draft.drawnStickers && typeof draft.drawnStickers === 'object' ? draft.drawnStickers : {}
  const withDrawn = (m) => (m.sticker || !/^x-[a-f0-9]{12}$/.test(drawn[m.id] || '') ? m : { ...m, sticker: drawn[m.id] })
  const merged = {
    about: chat?.about || '',
    callEachOther: chat?.callEachOther || talk.callEachOther,
    memories: [...(chat?.memories || []), ...fromTalk].map(withDrawn),
    catchphrases: [...(chat?.catchphrases || []), ...talk.catchphrases],
    partings: chat?.partings || [],
    stats: chat?.stats || null,
    hasChat: !!chat,
    colorWords: [p2.shared, p2.symbols, p2.special, p2.transport, p2.song].map((x) => str(x, 200)).filter(Boolean),
  }
  return merged.memories.length || merged.catchphrases.length || merged.partings.length || merged.stats || merged.colorWords.length ? merged : null
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
      items: story.memories.map((m) => ({ from: m.from || 'chat', key: `memory:${m.id}`, title: m.title, sub: [m.place, shortDate(m.date)].filter(Boolean).join(' · '), prompt: m.prompt, sticker: m.sticker, pin: { kind: 'memory', ref: m.id, text: m.title, sub: [m.place, shortDate(m.date)].filter(Boolean).join(' · ') } })),
    },
    {
      id: 'sayings',
      title: 'Things you always say',
      items: story.catchphrases.map((c) => ({ from: c.from || 'chat', key: `quote:${c.id}`, title: `“${c.text}”`, sub: c.who ? `${c.who} says this a lot` : c.from === 'talk' ? 'Your running joke' : '', pin: { kind: 'quote', ref: c.id, text: c.text, sub: c.who } })),
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

/** Moments that still have no sticker and haven't been tried yet: what to ask the AI to draw. */
export function stickersToDraw(story, tried = [], max = 3) {
  if (!story) return []
  const skip = new Set(tried)
  return story.memories.filter((m) => !m.sticker && !skip.has(m.id)).slice(0, max).map((m) => ({ id: m.id, subject: [m.title, m.place].filter(Boolean).join(', ') }))
}

/**
 * A short plain-text brief of the chat story for the planning guide, so it can ask about what is
 * really there ("you always say 도착하면 전화해"). Chat findings only; at most `max` characters.
 */
export function storyBrief(story, max = 1500) {
  if (!story?.hasChat) return ''
  const lines = []
  if (story.about) lines.push(`About them: ${story.about}`)
  if (story.callEachOther) lines.push(`They call each other: ${story.callEachOther}`)
  const chat = (list) => list.filter((x) => (x.from || 'chat') === 'chat')
  for (const m of chat(story.memories)) lines.push(`Moment: ${m.title}${m.date ? ` (${m.date})` : ''}${m.place ? `, ${m.place}` : ''}`)
  for (const c of chat(story.catchphrases)) lines.push(`Always says${c.who ? ` (${c.who})` : ''}: "${c.text}"`)
  for (const p of story.partings) lines.push(`Earlier goodbye: ${p.what || 'a goodbye'}${p.date ? ` on ${p.date}` : ''}${p.place ? ` at ${p.place}` : ''}${p.back ? `, back ${p.back}` : ''}`)
  const out = []
  let n = 0
  for (const l of lines) { if (n + l.length + 1 > max) break; out.push(l); n += l.length + 1 }
  return out.join('\n')
}

const GROUP_WORDS = {
  moments: ['moment', 'moments'],
  sayings: ['thing you always say', 'things you always say'],
  goodbyes: ['goodbye before this one', 'goodbyes before this one'],
  numbers: ['number worth keeping', 'numbers worth keeping'],
}
/** "1 moment", "3 things you always say". */
export function groupCount(g) {
  const w = GROUP_WORDS[g.id]
  return `${g.items.length} ${w ? w[g.items.length === 1 ? 0 : 1] : g.title.toLowerCase()}`
}

/** The letter a finding would start: which section, a title, and a question to start from. */
export function letterFromFinding(item) {
  const k = item.pin.kind
  if (k === 'quote' && item.from === 'talk') return { list: 'anytime', label: `Open when you need a laugh`, hint: `Your joke, “${item.pin.text}”: where did it start?`.slice(0, 120) }
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
