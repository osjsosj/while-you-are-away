import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDraft, saveDraft, flushDraft } from '../utils/storage'
import { authHeader } from '../utils/supabase'
import { timedFetch, jsonOrNull } from '../utils/net'
import { track, trackingId } from '../utils/track'
import { formatLong } from '../utils/diary'
import { useStoryFonts } from '../components/storyLook'
import FlowFrame from '../components/FlowFrame'
import KeepsakeBook from '../components/KeepsakeBook'

/* The keepsake book for the sender: every letter and every reply, to print or save as a PDF.
   Bought with the letter box ($19.99), or added later for the difference ($10). */

const UPGRADE_PRICE = '$10'

/** Local development only: /keepsake?demo=book shows the book, ?demo=box the offer to add it. No account, no server. */
const demo = () => (import.meta.env.DEV ? new URLSearchParams(window.location.search).get('demo') : null)

async function demoBook() {
  const { demoBox } = await import('./box/demoBox.js')
  const d = demoBox('demo')
  const replies = [{ item_id: d.items.find((i) => i.open)?.id, body: 'I read this on the train and had to look out the window for a while.', created_at: new Date().toISOString() }]
  return { box: d.box, items: d.items.filter((i) => i.open && (i.letter || i.photo)), replies }
}

export default function Keepsake() {
  const draft = getDraft()
  const p = draft.phase1 || {}
  const to = p.toName || 'them'
  const [state, setState] = useState('loading') // loading | signin | none | box | keepsake | error
  const [book, setBook] = useState(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useStoryFonts(book?.box?.look?.typeKey)

  useEffect(() => {
    let live = true
    ;(async () => {
      const mode = demo()
      if (mode) {
        if (mode === 'book') { const b = await demoBook(); if (live) { setBook(b); setState('keepsake') } } else if (live) setState('box')
        return
      }
      // back from adding the keepsake: remember that checkout on the draft the server reads
      const q = new URLSearchParams(window.location.search)
      const sid = q.get('session_id')
      if (q.get('upgrade') === 'success' && sid?.startsWith('cs_')) {
        saveDraft({ keepsakeSessionId: sid })
        await flushDraft().catch(() => {})
        window.history.replaceState(null, '', '/keepsake')
      }
      try {
        const res = await timedFetch('/api/box', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(await authHeader()) }, body: JSON.stringify({ action: 'keepsake' }) }, 30000)
        if (res.status === 401) return live && setState('signin')
        const j = await jsonOrNull(res)
        if (!live) return
        if (!res.ok || !j) return setState('error')
        if (j.tier === 'keepsake' && j.book) { setBook(j.book); setState('keepsake') } else setState(j.tier === 'box' ? 'box' : 'none')
      } catch {
        if (live) setState('error')
      }
    })()
    return () => { live = false }
  }, [])

  const upgrade = async () => {
    if (demo()) return
    setBusy(true)
    setError('')
    try {
      track('checkout_start', { kind: 'upgrade' })
      const res = await timedFetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'upgrade', baseSession: draft.paymentSessionId, fromName: p.fromName, toName: p.toName, email: draft.email || '', anonId: trackingId() }),
      })
      const j = await jsonOrNull(res)
      if (!j?.url) throw new Error()
      window.location.assign(j.url)
    } catch {
      setError('Checkout couldn’t start. Try again in a moment.')
      setBusy(false)
    }
  }

  const letters = book?.items?.length || 0
  const replies = book?.replies?.length || 0

  return (
    <FlowFrame narrow right={<Link className="wf-link" to="/export">← Back to handing over</Link>}>
      <h1 className="wf-h1">The keepsake book</h1>

      {state === 'loading' && <p className="wf-lede" aria-busy="true">Gathering your letters…</p>}

      {state === 'keepsake' && (
        <>
          <p className="wf-lede">Every letter to {book.box.toName || to}, in the order it was meant to be read, each on its own paper. Whatever {book.box.toName || to} wrote back sits beneath the letter it answers.</p>
          <dl className="wf-card wf-summary" style={{ marginBottom: 24 }}>
            <div><dt>Letters</dt><dd>{letters}</dd></div>
            <div><dt>Replies</dt><dd>{replies}</dd></div>
            {book.box.returnDate && <div><dt>For the day you meet again</dt><dd>{formatLong(book.box.returnDate)}</dd></div>}
          </dl>
          <button type="button" className="wf-btn wf-btn--block" onClick={() => setOpen(true)}>Open the book</button>
          <p className="wf-note" style={{ marginTop: 14 }}>Save it as a PDF or print it from the book. Letters and replies added later are in it the next time you open it. {book.box.toName || to} can keep it too, from the day you meet again.</p>
        </>
      )}

      {state === 'box' && (
        <>
          <p className="wf-lede">Every letter you write and every reply from {to}, gathered into one book to print or save as a PDF. {to} gets it too, on the day you meet again.</p>
          <ul style={{ margin: '0 0 24px', paddingLeft: 22, lineHeight: 1.6, listStyle: 'disc', color: 'var(--mist-soft)' }}>
            <li>Each letter on its own page, on the paper made for it</li>
            <li>Their replies beneath the letters they answer</li>
            <li>A cover with both your names and your dates</li>
          </ul>
          <div className="wf-paper">
            <p style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0 0 4px' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 40, lineHeight: 1 }}>{UPGRADE_PRICE}</span>
              <span className="wf-note">once, added to your letter box</span>
            </p>
            <p className="wf-note" style={{ marginBottom: 16 }}>Full refund within 14 days, for any reason.</p>
            <button type="button" className="wf-btn wf-btn--ink wf-btn--block" onClick={upgrade} disabled={busy}>{busy ? 'Opening secure checkout…' : 'Add the keepsake book'}</button>
            {error && <p className="wf-error" role="alert" style={{ color: '#B1453A' }}>{error}</p>}
          </div>
        </>
      )}

      {state === 'none' && (
        <p className="wf-lede">The keepsake book comes with a letter box that’s been handed over. <Link to="/export">Hand yours over</Link> and choose the box with the keepsake.</p>
      )}
      {state === 'signin' && (
        <p className="wf-lede">Sign in to see your keepsake book. <Link to="/start?next=/keepsake">Sign in</Link></p>
      )}
      {state === 'error' && (
        <p className="wf-lede" role="alert">Your letters didn’t load. Check your connection and open this page again. Nothing is lost.</p>
      )}

      {open && book && <KeepsakeBook box={book.box} items={book.items} replies={book.replies} onClose={() => setOpen(false)} />}
    </FlowFrame>
  )
}
