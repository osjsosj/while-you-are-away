/**
 * plan.js — which letters a letter box holds and when each one opens.
 * The AI interview proposes a plan from the situation; the sender can change anything.
 * Older drafts (before plans existed) are read from phase1/phase2 so nothing breaks.
 */

export const SCHEDULES = {
  daily: { label: 'Every day', unit: 'Day', step: 1 },
  weekly: { label: 'Every week', unit: 'Week', step: 7 },
  biweekly: { label: 'Every two weeks', unit: 'Letter', step: 14 },
}

export const SECTION_INFO = {
  tonight: { title: 'Tonight', blurb: 'One letter for the night you part. It opens that day.' },
  before: { title: 'The days before', blurb: 'Moments you collect before you part.' },
  scheduled: { title: 'While we’re apart', blurb: 'Letters that open on a rhythm, so there’s always one more coming.' },
  never: { title: 'Things I never said', blurb: 'The stories you both know and the words you never quite said.' },
  anytime: { title: 'Open when…', blurb: 'For a bad day, a sleepless night, a moment worth sharing. They can open these any time.' },
  occasions: { title: 'Special days', blurb: 'Birthdays, holidays, anniversaries, a graduation. Each opens on its day.' },
  last: { title: 'The day we meet again', blurb: 'Sealed until the very end.' },
}

const SCHEDULE_FROM_LEGACY = { 'Every day': 'daily', 'Every week': 'weekly', 'Every two weeks': 'biweekly' }
const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const clean = (s, n = 80) => (typeof s === 'string' ? s.trim().slice(0, n) : '')

function list(arr, prefix) {
  const used = new Set()
  return (Array.isArray(arr) ? arr : [])
    .filter((x) => x && clean(x.label))
    .slice(0, 40)
    .map((x, i) => {
      let id = typeof x.id === 'string' && x.id.startsWith(prefix) ? x.id : `${prefix}${i}`
      while (used.has(id)) id = `${prefix}${i}-${used.size}`
      used.add(id)
      return { id, label: clean(x.label), hint: clean(x.hint, 120), ...(isISO(x.date) ? { date: x.date } : {}) }
    })
}

export function normalizePlan(raw = {}) {
  const sched = raw.scheduled || {}
  const schedule = SCHEDULES[sched.schedule] ? sched.schedule : 'weekly'
  const count = Math.max(0, Math.min(120, Math.round(Number(sched.count) || 0)))
  return {
    scheduled: { enabled: !!sched.enabled && count > 0, schedule, count },
    anytime: list(raw.anytime, 's'),
    neverSaid: list(raw.neverSaid, 'n'),
    occasions: list(raw.occasions, 'o').filter((o) => o.date),
    tonight: raw.tonight !== false,
    last: raw.last !== false,
  }
}

/** The draft's plan, or one rebuilt from an older draft's answers. */
export function getPlan(draft = {}) {
  if (draft.plan) return normalizePlan(draft.plan)
  const p1 = draft.phase1 || {}
  const p2 = draft.phase2 || {}
  const cfg = draft.generatedConfig || {}
  return normalizePlan({
    scheduled: { enabled: Number(p1.regularCount) > 0, schedule: SCHEDULE_FROM_LEGACY[p1.unlockSchedule] || 'weekly', count: Number(p1.regularCount) || 0 },
    anytime: p2.situationLabels || cfg.situationLabels || [],
    neverSaid: [],
    occasions: [],
    tonight: false,
    last: false,
  })
}

/** Suggested count of scheduled letters for a schedule between two dates. */
export function suggestedCount(schedule, startDate, endDate) {
  if (!isISO(startDate) || !isISO(endDate)) return schedule === 'daily' ? 30 : 10
  const days = Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86400000)
  const step = (SCHEDULES[schedule] || SCHEDULES.weekly).step
  return Math.max(1, Math.min(120, Math.floor(days / step)))
}

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/**
 * Every letter slot the plan defines, in reading order, with its unlock date.
 * `start` = the day they part, `end` = the day they meet again (either may be missing).
 */
export function planSlots(plan, start, end) {
  const s = isISO(start) ? start : null
  const e = isISO(end) ? end : null
  const out = []
  if (plan.tonight) out.push({ id: 't0', section: 'tonight', label: 'Read this tonight', opensOn: s })
  if (plan.scheduled.enabled) {
    const { unit, step } = SCHEDULES[plan.scheduled.schedule]
    for (let i = 0; i < plan.scheduled.count; i++) {
      const offset = plan.scheduled.schedule === 'daily' ? i + 1 : (i + 1) * step
      out.push({ id: `w${i}`, section: 'scheduled', label: `${unit} ${i + 1}`, opensOn: s ? addDays(s, offset) : null })
    }
  }
  plan.neverSaid.forEach((n) => out.push({ id: n.id, section: 'never', label: n.label, hint: n.hint, opensOn: null }))
  plan.anytime.forEach((a) => out.push({ id: a.id, section: 'anytime', label: a.label, hint: a.hint, opensOn: null }))
  plan.occasions.forEach((o) => out.push({ id: o.id, section: 'occasions', label: o.label, hint: o.hint, opensOn: o.date }))
  if (plan.last && e) out.push({ id: 'l0', section: 'last', label: 'The day we meet again', opensOn: e })
  return out
}
