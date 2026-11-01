import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearDraft, saveDraft } from '../utils/storage'
import { HeroSky, EndSky, Grain, Sundial } from './landing/Sky'
import { LETTERS, STEPS, CHAPTERS, FAQ, WHO, FOUNDER_PHOTO, SCENES } from './landing/content'
import './landing/landing.css'

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

const Mark = ({ size = 22, halo = false }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
    {halo && <circle cx="11" cy="11" r="9" fill="#F0B341" opacity="0.14" />}
    <circle cx="11" cy="11" r="5" fill="#F0B341" />
    <circle cx="11" cy="11" r="10" fill="none" stroke="#E9ECF2" strokeWidth={halo ? 1 : 1.5} />
  </svg>
)

// Crossfade helper: fades out, swaps the value, fades back in.
function useCrossfade(initial, ms) {
  const [value, setValue] = useState(initial)
  const [fading, setFading] = useState(false)
  const timer = useRef(null)
  const show = useCallback(
    (next) => {
      if (prefersReducedMotion()) return setValue(next)
      clearTimeout(timer.current)
      setFading(true)
      timer.current = setTimeout(() => {
        setValue(next)
        setFading(false)
      }, ms)
    },
    [ms],
  )
  useEffect(() => () => clearTimeout(timer.current), [])
  return [value, fading, show]
}

export default function Landing() {
  const navigate = useNavigate()
  const scrollerRef = useRef(null)
  const farRef = useRef(null)
  const nearRef = useRef(null)
  const parallaxFrame = useRef(null)

  const [letterIdx, letterFading, showLetter] = useCrossfade(0, 260)
  const [paused, setPaused] = useState(false)
  const [chapterIdx, chapterFading, showChapter] = useCrossfade(0, 200)
  const [faqOpen, setFaqOpen] = useState(0)
  const [who, setWho] = useState(0)
  const [partDate, setPartDate] = useState('')
  const [active, setActive] = useState(0)
  const [hour, setHour] = useState(SCENES[0].hour)
  const [seen, setSeen] = useState(() => SCENES.map((_, i) => i === 0))

  useEffect(() => {
    document.title = "While You're Away — letters for the time apart"
  }, [])

  // Auto-advance the example letters until someone picks one
  useEffect(() => {
    if (paused || prefersReducedMotion()) return
    const t = setInterval(() => showLetter((letterIdx + 1) % LETTERS.length), 7500)
    return () => clearInterval(t)
  }, [paused, letterIdx, showLetter])

  // Scroll position → active scene, sundial hour, reveals
  useEffect(() => {
    const sc = scrollerRef.current
    if (!sc) return
    const reduce = prefersReducedMotion()
    let frame = null
    const measure = () => {
      frame = null
      const tops = Array.from(sc.querySelectorAll('[data-scene]'), (el) => el.offsetTop)
      const h = sc.clientHeight || window.innerHeight
      const probe = sc.scrollTop + h * 0.5
      let i = 0
      for (let k = 0; k < tops.length; k++) if (tops[k] <= probe) i = k
      // the hand sits exactly on a scene's time when that scene fills the screen
      let j = 0
      for (let k = 0; k < tops.length; k++) if (tops[k] <= sc.scrollTop + 1) j = k
      let hr = SCENES[j].hour
      if (j < tops.length - 1) {
        const f = Math.max(0, Math.min(1, (sc.scrollTop - tops[j]) / Math.max(1, tops[j + 1] - tops[j])))
        hr += (SCENES[j + 1].hour - SCENES[j].hour) * f
      }
      setActive(i)
      setHour(hr)
      setSeen((prev) => {
        const next = prev.map((v, k) => v || reduce || tops[k] < sc.scrollTop + h * 0.78)
        return next.every((v, k) => v === prev[k]) ? prev : next
      })
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    measure()
    sc.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      sc.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const goTo = (i) => {
    scrollerRef.current?.querySelector(`[data-scene="${i}"]`)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  }

  const moveSky = (mx, my) => {
    if (farRef.current) farRef.current.style.transform = `translate(${(mx * -6).toFixed(1)}px, ${(my * -4).toFixed(1)}px)`
    if (nearRef.current) nearRef.current.style.transform = `translate(${(mx * -14).toFixed(1)}px, ${(my * -9).toFixed(1)}px)`
  }
  const onHeroMove = (e) => {
    if (prefersReducedMotion() || parallaxFrame.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2
    parallaxFrame.current = requestAnimationFrame(() => {
      parallaxFrame.current = null
      moveSky(mx, my)
    })
  }

  const handleStart = (e) => {
    e.preventDefault()
    clearDraft()
    saveDraft({ landing: { relationship: WHO[who], startDate: partDate || '' } })
    navigate('/interview')
  }

  const reveal = (i) => `wya-inner wya-reveal${seen[i] ? '' : ' is-hidden'}`
  const letter = LETTERS[letterIdx]
  const chapter = CHAPTERS[chapterIdx]

  return (
    <div className="wya" ref={scrollerRef}>
      <Sundial hour={hour} active={active} scenes={SCENES} />

      {/* ── Night: the goodbye ── */}
      <section
        data-scene="0"
        className="wya-scene wya-hero"
        onMouseMove={onHeroMove}
        onMouseLeave={() => moveSky(0, 0)}
        aria-label="While You're Away"
      >
        <HeroSky farRef={farRef} nearRef={nearRef} />
        <header className="wya-header">
          <a href="/" className="wya-brand">
            <Mark />
            While You're Away
          </a>
          <button type="button" className="wya-btn wya-btn--outline" onClick={() => goTo(5)}>
            Start your letter box
          </button>
        </header>

        <div className="wya-hero-body">
          <div className="wya-inner">
            <div className="wya-hero-grid">
              <div className="wya-hero-copy">
                <h1 className="wya-hero-title wya-in-1">Goodbyes can be beautiful, too.</h1>
                <p className="wya-hero-lede wya-in-2">
                  Every hello feels like a gift. Goodbyes usually just happen to us. The more you prepare one, the more it can hold.
                </p>
                <p className="wya-hero-sub wya-in-2">
                  Write to them in the days before you part. They'll open it one letter at a time, for as long as you're apart.
                </p>
                <div className="wya-cta-row wya-in-3">
                  <button type="button" className="wya-btn wya-btn--light" onClick={() => goTo(5)}>
                    Start your letter box
                  </button>
                  <button type="button" className="wya-link" onClick={() => goTo(1)}>
                    See how it works
                  </button>
                </div>
              </div>

              <div className="wya-letter-col wya-in-4">
                <div className="wya-stack">
                  <div className="wya-sheet wya-sheet--a" aria-hidden="true" />
                  <div className="wya-sheet wya-sheet--b" aria-hidden="true" />
                  <article className="wya-letter" aria-live="polite">
                    <Grain id="wyaGrainLetter" />
                    <div className={`wya-letter-content${letterFading ? ' is-fading' : ''}`}>
                      <p className="wya-letter-to">{letter.to}</p>
                      <p className="wya-letter-body">{letter.body}</p>
                    </div>
                    <div className={`wya-letter-meta${letterFading ? ' is-fading' : ''}`}>
                      <span className="wya-dot" aria-hidden="true" />
                      <span>{letter.written}</span>
                    </div>
                  </article>
                </div>
                <div className="wya-tabs" role="group" aria-label="Example letters">
                  {LETTERS.map((l, i) => (
                    <button
                      key={l.label}
                      type="button"
                      className="wya-pill wya-pill--dark"
                      aria-pressed={i === letterIdx}
                      onClick={() => { setPaused(true); if (i !== letterIdx) showLetter(i) }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Before dawn: how it works ── */}
      <section data-scene="1" className="wya-scene wya-how" aria-labelledby="wya-how-title">
        <div className={reveal(1)}>
          <h2 id="wya-how-title" className="wya-h2" style={{ maxWidth: '18em' }}>
            You prepare the goodbye. They get something to hold on to.
          </h2>
          <p className="wya-lede">You bring the words and the memories. We turn them into a box they can open, one letter at a time.</p>
          <ol className="wya-flow">
            {STEPS.map((s, i) => (
              <li key={s.title} className={`wya-flow-step${s.now ? ' wya-step--now' : ''}`}>
                <div className="wya-shot"><img src={s.img} alt={s.alt} width="300" height="649" loading="lazy" decoding="async" /></div>
                <p className="wya-step-when"><span className="wya-flow-n">{i + 1}</span>{s.when}</p>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Morning: what they receive ── */}
      <section data-scene="2" className="wya-scene wya-receive" aria-labelledby="wya-receive-title">
        <div className={reveal(2)}>
          <div className="wya-receive-grid">
            <div className="wya-phone-col">
              <div className="wya-video-phone">
                <video src="/landing/opening.mp4" poster="/landing/opening-poster.webp" autoPlay={!prefersReducedMotion()} controls={prefersReducedMotion()} muted loop playsInline preload="metadata" aria-label="A recording of a letter box being opened: the seal, a short photo film, the letters, a letter with a taped photo and a folded note" />
              </div>
            </div>
            <div className="wya-receive-copy">
              <h2 id="wya-receive-title" className="wya-h2">Everything you wrote, in one place they can carry.</h2>
              <p className="wya-lede">
                A private letter box on their phone, dressed in your story. It opens with a short film of your photos and your voice, works offline, counts down with them, and lets them write back to every letter.
              </p>
              <div className="wya-chips" role="group" aria-label="Kinds of letters">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.label}
                    type="button"
                    className="wya-pill wya-pill--light"
                    aria-pressed={i === chapterIdx}
                    onClick={() => { if (i !== chapterIdx) showChapter(i) }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <div className={`wya-chapter${chapterFading ? ' is-fading' : ''}`} aria-live="polite">
                <p className="wya-chapter-desc">{chapter.desc}</p>
                <p className="wya-chapter-example">{chapter.example}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Afternoon: questions ── */}
      <section data-scene="3" className="wya-scene wya-faq-scene" aria-labelledby="wya-faq-title">
        <div className={reveal(3)}>
          <div className="wya-faq-grid">
            <h2 id="wya-faq-title" className="wya-h2">Questions people ask</h2>
            <div className="wya-faq">
              {FAQ.map((f, i) => {
                const open = i === faqOpen
                return (
                  <div key={f.q} className={`wya-faq-item${open ? ' is-open' : ''}`}>
                    <h3>
                      <button
                        type="button"
                        className="wya-faq-btn"
                        aria-expanded={open}
                        aria-controls={`wya-faq-${i}`}
                        onClick={() => setFaqOpen(open ? -1 : i)}
                      >
                        <span>{f.q}</span>
                        <span className="wya-faq-sign" aria-hidden="true">+</span>
                      </button>
                    </h3>
                    <div className="wya-faq-panel" id={`wya-faq-${i}`}>
                      <div><p>{f.a}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dusk: why I made this ── */}
      <section data-scene="4" className="wya-scene wya-why" aria-labelledby="wya-why-title">
        <div className={reveal(4)}>
          <div className="wya-why-grid">
            {FOUNDER_PHOTO && (
              <div className="wya-why-photo">
                <img src={FOUNDER_PHOTO} alt="Jin, founder of While You're Away" />
              </div>
            )}
            <div className="wya-why-copy">
              <h2 id="wya-why-title" className="wya-why-h">Why I made this</h2>
              <p className="wya-why-roles">I'm a soldier. A student far from home. A son. Someone's partner. Someone's best friend.</p>
              <div className="wya-why-body">
                <p>
                  Each of those has come with a goodbye. The last night before basic training, holding on until we ran out of tears. An airport bus I boarded with a straight face, then cried on the whole way. A phone call telling me my closest friend was gone. A hospital room, my mother beside me, when the doctor said my father might not wake up.
                </p>
                <p>Every time, gifts and good dinners felt like grasping at straws. Even “I love you” couldn't carry it. What stayed with me were the words I hadn't said.</p>
                <p>
                  So I started writing them down: the days we'd had, the things I'd never said out loud, the future I hoped for. While You're Away is that letter box, made for anyone with a goodbye coming.
                </p>
                <p>We won't write it for you. It will be as good as the care you put in, and we're here to help you get every bit of it onto the page.</p>
              </div>
              <p className="wya-sign">Jin, founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Night again: start ── */}
      <section data-scene="5" className="wya-scene wya-start" aria-labelledby="wya-start-title">
        <EndSky />
        <div className="wya-start-body">
          <div className={reveal(5)}>
            <div className="wya-start-grid">
              <div className="wya-start-copy">
                <Mark size={40} halo />
                <h2 id="wya-start-title" className="wya-h2">Leave the light on for them.</h2>
                <p className="wya-lede">
                  Start a month before you part, or a week. Give them something to hold on to, and a kind of waiting that feels less like waiting.
                </p>
                <p className="wya-price">Pay only for the pen and paper: $24, once, for the whole letter box. No subscription, and a full refund within 14 days.</p>
              </div>

              <form className="wya-form" onSubmit={handleStart}>
                <Grain id="wyaGrainForm" />
                <fieldset>
                  <legend>Who are you writing to?</legend>
                  <div className="wya-who">
                    {WHO.map((w, i) => (
                      <button key={w} type="button" className="wya-pill wya-pill--light" aria-pressed={i === who} onClick={() => setWho(i)}>
                        {w}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="wya-date">When do you part?</label>
                <input
                  id="wya-date"
                  className="wya-input"
                  type="date"
                  value={partDate}
                  onChange={(e) => setPartDate(e.target.value)}
                />
                <button type="submit" className="wya-btn wya-btn--ink">Start your letter box</button>
                <p className="wya-form-note">Free to start. You pay only when you're ready to build the box.</p>
              </form>
            </div>
          </div>
        </div>
        <footer className="wya-footer">
          <span>While You're Away</span>
          <span className="wya-footer-links">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/refunds">Refunds</a>
            <a href="mailto:hello@getwhileyouareaway.com">hello@getwhileyouareaway.com</a>
          </span>
        </footer>
      </section>
    </div>
  )
}
