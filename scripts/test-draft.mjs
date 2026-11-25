/* Checks cleanDraft(): a damaged save becomes a draft every page can read, and the sender's words survive.
 * Run: node scripts/test-draft.mjs */
import assert from 'node:assert/strict'
import { cleanDraft } from '../src/utils/draftShape.js'

let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`) } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`) }
}

test('anything that is not an object becomes an empty draft', () => {
  for (const v of [null, undefined, 42, 'x', [], true]) assert.deepEqual(cleanDraft(v), {})
})

test('fields of the wrong kind are dropped, not guessed', () => {
  const d = cleanDraft({ phase1: 'x', plan: 'weekly', capsuleData: [], diary: {}, story: 'hi', decor: 7, interviewChat: 'x' })
  assert.deepEqual(d, {})
})

test('names and dates must be real', () => {
  const d = cleanDraft({ phase1: { fromName: 5, toName: 'Emma', startDate: '2026-02-30', endDate: '2026-04-30' } })
  assert.deepEqual(d.phase1, { toName: 'Emma', endDate: '2026-04-30' })
})

test('the sender’s words survive; broken pieces around them go', () => {
  const d = cleanDraft({ capsuleData: { w0: null, t0: { letter: 'Hey, you.', pins: 'x' }, w1: { letter: 5, pins: [null, { kind: 'quote', text: 'hi' }] } } })
  assert.deepEqual(d.capsuleData, { t0: { letter: 'Hey, you.' }, w1: { pins: [{ kind: 'quote', text: 'hi' }] } })
})

test('diary entries need a real day; chat lines need a role and words', () => {
  const d = cleanDraft({ diary: [null, { writtenOn: 'yesterday', body: 'x' }, { writtenOn: '2026-01-01', body: 3 }, { writtenOn: '2026-01-02', body: 'kept' }], interviewChat: [{ role: 'user', content: 'hi' }, { role: 'x', content: 'no' }, 'nope'] })
  assert.deepEqual(d.diary, [{ writtenOn: '2026-01-01', body: '' }, { writtenOn: '2026-01-02', body: 'kept' }])
  assert.deepEqual(d.interviewChat, [{ role: 'user', content: 'hi' }])
})

test('a good draft passes through unchanged', () => {
  const good = { phase1: { fromName: 'Sam', toName: 'Emma', startDate: '2026-01-08', endDate: '2026-04-30' }, capsuleData: { t0: { letter: 'Hi', pins: [] } }, diary: [{ id: 'd0', writtenOn: '2026-01-01', body: 'x' }], story: { memories: [{ id: 'm', title: 't' }], stats: { byMonth: [] } }, plan: { anytime: [{ id: 's0', label: 'Open when' }], scheduled: { enabled: true } }, paymentSessionId: 'cs_1', _savedAt: 5 }
  assert.deepEqual(cleanDraft(good), good)
})

if (failed) { console.log(`\n${failed} failed`); process.exit(1) } else console.log('\nall passed')
