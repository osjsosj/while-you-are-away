import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/*
 * The top bar as a liquid-glass panel (liquid-glass-js, vendored in /public/vendor/liquid-glass).
 * The library refracts one html2canvas snapshot of the page, so the snapshot is retaken whenever the page under
 * the bar changes: a new route, a resize, or the page growing or shrinking. Where WebGL, the snapshot or the
 * GPU's texture size falls short, the bar stays the plain translucent one.
 */

const BASE = '/vendor/liquid-glass/'
let loading = null

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function loadGlass() {
  if (!loading) {
    loading = loadScript(`${BASE}html2canvas.min.js`)
      .then(() => loadScript(`${BASE}container.js`))
      .then(() => loadScript(`${BASE}button.js`))
  }
  return loading
}

// The page snapshot becomes one WebGL texture, so the whole page has to fit in the GPU's limit
function glassFits() {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return false
    const max = gl.getParameter(gl.MAX_TEXTURE_SIZE)
    const page = document.documentElement
    return Math.max(page.scrollHeight, document.body.scrollHeight) <= max && page.scrollWidth <= max
  } catch {
    return false
  }
}

export default function useGlassNav(barRef) {
  const { pathname } = useLocation()
  const [panel, setPanel] = useState(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar || window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return undefined
    let alive = true
    let current = null
    let timer = null
    let lastHeight = 0

    const retire = (inst) => {
      if (!inst) return
      inst.gl_refs.gl = null // its scroll listener now returns early
      inst.element.remove()
    }

    const build = async () => {
      try {
        await loadGlass()
        await document.fonts.ready
      } catch {
        return
      }
      if (!alive || !glassFits()) {
        retire(current)
        current = null
        setPanel(null)
        return
      }
      const C = window.Container
      // reveal-on-scroll content is still hidden when the snapshot is taken; show it in the copy only
      C.onclone = (doc) => doc.querySelectorAll('[data-rise]').forEach((el) => el.setAttribute('data-rise', 'in'))
      C.pageSnapshot = null
      C.isCapturing = false
      C.waitingForSnapshot = []
      C.instances = []
      const radius = window.matchMedia('(max-width: 560px)').matches ? 18 : 22
      const next = new C({ type: 'rounded', borderRadius: radius, tintOpacity: 0.16 })
      next.element.classList.add('ws-glass')
      bar.appendChild(next.element)
      const prev = current
      current = next
      lastHeight = document.documentElement.scrollHeight
      setPanel(next.element)
      retire(prev)
      // mark the panel ready once the library has its texture, so the solid fallback can fade out
      const started = performance.now()
      const watch = () => {
        if (!alive || current !== next) return
        if (next.webglInitialized) {
          next.updateSizeFromDOM()
          requestAnimationFrame(() => requestAnimationFrame(() => { next.render?.(); next.element.dataset.ready = 'true' }))
        } else if (performance.now() - started < 8000) requestAnimationFrame(watch)
      }
      requestAnimationFrame(watch)
    }

    const later = (ms) => {
      clearTimeout(timer)
      timer = setTimeout(build, ms)
    }
    later(400)

    const onResize = () => later(400)
    window.addEventListener('resize', onResize)
    // the page under the bar changed length (an answer opened, a letter switched): retake the snapshot
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight
      if (current && Math.abs(h - lastHeight) > 4) later(800)
    })
    ro.observe(document.body)

    return () => {
      alive = false
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      ro.disconnect()
      retire(current)
      setPanel(null)
    }
  }, [barRef, pathname])

  // the panel's canvas follows its content's size
  useEffect(() => {
    if (!panel) return undefined
    const inst = window.Container?.instances?.find((i) => i.element === panel)
    if (!inst) return undefined
    const ro = new ResizeObserver(() => { inst.updateSizeFromDOM(); requestAnimationFrame(() => inst.render?.()) })
    ro.observe(panel)
    return () => ro.disconnect()
  }, [panel])

  return panel
}
