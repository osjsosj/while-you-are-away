import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { localISODate, daysBetween, UNLOCK_OPTIONS, normalizeUnlock } from '../utils/diary'
import { SECTION_INFO } from '../utils/plan'
import Mascot from '../components/Mascot'
import '../styles/onboard.css'

/* Step 1: the basics, one tap at a time. The guide asks, you pick, it answers back.
   Everything else is planned together in the AI conversation after checkout. */

const REASONS = [
  { id: 'military', label: 'Military service or training', reply: 'That’s a long stretch with little contact. Letters will matter.', Icon: IconBoot },
  { id: 'study', label: 'Studying abroad', reply: 'A whole new place. We’ll send a little of home with them.', Icon: IconBook },
  { id: 'work', label: 'A job far away', reply: 'Busy days, quiet nights. A letter fits in the quiet.', Icon: IconBag },
  { id: 'move', label: 'Moving to another city or country', reply: 'New streets, same people. Let’s make the distance feel smaller.', Icon: IconHouse },
  { id: 'distance', label: 'Long distance, for now', reply: 'Time zones and calls that cut out. We can help with that.', Icon: IconPlane },
  { id: 'other', label: 'Something else', reply: 'Every goodbye is its own. Tell me in a few words, if you like.', Icon: IconDots },
]

const RELATIONSHIPS = [
  { id: 'A partner', reply: 'Then every letter is a small visit.' },
  { id: 'A parent', reply: 'Some things are easier to write than to say.' },
  { id: 'A child', reply: 'They’ll keep these longer than you think.' },
  { id: 'A friend', reply: 'Friends like that are worth the postage.' },
  { id: 'Someone else', reply: 'Whoever they are, they matter. That’s enough.' },
]

const LETTERS = ['tonight', 'before', 'scheduled', 'never', 'anytime', 'occasions', 'last']
const LATER = 'later'

const STEPS = ['reason', 'relationship', 'letters', 'names', 'dates', 'building', 'promise']
const stepsFor = (letters) => (letters.includes('before') ? ['reason', 'relationship', 'letters', 'opening', ...STEPS.slice(3)] : STEPS)
const UNLOCK_REPLY = {
  all: 'Simple. They can read at their own pace.',
  mirror: 'One at a time, then. They’ll have a reason to come back.',
}
const ASK = {
  reason: 'What’s taking you two apart?',
  relationship: 'Who are they to you?',
  letters: 'Which letters would you like to write?',
  opening: 'When should they read what you write before you go?',
  names: 'What should we call you both?',
  dates: 'When do you part, and when do you meet again?',
}

export default function Interview() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    const d = getDraft()
    const p = d.phase1 || {}
    return {
      reason: p.reasonId || '',
      reasonNote: p.reasonNote || '',
      relationship: p.relationship || d.landing?.relationship || '',
      letters: Array.isArray(p.letterIds) ? p.letterIds : [],
      unlock: normalizeUnlock(d.diaryUnlock),
      fromName: p.fromName || '',
      toName: p.toName || '',
      startDate: p.startDate || d.landing?.startDate || '',
      endDate: p.endDate || '',
      noEnd: p.endDate === '' && !!p.startDate,
    }
  })
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [reply, setReply] = useState('')
  const [tried, setTried] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const steps = stepsFor(form.letters)
  const key = steps[step]

  const today = localISODate()
  const errors = {
    fromName: !form.fromName.trim() && 'Add your name.',
    toName: !form.toName.trim() && 'Add their name.',
    startDate: !form.startDate ? 'Pick the day you part.' : form.startDate < today ? 'The day you part should be today or later.' : '',
    endDate: !form.noEnd && !form.endDate ? 'Pick a day, or choose “There’s no set date”.' : !form.noEnd && form.endDate <= form.startDate ? 'This should be after the day you part.' : '',
  }
  const ready = {
    reason: !!form.reason,
    relationship: !!form.relationship,
    letters: form.letters.length > 0,
    names: !errors.fromName && !errors.toName,
    dates: !errors.startDate && !errors.endDate,
  }[key] ?? true
  const apart = form.startDate && form.endDate && !form.noEnd && !errors.endDate && !errors.startDate ? daysBetween(form.startDate, form.endDate) : null

  const save = () => {
    const prev = getDraft().phase1 || {}
    const reason = REASONS.find((r) => r.id === form.reason)
    const wishes = form.letters.filter((l) => l !== LATER)
    saveDraft({
      phase1: {
        ...prev,
        fromName: form.fromName.trim(),
        toName: form.toName.trim(),
        relationship: form.relationship,
        startDate: form.startDate,
        endDate: form.noEnd ? '' : form.endDate,
        reasonId: form.reason,
        reasonNote: form.reasonNote.trim().slice(0, 160),
        situation: [reason?.id === 'other' ? '' : reason?.label, form.reasonNote.trim()].filter(Boolean).join(': ').slice(0, 200),
        letterIds: form.letters,
        letterWishes: wishes.map((w) => SECTION_INFO[w].title),
        diaryUnlock: wishes.includes('before') ? form.unlock : '',
      },
      ...(wishes.includes('before') ? { diaryUnlock: form.unlock } : {}),
      phase1Done: true,
    })
  }

  const next = () => {
    if (!ready) { setTried(true); return }
    setTried(false)
    if (key === 'dates') save()
    if (key === 'promise') { navigate('/paywall'); return }
    setDir(1)
    setReply('')
    setStep((s) => Math.min(steps.length - 1, s + 1))
  }
  const back = () => {
    if (step === 0) return navigate('/')
    setDir(-1)
    setReply('')
    setTried(false)
    setStep((s) => Math.max(0, s - 1))
  }

  // "Creating your profile" moves on by itself
  useEffect(() => {
    if (key !== 'building') return
    const t = setTimeout(() => { setDir(1); setStep((s) => s + 1) }, 2600)
    return () => clearTimeout(t)
  }, [key])

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'BUTTON' && e.target.type !== 'checkbox') { e.preventDefault(); next() }
  }

  const progress = Math.min(1, step / (steps.length - 2))
  const bubble = key === 'building' ? 'Creating your profile…' : key === 'promise' ? 'This isn’t just an online letter.' : reply || ASK[key]
  // asking → talk, answered → notice, making the profile → walk, the promise → cheer (once)
  const move = key === 'building' ? 'walk' : key === 'promise' ? 'cheer' : reply ? 'notice' : 'talk'
  const center = key === 'building' || key === 'promise'

  return (
    <div className="ob" onKeyDown={onKey}>
      <header className="ob-top">
        <button type="button" className="ob-x" onClick={back} aria-label={step === 0 ? 'Leave and go home' : 'Back'}>
          {step === 0
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5L5 15" /></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.5 4.5L7 10l5.5 5.5" /></svg>}
        </button>
        <div className="ob-progress" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
          <span style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
        </div>
      </header>

      <main className="ob-main">
        <div className={`ob-stage ob-stage--${dir > 0 ? 'fwd' : 'back'}`} key={key}>
          <div className={`ob-guide${key === 'building' || key === 'promise' ? ' ob-guide--center' : ''}`}>
            <Mascot size={center ? 168 : 124} move={move} className="ob-mascot" />
            <h1 className="ob-bubble" key={bubble} aria-live="polite">{bubble}</h1>
          </div>

          {key === 'reason' && (
            <>
              <Options>
                {REASONS.map((r) => (
                  <Option key={r.id} selected={form.reason === r.id} onPick={() => { set('reason', r.id); setReply(r.reply) }} icon={<r.Icon />}>{r.label}</Option>
                ))}
              </Options>
              {form.reason === 'other' && (
                <div className="ob-field ob-rise">
                  <label htmlFor="ob-note">In a few words <span>(optional)</span></label>
                  <input id="ob-note" className="ob-input" value={form.reasonNote} maxLength={160} onChange={(e) => set('reasonNote', e.target.value)} placeholder="A wedding, a hospital stay, a gap year…" autoFocus />
                </div>
              )}
            </>
          )}

          {key === 'relationship' && (
            <Options>
              {RELATIONSHIPS.map((r) => (
                <Option key={r.id} selected={form.relationship === r.id} onPick={() => { set('relationship', r.id); setReply(r.reply) }}>{r.id}</Option>
              ))}
            </Options>
          )}

          {key === 'letters' && (
            <>
              <p className="ob-hint">Pick as many as you like. You can change this later.</p>
              <Options multi>
                {LETTERS.map((id) => (
                  <Option
                    key={id}
                    multi
                    selected={form.letters.includes(id)}
                    onPick={() => {
                      setForm((f) => {
                        const list = f.letters.includes(id) ? f.letters.filter((l) => l !== id) : [...f.letters.filter((l) => l !== LATER), id]
                        setReply(list.length >= 4 ? 'That’s a generous box. They’re lucky.' : list.length ? 'Lovely. Add more, or carry on.' : '')
                        return { ...f, letters: list }
                      })
                    }}
                    sub={SECTION_INFO[id].blurb}
                  >
                    {SECTION_INFO[id].title}
                  </Option>
                ))}
                <Option multi selected={form.letters.includes(LATER)} onPick={() => { setForm((f) => ({ ...f, letters: f.letters.includes(LATER) ? [] : [LATER] })); setReply('No rush. We’ll work it out together.') }} sub="We’ll suggest some in the conversation.">
                  I’ll decide later
                </Option>
              </Options>
            </>
          )}

          {key === 'opening' && (
            <Options>
              {Object.entries(UNLOCK_OPTIONS).map(([id, opt]) => (
                <Option key={id} selected={form.unlock === id} onPick={() => { set('unlock', id); setReply(UNLOCK_REPLY[id]) }} sub={opt.detail}>{opt.label}</Option>
              ))}
            </Options>
          )}

          {key === 'names' && (
            <div className="ob-fields">
              <div className="ob-field">
                <label htmlFor="ob-from">Your name</label>
                <input id="ob-from" className="ob-input" value={form.fromName} onChange={(e) => set('fromName', e.target.value)} autoComplete="given-name" autoFocus aria-invalid={tried && !!errors.fromName} aria-describedby="ob-from-err" />
                {tried && errors.fromName && <p id="ob-from-err" className="ob-error">{errors.fromName}</p>}
              </div>
              <div className="ob-field">
                <label htmlFor="ob-to">Their name</label>
                <input id="ob-to" className="ob-input" value={form.toName} onChange={(e) => set('toName', e.target.value)} placeholder="What you call them" aria-invalid={tried && !!errors.toName} aria-describedby="ob-to-err" />
                {tried && errors.toName && <p id="ob-to-err" className="ob-error">{errors.toName}</p>}
              </div>
            </div>
          )}

          {key === 'dates' && (
            <div className="ob-fields">
              <div className="ob-field">
                <label htmlFor="ob-start">The day you part</label>
                <input id="ob-start" type="date" min={today} className="ob-input" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} aria-invalid={tried && !!errors.startDate} aria-describedby="ob-start-err" />
                {tried && errors.startDate && <p id="ob-start-err" className="ob-error">{errors.startDate}</p>}
              </div>
              <div className="ob-field">
                <label htmlFor="ob-end">The day you meet again</label>
                <input id="ob-end" type="date" min={form.startDate || today} className="ob-input" value={form.noEnd ? '' : form.endDate} onChange={(e) => set('endDate', e.target.value)} disabled={form.noEnd} aria-invalid={tried && !!errors.endDate} aria-describedby="ob-end-err" />
                <button type="button" className="ob-toggle" aria-pressed={form.noEnd} onClick={() => set('noEnd', !form.noEnd)}>
                  <span className="ob-toggle-box" aria-hidden="true">{form.noEnd && <IconCheck />}</span>
                  There’s no set date
                </button>
                {tried && errors.endDate && <p id="ob-end-err" className="ob-error">{errors.endDate}</p>}
              </div>
              {apart !== null && <p className="ob-apart ob-rise"><b className="num">{apart}</b> {apart === 1 ? 'day' : 'days'} apart. We’ll fill them.</p>}
            </div>
          )}

          {key === 'building' && <Building form={form} />}

          {key === 'promise' && (
            <div className="ob-promise">
              <p>We don’t just make letters online. We listen closely to the two of you, and turn what we learn into letter paper made for this goodbye alone.</p>
              <p><b>The conversation matters most.</b> The more you tell us, the closer the paper gets to perfect.</p>
              <p>Don’t worry about where anything goes. Send today’s feelings, a photo, your voice, all of it, whenever the two of you cross your mind.</p>
            </div>
          )}
        </div>
      </main>

      {key !== 'building' && (
        <footer className={`ob-foot${reply ? ' is-replied' : ''}`}>
          <div className="ob-foot-inner">
            {tried && !ready && <p className="ob-foot-msg" role="alert">{key === 'names' || key === 'dates' ? 'A couple of things still need filling in.' : 'Pick one to carry on.'}</p>}
            <button type="button" className="ob-go" onClick={next} aria-disabled={!ready}>
              {key === 'promise' ? 'Got it, let’s start' : 'Continue'}
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}

function Options({ multi = false, children }) {
  return <div className="ob-options" role="group" aria-label={multi ? 'Choose any' : 'Choose one'}>{children}</div>
}

function Option({ selected, onPick, icon = null, sub = '', multi = false, children }) {
  const ref = useRef(null)
  return (
    <button ref={ref} type="button" className={`ob-option${selected ? ' is-on' : ''}`} aria-pressed={selected} onClick={onPick}>
      {multi ? <span className="ob-check" aria-hidden="true">{selected && <IconCheck />}</span> : icon && <span className="ob-icon" aria-hidden="true">{icon}</span>}
      <span className="ob-option-text">
        <span className="ob-option-label">{children}</span>
        {sub && <span className="ob-option-sub">{sub}</span>}
      </span>
    </button>
  )
}

function Building({ form }) {
  const rows = [
    ['Why you’re apart', REASONS.find((r) => r.id === form.reason)?.label],
    ['Who they are', form.relationship],
    ['The letters', form.letters.includes(LATER) ? 'Decide together' : `${form.letters.length} ${form.letters.length === 1 ? 'kind' : 'kinds'}`],
    ['You two', `${form.fromName.trim()} and ${form.toName.trim()}`],
  ]
  return (
    <div className="ob-build">
      <div className="ob-build-bar"><span /></div>
      <ul>
        {rows.map(([k, v], i) => (
          <li key={k} style={{ '--d': `${300 + i * 450}ms` }}>
            <span className="ob-build-tick" aria-hidden="true"><IconCheck /></span>
            <span className="ob-build-k">{k}</span>
            <span className="ob-build-v">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* outline icons, one stroke */
const S = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
function IconBoot() { return <svg {...S}><path d="M7 3h6v9l6 3a2 2 0 0 1 1 1.7V19H4v-4c0-1.5 3-2 3-4z" /><path d="M4 19v1.5h16V19M13 7h-3M13 10h-3" /></svg> }
function IconBook() { return <svg {...S}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></svg> }
function IconBag() { return <svg {...S}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12.5h18" /></svg> }
function IconHouse() { return <svg {...S}><path d="M4 11l8-6.5 8 6.5V20H4z" /><path d="M10 20v-5h4v5" /></svg> }
function IconPlane() { return <svg {...S}><path d="M10.5 13.5L3 11l1.5-1.5 8 1L17 6c1-1 3-1.5 3.5-1S20 7 19 8l-4.5 4.5 1 8L14 22l-2.5-7.5" /></svg> }
function IconDots() { return <svg {...S}><circle cx="6" cy="12" r="1.2" /><circle cx="12" cy="12" r="1.2" /><circle cx="18" cy="12" r="1.2" /></svg> }
function IconCheck() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5l3 3 6-7" /></svg> }
