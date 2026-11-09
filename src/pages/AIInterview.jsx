import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { runAIInterview, extractComplete, extractGathered, PaymentRequiredError } from '../utils/aiService'
import { normalizePlan, SCHEDULES, SECTION_INFO } from '../utils/plan'
import { normalizeUnlock, formatLong } from '../utils/diary'
import { uploadMedia, NeedSignInError, useMediaUrl } from '../utils/media'
import { useRecorder, fmtSeconds } from '../utils/useRecorder'
import { FILM_MAX_PHOTOS, normalizeFilm } from '../utils/film'
import FlowFrame from '../components/FlowFrame'
import SignInModal from '../components/SignInModal'
import Mascot from '../components/Mascot'
import { renderInline } from '../utils/text'

/* Step 3: plan the letter box together. Photos and a voice note can be dropped in right here.
   The conversation is saved, so a reload never loses it. */

const GATHER_MAX = 8
const ENOUGH = 'That’s enough for now. Let’s wrap up.'
const PREFIX = { photo: '[Attached: a photo]', voice: '[Attached: a voice note]' }

/** Put what they attached where it belongs: photos into the opening film, the first voice note on the seal. */
function fileAway(media, caption) {
  const d = getDraft()
  if (media.kind === 'photo') {
    const film = normalizeFilm(d.film)
    if (film.photos.length >= FILM_MAX_PHOTOS) return
    saveDraft({ film: { ...film, photos: [...film.photos, { id: `f${Date.now().toString(36)}`, photo: media.ref, caption: caption.slice(0, 120) }] } })
  } else if (!d.sealVoice) {
    saveDraft({ sealVoice: media.ref })
  } else {
    const film = normalizeFilm(d.film)
    if (!film.voice) saveDraft({ film: { ...film, voice: media.ref } })
  }
}

export default function AIInterview() {
  const navigate = useNavigate()
  const toName = getDraft().phase1?.toName || 'them'
  const [messages, setMessages] = useState(() => getDraft().interviewChat || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [plan, setPlan] = useState(() => (getDraft().phase2Done && getDraft().plan ? normalizePlan(getDraft().plan) : null))
  const [gathered, setGathered] = useState(() => Number(getDraft().interviewGathered) || 0)
  const [attach, setAttach] = useState(null) // { kind, ref }
  const [busy, setBusy] = useState('')
  const [attachError, setAttachError] = useState('')
  const [pendingUpload, setPendingUpload] = useState(null)
  const bottom = useRef(null)
  const box = useRef(null)
  const photoIn = useRef(null)

  const persist = (msgs) => {
    setMessages(msgs)
    saveDraft({ interviewChat: msgs })
  }

  const ask = useCallback(async (msgs) => {
    setLoading(true)
    setFailed(false)
    try {
      const last = msgs[msgs.length - 1]
      const seePhoto = last?.media?.kind === 'photo' ? [last.media.ref] : []
      const raw = await runAIInterview(msgs.map((m) => ({ role: m.role, content: m.content })), getDraft().phase1 || {}, seePhoto)
      const g = extractGathered(raw)
      if (g.gathered !== null) { setGathered(g.gathered); saveDraft({ interviewGathered: g.gathered }) }
      const done = extractComplete(g.text)
      const shown = done ? done.rest || 'That’s everything. Here’s your letter box.' : g.text
      const next = [...msgs, { role: 'assistant', content: shown }]
      persist(next)
      if (done) {
        const d = done.data || {}
        const p = normalizePlan(d.plan || {})
        const prev = getDraft()
        saveDraft({
          phase1: { ...prev.phase1, situation: typeof d.situation === 'string' ? d.situation.slice(0, 200) : prev.phase1?.situation || '' },
          phase2: { ...d, situationLabels: p.anytime },
          phase2Done: true,
          plan: p,
          contact: ['none', 'sometimes', 'daily'].includes(d.contact) ? d.contact : 'sometimes',
          diaryUnlock: normalizeUnlock(d.diaryUnlock || prev.diaryUnlock),
        })
        setPlan(p)
      }
    } catch (err) {
      if (err instanceof PaymentRequiredError) return navigate('/paywall')
      setFailed(true)
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    if (messages.length === 0) {
      // first visit: the guide opens the conversation
      // eslint-disable-next-line react-hooks/set-state-in-effect
      ask([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, plan])

  const upload = async (kind, blob) => {
    setBusy(kind)
    setAttachError('')
    try {
      const ref = await uploadMedia(blob)
      setAttach({ kind, ref })
      box.current?.focus()
    } catch (err) {
      if (err instanceof NeedSignInError) setPendingUpload({ kind, blob })
      else setAttachError(err.message || 'That didn’t upload. Try again.')
    } finally {
      setBusy('')
    }
  }
  const rec = useRecorder((blob) => upload('voice', blob))

  const send = (preset) => {
    const text = (preset ?? input).trim()
    if ((!text && !attach) || loading || busy) return
    setInput('')
    let msg = { role: 'user', content: text }
    if (attach && preset === undefined) {
      msg = { role: 'user', content: `${PREFIX[attach.kind]} ${text}`.trim(), media: attach }
      fileAway(attach, text)
      setAttach(null)
    }
    const next = [...messages, msg]
    persist(next)
    ask(next)
    box.current?.focus()
  }

  const retry = () => {
    const last = messages[messages.length - 1]
    if (!last || last.role === 'user') ask(messages)
  }

  const userTurns = messages.filter((m) => m.role === 'user').length
  const showMeter = !plan && userTurns >= 2

  return (
    <FlowFrame step={2}>
      <div className="ai-guide">
        <Mascot size={96} move={loading ? 'talk' : plan ? 'cheer' : 'idle'} />
        <div>
          <h1 className="wf-h1">Let’s plan it together.</h1>
          <p className="wf-lede">Tell me about your goodbye. I’ll suggest a letter box that fits it, and you decide what stays.</p>
        </div>
      </div>

      {showMeter && (
        <div className="ai-meter" role="group" aria-label="How personal the letter box is">
          <div className="ai-meter-top">
            <b>How personal {toName}’s box is</b>
            <span>{gathered >= 6 ? 'Wonderfully personal' : gathered >= 3 ? 'Getting personal' : 'Just getting started'}</span>
          </div>
          <div className="ai-meter-bar"><span style={{ transform: `scaleX(${Math.max(0.06, gathered / GATHER_MAX)})` }} /></div>
          <div className="ai-meter-foot">
            <span>Each small detail you share becomes part of how the box looks.</span>
            <button type="button" className="ai-enough" onClick={() => send(ENOUGH)} disabled={loading}>That’s enough for now</button>
          </div>
        </div>
      )}

      <div className="wf-chat" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`wf-msg ${m.role === 'assistant' ? 'wf-msg--ai' : 'wf-msg--me'}${m.media ? ' wf-msg--media' : ''}`}>
            {m.media && <Attached media={m.media} />}
            {m.role === 'assistant' ? renderInline(m.content) : (m.media ? m.content.replace(PREFIX[m.media.kind], '').trim() : m.content)}
          </div>
        ))}
        {loading && (
          <div className="wf-typing" aria-label="Writing">
            <span /><span /><span />
          </div>
        )}
        {failed && (
          <div className="wf-card" role="alert" style={{ alignSelf: 'stretch' }}>
            <p style={{ marginBottom: 12 }}>The conversation didn’t go through. Nothing you wrote is lost.</p>
            <button type="button" className="wf-btn wf-btn--small" onClick={retry}>Try again</button>
          </div>
        )}
        {plan && !loading && <PlanSummary plan={plan} onContinue={() => navigate('/generate')} />}
        <div ref={bottom} />
      </div>

      <div className="wf-composer">
        {(attach || busy || attachError || rec.recording || rec.error) && (
          <div className="ai-attach">
            {busy && <span>{busy === 'photo' ? 'Adding your photo…' : 'Saving your voice…'}</span>}
            {rec.recording && <span className="ai-rec"><i aria-hidden="true" />Recording · {fmtSeconds(rec.seconds)} <button type="button" onClick={rec.stop}>Stop</button></span>}
            {attach && <><Attached media={attach} small /><span>{attach.kind === 'photo' ? 'Add a line about it, or just send.' : 'Your voice note is ready. Send it, with a line if you like.'}</span><button type="button" className="ai-x" onClick={() => setAttach(null)} aria-label="Remove attachment">×</button></>}
            {(attachError || rec.error) && <span className="ai-err" role="alert">{attachError || rec.error}</span>}
          </div>
        )}
        <div className="wf-composer-inner">
          <div className="ai-tools">
            <button type="button" className="ai-tool" onClick={() => photoIn.current?.click()} disabled={!!busy || loading || !!attach} aria-label="Add a photo" title="Add a photo">
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><circle cx="7.5" cy="9" r="1.5" /><path d="M17.5 13l-4-4-6 6.5" /></svg>
            </button>
            <button type="button" className={`ai-tool${rec.recording ? ' is-rec' : ''}`} onClick={rec.recording ? rec.stop : rec.start} disabled={(!!busy || loading || !!attach) && !rec.recording} aria-label={rec.recording ? 'Stop recording' : 'Record a voice note'} aria-pressed={rec.recording} title="Record your voice">
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="7.5" y="2.5" width="5" height="9" rx="2.5" /><path d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5" /></svg>
            </button>
            <input ref={photoIn} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload('photo', f) }} />
          </div>
          <label htmlFor="ai-input" className="wf-sr">Your message</label>
          <textarea
            id="ai-input"
            ref={box}
            rows={1}
            value={input}
            placeholder={attach ? 'A line about it (optional)' : plan ? 'Want to change something? Just say so.' : 'Write your answer…'}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          />
          <button type="button" className="wf-send" onClick={() => send()} disabled={(!input.trim() && !attach) || loading || !!busy} aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h11M11 5l5 5-5 5" /></svg>
          </button>
        </div>
      </div>

      {pendingUpload && (
        <SignInModal
          reason="Photos and voice notes are kept safe in your account."
          onClose={() => setPendingUpload(null)}
          onDone={() => { const p = pendingUpload; setPendingUpload(null); upload(p.kind, p.blob) }}
        />
      )}
    </FlowFrame>
  )
}

function Attached({ media, small = false }) {
  const url = useMediaUrl(media.ref)
  if (media.kind === 'photo') {
    return url ? <img className={`ai-thumb${small ? ' ai-thumb--sm' : ''}`} src={url} alt="Your photo" /> : <span className={`ai-thumb ai-thumb--empty${small ? ' ai-thumb--sm' : ''}`} />
  }
  return url ? <audio className="ai-audio" src={url} controls preload="metadata" /> : <span className="ai-voice-chip">Voice note</span>
}

function PlanSummary({ plan, onContinue }) {
  const rows = []
  if (plan.tonight) rows.push([SECTION_INFO.tonight.title, 'One letter for the night you part'])
  if (plan.scheduled.enabled) rows.push([SECTION_INFO.scheduled.title, `${plan.scheduled.count} letters, ${SCHEDULES[plan.scheduled.schedule].label.toLowerCase()}`])
  if (plan.neverSaid.length) rows.push([SECTION_INFO.never.title, plan.neverSaid.map((n) => n.label).join(' · ')])
  if (plan.anytime.length) rows.push([SECTION_INFO.anytime.title, plan.anytime.map((n) => n.label).join(' · ')])
  if (plan.occasions.length) rows.push([SECTION_INFO.occasions.title, plan.occasions.map((o) => `${o.label} (${formatLong(o.date)})`).join(' · ')])
  if (plan.last) rows.push([SECTION_INFO.last.title, 'Sealed until you meet again'])
  return (
    <div className="wf-paper" style={{ alignSelf: 'stretch', animation: 'wfIn 400ms ease both' }}>
      <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 22 }}>Your letter box</h2>
      <p className="wf-note" style={{ marginBottom: 14 }}>You can add, remove or rename any of these later while you write.</p>
      <dl style={{ margin: 0 }}>
        {rows.map(([t, d]) => (
          <div key={t} style={{ padding: '10px 0', borderTop: '1px solid var(--paper-line)' }}>
            <dt style={{ fontWeight: 600, fontSize: 15 }}>{t}</dt>
            <dd style={{ margin: '2px 0 0', fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{d}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="wf-btn wf-btn--ink wf-btn--block" style={{ marginTop: 16 }} onClick={onContinue}>Looks good, let’s name it</button>
    </div>
  )
}
