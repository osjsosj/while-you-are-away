import { useState } from 'react'
import { getDraft } from '../utils/storage'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7.25" stroke="#C8706E" strokeWidth="1.5" />
    <path
      d="M5 8l2 2 4-4"
      stroke="#C8706E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const features = [
  {
    icon: '💬',
    title: 'AI interview',
    desc: "Claude asks the questions you didn't think to answer — building something truly yours.",
  },
  {
    icon: '🎨',
    title: 'Custom theme',
    desc: 'A name and color palette that feels like your relationship, generated just for you.',
  },
  {
    icon: '🐾',
    title: 'Pet companion',
    desc: 'A small creature to care for. Something alive in the silence.',
  },
  {
    icon: '📅',
    title: 'Timeline & memories',
    desc: 'Your important dates, anniversaries, and milestones — all in one place.',
  },
]

const guarantees = [
  'One-time payment, no subscription',
  'File stays on your device — private by design',
  'Yours to keep forever',
]

export default function Paywall() {
  const draft = getDraft()
  const { fromName, toName, startDate, endDate, regularCount } = draft.phase1 || {}
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  const days =
    start && end
      ? Math.round((end - start) / (1000 * 60 * 60 * 24))
      : null

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromName: draft.phase1?.fromName || 'Someone',
          toName: draft.phase1?.toName || 'Someone special',
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
    <div
      className="min-h-screen px-6 py-10 max-w-lg mx-auto"
      style={{ background: '#FBF4E8' }}
    >
      <div className="text-center mb-8 animate-fade-up">
        <div className="wax-seal mx-auto mb-5" style={{ fontSize: 22 }}>
          W
        </div>
        <h2
          className="font-display text-3xl italic text-ink mb-2"
          style={{ letterSpacing: '-0.02em' }}
        >
          Almost there
        </h2>
        <p className="text-text-muted text-sm font-sans font-light">
          One last step before we build something
          <br />
          <span className="text-text-mid font-medium not-italic">
            {toName ? `just for ${toName}` : 'just for them'}
          </span>
        </p>
      </div>

      {days && (
        <div className="envelope-card rounded-2xl p-5 mb-6 animate-fade-up delay-100">
          <p
            className="text-text-muted font-sans mb-4 uppercase tracking-widest"
            style={{ fontSize: 10 }}
          >
            What you've set up
          </p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted font-sans">From</span>
              <span className="font-display italic text-sm text-ink">{fromName}</span>
            </div>
            <div className="h-px bg-warm-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted font-sans">To</span>
              <span className="font-display italic text-sm text-ink">{toName}</span>
            </div>
            <div className="h-px bg-warm-100" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-muted font-sans">Time apart</span>
              <span className="font-sans text-sm text-text-mid font-medium">
                {days} days
              </span>
            </div>
            {regularCount && (
              <>
                <div className="h-px bg-warm-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted font-sans">
                    Scheduled letters
                  </span>
                  <span
                    className="font-sans text-sm font-medium"
                    style={{ color: '#C8706E' }}
                  >
                    {regularCount} set ✓
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2.5 mb-6 animate-fade-up delay-200">
        <p
          className="text-text-muted font-sans mb-3 uppercase tracking-widest"
          style={{ fontSize: 10 }}
        >
          What unlocks after payment
        </p>
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl px-4 py-3.5"
            style={{
              background: 'rgba(255,253,249,0.7)',
              border: '1px solid #E8D5B5',
            }}
          >
            <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
            <div>
              <p className="font-sans font-medium text-xs text-ink mb-0.5">
                {title}
              </p>
              <p className="font-sans text-xs text-text-muted leading-relaxed font-light">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-fade-up delay-300">
        <div
          className="rounded-2xl p-6 mb-4 text-center"
          style={{
            background: 'linear-gradient(135deg, #FAF0EF 0%, #FDF8EE 100%)',
            border: '1px solid #EFC5C4',
          }}
        >
          <div className="flex items-baseline justify-center gap-1 mb-1">
            <span
              className="font-display text-5xl italic text-ink"
              style={{ letterSpacing: '-0.03em' }}
            >
              $39
            </span>
            <span className="text-text-muted text-sm font-sans">one-time</span>
          </div>
          <p className="text-xs text-text-muted font-sans">
            No subscription. No recurring charges.
          </p>
        </div>

        {error && (
          <p
            className="text-center text-xs mb-3 font-sans"
            style={{ color: '#C8706E' }}
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="btn-primary w-full py-4 rounded-2xl text-sm mb-4"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Redirecting to Stripe...' : 'Continue to checkout →'}
        </button>

        <div className="space-y-2">
          {guarantees.map((g) => (
            <div key={g} className="flex items-center gap-2.5">
              <CheckIcon />
              <span className="text-xs text-text-muted font-sans font-light">
                {g}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-text-muted font-sans mt-8 font-light">
        Powered by Stripe · 256-bit SSL encryption
      </p>
    </div>
  )
}
