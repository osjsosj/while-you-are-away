/* Checks designFromStory(): different stories look different, the same story looks the same,
 * "dress it again" keeps what comes from the story, and text always reads on the paper.
 * Run: node scripts/test-design.mjs */
import assert from 'node:assert/strict'
import { stickerSrc } from '../src/utils/stickerArt.js'
import { designFromStory, contrast } from '../src/utils/design/storyDesign.js'
import { SAMPLES } from '../src/pages/lab/samples.js'

let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`) } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`) }
}

const specs = SAMPLES.map((s) => designFromStory(s.story))
const look = (d) => JSON.stringify([d.palette.accent, d.palette.accent2, d.typeKey, d.paper.lines, d.paper.edge, d.pattern.kind, d.letters.map((l) => l.deco.kind)])

test('three stories, three different looks', () => {
  assert.equal(new Set(specs.map(look)).size, 3)
  for (const d of specs) console.log(`     ${look(d)}`)
})

test('the same story gives the same design', () => {
  assert.deepEqual(designFromStory(SAMPLES[0].story), designFromStory(SAMPLES[0].story))
})

test('dressing again keeps what comes from the story', () => {
  const a = designFromStory(SAMPLES[1].story, 0)
  const b = designFromStory(SAMPLES[1].story, 1)
  assert.deepEqual(a.letters.map((l) => l.deco), b.letters.map((l) => l.deco))
  assert.equal(a.paper.edge, b.paper.edge)
  assert.notDeepEqual(a.stamps.map((s) => s.tilt), b.stamps.map((s) => s.tilt))
})

test('ink always reads on the paper (7:1 or better)', () => {
  for (const d of specs) assert.ok(contrast(d.palette.ink, d.palette.paper) >= 7, `${d.palette.ink} on ${d.palette.paper}`)
})

test('each box draws its stickers in one art style, and it can change', () => {
  for (const d of specs) assert.ok(['flat', 'color', 'noto', 'twemoji'].includes(d.art), d.art)
  assert.equal(stickerSrc('tangerine', 'noto'), '/stickers/noto/tangerine.svg')
  assert.equal(stickerSrc('blackbird', 'noto'), '/stickers/blackbird.svg', 'a subject the style lacks falls back to flat')
  assert.equal(stickerSrc('tangerine'), '/stickers/tangerine.svg')
})

test('every choice is traced to the story', () => {
  for (const d of specs) assert.ok(d.trace.length >= 8 && d.trace.every((t) => t.info && t.design))
})

test('story details land where they should', () => {
  const [a, b, c] = specs
  assert.equal(a.palette.accent !== b.palette.accent, true)
  assert.equal(b.letters.find((l) => l.id === 'b2').deco.kind, 'quote') // "밥은 먹었니"
  assert.equal(b.letters.find((l) => l.id === 'b1').deco.kind, 'ticket') // the airport, by plane
  assert.equal(b.paper.edge, 'torn') // two goodbyes before this one
  assert.equal(b.route.length, 3)
  assert.equal(c.paper.stain, 'rain') // the festival it rained on
  assert.equal(a.pattern.kind, 'rings') // 2.7 years
  assert.equal(c.pattern.kind, 'ribbon') // 1.4 years
})

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
