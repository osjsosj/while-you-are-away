import { useNavigate } from 'react-router-dom'
import { clearDraft } from '../utils/storage'
import { useState, useEffect, useRef } from 'react'

// ─── SVG assets ───────────────────────────────────────────────

const EnvelopeOpen = () => (
  <svg width="110" height="84" viewBox="0 0 110 84" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="18" width="106" height="64" rx="6" fill="#FFFDF9" stroke="#E8D5B5" strokeWidth="1.5"/>
    <path d="M2 24L55 56L108 24" stroke="#E8D5B5" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 82L44 52" stroke="#E8D5B5" strokeWidth="1" strokeLinecap="round"/>
    <path d="M108 82L66 52" stroke="#E8D5B5" strokeWidth="1" strokeLinecap="round"/>
    {/* open flap */}
    <path d="M2 18L55 2L108 18" fill="#FAF0EF" stroke="#EFC5C4" strokeWidth="1.5" strokeLinejoin="round"/>
    {/* letter peeking out */}
    <rect x="28" y="6" width="54" height="36" rx="3" fill="white" stroke="#E8D5B5" strokeWidth="1"/>
    <line x1="36" y1="18" x2="74" y2="18" stroke="#E8D5B5" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="36" y1="24" x2="74" y2="24" stroke="#E8D5B5" strokeWidth="1" strokeLinecap="round"/>
    <line x1="36" y1="30" x2="60" y2="30" stroke="#E8D5B5" strokeWidth="1" strokeLinecap="round"/>
    {/* stamp */}
    <rect x="66" y="10" width="18" height="14" rx="2" fill="none" stroke="#EFC5C4" strokeWidth="1" strokeDasharray="2 1.5"/>
    <circle cx="75" cy="17" r="4" fill="#EFC5C4" opacity="0.6"/>
    <circle cx="75" cy="17" r="2" fill="#C8706E" opacity="0.5"/>
  </svg>
)

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="2" y="6" width="10" height="7" rx="2" fill="#C8706E" opacity="0.15" stroke="#C8706E" strokeWidth="1.2"/>
    <path d="M4 6V4.5a3 3 0 0 1 6 0V6" stroke="#C8706E" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="7" r="6.25" stroke="#C8706E" strokeWidth="1.5"/>
    <path d="M4.5 7l2 2 3-3" stroke="#C8706E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ─── Data ─────────────────────────────────────────────────────

const SITUATIONS = [
  { emoji: '🪖', label: 'Military deployment' },
  { emoji: '✈️', label: 'Study abroad' },
  { emoji: '💼', label: 'Work travel' },
  { emoji: '🌏', label: 'Long distance' },
]

const TESTIMONIALS = [
  {
    quote: "He cried opening the first one. That alone was worth everything.",
    name: "Sarah M.",
    role: "Army spouse, Fort Bragg",
    initials: "SM",
  },
  {
    quote: "I felt like she was still with me. Every Monday felt like a little gift.",
    name: "Marcus T.",
    role: "USMC, 2nd deployment",
    initials: "MT",
  },
  {
    quote: "I've never seen him get emotional. Week 4 letter broke him open.",
    name: "Jen R.",
    role: "Navy, wife of 6 years",
    initials: "JR",
  },
  {
    quote: "Best $39 I've spent in years. She still talks about it.",
    name: "Priya K.",
    role: "Long distance, NY→London",
    initials: "PK",
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'You talk, AI listens',
    desc: 'Claude asks about your relationship — nicknames, memories, the things only you two know. Nothing generic.',
  },
  {
    step: '02',
    title: 'Letters unlock on schedule',
    desc: 'Week 1, Week 2... Each letter opens exactly when it should. Plus "open when you miss me" moments for the hard days.',
  },
  {
    step: '03',
    title: 'They keep a piece of you',
    desc: 'One file. No app to download, no account to make. It works offline. They can reply, feed the pet, and send it back.',
  },
]

const WHATS_INSIDE = [
  'Scheduled weekly letters that unlock automatically',
  '"Open when..." letters for specific moments',
  'Voice messages & photos in every letter',
  'A growing pet companion they can feed each week',
  'A timeline of your relationship milestones',
  'A reply system to keep the conversation going',
]

// ─── Sub-components ───────────────────────────────────────────

function SocialProof() {
  return (
    <div
      className="flex items-center justify-center gap-3 py-2 px-4 rounded-full mx-auto"
      style={{ background: 'rgba(200,112,110,0.06)', border: '1px solid #EFC5C4', width: 'fit-content' }}
    >
      {/* Avatar stack */}
      <div className="flex -space-x-2">
        {['SM','MT','JR','PK','AL'].map((initials, i) => (
          <div
            key={i}
            className="flex items-center justify-center font-sans font-medium"
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: ['#C8706E','#D4926E','#C87890','#9E6EC8','#6E9EC8'][i],
              color: 'white', fontSize: 8,
              border: '1.5px solid #FBF4E8',
              zIndex: 5 - i,
            }}
          >
            {initials}
          </div>
        ))}
      </div>
      <span className="font-sans text-xs" style={{ color: '#6B5040', fontWeight: 400 }}>
        <strong style={{ fontWeight: 600 }}>400+</strong> letter boxes sent
      </span>
    </div>
  )
}

function TestimonialCard({ t, active }) {
  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(6px)',
        position: active ? 'relative' : 'absolute',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      <p className="font-display italic text-base text-text-mid mb-3 leading-relaxed" style={{ fontSize: 16 }}>
        "{t.quote}"
      </p>
      <div className="flex items-center justify-center gap-2">
        <div
          className="flex items-center justify-center font-sans font-medium text-white"
          style={{ width: 28, height: 28, borderRadius: '50%', background: '#C8706E', fontSize: 9 }}
        >
          {t.initials}
        </div>
        <div className="text-left">
          <p className="font-sans text-xs font-medium" style={{ color: '#2D1F14' }}>{t.name}</p>
          <p className="font-sans" style={{ fontSize: 10, color: '#9B8070', fontWeight: 300 }}>{t.role}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()
  const [activeSituation, setActiveSituation] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [letterVisible, setLetterVisible] = useState(false)
  const letterRef = useRef(null)

  useEffect(() => {
    // Rotate situations
    const s = setInterval(() => setActiveSituation(p => (p + 1) % SITUATIONS.length), 2200)
    // Rotate testimonials
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4500)
    return () => { clearInterval(s); clearInterval(t) }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setLetterVisible(true) },
      { threshold: 0.3 }
    )
    if (letterRef.current) observer.observe(letterRef.current)
    return () => observer.disconnect()
  }, [])

  const handleStart = () => { clearDraft(); navigate('/interview') }

  return (
    <div className="min-h-screen" style={{ background: '#FBF4E8' }}>

      {/* ── Topbar ── */}
      <div className="flex justify-between items-center px-5 pt-5 pb-1">
        <span className="font-display italic text-sm" style={{ color: '#6B5040' }}>While You're Away</span>
        <span
          className="font-sans text-xs px-3 py-1 rounded-full"
          style={{ background: 'rgba(200,112,110,0.08)', color: '#C8706E', border: '1px solid #EFC5C4', fontWeight: 500 }}
        >
          $39 one-time
        </span>
      </div>

      {/* ── Hero ── */}
      <div className="px-5 pt-6 pb-4 text-center">

        {/* Situation switcher */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 font-sans text-xs"
          style={{ background: 'rgba(200,112,110,0.06)', border: '1px solid #EFC5C4', color: '#6B5040' }}
        >
          <span style={{ fontSize: 14, transition: 'all 0.3s' }}>{SITUATIONS[activeSituation].emoji}</span>
          <span style={{ fontWeight: 300 }}>For {SITUATIONS[activeSituation].label.toLowerCase()} couples</span>
        </div>

        {/* Envelope */}
        <div className="flex justify-center mb-6 animate-fade-up animate-float">
          <EnvelopeOpen />
        </div>

        {/* Headline */}
        <h1
          className="font-display animate-fade-up delay-100"
          style={{
            fontSize: 34, fontStyle: 'italic', letterSpacing: '-0.025em',
            lineHeight: 1.15, color: '#1A1008', marginBottom: 12,
          }}
        >
          Be there for every<br />
          hard day<span style={{ color: '#C8706E' }}>.</span> Every<br />
          lonely night<span style={{ color: '#C8706E' }}>.</span>
        </h1>

        <p
          className="font-sans animate-fade-up delay-200 mx-auto"
          style={{ fontSize: 13, color: '#9B8070', lineHeight: 1.75, fontWeight: 300, maxWidth: 280, marginBottom: 20 }}
        >
          Build a letter box before you leave — letters, photos,
          and voice messages that open exactly when they need them.
        </p>

        {/* Social proof */}
        <div className="animate-fade-up delay-300 mb-6">
          <SocialProof />
        </div>

        {/* Primary CTA */}
        <div className="animate-fade-up delay-400">
          <button
            onClick={handleStart}
            className="btn-primary w-full py-4 rounded-2xl font-sans mb-2"
            style={{ fontSize: 14, maxWidth: 320, display: 'block', margin: '0 auto 10px' }}
          >
            Build their letter box — $39 →
          </button>
          <p className="font-sans" style={{ fontSize: 11, color: '#9B8070', fontWeight: 300 }}>
            Takes 5 minutes · One-time · No subscription
          </p>
        </div>
      </div>

      {/* ── Letter preview mockup ── */}
      <div
        ref={letterRef}
        className="mx-5 mb-5"
        style={{
          background: '#FFFDF9',
          border: '1px solid #E8D5B5',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(45,31,20,0.08)',
          opacity: letterVisible ? 1 : 0,
          transform: letterVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease',
        }}
      >
        {/* mock header */}
        <div style={{ background: '#C8706E', padding: '14px 18px' }}>
          <p className="font-sans" style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
            From Jake · To Emily
          </p>
          <p className="font-display italic" style={{ fontSize: 18, color: 'white', letterSpacing: '-0.01em' }}>
            Always With You
          </p>
        </div>
        {/* mock letter cards */}
        <div style={{ padding: '14px 14px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Week 1', icon: '💌', status: 'Open me!', open: true },
            { label: 'Week 2', icon: '🔒', status: 'Jun 15', open: false },
            { label: 'Week 3', icon: '🔒', status: 'Jun 22', open: false },
          ].map((card) => (
            <div
              key={card.label}
              style={{
                background: card.open ? 'rgba(200,112,110,0.05)' : '#F5E8D0',
                border: `1px solid ${card.open ? '#EFC5C4' : '#E8D5B5'}`,
                borderRadius: 12, padding: '10px 6px', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{card.icon}</div>
              <div className="font-display italic" style={{ fontSize: 11, color: '#1A1008' }}>{card.label}</div>
              <div className="font-sans" style={{ fontSize: 9, color: card.open ? '#C8706E' : '#9B8070', fontWeight: card.open ? 500 : 300, marginTop: 2 }}>
                {card.status}
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 14px 14px', display: 'flex', gap: 6 }}>
          {[
            { label: 'When you miss me', emoji: '💛' },
            { label: 'Our anniversary', emoji: '🤍' },
          ].map((m) => (
            <div
              key={m.label}
              className="font-sans"
              style={{
                flex: 1, background: '#FFFDF9', border: '1px solid #E8D5B5',
                borderRadius: 10, padding: '8px 6px', textAlign: 'center',
                fontSize: 10, color: '#6B5040',
              }}
            >
              <span style={{ fontSize: 16, display: 'block', marginBottom: 3 }}>{m.emoji}</span>
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="px-5 mb-6">
        <div className="ornament-divider mb-5">
          <span className="font-display italic" style={{ fontSize: 11, color: '#D4BC95' }}>how it works</span>
        </div>
        <div className="space-y-3">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div
              key={step}
              className="envelope-card rounded-2xl p-5 flex gap-4 items-start"
            >
              <div
                className="flex-shrink-0 font-display italic"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: '#FAF0EF', border: '1px solid #EFC5C4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, color: '#C8706E', fontWeight: 700,
                }}
              >
                {step}
              </div>
              <div>
                <p className="font-sans font-medium text-sm mb-1" style={{ color: '#1A1008' }}>{title}</p>
                <p className="font-sans text-xs leading-relaxed" style={{ color: '#9B8070', fontWeight: 300 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── What's inside ── */}
      <div className="px-5 mb-6">
        <div className="ornament-divider mb-5">
          <span className="font-display italic" style={{ fontSize: 11, color: '#D4BC95' }}>what's inside</span>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5B5' }}
        >
          <div className="space-y-3">
            {WHATS_INSIDE.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5"><CheckIcon /></div>
                <p className="font-sans text-xs leading-relaxed" style={{ color: '#2D1F14', fontWeight: 300 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="px-5 mb-6">
        <div className="ornament-divider mb-5">
          <span className="font-display italic" style={{ fontSize: 11, color: '#D4BC95' }}>real stories</span>
        </div>
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5B5', position: 'relative', minHeight: 140 }}
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} t={t} active={i === activeTestimonial} />
          ))}
          <div className="flex justify-center gap-2 mt-4" style={{ position: 'relative', zIndex: 1 }}>
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === activeTestimonial ? 18 : 6,
                  height: 6,
                  background: i === activeTestimonial ? '#C8706E' : '#E8D5B5',
                  border: 'none', cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Objection handling ── */}
      <div className="px-5 mb-6">
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(200,112,110,0.04)', border: '1px solid #EFC5C4' }}
        >
          <p className="font-display italic text-base text-center mb-4" style={{ color: '#1A1008' }}>
            Common questions
          </p>
          <div className="space-y-4">
            {[
              {
                q: 'Do they need to install anything?',
                a: 'No. It\'s a single HTML file — opens in any browser, works offline. Just send it over iMessage or WhatsApp.',
              },
              {
                q: 'What if my schedule changes?',
                a: 'You can re-download and update letters anytime before they open. Just send the new file.',
              },
              {
                q: 'Can they reply to my letters?',
                a: 'Yes — they write replies inside the app, then export the file back to you. No accounts, no servers.',
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-sans text-xs font-medium mb-1" style={{ color: '#1A1008' }}>{q}</p>
                <p className="font-sans text-xs leading-relaxed" style={{ color: '#9B8070', fontWeight: 300 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="px-5 pb-14">
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5B5', boxShadow: '0 4px 24px rgba(45,31,20,0.07)' }}
        >
          <div
            className="mx-auto mb-4 flex items-center justify-center font-display italic text-white"
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#C8706E', fontSize: 18, boxShadow: '0 2px 8px rgba(200,112,110,0.35)' }}
          >
            W
          </div>
          <p className="font-display italic mb-1" style={{ fontSize: 18, color: '#1A1008', letterSpacing: '-0.01em' }}>
            Don't leave empty-handed.
          </p>
          <p className="font-sans mb-5" style={{ fontSize: 12, color: '#9B8070', fontWeight: 300, lineHeight: 1.7 }}>
            Give them something to hold onto.<br />
            A letter box that grows with them while you're gone.
          </p>
          <button
            onClick={handleStart}
            className="btn-primary w-full py-4 rounded-2xl font-sans mb-3"
            style={{ fontSize: 14 }}
          >
            Build their letter box — $39 →
          </button>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {['One-time · no subscription', 'Download & share instantly', 'Private by design'].map((g) => (
              <div key={g} className="flex items-center gap-1.5">
                <CheckIcon />
                <span className="font-sans" style={{ fontSize: 10, color: '#9B8070', fontWeight: 300 }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
