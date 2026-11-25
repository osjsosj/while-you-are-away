import { useState } from 'react'
import { Motif, Stamp, Postmark, TicketBanner } from './Decor'
import FormHead from './LetterForms'
import { paperVars } from '../utils/design/paperStyle'
import '../styles/decor.css'

/*
 * One letter on paper, dressed by the letter box's decorations.
 * Reading comes first: decorations sit in the header and footer, never over the words.
 * `form` (utils/design/letterForm.js) picks the paper's composition from what the letter carries:
 * a postcard, a ticket, an envelope, a diary page… Without it the letter is the classic sheet.
 */

const SIZES = [16, 18, 21]

function readSize() {
  try { const n = Number(localStorage.getItem('wya_text_size')); return SIZES.includes(n) ? n : 18 } catch { return 18 }
}

function paragraphs(text) {
  return String(text || '').replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
}

export default function LetterPaper({
  decor, title, titleId, meta, prompt, letter, photoUrl, videoUrl, voiceUrl, fromName,
  signature, note, showPostmark = false, isTicket = false, textSizeControl = true, celebrate = false, stickers = [], pins = [], paper = null, form = null,
}) {
  const d = decor || { style: 'night', motifs: [], postmark: null, ticket: null, tape: true }
  const [size, setSize] = useState(readSize)
  const [unfolded, setUnfolded] = useState(false)
  const setTextSize = (n) => { setSize(n); try { localStorage.setItem('wya_text_size', String(n)) } catch { /* private mode */ } }
  const lead = d.motifs[0]?.id
  const f = form && form.form !== 'classic' ? form : null
  const ownMarks = f && ['postcard', 'ticket', 'sealed', 'envelope', 'diary'].includes(f.form)
  const showMeta = !f || !['diary', 'sealed', 'ticket', 'card', 'envelope'].includes(f.form)
  const shownPins = f ? f.pins : pins
  const paras = paragraphs(letter)
  // this letter's own stickers (from what it says) first, then the box's
  const scatter = [...stickers.map((id) => ({ id })), ...d.motifs].filter((m, i, a) => a.findIndex((x) => x.id === m.id) === i).slice(0, 3)
  const chars = paras.join(' ').length
  // a few lines read like a postcard; a short letter with a photo leads with the photo
  const layout = chars > 0 && chars <= 220 && !videoUrl ? 'postcard' : photoUrl && chars < 400 ? 'photo-first' : 'letter'
  const photo = photoUrl && (
    <figure className="lp-photo">
      {d.tape && d.style !== 'quiet' && <span className="lp-tape" aria-hidden="true" />}
      {d.style === 'quiet' && <><span className="lp-corner lp-corner--tl" aria-hidden="true" /><span className="lp-corner lp-corner--br" aria-hidden="true" /></>}
      <img src={photoUrl} alt="" loading="lazy" />
    </figure>
  )

  return (
    <div className={`lp lp--${d.style} lp--${layout}${paper ? ` lp--story lp--lines-${paper.lines}` : ''}${f ? ` lp--form lp--form-${f.form}` : ''}`} style={{ '--lp-size': `${size}px`, ...paperVars(paper) }}>
      {celebrate && (
        <div className="lp-pop" aria-hidden="true">
          <Motif id="birthday-cake" size={64} className="lp-pop-cake" />
          {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--a': `${(i * 360) / 18}deg`, '--d': `${70 + (i % 4) * 26}px`, '--c': ['#F0B341', '#E07A7A', '#7FC4D9', '#9FCB9A', '#B9A4E8'][i % 5] }} />)}
        </div>
      )}
      {showMeta && (
      <div className="lp-head">
        <div className="lp-meta">
          {d.style === 'flowers' && <Motif id="blossom" size={44} className="lp-pressed" />}
          {d.style === 'night' && <span className="lp-twinkle" aria-hidden="true">✦</span>}
          <span>{meta}</span>
        </div>
        {!ownMarks && (
        <div className="lp-marks">
          {!isTicket && lead && <Stamp id={lead} text={fromName ? `from ${fromName}` : ''} size={50} />}
          {showPostmark && d.postmark && <span className="lp-postmark"><Postmark place={d.postmark.place} date={d.postmark.date} size={88} /></span>}
        </div>
        )}
      </div>
      )}

      {f && <FormHead form={f} meta={meta} />}
      {isTicket && d.ticket && f?.form !== 'ticket' && <TicketBanner ticket={d.ticket} />}

      <h2 className={f?.form === 'envelope' ? 'lp-title lpf-sr' : 'lp-title'} id={titleId}>{title}</h2>
      {prompt && <p className="lp-prompt">{prompt}</p>}
      <Pins pins={shownPins} />

      {textSizeControl && chars > 400 && (
        <div className="lp-size" role="group" aria-label="Text size">
          {SIZES.map((n, i) => (
            <button key={n} type="button" aria-pressed={size === n} onClick={() => setTextSize(n)} aria-label={['Smaller text', 'Normal text', 'Larger text'][i]}>
              <span style={{ fontSize: 12 + i * 3 }}>A</span>
            </button>
          ))}
        </div>
      )}

      {layout === 'photo-first' && photo}
      {paras.length > 0 && <div className="lp-body">{paras.map((p, i) => <p key={i}>{p}</p>)}</div>}
      {layout !== 'photo-first' && photo}
      {videoUrl && <video className="lp-video" src={videoUrl} controls playsInline preload="metadata" />}
      {voiceUrl && (
        <div className="lp-voice">
          <p>A voice note from {fromName || 'me'}</p>
          <audio controls src={voiceUrl} preload="metadata" />
        </div>
      )}

      {(paras.length > 0 || scatter.length > 0) && (
        <div className="lp-foot">
          <div className="lp-stickers" aria-hidden="true">
            {scatter.map((m, i) => <Motif key={m.id} id={m.id} size={i === 0 ? 52 : 40} tilt={[-8, 6, -3][i]} className={`lp-sticker lp-sticker--${i}`} />)}
          </div>
          {paras.length > 0 && (signature?.d
            ? <svg className="lp-signature" viewBox="0 0 400 150" role="img" aria-label={`Signed, ${fromName || 'me'}`}><path d={signature.d} /></svg>
            : fromName && <p className="lp-sign">{fromName}</p>)}
        </div>
      )}

      {note && (
        <button type="button" className="lp-note" aria-expanded={unfolded} onClick={() => setUnfolded((u) => !u)}>
          <span className="lp-note-in">{note}</span>
          <span className="lp-note-flap" aria-hidden={unfolded}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 6l5 5 5-5" /></svg>
            {unfolded ? '' : 'A folded note. Tap to open'}
          </span>
        </button>
      )}
    </div>
  )
}

/* Pieces of their story the sender set beside this letter: a moment, a thing someone always says,
   an earlier goodbye, a number from their messages. They sit above the words, never inside them. */
function Pins({ pins }) {
  if (!pins?.length) return null
  return (
    <ul className="lp-pins" aria-label="From your story">
      {pins.map((p) => (
        <li key={`${p.kind}:${p.ref}`} className={`lp-pin lp-pin--${p.kind}`}>
          {p.kind === 'quote' ? (
            <><span className="lp-pin-main">“{p.text}”</span>{p.sub && <span className="lp-pin-sub">{p.sub}</span>}</>
          ) : p.kind === 'stat' ? (
            <><span className="lp-pin-num">{p.text}</span>{p.sub && <span className="lp-pin-sub">{p.sub}</span>}</>
          ) : (
            <><span className="lp-pin-main">{p.text}</span>{p.sub && <span className="lp-pin-sub">{p.sub}</span>}</>
          )}
        </li>
      ))}
    </ul>
  )
}
