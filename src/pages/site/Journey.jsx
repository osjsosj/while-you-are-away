import { Link } from 'react-router-dom'
import { useState } from 'react'
import useScrollScene, { useReducedMotion } from './useScrollScene'
import Mascot, { Says } from '../../components/Mascot'

// what Perigan says beside the sample letter, one line per chapter of the story
const LINES = [
  { move: 'talk', text: 'This one’s a sample. Yours would be in your own words.' },
  { move: 'notice', text: 'You write these before you go. They won’t know.' },
  { move: 'talk', text: 'I bring each one on its day. The last stays sealed.' },
]

/** Flies in from the right, lands on the letter, then talks the reader through the story. */
function HeroPelican({ chapter }) {
  const reduced = useReducedMotion()
  const [arrived, setArrived] = useState(false)
  if (!reduced && !arrived) {
    return <Mascot move="flyleft" loop size={132} className="hero-pelican hero-pelican--flying" onAnimationEnd={(e) => e.animationName === 'heroFly' && setArrived(true)} />
  }
  return <HeroLine key={chapter} line={LINES[chapter]} />
}

/** Keyed by chapter: he says the new line once, then rests. */
function HeroLine({ line }) {
  return (
    <>
      <Mascot move={line.move} size={132} className="hero-pelican" />
      <Says className="hero-says">{line.text}</Says>
    </>
  )
}

function Arrow({ down = false }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={down ? 'M12 4v16m-6-6 6 6 6-6' : 'M4 12h16m-6-6 6 6-6 6'} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

/** A single paper object stays with the reader as the story moves past it. */
export default function Journey() {
  const { scene, chapter } = useScrollScene()

  return (
    <section ref={scene} className="journey" aria-label="A letter for the time apart">
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
        <div className="letter-scene">
          <HeroPelican chapter={chapter} />
          <article className="sample-letter" id="sample-letter" aria-label="An illustrative sample letter from Jae to Mina">
            <div className="sample-meta"><span>Open when you can’t sleep</span><span aria-hidden="true">✦</span></div>
            <h3>Hey, you.</h3>
            <p>Think about the night the power went out and we played cards by candlelight until two.</p>
            <p>I’d sit through a hundred dark nights if they all ended next to you.</p>
            <p className="sample-sign">Always, Jae</p>
          </article>
          <p className="letter-note" aria-hidden="true">A little of you. Right when they need it.</p>
        </div>
        <div className="sample-actions">
          <span>Illustrative letter · Jae to Mina</span>
        </div>
        <div className="journey-progress" aria-hidden="true"><span /></div>
      </div>
    </section>
  )
}
