import { useEffect, useMemo, useRef, useState } from 'react'
import { daysBetween, formatLong } from '../../utils/diary'
import { moonOn } from '../../utils/sky'
import Moon from '../../components/Moon'
import Mascot from '../../components/Mascot'
import { buildPath, currentNodeId, offsetFor, untilStats } from './journey'
import './letterapp.css'

/* The recipient's letter box as an app: a menu (Letters, Photos, My replies, Until we meet) around
   a path that walks through time. Shared by the live box and the sender's preview. */

const TABS = [
  { id: 'letters', label: 'Letters', Icon: EnvelopeIcon },
  { id: 'photos', label: 'Photos', Icon: PhotoIcon },
  { id: 'replies', label: 'My replies', Icon: ReplyIcon },
  { id: 'until', label: 'Until we meet', Icon: MoonIcon },
]

export default function LetterApp({ box, items, replies = [], opened = [], today, onOpen, offline = false, film = null, onFilm = null, story = null, footer = null }) {
  const [tab, setTab] = useState('letters')
  const openSet = useMemo(() => new Set(opened), [opened])
  const units = useMemo(() => buildPath(items, box), [items, box])
  const current = currentNodeId(units, openSet)
  const main = useRef(null)

  const go = (id) => {
    setTab(id)
    main.current?.scrollIntoView?.({ block: 'start' })
    window.scrollTo?.({ top: 0 })
  }

  return (
    <div className="la">
      <aside className="la-side" aria-label="Letter box">
        <div className="la-side-in">
        <div className="la-brand">
          <span className="la-brand-dot" aria-hidden="true" />
          <span>
            <span className="la-brand-name">{box.appName}</span>
            <span className="la-brand-from">From {box.fromName || 'someone who loves you'}</span>
          </span>
        </div>
        <nav className="la-nav" aria-label="Sections">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" className="la-nav-item" aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
              <Icon />
              <span>{label}</span>
              {id === 'replies' && replies.length > 0 && <span className="la-count">{replies.length}</span>}
            </button>
          ))}
        </nav>
        </div>
      </aside>

      <header className="la-top">
        <span className="la-brand-dot" aria-hidden="true" />
        <span className="la-top-name">{box.appName}</span>
        <Countdown box={box} today={today} compact />
      </header>

      <main className="la-main" ref={main}>
        {offline && <p className="la-offline">Offline. Showing what was saved on this phone.</p>}
        <div className="la-view" key={tab}>
          {tab === 'letters' && <LettersView box={box} items={items} units={units} openSet={openSet} current={current} onOpen={onOpen} today={today} />}
          {tab === 'photos' && <PhotosView items={items} film={film} onOpen={onOpen} onFilm={onFilm} fromName={box.fromName} />}
          {tab === 'replies' && <RepliesView items={items} replies={replies} onOpen={onOpen} fromName={box.fromName} onGo={() => go('letters')} />}
          {tab === 'until' && <UntilView box={box} items={items} today={today}>{story}</UntilView>}
        </div>
        {footer}
      </main>

      <aside className="la-rail" aria-label="At a glance">
        {tab !== 'until' && <RailCountdown box={box} today={today} onMore={() => go('until')} />}
        <RailNext units={units} current={current} openSet={openSet} onOpen={onOpen} />
        <RailMoon today={today} />
      </aside>

      <nav className="la-tabbar" aria-label="Sections">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} type="button" className="la-tab" aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
            <Icon />
            <span>{label === 'Until we meet' ? 'Until' : label === 'My replies' ? 'Replies' : label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ---------- Letters: the path ---------- */

function LettersView({ box, items, units, openSet, current, onOpen, today }) {
  const anytime = items.filter((i) => i.section === 'anytime')
  const never = items.filter((i) => i.section === 'never')
  let index = 0
  return (
    <>
      <h1 className="la-h1">{box.appName}</h1>
      {box.welcome && <p className="la-lede">{box.welcome}</p>}
      {units.length === 0 && anytime.length === 0 && never.length === 0 && <p className="la-empty">Nothing has arrived yet. The first letter opens on the day you part.</p>}
      {units.map((u) => (
        <section key={u.id} className={`la-unit la-unit--${u.id}`} aria-labelledby={`la-u-${u.id}`}>
          <div className="la-banner">
            <h2 id={`la-u-${u.id}`}>{u.title}</h2>
            <p>{u.sub}</p>
            <span className="la-banner-count">{u.nodes.filter((n) => openSet.has(n.item.id)).length} of {u.nodes.length} read</span>
          </div>
          <ol className="la-path">
            {u.nodes.map((n) => {
              const i = index++
              return <PathNode key={n.item.id} node={n} i={i} read={openSet.has(n.item.id)} isCurrent={current === n.item.id} onOpen={onOpen} today={today} fromName={box.fromName} />
            })}
          </ol>
        </section>
      ))}
      {anytime.length > 0 && (
        <section className="la-shelf" aria-labelledby="la-anytime">
          <h2 id="la-anytime" className="la-h2">Open when…</h2>
          <p className="la-sub">For the moment it’s written for. Open these whenever you need one.</p>
          <div className="la-envelopes">
            {anytime.map((i, k) => (
              <button key={i.id} type="button" className={`la-env${openSet.has(i.id) ? ' is-read' : ''}`} style={{ '--d': `${k * 60}ms` }} onClick={() => onOpen(i.id)}>
                <span className="la-env-flap" aria-hidden="true" />
                <span className="la-env-label">{i.label}</span>
                {i.hint && <span className="la-env-hint">{i.hint}</span>}
              </button>
            ))}
          </div>
        </section>
      )}
      {never.length > 0 && (
        <section className="la-shelf" aria-labelledby="la-never">
          <h2 id="la-never" className="la-h2">Things I never said</h2>
          <p className="la-sub">Folded small, the way you’d slip a note into a pocket.</p>
          <div className="la-notes">
            {never.map((i, k) => (
              <button key={i.id} type="button" className={`la-note${openSet.has(i.id) ? ' is-read' : ''}`} style={{ '--r': `${(k % 2 ? 1 : -1) * (1.5 + (k % 3))}deg`, '--d': `${k * 70}ms` }} onClick={() => onOpen(i.id)}>
                <span className="la-note-label">{i.label}</span>
                <span className="la-note-state">{openSet.has(i.id) ? 'Read' : 'Unfold'}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function PathNode({ node, i, read, isCurrent, onOpen, today, fromName }) {
  const { item, kind, badge, caption } = node
  const [peek, setPeek] = useState(false)
  useEffect(() => {
    if (!peek) return
    const t = setTimeout(() => setPeek(false), 2600)
    return () => clearTimeout(t)
  }, [peek])
  const locked = !item.open
  const fresh = !locked && !read
  const state = locked ? 'locked' : read ? 'read' : 'fresh'
  const big = kind === 'tonight' || kind === 'last'
  const off = offsetFor(i)
  const soon = locked && item.opensOn ? daysBetween(today, item.opensOn) : null
  const name = kind === 'before' ? badge : item.label
  const label = locked
    ? `${name}, sealed${item.opensOn ? `, opens ${formatLong(item.opensOn)}` : ''}`
    : `${name}${caption ? `, ${caption}` : ''}${fresh ? ', new' : ', read'}`

  return (
    <li className={`la-step la-step--${state} la-step--${kind}${big ? ' la-step--big' : ''}${isCurrent ? ' is-current' : ''}`} style={{ '--x': off, '--d': `${Math.min(i, 14) * 55}ms` }}>
      {isCurrent && (
        <span className="la-callout" aria-hidden="true">{locked ? (soon === 1 ? 'Tomorrow' : soon ? `In ${soon} days` : 'Soon') : 'Open'}</span>
      )}
      <button type="button" className="la-node" aria-label={label} onClick={() => (locked ? setPeek(true) : onOpen(item.id))} disabled={item.empty}>
        <span className="la-node-face" aria-hidden="true">
          {locked ? <LockGlyph big={big} kind={kind} /> : kind === 'before' ? <span className="la-node-d">{badge}</span> : kind === 'occasion' ? <GiftGlyph /> : kind === 'last' ? <HeartGlyph /> : read ? <CheckGlyph /> : <EnvelopeGlyph />}
        </span>
      </button>
      <span className="la-step-text" aria-hidden="true">
        <span className="la-step-name">{kind === 'before' ? item.label !== item.stamp ? item.label : (item.stamp || badge) : name}</span>
        <span className="la-step-date">{locked && item.opensOn ? `Opens ${formatLong(item.opensOn)}` : caption}</span>
      </span>
      {peek && <span className="la-peek" role="status">{item.opensOn ? `Sealed until ${formatLong(item.opensOn)}.` : 'Sealed for now.'} {kind === 'last' ? `${fromName || 'They'}’ll be there.` : ''}</span>}
      {isCurrent && <Mascot size={88} mood={locked ? 'idle' : 'cheer'} className={`la-mascot${off > 0 ? ' is-left' : ''}`} />}
    </li>
  )
}

/* ---------- Photos ---------- */

function PhotosView({ items, film, onOpen, onFilm, fromName }) {
  const shots = [
    ...(film?.photos || []).map((p) => ({ key: `f-${p.id}`, url: p.url, caption: p.caption, film: true })),
    ...items.filter((i) => i.open && i.photo?.url).map((i) => ({ key: i.id, url: i.photo.url, caption: i.label, id: i.id })),
  ]
  return (
    <>
      <h1 className="la-h1">Photos</h1>
      <p className="la-lede">Every photo {fromName || 'they'} tucked into a letter, gathered in one place as the letters open.</p>
      {onFilm && (
        <button type="button" className="la-film" onClick={onFilm}>
          <span className="la-film-play" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg></span>
          <span><span className="la-film-title">Watch our film again</span><span className="la-film-sub">The one that opened your letter box</span></span>
        </button>
      )}
      {shots.length === 0
        ? <p className="la-empty">No photos yet. When a letter with a photo opens, it lands here.</p>
        : (
          <ul className="la-photos">
            {shots.map((s, k) => (
              <li key={s.key} style={{ '--d': `${Math.min(k, 12) * 50}ms` }}>
                <button type="button" onClick={() => (s.film ? onFilm?.() : onOpen(s.id))} aria-label={s.caption || 'Photo'}>
                  <img src={s.url} alt="" loading="lazy" />
                  {s.caption && <span>{s.caption}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
    </>
  )
}

/* ---------- My replies ---------- */

function RepliesView({ items, replies, onOpen, fromName, onGo }) {
  const byItem = new Map(items.map((i) => [i.id, i]))
  const sorted = [...replies].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  return (
    <>
      <h1 className="la-h1">My replies</h1>
      <p className="la-lede">What you wrote back. {fromName || 'They'} can read every one.</p>
      {sorted.length === 0 ? (
        <div className="la-empty">
          <p>You haven’t written back yet. Every letter has room for a reply at the bottom.</p>
          <button type="button" className="la-btn la-btn--ghost" onClick={onGo}>Go to my letters</button>
        </div>
      ) : (
        <ul className="la-replies">
          {sorted.map((r, k) => {
            const it = byItem.get(r.item_id)
            return (
              <li key={`${r.item_id}-${k}`} style={{ '--d': `${Math.min(k, 10) * 50}ms` }}>
                <button type="button" className="la-reply" onClick={() => it && onOpen(it.id)} disabled={!it}>
                  <span className="la-reply-to">To “{it?.label || 'a letter'}”</span>
                  <span className="la-reply-body">{r.body}</span>
                  <span className="la-reply-date">{new Date(r.created_at).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

/* ---------- Until we meet ---------- */

function useNow(ms = 60000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

function UntilView({ box, items, today, children }) {
  const now = useNow()
  const s = untilStats(box, today, now, items)
  const from = box.fromName || 'them'
  return (
    <>
      <h1 className="la-h1">Until we meet</h1>
      {s.mode === 'open' && <p className="la-lede">There’s no date set yet. {s.since !== null ? `It’s been ${s.since} ${s.since === 1 ? 'day' : 'days'} since you said goodbye, and ${s.fullMoons} full ${s.fullMoons === 1 ? 'moon' : 'moons'}.` : ''}</p>}
      {s.mode === 'after' && <p className="la-lede">You made it. The last letter is open.</p>}
      {(s.mode === 'apart' || s.mode === 'before') && (
        <>
          <p className="la-lede">{s.mode === 'before' ? `You haven’t parted yet. ` : ''}Here is the time between now and seeing {from} again, in every unit we could think of.</p>
          <section className="la-big" aria-label="Time left">
            <p className="la-big-num"><span className="num">{s.daysLeft}</span><span className="la-big-unit">{s.daysLeft === 1 ? 'day' : 'days'}</span></p>
            <p className="la-big-sub">until {formatLong(box.returnDate)}</p>
            {s.elapsed !== null && (
              <div className="la-progress" role="img" aria-label={`${Math.round(s.elapsed * 100)} percent of the time apart has passed`}>
                <div className="la-progress-track"><span style={{ transform: `scaleX(${Math.max(0.02, s.elapsed)})` }} /></div>
                <div className="la-progress-ends"><span>Goodbye</span><span><b className="num">{Math.round(s.elapsed * 100)}%</b> of the way</span><span>Together</span></div>
              </div>
            )}
          </section>
          <ul className="la-units">
            <li><span className="la-unit-num num">{s.weeks}</span><span className="la-unit-label">{s.weeks === 1 ? 'week' : 'weeks'}{s.weekDays ? ` and ${s.weekDays} ${s.weekDays === 1 ? 'day' : 'days'}` : ''}</span></li>
            <li><span className="la-unit-num num">{s.hoursLeft.toLocaleString('en-US')}</span><span className="la-unit-label">hours</span></li>
            <li><span className="la-unit-num num">{s.fullMoons.length}</span><span className="la-unit-label">full {s.fullMoons.length === 1 ? 'moon' : 'moons'} to go{s.fullMoons[0] ? `, the next on ${formatLong(s.fullMoons[0]).replace(/, \d{4}$/, '')}` : ''}</span></li>
            {s.daysTotal !== null && <li><span className="la-unit-num num">{Math.max(0, s.daysTotal - s.daysLeft)}</span><span className="la-unit-label">days behind you, of {s.daysTotal}</span></li>}
          </ul>
          {s.lookback && (
            <section className="la-mirror" aria-labelledby="la-mirror-h">
              <h2 id="la-mirror-h" className="la-h2">{s.daysLeft} days ago</h2>
              <p className="la-mirror-lede">The time still ahead is as long as the stretch back to {formatLong(s.lookback.day)}{s.lookback.where ? `, ${s.lookback.where}` : ''}.</p>
              {s.lookback.event
                ? (
                  <p className="la-mirror-event">
                    <span>{s.lookback.event.gap === 0 ? 'That very day' : `${formatLong(s.lookback.event.date).replace(/, \d{4}$/, '')}, ${Math.abs(s.lookback.event.gap)} ${Math.abs(s.lookback.event.gap) === 1 ? 'day' : 'days'} ${s.lookback.event.gap > 0 ? 'later' : 'earlier'}`}</span>
                    {s.lookback.event.text}
                  </p>
                )
                : <p className="la-mirror-event la-mirror-event--quiet"><span>Then</span>That’s how long it feels, and how fast it went.</p>}
            </section>
          )}
        </>
      )}
      {children}
    </>
  )
}

/* ---------- rail (desktop) ---------- */

function Countdown({ box, today, compact = false }) {
  let text = ''
  if (box.partDate && today < box.partDate) {
    const n = daysBetween(today, box.partDate)
    text = n === 1 ? 'Starts tomorrow' : `Starts in ${n} days`
  } else if (box.returnDate && today < box.returnDate) {
    const n = daysBetween(today, box.returnDate)
    text = compact ? `${n}d to go` : `${n} ${n === 1 ? 'day' : 'days'} until we meet again`
  } else if (box.returnDate && today === box.returnDate) text = 'Today is the day'
  if (!text) return null
  return <span className="la-chip"><span className="la-chip-dot" aria-hidden="true" />{text}</span>
}

function RailCountdown({ box, today, onMore }) {
  const now = useNow()
  const s = untilStats(box, today, now)
  return (
    <section className="la-card">
      <h2 className="la-card-h">Until we meet</h2>
      {s.daysLeft !== undefined ? (
        <>
          <p className="la-card-num"><span className="num">{s.daysLeft}</span> {s.daysLeft === 1 ? 'day' : 'days'}</p>
          {s.elapsed !== null && <div className="la-progress-track la-progress-track--sm"><span style={{ transform: `scaleX(${Math.max(0.02, s.elapsed)})` }} /></div>}
          <p className="la-card-sub">{s.elapsed !== null ? `${Math.round(s.elapsed * 100)}% of the time apart is behind you.` : `Until ${formatLong(box.returnDate)}.`}</p>
        </>
      ) : <p className="la-card-sub">{s.since !== null && s.since !== undefined ? `Day ${s.since} apart.` : 'No date set yet.'}</p>}
      <button type="button" className="la-link" onClick={onMore}>See it all</button>
    </section>
  )
}

function RailNext({ units, current, openSet, onOpen }) {
  const node = units.flatMap((u) => u.nodes).find((n) => n.item.id === current)
  if (!node) return null
  const it = node.item
  const ready = it.open && !openSet.has(it.id)
  return (
    <section className="la-card">
      <h2 className="la-card-h">{ready ? 'Waiting for you' : 'Next letter'}</h2>
      <p className="la-card-letter">{it.label}</p>
      <p className="la-card-sub">{node.kind === 'before' ? `${node.badge} · ` : ''}{ready ? 'It’s open. Take your time.' : it.opensOn ? `Opens ${formatLong(it.opensOn)}.` : 'Sealed for now.'}</p>
      {ready && <button type="button" className="la-btn" onClick={() => onOpen(it.id)}>Open it</button>}
    </section>
  )
}

function RailMoon({ today }) {
  const m = moonOn(today)
  if (!m) return null
  return (
    <section className="la-card la-card--moon">
      <Moon phase={m.phase} label={`${m.name}, ${Math.round(m.lit * 100)}% lit`} />
      <div>
        <h2 className="la-card-h">Tonight’s moon</h2>
        <p className="la-card-sub">{m.name}, {Math.round(m.lit * 100)}% lit. The same one, wherever you both are.</p>
      </div>
    </section>
  )
}

/* ---------- glyphs ---------- */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
function EnvelopeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...S}><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.5 7l8.5 6.5L20.5 7" /></svg> }
function PhotoIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...S}><rect x="3" y="4.5" width="18" height="15" rx="2.5" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></svg> }
function ReplyIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...S}><path d="M4 5.5h16v10H9.5L5 19.5v-4H4z" /><path d="M8 9.5h8M8 12.5h5" /></svg> }
function MoonIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...S}><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" /></svg> }
function LockGlyph({ big, kind }) {
  if (kind === 'last') return <svg width={big ? 34 : 26} height={big ? 34 : 26} viewBox="0 0 24 24" {...S} strokeWidth="1.8"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
  return <svg width={big ? 30 : 24} height={big ? 30 : 24} viewBox="0 0 24 24" {...S} strokeWidth="1.8"><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>
}
function EnvelopeGlyph() { return <svg width="30" height="30" viewBox="0 0 24 24" {...S} strokeWidth="1.9"><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3.5 7l8.5 6.5L20.5 7" /></svg> }
function CheckGlyph() { return <svg width="28" height="28" viewBox="0 0 24 24" {...S} strokeWidth="2.2"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> }
function GiftGlyph() { return <svg width="28" height="28" viewBox="0 0 24 24" {...S} strokeWidth="1.9"><rect x="4" y="9" width="16" height="11" rx="1.5" /><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z" /></svg> }
function HeartGlyph() { return <svg width="34" height="34" viewBox="0 0 24 24" {...S} strokeWidth="1.9"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg> }
