import { track } from '../utils/track'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { getDraft, saveDraft, flushDraft } from '../utils/storage'
import { supabase, getUser } from '../utils/supabase'
import { migrateDraftMedia, NeedSignInError } from '../utils/media'
import { allItems } from '../utils/boxModel'
import { formatLong } from '../utils/diary'
import SignInModal from '../components/SignInModal'
import FlowFrame from '../components/FlowFrame'
import Constellation from '../components/Constellation'
import { getPlan, planSlots } from '../utils/plan'
import { normalizeFilm } from '../utils/film'
import { isFilled } from '../utils/summary'
import './handover.css'
import { timedFetch } from '../utils/net'

/* Hand it over: publish the letter box to a private link, share it, and read their replies. */

/** Local development only: /export?demo=live shows the handed-over page with no account and no server. */
const isDemo = () => import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === 'live'

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
  const [openedIds, setOpenedIds] = useState([])

  const labels = useMemo(() => Object.fromEntries(allItems(getDraft()).map((i) => [i.id, i.label])), [])

  const loadExisting = useCallback(async () => {
    // local development only: /export?demo=live shows the handed-over page without an account or a server
    if (isDemo()) { setLink(`${window.location.origin}/b/demo`); return setStage('live') }
    if (!supabase) return setStage('ready')
    const user = await getUser()
    if (!user) return setStage('ready')
    const { data: box } = await supabase.from('boxes').select('share_token').eq('user_id', user.id).maybeSingle()
    if (!box) return setStage('ready')
    setLink(`${window.location.origin}/b/${box.share_token}`)
    setStage('live')
    const [{ data: r }, { data: o }] = await Promise.all([
      supabase.from('box_replies').select('item_id, body, created_at').eq('box_user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('box_opens').select('item_id').eq('box_user_id', user.id).order('opened_at', { ascending: true }),
    ])
    setReplies(r || [])
    setOpenedIds((o || []).map((x) => x.item_id))
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

  // a new link when the old one went to the wrong person; asked twice, on the page, before it happens
  const [relinking, setRelinking] = useState('idle') // idle → confirm → busy
  const relink = async () => {
    setError('')
    setRelinking('busy')
    try {
      if (isDemo()) { setLink(`${window.location.origin}/b/demo-${Date.now().toString(36)}`); return }
      const { data: { session } } = await supabase.auth.getSession()
      const res = await timedFetch('/api/box', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` }, body: JSON.stringify({ action: 'relink' }) }, 30000)
      const { token } = (await res.json().catch(() => null)) || {}
      if (!res.ok || !token) throw new Error()
      setLink(`${window.location.origin}/b/${token}`)
      setCopied(false)
      track('link_remade')
    } catch {
      setError('The new link couldn’t be made. The old one still works; try again in a moment.')
    } finally {
      setRelinking('idle')
    }
  }

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
      const res = await timedFetch('/api/box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ action: 'publish' }),
      }, 60000)
      // paying happens here, at handover: off to checkout, then straight back to make the link
      if (res.status === 402) { navigate('/paywall'); return }
      if (res.status === 401) throw new NeedSignInError()
      if (!res.ok) throw new Error('Couldn’t create the link. Try again in a moment.')
      const { token } = (await res.json().catch(() => null)) || {}
      if (!token) throw new Error('Couldn’t create the link. Try again in a moment.')
      setLink(`${window.location.origin}/b/${token}`)
      setStage('live')
      track('link_made')
    } catch (err) {
      setStage('ready')
      if (err instanceof NeedSignInError) setNeedSignIn(true)
      else setError(err.message || 'Something went wrong. Try again.')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      track('link_copied')
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setError('Couldn’t copy automatically. Press and hold the link to copy it.')
    }
  }

  const share = async () => {
    try {
      track('link_shared')
      await navigator.share({ title: draft.generatedConfig?.chosenName || 'Your letter box', text: `For ${toName}`, url: link })
    } catch { /* closed the share sheet */ }
  }

  return (
    <FlowFrame right={<button type="button" className="wf-link" onClick={() => navigate('/editor')}>← Back to your letters</button>}>
    <div className="wh wh--in-flow">
      <div className="wh-main">
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
            <Readiness draft={draft} onEdit={() => navigate('/editor')} />
            <button type="button" className="wh-btn" onClick={publish} disabled={stage === 'publishing'}>
              {stage === 'publishing' ? 'Making the link…' : draft.paymentSessionId ? 'Make their link' : 'Make their link · from $9.99'}
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
                {relinking === 'idle' && <button type="button" className="wh-link-btn" onClick={() => setRelinking('confirm')}>Sent it to the wrong person? Make a new link</button>}
                {relinking !== 'idle' && (
                  <div className="wh-relink" role="group" aria-label="Make a new link">
                    <p>The link above stops working right away, and {toName} will need the new one. Every letter, reply and opened letter stays.</p>
                    <div className="wh-actions">
                      <button type="button" className="wh-btn" onClick={relink} disabled={relinking === 'busy'}>{relinking === 'busy' ? 'Making it…' : 'Make a new link'}</button>
                      <button type="button" className="wh-btn wh-btn--ghost" onClick={() => setRelinking('idle')} disabled={relinking === 'busy'}>Keep this one</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Readiness draft={draft} onEdit={() => navigate('/editor')} live />

            <section className="wh-keep" aria-labelledby="wh-keep-title">
              <h2 id="wh-keep-title">The keepsake book</h2>
              <p className="wh-note">Every letter and every reply from {toName}, in one book to print or save as a PDF.</p>
              <button type="button" className="wh-btn wh-btn--ghost" onClick={() => navigate('/keepsake')}>Open the keepsake book</button>
            </section>

            <section className="wh-replies" aria-labelledby="wh-replies-title">
              <h2 id="wh-replies-title">From {toName}</h2>
              {openedIds.length > 0 && <div className="wh-sky"><Constellation ids={openedIds} /></div>}
              <p className="wh-note">{openedIds.length ? `${toName} has opened ${openedIds.length} ${openedIds.length === 1 ? 'letter' : 'letters'}. Each one is a star in their sky.` : 'Nothing opened yet.'}</p>
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
      </div>

      {needSignIn && (
        <SignInModal
          reason="Their link is tied to your account, so your letters, photos and their replies stay safe."
          onClose={() => setNeedSignIn(false)}
          onDone={() => { setNeedSignIn(false); publish() }}
        />
      )}
    </div>
    </FlowFrame>
  )
}

/** What's in the box right now, so nothing is handed over half-finished by accident. */
function Readiness({ draft, onEdit, live = false }) {
  const p1 = draft.phase1 || {}
  const caps = draft.capsuleData || {}
  const slots = planSlots(getPlan(draft), p1.startDate, p1.endDate)
  const written = slots.filter((s) => isFilled(caps[s.id])).length
  const tonight = slots.find((s) => s.section === 'tonight')
  const film = normalizeFilm(draft.film)
  const moments = (Array.isArray(draft.diary) ? draft.diary : []).length
  const rows = [
    [`${written} of ${slots.length} letters written${written < slots.length ? `; the other ${slots.length - written} stay in your draft until you write them` : ''}`, written === slots.length ? 'done' : written ? 'some' : 'none'],
    tonight && [isFilled(caps[tonight.id]) ? 'Tonight’s letter is ready' : 'Tonight’s letter isn’t written yet', isFilled(caps[tonight.id]) ? 'done' : 'none'],
    [film.photos.length ? `First-night film: ${film.photos.length} ${film.photos.length === 1 ? 'photo' : 'photos'}${film.voice ? ' and your voice' : ''}` : 'No first-night film', film.photos.length ? 'done' : 'none'],
    [moments ? `${moments} ${moments === 1 ? 'moment' : 'moments'} from the days before` : 'No moments from the days before yet', moments ? 'done' : 'none'],
  ].filter(Boolean)
  return (
    <section className="wh-ready" aria-label="What’s in the letter box">
      <ul>
        {rows.map(([text, state]) => <li key={text} className={`is-${state}`}>{text}</li>)}
      </ul>
      <p className="wh-note">
        {live ? 'You can keep writing after handing it over. New letters appear in their box on their day.' : 'Nothing has to be finished first. Letters you write later still arrive on their day.'}{' '}
        <button type="button" className="wh-inline-link" onClick={onEdit}>Keep writing</button>
      </p>
    </section>
  )
}
