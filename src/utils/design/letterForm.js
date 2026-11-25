/**
 * letterForm.js — which paper form a letter takes, and the facts its head carries.
 * The rules are in docs/letter-design-rules.md: composition comes from what the letter carries
 * (its kind, its pins, the story), never from chance, and a slot with no fact is left out.
 * Pure functions: no DOM, no React. LetterForms.jsx draws the heads.
 */
import { hash } from './storyDesign.js'

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

/** "Apr 2, 2023" → "2023-04-02" for the postmark; '' when it isn't a full date. */
export function toIso(text) {
  if (isDate(text)) return String(text).slice(0, 10)
  if (!/\b(19|20)\d{2}\b/.test(String(text || ''))) return ''
  const d = new Date(text)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "Open when you can't sleep" → "you can't sleep"; any other label stays whole. */
export function openWhenReason(label) {
  const m = String(label || '').match(/^open (?:this )?when\s*(.*)$/i)
  return m ? m[1].replace(/[.…]+$/, '').trim() : String(label || '').trim()
}

const FORMS = ['sealed', 'diary', 'ticket', 'envelope', 'folded', 'card', 'saying', 'postcard', 'tally', 'leaf', 'classic']
export { FORMS }

/**
 * item: { id, section, label, opensOn, writtenOn, pins: [{ kind, ref, text, sub }], stickers }
 * box:  { fromName, toName, partDate, returnDate, nickname, seal: { text, initials, color }, stamps: [{ memory, sticker }], months: [{ month, count }] }
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
      return done('diary', { weekday: weekday(item.writtenOn), date: longDate(item.writtenOn), before }, [], { info: 'Written in the days before', design: 'a diary page with the day it was written' })
    }
    case 'tonight': {
      const parting = pins.find((p) => p.kind === 'parting')
      const { place } = splitSub(parting?.sub)
      return done('ticket', { passenger: box.toName || '', from: box.fromName || '', departs: shortDate(box.partDate || item.opensOn), returns: shortDate(box.returnDate), place }, parting ? [parting] : [], { info: 'The night you part', design: 'a boarding-pass stub with your names and dates' })
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
  if (quote) return done('saying', { text: quote.text, who: quote.sub || '' }, [quote], { info: `“${quote.text}”`, design: 'the saying, written large at the top' })

  const memory = pins.find((p) => p.kind === 'memory' && p.text)
  if (memory) {
    const { place, date } = splitSub(memory.sub)
    if (place || date) {
      const stamp = (box.stamps || []).find((s) => s.memory === memory.ref)
      const sticker = stamp?.sticker || (item.stickers || [])[0] || null
      return done('postcard', { title: memory.text, place, date, iso: toIso(date), to, from: box.fromName || '', sticker }, [memory], { info: `“${memory.text}”`, design: `a postcard${place ? ` from ${place}` : ''}` })
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
      }, [], { info: `Opens ${longDate(item.opensOn)}, ${gone} days into your time apart`, design: 'a leaf of your calendar, the weeks behind you filled in' })
    }
  }

  return done('classic', {}, [], null)
}
