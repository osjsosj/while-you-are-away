import { Motif, Postmark, TicketBanner } from '../../components/Decor'
import { hash, mix, letterLayout } from '../../utils/design/storyDesign'

/* Drawing pieces for the design lab: how a design spec looks on screen. Dev only. */

function rngFrom(s) {
  let a = hash(s) || 1
  return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296 }
}

/** A clip-path for the paper's edge: straight, deckled (soft), or torn along the bottom. */
function edgePath(edge, key) {
  if (edge === 'straight') return 'none'
  const r = rngFrom(key)
  const n = 22
  const amp = edge === 'torn' ? 0.9 : 0.5
  const pts = []
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${r() * amp}%`)
  for (let i = 1; i <= n; i++) pts.push(`${100 - r() * amp}% ${(i / n) * 100}%`)
  for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - (edge === 'torn' ? (i % 2 ? 1.2 : 3.4) * r() + 0.4 : r() * amp)}%`)
  for (let i = n - 1; i > 0; i--) pts.push(`${r() * amp}% ${(i / n) * 100}%`)
  return `polygon(${pts.join(',')})`
}

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 .9 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>')}")`

const STAINS = {
  coffee: 'radial-gradient(circle at 84% 92%, transparent 0 46px, rgba(122,82,54,.22) 47px 50px, rgba(122,82,54,.06) 51px 56px, transparent 57px)',
  tea: 'radial-gradient(circle at 84% 92%, transparent 0 44px, rgba(110,140,70,.2) 45px 48px, transparent 49px)',
  rain: 'radial-gradient(circle at 18% 78%, rgba(90,110,140,.14) 0 9px, transparent 10px), radial-gradient(circle at 27% 88%, rgba(90,110,140,.12) 0 6px, transparent 7px), radial-gradient(circle at 80% 20%, rgba(90,110,140,.1) 0 8px, transparent 9px)',
}

/** The paper itself: tint, age, stain, edge. Ruled lines live on the text block so they meet the words. */
function paperStyle(spec, key) {
  const { palette: p, paper } = spec
  const dots = paper.lines === 'dots' ? `, radial-gradient(${p.line} 1px, transparent 1.4px) 0 0 / 18px 18px` : ''
  return {
    '--paper': mix(p.paper, '#E8D7B0', paper.grain * 0.35),
    '--grain': paper.grain,
    '--grain-img': GRAIN,
    backgroundImage: `${STAINS[paper.stain] || 'none'}${dots}`,
    clipPath: edgePath(paper.edge, key),
  }
}

/** Ruled lines under the text, one per line of type. */
function ruledStyle(spec, gap) {
  if (spec.paper.lines === 'none' || spec.paper.lines === 'dots') return {}
  return { backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${gap - 1}px, ${spec.palette.line} ${gap - 1}px ${gap}px)` }
}

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

export function Deco({ deco, spec, tilt = 0 }) {
  if (deco.kind === 'ticket') return <div className="dl-deco dl-deco--ticket"><TicketBanner ticket={{ kind: deco.transport, title: deco.title.slice(0, 20), line: deco.date ? deco.date.replace(/-/g, '.') : '' }} /></div>
  if (deco.kind === 'postmark') return <div className="dl-deco dl-deco--postmark" style={{ color: spec.palette.accent2 }}><Postmark place={deco.place} date={deco.date} size={84} /></div>
  if (deco.kind === 'quote') return <div className="dl-deco dl-deco--quote"><span>“{deco.text}”</span><small>{/[a-z]/i.test(deco.who) ? `what ${deco.who} always says` : `${deco.who}가 늘 하던 말`}</small></div>
  if (deco.kind === 'stamp') return <div className="dl-deco dl-deco--stamp"><StoryStamp stamp={{ sticker: deco.sticker, text: deco.text, date: '', color: spec.palette.accent, tilt: tilt * 2 }} size={56} /></div>
  return null
}

/** "— Alex", or in Korean "지수가" / "하은이가" (이 after a final consonant). */
function signOff(name) {
  const n = String(name || '')
  const last = n.charCodeAt(n.length - 1)
  if (!(last >= 0xac00 && last <= 0xd7a3)) return `— ${n}`
  return `${n}${(last - 0xac00) % 28 ? '이가' : '가'}`
}

/**
 * One letter on its paper. Short letters are set in the hand face like a postcard; long ones switch
 * to the reading face, start with a drop cap, carry a memory stamp between paragraphs and end signed.
 */
export function StoryLetter({ letter, spec, keyBase, from, meta = '', reader = false }) {
  const lay = letterLayout(letter.body)
  const gap = Math.round(lay.size * lay.lineHeight)
  const face = lay.face === 'hand' ? spec.type.hand : spec.type.body
  const memo = letter.memoryData
  return (
    <article className={`dl-letter dl-letter--${lay.kind}${reader ? ' dl-letter--reader' : ''}`} style={{ ...paperStyle(spec, `${keyBase}-${letter.id}-${spec.variant}`), '--tilt': reader ? '0deg' : `${letter.tilt}deg` }}>
      <div className="dl-letter-head">
        <Deco deco={letter.deco} spec={spec} tilt={letter.tilt} />
        {letter.sticker && letter.deco.kind !== 'stamp' && <Motif id={letter.sticker} size={40} className="dl-letter-sticker" tilt={letter.tilt * 3} />}
      </div>
      {meta && <p className="dl-letter-meta">{meta}</p>}
      <h3 style={{ fontFamily: spec.type.title }}>{letter.title}</h3>
      <div className="dl-letter-body" style={{ fontFamily: face, fontSize: lay.size, lineHeight: `${gap}px`, ...ruledStyle(spec, gap), '--gap': `${gap}px` }}>
        {lay.paras.map((para, i) => (
          <div key={i}>
            <p className={i === 0 && lay.kind === 'long' ? 'dl-dropcap' : undefined}>{para}</p>
            {lay.kind === 'long' && i === lay.stampAfter - 1 && memo && (
              <div className="dl-midstamp"><StoryStamp stamp={{ sticker: memo.sticker, text: memo.place || memo.title, date: memo.date || '', color: spec.palette.accent2, tilt: -4 }} size={58} /></div>
            )}
          </div>
        ))}
      </div>
      {lay.kind !== 'postcard' && <p className="dl-sign" style={{ fontFamily: spec.type.hand }}>{signOff(from)}</p>}
      <p className="dl-letter-note">{lay.kind === 'long' ? '긴 편지' : lay.kind === 'letter' ? '보통 편지' : '짧은 편지'} · {lay.chars}자 · 예시 문장 (실제로는 보낸 사람이 씁니다)</p>
    </article>
  )
}
