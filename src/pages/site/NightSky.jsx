import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from './useScrollScene'

/** One locally hosted, crossfaded video loop; no canvas, particle engine, or scroll seeking. */
export default function NightSky() {
  const video = useRef(null)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const saveData = Boolean(navigator.connection?.saveData)

  useEffect(() => {
    const el = video.current
    if (!el) return undefined
    let disposed = false
    const play = () => {
      if (!disposed && !paused && !reduced && !saveData && !document.hidden) {
        if (!el.getAttribute('src')) el.src = '/site/motion/night-sky.mp4'
        el.play().catch(() => { /* the poster remains if autoplay is unavailable */ })
      } else {
        el.pause()
      }
    }
    const ready = () => { el.dataset.ready = 'true' }
    el.addEventListener('playing', ready)
    document.addEventListener('visibilitychange', play)
    play()
    return () => {
      disposed = true
      el.pause()
      el.removeEventListener('playing', ready)
      document.removeEventListener('visibilitychange', play)
    }
  }, [paused, reduced, saveData])

  return (
    <>
      <div className="night-sky" aria-hidden="true">
        <img src="/site/motion/night-sky.webp" alt="" width="1280" height="720" fetchPriority="high" />
        <video ref={video} muted loop playsInline preload="none" poster="/site/motion/night-sky.webp" tabIndex={-1} />
        <div className="night-sky-shade" />
      </div>
      {!reduced && !saveData && (
        <button className="sky-toggle" type="button" aria-pressed={paused} aria-label={paused ? 'Play the night sky' : 'Pause the night sky'} onClick={() => setPaused(!paused)}>
          <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
            {paused ? <path d="m7 4 9 6-9 6Z" fill="currentColor" /> : <path d="M7 5v10M13 5v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
          </svg>
          <span>{paused ? 'Sky paused' : 'A little motion'}</span>
        </button>
      )}
    </>
  )
}
