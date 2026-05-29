import { useNavigate } from 'react-router-dom'
import { getDraft } from '../utils/storage'

export default function Paywall() {
  const navigate = useNavigate()
  const draft = getDraft()
  const { fromName, toName, startDate, endDate, regularCount } = draft.phase1 || {}

  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  const days =
    start && end
      ? Math.round((end - start) / (1000 * 60 * 60 * 24))
      : null

  const handlePay = () => navigate('/ai-interview')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto">
      <div className="text-4xl mb-4">💌</div>
      <h2 className="font-serif text-2xl text-rose-dark mb-2 text-center">
        Almost there
      </h2>
      <p className="text-text-muted text-sm text-center mb-8 leading-relaxed">
        Let's finish building something truly special
        <br />
        for {toName || 'the one you love'}
      </p>

      {days && (
        <div className="w-full bg-white border border-warm-200 rounded-2xl p-5 mb-8 space-y-2">
          <div className="text-xs text-text-muted font-medium mb-3">
            What you've entered so far
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">From</span>
            <span className="font-medium">{fromName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">To</span>
            <span className="font-medium">{toName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-muted">Time apart</span>
            <span className="font-medium">{days} days</span>
          </div>
          {regularCount && (
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Scheduled letters</span>
              <span className="font-medium text-rose">
                {regularCount} auto-set ✓
              </span>
            </div>
          )}
        </div>
      )}

      <div className="w-full space-y-3 mb-8">
        {[
          {
            icon: '💬',
            title: 'AI-guided interview',
            desc: 'A warm conversation that remembers everything you share',
          },
          {
            icon: '🎨',
            title: 'Custom theme generation',
            desc: 'Colors and a name that feel uniquely yours',
          },
          {
            icon: '🐾',
            title: 'Pet & timeline',
            desc: 'A companion to care for and moments to look back on',
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 bg-warm-50 rounded-2xl px-4 py-3"
          >
            <span className="text-xl">{item.icon}</span>
            <div>
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handlePay}
        className="w-full bg-rose text-white py-4 rounded-2xl text-base font-medium active:scale-95 transition-transform mb-3"
      >
        Get started — $39
      </button>
      <p className="text-xs text-text-muted">
        One-time payment · Yours to keep forever
      </p>
    </div>
  )
}
