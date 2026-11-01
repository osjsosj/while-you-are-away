import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { generateLetterboxConfig, PaymentRequiredError } from '../utils/aiService'
import { STYLES, STYLE_IDS, MOTIFS, MOTIF_IDS, TICKETS, normalizeDecor, fallbackDecor, activeDecor } from '../utils/decor'
import { getPlan } from '../utils/plan'
import { ticketLetterIds } from '../utils/boxModel'
import { formatLong } from '../utils/diary'
import FlowFrame from '../components/FlowFrame'
import LetterPaper from '../components/LetterPaper'
import { Motif, Postmark, TicketBanner, StyleSwatch } from '../components/Decor'
import '../styles/generate.css'

/*
 * The one decorating step: we dress the box from everything they shared,
 * they see it, switch off anything that isn't them, and go write.
 */

function fallbackNames(d) {
  const to = d.phase1?.toName || 'you'
  return [d.phase2?.appName, `For ${to}`, `While you’re away, ${to}`].filter(Boolean).slice(0, 3)
}

/** The sender's own lines from the planning chat and under their photos: the truest source for decorations. */
function theirWords(d) {
  const said = (d.interviewChat || []).filter((m) => m.role === 'user').map((m) => m.content.replace(/^\[Attached: [^\]]+\]\s*/, '')).filter(Boolean)
  const captions = (d.film?.photos || []).map((p) => p.caption).filter(Boolean)
  return [...said, ...captions.map((c) => `(photo) ${c}`)].join('\n').slice(-6000)
}

function designInput(d) {
  const p1 = d.phase1 || {}
  const p2 = d.phase2 || {}
  const plan = getPlan(d)
  const letters = [
    ...plan.anytime.map((x) => ({ id: x.id, label: x.label, kind: 'open when' })),
    ...plan.neverSaid.map((x) => ({ id: x.id, label: x.label, kind: 'never said' })),
    ...plan.occasions.map((x) => ({ id: x.id, label: x.label, kind: 'special day' })),
  ]
  return {
    from: p1.fromName, to: p1.toName, relationship: p1.relationship, situation: p1.situation,
    whatTheySaid: {
      relationshipWord: p2.relationshipWord, nicknames: p2.nicknames, symbols: p2.symbols, special: p2.special,
      shared: p2.shared, jokes: p2.jokes, song: p2.song, transport: p2.transport, places: p2.places, timeline: p2.timeline,
      styleChoice: p2.style, appNameIdea: p2.appName,
    },
    letters,
    theirWords: theirWords(d),
    library: { motifs: MOTIF_IDS.map((id) => ({ id, label: MOTIFS[id].label, words: MOTIFS[id].words.filter((w) => /^[a-z ]+$/.test(w)).join(', ') })), tickets: Object.keys(TICKETS), styles: STYLE_IDS },
  }
}

export default function AIGenerate() {
  const navigate = useNavigate()
  const draft = getDraft()
  const letterIds = useMemo(() => ticketLetterIds(getDraft()), [])
  const existing = draft.generatedConfig
  const [loading, setLoading] = useState(!existing || !draft.decor)
  const [names, setNames] = useState(existing?.appNames || [])
  const [chosen, setChosen] = useState(existing?.chosenName || '')
  const [custom, setCustom] = useState('')
  const [welcome, setWelcome] = useState(existing?.welcomeMessage || '')
  const [decor, setDecor] = useState(() => (draft.decor ? normalizeDecor(draft.decor, letterIds) : null))
  const [recommended, setRecommended] = useState(draft.decorRecommended || draft.decor?.style || 'night')

  useEffect(() => {
    if (existing && draft.decor) return
    let live = true
    const d = getDraft()
    const p1 = d.phase1 || {}
    const p2 = d.phase2 || {}
    const apply = (res) => {
      if (!live) return
      if (!existing) {
        const list = [p2.appName, ...(res?.appNames || [])].filter((n, i, a) => n && a.indexOf(n) === i).slice(0, 4)
        const finalList = list.length ? list : fallbackNames(d)
        setNames(finalList)
        setChosen(finalList[0])
        setWelcome(res?.welcomeMessage || `${p1.toName || 'Love'}, this is for while I’m away.`)
      }
      let plan = res ? normalizeDecor(res, letterIds) : null
      const backup = fallbackDecor(p2, letterIds)
      if (!plan) plan = backup
      if (!plan.motifs.length && !plan.postmark && !plan.ticket) plan = { ...backup, style: plan.style }
      if (p2.style && STYLES[p2.style]) plan.style = p2.style
      setDecor(plan)
      setRecommended(plan.style)
    }
    generateLetterboxConfig(designInput(d))
      .then(apply)
      .catch((err) => {
        if (err instanceof PaymentRequiredError) return navigate('/paywall')
        apply(null)
      })
      .finally(() => live && setLoading(false))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const finalName = (custom.trim() || chosen || '').slice(0, 60)
  const p1 = draft.phase1 || {}
  const to = p1.toName || 'them'
  const plan = getPlan(draft)
  const ticketLetter = decor?.ticket ? [...plan.anytime, ...plan.neverSaid, ...plan.occasions].find((x) => x.id === decor.ticket.letterId) : null

  const toggle = (key) => setDecor((dc) => ({ ...dc, off: { ...dc.off, [key]: !dc.off[key] } }))
  const isOn = (key) => !decor?.off?.[key]

  const next = () => {
    if (!finalName || !decor) return
    saveDraft({
      generatedConfig: { ...(getDraft().generatedConfig || {}), appNames: names, chosenName: finalName, welcomeMessage: welcome.trim().slice(0, 160) },
      decor,
      decorRecommended: recommended,
      accent: STYLES[decor.style].accent,
    })
    navigate('/editor')
  }

  if (loading || !decor) {
    return (
      <FlowFrame step={2} narrow>
        <div className="gn-loading">
          <div className="wf-spinner" role="status" aria-label="Working" />
          <p className="wf-lede">Reading everything you shared and dressing {to}’s letter box…</p>
        </div>
      </FlowFrame>
    )
  }

  const touches = [
    ...decor.motifs.map((m, i) => ({ key: `motif:${m.id}`, art: <Motif id={m.id} size={44} />, title: MOTIFS[m.id].label, why: m.why || 'From what you shared.', what: i === 0 ? 'On the stamp, and in the corner of each letter.' : 'Tucked into the corner of each letter.' })),
    decor.postmark && { key: 'postmark', art: <span className="gn-pm"><Postmark place={decor.postmark.place} date={decor.postmark.date} size={56} /></span>, title: `Postmarked ${decor.postmark.place}`, why: decor.postmark.why || (decor.postmark.date ? `${formatLong(decor.postmark.date)}.` : ''), what: 'Stamped on the first letter, like real mail.' },
    decor.ticket && ticketLetter && { key: 'ticket', art: <span className="gn-tk">{TICKETS[decor.ticket.kind].label.split(' ')[0]}</span>, title: `“${ticketLetter.label}” becomes a ${TICKETS[decor.ticket.kind].label.toLowerCase()}`, why: decor.ticket.why || '', what: decor.ticket.line ? `“${decor.ticket.line}”` : '' },
    decor.song && { key: 'song', art: <Motif id="music" size={44} />, title: `Our song: ${decor.song.title}`, why: decor.song.why || 'You told us about it.', what: `A card in “Our story” that plays it for ${to}.` },
    draft.sealVoice && { key: 'sealVoice', art: <span className="gn-seal" />, title: 'Your voice on the seal', why: 'The voice note you recorded.', what: `${to} hears it when they tap to open the box.` },
    plan.occasions.length > 0 && { key: 'celebrate', art: <Motif id="cake" size={44} />, title: 'A little celebration on special days', why: plan.occasions.map((o) => o.label).slice(0, 2).join(', '), what: 'Those letters open with a small burst of confetti.' },
    decor.style !== 'quiet' && { key: 'tape', art: <span className="gn-tape" />, title: 'Photos taped in', why: 'Any photo you add sits on the page like a print.', what: '' },
  ].filter(Boolean)

  const live = activeDecor(decor)

  return (
    <FlowFrame step={2}>
      <div className="gn">
        <div className="gn-copy">
          <h1 className="wf-h1">Here’s how {to}’s box will look.</h1>
          <p className="wf-lede">We dressed it from what you told us. Keep what feels like you and switch off the rest. You can change all of this later.</p>

          <section className="gn-block" aria-labelledby="gn-name">
            <h2 id="gn-name" className="gn-h">Its name</h2>
            <div className="wf-pills" role="radiogroup" aria-label="Suggested names">
              {names.map((n) => (
                <button key={n} type="button" role="radio" className="wf-pill" aria-checked={!custom.trim() && chosen === n} onClick={() => { setChosen(n); setCustom('') }}>{n}</button>
              ))}
            </div>
            <label className="wf-label gn-sub" htmlFor="g-custom">Or your own</label>
            <input id="g-custom" className="wf-input" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Something only you would call it" maxLength={60} />
            <label className="wf-label gn-sub" htmlFor="g-welcome">The first line {to} reads</label>
            <textarea id="g-welcome" className="wf-input" rows={2} value={welcome} onChange={(e) => setWelcome(e.target.value)} maxLength={160} style={{ resize: 'vertical', lineHeight: 1.5 }} />
          </section>

          <section className="gn-block" aria-labelledby="gn-style">
            <h2 id="gn-style" className="gn-h">The paper</h2>
            <div className="gn-styles" role="radiogroup" aria-label="Paper style">
              {STYLE_IDS.map((s) => (
                <button key={s} type="button" role="radio" aria-checked={decor.style === s} className="gn-style" onClick={() => setDecor((dc) => ({ ...dc, style: s }))}>
                  <span className="gn-sw"><StyleSwatch style={s} /></span>
                  <span className="gn-style-name">{STYLES[s].name}{s === recommended && <em>Our pick</em>}</span>
                  <span className="gn-style-desc">{STYLES[s].desc}</span>
                </button>
              ))}
            </div>
          </section>

          {touches.length > 0 && (
            <section className="gn-block" aria-labelledby="gn-touches">
              <h2 id="gn-touches" className="gn-h">Little touches, from your story</h2>
              <ul className="gn-touches">
                {touches.map((t) => (
                  <li key={t.key} className={isOn(t.key) ? '' : 'is-off'}>
                    <span className="gn-art">{t.art}</span>
                    <span className="gn-text">
                      <b>{t.title}</b>
                      {t.why && <span>{t.why}</span>}
                      {t.what && <small>{t.what}</small>}
                    </span>
                    <button type="button" role="switch" aria-checked={isOn(t.key)} className="gn-switch" onClick={() => toggle(t.key)} aria-label={`${t.title}: ${isOn(t.key) ? 'on' : 'off'}`}><i /></button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <button type="button" className="wf-btn wf-btn--block gn-go" onClick={next} disabled={!finalName}>Looks right, start writing</button>
        </div>

        <aside className="gn-preview" aria-label={`How ${to}’s first letter will look`}>
          <p className="gn-preview-label">{to}’s first letter, with your words in it</p>
          <div className={`gn-paper wb-sheet--${live.style}`}>
            <LetterPaper
              decor={live}
              title="Read this tonight"
              meta={p1.startDate ? formatLong(p1.startDate) : 'The night you part'}
              letter={`${to},\n\nYour words go here, exactly as you write them. Everything around them is ours to take care of.`}
              fromName={p1.fromName}
              signature={draft.signature}
              showPostmark
              textSizeControl={false}
            />
          </div>
          {live.ticket && ticketLetter && (
            <div className="gn-ticket-demo"><TicketBanner ticket={{ ...live.ticket, title: ticketLetter.label }} compact /></div>
          )}
        </aside>
      </div>
    </FlowFrame>
  )
}
