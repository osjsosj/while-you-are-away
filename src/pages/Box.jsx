import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { localISODate, formatLong } from '../utils/diary'
import Dog from '../components/pets/Dog'
import Cat from '../components/pets/Cat'
import FilmPlayer from '../components/FilmPlayer'
import Constellation from '../components/Constellation'
import Moon from '../components/Moon'
import { moonOn } from '../utils/sky'
import { filmFrom } from '../utils/film'
import { postmarkLetterId } from '../utils/decor'
import LetterPaper from '../components/LetterPaper'
import { Motif } from '../components/Decor'
import LetterApp from './box/LetterApp'
import Mascot, { Says } from '../components/Mascot'
import { loadMove } from '../utils/mascot'
import './box.css'

/* The recipient's letter box, opened from the link the sender hands over. */

const read = (k) => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* private mode */ } }

function useBox(token) {
  const cacheKey = `wya_box_${token}`
  const [data, setData] = useState(() => read(cacheKey))
  const [status, setStatus] = useState(data ? 'cached' : 'loading')

  const load = useCallback(async () => {
    // local development only: /b/demo renders a sample box without the server
    if (import.meta.env.DEV && token.startsWith('demo')) {
      const { demoBox } = await import('./box/demoBox')
      setData(demoBox(token))
      return setStatus('live')
    }
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
    if (import.meta.env.DEV && token.startsWith('demo')) {
      return { reply: { item_id: payload.itemId, body: payload.body, created_at: new Date().toISOString() } }
    }
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
  const [sealed, setSealed] = useState(() => !read(`wya_seen_${token}`))
  const [playing, setPlaying] = useState(false)
  const [filmSeen, setFilmSeen] = useState(() => !!read(`wya_film_${token}`))

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
      : <div className="wb wb-center" aria-busy="true"><span role="img" aria-label="Loading"><Mascot move="walk" size={120} /></span></div>
  }

  const { box, items, replies = [], opened = [] } = data
  const film = filmFrom(data.film)
  if (sealed) {
    return <Seal box={box} voiceUrl={box.sealVoice?.url || null} onOpen={() => { write(`wya_seen_${token}`, true); setSealed(false) }} />
  }
  // the film plays by itself once, the first time it's there (the day they part), and any time from "Our story"
  if (film && (playing || !filmSeen)) {
    return (
      <div className="wb" style={box.accent ? { '--light': box.accent } : undefined}>
        <FilmPlayer {...film} paper={box.decor?.style} fromName={box.fromName} title={box.appName} closing={box.welcome} onDone={() => { write(`wya_film_${token}`, true); setFilmSeen(true); setPlaying(false) }} />
      </div>
    )
  }

  const openSet = new Set(opened)
  const current = items.find((i) => i.id === openId)

  const markOpened = (id) => {
    if (openSet.has(id)) return
    patch((d) => ({ ...d, opened: [...(d.opened || []), id] }))
    post({ action: 'open', itemId: id }).catch(() => {})
  }

  const today = data.today || localISODate()
  return (
    <div className="wb wb--app" style={box.accent ? { '--light': box.accent } : undefined}>
      <LetterApp
        box={box}
        items={items}
        replies={replies}
        opened={opened}
        today={today}
        offline={status === 'offline'}
        film={film}
        onFilm={film ? () => setPlaying(true) : null}
        onOpen={(id) => { setOpenId(id); markOpened(id) }}
        story={<><OurSky ids={opened} /><Story box={box} token={token} today={today} /></>}
      />
      <InstallHint token={token} />
      {current && (
        <LetterSheet
          item={current}
          replies={replies.filter((r) => r.item_id === current.id)}
          toName={box.toName}
          fromName={box.fromName}
          signature={box.signature}
          decor={box.decor}
          showPostmark={current.id === postmarkLetterId(items)}
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

/** The first open: Perigan has brought the box. Tap him and he sets the letter down. */
export function Seal({ box, onOpen, voiceUrl = null }) {
  const [listening, setListening] = useState(false)
  const [dropping, setDropping] = useState(false)
  const audio = useRef(null)
  const done = useRef(false)
  const finish = () => {
    if (done.current) return
    done.current = true
    audio.current?.pause()
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return onOpen()
    setDropping(true)
    setTimeout(onOpen, 1900) // the length of the put-down move
  }
  const tap = () => {
    if (!voiceUrl || listening) return finish()
    setListening(true)
    const a = audio.current
    a.onended = () => setTimeout(finish, 500)
    a.play().catch(finish)
    setTimeout(finish, 15000) // never keep them waiting on a long note
  }
  useEffect(() => { loadMove('putdown').catch(() => {}) }, []) // ready before they tap
  const from = box.fromName || 'Someone'
  return (
    <div className="wb wb-center wb-seal-screen">
      <div className="wb-seal-card">
        {voiceUrl && <audio ref={audio} src={voiceUrl} preload="auto" />}
        <p className="wb-quiet">From {box.fromName || 'someone who loves you'}</p>
        <h1>{box.appName}</h1>
        {box.welcome && <p className="wb-welcome">{box.welcome}</p>}
        {!dropping && <Says tail="down" className="wb-seal-says">{listening ? `${from} has something to say…` : voiceUrl ? `Tap me. ${from} has something to say.` : 'This is for you. Tap me to open it.'}</Says>}
        <button type="button" className="wb-perigan" onClick={tap} disabled={dropping} aria-label={voiceUrl ? `Open your letter box and hear ${box.fromName || 'a voice note'}` : 'Open your letter box'}>
          <Mascot move={dropping ? 'putdown' : 'idle'} size={190} />
        </button>
        {listening && !dropping && <p className="wb-quiet wb-listening"><button type="button" onClick={finish}>Open now</button></p>}
      </div>
    </div>
  )
}

const SECTION_TITLES = {
  tonight: 'Tonight',
  before: 'Written before I left',
  scheduled: 'Letters while we’re apart',
  never: 'Things I never said',
  anytime: 'Open when…',
  occasions: 'Special days',
  last: 'The day we meet again',
}

export function LetterSheet({ item, replies, toName, fromName, signature = null, decor = null, showPostmark = false, onClose, onReply, preview = false }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(0) // bumps on each reply sent, so the pelican flies off again
  useEffect(() => {
    if (!sent) return
    const t = setTimeout(() => setSent(0), 2600)
    return () => clearTimeout(t)
  }, [sent])

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
      setSent((n) => n + 1)
    } catch {
      setError('Couldn’t send. Check your connection and try again; your words are still here.')
    } finally {
      setBusy(false)
    }
  }

  const style = decor?.style || 'night'
  const meta = item.section === 'before' ? `${item.stamp} · ${item.date}` : item.opensOn ? formatLong(item.opensOn) : SECTION_TITLES[item.section] || ''

  return (
    <div className="wb-sheet-wrap" role="dialog" aria-modal="true" aria-labelledby="wb-sheet-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <article className={`wb-sheet wb-sheet--${style}`}>
        <button type="button" className="wb-close" onClick={onClose} aria-label="Close letter">
          <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
        </button>
        <LetterPaper
          decor={decor}
          title={item.label}
          titleId="wb-sheet-title"
          meta={meta}
          prompt={item.prompt}
          letter={item.letter}
          stickers={item.stickers || []}
          photoUrl={item.photo?.url}
          videoUrl={item.video?.url}
          voiceUrl={item.voice?.url}
          fromName={fromName}
          signature={signature}
          note={item.note}
          showPostmark={showPostmark}
          isTicket={decor?.ticket?.letterId === item.id}
          celebrate={!!decor?.celebrate && item.section === 'occasions'}
        />

        {preview ? (
          <p className="wb-quiet wb-small" style={{ marginTop: 28 }}>Here, {toName || 'they'} can write back to you. Replies arrive on your hand-over page.</p>
        ) : (
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
          {sent > 0 && (
            <p className="wb-sent" role="status" key={sent}>
              <Mascot move="fly" loop size={64} className="mascot-away" />
              Your reply is on its way{fromName ? ` to ${fromName}` : ''}.
            </p>
          )}
          {!error && !sent && toName && <p className="wb-quiet wb-small">{fromName || 'They'} will see your reply.</p>}
        </section>
        )}
      </article>
    </div>
  )
}

export function Story({ box, token, today: day }) {
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
  const today = day || localISODate()
  return (
    <>
      {box.decor?.song && (
        <section className="wb-section" aria-labelledby="wb-song">
          <h2 id="wb-song">Our song</h2>
          <a className="wb-song" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(box.decor.song.title)}`} target="_blank" rel="noopener noreferrer">
            <Motif id="musical-notes" size={46} />
            <span><span className="wb-row-title">{box.decor.song.title}</span><span className="wb-row-sub">Play it when you miss {box.fromName || 'me'}</span></span>
          </a>
        </section>
      )}
      <Moons partDate={box.partDate} today={today} />
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
      {!box.decor?.song && !box.partDate && !box.pet && box.timeline.length === 0 && <p className="wb-note">Nothing here yet.</p>}
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

/** The constellation of letters opened so far. */
export function OurSky({ ids, label }) {
  if (!ids?.length) return null
  const n = ids.length
  return (
    <section className="wb-sky" aria-label="Your constellation">
      <Constellation ids={ids} />
      <p className="wb-note">{label || `${n} ${n === 1 ? 'letter' : 'letters'} opened. Each one is a star.`}</p>
    </section>
  )
}

function Moons({ partDate, today }) {
  if (!partDate) return null
  const then = moonOn(partDate)
  const now = today > partDate ? moonOn(today) : null
  if (!then) return null
  return (
    <section className="wb-section" aria-labelledby="wb-moon">
      <h2 id="wb-moon">The same moon</h2>
      <div className="wb-moons">
        <figure>
          <Moon phase={then.phase} label={`${then.name}, ${Math.round(then.lit * 100)}% lit`} />
          <figcaption><span className="wb-row-title">{today >= partDate ? 'The night we said goodbye' : 'The night we say goodbye'}</span><span className="wb-row-sub">{then.name} · {formatLong(partDate)}</span></figcaption>
        </figure>
        {now && (
          <figure>
            <Moon phase={now.phase} label={`${now.name}, ${Math.round(now.lit * 100)}% lit`} />
            <figcaption><span className="wb-row-title">Tonight</span><span className="wb-row-sub">{now.name} · wherever we both are</span></figcaption>
          </figure>
        )}
      </div>
    </section>
  )
}
