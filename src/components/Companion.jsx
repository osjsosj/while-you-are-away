import { useEffect, useRef, useState } from 'react'
import { getDraft, saveDraft } from '../utils/storage'
import { askCompanion, AIUnavailableError, PaymentRequiredError } from '../utils/aiService'
import { renderInline } from '../utils/text'

/* The writing companion: a side panel that stays with the sender while they write. Chat is kept in the draft. */

const KEEP = 60 // messages sent per call; older ones stay on screen only

export default function Companion({ open, onClose, summary, seed, onSeedUsed }) {
  const [messages, setMessages] = useState(() => getDraft().companionChat || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottom = useRef(null)
  const field = useRef(null)
  const started = useRef(false)

  const persist = (msgs) => {
    setMessages(msgs)
    saveDraft({ companionChat: msgs.slice(-200) })
  }

  const ask = async (msgs) => {
    setLoading(true)
    setError('')
    try {
      let recent = msgs.slice(-KEEP)
      while (recent.length && recent[0].role !== 'assistant') recent = recent.slice(1)
      const reply = await askCompanion(recent, summary())
      persist([...msgs, { role: 'assistant', content: reply }])
    } catch (err) {
      if (err instanceof AIUnavailableError && err.status === 429) setError('You’ve used all the companion messages for this letter box. Everything you wrote is safe, and you can keep writing.')
      else if (err instanceof PaymentRequiredError) setError('The companion opens after checkout.')
      else setError('That didn’t go through. Your message is still here; try again.')
    } finally {
      setLoading(false)
    }
  }

  // First open: the companion says hello, having looked at the letter box.
  useEffect(() => {
    if (!open || started.current) return
    started.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (messages.length === 0) ask([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // A letter asked for help: prefill the composer.
  useEffect(() => {
    if (open && seed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInput(seed)
      onSeedUsed?.()
      setTimeout(() => field.current?.focus(), 50)
    }
  }, [open, seed, onSeedUsed])

  useEffect(() => {
    if (open) bottom.current?.scrollIntoView({ block: 'end' })
  }, [messages, loading, open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const send = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    persist(next)
    ask(next)
  }

  const retry = () => {
    const last = messages[messages.length - 1]
    if (!last || last.role === 'user') ask(messages)
  }

  if (!open) return null
  return (
    <aside className="we-companion" aria-label="Writing companion">
      <header className="we-companion-head">
        <div>
          <p className="we-companion-title">Your companion</p>
          <p className="wf-note">Help finding the words. The words stay yours.</p>
        </div>
        <button type="button" className="we-icon-btn" onClick={onClose} aria-label="Close companion">
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
      </header>
      <div className="we-companion-body" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`wf-msg ${m.role === 'assistant' ? 'wf-msg--ai' : 'wf-msg--me'}`}>
            {m.role === 'assistant' ? renderInline(m.content) : m.content}
          </div>
        ))}
        {loading && <div className="wf-typing" aria-label="Writing"><span /><span /><span /></div>}
        {error && (
          <div className="wf-card" role="alert">
            <p style={{ marginBottom: 10, fontSize: 15 }}>{error}</p>
            {!error.startsWith('You’ve used') && !error.startsWith('The companion') && <button type="button" className="wf-btn wf-btn--small" onClick={retry}>Try again</button>}
          </div>
        )}
        <div ref={bottom} />
      </div>
      <div className="we-companion-composer">
        <label htmlFor="we-c-input" className="wf-sr">Message your companion</label>
        <textarea
          id="we-c-input"
          ref={field}
          rows={2}
          value={input}
          placeholder="Stuck on a letter? Tell me about it."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        />
        <button type="button" className="wf-send" onClick={send} disabled={!input.trim() || loading} aria-label="Send">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h11M11 5l5 5-5 5" /></svg>
        </button>
      </div>
    </aside>
  )
}
