/**
 * sample.js — the parts of a long chat worth showing the AI, within a character budget.
 * A few years of messages can run to megabytes; the planning guide needs the moments, not all of it.
 * Input: messages from withRoles(). Output text uses the names the sender confirmed, never raw ids.
 */
import { PHRASES } from './stats.js'

const MAX_LINE = 300

/** Windows of message indexes, most important first. */
function windows(msgs, keyDates) {
  const out = []
  const add = (start, end, why) => out.push({ start: Math.max(0, start), end: Math.min(msgs.length - 1, end), why })
  if (!msgs.length) return out

  add(0, 39, 'how it started')

  // special days the sender named (birthdays, the first date…)
  for (const d of keyDates) {
    const idx = msgs.findIndex((m) => m.at && m.at.slice(0, 10) === d)
    if (idx >= 0) add(idx - 5, idx + 30, `on ${d}`)
  }

  // the three busiest days
  const perDay = new Map()
  msgs.forEach((m, i) => {
    if (!m.at) return
    const d = m.at.slice(0, 10)
    const e = perDay.get(d) || { d, first: i, n: 0 }
    e.n++
    perDay.set(d, e)
  })
  for (const e of [...perDay.values()].sort((a, b) => b.n - a.n).slice(0, 3)) add(e.first, e.first + Math.min(e.n, 50) - 1, `busiest day ${e.d}`)

  // moments with feeling in them, spread across the whole chat
  const hits = []
  msgs.forEach((m, i) => {
    if (m.kind === 'text' && (PHRASES.missYou.test(m.text) || PHRASES.loveYou.test(m.text) || PHRASES.thanks.test(m.text) || PHRASES.sorry.test(m.text))) hits.push(i)
  })
  const step = Math.max(1, Math.floor(hits.length / 40))
  for (let k = 0; k < hits.length; k += step) add(hits[k] - 3, hits[k] + 3, 'a feeling')

  add(msgs.length - 30, msgs.length - 1, 'most recent')

  // everyday texture: short slices at even intervals
  const slices = 30
  for (let k = 1; k < slices; k++) {
    const i = Math.floor((msgs.length * k) / slices)
    add(i, i + 9, 'an ordinary day')
  }
  return out
}

function line(m, names) {
  const who = names[m.role] || m.author
  const body = m.kind === 'text' ? m.text.replace(/\s+/g, ' ').slice(0, MAX_LINE) : m.kind === 'call' ? `[call: ${m.text}]` : `[${m.kind}]`
  return `${m.at ? m.at.replace('T', ' ') : ''} ${who}: ${body}`.trim()
}

/**
 * Text for the AI: chosen windows in time order, gaps marked with "…".
 * `names` maps role → display name ({ me: 'Haeun', them: 'Minjun' }); other people keep their own names.
 * `keyDates` are ISO days the sender mentioned. Windows are taken in priority order until `budget` runs out.
 */
export function pickExcerpts(messages, { budget = 60000, names = {}, keyDates = [] } = {}) {
  // call records only matter when the call connected; missed and cancelled ones would crowd out real messages
  const msgs = messages.filter((m) => m.kind !== 'system' && m.kind !== 'deleted' && !(m.kind === 'call' && !/\d:\d{2}$/.test(m.text)))
  const keep = new Set()
  let chars = 0
  for (const w of windows(msgs, keyDates)) {
    const fresh = []
    let cost = 0
    for (let i = w.start; i <= w.end; i++) {
      if (keep.has(i)) continue
      fresh.push(i)
      cost += line(msgs[i], names).length + 1
    }
    if (!fresh.length) continue
    if (chars + cost > budget) {
      if (chars > budget * 0.9) break
      continue // a smaller window later may still fit
    }
    fresh.forEach((i) => keep.add(i))
    chars += cost
  }
  const idx = [...keep].sort((a, b) => a - b)
  const lines = []
  idx.forEach((i, k) => {
    if (k > 0 && i !== idx[k - 1] + 1) lines.push('…')
    lines.push(line(msgs[i], names))
  })
  return { text: lines.join('\n'), messages: idx.length, of: msgs.length }
}
