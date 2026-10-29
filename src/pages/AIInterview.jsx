import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { runAIInterview, extractComplete, PaymentRequiredError } from '../utils/aiService'
import { normalizePlan, SCHEDULES, SECTION_INFO } from '../utils/plan'
import { normalizeUnlock, formatLong } from '../utils/diary'
import FlowFrame from '../components/FlowFrame'
import { renderInline } from '../utils/text'

/* Step 3: plan the letter box together. The conversation is saved, so a reload never loses it. */

export default function AIInterview() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(() => getDraft().interviewChat || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [plan, setPlan] = useState(() => (getDraft().phase2Done && getDraft().plan ? normalizePlan(getDraft().plan) : null))
  const bottom = useRef(null)
  const box = useRef(null)

  const persist = (msgs) => {
    setMessages(msgs)
    saveDraft({ interviewChat: msgs })
  }

  const ask = useCallback(async (msgs) => {
    setLoading(true)
    setFailed(false)
    try {
      const reply = await runAIInterview(msgs, getDraft().phase1 || {})
      const done = extractComplete(reply)
      const shown = done ? done.rest || 'That’s everything. Here’s your letter box.' : reply
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
          diaryUnlock: normalizeUnlock(d.diaryUnlock),
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

  const send = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    persist(next)
    ask(next)
    box.current?.focus()
  }

  const retry = () => {
    const last = messages[messages.length - 1]
    if (!last || last.role === 'user') ask(messages)
  }

  return (
    <FlowFrame step={2}>
      <h1 className="wf-h1">Let’s plan it together.</h1>
      <p className="wf-lede">Tell me about your goodbye. I’ll suggest a letter box that fits it, and you decide what stays.</p>

      <div className="wf-chat" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`wf-msg ${m.role === 'assistant' ? 'wf-msg--ai' : 'wf-msg--me'}`}>
            {m.role === 'assistant' ? renderInline(m.content) : m.content}
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
        <div className="wf-composer-inner">
          <label htmlFor="ai-input" className="wf-sr">Your message</label>
          <textarea
            id="ai-input"
            ref={box}
            rows={1}
            value={input}
            placeholder={plan ? 'Want to change something? Just say so.' : 'Write your answer…'}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          />
          <button type="button" className="wf-send" onClick={send} disabled={!input.trim() || loading} aria-label="Send">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h11M11 5l5 5-5 5" /></svg>
          </button>
        </div>
      </div>
    </FlowFrame>
  )
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
