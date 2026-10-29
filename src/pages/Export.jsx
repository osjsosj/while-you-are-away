import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { getDraft, saveDraft, flushDraft } from '../utils/storage'
import { supabase, getUser } from '../utils/supabase'
import { migrateDraftMedia, NeedSignInError } from '../utils/media'
import { allItems } from '../utils/boxModel'
import { formatLong } from '../utils/diary'
import SignInModal from '../components/SignInModal'
import './handover.css'

/* Hand it over: publish the letter box to a private link, share it, and read their replies. */

export default function Export() {
  const navigate = useNavigate()
  const draft = getDraft()
  const toName = draft.phase1?.toName || 'them'
  const [stage, setStage] = useState('checking') // checking | ready | publishing | live
  const [link, setLink] = useState('')
  const [qr, setQr] = useState('')
  const [error, setError] = useState('')
  const [needSignIn, setNeedSignIn] = useState(false)
  const [copied, setCopied] = useState(false)
  const [replies, setReplies] = useState([])
  const [openedCount, setOpenedCount] = useState(0)

  const labels = useMemo(() => Object.fromEntries(allItems(getDraft()).map((i) => [i.id, i.label])), [])

  const loadExisting = useCallback(async () => {
    if (!supabase) return setStage('ready')
    const user = await getUser()
    if (!user) return setStage('ready')
    const { data: box } = await supabase.from('boxes').select('share_token').eq('user_id', user.id).maybeSingle()
    if (!box) return setStage('ready')
    setLink(`${window.location.origin}/b/${box.share_token}`)
    setStage('live')
    const [{ data: r }, { count }] = await Promise.all([
      supabase.from('box_replies').select('item_id, body, created_at').eq('box_user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('box_opens').select('item_id', { count: 'exact', head: true }).eq('box_user_id', user.id),
    ])
    setReplies(r || [])
    setOpenedCount(count || 0)
  }, [])

  useEffect(() => {
    document.title = "Hand it over — While You're Away"
    // fetching on mount; state is only set after the requests resolve
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExisting()
  }, [loadExisting])

  useEffect(() => {
    if (!link) return
    QRCode.toDataURL(link, { margin: 1, width: 440, color: { dark: '#1B2536', light: '#F6F3EA' } }).then(setQr).catch(() => {})
  }, [link])

  const publish = async () => {
    setError('')
    setStage('publishing')
    try {
      const user = await getUser()
      if (!user) throw new NeedSignInError()
      const patch = await migrateDraftMedia(getDraft())
      if (patch) saveDraft(patch)
      await flushDraft()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ action: 'publish' }),
      })
      if (res.status === 402) throw new Error('This letter box hasn’t been paid for yet. Finish checkout first.')
      if (res.status === 401) throw new NeedSignInError()
      if (!res.ok) throw new Error('Couldn’t create the link. Try again in a moment.')
      const { token } = await res.json()
      setLink(`${window.location.origin}/b/${token}`)
      setStage('live')
    } catch (err) {
      setStage('ready')
      if (err instanceof NeedSignInError) setNeedSignIn(true)
      else setError(err.message || 'Something went wrong. Try again.')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Couldn’t copy automatically. Press and hold the link to copy it.')
    }
  }

  const share = async () => {
    try {
      await navigator.share({ title: draft.generatedConfig?.chosenName || 'Your letter box', text: `For ${toName}`, url: link })
    } catch { /* closed the share sheet */ }
  }

  return (
    <div className="wh">
      <header className="wh-header">
        <button type="button" className="wh-back" onClick={() => navigate('/editor')}>Back to your letters</button>
      </header>
      <main className="wh-main">
        <h1>Hand it over</h1>

        {stage === 'checking' && <p className="wh-lede" aria-busy="true">Checking your letter box…</p>}

        {(stage === 'ready' || stage === 'publishing') && (
          <>
            <p className="wh-lede">
              Make a private link for {toName}. It opens on their phone with nothing to install, and keeps working without signal once opened.
            </p>
            <ul className="wh-points">
              <li>Anything you add or change later shows up in their box too.</li>
              <li>Letters stay sealed until their day. They can’t peek ahead.</li>
              <li>Their replies come back to you, here.</li>
            </ul>
            <button type="button" className="wh-btn" onClick={publish} disabled={stage === 'publishing'}>
              {stage === 'publishing' ? 'Making the link…' : 'Make their link'}
            </button>
          </>
        )}

        {stage === 'live' && (
          <>
            <p className="wh-lede">This is {toName}’s letter box. Give it to them on the day you part: send the link, or print the card and put it in their hand.</p>
            <div className="wh-card">
              {qr && <img src={qr} alt={`QR code that opens the letter box for ${toName}`} className="wh-qr" />}
              <div className="wh-link-box">
                <label htmlFor="wh-link" className="wh-label">Their link</label>
                <input id="wh-link" className="wh-link" readOnly value={link} onFocus={(e) => e.target.select()} />
                <div className="wh-actions">
                  <button type="button" className="wh-btn" onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button>
                  {typeof navigator !== 'undefined' && navigator.share && <button type="button" className="wh-btn wh-btn--ghost" onClick={share}>Share…</button>}
                  <button type="button" className="wh-btn wh-btn--ghost" onClick={() => window.print()}>Print the card</button>
                </div>
                <p className="wh-note">Anyone with this link can open the box, so share it only with {toName}.</p>
              </div>
            </div>

            <section className="wh-replies" aria-labelledby="wh-replies-title">
              <h2 id="wh-replies-title">From {toName}</h2>
              <p className="wh-note">{openedCount ? `${openedCount} ${openedCount === 1 ? 'letter' : 'letters'} opened so far.` : 'Nothing opened yet.'}</p>
              {replies.length === 0 ? (
                <p className="wh-empty">Their replies will appear here.</p>
              ) : (
                <ol className="wh-reply-list">
                  {replies.map((r, i) => (
                    <li key={i}>
                      <p className="wh-reply-to">On “{labels[r.item_id] || 'a letter'}” · {formatLong(r.created_at.slice(0, 10))}</p>
                      <p className="wh-reply-body">{r.body}</p>
                    </li>
                  ))}
                </ol>
              )}
              <button type="button" className="wh-btn wh-btn--ghost" onClick={loadExisting}>Check for new replies</button>
            </section>

            {/* printed card */}
            <div className="wh-print" aria-hidden="true">
              <p className="wh-print-for">For {toName}</p>
              <p className="wh-print-title">{draft.generatedConfig?.chosenName || 'Your letter box'}</p>
              {qr && <img src={qr} alt="" />}
              <p className="wh-print-hint">Scan to open. Save it to your home screen and it will be there whenever you need it.</p>
              {draft.phase1?.fromName && <p className="wh-print-from">— {draft.phase1.fromName}{draft.phase1?.startDate ? `, ${formatLong(draft.phase1.startDate)}` : ''}</p>}
            </div>
          </>
        )}

        {error && <p className="wh-error" role="alert">{error}</p>}
      </main>

      {needSignIn && (
        <SignInModal
          reason="Their link is tied to your account, so your letters, photos and their replies stay safe."
          onClose={() => setNeedSignIn(false)}
          onDone={() => { setNeedSignIn(false); publish() }}
        />
      )}
    </div>
  )
}
