/**
 * journey.js — the letter box laid out as one walk through time, and the numbers for "Until we meet".
 * Plain functions over the recipient view (no React, no browser APIs).
 */
import { daysBetween, formatLong } from '../../utils/diary.js'
import { moonOn } from '../../utils/sky.js'

const byDate = (a, b) => (a.date || '9999').localeCompare(b.date || '9999')

/**
 * The path, in the order time walks it: the days before → tonight → while apart (with special days
 * where they fall) → the day we meet again. Each unit is a banner and its nodes.
 * Letters that open any time are not on the path; they have their own shelf.
 */
export function buildPath(items, box) {
  const part = box.partDate
  const before = items
    .filter((i) => i.section === 'before')
    .map((i) => {
      const written = i.writtenOn || null
      const n = written && part ? daysBetween(written, part) : null
      return { item: i, kind: 'before', date: written, badge: n === null ? 'D' : n <= 0 ? 'D-day' : `D-${n}`, caption: i.date || '' }
    })
    .sort(byDate)

  const tonight = items.filter((i) => i.section === 'tonight').map((i) => ({ item: i, kind: 'tonight', date: i.opensOn, badge: 'Tonight', caption: i.opensOn ? formatLong(i.opensOn) : '' }))
  const apart = items
    .filter((i) => i.section === 'scheduled' || i.section === 'occasions')
    .map((i) => ({ item: i, kind: i.section === 'occasions' ? 'occasion' : 'scheduled', date: i.opensOn, badge: i.label, caption: i.opensOn ? formatLong(i.opensOn) : '' }))
    .sort(byDate)
  const last = items.filter((i) => i.section === 'last').map((i) => ({ item: i, kind: 'last', date: i.opensOn, badge: 'Reunion', caption: i.opensOn ? formatLong(i.opensOn) : '' }))

  const units = [
    { id: 'before', title: 'The days before', sub: `Written in secret before ${box.fromName || 'they'} left`, nodes: before },
    { id: 'tonight', title: 'The night we part', sub: 'One letter for tonight', nodes: tonight },
    { id: 'apart', title: 'While we’re apart', sub: 'One more is always on its way', nodes: apart },
    { id: 'last', title: 'The day we meet again', sub: 'Sealed until the very end', nodes: last },
  ].filter((u) => u.nodes.length)
  return units
}

/**
 * The node the walk is on: the first letter that is open and unread, else the one that opens soonest.
 * Soonest, not next on the path: a diary entry from D-14 can open after one from D-1.
 */
export function currentNodeId(units, openSet) {
  const nodes = units.flatMap((u) => u.nodes)
  const fresh = nodes.find((n) => n.item.open && !n.item.empty && !openSet.has(n.item.id))
  if (fresh) return fresh.item.id
  const sealed = nodes.filter((n) => !n.item.open).sort((a, b) => (a.item.opensOn || '9999').localeCompare(b.item.opensOn || '9999'))
  return sealed.length ? sealed[0].item.id : null
}

/** Sideways offset for the i-th node, in units of the node size: a gentle S that never repeats a column twice. */
const WAVE = [0, -0.55, -0.9, -0.55, 0, 0.55, 0.9, 0.55]
export const offsetFor = (i) => WAVE[i % WAVE.length]

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** Full moons whose night falls after `from` and on or before `to`. */
export function fullMoonsBetween(from, to) {
  const out = []
  if (!from || !to || to <= from) return out
  let prev = moonOn(from).phase
  for (let day = addDays(from, 1); day <= to; day = addDays(day, 1)) {
    const p = moonOn(day).phase
    if (prev < 0.5 && p >= 0.5) out.push(day)
    prev = p
    if (out.length > 60) break
  }
  return out
}

/** Midnight at the start of an ISO date, local time. */
const localMidnight = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

/**
 * Everything "Until we meet" shows. `now` is a timestamp, `today` the recipient's ISO date.
 * Without a reunion date it counts the time since parting instead.
 */
export function untilStats(box, today, now, items = []) {
  const part = box.partDate
  const ret = box.returnDate
  if (!ret || today > ret) {
    const since = part && today >= part ? daysBetween(part, today) : null
    return { mode: ret ? 'after' : 'open', since, fullMoons: part ? fullMoonsBetween(part, today).length : 0 }
  }
  const msLeft = Math.max(0, localMidnight(ret) - now)
  const hoursLeft = Math.floor(msLeft / 3600000)
  const daysLeft = daysBetween(today, ret)
  const total = part ? Math.max(1, localMidnight(ret) - localMidnight(part)) : null
  const elapsed = part ? Math.min(1, Math.max(0, (now - localMidnight(part)) / total)) : null
  const moons = fullMoonsBetween(today, ret)
  return {
    mode: today < (part || today) ? 'before' : 'apart',
    daysLeft,
    weeks: Math.floor(daysLeft / 7),
    weekDays: daysLeft % 7,
    hoursLeft,
    elapsed,
    daysTotal: part ? daysBetween(part, ret) : null,
    fullMoons: moons,
    lookback: lookback(box, today, daysLeft, items),
  }
}

/**
 * "As far back as the time still ahead": the day as long ago as the reunion is away,
 * and what happened then, from what the box actually knows.
 */
export function lookback(box, today, daysLeft, items) {
  if (!daysLeft || daysLeft < 1) return null
  const day = addDays(today, -daysLeft)
  // the closest moment the box knows of, on or before today
  const near = (d) => d && d <= today
  const events = []
  for (const t of box.timeline || []) if (near(t.date)) events.push({ date: t.date, text: t.label, kind: 'story' })
  for (const i of items) {
    if (i.section === 'before' && near(i.writtenOn)) events.push({ date: i.writtenOn, text: `${box.fromName || 'They'} wrote “${i.label}” for you, in secret.`, kind: 'diary' })
    if (i.opensOn && i.open && near(i.opensOn) && i.section !== 'before') events.push({ date: i.opensOn, text: `“${i.label}” arrived.`, kind: 'letter' })
  }
  if (box.partDate && near(box.partDate)) events.push({ date: box.partDate, text: 'You said goodbye.', kind: 'part' })
  events.sort((a, b) => Math.abs(daysBetween(a.date, day)) - Math.abs(daysBetween(b.date, day)))

  let where = ''
  if (box.partDate) {
    const n = daysBetween(day, box.partDate)
    where = n > 1 ? `${n} days before you said goodbye` : n === 1 ? 'the day before you said goodbye' : n === 0 ? 'the day you said goodbye' : `day ${-n} apart`
  }
  const event = events[0] ? { ...events[0], gap: daysBetween(day, events[0].date) } : null
  return { day, where, event }
}
