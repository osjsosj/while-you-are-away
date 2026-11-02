import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearDraft, saveDraft } from '../../utils/storage'
import SiteLayout from './SiteLayout'
import NightSky from './NightSky'
import Journey from './Journey'
import TimeApart from './TimeApart'
import { RHYTHMS } from './letters'
import { FAQ } from './content'
import { ChatFragment, PaperFragment } from './Fragments'
import { PAPER_STYLES } from './paper'
import './home.css'

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
    navigate('/interview')
  }
  return (
    <section className="home-timeline" id="your-timeline" aria-labelledby="timeline-title">
      <div className="timeline-copy" data-rise>
        <p className="scene-label">Your time apart, with a little light in it</p>
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

const FIRST_LINE = 'Today you cried and said it was allergies. It hurt to watch, and I’m so glad I’m writing these.'
const CRAFT_STEPS = [
  ['Tell us about the two of you', 'A place, a date, the small things only you know. Share photos and voice notes with the AI counselor.'],
  ['Your story becomes the paper', 'A stamp, a postmark, a little piece of your world. Choose the paper you like and change anything that isn’t you.'],
  ['You write the words', 'A line about today. Something you never said. A companion helps you get started, but every word stays yours.'],
]

function PaperStory() {
  const [step, setStep] = useState(0)
  const [style, setStyle] = useState('night')
  const [words, setWords] = useState(FIRST_LINE)
  const tabs = useRef([])
  const selectWithKey = (event, i) => {
    let next
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (i + 1) % 3
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (i + 2) % 3
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = 2
    if (next === undefined) return
    event.preventDefault()
    setStep(next)
    tabs.current[next]?.focus()
  }
  return (
    <section className="home-craft" aria-labelledby="craft-title">
      <div className="craft-heading" data-rise><p className="scene-label">Small details. Only yours.</p><h2 className="ws-h2" id="craft-title">Made from your story.<br />Written in your words.</h2></div>
      <div className="craft-layout">
        <div className="craft-steps" role="tablist" aria-label="How your letter box is made" aria-orientation="vertical">
          {CRAFT_STEPS.map(([title, body], i) => <button key={title} ref={(el) => { tabs.current[i] = el }} type="button" role="tab" id={`craft-tab-${i}`} aria-selected={step === i} aria-controls={`craft-panel-${i}`} tabIndex={step === i ? 0 : -1} onClick={() => setStep(i)} onKeyDown={(e) => selectWithKey(e, i)}><span className="craft-number">0{i + 1}</span><span><strong>{title}</strong><span className="craft-desc">{body}</span></span><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="m7 4 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg></button>)}
          <p className="craft-note">Explore the real paper. Try a line of your own.</p>
        </div>
        <div className="craft-stage">
          {[0, 1, 2].map((i) => <div key={i} className={`craft-panel${step === i ? ' is-active' : ''}`} id={`craft-panel-${i}`} role="tabpanel" aria-labelledby={`craft-tab-${i}`} aria-hidden={step !== i} inert={step !== i} tabIndex={0}>
            {i === 0 && <ChatFragment />}
            {i === 1 && <><PaperFragment style={style} /><div className="seg craft-styles" role="group" aria-label="Paper style">{PAPER_STYLES.map((s) => <button key={s.id} type="button" aria-pressed={style === s.id} onClick={() => setStyle(s.id)}>{s.name}</button>)}</div></>}
            {i === 2 && <><PaperFragment style={style} body={words} photo={false} title="Today" meta="The days before · D-9" /><label className="hp-write"><span>Try it: write a line</span><textarea rows="3" value={words} maxLength={280} onChange={(e) => setWords(e.target.value)} /></label></>}
          </div>)}
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section className="home-faq" aria-labelledby="faq-title">
      <div data-rise><p className="scene-label">Before you begin</p><h2 className="ws-h2" id="faq-title">A few things<br />you might wonder.</h2><Link to="/contact" className="ws-link">Ask us something else <span aria-hidden="true">↗</span></Link></div>
      <div className="faq-list">{FAQ.map((f, i) => <div key={f.q} className={i === open ? 'faq-item is-open' : 'faq-item'}><h3><button type="button" aria-expanded={i === open} aria-controls={`faq-a-${i}`} onClick={() => setOpen(open === i ? null : i)}>{f.q}<span aria-hidden="true">{i === open ? '−' : '+'}</span></button></h3><div className="faq-answer" id={`faq-a-${i}`} inert={i !== open} aria-hidden={i !== open}><div><p>{f.a}</p></div></div></div>)}</div>
    </section>
  )
}

export default function Home() {
  useEffect(() => { document.title = 'While You’re Away — goodbyes can be prepared' }, [])
  return (
    <SiteLayout cinematic background={<NightSky />}>
      <Journey />
      <Timeline />
      <PaperStory />
      <section className="home-handover" aria-labelledby="handover-title">
        <div className="handover-horizon" aria-hidden="true"><img src="/site/motion/horizon.webp" alt="" width="1280" height="720" loading="lazy" /></div>
        <div className="handover-copy" data-rise><p className="scene-label">One link. All the things you wanted to say.</p><h2 className="ws-h2" id="handover-title">They open it on their phone.<br />They feel you there.</h2><p>No app to install. Letters to open, even offline.<br />A reply waiting when they want to write back.</p><Link to="/services" className="ws-link">Everything in their letter box <span aria-hidden="true">↗</span></Link></div>
      </section>
      <Faq />
      <section className="home-close" aria-labelledby="close-title" data-rise><p className="scene-label">Leave the light on.</p><h2 id="close-title">You don’t have to<br />find all the words tonight.</h2><p>You only have to start before the day comes.</p><Link to="/interview" className="ws-btn">Start your letter box <span aria-hidden="true">↗</span></Link><p className="ws-small">$24, paid once. A whole letter box. No subscription.</p></section>
    </SiteLayout>
  )
}
