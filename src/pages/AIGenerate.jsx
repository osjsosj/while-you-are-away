import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { generateLetterboxConfig } from '../utils/aiService'

function LoadingScreen() {
  const [dotStep, setDotStep] = useState(0)
  const lines = [
    'Reading everything you shared...',
    'Choosing colors that feel like you...',
    'Writing a welcome message...',
    'Putting it all together...',
  ]
  useEffect(() => {
    const t = setInterval(() => setDotStep(s => (s + 1) % lines.length), 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#FBF4E8' }}>
      <div className="mb-8" style={{ animation: 'float 3s ease-in-out infinite' }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#E8D5B5" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="38" stroke="#C8706E" strokeWidth="1.5"
            strokeDasharray="239" strokeDashoffset="60"
            style={{ animation: 'spin 3s linear infinite', transformOrigin: '40px 40px' }} />
          <text x="40" y="46" textAnchor="middle"
            style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: 22, fill: '#C8706E' }}>
            W
          </text>
        </svg>
      </div>
      <h2 className="font-display italic text-2xl text-ink mb-3 text-center" style={{ letterSpacing: '-0.02em' }}>
        Creating something<br />just for you
      </h2>
      <p
        className="font-sans text-sm text-text-muted text-center transition-all duration-500"
        style={{ fontWeight: 300, minHeight: 20 }}
        key={dotStep}
      >
        {lines[dotStep]}
      </p>
      <style>{`@keyframes spin { from { stroke-dashoffset: 239; } to { stroke-dashoffset: 0; } }`}</style>
    </div>
  )
}

export default function AIGenerate() {
  const navigate = useNavigate()
  const draft = getDraft()
  const [status, setStatus] = useState('loading')
  const [config, setConfig] = useState(null)
  const [selectedName, setSelectedName] = useState(0)
  const [editingName, setEditingName] = useState(false)
  const [customName, setCustomName] = useState('')

  useEffect(() => { generate() }, [])

  const generate = async () => {
    setStatus('loading')
    const allData = { ...draft.phase1, ...draft.phase2 }
    const result = await generateLetterboxConfig(allData)
    if (!result) { setStatus('error'); return }
    setConfig(result)
    setCustomName(result.appNames?.[0] || '')
    setStatus('done')
  }

  const handleConfirm = () => {
    const finalName = editingName
      ? customName
      : config.appNames?.[selectedName] || customName
    saveDraft({ generatedConfig: { ...config, chosenName: finalName } })
    navigate('/editor')
  }

  if (status === 'loading') return <LoadingScreen />

  if (status === 'error') return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-8" style={{ background: '#FBF4E8' }}>
      <div className="wax-seal" style={{ width: 48, height: 48, fontSize: 20 }}>!</div>
      <p className="font-display italic text-xl text-ink text-center">Something went wrong</p>
      <p className="font-sans text-sm text-text-muted text-center" style={{ fontWeight: 300 }}>
        Let's try again — your info is still saved.
      </p>
      <button type="button" onClick={generate} className="btn-primary px-8 py-3 rounded-2xl text-sm">
        Try again
      </button>
    </div>
  )

  const { appNames = [], theme = {}, welcomeMessage = '', situationLabels = [] } = config
  const primary = theme.primary || '#C8706E'
  const secondary = theme.secondary || '#FBF4E8'
  const accent = theme.accent || '#EFC5C4'
  const chosenNameDisplay = editingName ? customName : (appNames[selectedName] || 'Your Letter Box')

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-8" style={{ background: '#FBF4E8' }}>

      {/* Header */}
      <div className="text-center mb-7 animate-fade-up">
        <p className="font-sans text-xs mb-3 uppercase tracking-widest" style={{ fontSize: 10, color: '#9B8070' }}>
          Here's what we made
        </p>
        <h1 className="font-display italic text-3xl text-ink" style={{ letterSpacing: '-0.02em' }}>
          Your letter box
        </h1>
      </div>

      {/* Preview card */}
      <div
        className="rounded-2xl overflow-hidden mb-6 animate-fade-up delay-100"
        style={{ boxShadow: '0 4px 24px rgba(45,31,20,0.1)', border: '1px solid rgba(232,213,181,0.5)' }}
      >
        {/* Header band - uses AI-generated primary color */}
        <div className="px-6 pt-6 pb-5" style={{ background: primary }}>
          <p className="font-sans text-xs mb-2" style={{ color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>
            From {draft.phase1?.fromName} · To {draft.phase1?.toName}
          </p>
          {editingName ? (
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="font-display italic text-xl text-white w-full focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 8px', border: 'none' }}
            />
          ) : (
            <h2 className="font-display italic text-2xl text-white mb-1" style={{ letterSpacing: '-0.01em' }}>
              {chosenNameDisplay}
            </h2>
          )}
          <p className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 300 }}>
            {welcomeMessage}
          </p>
        </div>

        {/* Situation tags - uses AI secondary color */}
        <div className="px-5 py-4" style={{ background: secondary }}>
          <div className="flex gap-2 flex-wrap">
            {situationLabels.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="font-sans text-xs px-3 py-1.5 rounded-full"
                style={{
                  border: `1px solid ${accent}`,
                  color: primary,
                  background: 'rgba(255,255,255,0.7)',
                }}
              >
                {s.emoji} {s.label}
              </span>
            ))}
            {situationLabels.length > 3 && (
              <span
                className="font-sans text-xs px-3 py-1.5 rounded-full"
                style={{ border: '1px solid #E8D5B5', color: '#9B8070', background: 'rgba(255,255,255,0.7)' }}
              >
                +{situationLabels.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Name selection */}
      <div className="mb-6 animate-fade-up delay-200">
        <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ fontSize: 10, color: '#9B8070' }}>
          Choose a name
        </p>
        <div className="space-y-2">
          {appNames.map((name, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setSelectedName(i); setEditingName(false) }}
              className="w-full text-left px-4 py-3.5 rounded-2xl font-sans text-sm transition-all"
              style={{
                background: !editingName && selectedName === i ? 'rgba(200,112,110,0.06)' : '#FFFDF9',
                border: `1px solid ${!editingName && selectedName === i ? '#C8706E' : '#E8D5B5'}`,
                color: !editingName && selectedName === i ? '#C8706E' : '#2D1F14',
                fontWeight: !editingName && selectedName === i ? 500 : 400,
              }}
            >
              {name}
              {!editingName && selectedName === i && (
                <span className="ml-2 font-sans text-xs" style={{ color: '#C8706E' }}>✓</span>
              )}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setEditingName(true); setCustomName('') }}
            className="w-full text-left px-4 py-3.5 rounded-2xl font-sans text-sm transition-all"
            style={{
              background: editingName ? 'rgba(200,112,110,0.06)' : '#FFFDF9',
              border: `1px solid ${editingName ? '#C8706E' : '#E8D5B5'}`,
              color: editingName ? '#C8706E' : '#9B8070',
            }}
          >
            Write my own name...
          </button>
        </div>
        {editingName && (
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Type your letter box name..."
            autoFocus
            className="mt-2 w-full font-sans text-sm focus:outline-none"
            style={{
              background: '#FFFDF9', border: '1px solid #C8706E',
              borderRadius: 16, padding: '12px 16px', color: '#2D1F14',
            }}
          />
        )}
      </div>

      {/* Situation letters list */}
      {situationLabels.length > 0 && (
        <div className="mb-7 animate-fade-up delay-300">
          <p className="font-sans text-xs uppercase tracking-widest mb-3" style={{ fontSize: 10, color: '#9B8070' }}>
            Moment letters ({situationLabels.length})
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: '#FFFDF9', border: '1px solid #E8D5B5' }}
          >
            {situationLabels.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < situationLabels.length - 1 ? '1px solid #F5E8D0' : 'none' }}
              >
                <span className="text-xl flex-shrink-0">{s.emoji}</span>
                <div>
                  <p className="font-sans text-sm font-medium" style={{ color: '#1A1008' }}>{s.label}</p>
                  {s.hint && <p className="font-sans text-xs" style={{ color: '#9B8070', fontWeight: 300 }}>{s.hint}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="animate-fade-up delay-400">
        <button type="button" onClick={handleConfirm} className="btn-primary w-full py-4 rounded-2xl text-sm font-sans mb-2">
          Looks great — write letters →
        </button>
        <button
          type="button"
          onClick={generate}
          className="w-full py-3 font-sans text-sm text-text-muted"
          style={{ fontWeight: 300 }}
        >
          Regenerate ↺
        </button>
      </div>
    </div>
  )
}
