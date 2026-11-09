/**
 * demoBox.js — a sample recipient view for local development only (/b/demo, /b/demo-new).
 * Dates are relative to today so the path always has read, waiting and sealed letters.
 * Every name and letter here is illustrative.
 */
import { localISODate, formatLong } from '../../utils/diary.js'

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

const LETTER = 'I’m writing this at the kitchen table while you’re asleep.\n\nThe kettle just clicked off and I thought about how you always leave it half full for me. Small things like that are the ones I’ll miss first.\n\nI’ll write again soon.'

export function demoBox(token = 'demo') {
  const today = localISODate()
  const fresh = token === 'demo-new'
  const part = addDays(today, fresh ? 3 : -20)
  const ret = addDays(part, 60)
  const open = (d) => !d || d <= today

  const before = [14, 10, 7, 5, 3, 1].map((n, k) => {
    const writtenOn = addDays(part, -n)
    const opensOn = fresh ? addDays(part, n) : null // demo-new shows sealed entries (the "matching day" setting)
    return {
      id: `d:${k}`,
      section: 'before',
      label: ['The first night I knew', 'Your laugh on the phone', 'Packing your blue jumper', 'What I didn’t say at dinner', 'The station, practised', 'Tomorrow'][k],
      stamp: `Written ${n} ${n === 1 ? 'day' : 'days'} before I left`,
      date: formatLong(writtenOn),
      writtenOn,
      opensOn,
    }
  })
  const scheduled = Array.from({ length: 8 }, (_, k) => ({ id: `w${k}`, section: 'scheduled', label: `Week ${k + 1}`, opensOn: addDays(part, (k + 1) * 7) }))
  const items = [
    ...before,
    { id: 't0', section: 'tonight', label: 'Read this tonight', opensOn: part },
    ...scheduled,
    { id: 'o0', section: 'occasions', label: 'Your birthday', opensOn: addDays(today, 12) },
    { id: 'l0', section: 'last', label: 'The day we meet again', opensOn: ret },
    { id: 's0', section: 'anytime', label: 'Open when you can’t sleep', hint: 'For 3 a.m. thoughts' },
    { id: 's1', section: 'anytime', label: 'Open when you miss me', hint: '' },
    { id: 's2', section: 'anytime', label: 'Open when you did something brave', hint: 'Tell me everything' },
    { id: 's3', section: 'anytime', label: 'Open on a rainy Sunday', hint: '' },
    { id: 'n0', section: 'never', label: 'The bus stop in 2019' },
    { id: 'n1', section: 'never', label: 'Why I kept the ticket' },
    { id: 'n2', section: 'never', label: 'Your mum’s soup' },
  ].map((it) => {
    const isOpen = open(it.opensOn)
    return isOpen ? { ...it, open: true, letter: LETTER, empty: false } : { ...it, open: false }
  })

  const photo = { d1: '/site/han-river-night.jpg', t0: '/site/platform-dusk.jpg', w1: '/site/sunset-stars.jpg', n1: '/site/letter-1864.jpg' }
  for (const it of items) if (it.open && photo[it.id]) it.photo = { url: photo[it.id], key: null }

  const opened = fresh ? [] : ['d:0', 'd:1', 'd:2', 't0', 'w0', 'n1', 's0']
  const replies = fresh ? [] : [
    { item_id: 'd:1', body: 'I didn’t know you remembered that call. I still have the voicemail.', created_at: `${addDays(today, -6)}T21:14:00Z` },
    { item_id: 'w0', body: 'Week one done. The flat is too quiet without your music.', created_at: `${addDays(today, -12)}T08:40:00Z` },
  ]

  return {
    today,
    box: {
      appName: 'Letters for Sam',
      welcome: 'One for every week you’re away, and a few for the days in between.',
      fromName: 'Jordan',
      toName: 'Sam',
      partDate: part,
      returnDate: ret,
      theme: null,
      accent: null,
      pet: null,
      signature: null,
      decor: { style: 'night', motifs: [] },
      sealVoice: null,
      timeline: [
        { date: addDays(today, -60), label: 'We booked the train tickets for the move.', emoji: '' },
        { date: addDays(today, -400), label: 'The night at the bus stop.', emoji: '' },
      ],
    },
    items,
    replies,
    opened,
    film: null,
  }
}
