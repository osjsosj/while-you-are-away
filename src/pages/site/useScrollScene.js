import { useEffect, useRef, useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'
const subscribe = (listener) => {
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}
const snapshot = () => window.matchMedia(QUERY).matches

export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => true)
}

const clamp = (n) => Math.max(0, Math.min(1, n))

/** Native scrolling owns the page. Only the visible scene schedules a single frame. */
export default function useScrollScene() {
  const scene = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = scene.current
    if (!node || reduced) return undefined
    let frame = 0
    let visible = true
    const update = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      const p = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight))
      node.style.setProperty('--journey-progress', p.toFixed(4))
    }
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(update)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) schedule()
    })
    observer.observe(node)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [reduced])

  return { scene }
}
