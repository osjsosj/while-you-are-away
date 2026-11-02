import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearDraft, saveDraft } from '../../utils/storage'
import SiteLayout from './SiteLayout'
import TimeApart from './TimeApart'
import { RHYTHMS } from './letters'
import { BENEFITS, SAMPLE_LETTERS, REVIEWS, FAQ } from './content'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function Hero() {
  const navigate = useNavigate()
  const [weeks, setWeeks] = useState(12)
  const [rhythm, setRhythm] = useState('weekly')
  const [seal, setSeal] = useState(true)
  const [part, setPart] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return iso(d)
  })
  const start = useMemo(() => fromIso(part), [part])
  // the diary runs from today to the day you part
  const before = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.max(0, Math.min(60, Math.round((start - today) / 86400000)))
  }, [start])
  const pretty = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const dateRef = useRef(null)
  const pickDate = () => {
    const el = dateRef.current
    if (!el) return
    if (el.showPicker) el.showPicker()
    else el.focus()
  }

  const begin = () => {
    clearDraft()
    saveDraft({ landing: { startDate: part } })
    navigate('/interview')
  }

  return (
    <section className="hs" aria-labelledby="hs-title">
      <div className="hs-copy">
        <h1 id="hs-title" className="hs-title">
          <span className="hs-line"><span>Goodbyes can</span></span>
          <span className="hs-line"><span>be prepared.</span></span>
        </h1>
        <p className="hs-lede">
          Write to them in secret, a little each day, until the day you part. Then they open one letter at a time, for as long as you’re apart.
        </p>
        <button type="button" className="ws-btn" onClick={begin}>Start your letter box</button>
        <p className="ws-small">{'$24 once · full refund within 14 days'}</p>
      </div>

      <div className="hs-stage">
        <div className="hs-controls" data-ui>
          <div className="ctl">
            <span className="ctl-name" id="part-name">We part on</span>
            <div className="datebox">
              {/* the browser's picker, under a button that shows the date in words */}
              <input ref={dateRef} type="date" value={part} tabIndex={-1} aria-hidden="true" onChange={(e) => e.target.value && setPart(e.target.value)} />
              <button type="button" aria-labelledby="part-name part-date" onClick={pickDate}>
                <span id="part-date">{pretty}</span>
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3 8.5h14M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
          <label className="ctl">
            <span className="ctl-name">Apart for <output>{weeks} weeks</output></span>
            <input type="range" min="2" max="52" value={weeks} style={{ '--fill': `${((weeks - 2) / 50) * 100}%` }} onChange={(e) => setWeeks(Number(e.target.value))} />
          </label>
          <div className="ctl ctl--switch">
            <span className="ctl-name" id="seal-name">Seal the last letter</span>
            <button type="button" role="switch" aria-checked={seal} aria-labelledby="seal-name" className="switch" onClick={() => setSeal(!seal)}>
              <span />
            </button>
          </div>
          <fieldset className="ctl ctl--wide">
            <legend className="ctl-name">Letters open</legend>
            <div className="seg">
              {RHYTHMS.map((r) => (
                <button key={r.id} type="button" aria-pressed={rhythm === r.id} onClick={() => setRhythm(r.id)}>{r.label}</button>
              ))}
            </div>
          </fieldset>
        </div>
        <TimeApart weeks={weeks} rhythm={rhythm} seal={seal} start={start} before={before} />
      </div>
    </section>
  )
}

function Meaning() {
  return (
    <section className="hm" aria-labelledby="hm-title">
      <div className="hm-copy" data-rise>
        <h2 id="hm-title" className="ws-h2">A goodbye you get to prepare</h2>
        <p className="hm-say">Most goodbyes just happen to us: a last night, an airport bus, a phone call. This one you can get ready for.</p>
        <p className="hm-body">
          Gifts and good dinners rarely carry it. What stays are the words you didn’t say. While You’re Away gives those words a place,
          and a time to arrive, so the weeks apart feel less like waiting.
        </p>
      </div>
      <figure className="hm-film" data-rise>
        <video src="/landing/opening.mp4" poster="/landing/opening-poster.webp" autoPlay muted loop playsInline width="600" height="1298" aria-label="The short film that plays when they first open the letter box" />
        <img src="/landing/step-dress.webp" alt="A first letter dressed with a postmark, a stamp and a bus ticket" width="600" height="1298" loading="lazy" />
        <img src="/landing/step-open.webp" alt="An opened letter with a taped photo and a folded note" width="600" height="1298" loading="lazy" />
        <figcaption>What they receive: a short film of your photos and voice, a letter dressed from your story, and the letters themselves.</figcaption>
      </figure>
    </section>
  )
}

const POSTMARK = (
  <svg className="hb-postmark" viewBox="0 0 120 120" width="96" height="96" aria-hidden="true">
    <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <text x="60" y="56" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">APR 2</text>
    <text x="60" y="74" textAnchor="middle" fontSize="11" fill="currentColor">HAN RIVER</text>
  </svg>
)

function Benefits() {
  const [which, setWhich] = useState('d9')
  const [dressed, setDressed] = useState(false)
  const letter = SAMPLE_LETTERS[which]
  const choices = (group) => Object.entries(SAMPLE_LETTERS).filter(([, l]) => l.group === group)

  return (
    <section className="hb" aria-labelledby="hb-title">
      <div className="hb-stage">
        <article className={dressed ? 'hb-letter hb-letter--dressed' : 'hb-letter'} data-ui aria-live="polite">
          {dressed && <span className="hb-tape" aria-hidden="true" />}
          {dressed && POSTMARK}
          <p className="hb-meta">{letter.meta}</p>
          <h3 className="hb-ltitle">{letter.title}</h3>
          <p className="hb-lbody">{letter.body}</p>
          {dressed && <p className="hb-ticket" aria-hidden="true"><span>City bus · one way</span>Open when you miss me</p>}
        </article>
      </div>

      <div className="hb-col">
        <h2 id="hb-title" className="ws-h2">Why it moves them</h2>
        {BENEFITS.map((b) => (
          <div key={b.title} className="hb-block" data-rise>
            <h3 className="hb-title">{b.title}</h3>
            <p>{b.body}</p>
            {(b.control === 'diary' || b.control === 'apart') && (
              <div className="seg seg--light" role="group" aria-label={b.control === 'diary' ? 'Read a diary entry' : 'Read a letter'}>
                {choices(b.control).map(([id, l]) => (
                  <button key={id} type="button" aria-pressed={which === id} onClick={() => setWhich(id)}>{l.label}</button>
                ))}
              </div>
            )}
            {b.control === 'dress' && (
              <button type="button" className="tog" aria-pressed={dressed} onClick={() => setDressed(!dressed)}>
                {dressed ? 'Plain paper' : 'Dress it from their story'}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function Reviews() {
  const [first, ...rest] = REVIEWS
  return (
    <section className="hr" aria-labelledby="hr-title">
      <h2 id="hr-title" className="ws-h2" data-rise>In their words</h2>
      <p className="hr-note" data-rise>Sample reviews, shown until the first real ones arrive.</p>
      <div className="cm cm--big" data-ui data-rise>
        <div className="cm-head"><span className="cm-disc">{first.initials}</span><span>{first.who}</span><span className="cm-date">{first.date}</span></div>
        <p className="cm-body">{first.body}</p>
      </div>
      <div className="hr-replies">
        {rest.map((r) => (
          <div key={r.initials} className="cm" data-ui data-rise>
            <div className="cm-head"><span className="cm-disc">{r.initials}</span><span>{r.who}</span><span className="cm-date">{r.date}</span></div>
            <p className="cm-body">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="hf" aria-labelledby="hf-title">
      <div className="hf-list">
        <h2 id="hf-title" className="ws-h2">Questions</h2>
        <ul>
          {FAQ.map((f, i) => (
            <li key={f.q} className={i === open ? 'is-open' : ''}>
              <button type="button" aria-expanded={i === open} aria-controls={`hf-a-${i}`} onClick={() => setOpen(i)} onMouseEnter={() => setOpen(i)} onFocus={() => setOpen(i)}>
                <span className="hf-dot" aria-hidden="true" />
                {f.q}
              </button>
              <p id={`hf-a-${i}`} className="hf-inline" hidden={i !== open}>{f.a}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="hf-pane" aria-hidden="true">
        <p key={open}>{FAQ[open].a}</p>
      </div>
    </section>
  )
}

export default function Home() {
  useEffect(() => {
    document.title = 'While You’re Away — goodbyes can be prepared'
  }, [])
  return (
    <SiteLayout>
      <Hero />
      <Meaning />
      <Benefits />
      <Reviews />
      <Faq />
      <section className="hc" aria-labelledby="hc-title">
        <h2 id="hc-title" className="ws-sr">Start</h2>
        <p className="hc-say">You don’t have to be a writer. You only have to start before the day comes.</p>
        <p className="hc-links">
          <Link to="/interview" className="ws-link">Start your letter box</Link>
          <Link to="/services" className="ws-link ws-link--soft">See everything that’s in the box</Link>
        </p>
      </section>
    </SiteLayout>
  )
}
