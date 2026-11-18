import { forwardRef, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from './useScrollScene'
import Mascot from '../../components/Mascot'
import { Motif } from '../../components/Decor'
import { KINDS } from './content'

/*
 * The home page's scroll scenes, laid out after kakaocorp.com/page:
 *  - Opening: the headline, then a card ("right now") rises and grows until it fills the screen,
 *    with rows of story bubbles flowing through it and Perigan at work.
 *  - Flow: the phone stays put while the five steps pass beside it (real screens, public/site/shots).
 *  - Words: Services, About, Contact as huge words with a picture rising over each; each opens its page.
 *  - Kinds: the seven kinds of letter as panels that open sideways.
 *  - StartBar: a start button that floats at the bottom once the headline's own button is gone.
 * Native scrolling drives everything; only a visible scene does any work; reduced motion gets a still page.
 */

const clamp = (n) => Math.max(0, Math.min(1, n))

/** Progress 0…1 through a tall section whose child sticks, written to --p on the section. */
function useProgress(onChange) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const cb = useRef(onChange)
  useEffect(() => { cb.current = onChange })
  useEffect(() => {
    const node = ref.current
    if (!node || reduced) return undefined
    let frame = 0
    let visible = false
    const update = () => {
      frame = 0
      const r = node.getBoundingClientRect()
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight))
      node.style.setProperty('--p', p.toFixed(4))
      cb.current?.(p)
    }
    const schedule = () => { if (visible && !frame) frame = requestAnimationFrame(update) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) schedule() }, { rootMargin: '20% 0px' })
    io.observe(node)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [reduced])
  return { ref, reduced }
}

function Arrow() {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

/** A phone drawn around a real screen: a dark body, a thin lit edge, the screen inset. */
export const Phone = forwardRef(function Phone({ children, className = '' }, ref) {
  return <div ref={ref} className={`sc-phone ${className}`}><div className="sc-screen">{children}</div></div>
})

/* Bits of one made-up couple's story, flowing through the card like the bubbles on a live service page. */
const BUBBLES = [
  [
    { text: 'Bikes on the Han River', meta: 'a moment · Apr 2, 2023' },
    { text: '“Text me when you’re home”', meta: 'something she always says', tone: 'say' },
    { text: 'The night the power went out', meta: 'a moment · Aug 17, 2024' },
    { text: '4:12 a.m.', meta: 'the latest they stayed up talking', tone: 'num' },
    { text: 'Ramyeon at 2 a.m.', meta: 'a moment · the corner store' },
  ],
  [
    { text: '“Did you eat?”', meta: 'something he always says', tone: 'say' },
    { text: 'Lisbon, January 8', meta: 'a goodbye before this one', tone: 'bye' },
    { text: 'Her first snow in Seoul', meta: 'a moment · Dec 21, 2024' },
    { text: '153 hours', meta: 'on the phone, over 412 calls', tone: 'num' },
    { text: '“did you get home okay?”', meta: 'the very first message', tone: 'say' },
  ],
]

function Row({ items, reverse }) {
  const list = [...items, ...items]
  return (
    <div className={`sc-row${reverse ? ' is-reverse' : ''}`}>
      <ul>{list.map((b, i) => <li key={i} className={`sc-bubble${b.tone ? ` sc-bubble--${b.tone}` : ''}`} aria-hidden={i >= items.length ? 'true' : undefined}><span>{b.text}</span><small>{b.meta}</small></li>)}</ul>
    </div>
  )
}

export function Opening() {
  return (
    <section className="sc-hero" aria-labelledby="open-title">
      <h1 id="open-title" className="sc-open-title">Goodbyes can be prepared.</h1>
      <p className="sc-open-lede">Before you part, write the letters they’ll open while you’re away: one tonight, one every week, one for the day you meet again.</p>
      <div className="sc-open-actions">
        <Link to="/interview" className="ws-btn sc-start-main" data-track="cta_start" data-track-where="opening">Start your letter box<Arrow /></Link>
        <p className="sc-open-price">Free to plan and write. $9.99 when you hand it over.</p>
      </div>
    </section>
  )
}

/**
 * "Right now", the way kakaocorp.com/page does it: the title sits above a small card that already
 * shows the whole picture (story bubbles, Perigan). Once it reaches the middle of the screen it holds,
 * and the card's window opens outward until it fills the screen; the title steps down into it.
 * Nothing is scaled, so nothing is cut: the window only reveals more of what's around it.
 */
export function Now() {
  const { ref, reduced } = useProgress()
  return (
    <section ref={ref} className={`sc-now${reduced ? ' is-still' : ''}`} aria-labelledby="now-title">
      <div className="sc-now-pin">
        <div className="sc-now-window">
          <img className="sc-now-bg" src="/site/now/letters.webp" width="1376" height="768" alt="" loading="lazy" />
          <div className="sc-now-group">
            <div className="sc-rows" aria-label="Pieces of one made-up story the guide found">
              <Row items={BUBBLES[0]} />
              <Row items={BUBBLES[1]} reverse />
            </div>
            <div className="sc-now-pelican"><Mascot move="putdown" loop size={84} label="Perigan, putting a letter down" /></div>
          </div>
        </div>
        <h2 id="now-title" className="sc-now-title">While You’re Away, right now</h2>
        <p className="sc-now-sub">listening to someone’s story and making a better letter.</p>
      </div>
    </section>
  )
}

const FLOW = [
  {
    shot: 'plan',
    title: 'Tell the guide about the two of you.',
    body: 'Sign in and talk it through: why you’re apart, how often you’ll talk, what’s only yours. It suggests the letters and when each one opens. You decide what stays.',
    alt: 'The planning conversation: the guide asks how often Jae and Mina will talk, and picks up on a phrase they always say.',
  },
  {
    shot: 'chats',
    title: 'Bring in your chats, if you like.',
    body: 'Drop in a KakaoTalk, WhatsApp or iMessage export. It’s counted on your phone first: the first message, the latest night, the hours on calls. Reading it for moments is free once.',
    alt: 'Numbers from their chat: the first message “did you get home okay?”, 1,121 days of talking, 153 hours on the phone, 4:12 a.m.',
  },
  {
    shot: 'findings',
    title: 'Write, with what you found beside you.',
    body: 'Moments, the things you always say, the goodbyes before this one. Start a letter from any of them, or pin one beside your words. The words are yours; nothing writes them for you.',
    alt: 'What was found in their chats: Bikes on the Han River, Ramyeon at 2 a.m., The night the power went out, each with a question to start from.',
  },
  {
    shot: 'letter',
    title: 'The paper is made from your story.',
    body: 'The river you keep mentioning tints the box. The years you’ve talked age the paper. Short notes come out in a hand, long ones in a face that’s easy to read on a phone.',
    alt: 'A letter titled Bikes on the Han River on dotted, lightly aged paper, in handwriting, signed Jae.',
  },
  {
    shot: 'handover',
    title: 'Hand it over.',
    body: 'One private link for their phone. Nothing to install, and it keeps working without signal. You pay here, once: $9.99. Anything you write later still arrives on its day.',
    alt: 'The hand-over page: four of twenty-eight letters written, tonight’s letter ready, and a button: Make their link, $9.99.',
  },
]

export function Flow() {
  const [step, setStep] = useState(0)
  const { ref, reduced } = useProgress((p) => setStep(Math.min(FLOW.length - 1, Math.floor(p * FLOW.length * 0.999))))
  if (reduced) {
    return (
      <section className="sc-flow is-still" aria-labelledby="flow-title">
        <h2 id="flow-title" className="ws-h2 sc-flow-h">From the first question to their link.</h2>
        <ol className="sc-still-list">
          {FLOW.map((f) => (
            <li key={f.shot}>
              <Phone><img src={`/site/shots/${f.shot}.webp`} width="390" height="844" alt={f.alt} loading="lazy" /></Phone>
              <div><h3>{f.title}</h3><p>{f.body}</p></div>
            </li>
          ))}
        </ol>
      </section>
    )
  }
  return (
    <section ref={ref} className="sc-flow" style={{ '--steps': FLOW.length }} aria-labelledby="flow-title">
      <div className="sc-flow-pin">
        <div className="sc-flow-copy">
          <h2 id="flow-title" className="sc-flow-h">From the first question to their link.</h2>
          <ol className="sc-flow-steps">
            {FLOW.map((f, i) => (
              <li key={f.shot} className={i === step ? 'is-on' : i < step ? 'is-past' : ''} aria-current={i === step ? 'step' : undefined}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ol>
          <div className="sc-flow-meter" aria-hidden="true">{FLOW.map((f, i) => <span key={f.shot} className={i <= step ? 'is-on' : ''} />)}</div>
        </div>
        <Phone className="sc-flow-phone">
          {FLOW.map((f, i) => <img key={f.shot} src={`/site/shots/${f.shot}.webp`} width="390" height="844" alt={i === step ? f.alt : ''} aria-hidden={i === step ? undefined : 'true'} className={i === step ? 'is-on' : i < step ? 'is-past' : ''} loading={i ? 'lazy' : undefined} />)}
        </Phone>
      </div>
    </section>
  )
}

const WORDS = [
  { word: 'Services', to: '/services', label: 'What’s in a letter box', line: 'Seven kinds of letter, paper made from your story, and what $9.99 covers.', img: '/site/han-river-night.jpg', alt: 'Bicycles along the Han River at night.' },
  { word: 'About', to: '/about', label: 'Why this exists', line: 'The letters Jin wrote through his own goodbyes, and why the words stay yours.', img: '/site/platform-dusk.jpg', alt: 'A train platform at dusk.' },
  { word: 'Contact', to: '/contact', label: 'Ask us anything', line: 'A question before you start, or help after. A person reads every message.', img: '/site/letter-1864.jpg', alt: 'An old handwritten letter.' },
]

/** One huge word with a picture rising over it; the whole screen opens its page. */
function Word({ w }) {
  const { ref, reduced } = useProgress()
  return (
    <section ref={ref} className={`sc-word${reduced ? ' is-still' : ''}`} aria-labelledby={`word-${w.word}`}>
      <Link to={w.to} className="sc-word-pin" data-track="word_open" data-track-where={w.word.toLowerCase()}>
        <span className="sc-word-label"><span className="sc-word-name" id={`word-${w.word}`}>{w.label}</span><span className="sc-word-line">{w.line}</span><span className="sc-word-go">Open {w.word}<Arrow /></span></span>
        <span className="sc-word-big" aria-hidden="true">{w.word}</span>
        <span className="sc-word-pic"><img src={w.img} alt={w.alt} loading="lazy" /></span>
      </Link>
    </section>
  )
}

export function Words() {
  return WORDS.map((w) => <Word key={w.word} w={w} />)
}

const KIND_ART = ['crescent-moon', 'spiral-notepad', 'airplane', 'love-letter', 'glowing-star', 'birthday-cake', 'house-with-garden']
const KIND_TONE = ['#18234A', '#2B2F4A', '#1F3A4D', '#4A2C3A', '#3A3550', '#4A3A22', '#5B4A2A']

/** The seven kinds of letter as panels that open sideways (one at a time; tap, hover or focus). */
export function Kinds() {
  const [open, setOpen] = useState(0)
  return (
    <section className="sc-kinds" aria-labelledby="kinds-title">
      <h2 id="kinds-title" className="ws-h2">Seven kinds of letter,<br />one box.</h2>
      <ul className="sc-kinds-list">
        {KINDS.map((k, i) => (
          <li key={k.name} className={i === open ? 'is-open' : ''} style={{ '--tone': KIND_TONE[i] }} onMouseEnter={() => setOpen(i)}>
            <button type="button" aria-expanded={i === open} aria-controls={`kind-${i}`} onClick={() => setOpen(i)} onFocus={() => setOpen(i)}>
              <Motif id={KIND_ART[i]} size={44} />
              <span className="sc-kind-name">{k.name}</span>
            </button>
            <div className="sc-kind-body" id={`kind-${i}`} inert={i !== open}>
              <p>{k.desc}</p>
              <Link to="/services" className="ws-link">See every kind <span aria-hidden="true">↗</span></Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** The start button that floats at the bottom of the screen, like the search bar on a portal home page. */
export function StartBar() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const main = document.querySelector('.sc-start-main')
    const close = document.querySelector('.home-close')
    if (!main) return undefined
    const seen = { main: true, close: false }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === main) seen.main = e.isIntersecting
        if (e.target === close) seen.close = e.isIntersecting
      }
      setShow(!seen.main && !seen.close)
    })
    io.observe(main)
    if (close) io.observe(close)
    return () => io.disconnect()
  }, [])
  return (
    <div className={`sc-startbar${show ? ' is-on' : ''}`} inert={!show}>
      <Link to="/interview" className="sc-startbar-btn" data-track="cta_start" data-track-where="startbar">Start your letter box<Arrow /></Link>
      <span className="sc-startbar-chips" aria-hidden="true"><span>Free to plan</span><span>$9.99 at handover</span></span>
    </div>
  )
}
