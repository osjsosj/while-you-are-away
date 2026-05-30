import { useState } from 'react'
import { getDraft } from '../utils/storage'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.25" stroke="#C8706E" strokeWidth="1.5"/>
    <path d="M5 8l2 2 4-4" stroke="#C8706E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const features = [
  { icon: '💬', title: 'AI interview', desc: 'Claude asks the questions you didn\'t think to answer — building something truly yours.' },
  { icon: '🎨', title: 'Custom theme', desc: 'A name and color palette that feels like your relationship, generated just for you.' },
  { icon: '🐾', title: 'Pet companion', desc: 'A small creature to care for. Something alive in the silence.' },
  { icon: '📅', title: 'Timeline & memories', desc: 'Your important dates, anniversaries, and milestones — all in one place.' },
]

const guarantees = [
  'One-time payment, no subscription',
  'File stays on your device — private by design',
  'Yours to keep forever',
]

export default function Paywall() {
  const draft = getDraft()
  const { fromName, toName, startDate, endDate, regularCount } = draft.phase1 || {}
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  const days = start && end ? Math.round((end - start) / (1000 * 60 * 60 * 24)) : null

  const handlePay = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: draft.phase1?.fromName || 'Someone',
          toName: draft.phase1?.toName || 'Someone special',
          email: email.trim(),
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Payment setup failed. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-5 py-10 max-w-lg mx-auto" style={{ background: '#FBF4E8' }}>

      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="wax-seal mx-auto mb-5" style={{ fontSize: 22 }}>W</div>
        <h2 className="font-display text-3xl italic text-ink mb-2" style={{ letterSpacing: '-0.02em' }}>
          Almost there
        </h2>
        <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>
          One last step before we build something<br />
          <span className="text-text-mid font-medium">
            {toName ? `just for ${toName}` : 'just for them'}
          </span>
        </p>
      </div>

      {/* Summary card */}
      {days && (
        <div className="envelope-card rounded-2xl p-5 mb-6 animate-fade-up delay-100">
          <p className="font-sans text-xs mb-4 uppercase tracking-widest" style={{ fontSize: 10, color: '#9B8070' }}>
            What you've set up
          </p>
          <div className="space-y-3">
            {[
              { label: 'From', value: fromName, display: true },
              { label: 'To', value: toName, display: true },
              { label: 'Time apart', value: `${days} days`, display: true },
              { label: 'Scheduled letters', value: `${regularCount} set ✓`, highlight: true, display: !!regularCount },
            ].filter(r => r.display).map(({ label, value, highlight }, i, arr) => (
              <div key={label}>
                <div className="flex justify-between items-center">
                  <span className="font-sans text-xs" style={{ color: '#9B8070', fontWeight: 300 }}>{label}</span>
                  <span
                    className="font-sans text-sm"
                    style={{ color: highlight ? '#C8706E' : '#1A1008', fontWeight: highlight ? 500 : 400 }}
                  >
                    {highlight
                      ? value
                      : <span className="font-display italic">{value}</span>
                    }
                  </span>
                </div>
                {i < arr.length - 1 && <div className="h-px mt-3" style={{ background: '#F5E8D0' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="space-y-2.5 mb-6 animate-fade-up delay-200">
        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ fontSize: 10, color: '#9B8070' }}>
          What unlocks after payment
        </p>
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{ background: 'rgba(255,253,249,0.7)', border: '1px solid #E8D5B5' }}
          >
            <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="font-sans font-medium text-xs mb-0.5" style={{ color: '#1A1008' }}>{title}</p>
              <p className="font-sans text-xs leading-relaxed" style={{ color: '#9B8070', fontWeight: 300 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Price + email + CTA */}
      <div className="animate-fade-up delay-300">
        <div
          className="rounded-2xl p-6 mb-4 text-center"
          style={{ background: 'linear-gradient(135deg, #FAF0EF 0%, #FDF8EE 100%)', border: '1px solid #EFC5C4' }}
        >
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span className="font-display text-5xl italic text-ink" style={{ letterSpacing: '-0.03em' }}>$39</span>
            <span className="font-sans text-sm" style={{ color: '#9B8070', fontWeight: 300 }}>one-time</span>
          </div>
          <p className="font-sans text-xs" style={{ color: '#9B8070', fontWeight: 300 }}>No subscription. No recurring charges.</p>
        </div>

        {/* Email input — 저장/복구용 */}
        <div className="mb-4">
          <label className="font-sans text-xs block mb-2" style={{ color: '#9B8070', fontWeight: 300 }}>
            Your email — to save your progress across devices
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePay()}
            placeholder="you@example.com"
            className="w-full font-sans text-sm focus:outline-none"
            style={{
              background: '#FFFDF9', border: `1px solid ${error ? '#C8706E' : '#E8D5B5'}`,
              borderRadius: 16, padding: '13px 16px', color: '#1A1008',
              transition: 'border-color .2s',
            }}
          />
          {!error && (
            <p className="font-sans mt-1.5" style={{ fontSize: 10, color: '#9B8070', fontWeight: 300 }}>
              We'll send a link to continue from any device — no password needed.
            </p>
          )}
          {error && (
            <p className="font-sans mt-1.5" style={{ fontSize: 11, color: '#C8706E' }}>{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="btn-primary w-full py-4 rounded-2xl font-sans text-sm mb-4"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Redirecting to Stripe...' : 'Continue to checkout →'}
        </button>

        {/* Guarantees */}
        <div className="space-y-2">
          {guarantees.map((g) => (
            <div key={g} className="flex items-center gap-2.5">
              <CheckIcon />
              <span className="font-sans text-xs" style={{ color: '#9B8070', fontWeight: 300 }}>{g}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center font-sans text-xs mt-8" style={{ color: '#9B8070', fontWeight: 300 }}>
        Powered by Stripe · 256-bit SSL encryption
      </p>
    </div>
  )
}
