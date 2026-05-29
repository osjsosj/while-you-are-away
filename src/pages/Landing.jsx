import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearDraft } from '../utils/storage'

const EnvelopeSVG = () => (
  <svg
    width="120"
    height="88"
    viewBox="0 0 120 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-float"
  >
    <rect
      x="2"
      y="2"
      width="116"
      height="84"
      rx="6"
      fill="#FFFDF9"
      stroke="#E8D5B5"
      strokeWidth="1.5"
    />
    <path
      d="M2 8L60 52L118 8"
      stroke="#E8D5B5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M2 86L42 50" stroke="#E8D5B5" strokeWidth="1" strokeLinecap="round" />
    <path d="M118 86L78 50" stroke="#E8D5B5" strokeWidth="1" strokeLinecap="round" />
    <rect
      x="82"
      y="10"
      width="24"
      height="18"
      rx="2"
      fill="none"
      stroke="#E8D5B5"
      strokeWidth="1"
      strokeDasharray="2 2"
    />
    <rect x="84" y="12" width="20" height="14" rx="1" fill="#EFC5C4" opacity="0.5" />
    <circle cx="94" cy="19" r="3" fill="#C8706E" opacity="0.7" />
  </svg>
)

const features = [
  {
    icon: '✦',
    title: 'AI-crafted together',
    desc: 'A warm conversation builds your letter box — nothing generic, everything personal.',
  },
  {
    icon: '◈',
    title: 'Opens week by week',
    desc: 'Each letter unlocks exactly when they need it most, like clockwork.',
  },
  {
    icon: '❋',
    title: 'A little companion',
    desc: "A pet to care for while you're apart. Grows with every visit.",
  },
]

const testimonials = [
  { text: 'He cried opening the first letter.', from: 'Sarah, army spouse' },
  { text: 'I felt her with me the whole deployment.', from: 'Marcus, USMC' },
  { text: "Best $39 I've ever spent.", from: 'Priya, long distance' },
]

export default function Landing() {
  const navigate = useNavigate()
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const handleStart = () => {
    clearDraft()
    navigate('/interview')
  }

  return (
    <div className="min-h-screen" style={{ background: '#FBF4E8' }}>
      <div className="flex justify-between items-center px-6 pt-6 pb-2">
        <span className="font-display text-sm text-text-mid italic">
          While You're Away
        </span>
        <span className="text-xs text-text-muted font-sans">$39 one-time</span>
      </div>

      <div className="px-6 pt-8 pb-6 text-center">
        <div className="flex justify-center mb-8 animate-fade-up">
          <EnvelopeSVG />
        </div>

        <h1
          className="font-display text-4xl leading-tight tracking-tight text-ink mb-4 animate-fade-up delay-100"
          style={{ fontStyle: 'italic', letterSpacing: '-0.02em' }}
        >
          Letters for the one
          <br />
          <span style={{ color: '#C8706E' }}>who waits.</span>
        </h1>

        <p
          className="text-text-mid text-sm leading-relaxed mb-8 max-w-xs mx-auto animate-fade-up delay-200 font-light"
        >
          Even far away, you can still be there.
          <br />
          Build a personalized letter box — just for them.
        </p>

        <div className="flex gap-2 justify-center flex-wrap mb-10 animate-fade-up delay-300">
          {[
            { label: 'Week 1 letter', emoji: '✉️' },
            { label: 'When you miss me', emoji: '💛' },
            { label: 'Our anniversary', emoji: '🤍' },
            { label: 'Celebrate!', emoji: '🎉' },
          ].map(({ label, emoji }) => (
            <div
              key={label}
              className="feature-pill rounded-full px-4 py-2 text-xs text-text-mid font-sans flex items-center gap-1.5"
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="animate-fade-up delay-400">
          <button
            type="button"
            onClick={handleStart}
            className="btn-primary w-full max-w-xs mx-auto py-4 rounded-2xl text-sm block mb-3"
          >
            Create your letter box →
          </button>
          <p className="text-text-muted text-xs font-sans">
            Takes about 5 minutes · Progress saved automatically
          </p>
        </div>
      </div>

      <div className="px-6 my-2 animate-fade-up delay-500">
        <div className="ornament-divider">
          <span className="text-xs font-display italic text-warm-300">
            how it works
          </span>
        </div>
      </div>

      <div className="px-6 py-4 space-y-3 animate-fade-up delay-500">
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="envelope-card rounded-2xl p-5 flex gap-4 items-start"
          >
            <div
              className="wax-seal flex-shrink-0 text-base"
              style={{ width: 36, height: 36, fontSize: 14 }}
            >
              {icon}
            </div>
            <div>
              <p className="font-sans font-medium text-sm text-ink mb-1">
                {title}
              </p>
              <p className="font-sans text-xs text-text-muted leading-relaxed font-light">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-6 animate-fade-up delay-600">
        <div className="text-center" style={{ minHeight: 72 }}>
          <p
            className="font-display italic text-lg text-text-mid mb-2 transition-all duration-500"
            style={{ lineHeight: 1.5 }}
          >
            &ldquo;{testimonials[activeTestimonial].text}&rdquo;
          </p>
          <p className="text-xs text-text-muted font-sans">
            — {testimonials[activeTestimonial].from}
          </p>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show testimonial ${i + 1}`}
              onClick={() => setActiveTestimonial(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeTestimonial ? 20 : 6,
                height: 6,
                background: i === activeTestimonial ? '#C8706E' : '#E8D5B5',
              }}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pb-12 text-center">
        <div className="envelope-card rounded-2xl p-6">
          <div className="wax-seal mx-auto mb-4" style={{ fontSize: 20 }}>
            W
          </div>
          <p className="font-display italic text-base text-ink mb-1">
            One letter box.
          </p>
          <p className="font-sans text-xs text-text-muted mb-5 font-light">
            One-time $39 · Download & share · No subscriptions.
          </p>
          <button
            type="button"
            onClick={handleStart}
            className="btn-primary w-full py-4 rounded-2xl text-sm"
          >
            Start building →
          </button>
        </div>
      </div>
    </div>
  )
}
