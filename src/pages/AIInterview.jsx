import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft, saveDraft } from '../utils/storage'
import { runAIInterview } from '../utils/aiService'

export default function AIInterview() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { startInterview() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startInterview = async () => {
    setLoading(true)
    const phase1 = getDraft().phase1 || {}
    const firstMessage = await runAIInterview([], phase1, true)
    setMessages([{ role: 'assistant', content: firstMessage }])
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    const phase1 = getDraft().phase1 || {}
    const response = await runAIInterview(newMessages, phase1, false)

    if (response.includes('<COMPLETE>')) {
      try {
        const json = response.match(/<COMPLETE>([\s\S]*?)<\/COMPLETE>/)?.[1]
        if (json) {
          const parsed = JSON.parse(json)
          saveDraft({ phase2: parsed, phase2Done: true })
          const cleanResponse = response.replace(/<COMPLETE>[\s\S]*?<\/COMPLETE>/, '').trim()
          setMessages([...newMessages, {
            role: 'assistant',
            content: cleanResponse || "We're all set! Let's build your letter box 💌",
          }])
          setDone(true)
          setLoading(false)
          return
        }
      } catch (e) { console.error(e) }
    }

    setMessages([...newMessages, { role: 'assistant', content: response }])
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const progress = Math.min(90, 50 + messages.filter((m) => m.role === 'user').length * 5)
  const draft = getDraft()
  const toName = draft.phase1?.toName || 'them'

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto" style={{ background: '#FBF4E8' }}>

      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 pt-4 pb-3"
        style={{ background: 'rgba(251,244,232,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E8D5B5' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-display italic text-sm text-text-mid">
            Tell me about {toName}
          </span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8706E', animation: 'pulse 2s infinite' }} />
            <span className="font-sans text-xs" style={{ color: '#C8706E', fontWeight: 400 }}>AI</span>
          </div>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: '#E8D5B5' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #C8706E, #E8A0A0)' }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-6 space-y-5 overflow-y-auto pb-36">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'fadeUp 0.3s ease both' }}
          >
            {m.role === 'assistant' && (
              <div
                className="flex-shrink-0 flex items-center justify-center font-display italic text-white"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C8706E, #9E4E4C)',
                  fontSize: 13, flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(200,112,110,0.35)',
                }}
              >
                W
              </div>
            )}
            <div
              className="max-w-[78%] font-sans text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                padding: '12px 16px',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                ...(m.role === 'user'
                  ? { background: '#C8706E', color: 'white' }
                  : { background: '#FFFDF9', color: '#2D1F14', border: '1px solid #E8D5B5', boxShadow: '0 1px 6px rgba(45,31,20,0.05)' }
                ),
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-3 justify-start" style={{ animation: 'fadeUp 0.3s ease both' }}>
            <div
              className="flex-shrink-0 flex items-center justify-center font-display italic text-white"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #C8706E, #9E4E4C)',
                fontSize: 13, boxShadow: '0 2px 8px rgba(200,112,110,0.35)',
              }}
            >
              W
            </div>
            <div
              style={{
                background: '#FFFDF9', border: '1px solid #E8D5B5',
                borderRadius: '18px 18px 18px 4px',
                padding: '14px 18px',
                boxShadow: '0 1px 6px rgba(45,31,20,0.05)',
              }}
            >
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#D4BC95',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 py-4"
        style={{ background: 'rgba(251,244,232,0.98)', backdropFilter: 'blur(8px)', borderTop: '1px solid #E8D5B5' }}
      >
        {done ? (
          <button
            type="button"
            onClick={() => navigate('/generate')}
            className="btn-primary w-full py-4 rounded-2xl text-sm font-sans"
          >
            Build my letter box →
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Write your answer..."
              disabled={loading}
              className="flex-1 font-sans text-sm focus:outline-none"
              style={{
                background: '#FFFDF9',
                border: '1px solid #E8D5B5',
                borderRadius: 20,
                padding: '12px 18px',
                color: '#2D1F14',
                opacity: loading ? 0.6 : 1,
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center transition-all"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: input.trim() && !loading ? '#C8706E' : '#E8D5B5',
                color: 'white', fontSize: 18,
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
