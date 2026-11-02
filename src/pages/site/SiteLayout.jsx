import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACT } from './content'
import './site.css'

const LINKS = [
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
]

/** Section parts rise in once as they enter. Without the observer (or with reduced motion) nothing is ever hidden. */
function useRise() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const els = [...document.querySelectorAll('[data-rise]')]
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.dataset.rise = 'in'
        io.unobserve(e.target)
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    for (const el of els) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) continue
      el.dataset.rise = 'wait'
      io.observe(el)
    }
    return () => io.disconnect()
  }, [pathname])
}

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' })
}

export default function SiteLayout({ children, cinematic = false, background = null }) {
  const { pathname } = useLocation()
  useRise()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const bar = (
    <>
      <Link to="/" className="ws-mark" aria-label="While You’re Away, home">
        <span className="ws-mark-dot" aria-hidden="true" />
        While You’re Away
      </Link>
      <nav aria-label="Main">
        <ul className="ws-nav">
          {LINKS.map(([to, label]) => (
            <li key={to}><NavLink to={to}>{label}</NavLink></li>
          ))}
        </ul>
      </nav>
      <details className="ws-mobile-menu">
        <summary>Main menu <span aria-hidden="true">+</span></summary>
        <nav aria-label="Mobile main">
          <ul>{LINKS.map(([to, label]) => <li key={to}><NavLink to={to}>{label}</NavLink></li>)}</ul>
        </nav>
      </details>
    </>
  )

  return (
    <div className={cinematic ? 'ws ws--cinematic' : 'ws'}>
      {background}
      <a className="ws-skip" href="#main">Skip to content</a>
      <header className="ws-bar">
        {bar}
      </header>

      <main id="main">{children}</main>

      <footer className="ws-foot">
        <div data-rise className="ws-tile ws-tile--say">
          <p>Letters for the time apart, written before you part.</p>
          <p className="ws-legal"><span>© 2026 Sangjin Ouh</span><span><Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/refunds">Refunds</Link></span></p>
        </div>
        <nav data-rise className="ws-tile ws-tile--nav" aria-label="Footer">
          <ul>
            <li><Link to="/">Home</Link></li>
            {LINKS.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}
          </ul>
        </nav>
        <div data-rise className="ws-tile ws-tile--time">
          <p>California</p>
          <p className="ws-time"><LocalTime /></p>
        </div>
        <div data-rise className="ws-tile ws-tile--mail">
          <p>Write to us</p>
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </div>
        <div data-rise className="ws-tile ws-tile--word" aria-hidden="true">While You’re Away</div>
        <Link to="/contact" data-rise className="ws-tile ws-tile--go">
          <span>Questions before you start?</span>
          <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><path d="M10 38 38 10M16 10h22v22" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
        <p className="ws-credits">
          Pictures: <a href="https://commons.wikimedia.org/wiki/File:Toyama_Station_platform_at_dusk_2015-03-13.jpg">“Toyama Station platform at dusk”</a> by squeuei, <a href="https://creativecommons.org/licenses/by/2.0">CC BY 2.0</a>;{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Sunset_and_stars_over_St%C3%A5ngehuvud.jpg">“Sunset and stars over Stångehuvud”</a> by W.carter, <a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en">CC0</a>;{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Handwritten_Letter_to_D._H._Cook_from_Carolina_Cook_-_DPLA_-_56162c270f60b61e1a3ee47c3f7b5a3f_(page_1).jpg">“Handwritten Letter to D. H. Cook from Carolina Cook”</a>, public domain;{" "}
          <a href="https://commons.wikimedia.org/wiki/File:Bicycles_along_Han_River_at_night_20240430191634.jpg">“Bicycles along Han River at night”</a> by TurnOnTheNight, <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>. All via Wikimedia Commons.
        </p>
      </footer>
    </div>
  )
}
