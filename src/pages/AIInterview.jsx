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

  useEffect(() => {
    startInterview()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const startInterview = async () => {
    setLoading(true)
    const phase1 = getDraft().phase1 || {}
    const firstMessage = await runAIInterview([], phase1, true)
    setMessages([{ role: 'assistant', content: firstMessage }])
    setLoading(false)
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
          const cleanResponse = response
            .replace(/<COMPLETE>[\s\S]*?<\/COMPLETE>/, '')
            .trim()
          setMessages([
            ...newMessages,
            {
              role: 'assistant',
              content:
                cleanResponse || "We're all set! Let's build your letter box 💌",
            },
          ])
          setDone(true)
          setLoading(false)
          return
        }
      } catch (e) {
        console.error(e)
      }
    }

    setMessages([...newMessages, { role: 'assistant', content: response }])
    setLoading(false)
  }

  const progress = Math.min(
    90,
    50 + messages.filter((m) => m.role === 'user').length * 5,
  )

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <div className="sticky top-0 bg-warm-50 px-4 py-3 border-b border-warm-200 z-10">
        <div className="flex items-center justify-between text-xs text-text-muted mb-2">
          <span>AI Interview</span>
          <span className="text-rose">✦ AI</span>
        </div>
        <div className="h-1 bg-warm-200 rounded-full">
          <div
            className="h-full bg-rose rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto pb-40">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="text-2xl mr-2 mt-1 flex-shrink-0">✨</div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${
                m.role === 'user'
                  ? 'bg-rose text-white rounded-tr-sm'
                  : 'bg-white border border-warm-200 text-text-base rounded-tl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="text-2xl mr-2 mt-1">✨</div>
            <div className="bg-white border border-warm-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-warm-300 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-warm-50 border-t border-warm-200 px-4 py-4 max-w-lg mx-auto">
        {done ? (
          <button
            type="button"
            onClick={() => navigate('/generate')}
            className="w-full bg-rose text-white py-4 rounded-2xl text-base font-medium active:scale-95 transition-transform"
          >
            Build my letter box →
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Write your answer..."
              disabled={loading}
              className="flex-1 bg-white border border-warm-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-light disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-rose text-white px-5 rounded-2xl text-sm active:scale-95 transition-transform disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
