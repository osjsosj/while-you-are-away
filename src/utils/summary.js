/**
 * summary.js — a short text picture of the letter box, given to the writing companion.
 * Kept under the server's summary limit.
 */
import { getPlan, planSlots, SECTION_INFO } from './plan'
import { normalizeFilm } from './film'

export const isFilled = (c) => !!(c && ((c.letter || '').trim() || c.photo || c.video || c.voice))

/** What the companion knows about the letter box right now. Short, so it fits the server limit. */
export function buildSummary(d) {
  const p1 = d.phase1 || {}
  const p2 = d.phase2 || {}
  const plan = getPlan(d)
  const caps = d.capsuleData || {}
  const lines = []
  lines.push(`From ${p1.fromName || '?'} to ${p1.toName || '?'} (${p1.relationship || 'someone they love'}).`)
  if (p1.situation) lines.push(`Situation: ${p1.situation}`)
  lines.push(`They part ${p1.startDate || '(date not set)'}${p1.endDate ? ` and meet again ${p1.endDate}` : ', no set date to meet again'}.`)
  const extra = [p2.relationshipWord && `they call each other "${p2.relationshipWord}"`, p2.nicknames && `nicknames: ${p2.nicknames}`, p2.symbols && `things that remind them of each other: ${p2.symbols}`, p2.special && `something only they share: ${p2.special}`].filter(Boolean)
  if (extra.length) lines.push(`About them: ${extra.join('; ')}.`.slice(0, 900))
  lines.push(`Letter box name: ${d.generatedConfig?.chosenName || p2.appName || '(none)'}`)
  lines.push('')
  lines.push('Letters (section · title · opens · status):')
  const slots = planSlots(plan, p1.startDate, p1.endDate)
  const emptyScheduled = []
  for (const s of slots) {
    const c = caps[s.id]
    const done = isFilled(c)
    if (s.section === 'scheduled' && !done) { emptyScheduled.push(s.label); continue }
    const media = c ? [c.photo && 'photo', c.video && 'video', c.voice && 'voice note'].filter(Boolean).join(', ') : ''
    const status = done ? `written${c.letter ? `: "${c.letter.trim().replace(/\s+/g, ' ').slice(0, 140)}"` : ''}${media ? ` [+ ${media}]` : ''}` : 'EMPTY'
    lines.push(`- ${SECTION_INFO[s.section].title} · ${s.label}${s.hint ? ` (${s.hint})` : ''} · ${s.opensOn || 'any time'} · ${status}`)
  }
  if (emptyScheduled.length) lines.push(`- ${SECTION_INFO.scheduled.title}: ${emptyScheduled.length} still EMPTY (${emptyScheduled.slice(0, 3).join(', ')}${emptyScheduled.length > 3 ? '…' : ''})`)
  const film = normalizeFilm(d.film)
  lines.push('')
  lines.push(film.photos.length
    ? `First-night film (plays before any letter): ${film.photos.length} photos${film.voice ? ' with a voice note' : ', no voice note yet'}. Lines: ${film.photos.map((p) => p.caption || '(none)').join(' / ').slice(0, 400)}`
    : 'First-night film (photos + a voice note that play the first time they open the box): not started.')
  const diary = Array.isArray(d.diary) ? d.diary : []
  if (diary.length) {
    lines.push('')
    lines.push('Moments collected before parting (these go in the box too):')
    diary.slice(-20).forEach((e) => {
      const media = [e.photo && 'photo', e.video && 'video', e.voice && 'voice'].filter(Boolean).join(', ')
      lines.push(`- ${e.writtenOn}${e.title ? ` "${e.title}"` : ''}: ${(e.body || '').replace(/\s+/g, ' ').slice(0, 120)}${media ? ` [${media}]` : ''}`)
    })
  }
  return lines.join('\n').slice(0, 8800)
}
