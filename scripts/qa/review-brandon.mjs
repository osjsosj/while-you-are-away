/* QA (needs npm run dev): captures every screen changed by the What Brandon Thinks adoptions, for review.
 *   node scripts/qa/review-brandon.mjs <out dir> <a LINE .txt sample>
 * Uses made-up data only (the Sam → Emma story); the handover page is shown with a faked sign-in. */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
import { DRAFT } from '../shots/story.mjs'
import { LETTER_STORIES } from '../../src/pages/lab/letterStories.js'

const [OUT, LINEFILE] = process.argv.slice(2)
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:5173'
const stats = LETTER_STORIES[0].draft.story.stats
const ev = (quote, date) => ({ quote, date })
const story = {
  ...DRAFT.story,
  stats,
  memories: DRAFT.story.memories.map((m, i) => ({ ...m, evidence: i === 0 ? ev('we got so lost lol', '2023-04-02') : i === 1 ? ev('pancakes. now. the place on clark', '2023-09-09') : null })),
  catchphrases: DRAFT.story.catchphrases.map((c, i) => ({ ...c, evidence: i === 0 ? ev('text me when you’re home', '2023-03-12') : null })),
  plans: [{ id: 'lisbon', text: 'go to Lisbon someday', who: 'Sam', date: '2024-06-02', place: 'Lisbon', evidence: ev('we should go to Lisbon someday', '2024-06-02') }, { id: 'cabin', text: 'the cabin trip in the snow', who: 'Emma', date: '2024-12-21', place: '', evidence: ev('next winter we rent a cabin. promise', '2024-12-21') }],
  repair: { how: 'One of you sends a photo of the sky, and the other answers with a heart.', evidence: ev('sending you the sky', '2024-07-01') },
}
const draft = { ...DRAFT, story }

const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
const page = async ({ w = 375, h = 1800, d = draft, local = {}, api = null } = {}) => {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument((d, local) => { localStorage.clear(); localStorage.setItem('lbs_draft', JSON.stringify(d)); for (const [k, v] of Object.entries(local)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)) }, d, local)
  await p.setRequestInterception(true)
  p.on('request', (q) => {
    if (api) { const r = api(q); if (r) return q.respond(r) }
    return q.url().includes('/api/') ? q.respond({ status: 503, body: '{}' }) : q.continue()
  })
  return p
}
const shot = async (p, sel, name, maxH = 1400) => {
  const el = await p.$(sel)
  if (!el) { console.log('missing', name, sel); return }
  const bb = await el.boundingBox()
  await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 86, clip: { x: Math.max(0, bb.x - 4), y: Math.max(0, bb.y - 4), width: Math.min(bb.width + 8, 375), height: Math.min(bb.height + 8, maxH) } })
  console.log('saved', name)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const clickText = (p, re) => p.evaluate((src) => { const r = new RegExp(src); const el = [...document.querySelectorAll('button, [role=radio], a')].find((e) => r.test(e.innerText.trim())); el?.click(); return !!el }, re.source)

// 1. sources and Instagram steps, the notices
{
  const p = await page({ d: { ...draft, story: undefined } })
  await p.goto(`${BASE}/chats`, { waitUntil: 'networkidle0' })
  await clickText(p, /^Instagram$/); await wait(300)
  await shot(p, '.ci', 'b-apps-instagram')
  await clickText(p, /^LINE$/); await wait(300)
  await shot(p, '.ci-guide', 'b-apps-line')
  // too few messages
  await p.evaluate(() => {})
  await p.close()
}
// 2. who is who (renamed contact hint), too few, then preview, search with a kept line
{
  const p = await page({ d: { ...draft, story: undefined } })
  await p.goto(`${BASE}/chats`, { waitUntil: 'networkidle0' })
  await (await p.$('input[type=file]')).uploadFile(LINEFILE)
  await p.waitForFunction(() => /Who is who/.test(document.body.innerText), { timeout: 15000 })
  await shot(p, '.ci', 'b-who')
  await clickText(p, /^That’s right$/)
  await p.waitForFunction(() => document.querySelector('#ci-search-q'), { timeout: 15000 })
  await shot(p, '.ci-next', 'b-optin')
  await p.type('#ci-search-q', 'lisbon'); await wait(400)
  await p.evaluate(() => document.querySelector('.ci-hit button')?.click()); await wait(300)
  await shot(p, '.ci-search', 'b-search')
  await p.close()
}
// 3. the same chat again: only what's new
{
  const fp = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) } return (h >>> 0).toString(36) }
  const p = await page({ d: { ...draft, story: undefined, chatSource: { fp: fp('2024-03-01T21:12|did you get home okay?'), lastAt: '2024-03-25T23:40' } } })
  await p.goto(`${BASE}/chats`, { waitUntil: 'networkidle0' })
  await (await p.$('input[type=file]')).uploadFile(LINEFILE)
  await p.waitForFunction(() => /Who is who/.test(document.body.innerText), { timeout: 15000 })
  await clickText(p, /^That’s right$/)
  await p.waitForFunction(() => document.querySelector('.ci-new'), { timeout: 15000 })
  await shot(p, '.ci', 'b-reimport', 700)
  await p.close()
}
// 4. the numbers screen with the new counts
{
  const p = await page({ d: { ...draft, story: undefined }, local: { 'wya-chat-v1': { excerpts: 'x', stats, names: { me: 'Sam', them: 'Emma' }, source: 'imessage', messages: 6240, kept: [] } } })
  await p.goto(`${BASE}/chats`, { waitUntil: 'networkidle0' }); await wait(800)
  await shot(p, '.ci-facts', 'b-numbers', 2400)
  await p.close()
}
// 5. findings with evidence, plans and making up (editor panel)
{
  const p = await page({ h: 2400 })
  await p.goto(`${BASE}/editor`, { waitUntil: 'networkidle0' }); await wait(1200)
  await p.evaluate(() => document.querySelector('button.we-story')?.click()); await wait(900)
  const groups = await p.evaluate(() => [...document.querySelectorAll('.we-find-gh')].map((h) => h.innerText))
  console.log('finding groups:', groups.join(' / '))
  await shot(p, '.we-find-wrap .we-find, .we-find', 'b-findings', 2400)
  // the two new groups on their own, so nothing is cut off
  for (const [title, name] of [['Plans you made', 'b-plans'], ['How you make up', 'b-repair']]) {
    const ok = await p.evaluate((t) => { const h = [...document.querySelectorAll('.we-find-gh')].find((x) => x.innerText.trim() === t); if (!h) return false; const g = h.parentElement; g.setAttribute('data-shot', t); g.scrollIntoView({ block: 'center' }); return true }, title)
    if (ok) { await wait(300); await shot(p, `[data-shot="${title}"]`, name, 1400) }
  }
  await p.close()
}
// 6. privacy
{
  const p = await page({ h: 2600 })
  await p.goto(`${BASE}/privacy`, { waitUntil: 'networkidle0' }); await wait(500)
  const found = await p.evaluate(() => { const el = [...document.querySelectorAll('p, li')].find((e) => e.innerText.startsWith('Chats you bring in')); if (!el) return false; el.parentElement.setAttribute('data-shot', '1'); return true })
  if (found) await shot(p, '[data-shot]', 'b-privacy', 1600)
  await p.close()
}
// 7. making a new link (the handover page's development demo: no account, nothing sent)
{
  const p = await page()
  await p.goto(`${BASE}/export?demo=live`, { waitUntil: 'networkidle0' }); await wait(1200)
  if (await clickText(p, /Make a new link$/)) {
    await wait(300)
    await shot(p, '.wh-link-box', 'b-relink-ask')
    await clickText(p, /^Make a new link$/); await wait(600)
    await shot(p, '.wh-link-box', 'b-relink-done')
  } else console.log('handover page not live:', await p.evaluate(() => document.querySelector('main')?.innerText.slice(0, 200)))
  await p.close()
}
// 8. letters: the new margin notes
for (const [name, id] of [['b-note-love', 'l0'], ['b-note-hours', 't0'], ['b-note-asked', 'w1']]) {
  const p = await page()
  await p.goto(`${BASE}/lab/letters?s=sam-emma&id=${id}`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready); await wait(300)
  await shot(p, '[data-letter]', name, 2000)
  await p.close()
}
await b.close()
console.log('done')
