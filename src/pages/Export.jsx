import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft } from '../utils/storage'
import { generateHTML } from '../utils/htmlGenerator'

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

  const phase1 = draft.phase1 || {}
  const capsuleData = draft.capsuleData || {}
  const filledCount = Object.values(capsuleData).filter(
    (d) => d.letter || d.photo || d.voice,
  ).length

  const handleExport = async () => {
    setStatus('generating')
    try {
      const html = generateHTML(draft)
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toISOString().slice(0, 10)
      a.download = `${fileName}-${today}.html`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
    } catch (e) {
      console.error(e)
      setStatus('idle')
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="font-serif text-2xl mb-2" style={{ color: primary }}>
          Ready to send
        </h1>
        <p className="text-text-muted text-sm leading-relaxed">
          Your letter box is packed and ready.
          <br />
          Download the file and send it to {phase1.toName || 'them'}.
        </p>
      </div>

      <div className="bg-white border border-warm-200 rounded-2xl p-5 mb-6 space-y-3">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
          What's inside
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Letter box name</span>
          <span className="font-medium">{config.chosenName || '—'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Letters filled</span>
          <span
            className="font-medium"
            style={{ color: filledCount > 0 ? primary : undefined }}
          >
            {filledCount} letter{filledCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Weekly letters</span>
          <span className="font-medium">{phase1.regularCount || 10}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">Situation letters</span>
          <span className="font-medium">
            {(draft.phase2?.situationLabels || config.situationLabels || [])
              .length}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">
          File name
        </label>
        <div className="flex items-center gap-2 bg-white border border-warm-200 rounded-2xl px-4 py-3">
          <input
            value={fileName}
            onChange={(e) =>
              setFileName(e.target.value.replace(/\s+/g, '-'))
            }
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
          <span className="text-text-muted text-sm">.html</span>
        </div>
      </div>

      <div className="bg-warm-50 border border-warm-200 rounded-2xl p-4 mb-6">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
          How to share
        </div>
        {[
          { icon: '📤', text: 'Download the .html file below' },
          { icon: '💬', text: 'Send it via iMessage, WhatsApp, or email' },
          { icon: '🌐', text: 'Tell them to open it in Chrome or Safari' },
          { icon: '🔄', text: 'They can export it back to you with their replies' },
        ].map((s, i) => (
          <div key={i} className="flex gap-3 items-start mb-2 last:mb-0">
            <span className="text-base">{s.icon}</span>
            <span className="text-sm text-text-mid leading-relaxed">{s.text}</span>
          </div>
        ))}
      </div>

      {status === 'done' ? (
        <div className="space-y-2">
          <div className="w-full py-4 rounded-2xl bg-warm-100 border border-warm-200 text-center text-sm text-text-mid">
            ✅ File downloaded!
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="w-full py-3 rounded-2xl border border-warm-200 text-sm text-text-muted active:scale-95 transition-transform"
          >
            Download again ↓
          </button>
          <button
            type="button"
            onClick={() => navigate('/editor')}
            className="w-full py-3 rounded-2xl border border-warm-200 text-sm text-text-muted active:scale-95 transition-transform"
          >
            ← Go back and edit
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleExport}
          disabled={status === 'generating'}
          className="w-full py-4 rounded-2xl text-base font-medium text-white active:scale-95 transition-transform disabled:opacity-60"
          style={{ backgroundColor: primary }}
        >
          {status === 'generating'
            ? 'Building your letter box...'
            : 'Download letter box 📦'}
        </button>
      )}
    </div>
  )
}
