import { useCallback, useEffect, useRef, useState } from 'react'
import { slideSeconds } from '../utils/film'
import '../styles/film.css'

/*
 * The first-night film: a title card, the photos one by one with a line each,
 * the sender's voice underneath, then the way into the letters.
 * `photos` = [{ id, url, caption }], `voiceUrl` optional.
 */
export default function FilmPlayer({ photos, voiceUrl, fromName, title, closing, onDone, doneLabel = 'Open your letters' }) {
  const [step, setStep] = useState(-1) // -1 title, 0..n-1 photos, n end
  const [paused, setPaused] = useState(false)
  const [voiceSec, setVoiceSec] = useState(0)
  const [needsTap, setNeedsTap] = useState(false)
  const audio = useRef(null)
  const n = photos.length
  const per = slideSeconds(n, voiceSec)
  const atEnd = step >= n

  // preload every photo so the crossfades never wait
  useEffect(() => {
    photos.forEach((p) => { const img = new Image(); img.src = p.url })
  }, [photos])

  // advance on a timer
  useEffect(() => {
    if (paused || atEnd) return undefined
    const ms = step === -1 ? 3200 : per * 1000
    const t = setTimeout(() => setStep((s) => s + 1), ms)
    return () => clearTimeout(t)
  }, [step, paused, atEnd, per])

  // voice starts with the first photo
  useEffect(() => {
    const a = audio.current
    if (!a) return
    if (step === 0 && !paused) {
      a.play().catch(() => setNeedsTap(true))
    }
    if (paused) a.pause()
  }, [step, paused])

  useEffect(() => {
    if (atEnd && audio.current) {
      const a = audio.current
      // let the voice finish, then fade it
      const fade = setInterval(() => {
        if (a.ended || a.paused) return clearInterval(fade)
        if (a.duration - a.currentTime < 2) a.volume = Math.max(0, a.volume - 0.1)
      }, 200)
      return () => clearInterval(fade)
    }
    return undefined
  }, [atEnd])

  const finish = useCallback(() => {
    audio.current?.pause()
    onDone()
  }, [onDone])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight') setStep((s) => Math.min(n, s + 1))
      if (e.key === 'ArrowLeft') setStep((s) => Math.max(-1, s - 1))
      if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [finish, n])

  const tapZone = (dir) => () => setStep((s) => Math.max(-1, Math.min(n, s + dir)))
  const startSound = () => {
    setNeedsTap(false)
    audio.current?.play().catch(() => {})
  }

  return (
    <div className="wfm" role="dialog" aria-modal="true" aria-label={`A short film from ${fromName || 'me'}`}>
      {voiceUrl && <audio ref={audio} src={voiceUrl} preload="auto" onLoadedMetadata={(e) => setVoiceSec(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} />}

      <div className={`wfm-card${step === -1 ? ' is-on' : ''}`} aria-hidden={step !== -1}>
        <p className="wfm-quiet">From {fromName || 'me'}</p>
        <p className="wfm-title">{title || 'Before your letters'}</p>
        <span className="wfm-light" aria-hidden="true" />
      </div>

      {photos.map((p, i) => (
        <figure key={p.id} className={`wfm-slide${i === step ? ' is-on' : ''}${i === step - 1 ? ' is-prev' : ''}`} aria-hidden={i !== step} style={{ '--dur': `${per + 1.4}s` }}>
          <img src={p.url} alt={p.caption || `Photo ${i + 1}`} />
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      ))}

      <div className={`wfm-card${atEnd ? ' is-on' : ''}`} aria-hidden={!atEnd}>
        {closing && <p className="wfm-closing">{closing}</p>}
        <button type="button" className="wfm-go" onClick={finish} tabIndex={atEnd ? 0 : -1}>{doneLabel}</button>
        <button type="button" className="wfm-again" onClick={() => { if (audio.current) { audio.current.currentTime = 0; audio.current.volume = 1 } setStep(-1) }} tabIndex={atEnd ? 0 : -1}>Watch again</button>
      </div>

      {!atEnd && (
        <>
          <button type="button" className="wfm-zone wfm-zone--prev" onClick={tapZone(-1)} aria-label="Previous" />
          <button type="button" className="wfm-zone wfm-zone--next" onClick={tapZone(1)} aria-label="Next" />
          <div className="wfm-bar" aria-hidden="true">
            {photos.map((p, i) => (
              <span key={p.id} className={i < step ? 'is-done' : i === step ? 'is-now' : ''} style={i === step ? { '--dur': `${per}s`, animationPlayState: paused ? 'paused' : 'running' } : undefined} />
            ))}
          </div>
          <div className="wfm-controls">
            {needsTap && voiceUrl && <button type="button" className="wfm-ctl wfm-ctl--sound" onClick={startSound}>Tap for {fromName ? `${fromName}’s` : 'my'} voice</button>}
            <button type="button" className="wfm-ctl" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play' : 'Pause'}>
              {paused
                ? <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor"><rect x="3.5" y="2.5" width="3" height="11" rx="1" /><rect x="9.5" y="2.5" width="3" height="11" rx="1" /></svg>}
            </button>
            <button type="button" className="wfm-ctl" onClick={finish}>Skip</button>
          </div>
        </>
      )}
    </div>
  )
}
