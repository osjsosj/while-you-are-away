import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import LetterPaper from './LetterPaper'
import { letterForm, marginNotes, firstsOf } from '../utils/design/letterForm'
import { formatLong, localISODate } from '../utils/diary'
import { SECTION_INFO } from '../utils/plan'
import './keepsake.css'

/*
 * The keepsake book: every letter in the order it was meant to be read, each on its own page with its own paper,
 * and whatever the recipient wrote back beneath it. Printed or saved as a PDF from the browser.
 * Nothing in it is written by us: the words are the sender's and the recipient's, the rest is dates and names.
 */

// letters with a day come in date order (the days before, tonight, the weeks, special days); then the ones for any time; the reunion last
const ORDER = { before: 0, tonight: 1, scheduled: 1, occasions: 1, never: 2, anytime: 3, last: 4 }
const dayOf = (it) => (it.section === 'before' ? it.writtenOn : it.opensOn) || ''

function bookOrder(items = []) {
  return [...items].sort((a, b) => (ORDER[a.section] ?? 3) - (ORDER[b.section] ?? 3) || dayOf(a).localeCompare(dayOf(b)))
}

const replyDate = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function KeepsakeBook({ box, items, replies = [], onClose }) {
  const pages = bookOrder(items)
  const firsts = firstsOf(items)
  const byItem = {}
  for (const r of replies) (byItem[r.item_id] ||= []).push(r)
  const to = box.toName || 'you'
  const from = box.fromName || ''
  const span = [box.partDate && formatLong(box.partDate), box.returnDate && formatLong(box.returnDate)].filter(Boolean).join(' – ')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('kb-open')
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; document.body.classList.remove('kb-open') }
  }, [onClose])

  return createPortal(
    <div className="kb" role="dialog" aria-modal="true" aria-labelledby="kb-title">
      <div className="kb-bar">
        {onClose && <button type="button" className="kb-btn kb-btn--ghost" onClick={onClose}>Close</button>}
        <button type="button" className="kb-btn" onClick={() => window.print()}>Save as PDF or print</button>
      </div>
      <p className="kb-tip">In the print window, choose “Save as PDF” to keep a file, and turn on background graphics so the paper prints too.</p>

      <section className="kb-page kb-cover">
        <p className="kb-cover-for">For {to}</p>
        <h1 id="kb-title" className="kb-cover-title">{box.appName || `Letters for ${to}`}</h1>
        {from && <p className="kb-cover-from">from {from}</p>}
        {span && <p className="kb-cover-span">{span}</p>}
        <p className="kb-cover-count">{pages.length} {pages.length === 1 ? 'letter' : 'letters'}{replies.length ? ` · ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}` : ''}</p>
      </section>

      {pages.map((it) => {
        const form = letterForm(it, { fromName: from, toName: box.toName, partDate: box.partDate, returnDate: box.returnDate, transport: box.decor?.ticket?.kind, nickname: box.look?.seal?.text, seal: box.look?.seal, stamps: box.look?.stamps, months: box.look?.pattern?.months })
        const meta = it.section === 'before' ? `${it.stamp || ''} · ${it.date || ''}` : it.opensOn ? formatLong(it.opensOn) : SECTION_INFO[it.section]?.title || ''
        const back = byItem[it.id] || []
        return (
          <section key={it.id} className="kb-page">
            <LetterPaper
              decor={box.decor}
              paper={box.look?.paper || null}
              title={it.label}
              meta={meta}
              prompt={it.prompt}
              letter={it.letter}
              pins={it.pins || []}
              stickers={it.stickers || []}
              form={form}
              notes={marginNotes(it, box.look?.facts || null, form, firsts)}
              photoUrl={it.photo?.url}
              fromName={from}
              signature={box.signature}
              note={it.note}
              textSizeControl={false}
            />
            {back.length > 0 && (
              <div className="kb-back">
                <p className="kb-back-title">{to} wrote back</p>
                {back.map((r, i) => (
                  <div key={i} className="kb-back-one">
                    <p className="kb-back-body">{r.body}</p>
                    <p className="kb-back-date">{replyDate(r.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )
      })}

      <section className="kb-page kb-end">
        <p>Kept on {formatLong(localISODate())}.</p>
      </section>
    </div>,
    document.body,
  )
}
