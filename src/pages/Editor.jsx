import { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'

export default function Editor() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const draft = getDraft()
  const phase1 = draft.phase1 || {}
  const phase2 = draft.phase2 || {}
  const config = draft.generatedConfig || {}

  const weeklyCapsules = Array.from(
    { length: Number(phase1.regularCount) || 10 },
    (_, i) => ({
      id: `w${i}`,
      type: 'weekly',
      label: `Week ${i + 1}`,
      emoji: '📅',
      unlockDate: getUnlockDate(phase1.startDate, i, phase1.unlockSchedule),
    }),
  )

  const situationCapsules = (
    phase2.situationLabels ||
    config.situationLabels ||
    []
  ).map((s, i) => ({
    id: s.id || `s${i}`,
    type: 'situation',
    label: s.label,
    emoji: s.emoji || '💛',
    hint: s.hint,
  }))

  const allCapsules = [...weeklyCapsules, ...situationCapsules]

  const [capsuleData, setCapsuleData] = useState(() => {
    return draft.capsuleData || {}
  })
  const [activeId, setActiveId] = useState(null)
  const [tab, setTab] = useState('weekly')

  const activeCapsule = allCapsules.find((c) => c.id === activeId)
  const activeData = activeId ? capsuleData[activeId] || {} : {}

  const updateCapsule = (id, field, value) => {
    const next = {
      ...capsuleData,
      [id]: { ...(capsuleData[id] || {}), [field]: value },
    }
    setCapsuleData(next)
    saveDraft({ capsuleData: next })
  }

  const filledCount = allCapsules.filter((c) => {
    const d = capsuleData[c.id] || {}
    return d.letter || d.photo || d.voice
  }).length

  const progress = Math.round((filledCount / allCapsules.length) * 100)

  const displayCapsules = tab === 'weekly' ? weeklyCapsules : situationCapsules

  return (
    <div className="min-h-screen max-w-lg mx-auto flex flex-col">
      <div className="sticky top-0 bg-warm-50 border-b border-warm-200 z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-muted">
            {filledCount} / {allCapsules.length} letters filled
          </span>
          <span className="text-xs text-rose font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 bg-warm-200 rounded-full">
          <div
            className="h-full bg-rose rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {paymentSuccess && (
        <div className="mx-4 mt-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-700 text-center">
          ✅ Payment successful! Now fill in your letters.
        </div>
      )}

      <div className="flex border-b border-warm-200 bg-warm-50 sticky top-12 z-10">
        <button
          type="button"
          onClick={() => setTab('weekly')}
          className={`flex-1 py-3 text-sm transition-all border-b-2
            ${tab === 'weekly' ? 'border-rose text-rose font-medium' : 'border-transparent text-text-muted'}`}
        >
          📅 Weekly ({weeklyCapsules.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('situation')}
          className={`flex-1 py-3 text-sm transition-all border-b-2
            ${tab === 'situation' ? 'border-rose text-rose font-medium' : 'border-transparent text-text-muted'}`}
        >
          💛 Moments ({situationCapsules.length})
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-3 pb-32">
        {displayCapsules.map((cap) => {
          const data = capsuleData[cap.id] || {}
          const filled = data.letter || data.photo || data.voice
          return (
            <button
              key={cap.id}
              type="button"
              onClick={() => setActiveId(cap.id)}
              className={`w-full text-left bg-white border rounded-2xl px-4 py-3.5 transition-all
                ${filled ? 'border-rose-light' : 'border-warm-200'}
                ${activeId === cap.id ? 'ring-2 ring-rose ring-opacity-30' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cap.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-base">
                      {cap.label}
                    </span>
                    {filled && <span className="text-xs text-rose">✓</span>}
                  </div>
                  {cap.unlockDate && (
                    <div className="text-xs text-text-muted mt-0.5">
                      Unlocks {formatDate(cap.unlockDate)}
                    </div>
                  )}
                  {cap.hint && (
                    <div className="text-xs text-text-muted mt-0.5">
                      {cap.hint}
                    </div>
                  )}
                </div>
                <div className="flex gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${data.letter ? 'bg-rose' : 'bg-warm-200'}`}
                  />
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${data.photo ? 'bg-rose' : 'bg-warm-200'}`}
                  />
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${data.voice ? 'bg-rose' : 'bg-warm-200'}`}
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-warm-50 border-t border-warm-200">
        <button
          type="button"
          onClick={() => navigate('/preview')}
          className="w-full bg-rose text-white py-4 rounded-2xl text-base font-medium active:scale-95 transition-transform"
        >
          {filledCount === 0
            ? 'Skip to preview →'
            : filledCount === allCapsules.length
              ? 'All done — preview →'
              : `Preview with ${filledCount} letter${filledCount > 1 ? 's' : ''} →`}
        </button>
      </div>

      {activeId && (
        <CapsuleEditor
          capsule={activeCapsule}
          data={activeData}
          onChange={(field, value) => updateCapsule(activeId, field, value)}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  )
}

function CapsuleEditor({ capsule, data, onChange, onClose }) {
  const [recording, setRecording] = useState(false)
  const [recSecs, setRecSecs] = useState(0)
  const recRef = useRef(null)
  const intervalRef = useRef(null)
  const fileRef = useRef(null)

  const pickPhoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const compressed = await compressImage(file)
    onChange('photo', compressed)
  }

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const chunks = []
      const mime =
        ['audio/webm', 'audio/mp4', 'audio/ogg'].find((t) =>
          MediaRecorder.isTypeSupported(t),
        ) || ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data)
      }
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => onChange('voice', reader.result)
        reader.readAsDataURL(blob)
        stream.getTracks().forEach((t) => t.stop())
      }
      rec.start(100)
      recRef.current = rec
      setRecording(true)
      setRecSecs(0)
      intervalRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000)
    } catch {
      alert(
        'Microphone access denied. Please allow microphone in browser settings.',
      )
    }
  }

  const stopRec = () => {
    recRef.current?.stop()
    clearInterval(intervalRef.current)
    setRecording(false)
  }

  const fmtTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(30,15,8,0.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto max-w-lg mx-auto w-full">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-warm-200 rounded-full" />
        </div>
        <div className="px-5 pb-10">
          <div className="flex items-center gap-3 mb-6 mt-2">
            <span className="text-3xl">{capsule.emoji}</span>
            <div>
              <h2 className="font-serif text-lg text-rose-dark">
                {capsule.label}
              </h2>
              {capsule.hint && (
                <p className="text-xs text-text-muted">{capsule.hint}</p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">
              ✉️ Letter
            </label>
            <textarea
              value={data.letter || ''}
              onChange={(e) => onChange('letter', e.target.value)}
              placeholder="Write your letter here..."
              rows={5}
              className="w-full bg-warm-50 border border-warm-200 rounded-2xl px-4 py-3 text-sm font-serif leading-relaxed focus:outline-none focus:border-rose-light resize-none"
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">
              📷 Photo
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-warm-300 rounded-2xl overflow-hidden cursor-pointer hover:border-rose-light transition-colors"
              style={{
                minHeight: data.photo ? 'auto' : '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {data.photo ? (
                <img src={data.photo} alt="" className="w-full h-auto block" />
              ) : (
                <p className="text-text-muted text-sm py-6">Tap to add a photo</p>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickPhoto}
            />
            {data.photo && (
              <button
                type="button"
                onClick={() => onChange('photo', null)}
                className="mt-2 text-xs text-text-muted"
              >
                Remove photo ✕
              </button>
            )}
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider block mb-2">
              🎙️ Voice message
            </label>
            {data.voice && !recording && (
              <div className="flex items-center gap-3 bg-warm-100 rounded-2xl px-4 py-3 mb-2">
                <span className="text-lg">🎙️</span>
                <span className="flex-1 text-sm text-text-mid">
                  Voice message saved
                </span>
                <button
                  type="button"
                  onClick={() => onChange('voice', null)}
                  className="text-xs text-text-muted"
                >
                  Remove
                </button>
              </div>
            )}
            <div className="flex items-center gap-4 bg-warm-100 rounded-2xl px-4 py-3">
              <button
                type="button"
                onClick={recording ? stopRec : startRec}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 border-2 transition-all
                  ${recording ? 'bg-rose border-rose animate-pulse' : 'bg-white border-rose'}`}
              >
                {recording ? '⏹' : '🎙️'}
              </button>
              <div>
                <div className="text-lg font-light tabular-nums">
                  {recording
                    ? fmtTime(recSecs)
                    : data.voice
                      ? 'Recorded ✓'
                      : '0:00'}
                </div>
                <div className="text-xs text-text-muted">
                  {recording
                    ? 'Tap to stop'
                    : data.voice
                      ? 'Tap to re-record'
                      : 'Tap to start recording'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full bg-rose text-white py-3.5 rounded-2xl text-sm font-medium active:scale-95 transition-transform"
          >
            Save & close ✓
          </button>
        </div>
      </div>
    </div>
  )
}

function getUnlockDate(startDate, weekIndex, schedule) {
  if (!startDate) return null
  const d = new Date(startDate)
  const days =
    schedule === 'Every day'
      ? weekIndex
      : schedule === 'Every two weeks'
        ? (weekIndex + 1) * 14
        : (weekIndex + 1) * 7
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date) {
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function compressImage(file) {
  return new Promise((res) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const MAX = 900
      let { width: w, height: h } = img
      if (w > h && w > MAX) {
        h = Math.round((h * MAX) / w)
        w = MAX
      } else if (h > MAX) {
        w = Math.round((w * MAX) / h)
        h = MAX
      }
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      res(c.toDataURL('image/jpeg', 0.68))
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}
