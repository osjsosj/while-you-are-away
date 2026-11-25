/**
 * letterForm.js — which paper form a letter takes, and the facts its head carries.
 * The rules are in docs/letter-design-rules.md: composition comes from what the letter carries
 * (its kind, its pins, the story), never from chance, and a slot with no fact is left out.
 * Pure functions: no DOM, no React. LetterForms.jsx draws the heads.
 */
import { hash } from './storyDesign.js'
import { TICKETS } from '../decor.js'

const TICKET_NAMES = { plane: 'Boarding pass', train: 'Rail ticket', bus: 'Bus ticket' }
/** The way they travel, from the box's ticket (picked from their story) or a goodbye pinned to the letter. */
function transportOf(box, pins) {
  if (TICKETS[box.transport]) return box.transport
  const text = pins.filter((p) => p.kind === 'parting').map((p) => `${p.text} ${p.sub}`).join(' ').toLowerCase()
  return Object.keys(TICKETS).find((k) => TICKETS[k].words.some((w) => new RegExp(`(^|[^a-z])${w}([^a-z]|$)`).test(text))) || ''
}

const DAY = 86400000
const parse = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d) }
const isDate = (iso) => /^\d{4}-\d{2}-\d{2}/.test(String(iso || ''))
export const longDate = (iso) => (isDate(iso) ? parse(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '')
const shortDate = (iso) => (isDate(iso) ? parse(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '')
const weekday = (iso) => (isDate(iso) ? parse(iso).toLocaleDateString('en-US', { weekday: 'long' }) : '')
const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / DAY)
const monthName = (ym) => parse(`${ym}-01`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

/** "Han River · Apr 2, 2023" → { place, date }; a lone date or a lone place is kept as what it is. */
export function splitSub(sub) {
  const parts = String(sub || '').split(' · ').map((s) => s.trim()).filter(Boolean)
  const looksDate = (s) => /\b(19|20)\d{2}\b/.test(s) || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d/.test(s)
  const date = parts.find(looksDate) || ''
  const place = parts.find((p) => p !== date) || ''
  return { place, date }
}

/** Who says it, said the way the two of them would: "you say this a lot" when it's the reader's line. */
export function whoSays(who, box = {}) {
  const w = String(who || '').trim()
  if (!w) return ''
  const same = (n) => n && w.toLowerCase() === String(n).trim().toLowerCase()
  if (same(box.toName) || same(box.nickname)) return 'you say this a lot'
  if (same(box.fromName)) return 'I say this a lot'
  return /\s/.test(w) ? w : `${w} says this a lot`
}

/** "Apr 2, 2023" → "2023-04-02" for the postmark; '' when it isn't a full date. */
export function toIso(text) {
  if (isDate(text)) return String(text).slice(0, 10)
  if (!/\b(19|20)\d{2}\b/.test(String(text || ''))) return ''
  const d = new Date(text)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The part of a place a postmark ring can carry: before the first comma, whole words, about 22 letters. */
export function markPlace(place) {
  const first = String(place || '').split(',')[0].trim()
  if (first.length <= 22) return first
  const words = first.split(' ')
  let out = ''
  for (const w of words) { if ((out ? `${out} ${w}` : w).length > 22) break; out = out ? `${out} ${w}` : w }
  return out || first.slice(0, 22)
}

/** "Open when you can't sleep" → "you can't sleep"; any other label stays whole. */
export function openWhenReason(label) {
  const m = String(label || '').match(/^open (?:this )?when\s*(.*)$/i)
  return m ? m[1].replace(/\.+$/, '').trim() : String(label || '').trim()
}

const FORMS = ['sealed', 'diary', 'ticket', 'envelope', 'folded', 'card', 'saying', 'postcard', 'tally', 'leaf', 'classic']
export { FORMS }

/**
 * item: { id, section, label, opensOn, writtenOn, pins: [{ kind, ref, text, sub }], stickers }
 * box:  { fromName, toName, partDate, returnDate, transport ('plane'|'train'|'bus'), nickname, seal: { text, initials, color }, stamps: [{ memory, sticker }], months: [{ month, count }] }
 * → { form, head, pins (the ones the head did not use), side, why: [{ info, design }] }
 */
export function letterForm(item = {}, box = {}) {
  const pins = Array.isArray(item.pins) ? item.pins : []
  const to = box.nickname || box.toName || ''
  const seed = hash(`${box.fromName}|${box.toName}|${item.id}`)
  const side = seed % 2 ? 'right' : 'left'
  const why = []
  const done = (form, head, used = [], reason) => {
    if (reason) why.push(reason)
    return { form, head, pins: pins.filter((p) => !used.includes(p)), side, why }
  }

  switch (item.section) {
    case 'last':
      return done('sealed', { ...(box.seal ? { seal: box.seal } : {}), to, until: longDate(box.returnDate || item.opensOn), apart: isDate(box.partDate) && isDate(box.returnDate) && daysBetween(box.partDate, box.returnDate) > 0 ? `after ${daysBetween(box.partDate, box.returnDate)} days apart` : '' }, [], { info: 'The letter for the day you meet again', design: 'a sealed letter under your seal' })
    case 'before': {
      const n = isDate(item.writtenOn) && isDate(box.partDate) ? daysBetween(item.writtenOn, box.partDate) : null
      const before = n === null ? '' : n <= 0 ? 'The last day before you left' : n === 1 ? '1 day before you left' : `${n} days before you left`
      // the time it was written, when the diary kept it ("December 30, 2025, 11:40 PM")
      const at = String(item.date || '').match(/,\s*(\d{1,2}:\d{2}\s*(?:[AaPp]\.?[Mm]\.?)?)\s*$/)?.[1] || ''
      return done('diary', { weekday: weekday(item.writtenOn), date: [longDate(item.writtenOn), at].filter(Boolean).join(', '), before }, [], { info: 'Written in the days before', design: 'a diary page with the day it was written' })
    }
    case 'tonight': {
      const parting = pins.find((p) => p.kind === 'parting')
      const { place, date: partedOn } = splitSub(parting?.sub)
      const kind = transportOf(box, pins)
      const longest = Math.max(String(box.toName || '').length, String(box.fromName || '').length)
      return done('ticket', { kind, wide: longest > 10, name: TICKET_NAMES[kind] || 'Ticket', color: TICKETS[kind]?.color || '', passenger: box.toName || '', from: box.fromName || '', departs: shortDate(box.partDate || item.opensOn), returns: shortDate(box.returnDate), place: [place, partedOn].filter(Boolean).join(', ') }, parting ? [parting] : [], { info: kind ? `The night you part, and how you travel (${kind})` : 'The night you part', design: `a ${(TICKET_NAMES[kind] || 'ticket stub').toLowerCase()} with your names and dates` })
    }
    case 'anytime':
      return done('envelope', { reason: openWhenReason(item.label), to, from: box.fromName || '', ...(box.seal ? { seal: box.seal } : {}) }, [], { info: `“${item.label}”`, design: 'an envelope with that reason written on it' })
    case 'never':
      return done('folded', {}, [], { info: 'Something never said out loud', design: 'a note folded in four' })
    case 'occasions':
      return done('card', { day: longDate(item.opensOn), label: item.label || '' }, [], { info: item.label || 'A special day', design: 'a card for that day' })
    default:
  }

  const quote = pins.find((p) => p.kind === 'quote' && p.text)
  if (quote) return done('saying', { text: quote.text, who: whoSays(quote.sub, box) }, [quote], { info: `“${quote.text}”`, design: 'the saying, written large at the top' })

  const memory = pins.find((p) => p.kind === 'memory' && p.text)
  if (memory) {
    const { place, date } = splitSub(memory.sub)
    if (place || date) {
      const stamp = (box.stamps || []).find((s) => s.memory === memory.ref)
      const sticker = stamp?.sticker || (item.stickers || [])[0] || null
      return done('postcard', { title: memory.text, place, mark: markPlace(place), date, iso: toIso(date), to, from: box.fromName || '', sticker }, [memory], { info: `“${memory.text}”`, design: `a postcard${place ? ` from ${place}` : ''}` })
    }
  }

  const stats = pins.filter((p) => p.kind === 'stat' && p.text)
  const months = (box.months || []).filter((m) => m && /^\d{4}-\d{2}$/.test(m.month) && Number.isFinite(m.count))
  if (stats.length) return done('tally', { rows: stats.slice(0, 4).map((p) => ({ num: p.text, sub: p.sub || '' })), ...(months.length >= 6 ? { months: months.slice(-48), span: [monthName(months[Math.max(0, months.length - 48)].month), monthName(months[months.length - 1].month)] } : {}) }, stats.slice(0, 4), { info: 'Numbers from your messages', design: 'set like a receipt at the top' })

  // a letter on the rhythm with nothing pinned: a leaf of their own calendar, how far into the time apart it opens
  if (item.section === 'scheduled' && isDate(item.opensOn) && isDate(box.partDate) && isDate(box.returnDate)) {
    const total = daysBetween(box.partDate, box.returnDate)
    const gone = daysBetween(box.partDate, item.opensOn)
    if (total > 0 && gone >= 0 && gone <= total) {
      const weeks = Math.max(1, Math.round(total / 7))
      const left = total - gone
      return done('leaf', {
        weeks: Math.min(weeks, 52),
        filled: Math.min(weeks, Math.round(gone / 7)),
        left: left === 0 ? 'Today you meet again' : left < 14 ? `${left} ${left === 1 ? 'day' : 'days'} to go` : `${Math.round(left / 7)} weeks to go`,
        date: longDate(item.opensOn),
      }, [], { info: `Opens ${longDate(item.opensOn)}, ${gone} days into your time apart`, design: 'a page of your time apart, with the weeks already behind you filled in' })
    }
  }

  return done('classic', {}, [], null)
}

// ── Margin notes (docs/letter-design-rules.md § Margin notes from their messages) ─────────────

const n = (v) => Number(v).toLocaleString('en-US')
const clockOf = (at) => {
  const m = String(at || '').match(/T(\d{2}):(\d{2})/)
  if (!m) return ''
  const h = Number(m[1])
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'a.m.' : 'p.m.'}`
}

/**
 * The notes from their chat that belong on this letter: at most two, the most particular first.
 * item: as in letterForm(); facts: box.look.facts (boxLook.chatFacts); form: letterForm()'s result.
 * Every note is a counted fact from their messages; nothing is estimated, nothing is written for them.
 */
export function marginNotes(item = {}, facts = null, form = null, box = {}) {
  if (!facts) return []
  const out = []
  const add = (note) => { if (note && out.length < 2 && !out.some((x) => x.id === note.id)) out.push(note) }
  const label = String(item.label || '').toLowerCase()
  const md = isDate(item.opensOn) ? item.opensOn.slice(5, 10) : ''
  const year = (iso) => String(iso).slice(0, 4)

  // on this day: the letter opens on the anniversary of the first message or of a moment they pinned
  if (md) {
    if (facts.first?.at && facts.first.at.slice(5, 10) === md && year(facts.first.at) < year(item.opensOn)) add({ id: 'onthisday', main: `On this day in ${year(facts.first.at)}`, sub: 'your very first message' })
    const m = (facts.moments || []).find((x) => x.date.slice(5, 10) === md && year(x.date) < year(item.opensOn))
    if (m) add({ id: 'onthisday', main: `On this day in ${year(m.date)}`, sub: m.title })
  }

  const late = () => facts.late && add({ id: 'late', main: `${clockOf(facts.late.at)} “${facts.late.text}”`.trim(), sub: `the latest you two stayed up${facts.late.at ? `, ${shortDate(facts.late.at)}` : ''}` })
  switch (item.section) {
    case 'tonight':
      if (facts.goodnight >= 3) add({ id: 'goodnight', main: `Good night no. ${n(facts.goodnight + 1)}`, sub: `after ${n(facts.goodnight)} in your messages` })
      break
    case 'last':
      if (facts.loveYou >= 2) add({ id: 'loveyou', main: `“I love you”, ${n(facts.loveYou)} times`, sub: 'typed before today' })
      break
    case 'never':
      if (facts.first?.role && facts.first.at) add({ id: 'whofirst', main: facts.first.role === 'them' ? 'You sent the first message' : 'I sent the first message', sub: shortDate(facts.first.at) })
      break
    case 'anytime':
      if (/miss/.test(label) && facts.missYou >= 2) add({ id: 'miss', main: `“I miss you”, ${n(facts.missYou)} times`, sub: 'typed in your messages' })
      if (/laugh|smile|bad day|sad|down/.test(label) && facts.laugh >= 3) add({ id: 'laugh', main: `${n(facts.laugh)} laughs`, sub: 'in your messages' })
      if (/sleep|awake|night|late/.test(label)) late()
      if (facts.words?.length && box.firstAnytime === item.id) add({ id: 'word', main: `“${facts.words[0].word}”, ${n(facts.words[0].count)} times`, sub: 'what you call each other' })
      break
    case 'scheduled':
      if (box.firstScheduled === item.id && facts.first?.text) add({ id: 'first', main: `“${facts.first.text}”`, sub: `the first message${facts.first.at ? `, ${shortDate(facts.first.at)}` : ''}` })
      if (form?.form === 'leaf' && isDate(facts.from) && isDate(item.opensOn)) {
        const d = daysBetween(facts.from, item.opensOn) + 1
        if (d > 1) add({ id: 'day', main: `Day ${n(d)}`, sub: 'since your first message' })
      }
      break
    default:
  }
  if (item.voice && facts.voices) add({ id: 'voice', main: `Voice note no. ${n(facts.voices + 1)}`, sub: `after ${n(facts.voices)} in your chat` })
  if (item.photo && facts.photos) add({ id: 'photo', main: `Photo no. ${n(facts.photos + 1)}`, sub: `after ${n(facts.photos)} in your chat` })
  return out
}

/** The first letter on the rhythm and the first "open when": they carry the first message and their word. */
export function firstsOf(items = []) {
  return { firstScheduled: items.find((i) => i.section === 'scheduled')?.id, firstAnytime: items.find((i) => i.section === 'anytime')?.id }
}
