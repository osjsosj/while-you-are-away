import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import { STEPS, KINDS, INCLUDED, PRICE } from './content'
import { Phone } from './Scenes'
import './scenes.css'

export default function Services() {
  useEffect(() => {
    document.title = 'What’s in the letter box — While You’re Away'
  }, [])

  return (
    <SiteLayout>
      <section className="ph ph--split" aria-labelledby="sv-title">
        <div>
          <h1 id="sv-title" className="ph-title">One letter box, everything in it.</h1>
          <p className="ph-lede">Plan it with a guide, bring in your chats, write every letter yourself, and hand over a private letter box that opens on their phone over the time apart.</p>
        </div>
        <div className="price" data-rise>
          <p className="price-big">{PRICE}</p>
          <p className="price-what">Paid once, when you hand it over. Planning and writing are free until then.</p>
          <p className="price-what">No subscription, nothing renews.</p>
          <p className="price-what">Full refund within 14 days, for any reason.</p>
          <Link to="/interview" className="ws-btn" data-track="cta_start" data-track-where="services">Start your letter box</Link>
        </div>
      </section>

      <section className="sv-steps" aria-labelledby="sv-how">
        <h2 id="sv-how" className="ws-h2" data-rise>How it works</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.title} className="step" data-rise>
              <Phone className="step-phone"><img src={`/site/shots/${s.shot}.webp`} width="390" height="844" alt={s.alt} loading="lazy" /></Phone>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-body">{s.body}</p>
              <p className="step-when">{s.when}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sv-kinds" aria-labelledby="sv-kinds">
        <h2 id="sv-kinds" className="ws-h2" data-rise>Seven kinds of letter</h2>
        <dl className="kinds">
          {KINDS.map((k, i) => (
            <div key={k.name} className={i === KINDS.length - 1 ? 'kind kind--seal' : 'kind'} data-rise>
              <dt>{k.name}</dt>
              <dd>{k.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sv-inc" aria-labelledby="sv-inc">
        <h2 id="sv-inc" className="ws-h2" data-rise>What’s included</h2>
        <ul className="inc">
          {INCLUDED.map(([t, d]) => (
            <li key={t} data-rise>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ul>
        <p className="ws-small sv-fine">Details in our <Link to="/terms">terms</Link> and <Link to="/refunds">refund policy</Link>.</p>
      </section>
    </SiteLayout>
  )
}
