import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { getPlan, normalizePlan, planSlots, SCHEDULES, SECTION_INFO, suggestedCount } from '../utils/plan'
import { formatLong, localISODate } from '../utils/diary'
import FlowFrame from '../components/FlowFrame'
import MomentMedia from '../components/MomentMedia'
import Companion from '../components/Companion'
import { buildSummary, isFilled } from '../utils/summary'
import '../styles/editor.css'
import './diary.css'

/* Step 4: write. The letter box is laid out the way it will open, section by section. */

const SECTIONS = ['tonight', 'scheduled', 'never', 'anytime', 'occasions', 'last']
const ADDABLE = { never: 'neverSaid', anytime: 'anytime', occasions: 'occasions' }
const ADD_PLACEHOLDER = {
  never: 'The night we first met',
  anytime: 'Open when you can’t sleep',
  occasions: 'Your birthday',
}

export default function Editor() {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => getDraft())
  const [openId, setOpenId] = useState(null)
  const [companionOpen, setCompanionOpen] = useState(false)
  const [seed, setSeed] = useState('')

  const update = (patch) => {
    saveDraft(patch)
    setDraft(getDraft())
  }

  const p1 = draft.phase1 || {}
  const plan = useMemo(() => getPlan(draft), [draft])
  const caps = draft.capsuleData || {}
  const slots = useMemo(() => planSlots(plan, p1.startDate, p1.endDate), [plan, p1.startDate, p1.endDate])
  const filled = slots.filter((s) => isFilled(caps[s.id])).length
  const diary = Array.isArray(draft.diary) ? draft.diary : []
  const name = draft.generatedConfig?.chosenName || draft.phase2?.appName || 'Your letter box'

  const setPlan = (next) => update({ plan: normalizePlan(next) })
  const setCap = (id, patch) => update({ capsuleData: { ...(getDraft().capsuleData || {}), [id]: { ...(getDraft().capsuleData?.[id] || {}), ...patch } } })

  const summary = useCallback(() => buildSummary(getDraft()), [])
  const askAbout = (slot) => {
    setSeed(`Can you help me with “${slot.label}”? `)
    setCompanionOpen(true)
  }

  const current = openId ? slots.find((s) => s.id === openId) : null
  const right = (
    <div className="we-top-actions">
      <button type="button" className="wf-btn wf-btn--ghost wf-btn--small" onClick={() => navigate('/preview')}>Preview</button>
      <button type="button" className="wf-btn wf-btn--small" onClick={() => navigate('/export')}>Hand it over</button>
    </div>
  )

  return (
    <FlowFrame right={right}>
      <div className={`we${companionOpen ? ' we--with-companion' : ''}`}>
        <p className="wf-note">For {p1.toName || 'them'}{p1.startDate ? ` · you part ${formatLong(p1.startDate)}` : ''}</p>
        <h1 className="wf-h1" style={{ marginTop: 6 }}>{name}</h1>
        <div className="we-progress" aria-label={`${filled} of ${slots.length} letters written`}>
          <div className="we-progress-bar"><span style={{ width: `${slots.length ? (filled / slots.length) * 100 : 0}%` }} /></div>
          <p className="wf-note">{filled} of {slots.length} letters written. Write in any order; nothing has to be finished today.</p>
        </div>

        <button type="button" className="we-diary" onClick={() => navigate('/diary')}>
          <span>
            <span className="we-diary-title">{SECTION_INFO.before.title}</span>
            <span className="we-diary-sub">
              {diary.length ? `${diary.length} ${diary.length === 1 ? 'moment' : 'moments'} so far · add today’s` : 'Collect small moments before you part: a note, a photo, ten seconds of your voice.'}
            </span>
          </span>
          <span className="wf-dot" aria-hidden="true" />
        </button>

        {SECTIONS.map((sec) => (
          <Section
            key={sec}
            sec={sec}
            plan={plan}
            slots={slots.filter((s) => s.section === sec)}
            caps={caps}
            p1={p1}
            onOpen={setOpenId}
            onPlan={setPlan}
          />
        ))}

        <MissingSections plan={plan} p1={p1} onPlan={setPlan} />

        <div className="we-footer">
          <button type="button" className="wf-btn wf-btn--ghost" onClick={() => navigate('/preview')}>See it as {p1.toName || 'they'} will</button>
          <button type="button" className="wf-btn" onClick={() => navigate('/export')}>Hand it over</button>
        </div>
      </div>

      {!companionOpen && (
        <button type="button" className="we-companion-fab" onClick={() => setCompanionOpen(true)}>
          <span className="wf-dot" aria-hidden="true" /> Need help with the words?
        </button>
      )}
      <Companion open={companionOpen} onClose={() => setCompanionOpen(false)} summary={summary} seed={seed} onSeedUsed={() => setSeed('')} />

      {current && (
        <LetterSheet
          key={current.id}
          slot={current}
          content={caps[current.id] || {}}
          plan={plan}
          toName={p1.toName}
          onChange={(patch) => setCap(current.id, patch)}
          onPlan={setPlan}
          onAsk={() => { setOpenId(null); askAbout(current) }}
          onClose={() => setOpenId(null)}
        />
      )}
    </FlowFrame>
  )
}

function Section({ sec, plan, slots, caps, p1, onOpen, onPlan }) {
  const info = SECTION_INFO[sec]
  const listKey = ADDABLE[sec]
  const [adding, setAdding] = useState(false)
  if (sec === 'tonight' && !plan.tonight) return null
  if (sec === 'last' && (!plan.last || !p1.endDate)) return null
  if (sec === 'scheduled' && !plan.scheduled.enabled) return null
  if (listKey && !slots.length && !adding) return null

  const removeSection = () => {
    if (sec === 'tonight') onPlan({ ...plan, tonight: false })
    if (sec === 'last') onPlan({ ...plan, last: false })
    if (sec === 'scheduled') onPlan({ ...plan, scheduled: { ...plan.scheduled, enabled: false } })
  }

  return (
    <section className="we-section" aria-labelledby={`we-${sec}`}>
      <div className="we-section-head">
        <div>
          <h2 id={`we-${sec}`} className="wf-h2">{info.title}</h2>
          <p className="wf-note">{info.blurb}</p>
        </div>
        {(sec === 'tonight' || sec === 'last' || sec === 'scheduled') && (
          <button type="button" className="wf-link we-small-link" onClick={removeSection}>Remove</button>
        )}
      </div>

      {sec === 'scheduled' && <ScheduleSettings plan={plan} p1={p1} caps={caps} onPlan={onPlan} />}

      <div className="we-list">
        {slots.map((s) => {
          const c = caps[s.id]
          const done = isFilled(c)
          const sub = s.opensOn ? (sec === 'last' ? `Sealed until ${formatLong(s.opensOn)}` : `Opens ${formatLong(s.opensOn)}`) : s.hint || (sec === 'anytime' ? 'They can open this any time' : '')
          return (
            <button key={s.id} type="button" className={`we-row${done ? ' is-done' : ''}`} onClick={() => onOpen(s.id)}>
              <span className="we-row-text">
                <span className="we-row-title">{s.label}</span>
                {sub && <span className="we-row-sub">{sub}</span>}
                {done && c.letter && <span className="we-row-excerpt">{c.letter.trim().replace(/\s+/g, ' ').slice(0, 90)}</span>}
              </span>
              <span className="we-row-state">
                {done ? <MediaMarks c={c} /> : <span className="we-write">Write</span>}
              </span>
            </button>
          )
        })}
      </div>

      {listKey && (adding
        ? <AddForm sec={sec} p1={p1} onCancel={() => setAdding(false)} onAdd={(item) => { onPlan({ ...plan, [listKey]: [...plan[listKey], { ...item, id: `${listKey === 'neverSaid' ? 'n' : listKey === 'anytime' ? 's' : 'o'}${Date.now().toString(36)}` }] }); setAdding(false) }} />
        : <button type="button" className="we-add" onClick={() => setAdding(true)}>+ Add a letter</button>)}
    </section>
  )
}

function MediaMarks({ c }) {
  const marks = [c.letter?.trim() && 'Letter', c.photo && 'Photo', c.video && 'Video', c.voice && 'Voice'].filter(Boolean)
  return <span className="we-marks" aria-label={`Written: ${marks.join(', ')}`}>{marks.map((m) => <span key={m}>{m}</span>)}</span>
}

function ScheduleSettings({ plan, p1, caps, onPlan }) {
  const { schedule, count } = plan.scheduled
  const suggestion = suggestedCount(schedule, p1.startDate, p1.endDate)
  const writtenBeyond = Object.keys(caps).filter((k) => /^w\d+$/.test(k) && Number(k.slice(1)) >= count && isFilled(caps[k])).length
  const set = (patch) => onPlan({ ...plan, scheduled: { ...plan.scheduled, ...patch } })
  return (
    <div className="we-settings">
      <div className="wf-pills" role="radiogroup" aria-label="How often">
        {Object.entries(SCHEDULES).map(([k, v]) => (
          <button key={k} type="button" role="radio" aria-checked={schedule === k} className="wf-pill" onClick={() => set({ schedule: k, count: p1.endDate ? suggestedCount(k, p1.startDate, p1.endDate) : count })}>{v.label}</button>
        ))}
      </div>
      <div className="we-count">
        <label htmlFor="we-count">Letters</label>
        <button type="button" className="we-step" aria-label="One fewer" onClick={() => set({ count: Math.max(1, count - 1) })}>−</button>
        <input id="we-count" className="wf-input" inputMode="numeric" value={count} onChange={(e) => set({ count: Math.max(1, Math.min(120, Number(e.target.value.replace(/\D/g, '')) || 1)) })} />
        <button type="button" className="we-step" aria-label="One more" onClick={() => set({ count: Math.min(120, count + 1) })}>+</button>
        {p1.endDate && count !== suggestion && (
          <button type="button" className="wf-link we-small-link" onClick={() => set({ count: suggestion })}>{suggestion} would last until you meet again</button>
        )}
      </div>
      {writtenBeyond > 0 && <p className="wf-note">{writtenBeyond} written {writtenBeyond === 1 ? 'letter is' : 'letters are'} past this count. They’re kept, and come back if you add more.</p>}
    </div>
  )
}

function AddForm({ sec, p1, onAdd, onCancel }) {
  const [label, setLabel] = useState('')
  const [date, setDate] = useState('')
  const needDate = sec === 'occasions'
  const ok = label.trim() && (!needDate || /^\d{4}-\d{2}-\d{2}$/.test(date))
  return (
    <form className="we-addform" onSubmit={(e) => { e.preventDefault(); if (ok) onAdd({ label: label.trim(), ...(needDate ? { date } : {}) }) }}>
      <div className="wf-row">
        <div>
          <label className="wf-label" htmlFor={`we-add-${sec}`}>{sec === 'anytime' ? 'Open when…' : sec === 'occasions' ? 'Which day?' : 'What is it about?'}</label>
          <input id={`we-add-${sec}`} className="wf-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={ADD_PLACEHOLDER[sec]} maxLength={80} autoFocus />
        </div>
        {needDate && (
          <div>
            <label className="wf-label" htmlFor="we-add-date">Date</label>
            <input id="we-add-date" type="date" className="wf-input" min={p1.startDate || localISODate()} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}
      </div>
      <div className="we-addform-actions">
        <button type="submit" className="wf-btn wf-btn--small" disabled={!ok}>Add</button>
        <button type="button" className="wf-link" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

function MissingSections({ plan, p1, onPlan }) {
  const opts = []
  if (!plan.tonight) opts.push(['Tonight', () => onPlan({ ...plan, tonight: true })])
  if (!plan.scheduled.enabled) opts.push(['While we’re apart', () => onPlan({ ...plan, scheduled: { enabled: true, schedule: plan.scheduled.schedule, count: plan.scheduled.count || suggestedCount(plan.scheduled.schedule, p1.startDate, p1.endDate) } })])
  if (!plan.neverSaid.length) opts.push(['Things I never said', () => onPlan({ ...plan, neverSaid: [{ id: `n${Date.now().toString(36)}`, label: 'Something I never told you' }] })])
  if (!plan.anytime.length) opts.push(['Open when…', () => onPlan({ ...plan, anytime: [{ id: `s${Date.now().toString(36)}`, label: 'Open when you miss me' }] })])
  if (!plan.last && p1.endDate) opts.push(['The day we meet again', () => onPlan({ ...plan, last: true })])
  if (!opts.length) return null
  return (
    <section className="we-section we-missing" aria-labelledby="we-more">
      <h2 id="we-more" className="wf-h2">Add a section</h2>
      <p className="wf-note" style={{ marginBottom: 12 }}>Anything you set aside while planning is still here.</p>
      <div className="wf-pills">
        {opts.map(([label, fn]) => <button key={label} type="button" className="wf-pill" onClick={fn}>+ {label}</button>)}
      </div>
    </section>
  )
}

function LetterSheet({ slot, content, plan, toName, onChange, onPlan, onAsk, onClose }) {
  const listKey = ADDABLE[slot.section]
  const item = listKey ? plan[listKey].find((x) => x.id === slot.id) : null
  const [letter, setLetter] = useState(content.letter || '')
  const [title, setTitle] = useState(item?.label || '')

  const saveLetter = (v) => {
    setLetter(v)
    onChange({ letter: v })
  }
  const editItem = (patch) => onPlan({ ...plan, [listKey]: plan[listKey].map((x) => (x.id === slot.id ? { ...x, ...patch } : x)) })
  const close = () => {
    if (item && title.trim() && title.trim() !== item.label) editItem({ label: title.trim() })
    onClose()
  }
  const removeItem = () => {
    onPlan({ ...plan, [listKey]: plan[listKey].filter((x) => x.id !== slot.id) })
    onClose()
  }

  return (
    <div className="we-sheet-wrap" role="dialog" aria-modal="true" aria-labelledby="we-sheet-title" onClick={(e) => e.target === e.currentTarget && close()} onKeyDown={(e) => e.key === 'Escape' && close()}>
      <article className="we-sheet">
        <button type="button" className="we-icon-btn we-sheet-close" onClick={close} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
        <p className="we-sheet-meta">
          {SECTION_INFO[slot.section]?.title}
          {slot.opensOn ? ` · ${slot.section === 'last' ? 'sealed until' : 'opens'} ${formatLong(slot.opensOn)}` : slot.section === 'anytime' ? ' · they can open it any time' : ''}
        </p>
        {item ? (
          <>
            <label htmlFor="we-sheet-title" className="wf-sr">Title</label>
            <input id="we-sheet-title" className="we-title-input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} onBlur={() => (title.trim() ? editItem({ label: title.trim() }) : setTitle(item.label))} />
            {slot.section === 'occasions' && (
              <label className="we-date">Opens on <input type="date" value={item.date || ''} onChange={(e) => e.target.value && editItem({ date: e.target.value })} /></label>
            )}
          </>
        ) : (
          <h2 id="we-sheet-title" className="we-sheet-h">{slot.label}</h2>
        )}
        {slot.hint && <p className="we-hint">{slot.hint}</p>}

        <label htmlFor="we-letter" className="wf-sr">Your letter</label>
        <textarea
          id="we-letter"
          className="we-letter"
          value={letter}
          onChange={(e) => saveLetter(e.target.value)}
          placeholder={`Dear ${toName || 'you'},`}
          rows={10}
          autoFocus={!letter}
        />
        <MomentMedia value={{ photo: content.photo || null, video: content.video || null, voice: content.voice || null }} onChange={(v) => onChange(v)} />

        <div className="we-sheet-actions">
          <button type="button" className="wf-btn wf-btn--ink" onClick={close}>Done</button>
          <button type="button" className="we-ask" onClick={onAsk}><span className="wf-dot" aria-hidden="true" /> Help me with this one</button>
          {item && <button type="button" className="we-remove" onClick={removeItem}>Remove this letter</button>}
        </div>
        <p className="we-saved" aria-live="polite">Saved as you type.</p>
      </article>
    </div>
  )
}
