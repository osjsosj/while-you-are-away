import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveDraft } from '../utils/storage'

const STEPS = [
  {
    id: 'situation',
    question: "What's the situation?",
    type: 'select',
    options: ['Military', 'Study abroad', 'Long distance', 'Work trip', 'Other'],
  },
  {
    id: 'fromName',
    question: "What's your name?",
    type: 'text',
    placeholder: 'e.g. Jake',
  },
  {
    id: 'toName',
    question: "What's their name?",
    type: 'text',
    placeholder: 'e.g. Emily',
  },
  {
    id: 'startDate',
    question: 'When do you leave?',
    type: 'date',
  },
  {
    id: 'endDate',
    question: 'When do you return?',
    type: 'date',
  },
  {
    id: 'blackout',
    question:
      'Is there a period with no contact at all?\nIf not, just type "none"',
    type: 'text',
    placeholder: 'e.g. Jun 1 – Aug 13 / none',
  },
  {
    id: 'unlockSchedule',
    question: 'How often should letters unlock?',
    type: 'select',
    options: ['Every day', 'Every week', 'Every two weeks', 'Custom dates'],
  },
]

export default function Interview() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [input, setInput] = useState('')
  const [bubbles, setBubbles] = useState([
    { type: 'question', text: STEPS[0].question },
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [bubbles])

  const handleAnswer = (value) => {
    const current = STEPS[step]
    const newAnswers = { ...answers, [current.id]: value }
    setAnswers(newAnswers)

    let inferredCount = null
    if (
      current.id === 'unlockSchedule' &&
      newAnswers.startDate &&
      newAnswers.endDate
    ) {
      const start = new Date(newAnswers.startDate)
      const end = new Date(newAnswers.endDate)
      const days = Math.round((end - start) / (1000 * 60 * 60 * 24))
      if (value === 'Every day') inferredCount = days
      else if (value === 'Every week') inferredCount = Math.round(days / 7)
      else if (value === 'Every two weeks') inferredCount = Math.round(days / 14)
    }

    if (inferredCount !== null) newAnswers.regularCount = inferredCount
    saveDraft({ phase1: newAnswers })

    setBubbles((prev) => [
      ...prev,
      { type: 'answer', text: value },
      ...(inferredCount !== null
        ? [
            {
              type: 'system',
              text: `${inferredCount} letters set automatically based on your dates.`,
            },
          ]
        : []),
    ])
    setInput('')

    if (step + 1 >= STEPS.length) {
      saveDraft({ phase1: newAnswers, phase1Done: true })
      setTimeout(() => navigate('/paywall'), 500)
    } else {
      const nextStep = step + 1
      setTimeout(() => {
        setStep(nextStep)
        setBubbles((prev) => [
          ...prev,
          { type: 'question', text: STEPS[nextStep].question },
        ])
      }, 400)
    }
  }

  const current = STEPS[step]
  const progress = Math.round(((step + 1) / (STEPS.length + 1)) * 50)

  return (
    <div
      className="min-h-screen flex flex-col max-w-lg mx-auto"
      style={{ background: '#FBF4E8' }}
    >
      <div
        className="sticky top-0 z-10 px-5 py-3"
        style={{
          background: 'rgba(251, 244, 232, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E8D5B5',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-display italic text-sm text-text-mid">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-xs text-text-muted font-sans font-light">
            Basic info
          </span>
        </div>
        <div className="h-0.5 rounded-full" style={{ background: '#E8D5B5' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: '#C8706E' }}
          />
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-4 overflow-y-auto pb-44">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 ${b.type === 'answer' ? 'justify-end' : 'justify-start'} animate-bubble-in`}
          >
            {b.type === 'question' && (
              <div
                className="flex-shrink-0 flex items-center justify-center font-display italic text-white"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#C8706E',
                  fontSize: 13,
                  boxShadow: '0 2px 8px rgba(200,112,110,0.3)',
                }}
              >
                W
              </div>
            )}
            {b.type === 'system' && (
              <div
                className="flex-shrink-0 flex items-center justify-center text-warm-300"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#F5E8D0',
                  fontSize: 14,
                }}
              >
                ✦
              </div>
            )}

            <div
              className="max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-sans"
              style={{
                borderRadius:
                  b.type === 'answer' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                ...(b.type === 'answer'
                  ? { background: '#C8706E', color: 'white' }
                  : b.type === 'system'
                    ? {
                        background: '#F5E8D0',
                        color: '#6B5040',
                        border: '1px solid #E8D5B5',
                        fontStyle: 'italic',
                        fontSize: 12,
                      }
                    : {
                        background: '#FFFDF9',
                        color: '#2D1F14',
                        border: '1px solid #E8D5B5',
                      }),
              }}
            >
              {b.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 py-4"
        style={{
          background: 'rgba(251, 244, 232, 0.98)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #E8D5B5',
        }}
      >
        {current.type === 'select' && (
          <div className="flex flex-wrap gap-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                className="font-sans text-sm transition-all active:scale-95"
                style={{
                  background: '#FFFDF9',
                  border: '1px solid #E8D5B5',
                  borderRadius: 20,
                  padding: '8px 18px',
                  color: '#2D1F14',
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {(current.type === 'text' || current.type === 'date') && (
          <div className="flex gap-2 items-center">
            <input
              type={current.type}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && input.trim() && handleAnswer(input.trim())
              }
              placeholder={current.placeholder || 'Type your answer...'}
              autoFocus
              className="flex-1 font-sans text-sm focus:outline-none"
              style={{
                background: '#FFFDF9',
                border: '1px solid #E8D5B5',
                borderRadius: 20,
                padding: '12px 18px',
                color: '#2D1F14',
              }}
            />
            <button
              type="button"
              onClick={() => input.trim() && handleAnswer(input.trim())}
              className="flex items-center justify-center transition-all active:scale-95"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: input.trim() ? '#C8706E' : '#E8D5B5',
                color: 'white',
                fontSize: 18,
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
