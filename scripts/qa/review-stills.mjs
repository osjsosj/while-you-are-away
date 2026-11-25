/* QA (needs npm run dev): the still captures for the design review page. node scripts/qa/review-stills.mjs <out dir> [editor] */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { DRAFT } from '../shots/story.mjs'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
const lab = [
  ['tk-plane-night', 'sam-emma', 't0'], ['tk-bus-flowers', 'maria-diego', 't0'], ['tk-train-quiet', 'walt-lily', 't0'], ['tk-plane-scrapbook', 'priya-anika', 't0'], ['tk-none-night', 'tyler-jess', 't0'],
  ['env-night', 'sam-emma', 's0'], ['env-flowers', 'maria-diego', 's0'], ['env-quiet', 'walt-lily', 's0'],
  ['say-you', 'sam-emma', 'w1'], ['say-i', 'maria-diego', 'w1'], ['say-scrap', 'nora-luke', 'w1'],
  ['pc-photo', 'sam-emma', 'w0'], ['pc-quiet', 'walt-lily', 'w0'], ['pc-scrap', 'priya-anika', 'w0'],
  ['tally-scrap', 'priya-anika', 'w2'], ['leaf-none', 'tyler-jess', 'w0'], ['sealed-scrap', 'nora-luke', 'l0'], ['folded-scrap', 'nora-luke', 'n0'],
  ['edge-ticket', 'edge-cases', 't0'], ['edge-saying', 'edge-cases', 'w1'], ['edge-envelope', 'edge-cases', 's0'], ['edge-postcard', 'edge-cases', 'w0'],
]
for (const [name, s, id] of (process.argv[3] === 'editor' ? [] : lab)) {
  const p = await b.newPage()
  await p.setViewport({ width: 375, height: 1200, deviceScaleFactor: 2, isMobile: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.goto(`http://localhost:5173/lab/letters?s=${s}&id=${encodeURIComponent(id)}`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready)
  await new Promise((r) => setTimeout(r, 400))
  await (await p.$('[data-letter]')).screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 86 })
  await p.close()
}
// the recipient's path: unread letters show their paper
if (process.argv[3] !== 'editor') {
  const p = await b.newPage()
  await p.setViewport({ width: 375, height: 2600, deviceScaleFactor: 2, isMobile: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument(() => { localStorage.setItem('wya_seen_demo', 'true'); localStorage.setItem('wya_film_demo', 'true'); localStorage.setItem('wya_install_hint', 'true') })
  await p.goto('http://localhost:5173/b/demo', { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1200))
  const step = await p.evaluateHandle(() => [...document.querySelectorAll('.la-step')].find((s) => /Week 2/.test(s.innerText)))
  const r = await step.boundingBox()
  await p.screenshot({ path: `${OUT}/path-paper.jpg`, type: 'jpeg', quality: 86, clip: { x: 0, y: Math.max(0, r.y - 380), width: 375, height: 640 } })
  await p.close()
}
// the editor says how a letter arrives; the decorating step shows the ticket
for (const [name, route, label, sel] of [['editor-plain', '/editor', 'Week 1', '.we-sheet'], ['editor-pinned', '/editor', 'Bikes on the Lakefront Trail', '.we-sheet'], ['decorate', '/generate', null, '.gn-preview']]) {
  const p = await b.newPage()
  await p.setViewport({ width: 375, height: 1000, deviceScaleFactor: 2, isMobile: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument((d) => { localStorage.clear(); localStorage.setItem('lbs_draft', JSON.stringify(d)) }, DRAFT)
  await p.setRequestInterception(true)
  p.on('request', (q) => (q.url().includes('/api/') ? q.respond({ status: 503, body: '{}' }) : q.continue()))
  await p.goto('http://localhost:5173' + route, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 1500))
  if (label) {
    await p.evaluate((label) => { const all = [...document.querySelectorAll('button, [role=button], li')]; const el = all.find((e) => e.innerText.trim().startsWith(label) && /bikes|Bikes|Lakefront/.test(e.innerText)) || all.find((e) => e.innerText.trim().startsWith(label)); el?.click() }, label)
    await new Promise((r) => setTimeout(r, 900))
  }
  const el = await p.$(sel)
  if (el) { const bb = await el.boundingBox(); await p.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: 86, clip: { x: bb.x, y: bb.y, width: bb.width, height: Math.min(bb.height, 760) } }) }
  console.log(name, !!el, await p.evaluate(() => document.querySelector('.we-arrives')?.innerText || ''))
  await p.close()
}
await b.close()
console.log('stills done')
