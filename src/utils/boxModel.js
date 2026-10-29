/**
 * boxModel.js — turns a sender's draft into what the recipient may see on a given day.
 * Runs on the server (/api/box) so locked letters never leave it.
 */
import { stampFor, formatLong, daysBetween, normalizeUnlock } from './diary.js'
import { buildPetConfig } from './htmlGenerator.js'
import { getPlan, planSlots } from './plan.js'

export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)

/** Every item in the box with its unlock date (null = open any time). Content not filtered yet. */
export function allItems(draft) {
  const phase1 = draft.phase1 || {}
  const phase2 = draft.phase2 || {}
  const caps = draft.capsuleData || {}
  const start = isISO(phase1.startDate) ? phase1.startDate : null
  const items = []

  const end = isISO(phase1.endDate) ? phase1.endDate : null
  for (const slot of planSlots(getPlan(draft), start, end)) {
    items.push({ ...slot, hint: slot.hint || '', content: caps[slot.id] || {} })
  }

  const unlock = normalizeUnlock(draft.diaryUnlock || phase2.diaryUnlock)
  ;(Array.isArray(draft.diary) ? draft.diary : [])
    .filter((e) => e && e.writtenOn && (e.body || e.photo || e.voice || e.video))
    .forEach((e) => {
      const before = start ? Math.max(0, daysBetween(e.writtenOn, start)) : 0
      items.push({
        id: `d:${e.id}`,
        section: 'before',
        label: e.title || stampFor(e.writtenOn, start || '', 'I'),
        stamp: stampFor(e.writtenOn, start || '', 'I'),
        date: formatLong(e.writtenOn) + (e.writtenTime ? `, ${e.writtenTime}` : ''),
        writtenOn: e.writtenOn,
        opensOn: unlock === 'mirror' && start ? addDays(start, before) : null,
        content: { letter: e.body || '', prompt: e.prompt || '', photo: e.photo || null, voice: e.voice || null, video: e.video || null },
      })
    })
  return items
}

const MEDIA_FIELDS = ['photo', 'voice', 'video']

/**
 * The recipient's view for `today` (their local date). Locked items keep only their label and date.
 * Returns media refs that the caller turns into signed URLs.
 */
export function recipientView(draft, today) {
  const phase1 = draft.phase1 || {}
  const phase2 = draft.phase2 || {}
  const config = draft.generatedConfig || {}
  const items = allItems(draft).map((it) => {
    const open = !it.opensOn || it.opensOn <= today
    const base = { id: it.id, section: it.section, label: it.label, hint: it.hint || '', emoji: it.emoji || '', opensOn: it.opensOn, open }
    if (it.section === 'before') Object.assign(base, { stamp: it.stamp, date: it.date })
    if (!open) return base
    const c = it.content || {}
    const out = { ...base, letter: c.letter || '', prompt: c.prompt || '' }
    for (const f of MEDIA_FIELDS) if (c[f]) out[f] = c[f]
    out.empty = !out.letter && !MEDIA_FIELDS.some((f) => out[f])
    return out
  })
  // letters the sender never wrote stay hidden; sealed ones keep only their label and date
  const visible = items.filter((it) => (it.open ? !it.empty : true))

  return {
    box: {
      appName: config.chosenName || 'Your letter box',
      welcome: config.welcomeMessage || '',
      fromName: phase1.fromName || '',
      toName: phase1.toName || '',
      partDate: isISO(phase1.startDate) ? phase1.startDate : null,
      returnDate: isISO(phase1.endDate) ? phase1.endDate : null,
      theme: config.theme || null,
      accent: typeof draft.accent === 'string' && /^#[0-9a-f]{6}$/i.test(draft.accent) ? draft.accent : null,
      pet: buildPetConfig(phase2),
      timeline: (phase2.timeline || []).filter((t) => t && t.label).map((t) => ({ date: t.date || '', label: t.label, emoji: t.emoji || '' })),
    },
    items: visible,
  }
}

/** Accept the recipient's local date only if it is within a day of the server's UTC date. */
export function trustedToday(clientDate, now = new Date()) {
  const utc = now.toISOString().slice(0, 10)
  if (!isISO(clientDate)) return utc
  const diff = daysBetween(utc, clientDate)
  return Math.abs(diff) <= 1 ? clientDate : utc
}
