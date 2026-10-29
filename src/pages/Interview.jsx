import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { localISODate, daysBetween } from '../utils/diary'
import FlowFrame from '../components/FlowFrame'

/* Step 1: the basics. Everything else is planned together in the AI conversation after checkout. */

const RELATIONSHIPS = ['A partner', 'A parent', 'A child', 'A friend', 'Someone else']

export default function Interview() {
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    const d = getDraft()
    const p = d.phase1 || {}
    return {
      fromName: p.fromName || '',
      toName: p.toName || '',
      relationship: p.relationship || d.landing?.relationship || 'A partner',
      startDate: p.startDate || d.landing?.startDate || '',
      endDate: p.endDate || '',
      noEnd: p.endDate === '' && !!p.startDate,
    }
  })
  const [tried, setTried] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }))

  const today = localISODate()
  const errors = {
    fromName: !form.fromName.trim() && 'Add your name.',
    toName: !form.toName.trim() && 'Add their name.',
    startDate: !form.startDate ? 'Pick the day you part.' : form.startDate < today ? 'The day you part should be today or later.' : '',
    endDate: !form.noEnd && form.endDate && form.startDate && form.endDate <= form.startDate ? 'This should be after the day you part.' : '',
  }
  const valid = !Object.values(errors).some(Boolean)
  const apart = form.startDate && form.endDate && !form.noEnd && !errors.endDate ? daysBetween(form.startDate, form.endDate) : null

  const next = (e) => {
    e.preventDefault()
    setTried(true)
    if (!valid) return
    const prev = getDraft().phase1 || {}
    saveDraft({
      phase1: {
        ...prev,
        fromName: form.fromName.trim(),
        toName: form.toName.trim(),
        relationship: form.relationship,
        startDate: form.startDate,
        endDate: form.noEnd ? '' : form.endDate,
      },
      phase1Done: true,
    })
    navigate('/paywall')
  }

  const err = (k) => tried && errors[k]

  return (
    <FlowFrame step={0} narrow>
      <h1 className="wf-h1">Let’s start with the two of you.</h1>
      <p className="wf-lede">Just the basics. After this, we’ll plan the rest of the letter box together, around your goodbye.</p>

      <form onSubmit={next} noValidate>
        <div className="wf-row">
          <div className="wf-field">
            <label className="wf-label" htmlFor="f-from">Your name</label>
            <input id="f-from" className="wf-input" value={form.fromName} onChange={set('fromName')} autoComplete="given-name" aria-invalid={!!err('fromName')} aria-describedby="f-from-err" />
            {err('fromName') && <p id="f-from-err" className="wf-error">{errors.fromName}</p>}
          </div>
          <div className="wf-field">
            <label className="wf-label" htmlFor="f-to">Their name</label>
            <input id="f-to" className="wf-input" value={form.toName} onChange={set('toName')} placeholder="What you call them" aria-invalid={!!err('toName')} aria-describedby="f-to-err" />
            {err('toName') && <p id="f-to-err" className="wf-error">{errors.toName}</p>}
          </div>
        </div>

        <fieldset className="wf-field" style={{ border: 'none', padding: 0 }}>
          <legend className="wf-label">Who are they to you?</legend>
          <div className="wf-pills">
            {RELATIONSHIPS.map((r) => (
              <button key={r} type="button" className="wf-pill" aria-pressed={form.relationship === r} onClick={() => set('relationship')(r)}>{r}</button>
            ))}
          </div>
        </fieldset>

        <div className="wf-row">
          <div className="wf-field">
            <label className="wf-label" htmlFor="f-start">The day you part</label>
            <input id="f-start" type="date" min={today} className="wf-input" value={form.startDate} onChange={set('startDate')} aria-invalid={!!err('startDate')} aria-describedby="f-start-err" />
            {err('startDate') && <p id="f-start-err" className="wf-error">{errors.startDate}</p>}
          </div>
          <div className="wf-field">
            <label className="wf-label" htmlFor="f-end">The day you meet again</label>
            <input id="f-end" type="date" min={form.startDate || today} className="wf-input" value={form.noEnd ? '' : form.endDate} onChange={set('endDate')} disabled={form.noEnd} aria-invalid={!!err('endDate')} aria-describedby="f-end-err" />
            <label className="wf-check">
              <input type="checkbox" checked={form.noEnd} onChange={set('noEnd')} /> There’s no set date
            </label>
            {err('endDate') && <p id="f-end-err" className="wf-error">{errors.endDate}</p>}
          </div>
        </div>

        {apart !== null && <p className="wf-note" style={{ marginBottom: 24 }}>That’s {apart} {apart === 1 ? 'day' : 'days'} apart.</p>}

        <button type="submit" className="wf-btn wf-btn--block">Continue</button>
      </form>
    </FlowFrame>
  )
}
