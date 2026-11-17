import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import LetterApp from '../box/LetterApp'
import { appTheme, designFromStory } from '../../utils/design/storyDesign'
import { localISODate, formatLong } from '../../utils/diary'
import { SAMPLES } from './samples'
import { ChatPattern, Seal, StoryLetter, StoryStamp } from './pieces'
import { useLabFonts } from './fonts'
import '../../styles/decor.css'
import './lab.css'

/*
 * The real recipient app (LetterApp) wearing one sample's look: /lab/phone/:key?v=0.
 * The design lab shows this in a phone-sized frame so the app's own phone layout applies. Dev only.
 */

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** A believable box for the sample: ten days apart, the first week's letter waiting. */
function buildBox(sample, spec, today) {
  const s = sample.story
  const ko = sample.lang === 'ko'
  const part = addDays(today, -10)
  const ret = addDays(part, 90)
  const bySection = (sec) => spec.letters.filter((l) => l.section === sec)
  const asItem = (l, extra) => ({ id: l.id, label: l.title, letter: l.body, open: true, empty: false, ...extra })

  const before = s.diary.map((label, k) => {
    const n = [7, 3, 1][k]
    const writtenOn = addDays(part, -n)
    return { id: `d${k}`, section: 'before', label, letter: label, stamp: ko ? `떠나기 ${n}일 전에 씀` : `Written ${n} ${n === 1 ? 'day' : 'days'} before`, date: formatLong(writtenOn), writtenOn, open: true, empty: false }
  })
  const tonight = bySection('tonight').map((l) => asItem(l, { section: 'tonight', opensOn: part }))
  const week1 = bySection('scheduled').map((l) => asItem(l, { section: 'scheduled', opensOn: addDays(part, 7) }))
  const weeks = [2, 3, 4, 5].map((n) => ({ id: `w${n}`, section: 'scheduled', label: ko ? `${n}주차` : `Week ${n}`, opensOn: addDays(part, n * 7), open: false }))
  const occasion = bySection('occasions').map((l) => ({ id: l.id, section: 'occasions', label: l.title, opensOn: addDays(today, 20), open: false }))
  const last = [{ id: 'last', section: 'last', label: ko ? '다시 만나는 날' : 'The day we meet again', opensOn: ret, open: false }]
  const anytime = bySection('anytime').map((l) => asItem(l, { section: 'anytime', hint: '' }))
  const never = [{ id: 'never', section: 'never', label: ko ? '한 번도 말 못 한 것' : 'What I never said', letter: ko ? '사실 그날 먼저 연락하고 싶었어.' : 'I wanted to call first that day.', open: true, empty: false }]

  const ticketLetter = spec.letters.find((l) => l.deco.kind === 'ticket' && (l.section === 'anytime' || l.section === 'never'))
  return {
    box: {
      appName: ko ? `${s.to}에게, 떨어져 있는 동안` : `${s.to}, while you’re away`,
      welcome: ko ? '떠나기 전부터 하나씩 모아 둔 편지들.' : `Letters ${s.from} started writing before you left.`,
      fromName: s.from,
      toName: s.to,
      partDate: part,
      returnDate: ret,
      decor: ticketLetter ? { ticket: { kind: ticketLetter.deco.transport, title: ticketLetter.title, letterId: ticketLetter.id } } : {},
      timeline: [],
    },
    items: [...before, ...tonight, ...week1, ...weeks, ...occasion, ...last, ...anytime, ...never],
    opened: [...before.map((b) => b.id), ...tonight.map((t) => t.id)],
  }
}

function Hero({ spec, story }) {
  return (
    <div className="lp-hero">
      <div className="lp-hero-row">
        <Seal seal={spec.seal} size={64} />
        <ChatPattern spec={spec} size={spec.pattern.kind === 'rings' ? 132 : 110} light />
      </div>
      <div className="lp-hero-stamps">{spec.stamps.map((st) => <StoryStamp key={st.memory} stamp={st} size={46} />)}</div>
      <p className="lp-hero-cap">{story.from} → {story.to} · {spec.pattern.months.length}{/[a-z]/i.test(story.from) ? ' months of messages' : '달 동안의 대화'}</p>
    </div>
  )
}

export default function LabPhone() {
  useLabFonts()
  const { key } = useParams()
  const [params] = useSearchParams()
  const variant = Number(params.get('v')) || 0
  const sample = SAMPLES.find((s) => s.key === key) || SAMPLES[0]
  return <Phone key={`${sample.key}-${variant}`} sample={sample} variant={variant} />
}

function Phone({ sample, variant }) {
  const spec = useMemo(() => designFromStory(sample.story, variant), [sample, variant])
  const today = localISODate()
  const data = useMemo(() => buildBox(sample, spec, today), [sample, spec, today])
  const [opened, setOpened] = useState(data.opened)
  const [openId, setOpenId] = useState(null)

  const item = data.items.find((i) => i.id === openId)
  const letterSpec = item && (spec.letters.find((l) => l.id === item.id) || { id: item.id, title: item.label, body: item.letter, deco: { kind: 'none' }, tilt: 0, memoryData: null })
  const open = (id) => {
    setOpenId(id)
    setOpened((o) => (o.includes(id) ? o : [...o, id]))
  }

  return (
    <div className="lp-phone" style={appTheme(spec)}>
      <LetterApp
        box={data.box}
        items={data.items}
        opened={opened}
        today={today}
        onOpen={open}
        look={{ hero: <Hero spec={spec} story={sample.story} />, pathArt: spec.stamps.map((s) => s.sticker) }}
      />
      {item && (
        <div className="lp-reader" role="dialog" aria-modal="true" aria-label={item.label} onClick={(e) => e.target === e.currentTarget && setOpenId(null)}>
          <div className="lp-reader-sheet">
            <button type="button" className="lp-reader-close" onClick={() => setOpenId(null)} aria-label="Close letter">×</button>
            <StoryLetter letter={{ ...letterSpec, body: item.letter || letterSpec.body }} spec={spec} keyBase={sample.key} from={sample.story.from} meta={item.section === 'before' ? item.stamp : item.opensOn ? formatLong(item.opensOn) : ''} reader />
          </div>
        </div>
      )}
    </div>
  )
}
