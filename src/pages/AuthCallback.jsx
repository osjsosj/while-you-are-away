import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { hydrateFromDB } from '../utils/storage'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isPaymentSuccess = searchParams.get('payment') === 'success'

  const [phase, setPhase] = useState('checking') // checking | needEmail | sending | success | error
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      navigate(isPaymentSuccess ? '/ai-interview' : '/')
      return
    }

    let done = false

    const onSession = async (session) => {
      if (done) return
      if (session) {
        done = true
        await hydrateFromDB()
        setPhase('success')
        setTimeout(() => {
          if (isPaymentSuccess) navigate('/ai-interview')
          else {
            const draft = JSON.parse(localStorage.getItem('lbs_draft') || '{}')
            if (draft.phase2Done) navigate('/generate')
            else if (draft.phase1Done) navigate('/ai-interview')
            else navigate('/')
          }
        }, 800)
      } else if (!done) {
        done = true
        if (isPaymentSuccess) setPhase('needEmail')
        else setPhase('error')
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) onSession(session)
      },
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onSession(session)
      else if (!done) {
        // 해시 처리 대기 — onAuthStateChange가 세션을 넘겨줄 수 있음
        setTimeout(() => {
          if (!done) {
            supabase.auth.getSession().then(({ data: { session: s2 } }) => {
              if (!s2 && !done) onSession(null)
            })
          }
        }, 500)
      }
    })

    return () => subscription.unsubscribe()
  }, [isPaymentSuccess, navigate])

  const sendMagicLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }
    setSending(true)
    setError(null)

    const redirectTo = `${window.location.origin}/auth/callback${isPaymentSuccess ? '?payment=success' : ''}`

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    })

    if (err) {
      setError('Something went wrong. Please try again.')
      setSending(false)
    } else {
      setPhase('sending')
    }
  }

  if (phase === 'checking') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FBF4E8' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#C8706E', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 22, color: 'white',
          animation: 'pulse 1.5s ease-in-out infinite',
          boxShadow: '0 4px 16px rgba(200,112,110,0.3)',
        }}>W</div>
        <p className="font-display italic text-xl text-ink">Signing you in...</p>
        <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>Just a moment</p>
      </div>
    )
  }

  if (phase === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FBF4E8' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#7B9E5A', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, color: 'white',
          boxShadow: '0 4px 16px rgba(123,158,90,0.3)',
        }}>✓</div>
        <p className="font-display italic text-xl text-ink">Signed in!</p>
        <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>Taking you there...</p>
      </div>
    )
  }

  if (phase === 'needEmail') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-sm mx-auto" style={{ background: '#FBF4E8' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#C8706E', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 22, color: 'white',
          marginBottom: 20, boxShadow: '0 4px 16px rgba(200,112,110,0.3)',
        }}>W</div>

        <h1 className="font-display italic text-2xl text-ink text-center mb-2" style={{ letterSpacing: '-0.02em' }}>
          Payment confirmed!
        </h1>
        <p className="font-sans text-sm text-text-muted text-center mb-8" style={{ fontWeight: 300, lineHeight: 1.7 }}>
          Enter your email to get a sign-in link —<br />
          this saves your progress across devices.
        </p>

        <div className="w-full mb-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMagicLink()}
            placeholder="your@email.com"
            autoFocus
            className="w-full font-sans text-sm focus:outline-none"
            style={{
              background: '#FFFDF9',
              border: `1px solid ${error ? '#C8706E' : '#E8D5B5'}`,
              borderRadius: 16, padding: '13px 16px', color: '#1A1008',
            }}
          />
          {error && (
            <p className="font-sans mt-1.5" style={{ fontSize: 11, color: '#C8706E' }}>{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={sendMagicLink}
          disabled={sending}
          className="btn-primary w-full py-4 rounded-2xl font-sans text-sm mb-4"
          style={{ opacity: sending ? 0.7 : 1 }}
        >
          {sending ? 'Sending...' : 'Send my sign-in link →'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/ai-interview')}
          className="font-sans text-sm text-text-muted"
          style={{ fontWeight: 300 }}
        >
          Skip for now — continue without saving
        </button>
      </div>
    )
  }

  if (phase === 'sending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#FBF4E8' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
        <h2 className="font-display italic text-2xl text-ink mb-3" style={{ letterSpacing: '-0.02em' }}>
          Check your email
        </h2>
        <p className="font-sans text-sm text-text-muted mb-6" style={{ fontWeight: 300, lineHeight: 1.7 }}>
          We sent a sign-in link to<br />
          <strong style={{ color: '#2D1F14', fontWeight: 500 }}>{email}</strong>
        </p>
        <div
          className="rounded-2xl p-5 w-full max-w-xs text-left"
          style={{ background: '#FFFDF9', border: '1px solid #E8D5B5' }}
        >
          <p className="font-sans text-xs mb-3" style={{ color: '#9B8070', fontWeight: 300 }}>
            Can&apos;t find it? Check your spam folder, or:
          </p>
          <button
            type="button"
            onClick={() => setPhase('needEmail')}
            className="font-sans text-xs font-medium"
            style={{ color: '#C8706E' }}
          >
            Try a different email →
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigate('/ai-interview')}
          className="font-sans text-sm text-text-muted mt-6"
          style={{ fontWeight: 300 }}
        >
          Continue without signing in
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: '#FBF4E8' }}>
      <div className="wax-seal" style={{ width: 48, height: 48, fontSize: 20 }}>!</div>
      <p className="font-display italic text-xl text-ink">Something went wrong</p>
      <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>
        This link may have expired.
      </p>
      <button type="button" onClick={() => navigate('/')} className="btn-primary px-8 py-3 rounded-2xl text-sm font-sans">
        Back to home
      </button>
    </div>
  )
}
