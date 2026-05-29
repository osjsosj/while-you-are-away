import { useState } from 'react'
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

    if (inferredCount !== null) {
      newAnswers.regularCount = inferredCount
    }

    saveDraft({ phase1: newAnswers })

    setBubbles((prev) => [
      ...prev,
      { type: 'answer', text: value },
      ...(inferredCount !== null
        ? [
            {
              type: 'system',
              text: `📌 Based on your dates, we've set ${inferredCount} letters automatically!`,
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
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <div className="sticky top-0 bg-warm-50 px-4 py-3 border-b border-warm-200 z-10">
        <div className="flex items-center justify-between text-xs text-text-muted mb-2">
          <span>Basic info</span>
          <span>
            {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="h-1 bg-warm-200 rounded-full">
          <div
            className="h-full bg-rose rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-4 overflow-y-auto pb-40">
        {bubbles.map((b, i) => (
          <div
            key={i}
            className={`flex ${b.type === 'answer' ? 'justify-end' : 'justify-start'}`}
          >
            {b.type === 'question' && (
              <div className="text-2xl mr-2 mt-1 flex-shrink-0">📮</div>
            )}
            {b.type === 'system' && (
              <div className="text-2xl mr-2 mt-1 flex-shrink-0">✨</div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${
                b.type === 'answer'
                  ? 'bg-rose text-white rounded-tr-sm'
                  : b.type === 'system'
                    ? 'bg-warm-100 text-text-mid border border-warm-200 rounded-tl-sm'
                    : 'bg-white border border-warm-200 text-text-base rounded-tl-sm'
              }`}
            >
              {b.text}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-warm-50 border-t border-warm-200 px-4 py-4 max-w-lg mx-auto">
        {current.type === 'select' && (
          <div className="flex flex-wrap gap-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                className="bg-white border border-warm-200 rounded-2xl px-4 py-2 text-sm active:scale-95 transition-transform"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
        {(current.type === 'text' || current.type === 'date') && (
          <div className="flex gap-2">
            <input
              type={current.type}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && input.trim() && handleAnswer(input.trim())
              }
              placeholder={current.placeholder || 'Type your answer...'}
              className="flex-1 bg-white border border-warm-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-rose-light"
            />
            <button
              type="button"
              onClick={() => input.trim() && handleAnswer(input.trim())}
              className="bg-rose text-white px-5 rounded-2xl text-sm active:scale-95 transition-transform"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
