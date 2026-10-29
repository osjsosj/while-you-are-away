import { useNavigate } from 'react-router-dom'
import '../styles/flow.css'

/* Shared frame for the builder pages: brand, step indicator, content column. */

const STEPS = ['The basics', 'Checkout', 'Plan it together', 'Write']

export function Mark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="11" cy="11" r="5" fill="#F0B341" />
      <circle cx="11" cy="11" r="10" fill="none" stroke="#E9ECF2" strokeWidth="1.5" />
    </svg>
  )
}

export default function FlowFrame({ step, narrow = false, right = null, children }) {
  const navigate = useNavigate()
  return (
    <div className="wf">
      <header className="wf-top">
        <div className="wf-top-inner">
          <button type="button" className="wf-brand" onClick={() => navigate('/')}>
            <Mark /> While You're Away
          </button>
          {right || (step != null && (
            <ol className="wf-steps" aria-label="Steps">
              {STEPS.map((s, i) => (
                <li key={s} className={i === step ? 'is-on' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
                  {i === step ? `${i + 1} of ${STEPS.length} · ${s}` : s}
                </li>
              ))}
            </ol>
          ))}
        </div>
      </header>
      <main className={`wf-main${narrow ? ' wf-main--narrow' : ''}`}>{children}</main>
    </div>
  )
}

export function CenterPage({ children }) {
  return (
    <div className="wf">
      <div className="wf-center">
        <div className="wf-center-card">{children}</div>
      </div>
    </div>
  )
}
