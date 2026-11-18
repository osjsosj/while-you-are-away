import { Motif, Postmark, TicketBanner } from '../../components/Decor'
import { hash, mix, letterLayout } from '../../utils/design/storyDesign'
import { ChatPattern, Seal, StoryStamp } from '../../components/StoryArt'
import { GRAIN, STAINS } from '../../utils/design/paperStyle'

export { ChatPattern, Seal, StoryStamp }

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
