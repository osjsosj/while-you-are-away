import { track } from '../../utils/track'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearDraft, saveDraft } from '../../utils/storage'
import SiteLayout from './SiteLayout'
import NightSky from './NightSky'
import { Opening, Now, Flow, Words, Kinds, StartBar } from './Scenes'
import TimeApart from './TimeApart'
import { RHYTHMS } from './letters'
import { FAQ, PRICE } from './content'
import './home.css'
import './scenes.css'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function Timeline() {
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
  const before = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Math.max(0, Math.min(60, Math.round((start - today) / 86400000)))
  }, [start])
  const begin = () => {
    clearDraft()
    saveDraft({ landing: { startDate: part } })
    track('cta_start', { where: 'home_timeline' })
    navigate('/interview')
  }
  return (
    <section className="home-timeline" id="your-timeline" aria-labelledby="timeline-title">
      <div className="timeline-copy" data-rise>
        <h2 className="ws-h2" id="timeline-title">Give them something<br />to look forward to.</h2>
        <p>Choose the days. Watch them fill with letters. From the diary you keep before you leave to the last one they open when you’re together again.</p>
        <p className="timeline-key"><span><i />A letter to open</span><span><i />The day you meet again</span></p>
        <button type="button" className="ws-link timeline-start" onClick={begin}>Start with these dates <span aria-hidden="true">↗</span></button>
      </div>
      <div className="timeline-stage" data-rise>
        <div className="hs-controls" data-ui>
          <label className="ctl"><span className="ctl-name">We part on</span><input className="timeline-date" type="date" value={part} onChange={(e) => e.target.value && setPart(e.target.value)} /></label>
          <label className="ctl"><span className="ctl-name">Apart for <output>{weeks} weeks</output></span><input type="range" min="2" max="52" value={weeks} style={{ '--fill': `${((weeks - 2) / 50) * 100}%` }} onChange={(e) => setWeeks(Number(e.target.value))} /></label>
          <div className="ctl ctl--switch"><span className="ctl-name" id="seal-name">Seal the last letter</span><button type="button" role="switch" aria-checked={seal} aria-labelledby="seal-name" className="switch" onClick={() => setSeal(!seal)}><span /></button></div>
          <fieldset className="ctl ctl--wide"><legend className="ctl-name">Letters open</legend><div className="seg">{RHYTHMS.map((r) => <button key={r.id} type="button" aria-pressed={rhythm === r.id} onClick={() => setRhythm(r.id)}>{r.label}</button>)}</div></fieldset>
        </div>
        <TimeApart weeks={weeks} rhythm={rhythm} seal={seal} start={start} before={before} />
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="home-faq" aria-labelledby="faq-title">
      <div data-rise><h2 className="ws-h2" id="faq-title">A few things<br />you might wonder.</h2><Link to="/contact" className="ws-link">Ask us something else <span aria-hidden="true">↗</span></Link></div>
      <div className="faq-list">{FAQ.map((f, i) => <div key={f.q} className={i === open ? 'faq-item is-open' : 'faq-item'}><h3><button type="button" aria-expanded={i === open} aria-controls={`faq-a-${i}`} onClick={() => setOpen(open === i ? null : i)}>{f.q}<span aria-hidden="true">{i === open ? '−' : '+'}</span></button></h3><div className="faq-answer" id={`faq-a-${i}`} inert={i !== open} aria-hidden={i !== open}><div><p>{f.a}</p></div></div></div>)}</div>
    </section>
  )
}

function Price() {
  return (
    <section className="home-price" aria-labelledby="price-title">
      <div data-rise>
        <h2 className="home-price-lead" id="price-title">Free until you hand it over.<br />Then <em>{PRICE}</em>, once.</h2>
        <p className="home-price-terms">Plan with the guide, bring in your chats, write every letter, preview what they’ll see. You pay only when you make their link. No subscription, and a full refund within 14 days for any reason.</p>
        <Link to="/services" className="ws-link home-price-more">Everything in their letter box <span aria-hidden="true">↗</span></Link>
      </div>
      <ul className="home-price-list" aria-label="What costs what">
        <li><span>Planning with the guide</span><span className="is-free">Free</span></li>
        <li><span>Reading your chats for moments</span><span className="is-free">First one free</span></li>
        <li><span>Writing, the companion, the days before</span><span className="is-free">Free</span></li>
        <li><span>Their private link, every letter on its day</span><span>{PRICE} once</span></li>
      </ul>
    </section>
  )
}

export default function Home() {
  useEffect(() => { document.title = 'While You’re Away — goodbyes can be prepared' }, [])
  return (
    <SiteLayout cinematic background={<NightSky />}>
      <Opening />
      <Now />
      <Flow />
      <Words />
      <Kinds />
      <Timeline />
      <Price />
      <Faq />
      <section className="home-close" aria-labelledby="close-title" data-rise><h2 id="close-title">You don’t have to<br />find all the words tonight.</h2><p>You only have to start before the day comes.</p><Link to="/interview" className="ws-btn" data-track="cta_start" data-track-where="home_close">Start your letter box <span aria-hidden="true">↗</span></Link><p className="ws-small">Free to start. {PRICE} when you hand it over.</p></section>
      <StartBar />
    </SiteLayout>
  )
}
