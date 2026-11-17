/* Checks foldUnit(): a long path folds read and sealed stretches but never hides today's letter.
 * Run: node scripts/test-journey.mjs */
import assert from 'node:assert/strict'
import { foldUnit } from '../src/pages/box/journey.js'

let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`) } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`) }
}

const node = (id, open) => ({ item: { id, open, opensOn: `2026-12-${String(id).padStart(2, '0')}` } })
const unit = (id, n, openUpTo) => ({ id, nodes: Array.from({ length: n }, (_, k) => node(k + 1, k + 1 <= openUpTo)) })
const shown = (rows) => rows.map((r) => (r.node ? r.node.item.id : `[${r.fold.kind} ${r.fold.nodes.length}]`))

test('a short unit is left alone', () => {
  const u = unit('apart', 4, 2)
  assert.deepEqual(shown(foldUnit(u, new Set([1]), 2)), [1, 2, 3, 4])
})

test('a fully read unit folds to one row', () => {
  const u = unit('before', 14, 14)
  const all = new Set(u.nodes.map((n) => n.item.id))
  assert.deepEqual(shown(foldUnit(u, all, 'elsewhere')), ['[unit 14]'])
})

test('day 29 of 60: read run and sealed run fold, today stays', () => {
  const u = unit('apart', 60, 30)
  const read = new Set(Array.from({ length: 28 }, (_, k) => k + 1))
  const rows = foldUnit(u, read, 29)
  // 1–30 are open (30 opened today, unread), so the next three sealed are 31–33
  assert.deepEqual(shown(rows), ['[read 26]', 27, 28, 29, 30, 31, 32, 33, '[sealed 27]'])
})

test('opening a fold shows its letters', () => {
  const u = unit('apart', 60, 30)
  const read = new Set(Array.from({ length: 28 }, (_, k) => k + 1))
  const rows = foldUnit(u, read, 29, new Set(['apart:read', 'apart:sealed']))
  assert.equal(rows.length, 60)
  assert.ok(rows.every((r) => r.node))
})

test("today's letter is never inside a fold", () => {
  for (let cur = 1; cur <= 60; cur++) {
    const u = unit('apart', 60, cur)
    const read = new Set(Array.from({ length: cur - 1 }, (_, k) => k + 1))
    const rows = foldUnit(u, read, cur)
    assert.ok(rows.some((r) => r.node?.item.id === cur), `day ${cur}`)
  }
})

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
