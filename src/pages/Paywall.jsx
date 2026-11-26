import { track, trackingId } from '../utils/track'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { daysBetween, formatLong } from '../utils/diary'
import FlowFrame from '../components/FlowFrame'
import { timedFetch } from '../utils/net'

/* The last step: checkout at handover. Planning and writing were free; paying makes their link and raises the AI limits. */

// the two ways to hand it over; both are paid once
const TIERS = [
  { id: 'box', price: '$9.99', name: 'The letter box', line: 'Their private link, every letter on its day, their replies back to you.' },
  { id: 'keepsake', price: '$19.99', name: 'The letter box + keepsake book', line: 'Everything above, plus every letter and reply gathered into a book to print or save as a PDF. For both of you, on the day you meet again.' },
]

const INCLUDED = [
  ['Their private letter box', 'A link that opens on their phone, works offline, and brings their replies back to you.'],
  ['Every letter, on its day', 'Tonight, while you’re apart, open when…, special days, the day you meet again.'],
  ['Keep writing after', 'Anything you add later shows up in their box, for as long as you’re apart.'],
  ['More help while you write', 'Many more companion messages, and up to three readings of your chats.'],
]

export default function Paywall() {
  const navigate = useNavigate()
  const draft = getDraft()
  const p = draft.phase1 || {}
  const [email, setEmail] = useState(draft.email || '')
  const [tier, setTier] = useState('box')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const limit = new URLSearchParams(window.location.search).get('reason') === 'limit'

  const days = p.startDate && p.endDate ? daysBetween(p.startDate, p.endDate) : null

  const pay = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter the email address you’d like the receipt sent to.')
    setLoading(true)
    setError('')
    try {
      track('checkout_start', { kind: tier })
      const res = await timedFetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, fromName: p.fromName || 'Someone', toName: p.toName || 'Someone special', email: email.trim(), anonId: trackingId() }),
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
    <FlowFrame step={4} narrow>
      <h1 className="wf-h1">{limit ? 'You’ve used the free help.' : 'Ready to hand it over.'}</h1>
      <p className="wf-lede">{limit
        ? `Everything you wrote is saved. One payment makes ${p.toName ? `${p.toName}’s` : 'their'} link and gives you much more help from the guide.`
        : `One payment, and ${p.toName ? `${p.toName}’s` : 'their'} letter box gets its own private link.`}</p>

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
        <fieldset className="pw-tiers">
          <legend className="wf-label" style={{ color: 'var(--ink)' }}>Choose one</legend>
          {TIERS.map((t) => (
            <label key={t.id} className={`pw-tier${tier === t.id ? ' is-on' : ''}`}>
              <input type="radio" name="tier" value={t.id} checked={tier === t.id} onChange={() => setTier(t.id)} />
              <span className="pw-tier-text">
                <span className="pw-tier-head"><span className="pw-tier-name">{t.name}</span><span className="pw-tier-price">{t.price}</span></span>
                <span className="pw-tier-line">{t.line}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="wf-note" style={{ marginBottom: 20 }}>Paid once. No subscription. You can add the keepsake later for $10. Full refund within 14 days, for any reason. Have a code? Add it on the next page.</p>
        <label className="wf-label" htmlFor="p-email" style={{ color: 'var(--ink)' }}>Your email</label>
        <p className="wf-help" style={{ color: 'var(--ink-muted)' }}>For your receipt.</p>
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

      <button type="button" className="wf-link" style={{ marginTop: 16 }} onClick={() => navigate('/editor')}>Back to your letters</button>
    </FlowFrame>
  )
}
