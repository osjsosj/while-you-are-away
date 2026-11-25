import { useMemo } from 'react'
import { allItems, isWritten } from '../utils/boxModel'
import { explainLook, designStory, chatFacts } from '../utils/design/boxLook'
import { letterForm, marginNotes, firstsOf } from '../utils/design/letterForm'
import { Seal, StoryStamp } from './StoryArt'
import { StickerArtContext } from '../utils/stickerArt'

/*
 * For the sender: how their box will look, and which part of their story made each choice.
 * The recipient never sees this list; they only see the result. "Dress it again" picks other
 * shades and tilts from the same story (draft.lookVariant).
 */
export default function DesignWhy({ draft, onVariant, onNotes = null }) {
  const ex = useMemo(() => {
    const written = allItems(draft).filter((it) => isWritten(it.content))
    return explainLook(draft, written)
  }, [draft])
  // the notes their chat puts in the letters' margins: a few examples, so the sender knows before turning them off
  const notes = useMemo(() => {
    const written = allItems(draft).filter((it) => isWritten(it.content))
    const facts = chatFacts(designStory(draft, written))
    if (!facts) return []
    const p1 = draft.phase1 || {}
    const ctx = { fromName: p1.fromName, toName: p1.toName, partDate: p1.startDate, returnDate: p1.endDate }
    const firsts = firstsOf(written)
    const out = []
    for (const it of written) {
      const item = { ...it, pins: it.content?.pins || [], voice: it.content?.voice, photo: it.content?.photo }
      for (const n of marginNotes(item, facts, letterForm(item, ctx), firsts)) if (out.length < 3 && !out.some((x) => x.id === n.id)) out.push({ ...n, on: it.label })
    }
    return out
  }, [draft])
  const notesOff = !!draft.decor?.off?.notes
  if (!ex?.look) return null
  const { look, lines } = ex
  const t = look.theme
  const swatches = [['Ground', t['--night']], ['Today’s letter', t['--lamp']], ['Paper', look.paper.tint], ['Ink', look.paper.ink]]

  return (
    <section className="we-why" aria-labelledby="we-why-h">
      <div className="we-why-top">
        <Seal seal={look.seal} size={52} />
        <div className="we-why-text">
          <h2 id="we-why-h" className="we-why-h">How {draft.phase1?.toName ? `${draft.phase1.toName}’s` : 'their'} box will look</h2>
          <p className="we-why-sub">Made from your story, so no other box looks quite like it.</p>
        </div>
      </div>
      <ul className="we-why-swatches" aria-label="Colors">
        {swatches.map(([name, c]) => (
          <li key={name}><span className="we-why-chip" style={{ background: c }} aria-hidden="true" />{name}</li>
        ))}
      </ul>
      {look.stamps.length > 0 && (
        <StickerArtContext.Provider value={look.art}>
          <div className="we-why-stamps" aria-label="Stamps that appear as their letters open">
            {look.stamps.slice(0, 5).map((s) => <StoryStamp key={s.memory} stamp={s} size={38} />)}
          </div>
        </StickerArtContext.Provider>
      )}
      <details className="we-why-more">
        <summary>Why it looks like this</summary>
        <ul>{lines.map((l, i) => <li key={i}><span>{l.info}</span><span className="we-why-arrow" aria-hidden="true">→</span><span>{l.design}</span></li>)}</ul>
        <p className="we-why-note">{draft.phase1?.toName || 'They'} won’t see this list, only the box. Stamps appear one by one as their letters open.</p>
      </details>
      {notes.length > 0 && onNotes && (
        <div className="we-why-notes">
          <div className="we-why-notes-top">
            <h3 id="we-why-notes-h">Notes from your messages</h3>
            <button type="button" role="switch" aria-checked={!notesOff} aria-labelledby="we-why-notes-h" className="gn-switch" onClick={() => onNotes(!notesOff)}><i /></button>
          </div>
          <p className="we-why-sub">{notesOff ? 'Off. Their letters carry no counts or quotes from your chat.' : 'Small printed notes in the margins, counted from your chat. A few of them:'}</p>
          {!notesOff && <ul>{notes.map((n) => <li key={n.id}><b>{n.main}</b> <span>{n.sub}, on “{n.on}”</span></li>)}</ul>}
        </div>
      )}
      <button type="button" className="wf-btn wf-btn--ghost wf-btn--small we-why-again" onClick={() => onVariant((Number(draft.lookVariant) || 0) + 1)}>Dress it again</button>
    </section>
  )
}
