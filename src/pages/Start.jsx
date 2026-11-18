import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FlowFrame from '../components/FlowFrame'
import Mascot from '../components/Mascot'
import { supabase, getUser } from '../utils/supabase'
import { hydrateFromDB, saveDraft, getDraft } from '../utils/storage'
import { track } from '../utils/track'
import '../styles/start.css'

/*
 * Sign in before planning. It keeps the letters safe on any device, and it is what lets the AI guide
 * be free until handover: every AI call is counted per account (api/_lib/access.js).
 * Google and Kakao first; an emailed code for anyone without either.
 */

const PROVIDERS = [
  { id: 'kakao', label: 'Continue with Kakao' },
  { id: 'google', label: 'Continue with Google' },
]

function ProviderMark({ id }) {
  if (id === 'kakao') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.48 3 2 6.48 2 10.78c0 2.76 1.84 5.18 4.62 6.56l-.94 3.44c-.08.3.26.54.52.37l4.1-2.72c.55.07 1.12.11 1.7.11 5.52 0 10-3.48 10-7.76S17.52 3 12 3z" /></svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.82-.07-1.6-.2-2.36H12v4.46h6.45a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.57-5.18 3.57-8.72z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.1-6.71-4.94H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.31a7.2 7.2 0 0 1 0-4.62v-3.1H1.28a12 12 0 0 0 0 10.82l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.28 6.59l4.01 3.1C6.23 6.85 8.88 4.75 12 4.75z" />
    </svg>
  )
}

export default function Start() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = /^\/[a-z-]*$/.test(params.get('next') || '') ? params.get('next') : '/ai-interview'
  const p1 = getDraft().phase1 || {}
  const [mode, setMode] = useState('choose') // choose | email | code
  const [email, setEmail] = useState(() => getDraft().email || '')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  // already signed in: straight on
  useEffect(() => {
    let live = true
    getUser().then((u) => { if (live && u) navigate(next, { replace: true }) })
    return () => { live = false }
  }, [navigate, next])

  const social = async (provider) => {
    if (!supabase) return navigate(next)
    setBusy(provider)
    setError('')
    track('sign_in_start', { method: provider })
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (err) {
      setBusy('')
      setError(`${provider === 'kakao' ? 'Kakao' : 'Google'} sign-in isn’t available right now. Try another way below.`)
    }
  }

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    setBusy('email')
    setError('')
    track('sign_in_start', { method: 'email' })
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    setBusy('')
    if (err) return setError(err.status === 429 ? 'Too many codes just now. Wait a minute and try again.' : 'We couldn’t send the code. Check the address and try again.')
    saveDraft({ email: email.trim() })
    setMode('code')
  }

  const verify = async () => {
    const token = code.replace(/\D/g, '')
    if (token.length < 6) return setError('Enter the code from your email.')
    setBusy('code')
    setError('')
    const { data, error: err } = await supabase.auth.verifyOtp({ email: email.trim(), token, type: 'email' })
    if (err || !data?.session) {
      setBusy('')
      return setError('That code didn’t work. Check the newest email, or send a new code.')
    }
    await hydrateFromDB()
    saveDraft({})
    track('sign_in_done', { method: 'email' })
    navigate(next, { replace: true })
  }

  return (
    <FlowFrame step={1} narrow>
      <div className="st">
        <div className="st-perigan">
          <Mascot move="talk" size={72} />
          <p className="st-bubble">I’ll keep everything you write safe, on any phone. Planning and writing are free; you pay only when you hand the box over.</p>
        </div>
        <h1 className="wf-h1">Save your letter box</h1>
        <p className="wf-lede">Sign in so {p1.toName ? `${p1.toName}’s` : 'their'} letters stay yours, and you can keep writing from any device.</p>

        {mode === 'choose' && (
          <div className="st-buttons">
            {PROVIDERS.map((pv) => (
              <button key={pv.id} type="button" className={`st-btn st-btn--${pv.id}`} onClick={() => social(pv.id)} disabled={!!busy}>
                <ProviderMark id={pv.id} />
                <span>{busy === pv.id ? 'Opening…' : pv.label}</span>
              </button>
            ))}
            <button type="button" className="st-btn st-btn--email" onClick={() => { setError(''); setMode('email') }} disabled={!!busy}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              <span>Use my email</span>
            </button>
          </div>
        )}

        {mode === 'email' && (
          <div className="st-form">
            <label className="wf-label" htmlFor="st-email">Email</label>
            <input id="st-email" type="email" className="wf-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} autoFocus />
            <button type="button" className="wf-btn wf-btn--block" onClick={send} disabled={!!busy}>{busy ? 'Sending…' : 'Send me a code'}</button>
            <button type="button" className="wf-link st-back" onClick={() => { setError(''); setMode('choose') }}>Other ways to sign in</button>
          </div>
        )}

        {mode === 'code' && (
          <div className="st-form">
            <p className="wf-note">We sent a code to <strong style={{ color: 'var(--mist)' }}>{email}</strong>.</p>
            <label className="wf-label" htmlFor="st-code">Code</label>
            <input id="st-code" className="wf-input st-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(e) => e.key === 'Enter' && verify()} autoFocus />
            <button type="button" className="wf-btn wf-btn--block" onClick={verify} disabled={!!busy}>{busy ? 'Checking…' : 'Sign in'}</button>
            <button type="button" className="wf-link st-back" onClick={() => { setError(''); setMode('email') }}>Use a different email</button>
          </div>
        )}

        {error && <p className="wf-error" role="alert">{error}</p>}
        <p className="st-fine">We only use your account to save your letter box. By continuing you agree to our <a href="/terms" target="_blank" rel="noopener">Terms</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a>.</p>
      </div>
    </FlowFrame>
  )
}
