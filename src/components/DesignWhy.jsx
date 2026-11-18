import { useMemo } from 'react'
import { allItems, isWritten } from '../utils/boxModel'
import { explainLook } from '../utils/design/boxLook'
import { Seal, StoryStamp } from './StoryArt'
import { StickerArtContext } from '../utils/stickerArt'

/*
 * For the sender: how their box will look, and which part of their story made each choice.
 * The recipient never sees this list; they only see the result. "Dress it again" picks other
 * shades and tilts from the same story (draft.lookVariant).
 */
export default function DesignWhy({ draft, onVariant }) {
  const ex = useMemo(() => {
    const written = allItems(draft).filter((it) => isWritten(it.content))
    return explainLook(draft, written)
  }, [draft])
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
      <button type="button" className="wf-btn wf-btn--ghost wf-btn--small we-why-again" onClick={() => onVariant((Number(draft.lookVariant) || 0) + 1)}>Dress it again</button>
    </section>
  )
}
