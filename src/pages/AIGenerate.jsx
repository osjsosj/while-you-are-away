import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { generateLetterboxConfig } from '../utils/aiService'

export default function AIGenerate() {
  const navigate = useNavigate()
  const draft = getDraft()
  const [status, setStatus] = useState('loading') // loading | done | error
  const [config, setConfig] = useState(null)
  const [selectedName, setSelectedName] = useState(0)
  const [editingName, setEditingName] = useState(false)
  const [customName, setCustomName] = useState('')

  useEffect(() => {
    generate()
  }, [])

  const generate = async () => {
    setStatus('loading')
    const allData = {
      ...draft.phase1,
      ...draft.phase2,
    }
    const result = await generateLetterboxConfig(allData)
    if (!result) {
      setStatus('error')
      return
    }
    setConfig(result)
    setCustomName(result.appNames?.[0] || '')
    setStatus('done')
  }

  const handleConfirm = () => {
    const finalName = editingName
      ? customName
      : config.appNames?.[selectedName] || customName
    saveDraft({
      generatedConfig: {
        ...config,
        chosenName: finalName,
      },
    })
    navigate('/editor')
  }

  if (status === 'loading')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-4xl animate-pulse">✨</div>
        <p className="font-serif text-xl text-rose-dark text-center">
          Creating something just for you...
        </p>
        <p className="text-text-muted text-sm text-center">
          Picking colors, a name, and the perfect moments
        </p>
      </div>
    )

  if (status === 'error')
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-4xl">😢</div>
        <p className="text-text-base text-center">
          Something went wrong. Let's try again.
        </p>
        <button
          type="button"
          onClick={generate}
          className="bg-rose text-white px-8 py-3 rounded-2xl text-sm"
        >
          Try again
        </button>
      </div>
    )

  const {
    appNames = [],
    theme = {},
    welcomeMessage = '',
    situationLabels = [],
  } = config

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🎨</div>
        <h1 className="font-serif text-2xl text-rose-dark mb-2">
          Here's what we made
        </h1>
        <p className="text-text-muted text-sm">
          Review and adjust anything before we continue
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden border border-warm-200 mb-6"
        style={{ backgroundColor: theme.secondary || '#FBF4E8' }}
      >
        <div
          className="p-6"
          style={{ backgroundColor: theme.primary || '#C8706E' }}
        >
          <p className="text-white text-xs opacity-75 mb-1 uppercase tracking-widest">
            From {draft.phase1?.fromName} · To {draft.phase1?.toName}
          </p>
          <p className="text-white font-serif text-xl">
            {editingName ? (
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 rounded-lg px-2 py-1 text-xl font-serif w-full focus:outline-none"
              />
            ) : (
              appNames[selectedName] || 'Your Letter Box'
            )}
          </p>
          <p className="text-white text-opacity-80 text-sm mt-1">
            {welcomeMessage}
          </p>
        </div>
        <div
          className="p-4"
          style={{ backgroundColor: theme.secondary || '#FBF4E8' }}
        >
          <div className="flex gap-2 flex-wrap">
            {situationLabels.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 rounded-full border"
                style={{
                  borderColor: theme.primary,
                  color: theme.primary,
                  backgroundColor: 'white',
                }}
              >
                {s.emoji} {s.label}
              </span>
            ))}
            {situationLabels.length > 3 && (
              <span className="text-xs px-3 py-1.5 rounded-full border border-warm-200 text-text-muted">
                +{situationLabels.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">
          Choose a name
        </p>
        <div className="space-y-2">
          {appNames.map((name, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedName(i)
                setEditingName(false)
              }}
              className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all
                ${
                  !editingName && selectedName === i
                    ? 'border-rose bg-rose bg-opacity-5 text-rose font-medium'
                    : 'border-warm-200 bg-white text-text-base'
                }`}
            >
              {name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setEditingName(true)
              setCustomName('')
            }}
            className={`w-full text-left px-4 py-3 rounded-2xl border text-sm transition-all
              ${
                editingName
                  ? 'border-rose bg-rose bg-opacity-5 text-rose font-medium'
                  : 'border-warm-200 bg-white text-text-muted'
              }`}
          >
            ✏️ Write my own name
          </button>
        </div>
        {editingName && (
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Type your letter box name..."
            className="mt-2 w-full border border-warm-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-light"
          />
        )}
      </div>

      {situationLabels.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-3">
            Situation letters
          </p>
          <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden">
            {situationLabels.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${i < situationLabels.length - 1 ? 'border-b border-warm-200' : ''}`}
              >
                <span className="text-xl">{s.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-text-base">{s.label}</p>
                  <p className="text-xs text-text-muted">{s.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        className="w-full bg-rose text-white py-4 rounded-2xl text-base font-medium active:scale-95 transition-transform"
      >
        Looks great — let's write the letters →
      </button>
      <button
        type="button"
        onClick={generate}
        className="w-full mt-2 py-3 text-sm text-text-muted"
      >
        Regenerate ↺
      </button>
    </div>
  )
}
