import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft, hydrateFromDB } from '../utils/storage'
import { supabase, getUser } from '../utils/supabase'
import { localISODate, promptFor, stampFor, daysBetween, formatLong, UNLOCK_OPTIONS, normalizeUnlock } from '../utils/diary'
import MomentMedia, { MomentMediaView } from '../components/MomentMedia'
import './diary.css'

const newId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

function readState() {
  const d = getDraft()
  return {
    phase1: d.phase1 || {},
    entries: Array.isArray(d.diary) ? d.diary : [],
    unlock: normalizeUnlock(d.diaryUnlock || d.phase2?.diaryUnlock),
    email: d.reminders?.email || d.email || '',
    remindersOn: !!d.reminders?.enabled,
    sessionId: d.paymentSessionId || '',
  }
}

export default function Diary() {
  const navigate = useNavigate()
  const [state, setState] = useState(readState)
  const { phase1, entries, unlock, sessionId } = state
  const partDate = phase1.startDate || ''
  const toName = phase1.toName || 'them'
  const today = localISODate()

  const [offset, setOffset] = useState(0)
  const [body, setBody] = useState('')
  const [title, setTitle] = useState('')
  const [media, setMedia] = useState({ photo: null, video: null, voice: null })
  const [editTitle, setEditTitle] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editBody, setEditBody] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [signedIn, setSignedIn] = useState(null)

  useEffect(() => {
    document.title = "The days before — While You're Away"
    let live = true
    getUser().then((u) => { if (live) setSignedIn(!!u) })
    return () => { live = false }
  }, [])

  const prompt = promptFor(today, offset)
  const daysLeft = partDate ? daysBetween(today, partDate) : null
  const sorted = useMemo(
    () => [...entries].sort((a, b) => (a.writtenAt < b.writtenAt ? 1 : -1)),
    [entries],
  )
  const hasDraft = !!phase1.toName

  const persist = (patch) => {
    saveDraft(patch)
    setState(readState())
  }

  const hasMedia = !!(media.photo || media.video || media.voice)
  const canSave = !!body.trim() || hasMedia

  const saveEntry = () => {
    if (!canSave) return
    const now = new Date()
    const entry = {
      id: newId(),
      writtenOn: today,
      writtenAt: now.toISOString(),
      writtenTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      title: title.trim(),
      prompt: body.trim() ? prompt : '',
      body: body.trim(),
      ...(media.photo ? { photo: media.photo } : {}),
      ...(media.video ? { video: media.video } : {}),
      ...(media.voice ? { voice: media.voice } : {}),
    }
    persist({ diary: [...entries, entry] })
    setBody('')
    setTitle('')
    setMedia({ photo: null, video: null, voice: null })
    setOffset((o) => o + 1)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 4000)
  }

  const saveEdit = (id) => {
    const text = editBody.trim()
    const entry = entries.find((e) => e.id === id)
    if (!text && !(entry?.photo || entry?.video || entry?.voice)) return
    persist({ diary: entries.map((e) => (e.id === id ? { ...e, title: editTitle.trim(), body: text, editedAt: new Date().toISOString() } : e)) })
    setEditingId(null)
  }

  const removeEntry = (id) => {
    persist({ diary: entries.filter((e) => e.id !== id) })
    setConfirmDelete(null)
  }

  return (
    <div className="wd">
      <header className="wd-header">
        <a href="/" className="wd-brand" onClick={(e) => { e.preventDefault(); navigate('/') }}>
          <svg width="20" height="20" viewBox="0 0 22 22" aria-hidden="true">
            <circle cx="11" cy="11" r="5" fill="#F0B341" />
            <circle cx="11" cy="11" r="10" fill="none" stroke="#E9ECF2" strokeWidth="1.5" />
          </svg>
          While You're Away
        </a>
        {hasDraft && (
          <button type="button" className="wd-back" onClick={() => navigate('/editor')}>
            Your letter box
          </button>
        )}
      </header>

      <main className="wd-main">
        <section className="wd-intro">
          <h1>The days before</h1>
          {hasDraft ? (
            <p>
              Whenever something makes you think of {toName}, leave it here: a few lines, a photo, a voice note. Each one keeps the day and time you made it.
              {daysLeft !== null && daysLeft > 0 && <> <span className="wd-count">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span> until you part.</>}
              {daysLeft === 0 && <> Today is the day you part.</>}
            </p>
          ) : (
            <p>Sign in with the email you used at checkout to keep writing on this device.</p>
          )}
        </section>

        {!hasDraft && supabase && (
          <SignIn
            onDone={() => {
              setState(readState())
              setSignedIn(true)
            }}
          />
        )}

        {hasDraft && (
          <>
            <section className="wd-today" aria-labelledby="wd-today-label">
              <div className="wd-paper">
                <p id="wd-today-label" className="wd-stamp">
                  <span className="wd-dot" aria-hidden="true" />
                  Today · {stampFor(today, partDate, 'you')}
                </p>
                <p className="wd-prompt">{prompt}</p>
                <button type="button" className="wd-text-btn" onClick={() => setOffset((o) => o + 1)}>
                  Another question
                </button>
                <label htmlFor="wd-title" className="wd-sr">Title (optional)</label>
                <input
                  id="wd-title"
                  className="wd-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, 80))}
                  placeholder="A title, if you like"
                />
                <label htmlFor="wd-body" className="wd-sr">Today's entry</label>
                <textarea
                  id="wd-body"
                  className="wd-textarea"
                  rows={7}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write as much or as little as you like. You don't have to answer the question."
                />
                <MomentMedia value={media} onChange={setMedia} />
                <div className="wd-actions">
                  <button type="button" className="wd-btn" onClick={saveEntry} disabled={!canSave}>
                    Save today's entry
                  </button>
                  <p className="wd-saved" role="status">{justSaved ? 'Saved. It carries today’s date.' : ''}</p>
                </div>
              </div>
            </section>

            <section className="wd-settings" aria-label="Settings">
              <UnlockSetting value={unlock} toName={toName} onChange={(v) => persist({ diaryUnlock: v })} />
              <Reminders
                key={state.remindersOn ? 'on' : 'off'}
                initialEmail={state.email}
                enabled={state.remindersOn}
                partDate={partDate}
                daysLeft={daysLeft}
                toName={phase1.toName || ''}
                sessionId={sessionId}
                onSaved={(email, enabled) => persist({ reminders: { email, enabled } })}
              />
            </section>

            <section className="wd-entries" aria-labelledby="wd-entries-title">
              <h2 id="wd-entries-title">{sorted.length ? 'What you’ve written' : 'Your entries will appear here'}</h2>
              {sorted.length === 0 && (
                <p className="wd-empty">Start with today. Even one sentence is enough.</p>
              )}
              <ol className="wd-list">
                {sorted.map((e) => (
                  <li key={e.id} className="wd-entry">
                    <p className="wd-stamp wd-stamp--small">
                      <span className="wd-dot" aria-hidden="true" />
                      <span>
                        {stampFor(e.writtenOn, partDate, 'you')}
                        <span className="wd-date"> · {formatLong(e.writtenOn)}{e.writtenTime ? `, ${e.writtenTime}` : ''}</span>
                      </span>
                    </p>
                    {e.title && editingId !== e.id && <p className="wd-entry-title">{e.title}</p>}
                    {e.prompt && <p className="wd-entry-prompt">{e.prompt}</p>}
                    {editingId === e.id ? (
                      <>
                        <label htmlFor={`wd-edit-title-${e.id}`} className="wd-sr">Edit title</label>
                        <input
                          id={`wd-edit-title-${e.id}`}
                          className="wd-title-input wd-title-input--dark"
                          value={editTitle}
                          onChange={(ev) => setEditTitle(ev.target.value.slice(0, 80))}
                          placeholder="Title (optional)"
                        />
                        <label htmlFor={`wd-edit-${e.id}`} className="wd-sr">Edit entry</label>
                        <textarea
                          id={`wd-edit-${e.id}`}
                          className="wd-textarea wd-textarea--edit"
                          rows={5}
                          value={editBody}
                          onChange={(ev) => setEditBody(ev.target.value)}
                        />
                        <div className="wd-row-actions">
                          <button type="button" className="wd-btn wd-btn--small" onClick={() => saveEdit(e.id)}>Save changes</button>
                          <button type="button" className="wd-text-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        {e.body && <p className="wd-entry-body">{e.body}</p>}
                        <MomentMediaView entry={e} />
                        <div className="wd-row-actions">
                          <button type="button" className="wd-text-btn" onClick={() => { setEditingId(e.id); setEditBody(e.body || ''); setEditTitle(e.title || '') }}>Edit</button>
                          {confirmDelete === e.id ? (
                            <>
                              <button type="button" className="wd-text-btn wd-danger" onClick={() => removeEntry(e.id)}>Delete this entry</button>
                              <button type="button" className="wd-text-btn" onClick={() => setConfirmDelete(null)}>Keep it</button>
                            </>
                          ) : (
                            <button type="button" className="wd-text-btn" onClick={() => setConfirmDelete(e.id)}>Delete</button>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {supabase && signedIn === false && (
              <section className="wd-card wd-card--quiet">
                <h2>Writing on another device?</h2>
                <p>Sign in so your entries follow you. The same email you used at checkout works.</p>
                <SignIn compact onDone={() => { setState(readState()); setSignedIn(true) }} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function UnlockSetting({ value, toName, onChange }) {
  return (
    <div className="wd-card">
      <h2>How {toName} opens these</h2>
      <div className="wd-options" role="radiogroup" aria-label="How entries open">
        {Object.entries(UNLOCK_OPTIONS).map(([key, opt]) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={value === key}
            className="wd-option"
            onClick={() => onChange(key)}
          >
            <span className="wd-option-label">{opt.label}</span>
            <span className="wd-option-detail">{opt.detail}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Reminders({ initialEmail, enabled, partDate, daysLeft, toName, sessionId, onSaved }) {
  const [email, setEmail] = useState(initialEmail)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const canUse = !!partDate && daysLeft !== null && daysLeft >= 0

  const submit = async (nextEnabled) => {
    if (nextEnabled && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter the email address you want the questions sent to.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, email: email.trim(), partDate, toName, enabled: nextEnabled }),
      })
      if (res.status === 402) throw new Error('Reminders start after checkout. Finish payment, then turn them on here.')
      if (!res.ok) throw new Error('Couldn’t save your reminder setting. Try again in a moment.')
      onSaved(email.trim(), nextEnabled)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wd-card">
      <h2>A question each evening</h2>
      {!canUse ? (
        <p>Reminders need a parting date in the future. You can set it when you start a letter box.</p>
      ) : enabled ? (
        <>
          <p>
            We’ll email one question to <strong>{email}</strong> each evening until {formatLong(partDate)}. Skip any night you like; nothing piles up.
          </p>
          <button type="button" className="wd-text-btn" onClick={() => submit(false)} disabled={busy}>
            {busy ? 'Saving…' : 'Turn off evening questions'}
          </button>
        </>
      ) : (
        <>
          <p>One gentle email each evening with a question to write about. No reminders about days you skip.</p>
          <label htmlFor="wd-email" className="wd-label">Send to</label>
          <div className="wd-inline">
            <input
              id="wd-email"
              type="email"
              className="wd-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <button type="button" className="wd-btn wd-btn--small" onClick={() => submit(true)} disabled={busy}>
              {busy ? 'Saving…' : 'Send me a question each evening'}
            </button>
          </div>
        </>
      )}
      {error && <p className="wd-error" role="alert">{error}</p>}
    </div>
  )
}

function SignIn({ onDone, compact = false }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    setBusy(false)
    if (err) return setError(err.status === 429 ? 'Too many codes just now. Wait a minute and try again.' : 'Couldn’t send the code. Try again.')
    setStage('code')
  }

  const verify = async () => {
    const token = code.replace(/\D/g, '')
    if (token.length < 6) return setError('Enter the code from your email.')
    setBusy(true)
    setError('')
    const { data, error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'email' })
    if (err || !data?.session) {
      setBusy(false)
      return setError('That code didn’t work. Check the newest email, or send a new code.')
    }
    await hydrateFromDB()
    saveDraft({})
    setBusy(false)
    onDone()
  }

  return (
    <div className={compact ? 'wd-signin wd-signin--compact' : 'wd-card wd-signin'}>
      {stage === 'email' ? (
        <>
          <label htmlFor="wd-signin-email" className="wd-label">Email</label>
          <div className="wd-inline">
            <input id="wd-signin-email" type="email" className="wd-input" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="you@example.com" autoComplete="email" />
            <button type="button" className="wd-btn wd-btn--small" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send sign-in code'}</button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor="wd-signin-code" className="wd-label">Code sent to {email}</label>
          <div className="wd-inline">
            <input id="wd-signin-code" type="text" inputMode="numeric" autoComplete="one-time-code" className="wd-input wd-input--code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(e) => e.key === 'Enter' && verify()} placeholder="Enter code" />
            <button type="button" className="wd-btn wd-btn--small" onClick={verify} disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
          </div>
          <button type="button" className="wd-text-btn" onClick={() => { setStage('email'); setCode(''); setError('') }}>Use a different email</button>
        </>
      )}
      {error && <p className="wd-error" role="alert">{error}</p>}
    </div>
  )
}
