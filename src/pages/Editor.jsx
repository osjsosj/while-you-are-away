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

  const [capsuleData, setCapsuleData] = useState(() => draft.capsuleData || {})
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
    <div
      className="min-h-screen max-w-lg mx-auto flex flex-col"
      style={{ background: '#FBF4E8' }}
    >
      <div
        className="sticky top-0 z-10 px-5 pt-4 pb-3"
        style={{
          background: 'rgba(251,244,232,0.97)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E8D5B5',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="font-display italic text-sm text-text-mid">
              Your letters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted font-sans font-light">
              {filledCount}/{allCapsules.length}
            </span>
            <span
              className="font-sans text-xs font-medium"
              style={{ color: progress === 100 ? '#7B9E5A' : '#C8706E' }}
            >
              {progress}%
            </span>
          </div>
        </div>

        <div className="h-1 rounded-full mb-3" style={{ background: '#E8D5B5' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background:
                progress === 100
                  ? 'linear-gradient(90deg, #7B9E5A, #9EC475)'
                  : 'linear-gradient(90deg, #C8706E, #E8A0A0)',
            }}
          />
        </div>

        <div className="flex gap-2">
          {[
            { key: 'weekly', label: 'Weekly', count: weeklyCapsules.length },
            { key: 'situation', label: 'Moments', count: situationCapsules.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="flex-1 py-2 rounded-xl font-sans text-xs transition-all"
              style={{
                background: tab === key ? '#C8706E' : 'transparent',
                color: tab === key ? 'white' : '#9B8070',
                border: tab === key ? '1px solid #C8706E' : '1px solid #E8D5B5',
                fontWeight: tab === key ? 500 : 400,
              }}
            >
              {label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {paymentSuccess && (
        <div
          className="mx-4 mt-4 px-4 py-3 rounded-2xl text-center font-sans text-xs"
          style={{
            background: '#EDF6E5',
            border: '1px solid #C4DFB0',
            color: '#4A7A30',
          }}
        >
          Payment successful — now fill in your letters ✓
        </div>
      )}

      <div className="flex-1 px-4 py-4 space-y-2.5 pb-36">
        {displayCapsules.map((cap, idx) => {
          const data = capsuleData[cap.id] || {}
          const filled = data.letter || data.photo || data.voice
          const isActive = activeId === cap.id
          const dotCount = [data.letter, data.photo, data.voice].filter(Boolean).length

          return (
            <button
              key={cap.id}
              type="button"
              onClick={() => setActiveId(cap.id)}
              className="w-full text-left rounded-2xl transition-all"
              style={{
                background: '#FFFDF9',
                border: `1px solid ${isActive ? '#C8706E' : filled ? '#EFC5C4' : '#E8D5B5'}`,
                padding: '14px 16px',
                boxShadow: isActive
                  ? '0 0 0 3px rgba(200,112,110,0.15)'
                  : filled
                    ? '0 2px 12px rgba(200,112,110,0.08)'
                    : '0 1px 4px rgba(45,31,20,0.04)',
                animation: `fadeUp 0.3s ease ${idx * 0.04}s both`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 flex items-center justify-center font-sans text-xs font-medium"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: filled ? '#FAF0EF' : '#F5E8D0',
                    color: filled ? '#C8706E' : '#9B8070',
                  }}
                >
                  {cap.type === 'weekly' ? (
                    <span
                      style={{
                        fontFamily: 'Playfair Display',
                        fontStyle: 'italic',
                        fontSize: 13,
                      }}
                    >
                      {parseInt(cap.id.slice(1), 10) + 1}
                    </span>
                  ) : (
                    <span style={{ fontSize: 16 }}>{cap.emoji}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="font-sans text-sm"
                      style={{ color: '#1A1008', fontWeight: filled ? 500 : 400 }}
                    >
                      {cap.label}
                    </span>
                    {filled && (
                      <span className="font-sans text-xs" style={{ color: '#C8706E' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  {cap.unlockDate && (
                    <div
                      className="font-sans text-xs font-light"
                      style={{ color: '#9B8070' }}
                    >
                      Unlocks {formatDate(cap.unlockDate)}
                    </div>
                  )}
                  {cap.hint && (
                    <div
                      className="font-sans text-xs italic font-light"
                      style={{ color: '#9B8070' }}
                    >
                      {cap.hint}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 items-end">
                  <div className="flex gap-1">
                    {['letter', 'photo', 'voice'].map((field) => (
                      <div
                        key={field}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: data[field] ? '#C8706E' : '#E8D5B5',
                          transition: 'background 0.2s',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="font-sans font-light"
                    style={{ fontSize: 9, color: '#9B8070' }}
                  >
                    {dotCount === 0 ? 'empty' : `${dotCount}/3`}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 py-4"
        style={{
          background: 'rgba(251,244,232,0.98)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #E8D5B5',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/preview')}
          className="btn-primary w-full py-4 rounded-2xl text-sm font-sans"
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
      style={{ background: 'rgba(26,16,8,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[92vh] overflow-y-auto max-w-lg mx-auto w-full"
        style={{
          background: '#FFFDF9',
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -8px 40px rgba(45,31,20,0.15)',
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div
            style={{ width: 36, height: 4, background: '#E8D5B5', borderRadius: 2 }}
          />
        </div>

        <div className="px-6 pb-10">
          <div
            className="flex items-center gap-4 mb-7 pb-5"
            style={{ borderBottom: '1px solid #F5E8D0' }}
          >
            <div
              className="flex items-center justify-center text-2xl flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: '#FAF0EF',
                border: '1px solid #EFC5C4',
              }}
            >
              {capsule.emoji}
            </div>
            <div>
              <h2
                className="font-display italic text-xl text-ink mb-0.5"
                style={{ letterSpacing: '-0.01em' }}
              >
                {capsule.label}
              </h2>
              {capsule.hint && (
                <p className="font-sans text-xs font-light" style={{ color: '#9B8070' }}>
                  {capsule.hint}
                </p>
              )}
              {capsule.unlockDate && (
                <p className="font-sans text-xs font-light" style={{ color: '#9B8070' }}>
                  Unlocks {formatDate(capsule.unlockDate)}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label
              className="font-sans uppercase tracking-widest block mb-3"
              style={{ fontSize: 10, color: '#9B8070', letterSpacing: '0.12em' }}
            >
              Letter
            </label>
            <textarea
              value={data.letter || ''}
              onChange={(e) => onChange('letter', e.target.value)}
              placeholder="Write your letter here..."
              rows={6}
              className="w-full focus:outline-none resize-none font-display"
              style={{
                background: '#FBF4E8',
                border: '1px solid #E8D5B5',
                borderRadius: 16,
                padding: '14px 16px',
                fontSize: 14,
                lineHeight: 1.8,
                color: '#1A1008',
                fontStyle: data.letter ? 'normal' : 'italic',
              }}
            />
          </div>

          <div className="mb-6">
            <label
              className="font-sans uppercase tracking-widest block mb-3"
              style={{ fontSize: 10, color: '#9B8070', letterSpacing: '0.12em' }}
            >
              Photo
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer transition-all overflow-hidden"
              style={{
                border: `1.5px dashed ${data.photo ? '#EFC5C4' : '#D4BC95'}`,
                borderRadius: 16,
                minHeight: data.photo ? 'auto' : 88,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: data.photo ? 'transparent' : '#FBF4E8',
              }}
            >
              {data.photo ? (
                <img
                  src={data.photo}
                  alt=""
                  className="w-full h-auto block"
                  style={{ borderRadius: 16 }}
                />
              ) : (
                <div className="text-center py-6">
                  <div className="font-sans text-2xl mb-1" style={{ opacity: 0.4 }}>
                    +
                  </div>
                  <p className="font-sans text-xs font-light" style={{ color: '#9B8070' }}>
                    Tap to add a photo
                  </p>
                </div>
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
                className="mt-2 font-sans text-xs font-light"
                style={{ color: '#9B8070' }}
              >
                Remove photo ✕
              </button>
            )}
          </div>

          <div className="mb-7">
            <label
              className="font-sans uppercase tracking-widest block mb-3"
              style={{ fontSize: 10, color: '#9B8070', letterSpacing: '0.12em' }}
            >
              Voice message
            </label>

            {data.voice && !recording && (
              <div
                className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl"
                style={{ background: '#F5E8D0', border: '1px solid #E8D5B5' }}
              >
                <span className="text-base">🎙️</span>
                <span
                  className="font-sans text-xs flex-1"
                  style={{ color: '#6B5040', fontWeight: 400 }}
                >
                  Voice message saved
                </span>
                <button
                  type="button"
                  onClick={() => onChange('voice', null)}
                  className="font-sans text-xs font-light"
                  style={{ color: '#9B8070' }}
                >
                  Remove
                </button>
              </div>
            )}

            <div
              className="flex items-center gap-4 px-4 py-4 rounded-xl"
              style={{ background: '#FBF4E8', border: '1px solid #E8D5B5' }}
            >
              <button
                type="button"
                onClick={recording ? stopRec : startRec}
                className="flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: recording ? '#C8706E' : '#FFFDF9',
                  border: `2px solid ${recording ? '#C8706E' : '#E8D5B5'}`,
                  fontSize: 18,
                  animation: recording ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {recording ? '⏹' : '🎙️'}
              </button>
              <div>
                <div
                  className="font-display italic text-xl mb-0.5"
                  style={{
                    color: recording ? '#C8706E' : '#2D1F14',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {recording ? fmtTime(recSecs) : data.voice ? 'Recorded' : '0:00'}
                </div>
                <div className="font-sans text-xs font-light" style={{ color: '#9B8070' }}>
                  {recording
                    ? 'Tap to stop'
                    : data.voice
                      ? 'Tap to re-record'
                      : 'Tap to record'}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary w-full py-4 rounded-2xl text-sm font-sans"
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
