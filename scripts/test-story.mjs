/* Checks story.js and the box rules around it: findings, letters made in advance, pins,
 * and that unwritten letters never reach the recipient. Run: node scripts/test-story.mjs */
import assert from 'node:assert/strict'
import { applyStoryToPlan, cleanPins, draftWithStory, storyFromDraft, stickersToDraw, letterFromFinding, normalizeStory, statFacts, storyFindings } from '../src/utils/story.js'
import { normalizePlan } from '../src/utils/plan.js'
import { recipientView } from '../src/utils/boxModel.js'
import { SAMPLE_STORY } from '../src/pages/lab/sampleStory.js'

let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`) } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`) }
}

const story = normalizeStory(SAMPLE_STORY)
const basePlan = normalizePlan({ tonight: true, last: true, scheduled: { enabled: true, schedule: 'weekly', count: 4 }, neverSaid: [{ id: 'n0', label: 'Mine' }], anytime: [], occasions: [] })

test('findings are grouped and every one can become a pin', () => {
  const g = storyFindings(story)
  assert.deepEqual(g.map((x) => x.id), ['moments', 'sayings', 'goodbyes', 'numbers'])
  for (const it of g.flatMap((x) => x.items)) assert.ok(it.pin.kind && it.pin.text, it.key)
})

test('numbers are shared facts, worded for a letter', () => {
  const f = statFacts(story.stats).map((x) => x.id)
  assert.ok(f.includes('calls') && f.includes('first') && f.includes('late'))
  assert.equal(statFacts(story.stats).find((x) => x.id === 'calls').text, '23 hours')
})

test('letters are made in advance once, each with its finding pinned', () => {
  const { plan, pins } = applyStoryToPlan(basePlan, story)
  const made = [...plan.neverSaid, ...plan.anytime].filter((x) => x.from)
  assert.equal(made.length, 6) // 4 moments + 1 goodbye + 1 saying
  for (const m of made) assert.equal(pins[m.id].length, 1)
  const goodbye = made.find((m) => m.from.startsWith('parting:'))
  assert.equal(goodbye.from, 'parting:p2', 'the first goodbye shares its day with the airport moment, so the next one gets the letter')
  const again = applyStoryToPlan(normalizePlan(plan), story)
  assert.equal([...again.plan.neverSaid, ...again.plan.anytime].length, [...plan.neverSaid, ...plan.anytime].length, 'running it again adds nothing')
  assert.ok(normalizePlan(plan).neverSaid.some((x) => x.from), 'the story link survives normalizePlan')
})

test('a saying starts an open-when letter, a moment a never-said one', () => {
  const g = storyFindings(story)
  assert.equal(letterFromFinding(g[1].items[0]).list, 'anytime')
  assert.equal(letterFromFinding(g[0].items[0]).list, 'neverSaid')
})

test('pins: known kinds, no repeats, at most three', () => {
  const p = { kind: 'stat', ref: 'calls', text: '23 hours', sub: 'x' }
  assert.equal(cleanPins([p, p, { kind: 'bad', text: 'x' }]).length, 1)
  assert.equal(cleanPins([1, 2, 3, 4].map((i) => ({ kind: 'quote', ref: `q${i}`, text: `t${i}` }))).length, 3)
})

test('unwritten letters never reach the recipient; pins ride along on written ones', () => {
  const { plan, pins } = applyStoryToPlan(basePlan, story)
  const stewId = Object.keys(pins).find((id) => pins[id][0].text === '엄마 김치찌개')
  const draft = {
    phase1: { fromName: '지수', toName: '엄마', startDate: '2026-12-20', endDate: '2027-06-20' },
    plan,
    capsuleData: {
      t0: { letter: '오늘 밤에 읽어.' },
      [stewId]: { letter: '엄마 맛이 안 나.', pins: [...pins[stewId], { kind: 'stat', ref: 'calls', text: '23 hours', sub: 'on the phone' }] },
    },
  }
  const v = recipientView(draft, '2027-01-10')
  assert.deepEqual(v.items.map((i) => i.id).sort(), ['t0', stewId].sort())
  const stew = v.items.find((i) => i.id === stewId)
  assert.deepEqual(stew.pins.map((p) => p.text), ['23 hours'], 'the moment that is already the title is not repeated')
  // a sealed letter that is written shows only its name; an unwritten sealed one is not there at all
  draft.capsuleData.w3 = { letter: 'week four' }
  const v2 = recipientView(draft, '2027-01-10')
  const w3 = v2.items.find((i) => i.id === 'w3')
  assert.ok(w3 && !w3.open && !('letter' in w3))
  assert.ok(!v2.items.some((i) => i.id === 'w2'))
})

test('a story from the AI goes into the draft: about kept, letters made, pins on them', () => {
  const ai = { about: '  매일 밥 먹었냐고 묻는 사이.  ', callEachOther: '엄마, 딸', memories: SAMPLE_STORY.memories, catchphrases: SAMPLE_STORY.catchphrases, partings: SAMPLE_STORY.partings, stats: SAMPLE_STORY.stats }
  assert.equal(normalizeStory(ai).about, '매일 밥 먹었냐고 묻는 사이.')
  const draft = { plan: basePlan, capsuleData: { t0: { letter: 'kept' } } }
  const patch = draftWithStory(draft, ai)
  assert.equal(patch.story, ai)
  assert.equal(patch.capsuleData.t0.letter, 'kept', 'letters already written stay')
  const made = [...patch.plan.neverSaid, ...patch.plan.anytime].filter((x) => x.from)
  assert.equal(made.length, 6)
  for (const m of made) assert.equal(patch.capsuleData[m.id].pins.length, 1)
  assert.equal(draftWithStory(draft, { memories: [] }), null, 'an empty story changes nothing')
})

test('the box look: colors from pinned moments, stamps only for letters already open, no trace', () => {
  const { plan, pins } = applyStoryToPlan(basePlan, story)
  const stew = Object.keys(pins).find((id) => pins[id][0].text === '엄마 김치찌개')
  const airport = Object.keys(pins).find((id) => pins[id][0].text === '인천공항 배웅')
  const draft = {
    phase1: { fromName: '지수', toName: '엄마', relationship: 'A parent', startDate: '2026-12-20', endDate: '2027-06-20' },
    plan, story: SAMPLE_STORY, decor: { style: 'flowers' },
    capsuleData: { [stew]: { letter: '엄마 맛', pins: pins[stew] }, [airport]: { letter: '게이트 앞', pins: pins[airport] }, t0: { letter: '오늘 밤' } },
  }
  const look = recipientView(draft, '2027-01-10').box.look
  assert.ok(look.theme['--lamp'] && look.theme['--night'], 'theme variables')
  assert.ok(!('trace' in look), 'which fact made which choice stays with the sender')
  assert.equal(look.typeKey, 'warm', 'a parent gets the warm pairing')
  const openIds = recipientView(draft, '2027-01-10').items.filter((i) => i.open).map((i) => i.id)
  const expect = [stew, airport].filter((id) => openIds.includes(id)).length
  assert.equal(look.stamps.length, expect, 'a stamp for each open letter with a pinned moment, none for sealed ones')
  assert.equal(recipientView({ ...draft, story: null }, '2027-01-10').box.look, null)
})

const TALK = {
  timeline: [{ date: '2023-06-04', label: '공항에서 배웅한 날' }, { date: '2022-10-03', label: '첫 가족 여행' }],
  places: [{ name: '제주', date: '2022-10-03' }, { name: '한강 공원', date: '' }],
  jokes: '엄마의 펭귄 춤',
  nicknames: '우리 딸, 엄마',
  shared: '귤, 김치찌개',
}

test('the planning talk becomes findings: days and places as moments, the joke as a saying', () => {
  const st = storyFromDraft({ phase2: TALK })
  assert.equal(st.hasChat, false)
  assert.deepEqual(st.memories.map((m) => m.title), ['공항에서 배웅한 날', '첫 가족 여행', '제주', '한강 공원'])
  assert.ok(st.memories.every((m) => m.from === 'talk'))
  assert.equal(st.catchphrases[0].text, '엄마의 펭귄 춤')
  const joke = storyFindings(st).find((g) => g.id === 'sayings').items[0]
  assert.equal(joke.sub, 'Your running joke')
  assert.equal(letterFromFinding(joke).label, 'Open when you need a laugh')
})

test('with a chat too: chat findings first, a talk moment on the same day is kept once', () => {
  const st = storyFromDraft({ story: SAMPLE_STORY, phase2: TALK })
  assert.equal(st.hasChat, true)
  const titles = st.memories.map((m) => m.title)
  assert.ok(titles.includes('인천공항 배웅') && !titles.includes('공항에서 배웅한 날'), 'same day as the chat airport moment')
  assert.ok(titles.includes('첫 가족 여행'))
})

test('without a chat, what they said is theirs still colors the box', () => {
  const plain = recipientView({ phase1: { fromName: '지수', toName: '엄마' }, plan: basePlan, capsuleData: { t0: { letter: 'x' } } }, '2027-01-10').box.look
  assert.equal(plain, null, 'nothing known: the usual look')
  const look = recipientView({ phase1: { fromName: '지수', toName: '엄마', relationship: 'A parent' }, phase2: TALK, plan: basePlan, capsuleData: { t0: { letter: 'x' } } }, '2027-01-10').box.look
  assert.ok(look && look.theme['--lamp'], 'a theme from the talk alone')
  assert.equal(look.seal.text, '우리 딸', 'the seal says what they call each other')
  assert.equal(look.stamps.length, 0, 'no stamps until a moment is on an open letter')
})

test('moments with no sticker get one drawn, once, and it shows everywhere', () => {
  const draft = { phase2: { timeline: [{ date: '2022-10-03', label: '할머니 댁 감나무' }] } }
  const st = storyFromDraft(draft)
  const todo = stickersToDraw(st)
  assert.deepEqual(todo, [{ id: 'talk-t0', subject: '할머니 댁 감나무' }])
  const drawn = storyFromDraft({ ...draft, drawnStickers: { 'talk-t0': 'x-0123456789ab' }, drawTried: ['talk-t0'] })
  assert.equal(drawn.memories[0].sticker, 'x-0123456789ab')
  assert.deepEqual(stickersToDraw(drawn, ['talk-t0']), [], 'nothing left to draw')
  assert.deepEqual(stickersToDraw(st, ['talk-t0']), [], 'a failed try is not repeated')
  assert.equal(storyFromDraft({ ...draft, drawnStickers: { 'talk-t0': '<svg>' } }).memories[0].sticker, '', 'only real drawn ids')
})

// ── plans, evidence and making up (adopted from What Brandon Thinks as letter material) ──
{
  const { checkEvidence } = await import('../api/_lib/chatStory.js')
  const excerpts = '2023-04-02 21:14 Emma: we got so lost lol\n2024-06-02 22:01 Sam: we should go to Lisbon someday\n2024-07-01 23:30 Emma: sending you the sky'
  const reply = () => ({
    about: '', callEachOther: '',
    memories: [{ id: 'bikes', title: 'Bikes', date: '2023-04-02', place: '', sticker: '', prompt: '', evidence: { quote: 'we got so lost lol', date: '2023-04-02' } }],
    catchphrases: [{ id: 'q', who: 'Emma', text: 'drive safe', evidence: { quote: 'drive safe!!', date: '2024-01-01' } }],
    partings: [],
    plans: [{ id: 'lisbon', text: 'Lisbon someday', who: 'Sam', date: '2024-06-02', place: 'Lisbon', evidence: { quote: 'We should go to   Lisbon someday', date: '2024-06-02' } }],
    repair: { how: 'One of you sends a photo of the sky', evidence: { quote: 'sending you the sky', date: '2024-07-01' } },
  })
  test('evidence is kept only when the line is really in the excerpts', () => {
    const r = checkEvidence(reply(), excerpts)
    assert.equal(r.memories[0].evidence.quote, 'we got so lost lol')
    assert.equal(r.catchphrases[0].evidence.quote, '', 'a quote the chat does not hold is dropped')
    assert.ok(r.plans[0].evidence.quote, 'spacing and case may differ')
  })
  test('how they make up is cleared unless the sender asked for it', () => {
    assert.equal(checkEvidence(reply(), excerpts, false).repair.how, '')
    assert.equal(checkEvidence(reply(), excerpts, true).repair.how, 'One of you sends a photo of the sky')
  })
  test('plans and evidence survive normalizing and become findings and pins', () => {
    const story = normalizeStory(checkEvidence(reply(), excerpts, true))
    assert.equal(story.plans[0].text, 'Lisbon someday')
    assert.equal(story.memories[0].evidence.date, '2023-04-02')
    const groups = storyFindings(story)
    const plans = groups.find((g) => g.id === 'plans')
    assert.equal(plans.items[0].pin.kind, 'plan')
    assert.ok(groups.find((g) => g.id === 'repair'))
    assert.equal(cleanPins([plans.items[0].pin])[0].kind, 'plan')
    assert.equal(storyFindings(normalizeStory(checkEvidence(reply(), excerpts, false))).find((g) => g.id === 'repair'), undefined)
  })
}

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
