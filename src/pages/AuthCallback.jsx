import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { hydrateFromDB, saveDraft, getDraft } from '../utils/storage'
import { CenterPage, Mark } from '../components/FlowFrame'

/* After checkout (or a sign-in link): remember the payment, sign in with an emailed code, continue. */

function nextPath(isPayment) {
  if (isPayment) return '/ai-interview'
  const d = getDraft()
  if (d.generatedConfig?.chosenName) return '/editor'
  if (d.phase2Done) return '/generate'
  if (d.phase1Done) return '/ai-interview'
  return '/'
}

function friendlyAuthError(err) {
  const msg = (err?.message || '').toLowerCase()
  if (err?.status === 429 || msg.includes('rate limit') || msg.includes('security purposes')) return 'Too many codes just now. Wait a minute and try again, or continue without saving.'
  if (msg.includes('invalid') && msg.includes('email')) return 'That email address looks invalid.'
  return 'We couldn’t send the code. You can continue without saving and sign in later.'
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const isPayment = params.get('payment') === 'success'
  const stripeSessionId = params.get('session_id')

  const [phase, setPhase] = useState('checking') // checking | needEmail | sending | success | error
  const [email, setEmail] = useState(() => getDraft().email || '')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (stripeSessionId && getDraft().paymentSessionId !== stripeSessionId) saveDraft({ paymentSessionId: stripeSessionId })
  }, [stripeSessionId])

  useEffect(() => {
    if (!supabase) {
      navigate(nextPath(isPayment))
      return undefined
    }
    let done = false

    const finish = async () => {
      if (done) return
      done = true
      await hydrateFromDB()
      saveDraft({})
      setPhase('success')
      setTimeout(() => navigate(nextPath(isPayment)), 900)
    }

    const sendCode = async (addr) => {
      setPhase('sending')
      const { error: err } = await supabase.auth.signInWithOtp({ email: addr, options: { shouldCreateUser: true } })
      if (err) {
        setError(friendlyAuthError(err))
        setPhase('needEmail')
      }
    }

    const noSession = () => {
      if (done) return
      done = true
      if (!isPayment) return setPhase('error')
      const saved = getDraft().email
      if (saved) sendCode(saved)
      else setPhase('needEmail')
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => { if (session) finish() })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) finish()
      else setTimeout(() => supabase.auth.getSession().then(({ data: { session: s } }) => (s ? finish() : noSession())), 500)
    })
    return () => subscription.unsubscribe()
  }, [isPayment, navigate])

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    setBusy(false)
    if (err) return setError(friendlyAuthError(err))
    saveDraft({ email: email.trim() })
    setCode('')
    setPhase('sending')
  }

  const verify = async () => {
    const token = code.replace(/\D/g, '')
    if (token.length < 6) return setError('Enter the code from your email.')
    setBusy(true)
    setError('')
    const { data, error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'email' })
    if (err || !data?.session) {
      setBusy(false)
      return setError('That code didn’t work. Check the newest email, or send a new code.')
    }
    await hydrateFromDB()
    saveDraft({})
    setPhase('success')
    setTimeout(() => navigate(nextPath(isPayment)), 900)
  }

  const skip = (
    <button type="button" className="wf-link" onClick={() => navigate(nextPath(isPayment))}>
      Continue without signing in
    </button>
  )

  if (phase === 'checking') {
    return (
      <CenterPage>
        <div className="wf-spinner" role="status" aria-label="Checking" />
        <p className="wf-lede">{isPayment ? 'Confirming your payment…' : 'Signing you in…'}</p>
      </CenterPage>
    )
  }

  if (phase === 'success') {
    return (
      <CenterPage>
        <Mark size={48} />
        <h1 className="wf-h1">{isPayment ? 'You’re all set.' : 'Signed in.'}</h1>
        <p className="wf-lede">{isPayment ? 'Let’s plan the letter box together.' : 'Taking you back to your letter box.'}</p>
      </CenterPage>
    )
  }

  if (phase === 'error') {
    return (
      <CenterPage>
        <h1 className="wf-h1">That link has expired.</h1>
        <p className="wf-lede">Sign in again with your email and we’ll send a fresh code.</p>
        <button type="button" className="wf-btn" onClick={() => setPhase('needEmail')}>Send me a code</button>
        <button type="button" className="wf-link" onClick={() => navigate('/')}>Back to the start</button>
      </CenterPage>
    )
  }

  if (phase === 'sending') {
    return (
      <CenterPage>
        <Mark size={48} />
        <h1 className="wf-h1">{isPayment ? 'Payment confirmed.' : 'Check your email.'}</h1>
        <p className="wf-lede">
          We sent a sign-in code to <strong style={{ color: 'var(--mist)', fontWeight: 600 }}>{email}</strong>. Signing in keeps your letters safe and lets you write from any device.
        </p>
        <div style={{ width: '100%', textAlign: 'left' }}>
          <label className="wf-label" htmlFor="ac-code">Code</label>
          <input
            id="ac-code"
            className="wf-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={(e) => e.key === 'Enter' && verify()}
            style={{ fontSize: 22, letterSpacing: '0.3em', textAlign: 'center' }}
            autoFocus
          />
          {error && <p className="wf-error" role="alert">{error}</p>}
        </div>
        <button type="button" className="wf-btn wf-btn--block" onClick={verify} disabled={busy}>{busy ? 'Checking…' : 'Sign in'}</button>
        <p className="wf-note">Can’t find it? Check spam, or <button type="button" className="wf-link" style={{ minHeight: 0, padding: 0 }} onClick={() => { setError(''); setPhase('needEmail') }}>use a different email</button>.</p>
        {skip}
      </CenterPage>
    )
  }

  return (
    <CenterPage>
      <Mark size={48} />
      <h1 className="wf-h1">{isPayment ? 'Payment confirmed.' : 'Sign in'}</h1>
      <p className="wf-lede">Enter your email for a sign-in code. It keeps your letters safe and lets you write from any device.</p>
      <div style={{ width: '100%', textAlign: 'left' }}>
        <label className="wf-label" htmlFor="ac-email">Email</label>
        <input id="ac-email" type="email" className="wf-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} autoFocus />
        {error && <p className="wf-error" role="alert">{error}</p>}
      </div>
      <button type="button" className="wf-btn wf-btn--block" onClick={send} disabled={busy}>{busy ? 'Sending…' : 'Send my code'}</button>
      {isPayment && skip}
    </CenterPage>
  )
}
