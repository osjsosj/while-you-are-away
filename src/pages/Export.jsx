import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft } from '../utils/storage'
import { generateHTML } from '../utils/htmlGenerator'

const steps = [
  { icon: '📤', text: 'Download the .html file below' },
  { icon: '💬', text: 'Send via iMessage, WhatsApp, or email' },
  { icon: '🌐', text: 'Tell them to open it in Chrome or Safari' },
  { icon: '🔄', text: 'They can export back with their replies' },
]

export default function Export() {
  const navigate = useNavigate()
  const draft = getDraft()
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState(() => {
    const name = draft.generatedConfig?.chosenName || 'letterbox'
    return name.toLowerCase().replace(/\s+/g, '-')
  })

  const config = draft.generatedConfig || {}
  const primary = config.theme?.primary || '#C8706E'
  const accent = config.theme?.accent || '#EFC5C4'
  const phase1 = draft.phase1 || {}
  const capsuleData = draft.capsuleData || {}
  const filledCount = Object.values(capsuleData).filter((d) => d.letter || d.photo || d.voice).length
  const situationCount = (draft.phase2?.situationLabels || config.situationLabels || []).length

  const handleExport = async () => {
    setStatus('generating')
    try {
      const html = generateHTML(draft)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.html`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
    } catch (e) {
      console.error(e)
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-10" style={{ background: '#FBF4E8' }}>

      {/* Hero */}
      <div className="text-center mb-8 animate-fade-up">
        {status === 'done' ? (
          <>
            <div
              className="mx-auto mb-5 flex items-center justify-center font-display italic text-white text-2xl"
              style={{ width: 64, height: 64, borderRadius: '50%', background: '#7B9E5A', boxShadow: '0 4px 16px rgba(123,158,90,0.3)' }}
            >
              ✓
            </div>
            <h1 className="font-display italic text-3xl text-ink mb-2" style={{ letterSpacing: '-0.02em' }}>
              It's on its way
            </h1>
            <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>
              Send the file to {phase1.toName || 'them'} and<br />let them open it when they're ready.
            </p>
          </>
        ) : (
          <>
            <div
              className="mx-auto mb-5 flex items-center justify-center font-display italic text-white text-2xl animate-float"
              style={{ width: 64, height: 64, borderRadius: '50%', background: primary, boxShadow: `0 4px 16px rgba(200,112,110,0.3)` }}
            >
              W
            </div>
            <h1 className="font-display italic text-3xl text-ink mb-2" style={{ letterSpacing: '-0.02em' }}>
              Ready to send
            </h1>
            <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>
              Your letter box is packed and waiting.<br />
              Download and send it to {phase1.toName || 'them'}.
            </p>
          </>
        )}
      </div>

      {/* Summary card */}
      <div
        className="rounded-2xl p-5 mb-5 animate-fade-up delay-100"
        style={{ background: '#FFFDF9', border: '1px solid #E8D5B5', boxShadow: '0 2px 12px rgba(45,31,20,0.05)' }}
      >
        <p className="font-sans text-xs uppercase tracking-widest mb-4" style={{ fontSize: 10, color: '#9B8070' }}>
          What's inside
        </p>
        {[
          { label: 'Letter box name', value: config.chosenName || '—' },
          { label: 'Letters filled', value: `${filledCount} filled`, highlight: filledCount > 0 },
          { label: 'Weekly letters', value: `${phase1.regularCount || 10} total` },
          { label: 'Moment letters', value: `${situationCount} moments` },
        ].map(({ label, value, highlight }, i, arr) => (
          <div
            key={label}
            className="flex justify-between items-center py-3"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid #F5E8D0' : 'none' }}
          >
            <span className="font-sans text-xs" style={{ color: '#9B8070', fontWeight: 300 }}>{label}</span>
            <span
              className="font-sans text-sm"
              style={{ color: highlight ? primary : '#1A1008', fontWeight: highlight ? 500 : 400 }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Filename input */}
      <div className="mb-5 animate-fade-up delay-200">
        <p className="font-sans text-xs uppercase tracking-widest mb-2" style={{ fontSize: 10, color: '#9B8070' }}>
          File name
        </p>
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5B5' }}
        >
          <input
            value={fileName}
            onChange={(e) => setFileName(e.target.value.replace(/\s+/g, '-'))}
            className="flex-1 font-sans text-sm focus:outline-none bg-transparent"
            style={{ color: '#1A1008' }}
          />
          <span className="font-sans text-sm" style={{ color: '#9B8070', fontWeight: 300 }}>.html</span>
        </div>
      </div>

      {/* How to share */}
      <div
        className="rounded-2xl p-5 mb-6 animate-fade-up delay-300"
        style={{ background: '#FFFDF9', border: `1px solid ${accent}` }}
      >
        <p className="font-sans text-xs uppercase tracking-widest mb-4" style={{ fontSize: 10, color: '#9B8070' }}>
          How to share
        </p>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div
                className="flex-shrink-0 flex items-center justify-center font-sans text-xs font-medium"
                style={{ width: 24, height: 24, borderRadius: '50%', background: '#F5E8D0', color: '#9B8070' }}
              >
                {i + 1}
              </div>
              <span className="font-sans text-sm pt-0.5" style={{ color: '#6B5040', fontWeight: 300 }}>{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="animate-fade-up delay-400">
        {status === 'done' ? (
          <div className="space-y-2">
            <div
              className="w-full py-4 rounded-2xl text-center font-sans text-sm"
              style={{ background: '#EDF6E5', border: '1px solid #C4DFB0', color: '#4A7A30' }}
            >
              File downloaded ✓
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-3.5 rounded-2xl font-sans text-sm text-text-muted"
              style={{ border: '1px solid #E8D5B5', background: '#FFFDF9' }}
            >
              Download again ↓
            </button>
            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="w-full py-3.5 rounded-2xl font-sans text-sm text-text-muted"
              style={{ border: '1px solid #E8D5B5', background: '#FFFDF9' }}
            >
              ← Go back and edit
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleExport}
            disabled={status === 'generating'}
            className="btn-primary w-full py-4 rounded-2xl font-sans text-sm"
            style={{ opacity: status === 'generating' ? 0.7 : 1 }}
          >
            {status === 'generating' ? 'Building letter box...' : `Download letter box →`}
          </button>
        )}
      </div>

      <p className="text-center font-sans text-xs mt-6" style={{ color: '#9B8070', fontWeight: 300 }}>
        The file is self-contained · No account needed to open
      </p>
    </div>
  )
}
