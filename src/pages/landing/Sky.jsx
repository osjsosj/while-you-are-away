import { useMemo } from 'react'

/* Procedural country night sky: a seeded star field with a milky-way band,
   twinkling bright stars, rare shooting stars and two pine ridgelines. */

function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 1440
const H = 900

function makeStars(seed, dense) {
  const r = seeded(seed)
  const uni = (a, b) => a + (b - a) * r()
  const gauss = () => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r())
  const color = (warm) => (warm ? '#FFF4DE' : r() < 0.5 ? '#E8EEFF' : '#FFFFFF')

  const tiny = []
  for (let i = 0; i < (dense ? 520 : 260); i++) {
    let x, y
    if (dense && r() < 0.55) {
      const t = r()
      x = -100 + t * 1640
      y = 520 - t * 470 + gauss() * 55
    } else {
      x = uni(0, W)
      y = uni(0, H * 0.78)
    }
    tiny.push({ x, y, r: uni(0.35, 0.7), o: uni(0.25, 0.7), c: color(false) })
  }
  const mid = []
  for (let i = 0; i < (dense ? 140 : 80); i++) {
    mid.push({ x: uni(0, W), y: uni(0, H * 0.74), r: uni(0.7, 1.1), o: uni(0.5, 0.9), c: color(r() < 0.15) })
  }
  const bright = { a: [], b: [], c: [] }
  for (let i = 0; i < (dense ? 26 : 16); i++) {
    const k = ['a', 'b', 'c'][Math.floor(r() * 3)]
    bright[k].push({ x: uni(0, W), y: uni(0, H * 0.7), r: uni(1.2, 1.9), c: color(r() < 0.3) })
  }
  return { tiny, mid, bright }
}

function ridge({ y0, amp, seed, trees, density = 0.6, hmin = 6, hmax = 30 }) {
  const r = seeded(seed * 7919)
  const uni = (a, b) => a + (b - a) * r()
  const pts = []
  for (let x = -10; x <= W + 10; x += uni(3, 7)) {
    pts.push([x, y0 + amp * Math.sin(x / 260 + seed) + amp * 0.5 * Math.sin(x / 97 + seed * 2)])
  }
  const f = (n) => n.toFixed(1)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (const [x, y] of pts.slice(1)) {
    const grove = (Math.sin(x / 140 + seed * 3) + Math.sin(x / 61 + seed)) * 0.5
    const p = density * (0.15 + 0.85 * Math.max(0, grove + 0.25))
    if (trees && r() < p) {
      const th = uni(hmin, hmax) * (0.6 + 0.6 * Math.max(0, grove))
      const tw = th * uni(0.18, 0.28)
      const ln = uni(-0.8, 0.8)
      d += ` L${f(x - tw)} ${f(y)}`
      d += ` L${f(x - tw * 0.55 + ln * 0.3)} ${f(y - th * 0.45)} L${f(x - tw * 0.75 + ln * 0.4)} ${f(y - th * 0.42)}`
      d += ` L${f(x - tw * 0.3 + ln * 0.6)} ${f(y - th * 0.75)} L${f(x - tw * 0.45 + ln * 0.7)} ${f(y - th * 0.72)}`
      d += ` L${f(x + ln)} ${f(y - th)}`
      d += ` L${f(x + tw * 0.45 + ln * 0.7)} ${f(y - th * 0.72)} L${f(x + tw * 0.3 + ln * 0.6)} ${f(y - th * 0.75)}`
      d += ` L${f(x + tw * 0.75 + ln * 0.4)} ${f(y - th * 0.42)} L${f(x + tw * 0.55 + ln * 0.3)} ${f(y - th * 0.45)}`
      d += ` L${f(x + tw)} ${f(y)}`
    } else {
      d += ` L${f(x)} ${f(y)}`
    }
  }
  return `${d} L${W + 10} ${H} L-10 ${H} Z`
}

const Dots = ({ list }) =>
  list.map((s, i) => <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill={s.c} opacity={s.o.toFixed(2)} />)

const Bright = ({ list }) =>
  list.map((s, i) => (
    <g key={i}>
      <circle cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={(s.r * 4).toFixed(1)} fill="url(#wyaStarGlow)" opacity="0.55" />
      <circle cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill={s.c} opacity="0.95" />
    </g>
  ))

export function HeroSky({ farRef, nearRef }) {
  const { stars, back, front } = useMemo(
    () => ({
      stars: makeStars(11, true),
      back: ridge({ y0: 748, amp: 16, seed: 3, trees: true, density: 0.35, hmin: 5, hmax: 16 }),
      front: ridge({ y0: 806, amp: 9, seed: 5, trees: true, density: 0.75, hmin: 8, hmax: 42 }),
    }),
    [],
  )
  const hx = 1112
  const hy = 800
  return (
    <div className="wya-sky" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="wyaStarGlow">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wyaBand" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#C9D3F0" stopOpacity="0.16" />
            <stop offset="0.6" stopColor="#9AA9D6" stopOpacity="0.06" />
            <stop offset="1" stopColor="#9AA9D6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wyaHorizon" cx="0.5" cy="1" r="0.6">
            <stop offset="0" stopColor="#3B3F6B" stopOpacity="0.85" />
            <stop offset="1" stopColor="#3B3F6B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wyaWindow">
            <stop offset="0" stopColor="#F7C566" stopOpacity="0.75" />
            <stop offset="0.35" stopColor="#F0B341" stopOpacity="0.18" />
            <stop offset="1" stopColor="#F0B341" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wyaTail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <ellipse cx="720" cy="900" rx="900" ry="260" fill="url(#wyaHorizon)" />
        <g ref={farRef} className="wya-par">
          <ellipse cx="700" cy="300" rx="900" ry="120" fill="url(#wyaBand)" transform="rotate(-17 700 300)" />
          <ellipse cx="760" cy="270" rx="520" ry="54" fill="url(#wyaBand)" transform="rotate(-17 760 270)" />
          <Dots list={stars.tiny} />
        </g>
        <g ref={nearRef} className="wya-par">
          <Dots list={stars.mid} />
          <g className="wya-tw-a"><Bright list={stars.bright.a} /></g>
          <g className="wya-tw-b"><Bright list={stars.bright.b} /></g>
          <g className="wya-tw-c"><Bright list={stars.bright.c} /></g>
        </g>
        {[
          ['wya-shoot-1', 150, 1.4, 1.6],
          ['wya-shoot-2', 110, 1.1, 1.2],
          ['wya-shoot-3', 180, 1.2, 1.4],
        ].map(([cls, len, sw, head]) => (
          <g key={cls} className={`wya-shoot ${cls}`}>
            <line x1="0" y1="0" x2={len} y2="0" stroke="url(#wyaTail)" strokeWidth={sw} strokeLinecap="round" />
            <circle cx={len} cy="0" r={head} fill="#FFFFFF" />
          </g>
        ))}
        <path d={back} fill="#0D1530" />
        <path d={front} fill="#060A16" />
        <circle cx={hx + 4} cy={hy - 6} r="30" fill="url(#wyaWindow)" className="wya-window-glow" />
        <path d={`M${hx - 10} ${hy} L${hx - 10} ${hy - 10} L${hx + 2} ${hy - 18} L${hx + 14} ${hy - 10} L${hx + 14} ${hy} Z`} fill="#060A16" />
        <rect x={hx + 2} y={hy - 8} width="4" height="4" fill="#F5C063" />
      </svg>
    </div>
  )
}

export function EndSky() {
  const stars = useMemo(() => makeStars(29, false), [])
  return (
    <div className="wya-sky" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin slice">
        <defs>
          <radialGradient id="wyaStarGlow2">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <Dots list={stars.tiny} />
        <Dots list={stars.mid} />
        <g className="wya-tw-b">
          {[...stars.bright.a, ...stars.bright.b, ...stars.bright.c].map((s, i) => (
            <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill={s.c} opacity="0.9" />
          ))}
        </g>
      </svg>
    </div>
  )
}

export function Grain({ id }) {
  return (
    <svg className="wya-grain" aria-hidden="true">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  )
}

export function Sundial({ hour, active, scenes }) {
  const hh = ((hour % 24) + 24) % 24
  const deg = ((hh - 12) / 24) * 360
  const day = Math.max(0, Math.min(1, (Math.cos(((hh - 12) / 24) * 2 * Math.PI) + 0.15) / 0.5))
  const H24 = Math.floor(hh)
  const M = Math.floor(((hh - H24) * 60) / 5) * 5
  const time = `${H24 % 12 === 0 ? 12 : H24 % 12}:${M < 10 ? '0' : ''}${M} ${H24 < 12 ? 'AM' : 'PM'}`
  const label = scenes[active].time
  return (
    <div className="wya-dial" role="img" aria-label={`Time of day: ${time}, ${label.toLowerCase()}`}>
      <svg width="60" height="60" viewBox="-46 -46 92 92" aria-hidden="true">
        <defs>
          <radialGradient id="wyaSun">
            <stop offset="0" stopColor="#F7C566" stopOpacity="0.9" />
            <stop offset="1" stopColor="#F0B341" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="wyaDialNight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#25335A" />
            <stop offset="0.5" stopColor="#141D3A" />
            <stop offset="1" stopColor="#0A1022" />
          </linearGradient>
          <linearGradient id="wyaDialDay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7FA7CF" />
            <stop offset="0.5" stopColor="#B9D0E4" />
            <stop offset="0.5" stopColor="#3A4A3F" />
            <stop offset="1" stopColor="#242E28" />
          </linearGradient>
        </defs>
        <circle r="42" fill="url(#wyaDialNight)" stroke="rgba(233,236,242,0.25)" strokeWidth="1.5" />
        <circle r="41" fill="url(#wyaDialDay)" opacity={day.toFixed(2)} style={{ transition: 'opacity 600ms ease' }} />
        <path d="M -42 0 A 42 42 0 0 1 42 0" fill="none" stroke="#F0B341" strokeOpacity="0.45" strokeWidth="2.5" />
        <line x1="-42" y1="0" x2="42" y2="0" stroke="rgba(233,236,242,0.25)" strokeDasharray="3 4" strokeWidth="1.5" />
        {scenes.map((s, i) => {
          const a = (((s.hour % 24) - 12) / 24) * 2 * Math.PI
          const on = i === active
          return <circle key={s.name} cx={(42 * Math.sin(a)).toFixed(1)} cy={(-42 * Math.cos(a)).toFixed(1)} r={on ? 4.5 : 2.8} fill={on ? '#F0B341' : 'rgba(233,236,242,0.6)'} />
        })}
        <g transform={`rotate(${deg.toFixed(1)})`}>
          <line x1="0" y1="0" x2="0" y2="-24" stroke="rgba(233,236,242,0.7)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="0" cy="-32" r="14" fill="url(#wyaSun)" opacity={day.toFixed(2)} />
          <circle cx="0" cy="-32" r="7" fill="#F5C063" opacity={day.toFixed(2)} />
          <circle cx="0" cy="-32" r="7" fill="#E9ECF2" opacity={(1 - day).toFixed(2)} />
          <circle cx="3.4" cy="-34" r="6" fill="#141D3A" opacity={(1 - day).toFixed(2)} />
        </g>
        <circle r="3.5" fill="#E9ECF2" />
      </svg>
      <div className="wya-dial-text">
        <span className="wya-dial-time">{time}</span>
        <span className="wya-dial-label">{label}</span>
      </div>
    </div>
  )
}
