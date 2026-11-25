/* Checks the letter forms against docs/letter-design-rules.md on six contrasting made-up boxes.
 * Run: node scripts/test-forms.mjs */
import assert from 'node:assert/strict'
import { recipientView } from '../src/utils/boxModel.js'
import { letterForm, FORMS, splitSub, openWhenReason, toIso, whoSays } from '../src/utils/design/letterForm.js'
import { LETTER_STORIES } from '../src/pages/lab/letterStories.js'

let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`) } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`) }
}

const boxes = LETTER_STORIES.map((s) => {
  const { box, items } = recipientView(s.draft, s.today)
  const ctx = { fromName: box.fromName, toName: box.toName, partDate: box.partDate, returnDate: box.returnDate, transport: box.decor?.ticket?.kind, nickname: box.look?.seal?.text, seal: box.look?.seal, stamps: box.look?.stamps, months: box.look?.pattern?.months }
  const letters = items.filter((it) => it.open && !it.empty).map((it) => ({ item: it, form: letterForm(it, ctx) }))
  return { key: s.key, box, letters }
})

test('a box with five or more letters of different kinds shows at least three compositions', () => {
  for (const b of boxes) {
    if (b.letters.length < 5) continue
    const kinds = new Set(b.letters.map((l) => l.form.form))
    assert.ok(kinds.size >= 3, `${b.key}: only ${[...kinds].join(', ')}`)
  }
})

test('no two boxes run the same sequence of forms', () => {
  const seqs = boxes.map((b) => b.letters.map((l) => l.form.form).join(' '))
  assert.equal(new Set(seqs).size, seqs.length, seqs.join('\n'))
})

test('boxes with a story get their own stationery (faces, colour, paper)', () => {
  const looks = boxes.filter((b) => b.box.look).map((b) => `${b.box.look.typeKey}|${b.box.look.palette.accentRaw}|${b.box.look.paper.lines}`)
  assert.equal(new Set(looks).size, looks.length, looks.join('\n'))
})

test('every form appears in some box', () => {
  const seen = new Set(boxes.flatMap((b) => b.letters.map((l) => l.form.form)))
  for (const f of FORMS.filter((x) => x !== 'classic')) assert.ok(seen.has(f), `never picked: ${f}`)
})

test('no slot shows a fact the story lacks', () => {
  for (const b of boxes) {
    for (const { item, form } of b.letters) {
      const flat = JSON.stringify(form.head)
      assert.doesNotMatch(flat, /undefined|null|NaN|Invalid Date/, `${b.key} ${item.id}: ${flat}`)
      if (form.form === 'ticket') assert.equal(!!form.head.returns, !!b.box.returnDate, `${b.key}: return date shown without one`)
      if (form.form === 'sealed' && !b.box.look) assert.equal(form.head.seal, undefined, `${b.key}: a seal with no story`)
      if (form.form === 'postcard') assert.ok(item.pins.some((p) => p.kind === 'memory' && p.text === form.head.title), `${b.key}: postcard title not from a pinned moment`)
    }
  }
})

test('a box with no chat still varies its letters from the basics alone', () => {
  const b = boxes.find((x) => x.key === 'tyler-jess')
  assert.equal(b.box.look, null)
  const kinds = new Set(b.letters.map((l) => l.form.form))
  assert.ok(kinds.size >= 4, [...kinds].join(', '))
  assert.ok(!kinds.has('classic'), 'a dated weekly letter should be a calendar leaf')
})

test('a pin the head uses is not repeated below it', () => {
  for (const b of boxes) for (const { item, form } of b.letters) {
    const used = (item.pins || []).filter((p) => !form.pins.includes(p))
    for (const p of used) assert.ok(JSON.stringify(form.head).includes(p.text.slice(0, 12)) || p.kind === 'stat', `${b.key} ${item.id}: dropped pin ${p.text}`)
  }
})

test('helpers read facts as given', () => {
  assert.deepEqual(splitSub('Lakefront Trail · Apr 2, 2023'), { place: 'Lakefront Trail', date: 'Apr 2, 2023' })
  assert.deepEqual(splitSub('The diner on Clark'), { place: 'The diner on Clark', date: '' })
  assert.deepEqual(splitSub('Dec 21, 2024'), { place: '', date: 'Dec 21, 2024' })
  assert.equal(openWhenReason('Open when you can’t sleep'), 'you can’t sleep')
  assert.equal(openWhenReason('For a rainy Sunday'), 'For a rainy Sunday')
  assert.equal(toIso('Apr 2, 2023'), '2023-04-02')
  assert.equal(toIso('the diner'), '')
  assert.equal(whoSays('Emma', { toName: 'Emma', fromName: 'Sam' }), 'you say this a lot')
  assert.equal(whoSays('Sam', { toName: 'Emma', fromName: 'Sam' }), 'I say this a lot')
  assert.equal(whoSays('Mom', { toName: 'Diego', fromName: 'Mom' }), 'I say this a lot')
  assert.equal(whoSays('Dad', { toName: 'Diego', fromName: 'Mom' }), 'Dad says this a lot')
  assert.equal(whoSays('Your running joke', {}), 'Your running joke')
})

test('the seed only moves small things: the same letter always gets the same form and side', () => {
  const b = boxes[0]
  const ctx = { fromName: b.box.fromName, toName: b.box.toName, partDate: b.box.partDate, returnDate: b.box.returnDate }
  for (const { item } of b.letters) {
    const a = letterForm(item, ctx), c = letterForm(item, ctx)
    assert.equal(a.form, c.form); assert.equal(a.side, c.side)
  }
})

if (failed) { console.log(`\n${failed} failed`); process.exit(1) } else console.log('\nall passed')
