import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { generateLetterboxConfig, PaymentRequiredError } from '../utils/aiService'
import FlowFrame from '../components/FlowFrame'
import { ACCENTS } from '../utils/text'

/* Name the letter box, write the line they see first, pick the colour of its light. */

function fallbackNames(d) {
  const to = d.phase1?.toName || 'you'
  return [d.phase2?.appName, `For ${to}`, `While you’re away, ${to}`].filter(Boolean).slice(0, 3)
}

export default function AIGenerate() {
  const navigate = useNavigate()
  const draft = getDraft()
  const existing = draft.generatedConfig
  const [loading, setLoading] = useState(!existing)
  const [names, setNames] = useState(existing?.appNames || [])
  const [chosen, setChosen] = useState(existing?.chosenName || '')
  const [custom, setCustom] = useState('')
  const [welcome, setWelcome] = useState(existing?.welcomeMessage || '')
  const [accent, setAccent] = useState(draft.accent || ACCENTS[0].hex)

  useEffect(() => {
    if (existing) return
    let live = true
    const d = getDraft()
    const p1 = d.phase1 || {}
    const p2 = d.phase2 || {}
    const data = {
      from: p1.fromName, to: p1.toName, relationship: p1.relationship, situation: p1.situation,
      relationshipWord: p2.relationshipWord, nicknames: p2.nicknames, symbols: p2.symbols, special: p2.special, appName: p2.appName,
    }
    generateLetterboxConfig(data)
      .then((res) => {
        if (!live) return
        const list = [p2.appName, ...(res?.appNames || [])].filter((n, i, a) => n && a.indexOf(n) === i).slice(0, 4)
        const finalList = list.length ? list : fallbackNames(d)
        setNames(finalList)
        setChosen(finalList[0])
        setWelcome(res?.welcomeMessage || `${p1.toName || 'Love'}, this is for while I’m away.`)
      })
      .catch((err) => {
        if (err instanceof PaymentRequiredError) return navigate('/paywall')
        const list = fallbackNames(d)
        setNames(list)
        setChosen(list[0])
        setWelcome(`${p1.toName || 'Love'}, this is for while I’m away.`)
      })
      .finally(() => live && setLoading(false))
    return () => { live = false }
  }, [existing, navigate])

  const finalName = (custom.trim() || chosen || '').slice(0, 60)

  const next = () => {
    if (!finalName) return
    saveDraft({
      generatedConfig: { ...(getDraft().generatedConfig || {}), appNames: names, chosenName: finalName, welcomeMessage: welcome.trim().slice(0, 160) },
      accent,
    })
    navigate('/editor')
  }

  if (loading) {
    return (
      <FlowFrame step={2} narrow>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 80, textAlign: 'center' }}>
          <div className="wf-spinner" role="status" aria-label="Working" />
          <p className="wf-lede">Reading everything you shared, and finding a name for it…</p>
        </div>
      </FlowFrame>
    )
  }

  const to = draft.phase1?.toName || 'them'
  return (
    <FlowFrame step={2} narrow>
      <h1 className="wf-h1">Give it a name.</h1>
      <p className="wf-lede">This is the first thing {to} sees. Pick one, or write your own.</p>

      <fieldset className="wf-field" style={{ border: 'none', padding: 0 }}>
        <legend className="wf-label">Name</legend>
        <div className="wf-pills" role="radiogroup" aria-label="Suggested names">
          {names.map((n) => (
            <button key={n} type="button" role="radio" className="wf-pill" aria-checked={!custom.trim() && chosen === n} onClick={() => { setChosen(n); setCustom('') }}>{n}</button>
          ))}
        </div>
        <label className="wf-label" htmlFor="g-custom" style={{ marginTop: 14 }}>Or your own</label>
        <input id="g-custom" className="wf-input" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Something only you would call it" maxLength={60} />
      </fieldset>

      <div className="wf-field">
        <label className="wf-label" htmlFor="g-welcome">The first line they read</label>
        <textarea id="g-welcome" className="wf-input" rows={2} value={welcome} onChange={(e) => setWelcome(e.target.value)} maxLength={160} style={{ resize: 'vertical', lineHeight: 1.5 }} />
      </div>

      <fieldset className="wf-field" style={{ border: 'none', padding: 0 }}>
        <legend className="wf-label">The colour of its light</legend>
        <div className="wf-swatches" role="radiogroup" aria-label="Accent colour">
          {ACCENTS.map((a) => (
            <button key={a.id} type="button" role="radio" aria-checked={accent === a.hex} className="wf-swatch" onClick={() => setAccent(a.hex)}>
              <span style={{ background: a.hex, color: a.hex }} />{a.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="wf-card" aria-label="Preview" style={{ margin: '8px 0 28px', background: 'linear-gradient(180deg,#050A19,#0B1430)', textAlign: 'center', padding: '32px 20px' }}>
        <p className="wf-note">Letters from {draft.phase1?.fromName || 'you'}</p>
        <p style={{ margin: '6px 0 8px', fontFamily: 'var(--serif)', fontSize: 30, color: '#F4F1E6' }}>{finalName || 'Your letter box'}</p>
        <p style={{ color: 'var(--mist-soft)', fontSize: 15 }}>{welcome}</p>
        <span aria-hidden="true" style={{ display: 'inline-block', marginTop: 18, width: 44, height: 44, borderRadius: '50%', background: accent, boxShadow: `0 0 40px ${accent}` }} />
      </div>

      <button type="button" className="wf-btn wf-btn--block" onClick={next} disabled={!finalName}>Start writing</button>
    </FlowFrame>
  )
}
