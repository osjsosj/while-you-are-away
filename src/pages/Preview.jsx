import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft } from '../utils/storage'

export default function Preview() {
  const navigate = useNavigate()
  const draft = getDraft()
  const phase1 = draft.phase1 || {}
  const phase2 = draft.phase2 || {}
  const config = draft.generatedConfig || {}
  const capsuleData = draft.capsuleData || {}

  const [tab, setTab] = useState('letters')
  const [openId, setOpenId] = useState(null)

  const primary = config.theme?.primary || '#C8706E'
  const secondary = config.theme?.secondary || '#FBF4E8'
  const accent = config.theme?.accent || '#EFC5C4'
  const appName = config.chosenName || 'Your Letter Box'

  const weeklyCapsules = Array.from(
    { length: Number(phase1.regularCount) || 10 },
    (_, i) => {
      const d = new Date(phase1.startDate || Date.now())
      const days =
        phase1.unlockSchedule === 'Every day'
          ? i
          : phase1.unlockSchedule === 'Every two weeks'
            ? (i + 1) * 14
            : (i + 1) * 7
      d.setDate(d.getDate() + days)
      return {
        id: `w${i}`,
        label: `Week ${i + 1}`,
        emoji: '📅',
        unlockDate: d,
        type: 'weekly',
      }
    },
  )

  const situationCapsules = (
    phase2.situationLabels ||
    config.situationLabels ||
    []
  ).map((s, i) => ({
    id: s.id || `s${i}`,
    label: s.label,
    emoji: s.emoji || '💛',
    hint: s.hint,
    type: 'situation',
  }))

  const today = new Date()
  const returnDate = phase1.endDate ? new Date(phase1.endDate) : null
  const daysLeft = returnDate
    ? Math.ceil((returnDate - today) / 86400000)
    : null

  const openCap = [...weeklyCapsules, ...situationCapsules].find(
    (c) => c.id === openId,
  )
  const openData = openId ? capsuleData[openId] || {} : {}

  return (
    <div className="min-h-screen" style={{ background: secondary }}>
      <div className="max-w-lg mx-auto">
        <div
          className="text-center py-2 font-sans text-xs tracking-widest"
          style={{
            background: '#1A1008',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.15em',
          }}
        >
          PREVIEW
        </div>

        <div className="px-5 pt-5 pb-4 text-center" style={{ background: primary }}>
          <p
            className="font-sans text-xs mb-2"
            style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}
          >
            From {phase1.fromName} · To {phase1.toName}
          </p>
          <h1
            className="font-display italic text-2xl text-white mb-2"
            style={{ letterSpacing: '-0.01em' }}
          >
            {appName}
          </h1>
          {daysLeft !== null && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-xs"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                backdropFilter: 'blur(4px)',
              }}
            >
              {daysLeft > 0
                ? `${daysLeft} days until they're back`
                : daysLeft === 0
                  ? "They're back today! 🎉"
                  : `Back ${Math.abs(daysLeft)} days ago`}
            </div>
          )}
        </div>

        <div
          className="flex"
          style={{ background: secondary, borderBottom: `1px solid ${accent}` }}
        >
          {[
            { key: 'letters', label: '💌 Letters' },
            { key: 'timeline', label: '✦ Our Story' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className="flex-1 py-3 font-sans text-sm transition-all"
              style={{
                borderBottom: `2px solid ${tab === key ? primary : 'transparent'}`,
                color: tab === key ? primary : '#9B8070',
                fontWeight: tab === key ? 500 : 400,
                background: 'transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="px-4 py-5 pb-32" style={{ background: secondary }}>
          {tab === 'letters' && (
            <>
              <div className="mb-6">
                <p
                  className="font-sans text-xs uppercase tracking-widest mb-3"
                  style={{ fontSize: 10, color: '#9B8070' }}
                >
                  Weekly letters
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {weeklyCapsules.map((cap) => {
                    const data = capsuleData[cap.id] || {}
                    const isOpen = cap.unlockDate <= today
                    const hasContent = data.letter || data.photo || data.voice
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() =>
                          isOpen && hasContent && setOpenId(cap.id)
                        }
                        className="rounded-2xl p-3.5 text-center transition-all"
                        style={{
                          background: '#FFFDF9',
                          border: `1px solid ${isOpen && hasContent ? accent : '#E8D5B5'}`,
                          opacity: isOpen ? 1 : 0.55,
                          boxShadow:
                            isOpen && hasContent
                              ? `0 2px 12px rgba(200,112,110,0.1)`
                              : 'none',
                        }}
                      >
                        <div className="text-2xl mb-2">
                          {isOpen ? (hasContent ? '✉️' : '📭') : '🔒'}
                        </div>
                        <div
                          className="font-sans text-xs font-medium"
                          style={{ color: '#1A1008' }}
                        >
                          {cap.label}
                        </div>
                        <div
                          className="font-sans text-xs mt-0.5 font-light"
                          style={{ color: '#9B8070' }}
                        >
                          {isOpen
                            ? hasContent
                              ? 'Open me'
                              : 'Empty'
                            : cap.unlockDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                        </div>
                        {hasContent && (
                          <div className="flex justify-center gap-1 mt-2">
                            {['letter', 'photo', 'voice'].map(
                              (f) =>
                                data[f] && (
                                  <div
                                    key={f}
                                    style={{
                                      width: 4,
                                      height: 4,
                                      borderRadius: '50%',
                                      background: primary,
                                    }}
                                  />
                                ),
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {situationCapsules.length > 0 && (
                <div>
                  <p
                    className="font-sans text-xs uppercase tracking-widest mb-3"
                    style={{ fontSize: 10, color: '#9B8070' }}
                  >
                    Open when...
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {situationCapsules.map((cap) => {
                      const data = capsuleData[cap.id] || {}
                      const hasContent = data.letter || data.photo || data.voice
                      return (
                        <button
                          key={cap.id}
                          type="button"
                          onClick={() => hasContent && setOpenId(cap.id)}
                          className="rounded-2xl p-3.5 text-center transition-all"
                          style={{
                            background: '#FFFDF9',
                            border: `1px solid ${hasContent ? accent : '#E8D5B5'}`,
                            boxShadow: hasContent
                              ? `0 2px 12px rgba(200,112,110,0.1)`
                              : 'none',
                          }}
                        >
                          <div className="text-2xl mb-2">{cap.emoji}</div>
                          <div
                            className="font-sans text-xs font-medium leading-tight"
                            style={{ color: '#1A1008' }}
                          >
                            {cap.label}
                          </div>
                          {hasContent && (
                            <div className="flex justify-center gap-1 mt-2">
                              {['letter', 'photo', 'voice'].map(
                                (f) =>
                                  data[f] && (
                                    <div
                                      key={f}
                                      style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: '50%',
                                        background: primary,
                                      }}
                                    />
                                  ),
                              )}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'timeline' && (
            <div>
              <p
                className="font-sans text-xs uppercase tracking-widest mb-3"
                style={{ fontSize: 10, color: '#9B8070' }}
              >
                Our records
              </p>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {[
                  { icon: '📱', label: 'Times visited', value: '1' },
                  { icon: '✍️', label: 'Replies written', value: '0' },
                  { icon: '🐾', label: 'Pet fed', value: '0 / 10' },
                  { icon: '💭', label: 'Times thought of you', value: '1,000+' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl p-3.5 text-center"
                    style={{ background: '#FFFDF9', border: '1px solid #E8D5B5' }}
                  >
                    <div className="text-xl mb-1.5">{s.icon}</div>
                    <div
                      className="font-display italic text-xl mb-0.5"
                      style={{ color: primary }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="font-sans text-xs leading-tight font-light"
                      style={{ color: '#9B8070' }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {(phase2.timeline || []).length > 0 && (
                <>
                  <p
                    className="font-sans text-xs uppercase tracking-widest mb-4"
                    style={{ fontSize: 10, color: '#9B8070' }}
                  >
                    Our story
                  </p>
                  <div className="space-y-4">
                    {(phase2.timeline || []).map((item, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div
                          className="flex-shrink-0 flex items-center justify-center text-xl"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: '#FFFDF9',
                            border: `1px solid ${accent}`,
                          }}
                        >
                          {item.emoji || '💛'}
                        </div>
                        <div className="pt-1">
                          <div
                            className="font-sans text-xs mb-0.5 font-light"
                            style={{ color: '#9B8070' }}
                          >
                            {item.date}
                          </div>
                          <div
                            className="font-sans text-sm font-medium"
                            style={{ color: '#1A1008' }}
                          >
                            {item.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {openId && openData && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end max-w-lg mx-auto"
            style={{ background: 'rgba(26,16,8,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && setOpenId(null)}
          >
            <div
              className="max-h-[88vh] overflow-y-auto"
              style={{
                background: '#FFFDF9',
                borderRadius: '28px 28px 0 0',
                boxShadow: '0 -8px 40px rgba(45,31,20,0.15)',
              }}
            >
              <div className="flex justify-center pt-3">
                <div
                  style={{
                    width: 36,
                    height: 4,
                    background: '#E8D5B5',
                    borderRadius: 2,
                  }}
                />
              </div>
              <div className="px-6 pb-10">
                <div className="text-center my-6">
                  <div className="text-5xl mb-3">{openCap?.emoji}</div>
                  <h3
                    className="font-display italic text-2xl"
                    style={{ color: primary, letterSpacing: '-0.01em' }}
                  >
                    {openCap?.label}
                  </h3>
                </div>
                {openData.letter && (
                  <div
                    className="font-display text-sm leading-loose whitespace-pre-wrap mb-5 p-5 rounded-2xl"
                    style={{
                      background: secondary,
                      border: `1px solid ${accent}`,
                      color: '#2D1F14',
                      lineHeight: 2,
                    }}
                  >
                    {openData.letter}
                  </div>
                )}
                {openData.photo && (
                  <div
                    className="rounded-2xl overflow-hidden mb-5"
                    style={{ border: `1px solid ${accent}` }}
                  >
                    <img src={openData.photo} alt="" className="w-full h-auto" />
                  </div>
                )}
                {openData.voice && (
                  <audio controls src={openData.voice} className="w-full mb-4" />
                )}
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="w-full py-3.5 rounded-2xl font-sans text-sm font-medium text-white"
                  style={{ background: primary }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 py-4"
          style={{
            background: 'rgba(251,244,232,0.98)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid #E8D5B5',
          }}
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="flex-1 py-3.5 rounded-2xl font-sans text-sm text-text-muted transition-all"
              style={{ border: '1px solid #E8D5B5', background: '#FFFDF9' }}
            >
              ← Edit
            </button>
            <button
              type="button"
              onClick={() => navigate('/export')}
              className="flex-1 py-3.5 rounded-2xl font-sans text-sm font-medium text-white transition-all"
              style={{ background: primary }}
            >
              Export file →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
