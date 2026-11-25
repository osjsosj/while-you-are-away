import { useEffect, useRef } from 'react'
import { Motif } from './Decor'
import { MAX_PINS, groupCount, storyFindings } from '../utils/story'

/*
 * "From your chats" in the editor: what we found about the two of them, laid out so the sender can
 * read it, be reminded, and pin a piece to a letter or start a new letter from it.
 * The panel never writes words for them; a pin sits beside their letter, the letter stays theirs.
 */

const KIND_MARK = { memory: '◆', quote: '“', parting: '↗', stat: '#' }
const KIND_NAME = { memory: 'A moment', quote: 'Something you say', parting: 'An earlier goodbye', stat: 'A number' }

/** The card on the writing page that opens the panel. */
export function StoryEntry({ story, onOpen }) {
  const groups = storyFindings(story)
  const total = groups.reduce((s, g) => s + g.items.length, 0)
  if (!total) return null
  return (
    <button type="button" className="we-story" onClick={onOpen}>
      <span className="we-story-text">
        <span className="we-story-title">{story.hasChat ? 'What we found in your chats' : 'What you told us'}</span>
        <span className="we-story-sub">{groups.map(groupCount).join(' · ')}{story.hasChat ? '' : ', from your planning talk'}. Read through it; something might be worth a letter.</span>
      </span>
      <span className="we-story-go" aria-hidden="true">Look</span>
    </button>
  )
}

/** Before there is a story: the card that leads to bringing in a chat (or back to one already counted). */
export function ChatInvite({ ready, onOpen }) {
  return (
    <button type="button" className="we-story we-story--invite" onClick={onOpen}>
      <span className="we-story-text">
        <span className="we-story-title">{ready ? 'Your chat is ready to read' : 'Bring in your chats'}</span>
        <span className="we-story-sub">{ready
          ? 'We counted it on this device. Next we find the moments, sayings and goodbyes in it.'
          : 'An iMessage, WhatsApp or KakaoTalk chat holds moments you may have forgotten. We find them; you choose what to write about.'}</span>
      </span>
      <span className="we-story-go" aria-hidden="true">{ready ? 'Read' : 'Add'}</span>
    </button>
  )
}

/** Findings already pinned to a letter, shown in the letter sheet. */
export function PinList({ pins, onRemove }) {
  if (!pins?.length) return null
  return (
    <ul className="we-pins" aria-label="From your chats, on this letter">
      {pins.map((p) => (
        <li key={`${p.kind}:${p.ref}`} className={`we-pin we-pin--${p.kind}`}>
          <span className="we-pin-mark" aria-hidden="true">{KIND_MARK[p.kind]}</span>
          <span className="we-pin-text">
            <span className="we-pin-main">{p.kind === 'quote' ? `“${p.text}”` : p.text}</span>
            {p.sub && <span className="we-pin-sub">{p.sub}</span>}
          </span>
          <button type="button" className="we-pin-x" onClick={() => onRemove(p)} aria-label={`Take “${p.text}” off this letter`}>×</button>
        </li>
      ))}
    </ul>
  )
}

/**
 * The panel. `target` is the letter it was opened from ({ id, label, pins }) or null when browsing.
 * `pinnedOn` maps a finding key to the letter titles it already sits on; `letterFor` maps a key to a letter started from it.
 */
export function FindingsPanel({ story, target, pinnedOn, letterFor, onPin, onUnpin, onStart, onOpenLetter, onClose }) {
  const groups = storyFindings(story)
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [])
  const targetKeys = new Set((target?.pins || []).map((p) => `${p.kind}:${p.ref}`))
  const full = (target?.pins || []).length >= MAX_PINS

  return (
    <div className="we-find-wrap" role="dialog" aria-modal="true" aria-labelledby="we-find-title" onClick={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <section className="we-find" tabIndex={-1} ref={ref}>
        <header className="we-find-head">
          <div>
            <h2 id="we-find-title" className="we-find-h">{target ? `For “${target.label}”` : story.hasChat ? 'What we found in your chats' : 'What you told us'}</h2>
            <p className="we-find-lede">{target
              ? `Tap Add to put a piece beside this letter (up to ${MAX_PINS}). It sits next to your words; it doesn’t write them.`
              : story.hasChat
                ? `${story.about ? `${story.about} ` : ''}Things from your messages and your planning talk. Start a letter from any of them.`
                : 'The days, places and jokes you shared with the planning guide. Start a letter from any of them.'}</p>
          </div>
          <button type="button" className="we-icon-btn we-find-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 3l10 10M13 3L3 13" /></svg>
          </button>
        </header>

        {groups.map((g) => (
          <div key={g.id} className="we-find-group">
            <h3 className="we-find-gh">{g.title}</h3>
            <ul className="we-find-list">
              {g.items.map((it) => {
                const pinKey = `${it.pin.kind}:${it.pin.ref}`
                const on = pinnedOn[pinKey] || []
                const started = letterFor[it.key]
                const added = targetKeys.has(pinKey)
                return (
                  <li key={it.key} className={`we-find-item we-find-item--${it.pin.kind}`}>
                    <div className="we-find-top">
                      {it.sticker ? <Motif id={it.sticker} size={34} /> : <span className="we-find-mark" aria-hidden="true">{KIND_MARK[it.pin.kind]}</span>}
                      <div className="we-find-text">
                        <span className="we-find-kind">{KIND_NAME[it.pin.kind]}{it.from === 'talk' ? ', from your planning talk' : ''}</span>
                        <span className="we-find-title">{it.title}</span>
                        {it.sub && <span className="we-find-sub">{it.sub}</span>}
                        {it.prompt && <span className="we-find-prompt">{it.prompt}</span>}
                        {on.length > 0 && <span className="we-find-on">On {on.map((t) => `“${t}”`).join(', ')}</span>}
                      </div>
                    </div>
                    <div className="we-find-actions">
                      {target ? (
                        <button type="button" className={`we-find-btn${added ? ' is-on' : ''}`} aria-pressed={added} disabled={!added && full} onClick={() => (added ? onUnpin(it.pin) : onPin(it.pin))}>
                          {added ? 'Added to this letter' : full ? `${MAX_PINS} already added` : 'Add to this letter'}
                        </button>
                      ) : started ? (
                        <button type="button" className="we-find-btn" onClick={() => onOpenLetter(started.id)} aria-label={`Open the letter “${started.label}”`}>Open its letter</button>
                      ) : (
                        <button type="button" className="we-find-btn we-find-btn--start" onClick={() => onStart(it)}>Start a letter from this</button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
        <p className="we-find-foot">{story.hasChat ? 'Found by reading your messages and from what you told the planning guide.' : 'From what you told the planning guide.'} If something isn’t right, leave it out; nothing here goes in the box unless you put it on a letter.</p>
      </section>
    </div>
  )
}
