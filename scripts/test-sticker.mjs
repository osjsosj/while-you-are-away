/* Checks that a drawn sticker keeps only plain shapes, and that sticker ids resolve to the right file.
 * Run: node scripts/test-sticker.mjs */
import assert from 'node:assert/strict'
import { cleanSvg, safeSvg, stickerKey } from '../api/_lib/stickerDraw.js'
import { stickerSrc } from '../src/utils/stickerArt.js'
import { stickerId } from '../src/utils/decor.js'
import { providersFor } from '../src/utils/signIn.js'

let failed = 0
function test(name, fn) {
  try { fn(); console.log(`ok   ${name}`) } catch (err) { failed++; console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`) }
}

const POT = '<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8553E"/><stop offset="1" stop-color="#B8321F"/></linearGradient></defs><ellipse cx="16" cy="20" rx="12" ry="8" fill="url(#g1)"/><rect x="6" y="12" width="20" height="4" rx="2" fill="#5B5B5B"/><path d="M10 8c0-2 2-2 2-4M16 8c0-2 2-2 2-4" stroke="#BBB" stroke-width="1.5" stroke-linecap="round" fill="none"/>'

test('a plain drawing comes back as a whole svg, gradients kept in their case', () => {
  const out = cleanSvg(POT)
  assert.ok(out.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">') && out.endsWith('</svg>'))
  assert.ok(out.includes('<linearGradient id="g1"') && out.includes('fill="url(#g1)"'))
  assert.equal(cleanSvg(`<svg viewBox="0 0 32 32">${POT}</svg>`), out, 'a wrapping svg tag is tolerated')
})

test('anything that could run or load something rejects the whole drawing', () => {
  const bad = [
    `${POT}<script>alert(1)</script>`,
    `<circle cx="1" cy="1" r="1" onload="alert(1)"/>${POT}`,
    `${POT}<image href="https://x.test/a.png" width="1" height="1"/>`,
    `${POT}<use href="#g1"/>`,
    `${POT}<text x="1" y="1">hi</text>`,
    `<circle cx="1" cy="1" r="1" fill="url(https://x.test/a)"/>${POT}`,
    `<circle cx="1" cy="1" r="1" style="fill:red"/>${POT}`,
    `<circle cx="1" cy="1" r="1" fill="javascript:alert(1)"/>${POT}`,
    `<g>${POT}`,
    `${POT}<foreignObject></foreignObject>`,
    `<circle cx=1 cy=1 r=1/>${POT}`,
    `${POT}<![CDATA[x]]>`,
    '<circle cx="1" cy="1" r="1"/>',
  ]
  for (const b of bad) assert.equal(safeSvg(b), null, b.slice(0, 70))
})

test('the same subject and style map to one id; another style is another drawing', () => {
  const a = stickerKey('엄마 김치찌개', 'flat')
  assert.equal(a.id, stickerKey('  엄마   김치찌개 ', 'flat').id)
  assert.notEqual(a.id, stickerKey('엄마 김치찌개', 'noto').id)
  assert.match(a.id, /^x-[a-f0-9]{12}$/)
})

test('drawn stickers are served by the API; library ones by style', () => {
  assert.equal(stickerSrc('x-0123456789ab', 'noto'), '/api/sticker?id=x-0123456789ab')
  assert.equal(stickerId('x-0123456789ab'), 'x-0123456789ab')
  assert.equal(stickerId('x-nope'), null)
  assert.equal(stickerSrc('tangerine', 'twemoji'), '/stickers/twemoji/tangerine.svg')
})

test('sign-in buttons: Kakao, Google, Apple in Korea; Google and Apple elsewhere', () => {
  const ids = (...a) => providersFor(...a).map((p) => p.id).join(',')
  assert.equal(ids('ko-KR', 'Asia/Seoul', 'Android'), 'kakao,google,apple')
  assert.equal(ids('en-US', 'Asia/Seoul', ''), 'kakao,google,apple', 'living in Korea with an English phone')
  assert.equal(ids('en-US', 'America/New_York', 'Windows'), 'google,apple')
  assert.equal(ids('en-GB', 'Europe/London', 'iPhone'), 'apple,google')
  assert.equal(ids('kok', 'Asia/Kolkata', ''), 'google,apple', 'Konkani is not Korean')
})

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
