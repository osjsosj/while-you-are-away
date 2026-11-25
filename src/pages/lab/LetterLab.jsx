import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { recipientView } from '../../utils/boxModel'
import { formatLong } from '../../utils/diary'
import { letterForm, marginNotes, firstsOf } from '../../utils/design/letterForm'
import { sheetStyle } from '../../utils/design/paperStyle'
import { postmarkLetterId } from '../../utils/decor'
import { StickerArtContext } from '../../utils/stickerArt'
import { useStoryFonts } from '../../components/storyLook'
import LetterPaper from '../../components/LetterPaper'
import { LETTER_STORIES } from './letterStories'
import '../box.css'

/*
 * Letter lab (development only): every letter of six made-up boxes, opened the way the recipient
 * sees it, so the forms can be checked side by side at phone widths (docs/letter-design-rules.md).
 * ?s=<story key> picks a box; ?id=<letter id> shows one letter.
 */
export default function LetterLab() {
  const [params, setParams] = useSearchParams()
  const [key, setKey] = useState(params.get('s') || LETTER_STORIES[0].key)
  const only = params.get('id')
  const story = LETTER_STORIES.find((s) => s.key === key) || LETTER_STORIES[0]
  const { box, items } = useMemo(() => recipientView(story.draft, story.today), [story])
  useStoryFonts(box.look?.typeKey)
  const paper = box.look?.paper || null
  const shown = items.filter((it) => it.open && !it.empty && (!only || it.id === only))
  const pm = postmarkLetterId(items)

  return (
    <main className="ll" style={{ padding: '16px', minHeight: '100vh', background: 'var(--night, #050A19)', '--serif': "'Literata', Georgia, serif" }}>
      <nav aria-label="Stories" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {LETTER_STORIES.map((s) => (
          <button key={s.key} type="button" aria-pressed={s.key === key} onClick={() => { setKey(s.key); setParams({ s: s.key }) }}
            style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #3A4870', background: s.key === key ? '#F0B341' : 'transparent', color: s.key === key ? '#141B2E' : '#E9ECF2', font: '600 14px Schibsted Grotesk, sans-serif' }}>
            {s.key}
          </button>
        ))}
      </nav>
      <StickerArtContext.Provider value={box.look?.art || 'flat'}>
        <div style={{ display: 'grid', gap: 28, maxWidth: 560, margin: '0 auto' }}>
          {shown.map((item) => {
            const form = letterForm(item, { fromName: box.fromName, toName: box.toName, partDate: box.partDate, returnDate: box.returnDate, transport: box.decor?.ticket?.kind, nickname: box.look?.seal?.text, seal: box.look?.seal, stamps: box.look?.stamps, months: box.look?.pattern?.months })
            return (
              <article key={item.id} data-letter={item.id} data-form={form.form} className={`wb-sheet wb-sheet--${box.decor?.style || 'night'}${paper ? ' wb-sheet--story' : ''}`} style={{ ...sheetStyle(paper), position: 'relative', maxHeight: 'none', transform: 'none', animation: 'none' }}>
                <LetterPaper
                  decor={box.decor}
                  paper={paper}
                  form={form}
                  notes={marginNotes(item, box.look?.facts || null, form, firstsOf(items))}
                  title={item.label}
                  meta={item.section === 'before' ? `${item.stamp} · ${item.date}` : item.opensOn ? formatLong(item.opensOn) : ''}
                  letter={item.letter}
                  stickers={item.stickers || []}
                  pins={item.pins || []}
                  photoUrl={typeof item.photo === 'string' ? item.photo : item.photo?.url}
                  voiceUrl={typeof item.voice === 'string' ? item.voice : item.voice?.url}
                  fromName={box.fromName}
                  signature={box.signature}
                  showPostmark={item.id === pm}
                  isTicket={box.decor?.ticket?.letterId === item.id}
                  textSizeControl={false}
                />
              </article>
            )
          })}
        </div>
      </StickerArtContext.Provider>
    </main>
  )
}
