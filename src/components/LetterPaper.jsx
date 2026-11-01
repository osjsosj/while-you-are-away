import { useState } from 'react'
import { Motif, Stamp, Postmark, TicketBanner } from './Decor'
import '../styles/decor.css'

/*
 * One letter on paper, dressed by the letter box's decorations.
 * Reading comes first: decorations sit in the header and footer, never over the words.
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
  signature, note, showPostmark = false, isTicket = false, textSizeControl = true,
}) {
  const d = decor || { style: 'night', motifs: [], postmark: null, ticket: null, tape: true }
  const [size, setSize] = useState(readSize)
  const [unfolded, setUnfolded] = useState(false)
  const setTextSize = (n) => { setSize(n); try { localStorage.setItem('wya_text_size', String(n)) } catch { /* private mode */ } }
  const lead = d.motifs[0]?.id
  const scatter = d.motifs.slice(0, 3)
  const paras = paragraphs(letter)

  return (
    <div className={`lp lp--${d.style}`} style={{ '--lp-size': `${size}px` }}>
      <div className="lp-head">
        <div className="lp-meta">
          {d.style === 'flowers' && <Motif id="daisy" size={44} className="lp-pressed" />}
          {d.style === 'night' && <span className="lp-twinkle" aria-hidden="true">✦</span>}
          <span>{meta}</span>
        </div>
        <div className="lp-marks">
          {!isTicket && lead && <Stamp id={lead} text={fromName ? `from ${fromName}` : ''} size={50} />}
          {showPostmark && d.postmark && <span className="lp-postmark"><Postmark place={d.postmark.place} date={d.postmark.date} size={88} /></span>}
        </div>
      </div>

      {isTicket && d.ticket && <TicketBanner ticket={d.ticket} />}

      <h2 className="lp-title" id={titleId}>{title}</h2>
      {prompt && <p className="lp-prompt">{prompt}</p>}

      {textSizeControl && paras.join(' ').length > 400 && (
        <div className="lp-size" role="group" aria-label="Text size">
          {SIZES.map((n, i) => (
            <button key={n} type="button" aria-pressed={size === n} onClick={() => setTextSize(n)} aria-label={['Smaller text', 'Normal text', 'Larger text'][i]}>
              <span style={{ fontSize: 12 + i * 3 }}>A</span>
            </button>
          ))}
        </div>
      )}

      {paras.length > 0 && <div className="lp-body">{paras.map((p, i) => <p key={i}>{p}</p>)}</div>}

      {photoUrl && (
        <figure className="lp-photo">
          {d.tape && d.style !== 'quiet' && <span className="lp-tape" aria-hidden="true" />}
          {d.style === 'quiet' && <><span className="lp-corner lp-corner--tl" aria-hidden="true" /><span className="lp-corner lp-corner--br" aria-hidden="true" /></>}
          <img src={photoUrl} alt="" loading="lazy" />
        </figure>
      )}
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
            {scatter.map((m, i) => <Motif key={m.id} id={m.id} size={i === 0 ? 46 : 36} className={`lp-sticker lp-sticker--${i}`} />)}
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
