import { useState } from 'react'
import { Link } from 'react-router-dom'
import useScrollScene from './useScrollScene'

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={down ? 'M12 4v16m-6-6 6 6 6-6' : 'M4 12h16m-6-6 6 6-6 6'} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

/** A single paper object stays with the reader as the story moves past it. */
export default function Journey() {
  const { scene, expanded } = useScrollScene()
  const [opened, setOpened] = useState(null)
  const sampleOpen = opened ?? expanded

  return (
    <section ref={scene} className={`journey${opened === true ? ' is-open' : opened === false ? ' is-closed' : ''}`} aria-label="A letter for the time apart">
      <div className="journey-narrative">
        <div className="journey-chapter journey-intro">
          <p className="scene-label"><span />For the time apart</p>
          <h1 className="journey-title"><span>Goodbyes</span>{' '}<span>can be</span>{' '}<span>prepared.</span></h1>
          <p className="journey-lede">Write to them before you leave.<br />Be there, a little, even when you can’t.</p>
          <Link to="/interview" className="ws-btn">Start your letter box<Arrow /></Link>
          <p className="ws-small">$24 once · full refund within 14 days</p>
          <a className="journey-scroll" href="#before-you-go"><Arrow down />Follow a letter</a>
        </div>
        <div className="journey-chapter" id="before-you-go">
          <p className="scene-label">01 / Before you go</p>
          <h2 className="journey-heading" data-rise>A little of today.<br />Kept for later.</h2>
          <p className="journey-body" data-rise>Write to them in secret, a little each day, until the day you part. The small things. The almost-said things. Each entry keeps its day: D-9, D-3, D-1.</p>
          <p className="journey-aside" data-rise>They won’t know you were writing.<br />Until they need to hear from you.</p>
        </div>
        <div className="journey-chapter" id="while-apart">
          <p className="scene-label">02 / While you’re apart</p>
          <h2 className="journey-heading" data-rise>Something to open.<br />Someone to feel close to.</h2>
          <p className="journey-body" data-rise>A letter on the right day. One for a sleepless night. And one that stays sealed until you meet again. Your words arrive, even while you’re away.</p>
          <div className="journey-rhythm" aria-label="Tonight, week one, week two, the day we meet again" data-rise>
            <span><i />Tonight</span><span><i />Week 1</span><span><i />Week 2</span><span><i />Together</span>
          </div>
          <a className="ws-link" href="#your-timeline">Make it your timeline<Arrow /></a>
        </div>
      </div>
      <div className="journey-stage" id="letter-preview">
        <div className="letter-orbit" aria-hidden="true">
          <svg viewBox="0 0 600 600"><ellipse cx="300" cy="300" rx="269" ry="198" transform="rotate(-32 300 300)" /><ellipse cx="300" cy="300" rx="268" ry="255" transform="rotate(34 300 300)" /><circle cx="88" cy="255" r="3" /><circle cx="491" cy="176" r="3" /><circle cx="461" cy="476" r="2" /></svg>
        </div>
        <div className="envelope-scene">
          <div className="envelope">
            <div className="envelope-back" />
            <div className="envelope-letter" id="sample-letter" aria-hidden={!sampleOpen} aria-label="An illustrative sample letter from Jae to Mina">
              <div className="sample-meta"><span>Open when you can’t sleep</span><span>✦</span></div>
              <h3>Hey, you.</h3>
              <p>Think about the night the power went out and we played cards by candlelight until two.</p>
              <p>I’d sit through a hundred dark nights if they all ended next to you.</p>
              <p className="sample-sign">Always, Jae</p>
            </div>
            <div className="envelope-front" aria-hidden="true">
              <svg viewBox="0 0 480 310" preserveAspectRatio="none"><path d="M0 0 244 179 480 0v310H0Z" fill="#DFD9CA" /><path d="m0 0 243 178L0 310Z" fill="#EAE4D6" /><path d="M480 0 240 178l240 132Z" fill="#E6E0D2" /><path d="M0 310 222 148q18-13 36 0l222 162Z" fill="#F3EDE0" /><path d="m0 309 222-161q18-13 36 0l222 161" fill="none" stroke="#D6CEBD" strokeWidth="1" /></svg>
              <div className="envelope-address"><span>For Mina</span><small>Until we’re under the same sky.</small></div>
            </div>
            <div className="envelope-flap" aria-hidden="true"><svg viewBox="0 0 480 190" preserveAspectRatio="none"><path d="M0 0h480L260 177q-20 16-40 0Z" fill="#F6F0E3" stroke="#D9D1C0" strokeWidth="1" /></svg></div>
            <div className="envelope-seal" aria-hidden="true"><svg viewBox="0 0 64 64"><path d="M31 3 40 6l9 1 4 8 7 7-2 10 2 9-7 7-5 9-10 1-8 4-8-5-10-1-4-9-7-7 2-10-1-9 7-6 5-9 9-1Z" fill="#B87F2C" /><circle cx="31" cy="32" r="22" fill="#D9A44C" stroke="#F5CA78" strokeWidth="1.2" /><path d="m20 31 11-10 11 10v12H20Zm7 12V32h8v11" fill="none" stroke="#8A5D24" strokeWidth="1.6" /><path d="M29 34h4v5h-4Z" fill="#FFE2A2" /></svg></div>
          </div>
          <p className="envelope-note" aria-hidden="true">A little of you. Right when they need it.</p>
        </div>
        <div className="sample-actions">
          <button type="button" className="sample-open" aria-expanded={sampleOpen} aria-controls="sample-letter" onClick={() => setOpened(!sampleOpen)}>{sampleOpen ? 'Close the sample' : 'Open a sample letter'}<Arrow /></button>
          <span>Illustrative letter · Jae to Mina</span>
        </div>
        <div className="journey-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
