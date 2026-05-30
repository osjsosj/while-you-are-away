import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { hydrateFromDB } from '../utils/storage'

/**
 * 매직링크 클릭 후 리다이렉트되는 페이지
 * URL 해시에서 세션을 추출하고 DB draft를 가져온 뒤 적절한 페이지로 이동
 */
export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')

  const isPaymentSuccess = searchParams.get('payment') === 'success'

  useEffect(() => {
    if (!supabase) {
      navigate(isPaymentSuccess ? '/ai-interview' : '/')
      return
    }

    const finish = async (session) => {
      if (!session) {
        setStatus(isPaymentSuccess ? 'check-email' : 'error')
        return
      }
      await hydrateFromDB()
      setStatus('success')
      if (isPaymentSuccess) {
        navigate('/ai-interview')
      } else {
        const draft = JSON.parse(localStorage.getItem('lbs_draft') || '{}')
        if (draft.phase2Done) navigate('/generate')
        else if (draft.phase1Done) navigate('/ai-interview')
        else navigate('/')
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          subscription.unsubscribe()
          await finish(session)
        }
      },
    )

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        subscription.unsubscribe()
        setStatus('error')
        return
      }
      if (session) {
        subscription.unsubscribe()
        finish(session)
      }
    })

    return () => subscription.unsubscribe()
  }, [isPaymentSuccess, navigate])

  if (status === 'check-email') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5" style={{ background: '#FBF4E8' }}>
        <div className="wax-seal" style={{ width: 48, height: 48, fontSize: 20 }}>✓</div>
        <p className="font-display italic text-xl text-ink text-center">Payment received</p>
        <p className="font-sans text-sm text-text-muted text-center" style={{ fontWeight: 300 }}>
          Check your inbox for a sign-in link.<br />
          Click it to continue building your letter box.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary px-8 py-3 rounded-2xl text-sm font-sans"
        >
          Back to home
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5" style={{ background: '#FBF4E8' }}>
        <div className="wax-seal" style={{ width: 48, height: 48, fontSize: 20 }}>!</div>
        <p className="font-display italic text-xl text-ink text-center">Link expired</p>
        <p className="font-sans text-sm text-text-muted text-center" style={{ fontWeight: 300 }}>
          This login link has expired or already been used.<br />
          Request a new one below.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-primary px-8 py-3 rounded-2xl text-sm font-sans"
        >
          Back to home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5" style={{ background: '#FBF4E8' }}>
      <div
        className="font-display italic text-white flex items-center justify-center"
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#C8706E', fontSize: 22,
          boxShadow: '0 4px 16px rgba(200,112,110,0.35)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        W
      </div>
      <p className="font-display italic text-xl text-ink">Signing you in...</p>
      <p className="font-sans text-sm text-text-muted" style={{ fontWeight: 300 }}>
        Loading your letter box
      </p>
    </div>
  )
}
