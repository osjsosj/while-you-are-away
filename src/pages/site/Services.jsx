import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from './SiteLayout'
import { STEPS, KINDS, INCLUDED, PRICE } from './content'

export default function Services() {
  useEffect(() => {
    document.title = 'What’s in the letter box — While You’re Away'
  }, [])

  return (
    <SiteLayout>
      <section className="ph ph--split" aria-labelledby="sv-title">
        <div>
          <h1 id="sv-title" className="ph-title">One letter box, everything in it.</h1>
          <p className="ph-lede">A secret countdown diary, letter paper an AI counselor dresses from your story, every kind of letter, and a private letter box on their phone.</p>
        </div>
        <div className="price" data-rise>
          <p className="price-big">{PRICE}</p>
          <p className="price-what">Paid once, for the whole letter box. No subscription, nothing renews.</p>
          <p className="price-what">Full refund within 14 days, for any reason.</p>
          <Link to="/interview" className="ws-btn">Start your letter box</Link>
        </div>
      </section>

      <section className="sv-steps" aria-labelledby="sv-how">
        <h2 id="sv-how" className="ws-h2" data-rise>How it works</h2>
        <ol className="steps">
          {STEPS.map((s) => (
            <li key={s.title} className="step" data-rise>
              <img src={s.img} alt={s.alt} width="600" height="1298" loading="lazy" className={s.crop ? 'shot-crop' : undefined} />
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
