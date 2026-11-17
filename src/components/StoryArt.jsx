import { hash, mix } from '../utils/design/storyDesign'

/*
 * Pieces drawn from the senders' story: their months as a pattern, a stamp per moment, a seal.
 * Used by the recipient box (see utils/design/boxLook.js) and the design lab.
 * `spec` needs { pattern, palette }; boxLook() hands over exactly that.
 */

const polar = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)]
function arc(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0)
  const [x1, y1] = polar(cx, cy, r, a1)
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

/** Their months as a pattern: tree rings (one ring a year) or a ribbon (one bar a month). */
export function ChatPattern({ spec, size = 180, light = false }) {
  const { pattern } = spec
  const p = spec.palette
  const a1 = light ? p.accentRaw : p.accent
  const a2 = light ? p.accent2Raw : p.accent2
  const max = Math.max(1, ...pattern.months.map((m) => m.count))
  const callDots = Math.min(40, Math.round(Math.sqrt(pattern.calls / 60) * 3))
  if (pattern.kind === 'rings') {
    const c = size / 2
    const years = Math.ceil(pattern.months.length / 12)
    return (
      <svg className="dl-pattern" viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
        {pattern.months.map((m, i) => {
          const ring = Math.floor(i / 12)
          const r = 22 + ring * ((c - 30) / Math.max(1, years))
          const s0 = -Math.PI / 2 + ((i % 12) / 12) * Math.PI * 2 + 0.04
          const s1 = s0 + (Math.PI * 2) / 12 - 0.08
          return <path key={m.month} d={arc(c, c, r, s0, s1)} stroke={mix(a1, a2, ring / Math.max(1, years - 1))} strokeWidth={1.5 + (m.count / max) * 9} strokeLinecap="round" fill="none" opacity={0.35 + (m.count / max) * 0.65} />
        })}
        {Array.from({ length: callDots }, (_, i) => {
          const [x, y] = polar(c, c, c - 6, (i / callDots) * Math.PI * 2)
          return <circle key={i} cx={x} cy={y} r="1.8" fill={a1} />
        })}
        {Array.from({ length: Math.min(8, Math.round(pattern.late / 18)) }, (_, i) => {
          const [x, y] = polar(c, c, 8 + (i % 3) * 3, i * 2.4)
          return <circle key={`s${i}`} cx={x} cy={y} r="1.2" fill={a2} />
        })}
      </svg>
    )
  }
  const w = size * 1.4
  const h = size * 0.6
  const bw = w / pattern.months.length
  return (
    <svg className="dl-pattern" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {pattern.months.map((m, i) => {
        const bh = 6 + (m.count / max) * (h - 22)
        return <rect key={m.month} x={i * bw + 1} y={(h - bh) / 2} width={Math.max(2, bw - 3)} height={bh} rx={Math.min(4, bw / 2)} fill={i % 2 ? a2 : a1} opacity={0.45 + (m.count / max) * 0.55} />
      })}
      {Array.from({ length: callDots }, (_, i) => <circle key={i} cx={(i + 0.5) * (w / Math.max(1, callDots))} cy={h - 4} r="1.6" fill={light ? '#F4F1E6' : p.ink} opacity=".5" />)}
    </svg>
  )
}

export function StoryStamp({ stamp, size = 70 }) {
  return (
    <svg className="dl-stamp" viewBox="0 0 60 74" width={size} height={size * 1.23} style={{ '--tilt': `${stamp.tilt}deg` }} aria-hidden="true">
      <rect x="3" y="3" width="54" height="68" fill={stamp.color} />
      <rect x="3" y="3" width="54" height="68" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="0.1 5.9" strokeLinecap="round" />
      <rect x="8" y="8" width="44" height="46" fill="#FFFCF4" />
      <image href={`/stickers/${stamp.sticker}.svg`} x="14" y="12" width="32" height="32" />
      {stamp.date && <text x="30" y="51" textAnchor="middle" fontSize="5.4" fontWeight="600" fill="#6B5B45" fontFamily="'IBM Plex Sans KR', sans-serif">{stamp.date.replace(/-/g, '.')}</text>}
      <text x="30" y="65" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="'Gowun Dodum', sans-serif">{stamp.text.slice(0, 9)}</text>
    </svg>
  )
}

export function Seal({ seal, size = 74 }) {
  const id = `seal-${hash(seal.text)}`
  const ring = `${seal.text} · `.repeat(seal.text.length < 5 ? 4 : 2)
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="dl-seal" aria-hidden="true">
      <defs><path id={id} d="M50 50 m -34 0 a 34 34 0 1 1 68 0 a 34 34 0 1 1 -68 0" /></defs>
      <circle cx="50" cy="50" r="46" fill={seal.color} />
      <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.2" />
      <text fontSize="9" fill="#fff" letterSpacing="1.5" fontFamily="'Gowun Dodum', sans-serif"><textPath href={`#${id}`}>{ring}</textPath></text>
      <text x="50" y="58" textAnchor="middle" fontSize="22" fill="#fff" fontFamily="'Gowun Batang', serif" fontWeight="700">{seal.initials}</text>
    </svg>
  )
}


/** 와 after a vowel, 과 after a final consonant (지수와, 민준과). */
function withParticle(name) {
  const c = String(name).trim().slice(-1).charCodeAt(0) - 0xac00
  return c >= 0 && c < 11172 && c % 28 ? '과' : '와'
}

/** The top of the recipient's path: their seal, their months as a pattern, a stamp for each moment opened so far. */
export function StoryHero({ look, fromName, toName }) {
  const months = look.pattern.months.length
  const ko = /[가-힣]/.test(`${fromName}${toName}`)
  return (
    <div className="la-hero">
      <div className="la-hero-row">
        <Seal seal={look.seal} size={60} />
        {months > 1 && <ChatPattern spec={look} size={look.pattern.kind === 'rings' ? 124 : 104} light />}
      </div>
      {look.stamps.length > 0 && <div className="la-hero-stamps">{look.stamps.map((st) => <StoryStamp key={st.memory} stamp={st} size={44} />)}</div>}
      {months > 1 && <p className="la-hero-cap">{ko ? `${fromName}${withParticle(fromName)} ${toName}의 ${months}달` : `${fromName} and ${toName}, ${months} months of messages`}</p>}
    </div>
  )
}
