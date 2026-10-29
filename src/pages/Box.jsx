import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { localISODate, daysBetween, formatLong } from '../utils/diary'
import Dog from '../components/pets/Dog'
import Cat from '../components/pets/Cat'
import './box.css'

/* The recipient's letter box, opened from the link the sender hands over. */

const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

function useBox(token) {
  const cacheKey = `wya_box_${token}`
  const [data, setData] = useState(() => read(cacheKey))
  const [status, setStatus] = useState(data ? 'cached' : 'loading')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/box?token=${encodeURIComponent(token)}&today=${localISODate()}`)
      if (res.status === 404) return setStatus('missing')
      if (!res.ok) throw new Error(String(res.status))
      const json = await res.json()
      setData(json)
      write(cacheKey, json)
      setStatus('live')
    } catch {
      setStatus((s) => (s === 'loading' ? 'offline-empty' : 'offline'))
    }
  }, [token, cacheKey])

  useEffect(() => {
    // fetching on mount; state is only set after the request resolves
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const post = async (payload) => {
    const res = await fetch(`/api/box?token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, today: localISODate() }),
    })
    if (!res.ok) throw new Error(String(res.status))
    return res.json()
  }

  const patch = (fn) =>
    setData((d) => {
      const next = fn(d)
      write(cacheKey, next)
      return next
    })

  return { data, status, post, patch }
}

export default function Box() {
  const { token } = useParams()
  const { data, status, post, patch } = useBox(token)
  const [openId, setOpenId] = useState(null)
  const [tab, setTab] = useState('letters')
  const [sealed, setSealed] = useState(() => !read(`wya_seen_${token}`))

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  }, [])
  useEffect(() => {
    if (data?.box) document.title = data.box.appName
  }, [data])

  if (status === 'missing') return <Message title="This letter box isn’t here" body="The link may be incomplete. Ask the person who sent it for the full link." />
  if (!data) {
    return status === 'offline-empty'
      ? <Message title="You’re offline" body="Open this link once while connected, and it will be here even without signal." />
      : <div className="wb wb-center" aria-busy="true"><span className="wb-spinner" aria-label="Loading" /></div>
  }

  const { box, items, replies = [], opened = [] } = data
  if (sealed) {
    return <Seal box={box} onOpen={() => { write(`wya_seen_${token}`, true); setSealed(false) }} />
  }

  const openSet = new Set(opened)
  const current = items.find((i) => i.id === openId)

  const markOpened = (id) => {
    if (openSet.has(id)) return
    patch((d) => ({ ...d, opened: [...(d.opened || []), id] }))
    post({ action: 'open', itemId: id }).catch(() => {})
  }

  return (
    <div className="wb">
      <Header box={box} today={data.today || localISODate()} offline={status === 'offline'} />
      <div className="wb-tabs" role="tablist" aria-label="Sections">
        <button type="button" role="tab" aria-selected={tab === 'letters'} className="wb-tab" onClick={() => setTab('letters')}>Letters</button>
        <button type="button" role="tab" aria-selected={tab === 'story'} className="wb-tab" onClick={() => setTab('story')}>Our story</button>
      </div>
      <main className="wb-main">
        {tab === 'letters'
          ? <Letters items={items} openSet={openSet} onOpen={(id) => { setOpenId(id); markOpened(id) }} />
          : <Story box={box} token={token} />}
      </main>
      <InstallHint token={token} />
      {current && (
        <LetterSheet
          item={current}
          replies={replies.filter((r) => r.item_id === current.id)}
          toName={box.toName}
          fromName={box.fromName}
          onClose={() => setOpenId(null)}
          onReply={async (body) => {
            const { reply } = await post({ action: 'reply', itemId: current.id, body })
            patch((d) => ({ ...d, replies: [...(d.replies || []), reply] }))
          }}
        />
      )}
    </div>
  )
}

function Message({ title, body }) {
  return (
    <div className="wb wb-center">
      <div className="wb-message">
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </div>
  )
}

function Seal({ box, onOpen }) {
  return (
    <div className="wb wb-center wb-seal-screen">
      <div className="wb-seal-card">
        <p className="wb-quiet">From {box.fromName || 'someone who loves you'}</p>
        <h1>{box.appName}</h1>
        {box.welcome && <p className="wb-welcome">{box.welcome}</p>}
        <button type="button" className="wb-seal" onClick={onOpen} aria-label="Open your letter box">
          <span aria-hidden="true" />
        </button>
        <p className="wb-quiet">Tap the seal to open</p>
      </div>
    </div>
  )
}

function Header({ box, today, offline }) {
  let line = ''
  if (box.partDate && today < box.partDate) {
    const n = daysBetween(today, box.partDate)
    line = n === 1 ? 'Your letters start arriving tomorrow.' : `Your letters start arriving in ${n} days.`
  } else if (box.returnDate && today < box.returnDate) {
    const n = daysBetween(today, box.returnDate)
    line = `${n} ${n === 1 ? 'day' : 'days'} until we meet again`
  } else if (box.returnDate && today === box.returnDate) {
    line = 'Today is the day.'
  }
  return (
    <header className="wb-header">
      <p className="wb-quiet">Letters from {box.fromName || 'me'}</p>
      <h1>{box.appName}</h1>
      {box.welcome && <p className="wb-welcome">{box.welcome}</p>}
      {line && <p className="wb-count"><span className="wb-dot" aria-hidden="true" />{line}</p>}
      {offline && <p className="wb-offline">Offline. Showing what was saved on this phone.</p>}
    </header>
  )
}

function Letters({ items, openSet, onOpen }) {
  const groups = useMemo(() => {
    const before = items.filter((i) => i.section === 'before')
    const scheduled = items.filter((i) => i.section === 'scheduled')
    const anytime = items.filter((i) => i.section === 'anytime' && i.open)
    const fresh = items.filter((i) => i.open && !i.empty && !openSet.has(i.id) && i.section !== 'anytime')
    const freshIds = new Set(fresh.map((i) => i.id))
    return { before, scheduled, anytime, fresh, freshIds }
  }, [items, openSet])

  const nextLocked = groups.scheduled.find((i) => !i.open)
  const lockedCount = groups.scheduled.filter((i) => !i.open).length
  // letters shown under "New for you" aren't repeated in their own section
  const openScheduled = groups.scheduled.filter((i) => i.open && !groups.freshIds.has(i.id))
  const openBefore = groups.before.filter((i) => i.open && !groups.freshIds.has(i.id))
  const beforeWaiting = groups.before.filter((i) => !i.open).length

  return (
    <>
      {groups.fresh.length > 0 && (
        <section className="wb-section" aria-labelledby="wb-new">
          <h2 id="wb-new">New for you</h2>
          <div className="wb-list">
            {groups.fresh.map((i) => <Row key={i.id} item={i} isNew onOpen={onOpen} />)}
          </div>
        </section>
      )}

      {(openBefore.length > 0 || beforeWaiting > 0) && (
        <section className="wb-section" aria-labelledby="wb-before">
          <h2 id="wb-before">Written before I left</h2>
          <div className="wb-list">
            {[...openBefore].reverse().map((i) => <Row key={i.id} item={i} isNew={!openSet.has(i.id)} onOpen={onOpen} />)}
          </div>
          {beforeWaiting > 0 && <p className="wb-note">{groups.before.length > beforeWaiting ? 'More are on their way.' : 'The first one arrives soon.'}</p>}
        </section>
      )}

      {(openScheduled.length > 0 || nextLocked) && (
        <section className="wb-section" aria-labelledby="wb-scheduled">
          <h2 id="wb-scheduled">Letters while we’re apart</h2>
          <div className="wb-list">
            {[...openScheduled].reverse().map((i) => <Row key={i.id} item={i} isNew={!openSet.has(i.id) && !i.empty} onOpen={onOpen} />)}
            {nextLocked && (
              <div className="wb-row wb-row--locked">
                <div>
                  <p className="wb-row-title">{nextLocked.label}</p>
                  <p className="wb-row-sub">Opens {formatLong(nextLocked.opensOn)}</p>
                </div>
                <LockIcon />
              </div>
            )}
          </div>
          {lockedCount > 1 && <p className="wb-note">{lockedCount - 1} more after that.</p>}
        </section>
      )}

      {groups.anytime.length > 0 && (
        <section className="wb-section" aria-labelledby="wb-anytime">
          <h2 id="wb-anytime">Open when…</h2>
          <div className="wb-list">
            {groups.anytime.map((i) => <Row key={i.id} item={i} isNew={false} onOpen={onOpen} />)}
          </div>
        </section>
      )}
    </>
  )
}

function Row({ item, isNew, onOpen }) {
  const sub = item.section === 'before' ? item.stamp : item.section === 'anytime' ? item.hint || 'Whenever you need it' : item.empty ? 'Nothing here yet' : item.opensOn ? `Arrived ${formatLong(item.opensOn)}` : ''
  const title = item.section === 'before' && item.label === item.stamp ? (item.letter || '').split('\n')[0].slice(0, 80) || item.label : item.label
  return (
    <button type="button" className={`wb-row${isNew ? ' wb-row--new' : ''}`} onClick={() => onOpen(item.id)} disabled={item.empty}>
      <div style={{ minWidth: 0 }}>
        <p className="wb-row-title">{title}</p>
        {sub && <p className="wb-row-sub">{sub}</p>}
      </div>
      {isNew ? <span className="wb-new">New</span> : <ChevronIcon />}
    </button>
  )
}

function LetterSheet({ item, replies, toName, fromName, onClose, onReply }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const send = async () => {
    if (!text.trim()) return
    setBusy(true)
    setError('')
    try {
      await onReply(text.trim())
      setText('')
    } catch {
      setError('Couldn’t send. Check your connection and try again; your words are still here.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wb-sheet-wrap" role="dialog" aria-modal="true" aria-labelledby="wb-sheet-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <article className="wb-sheet">
        <button type="button" className="wb-close" onClick={onClose} aria-label="Close letter">
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
        <p className="wb-sheet-meta"><span className="wb-dot" aria-hidden="true" />{item.section === 'before' ? `${item.stamp} · ${item.date}` : item.opensOn ? formatLong(item.opensOn) : 'Open when…'}</p>
        <h2 id="wb-sheet-title">{item.label}</h2>
        {item.prompt && <p className="wb-prompt">{item.prompt}</p>}
        {item.letter && <div className="wb-letter">{item.letter}</div>}
        {item.photo?.url && <img className="wb-photo" src={item.photo.url} alt="" loading="lazy" />}
        {item.video?.url && <video className="wb-photo" src={item.video.url} controls playsInline preload="metadata" />}
        {item.voice?.url && (
          <div className="wb-voice">
            <p>A voice note from {fromName || 'me'}</p>
            <audio controls src={item.voice.url} preload="metadata" />
          </div>
        )}
        {fromName && item.letter && <p className="wb-sign">— {fromName}</p>}

        <section className="wb-replies" aria-labelledby="wb-replies-title">
          <h3 id="wb-replies-title">Write back</h3>
          {replies.map((r, i) => (
            <div key={i} className="wb-reply">
              <p>{r.body}</p>
              <p className="wb-reply-date">{new Date(r.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            </div>
          ))}
          <label htmlFor="wb-reply-input" className="wb-sr">Your reply</label>
          <textarea id="wb-reply-input" className="wb-textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Write something back${fromName ? ` to ${fromName}` : ''}…`} />
          <button type="button" className="wb-btn" onClick={send} disabled={busy || !text.trim()}>{busy ? 'Sending…' : 'Send reply'}</button>
          {error && <p className="wb-error" role="alert">{error}</p>}
          {!error && toName && <p className="wb-quiet wb-small">{fromName || 'They'} will see your reply.</p>}
        </section>
      </article>
    </div>
  )
}

function Story({ box, token }) {
  const petKey = `wya_pet_${token}`
  const [pet, setPet] = useState(() => read(petKey) || { feedCount: 0, lastFed: null })
  const [now] = useState(() => Date.now())
  const canFeed = pet.feedCount < 10 && (!pet.lastFed || now - new Date(pet.lastFed).getTime() >= 7 * 86400000)
  const feed = () => {
    if (!canFeed) return
    const next = { feedCount: pet.feedCount + 1, lastFed: new Date().toISOString() }
    setPet(next)
    write(petKey, next)
  }
  const today = localISODate()
  return (
    <>
      {box.pet && (
        <section className="wb-section wb-pet" aria-labelledby="wb-pet-name">
          <div className="wb-pet-art" aria-hidden="true">
            {box.pet.type === 'cat'
              ? <Cat bodyColor={box.pet.bodyColor} patternType={box.pet.patternType} eyeColor={box.pet.eyeColor} feedCount={pet.feedCount} />
              : <Dog color={box.pet.color} earType={box.pet.earType} feedCount={pet.feedCount} />}
          </div>
          <h2 id="wb-pet-name">{box.pet.name}</h2>
          <p className="wb-quiet">{pet.feedCount >= 10 ? 'Fully grown, and very loved.' : `Fed ${pet.feedCount} of 10 times. Once a week.`}</p>
          <button type="button" className="wb-btn wb-btn--light" onClick={feed} disabled={!canFeed}>
            {pet.feedCount >= 10 ? 'All grown up' : canFeed ? `Feed ${box.pet.name}` : 'Fed this week'}
          </button>
        </section>
      )}
      {box.timeline.length > 0 && (
        <section className="wb-section" aria-labelledby="wb-story">
          <h2 id="wb-story">Our story</h2>
          <ol className="wb-timeline">
            {box.timeline.map((t, i) => (
              <li key={i} className={t.date && t.date > today ? 'is-future' : ''}>
                <p className="wb-row-sub">{t.date ? formatLong(t.date) : ''}</p>
                <p className="wb-row-title">{t.label}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      {!box.pet && box.timeline.length === 0 && <p className="wb-note">Nothing here yet.</p>}
    </>
  )
}

function InstallHint({ token }) {
  const key = `wya_hint_${token}`
  const [show, setShow] = useState(() => !read(key) && !window.matchMedia?.('(display-mode: standalone)').matches)
  if (!show) return null
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  return (
    <aside className="wb-hint">
      <p>
        <strong>Keep it close.</strong>{' '}
        {ios ? 'Tap Share, then “Add to Home Screen”.' : 'Use your browser menu: “Add to Home screen”.'} It opens even without signal.
      </p>
      <button type="button" onClick={() => { write(key, true); setShow(false) }} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
    </aside>
  )
}

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="7" rx="1.5" /><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" /></svg>
)
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3l5 5-5 5" /></svg>
)
