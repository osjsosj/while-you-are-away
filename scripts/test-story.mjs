/* Checks story.js and the box rules around it: findings, letters made in advance, pins,
 * and that unwritten letters never reach the recipient. Run: node scripts/test-story.mjs */
import assert from 'node:assert/strict'
import { applyStoryToPlan, cleanPins, draftWithStory, letterFromFinding, normalizeStory, statFacts, storyFindings } from '../src/utils/story.js'
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

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
