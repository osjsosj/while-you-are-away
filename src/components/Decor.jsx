import { MOTIFS, TICKETS, postmarkDate } from '../utils/decor'

/* Hand-drawn pieces that dress a letter. All drawing lives in utils/decor.js; these only place it. */

export function Motif({ id, size = 48, className = '', style, label }) {
  const m = MOTIFS[id]
  if (!m) return null
  return (
    <svg className={`dc-motif ${className}`} viewBox="0 0 64 64" width={size} height={size} style={style}
      role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : 'true'}
      dangerouslySetInnerHTML={{ __html: m.svg }} />
  )
}

/** A perforated postage stamp with a motif in it. */
export function Stamp({ id, text = '', size = 56 }) {
  if (!MOTIFS[id]) return null
  return (
    <svg className="dc-stamp" viewBox="0 0 60 72" width={size} height={size * 1.2} aria-hidden="true">
      <rect x="3" y="3" width="54" height="66" fill="#F3E4C6" />
      <rect x="3" y="3" width="54" height="66" fill="none" stroke="#FFFDF6" strokeWidth="4" strokeDasharray="0.1 5.9" strokeLinecap="round" />
      <rect x="9" y="9" width="42" height="48" fill="#FFFAEE" stroke="#CDB98F" strokeWidth=".8" />
      <g transform="translate(12 12) scale(.56)" dangerouslySetInnerHTML={{ __html: MOTIFS[id].svg }} />
      {text && <text x="30" y="65" textAnchor="middle" fontFamily="Schibsted Grotesk, sans-serif" fontSize="6" fontWeight="600" letterSpacing="1" fill="#8A6A3A">{text.toUpperCase().slice(0, 14)}</text>}
    </svg>
  )
}

/** A round postmark with the place and date of a moment from their story. */
export function Postmark({ place, date, size = 110 }) {
  const ring = `${place.toUpperCase()} · `.repeat(place.length < 10 ? 3 : 2)
  const pid = `pm-${place.replace(/[^a-z0-9]/gi, '').slice(0, 12)}-${(date || '').replace(/-/g, '')}`
  const d = postmarkDate(date)
  return (
    <svg className="dc-postmark" viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Postmark: ${place}${d ? `, ${d.replace(' · ', ', ')}` : ''}`}>
      <defs><path id={pid} d="M60 60 m -42 0 a 42 42 0 1 1 84 0 a 42 42 0 1 1 -84 0" /></defs>
      <g fill="none" stroke="currentColor" strokeWidth="2"><circle cx="60" cy="60" r="50" /><circle cx="60" cy="60" r="33" /></g>
      <text fontFamily="Schibsted Grotesk, sans-serif" fontSize="10.5" fontWeight="600" letterSpacing="2" fill="currentColor">
        <textPath href={`#${pid}`} startOffset="1%">{ring}</textPath>
      </text>
      {d ? (
        <>
          <text x="60" y="57" textAnchor="middle" fontFamily="Schibsted Grotesk, sans-serif" fontSize="12" fontWeight="600" fill="currentColor">{d.split(' · ')[0]}</text>
          <text x="60" y="73" textAnchor="middle" fontFamily="Schibsted Grotesk, sans-serif" fontSize="12" fontWeight="600" fill="currentColor">{d.split(' · ')[1]}</text>
        </>
      ) : (
        <path d="M40 60h40" stroke="currentColor" strokeWidth="2" />
      )}
      <g stroke="currentColor" strokeWidth="1.6" fill="none" opacity=".7"><path d="M112 44c6 4 10 4 16 0M112 54c6 4 10 4 16 0M112 64c6 4 10 4 16 0" /></g>
    </svg>
  )
}

/** The top of a ticket-shaped letter (bus, train or boarding pass). */
export function TicketBanner({ ticket, compact = false }) {
  const t = TICKETS[ticket.kind]
  if (!t) return null
  return (
    <div className={`dc-ticket${compact ? ' dc-ticket--compact' : ''}`} style={{ '--tk': t.color }}>
      <div className="dc-ticket-head">{t.head}</div>
      <div className="dc-ticket-main">
        <span className="dc-ticket-title">{ticket.title || t.label}</span>
        {!compact && ticket.line && <span className="dc-ticket-line">{ticket.line}</span>}
      </div>
      <div className="dc-ticket-stub" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => <i key={i} style={{ width: i % 3 === 0 ? 2 : 1 }} />)}
      </div>
    </div>
  )
}

/** A small preview of a paper style, for the style picker. */
export function StyleSwatch({ style }) {
  const bg = { night: '#0E1838', scrapbook: '#C59F77', flowers: '#E6DCD0', quiet: '#DCD8CF' }[style]
  const paper = style === 'quiet' ? '#FFFFFF' : style === 'flowers' ? '#FFFDF8' : '#FBF6EA'
  return (
    <svg viewBox="0 0 150 92" className="dc-swatch" aria-hidden="true">
      <rect width="150" height="92" fill={bg} />
      {style === 'night' && [12, 40, 70, 118, 136, 24, 96].map((x, i) => <circle key={x} cx={x} cy={(i * 29) % 88 + 4} r={i % 3 ? 0.8 : 1.3} fill="#F4F1E6" opacity=".7" />)}
      <rect x="34" y="12" width="82" height="76" fill={paper} />
      {style === 'scrapbook' && (<><rect x="42" y="20" width="34" height="28" fill="#fff" transform="rotate(-6 59 34)" /><rect x="44" y="22" width="30" height="19" fill="#E7A99A" transform="rotate(-6 59 34)" /><rect x="50" y="15" width="22" height="7" fill="rgba(240,178,96,.85)" transform="rotate(4 61 18)" /></>)}
      {style === 'night' && <circle cx="104" cy="24" r="5" fill="#F0B341" />}
      {style === 'flowers' && <g transform="translate(92 14) scale(.34)" dangerouslySetInnerHTML={{ __html: MOTIFS.daisy.svg }} />}
      <g fill={style === 'night' ? '#5A6070' : '#8A7A66'} opacity=".45">
        {(style === 'scrapbook' ? [58, 66, 74] : [36, 46, 56, 66, 74]).map((y, i) => <rect key={y} x="44" y={y} width={[58, 50, 62, 44, 54][i]} height="2" />)}
      </g>
    </svg>
  )
}

