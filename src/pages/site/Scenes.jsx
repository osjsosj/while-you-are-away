import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from './useScrollScene'

/*
 * The home page's two scroll scenes, both built on real screens of the product (public/site/shots,
 * made with scripts/shots/capture.mjs from a made-up letter box):
 *  - Opening: the headline, then their letter box rises and grows until it fills the screen.
 *  - Flow: the phone stays put while the five steps of making a letter box pass by its side.
 * Native scrolling drives both; only a visible scene does any work, and reduced motion gets a still page.
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

export function Opening() {
  const { ref, reduced } = useProgress()
  const copy = useRef(null)
  const phone = useRef(null)
  // where the phone starts: just under the words, however tall they wrap on this screen
  useLayoutEffect(() => {
    if (reduced) return undefined
    const place = () => {
      const node = ref.current
      if (!node || !copy.current || !phone.current) return
      const vh = window.innerHeight
      const h = phone.current.offsetHeight
      const top = copy.current.offsetTop + copy.current.offsetHeight + 28
      node.style.setProperty('--start', `${Math.round(top + h * 0.25 - vh / 2)}px`)
    }
    place()
    // the words reflow as fonts arrive and on rotation: place again whenever they change size
    const ro = new ResizeObserver(place)
    ro.observe(copy.current)
    window.addEventListener('resize', place)
    return () => { ro.disconnect(); window.removeEventListener('resize', place) }
  }, [ref, reduced])
  return (
    <section ref={ref} className={`sc-open${reduced ? ' is-still' : ''}`} aria-labelledby="open-title">
      <div className="sc-open-pin">
        <div className="sc-open-copy" ref={copy}>
          <h1 id="open-title" className="sc-open-title">Goodbyes can be prepared.</h1>
          <p className="sc-open-lede">Before you part, write the letters they’ll open while you’re away: one tonight, one every week, one for the day you meet again.</p>
          <div className="sc-open-actions">
            <Link to="/interview" className="ws-btn" data-track="cta_start" data-track-where="opening">Start your letter box<Arrow /></Link>
            <p className="sc-open-price">Free to plan and write. $9.99 when you hand it over.</p>
          </div>
        </div>
        <div className="sc-open-fill" aria-hidden="true" />
        <div className="sc-open-stage">
          <Phone className="sc-open-phone" ref={phone}>
            <img src="/site/shots/box.webp" width="390" height="844" alt="Mina’s letter box on her phone: a seal with their initials, rings of their months of messages, stamps of two moments, and a pelican pointing at the letter that’s ready." fetchpriority="high" />
          </Phone>
          <p className="sc-open-caption" aria-hidden={reduced ? undefined : 'true'}>This is what they open.<span>A letter box on their phone, dressed in your story.</span></p>
        </div>
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
