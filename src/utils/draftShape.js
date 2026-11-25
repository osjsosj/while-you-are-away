/**
 * draftShape.js — makes a saved draft safe to read, whatever is in storage.
 * A draft can come back damaged (an old version of the app, a half-written save, a hand-edited
 * browser, a bad sync). Every page reads it through getDraft(), so it is cleaned once here:
 * a field of the wrong kind is dropped (the page then treats it as not filled in yet), never guessed.
 * Nothing the sender wrote is changed; only shapes that no page could read are let go.
 */

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const isStr = (v) => typeof v === 'string'
const isISO = (v) => {
  if (!isStr(v) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

const OBJECTS = ['phase1', 'phase2', 'generatedConfig', 'decor', 'capsuleData', 'story', 'plan', 'film', 'signature']
const ARRAYS = ['diary', 'interviewChat']

function keepObjects(list) {
  return Array.isArray(list) ? list.filter(isObj) : undefined
}

function cleanPhase1(p) {
  const out = { ...p }
  for (const k of ['fromName', 'toName', 'relationship', 'situation', 'reason']) if (k in out && !isStr(out[k])) delete out[k]
  for (const k of ['startDate', 'endDate']) if (k in out && !isISO(out[k])) delete out[k]
  return out
}

function cleanCapsules(c) {
  const out = {}
  for (const [id, v] of Object.entries(c)) {
    if (!isObj(v)) continue
    const x = { ...v }
    if ('letter' in x && !isStr(x.letter)) delete x.letter
    if ('note' in x && !isStr(x.note)) delete x.note
    if ('pins' in x) { const pins = keepObjects(x.pins); if (pins) x.pins = pins; else delete x.pins }
    out[id] = x
  }
  return out
}

function cleanStory(s) {
  const out = { ...s }
  for (const k of ['memories', 'catchphrases', 'partings']) {
    if (k in out) { const list = keepObjects(out[k]); if (list) out[k] = list; else delete out[k] }
  }
  if ('stats' in out) {
    if (!isObj(out.stats)) delete out.stats
    else if ('byMonth' in out.stats && !Array.isArray(out.stats.byMonth)) out.stats = { ...out.stats, byMonth: [] }
  }
  for (const k of ['about', 'callEachOther']) if (k in out && !isStr(out[k])) delete out[k]
  return out
}

function cleanPlan(p) {
  const out = { ...p }
  for (const k of ['anytime', 'neverSaid', 'occasions']) {
    if (k in out) { const list = keepObjects(out[k]); if (list) out[k] = list; else delete out[k] }
  }
  if ('scheduled' in out && !isObj(out.scheduled)) delete out.scheduled
  return out
}

/** A draft every page can read. Unknown keys pass through untouched. */
export function cleanDraft(raw) {
  if (!isObj(raw)) return {}
  const d = { ...raw }
  for (const k of OBJECTS) if (k in d && !isObj(d[k])) delete d[k]
  for (const k of ARRAYS) if (k in d && !Array.isArray(d[k])) delete d[k]
  if (d.phase1) d.phase1 = cleanPhase1(d.phase1)
  if (d.capsuleData) d.capsuleData = cleanCapsules(d.capsuleData)
  if (d.story) d.story = cleanStory(d.story)
  if (d.plan) d.plan = cleanPlan(d.plan)
  if (d.diary) d.diary = d.diary.filter((e) => isObj(e) && isISO(e.writtenOn)).map((e) => (('body' in e && !isStr(e.body)) ? { ...e, body: '' } : e))
  if (d.interviewChat) d.interviewChat = d.interviewChat.filter((m) => isObj(m) && isStr(m.content) && (m.role === 'user' || m.role === 'assistant'))
  return d
}
