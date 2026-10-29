import { useEffect, useRef, useState } from 'react'
import { uploadMedia, NeedSignInError, useMediaUrl, signedUrl } from '../utils/media'
import { useRecorder, fmtSeconds } from '../utils/useRecorder'
import { FILM_MAX_PHOTOS, normalizeFilm } from '../utils/film'
import { formatLong } from '../utils/diary'
import SignInModal from './SignInModal'
import FilmPlayer from './FilmPlayer'

/* Build the first-night film: photos with a line each, and a voice note to play underneath. */

const newId = () => `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export default function FilmEditor({ film: raw, onChange, toName, fromName, startDate, title, closing }) {
  const film = normalizeFilm(raw)
  const input = useRef(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(null) // { kind: 'photos', files } | { kind: 'voice', blob }
  const [watching, setWatching] = useState(null)
  const latest = useRef(film)
  useEffect(() => { latest.current = film })

  const save = (patch) => onChange({ ...latest.current, ...patch })

  const addPhotos = async (files) => {
    const room = FILM_MAX_PHOTOS - latest.current.photos.length
    const list = files.slice(0, room)
    if (files.length > room) setError(`A film holds up to ${FILM_MAX_PHOTOS} photos, so the last ${files.length - room} weren’t added.`)
    else setError('')
    for (let i = 0; i < list.length; i++) {
      setBusy(`Saving photo ${i + 1} of ${list.length}…`)
      try {
        const ref = await uploadMedia(list[i])
        const next = [...latest.current.photos, { id: newId(), photo: ref, caption: '' }]
        latest.current = { ...latest.current, photos: next }
        save({ photos: next })
      } catch (err) {
        setBusy('')
        if (err instanceof NeedSignInError) return setPending({ kind: 'photos', files: list.slice(i) })
        return setError(err.message || 'A photo didn’t upload. Try again.')
      }
    }
    setBusy('')
  }

  const saveVoice = async (blob) => {
    setBusy('Saving your voice…')
    setError('')
    try {
      save({ voice: await uploadMedia(blob) })
    } catch (err) {
      if (err instanceof NeedSignInError) setPending({ kind: 'voice', blob })
      else setError(err.message || 'The voice note didn’t save. Try again.')
    } finally {
      setBusy('')
    }
  }
  const rec = useRecorder(saveVoice)

  const setPhoto = (id, patch) => save({ photos: film.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const move = (i, dir) => {
    const next = [...film.photos]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    save({ photos: next })
  }
  const remove = (id) => save({ photos: film.photos.filter((p) => p.id !== id) })

  const watch = async () => {
    setBusy('Getting the film ready…')
    const photos = await Promise.all(film.photos.map(async (p) => ({ id: p.id, caption: p.caption, url: await signedUrl(p.photo) })))
    const voiceUrl = film.voice ? await signedUrl(film.voice) : null
    setBusy('')
    setWatching({ photos: photos.filter((p) => p.url), voiceUrl })
  }

  return (
    <section className="we-section we-film" aria-labelledby="we-film">
      <div className="we-section-head">
        <div>
          <h2 id="we-film" className="wf-h2">A short film for the first night</h2>
          <p className="wf-note">
            A few photos, a line under each, and your voice. It plays the first time {toName ? `${toName} opens` : 'they open'} the box{startDate ? ` on ${formatLong(startDate)}` : ''}, before any letter.
          </p>
        </div>
      </div>

      {film.photos.length > 0 && (
        <ol className="we-film-grid">
          {film.photos.map((p, i) => (
            <FilmPhoto key={p.id} item={p} index={i} count={film.photos.length} onCaption={(caption) => setPhoto(p.id, { caption })} onMove={(d) => move(i, d)} onRemove={() => remove(p.id)} />
          ))}
        </ol>
      )}

      <div className="we-film-actions">
        {film.photos.length < FILM_MAX_PHOTOS && (
          <button type="button" className="wm-btn we-film-btn" onClick={() => input.current?.click()} disabled={!!busy}>
            + {film.photos.length ? 'Add more photos' : 'Choose photos'}
          </button>
        )}
        <button type="button" className={`wm-btn we-film-btn${rec.recording ? ' wm-btn--rec' : ''}`} onClick={rec.recording ? rec.stop : rec.start} disabled={!!busy && !rec.recording} aria-pressed={rec.recording}>
          {rec.recording ? `Stop · ${fmtSeconds(rec.seconds)}` : film.voice ? 'Record your voice again' : 'Record your voice'}
        </button>
        {film.photos.length > 0 && (
          <button type="button" className="wf-btn wf-btn--small" onClick={watch} disabled={!!busy}>Watch it</button>
        )}
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { const f = [...(e.target.files || [])]; e.target.value = ''; if (f.length) addPhotos(f) }} />
      </div>

      {film.voice && <VoiceRow refValue={film.voice} onRemove={() => save({ voice: null })} />}
      {!film.voice && film.photos.length > 0 && <p className="wf-note" style={{ marginTop: 10 }}>Thirty seconds to a minute works well. The photos slow down to follow your voice.</p>}
      {busy && <p className="wf-note" role="status" style={{ marginTop: 10 }}>{busy}</p>}
      {(error || rec.error) && <p className="wf-error" role="alert">{error || rec.error}</p>}

      {pending && (
        <SignInModal
          onClose={() => setPending(null)}
          onDone={() => { const p = pending; setPending(null); if (p.kind === 'photos') addPhotos(p.files); else saveVoice(p.blob) }}
        />
      )}
      {watching && (
        <FilmPlayer {...watching} fromName={fromName} title={title} closing={closing} doneLabel="Back to writing" onDone={() => setWatching(null)} />
      )}
    </section>
  )
}

function FilmPhoto({ item, index, count, onCaption, onMove, onRemove }) {
  const url = useMediaUrl(item.photo)
  const [caption, setCaption] = useState(item.caption)
  return (
    <li className="we-film-item">
      <div className="we-film-thumb">
        {url ? <img src={url} alt={`Photo ${index + 1}`} /> : <span className="wm-loading" />}
        <span className="we-film-num" aria-hidden="true">{index + 1}</span>
      </div>
      <label className="wf-sr" htmlFor={`we-cap-${item.id}`}>Line under photo {index + 1}</label>
      <input id={`we-cap-${item.id}`} className="we-film-cap" value={caption} maxLength={120} placeholder="A line under it (optional)" onChange={(e) => setCaption(e.target.value)} onBlur={() => caption !== item.caption && onCaption(caption)} />
      <div className="we-film-tools">
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move photo ${index + 1} earlier`}>←</button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label={`Move photo ${index + 1} later`}>→</button>
        <button type="button" onClick={onRemove} className="we-film-del">Remove</button>
      </div>
    </li>
  )
}

function VoiceRow({ refValue, onRemove }) {
  const url = useMediaUrl(refValue)
  return (
    <div className="we-film-voice">
      <span className="wf-note">Your voice, under the film</span>
      {url ? <audio src={url} controls preload="metadata" /> : <span className="wm-loading" />}
      <button type="button" className="wf-link we-small-link" onClick={onRemove}>Remove</button>
    </div>
  )
}
