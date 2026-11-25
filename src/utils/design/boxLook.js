/**
 * boxLook.js — the recipient box dressed from the senders' story (see storyDesign.js).
 *
 * What the recipient can see is only ever built from what the sender chose:
 *  - colors come from the findings pinned on letters the sender wrote, and the things they told the
 *    planning guide are theirs (abstract: a tint, not words)
 *  - stamps and path stickers come only from moments pinned on letters already open, so they
 *    arrive one by one as letters open, never ahead of them
 *  - the pattern is their months of messages, which the recipient was half of
 * The trace (which fact made which choice) stays with the sender. Pure: runs on the server too.
 */
import { letterForm } from './letterForm.js'
import { designFromStory, appTheme, mix } from './storyDesign.js'
import { storyFromDraft } from '../story.js'

const RELATIONSHIP = { 'a partner': 'partner', 'a parent': 'parent', 'a child': 'child', 'a friend': 'friend' }

/** The story storyDesign expects, from a draft and the letters that will be shown. */
export function designStory(draft, items) {
  const story = storyFromDraft(draft) // the chat story and the planning talk together
  if (!story) return null
  const p1 = draft.phase1 || {}
  const pinsOf = (list) => list.flatMap((it) => (Array.isArray(it.content?.pins) ? it.content.pins : []))
  const written = pinsOf(items)
  const refs = (pins, kind) => new Set(pins.filter((p) => p.kind === kind).map((p) => p.ref))
  const memIds = refs(written, 'memory')
  const quoteIds = refs(written, 'quote')
  // a letter started from a finding carries it as its first pin, so this also covers letters made in advance
  return {
    from: p1.fromName || '',
    to: p1.toName || '',
    relationship: RELATIONSHIP[String(p1.relationship || '').toLowerCase()] || 'friend',
    mood: draft.decor?.style || draft.generatedConfig?.style || 'night',
    // what they call each other, for the seal: the first name of the ones they gave, if it's short
    nicknames: [String(story.callEachOther || '').split(/[,·/]| and |과 |와 /)[0].trim()].filter((n) => n && [...n].length <= 10),
    catchphrases: story.catchphrases.filter((c) => quoteIds.has(c.id)),
    memories: story.memories.filter((m) => memIds.has(m.id)),
    partings: story.partings,
    colorWords: story.colorWords,
    stats: story.stats || {},
    letters: [],
  }
}

/**
 * The look sent with the box: CSS variables, the stamps and stickers of moments already open,
 * and the pattern of their months. null when there is no story (the box keeps its usual look).
 */
export function boxLook(draft, items, isOpen) {
  const st = designStory(draft, items)
  if (!st) return null
  const spec = designFromStory(st, Number(draft.lookVariant) || 0)
  const openMem = new Set(items.filter(isOpen).flatMap((it) => (it.content?.pins || []).filter((p) => p.kind === 'memory').map((p) => p.ref)))
  const stamps = spec.stamps.filter((s) => openMem.has(s.memory)).map(({ memory, sticker, text, date, color, tilt }) => ({ memory, sticker, text, date, color, tilt }))
  const months = (st.stats.byMonth || []).filter((m) => m && /^\d{4}-\d{2}$/.test(m.month)).map((m) => ({ month: m.month, count: Number(m.count) || 0 }))
  return {
    theme: appTheme(spec),
    typeKey: spec.typeKey,
    art: spec.art,
    palette: { accent: spec.palette.accent, accent2: spec.palette.accent2, accentRaw: spec.palette.accentRaw, accent2Raw: spec.palette.accent2Raw, ink: spec.palette.ink },
    pattern: { kind: spec.pattern.kind, months, calls: Number(st.stats.callMinutes) || 0, late: 0 },
    seal: spec.seal,
    stamps,
    // the letter paper: tint, age, ruling, stain, and the faces it is written in
    paper: {
      tint: mix(spec.palette.paper, '#E8D7B0', spec.paper.grain * 0.35),
      ink: spec.palette.ink,
      line: spec.palette.line,
      grain: Math.round(spec.paper.grain * 100) / 100,
      lines: spec.paper.lines,
      stain: spec.paper.stain,
      faces: { title: spec.type.title, body: spec.type.body, hand: spec.type.hand },
      accent: spec.palette.accent,
    },
  }
}

/**
 * For the sender only: which part of their story made which choice, in plain words, plus the look
 * itself for a small preview. Built from the same rules as the box, from letters written so far.
 */
export function explainLook(draft, written) {
  const st = designStory(draft, written)
  if (!st) return null
  const spec = designFromStory(st, Number(draft.lookVariant) || 0)
  const look = boxLook(draft, written, () => true)
  // only what the box actually shows (the lab also tries per-letter decorations, edges and a goodbye map)
  const lines = spec.trace.filter((t) => !/^The letter /.test(t.info) && !/edge$|map of your goodbyes/.test(t.design))
  return { look, lines: [...lines, ...formLines(draft, written, look)] }
}

/** One line per letter form the box uses, from the first letter that called for it (docs/letter-design-rules.md § 1). */
function formLines(draft, written, look) {
  const p1 = draft.phase1 || {}
  const ctx = { fromName: p1.fromName, toName: p1.toName, partDate: p1.startDate, returnDate: p1.endDate, nickname: look?.seal?.text, seal: look?.seal, stamps: look?.stamps }
  const seen = new Map()
  for (const it of written) {
    const f = letterForm({ ...it, pins: it.content?.pins || [] }, ctx)
    if (f.form === 'classic' || !f.why[0]) continue
    const e = seen.get(f.form)
    if (e) e.n++
    else seen.set(f.form, { ...f.why[0], n: 1 })
  }
  return [...seen.values()].map((w) => ({ info: w.n > 1 ? `${w.info}, and ${w.n - 1} more like it` : w.info, design: w.design }))
}
