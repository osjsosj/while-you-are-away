import { Motif, Stamp, Postmark } from './Decor'
import { Seal } from './StoryArt'

/*
 * The heads of the letter forms (src/utils/design/letterForm.js, docs/letter-design-rules.md).
 * Each one is a piece of real paper made from the facts the form picked: a boarding-pass stub,
 * a postcard's address side, an envelope front, a diary date, a saying on a taped note, a receipt
 * of their numbers, a seal. Empty facts leave their slot out.
 */

export default function FormHead({ form, meta, photoUrl = null, signature = null }) {
  const h = form.head || {}
  switch (form.form) {
    case 'sealed':
      return (
        <div className="lpf-sealed">
          {h.seal && <Seal seal={h.seal} size={92} />}
          {h.until && <p className="lpf-sealed-until">Sealed until {h.until}{h.apart && <span>{h.apart}</span>}</p>}
          {h.to && <p className="lpf-sealed-to">For {h.to}</p>}
        </div>
      )
    case 'diary':
      return (
        <div className="lpf-diary">
          {h.weekday && <p className="lpf-diary-day">{h.weekday}</p>}
          <p className="lpf-diary-date">{h.date || meta}</p>
        </div>
      )
    case 'ticket':
      return (
        <div className={`lpf-ticket${h.kind ? ` lpf-ticket--${h.kind}` : ''}${h.wide ? ' lpf-ticket--wide' : ''}`} role="group" aria-label={h.name} style={h.color ? { '--lpf-tk': h.color } : undefined}>
          <p className="lpf-ticket-name">{h.name}</p>
          <dl className="lpf-ticket-main">
            {h.passenger && <div><dt>Passenger</dt><dd>{h.passenger}</dd></div>}
            {h.from && <div><dt>From</dt><dd>{h.from}</dd></div>}
            {h.departs && <div><dt>Departs</dt><dd>{h.departs}</dd></div>}
            {h.returns && <div><dt>Returns</dt><dd>{h.returns}</dd></div>}
            {h.place && <div className="lpf-ticket-wide"><dt>The last goodbye</dt><dd>{h.place}</dd></div>}
          </dl>
          <div className="lpf-ticket-stub" aria-hidden="true"><span>{h.returns ? 'Return' : 'One way'}</span></div>
        </div>
      )
    case 'envelope':
      return (
        <div className="lpf-envelope">
          <div className="lpf-envelope-front">
            <p className="lpf-envelope-reason"><span>Open when</span> {h.reason}</p>
            {(h.to || h.from) && <p className="lpf-envelope-addr">{h.to && <span>For {h.to}</span>}{h.from && <span className="lpf-from">from {signature?.d ? <Signed signature={signature} name={h.from} /> : h.from}</span>}</p>}
          </div>
          <div className="lpf-envelope-flap" aria-hidden="true" />
          {h.seal && <span className="lpf-envelope-seal" aria-hidden="true"><Seal seal={h.seal} size={46} /></span>}
        </div>
      )
    case 'card':
      return (
        <div className="lpf-card">
          {h.day && <p className="lpf-card-day">{h.day}</p>}
        </div>
      )
    case 'saying':
      return (
        <figure className="lpf-saying">
          <blockquote>“{h.text}”</blockquote>
          {h.who && <figcaption>{h.who}</figcaption>}
        </figure>
      )
    case 'postcard':
      return (
        <div className={`lpf-postcard lpf-postcard--${form.side}`}>
          <div className={`lpf-postcard-pic${photoUrl ? ' has-photo' : ''}`}>
            {photoUrl && <img className="lpf-postcard-photo" src={photoUrl} alt="" loading="lazy" />}
            {!photoUrl && h.sticker && <Motif id={h.sticker} size={64} tilt={form.side === 'left' ? -6 : 5} className="lpf-postcard-sticker" />}
            <p className="lpf-postcard-title">{h.title}</p>
            {(h.place || h.date) && <p className="lpf-postcard-where">{[h.place, h.date].filter(Boolean).join(', ')}</p>}
          </div>
          <div className="lpf-postcard-addr">
            <div className="lpf-postcard-marks">
              {h.sticker && <Stamp id={h.sticker} size={46} />}
              {h.mark && h.iso && <span className="lpf-postcard-pm"><Postmark place={h.mark} date={h.iso} size={78} /></span>}
            </div>
            {h.to && <p className="lpf-postcard-line">To {h.to}</p>}
            {h.from && <p className="lpf-postcard-line lpf-postcard-line--soft lpf-from">from {signature?.d ? <Signed signature={signature} name={h.from} /> : h.from}</p>}
          </div>
        </div>
      )
    case 'leaf':
      return (
        <div className="lpf-leaf">
          <div className="lpf-leaf-weeks" role="img" aria-label={`Week ${h.filled} of ${h.weeks}`}>
            {Array.from({ length: h.weeks }, (_, i) => <i key={i} className={i < h.filled - 1 ? 'is-gone' : i === h.filled - 1 ? 'is-now' : ''} />)}
          </div>
          <p className="lpf-leaf-left">{h.left}</p>
        </div>
      )
    case 'tally':
      return (
        <table className="lpf-tally">
          <caption className="lpf-sr">From our messages</caption>
          <tbody>
            {h.rows.map((r, i) => <tr key={i}><th scope="row">{r.num}</th><td>{r.sub}</td></tr>)}
          </tbody>
          {h.months && (
            <tfoot>
              <tr><td>
                <MonthBars months={h.months} />
                <span className="lpf-tally-span">{h.span[0]} to {h.span[1]}, a bar a month</span>
              </td></tr>
            </tfoot>
          )}
        </table>
      )
    default:
      return null
  }
}

/* Their messages, a bar a month: the shape of their own conversation, drawn small like a receipt's footer. */
function MonthBars({ months }) {
  const max = Math.max(1, ...months.map((m) => m.count))
  const w = 100 / months.length
  return (
    <svg className="lpf-tally-bars" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
      {months.map((m, i) => {
        const h = Math.max(1.2, (m.count / max) * 24)
        return <rect key={m.month} x={i * w + w * 0.15} y={24 - h} width={w * 0.7} height={h} />
      })}
    </svg>
  )
}

/* The sender's own drawn signature, small, where an address line would carry their name. */
function Signed({ signature, name }) {
  return (
    <svg className="lpf-signed" viewBox="0 0 400 150" role="img" aria-label={name}>
      <path d={signature.d} />
    </svg>
  )
}
