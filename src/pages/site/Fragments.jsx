import LetterPaper from '../../components/LetterPaper'
import { PHOTO, decorFor } from './paper'

/*
 * Pieces of the real product, rendered by the app's own components rather than pictured:
 * the counselor conversation, the letter paper it composes, and the recipient's letter box.
 * The story in them (Jae writing to Mina) is illustrative.
 */

const WAVE = [6, 12, 18, 10, 22, 14, 8, 16, 24, 12, 6, 14, 20, 10, 16, 8, 12, 18, 6, 10]

export function ChatFragment({ compact = false }) {
  return (
    <div className={compact ? "frag frag-chat frag--compact" : "frag frag-chat"} data-ui>
      <p className="fc-head">Planning your letter box</p>
      <p className="fc-msg fc-msg--ai">Tell me about the two of you. Where did it start? A place, a date, a photo, anything.</p>
      <p className="fc-msg fc-msg--me">Han River, April 2. We rented bikes and got lost on purpose.</p>
      <figure className="fc-msg fc-msg--me fc-photo">
        <img src={PHOTO} alt="Two rental bikes by the Han River at night" width="1200" height="800" loading="lazy" />
      </figure>
      <div className="fc-msg fc-msg--me fc-voice" role="img" aria-label="A voice note, 42 seconds">
        <span className="fc-play" aria-hidden="true"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg></span>
        <svg className="fc-wave" viewBox="0 0 120 28" width="120" height="28" aria-hidden="true">
          {WAVE.map((h, i) => <rect key={i} x={i * 6} y={(28 - h) / 2} width="3" height={h} rx="1.5" fill="currentColor" />)}
        </svg>
        <span>0:42</span>
      </div>
      <p className="fc-msg fc-msg--ai">That night goes on her first letter: the river, the bikes, and a postmark from April 2.</p>
    </div>
  )
}

export function PaperFragment({ style = 'night', dressed = true, body = 'Your words go here, exactly as you write them. Everything around them is ours to take care of.', title = 'Read this tonight', meta = 'Tonight · opens the day you part', photo = true, ticket = false, compact = false }) {
  return (
    <div className={`frag frag-paper${compact ? ' frag--compact' : ''}`} data-ui>
      <LetterPaper
        decor={decorFor(style, dressed)}
        title={title}
        meta={meta}
        letter={body}
        photoUrl={photo && dressed ? PHOTO : undefined}
        fromName="Jae"
        showPostmark={dressed}
        isTicket={ticket && dressed}
        textSizeControl={false}
      />
    </div>
  )
}

const ROWS = [
  { title: 'Tonight', sub: 'Opened' },
  { title: 'Written before I left', sub: '14 entries' },
  { title: 'Week 4', sub: 'New today', on: true },
  { title: 'Open when you can’t sleep', sub: 'Any time' },
  { title: 'Week 5', sub: 'Opens Dec 13', locked: true },
  { title: 'The day we meet again', sub: 'Sealed until Feb 7', locked: true },
]

export function BoxFragment({ compact = false }) {
  return (
    <div className={`frag frag-box${compact ? ' frag--compact' : ''}`} data-ui>
      <p className="fb-from">From Jae</p>
      <p className="fb-name">Mina’s letter box</p>
      <p className="fb-count"><span aria-hidden="true" />A new letter today</p>
      <ul>
        {ROWS.map((r) => (
          <li key={r.title} className={r.on ? 'fb-row fb-row--on' : r.locked ? 'fb-row fb-row--locked' : 'fb-row'}>
            <span className="fb-title">{r.title}</span>
            <span className="fb-sub">{r.sub}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The fragment that shows one step of how it works. */
export function StepFragment({ kind, compact = false }) {
  if (kind === 'chat') return <ChatFragment compact={compact} />
  if (kind === 'paper') return <PaperFragment compact={compact} meta="Tonight" />
  if (kind === 'write') return <PaperFragment compact={compact} photo={false} title="Nine days left" meta="D-9" body="Today you cried and said it was allergies. It hurt to watch. I’m so glad I’m writing these." />
  return <BoxFragment compact={compact} />
}
