import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDraft } from '../utils/storage'
import { recipientView, addDays } from '../utils/boxModel'
import { useMediaUrl } from '../utils/media'
import { daysBetween, formatLong, localISODate } from '../utils/diary'
import { Header, Letters, LetterSheet, Seal, Story, OurSky } from './Box'
import FilmPlayer from '../components/FilmPlayer'
import { normalizeFilm } from '../utils/film'
import { signedUrl } from '../utils/media'
import './box.css'
import '../styles/flow.css'

/* See the letter box the way they will, on any day: before you part, while you’re apart, the day you meet again. */

export default function Preview() {
  const navigate = useNavigate()
  const [draft] = useState(() => getDraft())
  const p1 = draft.phase1 || {}
  const today = localISODate()
  const first = p1.startDate ? addDays(p1.startDate, -1) : today
  const last = p1.endDate || addDays(p1.startDate || today, 90)
  const span = Math.max(1, daysBetween(first, last))
  const [offset, setOffset] = useState(() => (p1.startDate && today >= first && today <= last ? daysBetween(first, today) : 1))
  const day = addDays(first, Math.min(offset, span))

  const [sealed, setSealed] = useState(true)
  const [tab, setTab] = useState('letters')
  const [openId, setOpenId] = useState(null)
  const [opened, setOpened] = useState(() => new Set())

  const { box, items, film } = useMemo(() => recipientView(draft, day), [draft, day])
  const [playing, setPlaying] = useState(null)
  const playFilm = async () => {
    const f = normalizeFilm(film)
    const photos = await Promise.all(f.photos.map(async (p) => ({ id: p.id, caption: p.caption, url: await signedUrl(p.photo) })))
    setPlaying({ photos: photos.filter((p) => p.url), voiceUrl: f.voice ? await signedUrl(f.voice) : null })
  }
  const current = items.find((i) => i.id === openId && i.open)

  const marks = [
    p1.startDate && { label: 'You part', at: daysBetween(first, p1.startDate) },
    p1.endDate && { label: 'You meet again', at: span },
  ].filter(Boolean)
  const dayLabel = p1.startDate && day < p1.startDate ? 'Before you part' : p1.startDate && day === p1.startDate ? 'The day you part' : p1.endDate && day === p1.endDate ? 'The day you meet again' : p1.startDate ? `Day ${daysBetween(p1.startDate, day)} apart` : ''

  return (
    <div className="wf" style={{ minHeight: 'auto' }}>
      <div className="wp-bar">
        <div className="wp-bar-inner">
          <button type="button" className="wf-link" onClick={() => navigate('/editor')}>← Back to writing</button>
          <div className="wp-day">
            <label htmlFor="wp-range">
              <span className="wp-day-title">{formatLong(day)}</span>
              <span className="wf-note"> · {dayLabel}</span>
            </label>
            <input
              id="wp-range"
              type="range"
              min={0}
              max={span}
              value={Math.min(offset, span)}
              onChange={(e) => { setOffset(Number(e.target.value)); setOpenId(null) }}
              aria-valuetext={`${formatLong(day)}, ${dayLabel}`}
            />
            <div className="wp-marks" aria-hidden="true">
              {marks.map((m) => <span key={m.label} style={{ left: `${(m.at / span) * 100}%` }}>{m.label}</span>)}
            </div>
          </div>
          <button type="button" className="wf-btn wf-btn--small" onClick={() => navigate('/export')}>Hand it over</button>
        </div>
      </div>

      {sealed ? (
        <Seal box={box} onOpen={() => { setSealed(false); if (film) playFilm() }} />
      ) : (
        <div className="wb" style={box.accent ? { '--light': box.accent } : undefined}>
          <Header box={box} today={day} offline={false} />
          <div className="wb-tabs" role="tablist" aria-label="Sections">
            <button type="button" role="tab" aria-selected={tab === 'letters'} className="wb-tab" onClick={() => setTab('letters')}>Letters</button>
            <button type="button" role="tab" aria-selected={tab === 'story'} className="wb-tab" onClick={() => setTab('story')}>Our story</button>
          </div>
          <main className="wb-main">
            {tab === 'letters'
              ? items.length
                ? <><OurSky ids={[...opened]} /><Letters items={items} openSet={opened} onOpen={(id) => { setOpenId(id); setOpened((s) => new Set(s).add(id)) }} /></>
                : <p className="wb-note">Nothing written yet. Letters you write appear here on the day they open.</p>
              : <Story box={box} token="preview" today={day} onFilm={film ? playFilm : null} />}
            <p className="wb-note" style={{ marginTop: 32 }}>Letters you haven’t written yet don’t appear. Sealed ones show only their name and the day they open.</p>
            <button type="button" className="wf-link" style={{ color: 'var(--mist-soft)' }} onClick={() => setSealed(true)}>See the opening again</button>
          </main>
        </div>
      )}

      {playing && playing.photos.length > 0 && (
        <div className="wb" style={{ minHeight: 0, padding: 0, ...(box.accent ? { '--light': box.accent } : {}) }}>
          <FilmPlayer {...playing} fromName={box.fromName} title={box.appName} closing={box.welcome} onDone={() => setPlaying(null)} />
        </div>
      )}
      {current && <PreviewSheet item={current} box={box} onClose={() => setOpenId(null)} />}
    </div>
  )
}

/** The letter sheet with this device's media refs turned into viewable URLs. */
function PreviewSheet({ item, box, onClose }) {
  const photo = useMediaUrl(item.photo || null)
  const video = useMediaUrl(item.video || null)
  const voice = useMediaUrl(item.voice || null)
  const resolved = {
    ...item,
    photo: photo ? { url: photo } : null,
    video: video ? { url: video } : null,
    voice: voice ? { url: voice } : null,
  }
  return (
    <div className="wb" style={{ minHeight: 0, padding: 0, ...(box.accent ? { '--light': box.accent } : {}) }}>
      <LetterSheet item={resolved} replies={[]} toName={box.toName} fromName={box.fromName} signature={box.signature} onClose={onClose} onReply={async () => {}} preview />
    </div>
  )
}
