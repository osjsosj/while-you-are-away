import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import FlowFrame from '../components/FlowFrame'
import { DOCS, EFFECTIVE } from './legal/docs'

/* /terms, /privacy, /refunds */
export default function Legal({ doc }) {
  const d = DOCS[doc]
  useEffect(() => {
    document.title = `${d.title} — While You're Away`
    window.scrollTo(0, 0)
  }, [d])
  return (
    <FlowFrame right={<nav className="wf-legal-nav" aria-label="Policies">
      <Link to="/terms" aria-current={doc === 'terms' ? 'page' : undefined}>Terms</Link>
      <Link to="/privacy" aria-current={doc === 'privacy' ? 'page' : undefined}>Privacy</Link>
      <Link to="/refunds" aria-current={doc === 'refunds' ? 'page' : undefined}>Refunds</Link>
    </nav>}>
      <article className="wf-legal">
        <h1 className="wf-h1">{d.title}</h1>
        <p className="wf-note">Effective {EFFECTIVE}</p>
        <p className="wf-lede" style={{ marginTop: 20 }}>{d.intro}</p>
        {d.sections.map(([h, paras]) => (
          <section key={h}>
            <h2 className="wf-h2">{h}</h2>
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </section>
        ))}
      </article>
    </FlowFrame>
  )
}
