import { useEffect, useRef } from 'react'

/*
 * The cinematic sky behind the landing's night scenes (hero, how it works, start).
 * Two Higgsfield clips are played as frames that follow the scroll:
 *   sky/  60 frames, a night slowly turning to blue hour over a flat horizon with one warm light
 *   fly/  40 frames, the camera tilting up from the horizon glow into deep stars
 * In front of them, stars drawn in code streak with scroll speed and the frame banks a little,
 * so scrolling feels like moving a camera. At the start scene the sky's brightest stars join
 * into an envelope. Scenes in between keep their own backgrounds and cover this layer.
 * Not mounted at all for reduced motion or data saver: the landing then looks as it did.
 */

const SKY = 60
const FLY = 40
const pad = (n) => String(n).padStart(2, '0')

// the constellation, in units of its own width: four corners and the flap's point
const ENV = { TL: [0, 0], TR: [1, 0], BR: [1, 0.56], BL: [0, 0.56], V: [0.5, 0.32] }
const ENV_LINES = [['BL', 'TL'], ['TL', 'V'], ['V', 'TR'], ['TR', 'BR'], ['BR', 'BL'], ['TL', 'TR']]

function seeded(seed) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) / 2147483647)
}

export default function Cinema({ scrollerRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const sc = scrollerRef.current
    const cv = canvasRef.current
    if (!sc || !cv) return undefined
    const cx = cv.getContext('2d')
    let alive = true

    // ── frames: the hero's first, then the fly-through, then the rest of the night
    const sky = new Array(SKY)
    const fly = new Array(FLY)
    const load = (list, dir, i) => new Promise((res) => {
      const im = new Image()
      im.decoding = 'async'
      im.onload = () => { if (alive) list[i] = im; res() }
      im.onerror = res
      im.src = `/landing/${dir}/${pad(i + 1)}.webp`
    })
    ;(async () => {
      await load(sky, 'sky', 0)
      await Promise.all(Array.from({ length: FLY }, (_, i) => load(fly, 'fly', i)))
      for (let i = 1; i < SKY && alive; i += 6) await Promise.all(Array.from({ length: 6 }, (_, k) => (i + k < SKY ? load(sky, 'sky', i + k) : null)))
    })()
    const pick = (list, f) => {
      const n = list.length
      const i = Math.max(0, Math.min(n - 1, Math.round(f)))
      for (let d = 0; d < n; d++) {
        if (list[i - d]) return list[i - d]
        if (list[i + d]) return list[i + d]
      }
      return null
    }

    // ── layout
    let W = 0, H = 0, DPR = 1, narrow = false
    let stars = []
    let tops = { how: 0, howEnd: 0, receive: 0, start: 0 }
    const measure = () => {
      DPR = Math.min(2, window.devicePixelRatio || 1)
      W = cv.clientWidth
      H = cv.clientHeight
      narrow = W <= 900
      cv.width = Math.round(W * DPR)
      cv.height = Math.round(H * DPR)
      const r = seeded(19)
      stars = []
      // depth > 1 is nearer than the footage: those smear the most when the camera moves
      ;[[90, 0.7, 0.7], [40, 1.3, 1], [14, 2.2, 1.4]].forEach(([n, d, s]) => {
        for (let i = 0; i < n; i++) stars.push({ x: r(), y: r() * 1.6 - 0.3, d, s: s * (0.5 + r() * 0.7), a: 0.25 + r() * 0.55, ph: r() * 6.28, sp: 0.6 + r() * 1.2, warm: r() < 0.1 })
      })
      measureTops()
    }
    const measureTops = () => {
      const top = (n) => sc.querySelector(`[data-scene="${n}"]`)
      const how = top(1), recv = top(2), start = top(5)
      tops = {
        how: how ? how.offsetTop : H,
        howEnd: how ? how.offsetTop + how.offsetHeight : H * 2,
        receive: recv ? recv.offsetTop : H * 2,
        start: start ? start.offsetTop : H * 6,
      }
    }

    // ── scroll speed drives the camera
    let last = sc.scrollTop
    let vel = 0
    let mx = 0, my = 0, mxT = 0, myT = 0
    const onPointer = (e) => {
      if (e.pointerType === 'touch') return
      mxT = e.clientX / window.innerWidth - 0.5
      myT = e.clientY / window.innerHeight - 0.5
    }

    const cover = (im, extra) => Math.max(W / im.width, H / im.height) * extra

    function drawFrame(im, alpha, zoom, oyFrac, roll, oyPx = 0) {
      if (!im || alpha <= 0) return
      const z = cover(im, 1.12) * zoom
      const w = im.width * z, h = im.height * z
      let ox = (W - w) / 2 - mx * 12
      let oy = (H - h) / 2 + oyFrac * H + oyPx - my * 8
      ox = Math.min(0, Math.max(W - w, ox))
      oy = Math.min(0, Math.max(H - h, oy))
      cx.save()
      cx.globalAlpha = alpha
      cx.translate(W / 2, H / 2)
      cx.rotate(roll)
      cx.translate(-W / 2, -H / 2)
      cx.drawImage(im, ox - 6, oy - 6, w + 12, h + 12)
      cx.restore()
    }

    function drawStars(t, roll, fade, scrollY) {
      const v = Math.max(-60, Math.min(60, vel))
      cx.save()
      cx.translate(W / 2, H / 2)
      cx.rotate(roll * 1.6)
      cx.translate(-W / 2, -H / 2)
      cx.lineCap = 'round'
      for (const s of stars) {
        // the camera rises as the page scrolls on, so the stars sink: the opposite of the page, which reads as depth
        let y = ((s.y * H + scrollY * 0.12 * s.d) % (H * 1.6) + H * 1.6) % (H * 1.6) - H * 0.3
        const x = s.x * W - mx * 16 * s.d
        y -= my * 10 * s.d
        if (y < -20 || y > H + 20) continue
        const tw = 0.7 + 0.3 * Math.sin(t * s.sp + s.ph)
        const a = s.a * tw * fade
        if (a < 0.02) continue
        const col = s.warm ? '255,214,150' : '236,240,250'
        const len = s.d > 1 ? -v * (s.d - 0.6) * 0.5 : 0
        if (Math.abs(len) > 1.5) {
          const g = cx.createLinearGradient(x, y, x, y + len)
          g.addColorStop(0, `rgba(${col},${a})`)
          g.addColorStop(1, `rgba(${col},0)`)
          cx.strokeStyle = g
          cx.lineWidth = s.s * 1.5
          cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x, y + len); cx.stroke()
        } else {
          cx.fillStyle = `rgba(${col},${a})`
          cx.beginPath(); cx.arc(x, y, s.s, 0, 6.283); cx.fill()
        }
      }
      cx.restore()
    }

    function glow(x, y, r, rgb, a) {
      const g = cx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(${rgb},${a})`)
      g.addColorStop(0.3, `rgba(${rgb},${a * 0.3})`)
      g.addColorStop(1, `rgba(${rgb},0)`)
      cx.fillStyle = g
      cx.fillRect(x - r, y - r, r * 2, r * 2)
    }

    function drawEnvelope(rectTop, e, t) {
      // sits in the sky above the start scene's words, moving with the section
      const w = narrow ? Math.min(W * 0.34, 150) : Math.min(W * 0.27, 400)
      const x0 = narrow ? W - w - 24 : Math.max(48, W * 0.3 - w / 2)
      const y0 = rectTop + (narrow ? 34 : H * 0.07)
      const P = {}
      for (const k in ENV) P[k] = [x0 + ENV[k][0] * w, y0 + ENV[k][1] * w]
      const ease = (u) => 1 - Math.pow(1 - u, 3)
      ENV_LINES.forEach(([a, b], i) => {
        const u = Math.max(0, Math.min(1, e * ENV_LINES.length - i))
        if (u <= 0) return
        const [x1, y1] = P[a], [x2, y2] = P[b]
        const ex = x1 + (x2 - x1) * ease(u), ey = y1 + (y2 - y1) * ease(u)
        cx.strokeStyle = 'rgba(247,207,126,0.16)'; cx.lineWidth = 5
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(ex, ey); cx.stroke()
        cx.strokeStyle = 'rgba(247,207,126,0.72)'; cx.lineWidth = 1.2
        cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(ex, ey); cx.stroke()
      })
      let i = 0
      for (const k in ENV) {
        const [x, y] = P[k]
        const lit = Math.max(0, Math.min(1, e * 3 - i * 0.35))
        const p = 0.85 + 0.15 * Math.sin(t * 2 + i)
        glow(x, y, narrow ? 16 : 26, lit > 0.5 ? '247,207,126' : '226,232,248', (0.18 + 0.32 * lit) * p)
        cx.fillStyle = lit > 0.5 ? `rgba(255,236,196,${0.95 * p})` : `rgba(238,242,250,${0.85 * p})`
        cx.beginPath(); cx.arc(x, y, narrow ? 1.8 : 2.4, 0, 6.283); cx.fill()
        i++
      }
    }

    let raf = 0
    let tick = 0
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
    const io = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    function frame(now) {
      if (!alive) return
      raf = requestAnimationFrame(frame)
      if (++tick % 30 === 0) measureTops()
      const t = now / 1000
      const y = sc.scrollTop
      vel += (y - last - vel) * 0.18
      last = y
      mx += (mxT - mx) * 0.05
      my += (myT - my) * 0.05

      // the camera banks and leans in with the scroll, then settles
      const roll = Math.max(-0.022, Math.min(0.022, vel * 0.0005))
      const lean = 1 + Math.min(0.035, Math.abs(vel) * 0.0007)

      sc.style.setProperty('--hero-out', clamp(y / Math.max(1, tops.how)).toFixed(4))
      const inTop = y < tops.receive
      const startShow = y + H > tops.start
      cx.setTransform(DPR, 0, 0, DPR, 0, 0)
      if (!inTop && !startShow) { cx.clearRect(0, 0, W, H); return }
      cx.fillStyle = '#050A19'
      cx.fillRect(0, 0, W, H)

      if (inTop) {
        // hero → how: the night deepens a little, the camera tilts up, then flies into the stars
        const hero = clamp(y / Math.max(1, tops.how))
        const f = clamp((y - tops.how * 0.35) / Math.max(1, tops.how * 0.65 + (tops.howEnd - tops.how) * 0.35))
        const tilt = io(clamp(y / Math.max(1, tops.how)))
        drawFrame(pick(sky, hero * 8), 1, lean * (1 + tilt * 0.06), tilt * 0.16, roll)
        drawFrame(pick(fly, io(f) * (FLY - 1)), clamp(f * 4), lean * (1 + 0.02 * (1 - f)), 0, roll)
        drawStars(t, roll, 0.55 + 0.45 * clamp(f * 2), y)
      } else {
        // start: blue hour and the porch light on the horizon; the route joins into an envelope
        const rectTop = tops.start - y
        const s = clamp((H - rectTop) / H)
        drawFrame(pick(sky, 40 + s * (SKY - 41)), 1, lean, 0, roll, rectTop * 0.35 + (narrow ? H * 0.05 : H * 0.08))
        drawStars(t, roll, 0.55, y)
        const e = clamp((s - 0.45) / 0.5)
        if (e > 0) drawEnvelope(rectTop, io(e), t)
      }
    }

    measure()
    raf = requestAnimationFrame(frame)
    const ro = new ResizeObserver(measure)
    ro.observe(sc)
    window.addEventListener('resize', measure)
    window.addEventListener('pointermove', onPointer, { passive: true })
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else { cancelAnimationFrame(raf); last = sc.scrollTop; raf = requestAnimationFrame(frame) }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      sc.style.removeProperty('--hero-out')
      window.removeEventListener('resize', measure)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [scrollerRef])

  return <canvas ref={canvasRef} className="wya-cinema" aria-hidden="true" />
}
