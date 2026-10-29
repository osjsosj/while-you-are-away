import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { daysBetween, formatLong } from '../utils/diary'
import FlowFrame from '../components/FlowFrame'

/* Step 2: checkout. One payment unlocks the AI planning conversation and the whole letter box. */

const INCLUDED = [
  ['A planning conversation', 'We talk through your goodbye and shape the letter box around it.'],
  ['A companion while you write', 'Help finding the words, whenever you get stuck. The words stay yours.'],
  ['Every kind of letter', 'Tonight, while you’re apart, open when…, special days, the day you meet again.'],
  ['The days before', 'Collect moments, photos and voice notes before you part, each stamped with its day.'],
  ['Their private letter box', 'A link that opens on their phone, works offline, and brings their replies back to you.'],
]

export default function Paywall() {
  const navigate = useNavigate()
  const draft = getDraft()
  const p = draft.phase1 || {}
  const [email, setEmail] = useState(draft.email || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const days = p.startDate && p.endDate ? daysBetween(p.startDate, p.endDate) : null

  const pay = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter the email address you’d like the receipt and sign-in code sent to.')
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromName: p.fromName || 'Someone', toName: p.toName || 'Someone special', email: email.trim() }),
      })
      const data = await res.json()
      if (!data.url) throw new Error()
      saveDraft({ paymentSessionId: data.sessionId, email: email.trim() })
      window.location.assign(data.url)
    } catch {
      setError('Checkout couldn’t start. Try again in a moment.')
      setLoading(false)
    }
  }

  return (
    <FlowFrame step={1} narrow>
      <h1 className="wf-h1">Almost there.</h1>
      <p className="wf-lede">One payment, and we’ll plan {p.toName ? `${p.toName}’s` : 'their'} letter box together.</p>

      {p.toName && (
        <dl className="wf-card wf-summary" style={{ marginBottom: 28 }}>
          <div><dt>From</dt><dd>{p.fromName}</dd></div>
          <div><dt>For</dt><dd>{p.toName}</dd></div>
          {p.startDate && <div><dt>You part</dt><dd>{formatLong(p.startDate)}</dd></div>}
          <div><dt>You meet again</dt><dd>{p.endDate ? `${formatLong(p.endDate)}${days ? ` · ${days} days` : ''}` : 'No set date'}</dd></div>
        </dl>
      )}

      <h2 className="wf-h2">What you get</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {INCLUDED.map(([t, d]) => (
          <li key={t} style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
            <span className="wf-dot" aria-hidden="true" style={{ transform: 'translateY(-2px)' }} />
            <span><strong style={{ fontWeight: 600 }}>{t}.</strong> <span style={{ color: 'var(--mist-soft)' }}>{d}</span></span>
          </li>
        ))}
      </ul>

      <form onSubmit={pay} className="wf-paper" noValidate>
        <p style={{ margin: '0 0 6px', fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.25 }}>Pay only for the pen and paper.</p>
        <p style={{ margin: '0 0 16px', fontSize: 15, lineHeight: 1.55, color: 'var(--ink-soft)' }}>
          You bring the words, the memories, the time. That’s the real gift. We only charge what a good box of letter paper and a pen would cost.
        </p>
        <p style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0 0 4px' }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: 44, lineHeight: 1 }}>$24</span>
          <span className="wf-note">once</span>
        </p>
        <p className="wf-note" style={{ marginBottom: 20 }}>No subscription. Full refund within 14 days, for any reason. Have a code? Add it on the next page.</p>
        <label className="wf-label" htmlFor="p-email" style={{ color: 'var(--ink)' }}>Your email</label>
        <p className="wf-help" style={{ color: 'var(--ink-muted)' }}>For your receipt and a sign-in code, so you can keep writing from any device.</p>
        <input
          id="p-email"
          type="email"
          autoComplete="email"
          className="wf-input"
          style={{ background: '#fff', color: 'var(--ink)', borderColor: '#9AA4B2', colorScheme: 'light' }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error}
          aria-describedby="p-err"
        />
        {error && <p id="p-err" className="wf-error" style={{ color: '#B1453A' }}>{error}</p>}
        <button type="submit" className="wf-btn wf-btn--ink wf-btn--block" style={{ marginTop: 18 }} disabled={loading}>
          {loading ? 'Opening secure checkout…' : 'Continue to checkout'}
        </button>
        <p className="wf-fine">
          Payments are handled by Stripe. By continuing you agree to our <a href="/terms" target="_blank" rel="noopener">Terms</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>. <a href="/refunds" target="_blank" rel="noopener">Refunds</a>.
        </p>
      </form>

      <button type="button" className="wf-link" style={{ marginTop: 16 }} onClick={() => navigate('/interview')}>Change the basics</button>
    </FlowFrame>
  )
}
