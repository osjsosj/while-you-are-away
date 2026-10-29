import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { hydrateFromDB, saveDraft, getDraft } from '../utils/storage'

/**
 * Email-code sign-in, shown when something needs an account (uploading a photo, sharing the box).
 * Keeps the draft on this device: after sign-in the local draft is pushed to the account.
 */
export default function SignInModal({ reason, onDone, onClose }) {
  const [email, setEmail] = useState(() => getDraft().email || '')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.')
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } })
    setBusy(false)
    if (err) return setError(err.status === 429 ? 'Too many codes just now. Wait a minute and try again.' : 'Couldn’t send the code. Try again.')
    setStage('code')
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
    const local = getDraft()
    await hydrateFromDB()
    // keep what was written on this device if the account had nothing newer
    if (!getDraft().phase1 && local.phase1) saveDraft(local)
    else saveDraft({})
    setBusy(false)
    onDone?.()
  }

  const field = {
    flex: '1 1 180px', minWidth: 0, minHeight: 46, padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #9AA4B2', background: '#FFFFFF', fontSize: 16, color: '#1B2536', outline: 'none',
  }
  const btn = {
    minHeight: 46, padding: '10px 18px', borderRadius: 999, border: 'none', background: '#1B2536',
    color: '#FBFCFD', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.6 : 1,
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(5,10,25,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ width: '100%', maxWidth: 440, background: '#F6F3EA', borderRadius: 14, padding: 28, color: '#1B2536', fontFamily: "'Schibsted Grotesk', system-ui, sans-serif", boxShadow: '0 30px 70px -30px rgba(0,0,0,0.6)' }}>
        <h2 id="signin-title" style={{ margin: '0 0 8px', fontFamily: "'Literata', Georgia, serif", fontWeight: 500, fontSize: 24 }}>Sign in to keep your letter box safe</h2>
        <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.6, color: '#3D4859' }}>
          {reason || 'Photos and voice notes are saved to your account, so nothing is lost and you can write from any device.'}
        </p>
        {stage === 'email' ? (
          <>
            <label htmlFor="signin-email" style={{ display: 'block', margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Email</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <input id="signin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} style={field} />
              <button type="button" onClick={send} disabled={busy} style={btn}>{busy ? 'Sending…' : 'Send code'}</button>
            </div>
          </>
        ) : (
          <>
            <label htmlFor="signin-code" style={{ display: 'block', margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>Code sent to {email}</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <input id="signin-code" type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(e) => e.key === 'Enter' && verify()} style={{ ...field, letterSpacing: '0.3em' }} />
              <button type="button" onClick={verify} disabled={busy} style={btn}>{busy ? 'Checking…' : 'Sign in'}</button>
            </div>
            <button type="button" onClick={() => { setStage('email'); setCode(''); setError('') }} style={{ marginTop: 10, minHeight: 40, padding: 0, border: 'none', background: 'none', color: '#3D4859', fontSize: 14, textDecoration: 'underline', cursor: 'pointer' }}>
              Use a different email
            </button>
          </>
        )}
        {error && <p role="alert" style={{ margin: '12px 0 0', fontSize: 14, color: '#B1453A' }}>{error}</p>}
        <button type="button" onClick={onClose} style={{ marginTop: 18, minHeight: 40, padding: 0, border: 'none', background: 'none', color: '#4E596B', fontSize: 14, cursor: 'pointer' }}>
          Not now
        </button>
      </div>
    </div>
  )
}
