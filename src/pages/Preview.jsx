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
    <div className="min-h-screen" style={{ backgroundColor: secondary }}>
      <div className="max-w-lg mx-auto">
        <div className="bg-text-base text-white text-center py-2 text-xs tracking-wider">
          PREVIEW — this is what they'll see
        </div>

        <div
          className="px-4 pt-5 pb-3 border-b text-center"
          style={{ borderColor: '#E8D5B5', backgroundColor: secondary }}
        >
          <div className="text-xs text-text-muted tracking-widest uppercase mb-1">
            From {phase1.fromName} · To {phase1.toName}
          </div>
          <div className="font-serif text-xl mb-1" style={{ color: primary }}>
            {appName} 📮
          </div>
          {daysLeft !== null && (
            <div
              className="text-xs px-4 py-2 rounded-xl text-white mt-2 inline-block font-serif"
              style={{ backgroundColor: primary }}
            >
              {daysLeft > 0
                ? `${daysLeft} days until they're back 💌`
                : daysLeft === 0
                  ? "They're back today! 🎉"
                  : `Back ${Math.abs(daysLeft)} days ago 💛`}
            </div>
          )}
        </div>

        <div
          className="flex border-b"
          style={{ borderColor: '#E8D5B5', backgroundColor: secondary }}
        >
          {['letters', 'timeline'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm transition-all border-b-2 ${tab === t ? 'font-medium' : 'text-text-muted border-transparent'}`}
              style={tab === t ? { borderColor: primary, color: primary } : {}}
            >
              {t === 'letters' ? '💌 Letters' : '💛 Our Story'}
            </button>
          ))}
        </div>

        <div className="px-4 py-5 pb-28">
          {tab === 'letters' && (
            <>
              <div className="mb-6">
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                  📅 Weekly letters
                </div>
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
                        className={`bg-white border rounded-2xl p-3.5 text-center transition-all
                          ${isOpen ? 'border-warm-200 active:scale-95' : 'border-warm-200 opacity-60'}`}
                      >
                        <div className="text-2xl mb-1.5">
                          {isOpen ? (hasContent ? '✉️' : '📭') : '🔒'}
                        </div>
                        <div className="text-xs font-medium text-text-base">
                          {cap.label}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
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
                          <div className="flex justify-center gap-1 mt-1.5">
                            {data.letter && (
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: primary }}
                              />
                            )}
                            {data.photo && (
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: primary }}
                              />
                            )}
                            {data.voice && (
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: primary }}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                  💛 Open when...
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {situationCapsules.map((cap) => {
                    const data = capsuleData[cap.id] || {}
                    const hasContent = data.letter || data.photo || data.voice
                    return (
                      <button
                        key={cap.id}
                        type="button"
                        onClick={() => hasContent && setOpenId(cap.id)}
                        className="bg-white border border-warm-200 rounded-2xl p-3.5 text-center active:scale-95 transition-all"
                      >
                        <div className="text-2xl mb-1.5">{cap.emoji}</div>
                        <div className="text-xs font-medium text-text-base leading-tight">
                          {cap.label}
                        </div>
                        {hasContent && (
                          <div className="flex justify-center gap-1 mt-1.5">
                            {data.letter && (
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: primary }}
                              />
                            )}
                            {data.photo && (
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: primary }}
                              />
                            )}
                            {data.voice && (
                              <div
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: primary }}
                              />
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {tab === 'timeline' && (
            <div>
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">
                📊 Our records
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {[
                  { icon: '📱', label: 'Times visited', value: '1' },
                  { icon: '✍️', label: 'Replies written', value: '0' },
                  { icon: '🐾', label: 'Pet fed', value: '0 / 10' },
                  { icon: '💭', label: 'Times thought of you', value: '1,000+' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white border border-warm-200 rounded-2xl p-3 text-center"
                  >
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-serif text-lg" style={{ color: primary }}>
                      {s.value}
                    </div>
                    <div className="text-xs text-text-muted leading-tight">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                Our story
              </div>
              <div className="space-y-3">
                {(phase2.timeline || []).map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-full bg-white border border-warm-200 flex items-center justify-center text-lg flex-shrink-0">
                      {item.emoji || '💛'}
                    </div>
                    <div className="pt-1.5">
                      <div className="text-xs text-text-muted">{item.date}</div>
                      <div className="text-sm font-medium text-text-base">
                        {item.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {openId && openData && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end max-w-lg mx-auto"
            style={{ background: 'rgba(30,15,8,0.55)' }}
            onClick={(e) => e.target === e.currentTarget && setOpenId(null)}
          >
            <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
              <div className="flex justify-center pt-3">
                <div className="w-10 h-1 bg-warm-200 rounded-full" />
              </div>
              <div className="px-5 pb-10">
                <div className="text-center my-5">
                  <div className="text-5xl mb-2">{openCap?.emoji}</div>
                  <div className="font-serif text-xl" style={{ color: primary }}>
                    {openCap?.label}
                  </div>
                </div>
                {openData.letter && (
                  <div className="bg-warm-50 border border-warm-200 rounded-2xl p-5 font-serif text-sm leading-loose whitespace-pre-wrap mb-4">
                    {openData.letter}
                  </div>
                )}
                {openData.photo && (
                  <div className="rounded-2xl overflow-hidden border border-warm-200 mb-4">
                    <img src={openData.photo} alt="" className="w-full h-auto" />
                  </div>
                )}
                {openData.voice && (
                  <audio controls src={openData.voice} className="w-full mb-4" />
                )}
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-white border-t border-warm-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/editor')}
              className="flex-1 py-3 rounded-2xl border border-warm-200 text-sm text-text-muted active:scale-95 transition-transform"
            >
              ← Edit letters
            </button>
            <button
              type="button"
              onClick={() => navigate('/export')}
              className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-white active:scale-95 transition-transform"
              style={{ backgroundColor: primary }}
            >
              Export file →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
