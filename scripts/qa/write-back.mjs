/* QA (needs npm run dev): the recipient's "Letters for <sender>" section, with the demo box. node scripts/qa/write-back.mjs <out dir> */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const { demoBox } = await import('../../src/pages/box/demoBox.js')
const data = demoBox('tok_live_123')
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
for (const [w, opened] of [[375, 3], [320, 3], [375, 1]]) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
  await p.setBypassServiceWorker(true)
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument(() => { localStorage.clear(); localStorage.setItem('wya_seen_tok_live_123', 'true'); localStorage.setItem('wya_film_tok_live_123', 'true'); localStorage.setItem('wya_hint_tok_live_123', 'true') })
  await p.setRequestInterception(true)
  const body = JSON.stringify({ ...data, opened: data.items.slice(0, opened).map((i) => i.id) })
  p.on('request', (q) => (q.url().includes('/api/box') ? q.respond({ status: 200, contentType: 'application/json', body }) : q.url().includes('/api/') ? q.respond({ status: 204, body: '' }) : q.continue()))
  await p.goto('http://localhost:5173/b/tok_live_123', { waitUntil: 'networkidle0', timeout: 30000 })
  await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /until|story/i.test(x.innerText))?.click())
  await new Promise((r) => setTimeout(r, 600))
  const sec = await p.$('.wb-back')
  console.log(w, 'opened', opened, sec ? 'shown' : 'hidden', errs.join(' | '))
  if (sec) {
    await sec.scrollIntoView()
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    console.log('  overflow-x', overflow)
    await sec.screenshot({ path: `${OUT}/back-${w}.jpg`, type: 'jpeg', quality: 86 })
    await p.evaluate(() => document.querySelector('.wb-back button').click())
    await new Promise((r) => setTimeout(r, 900))
    const st = await p.evaluate(() => ({ path: location.pathname + location.search, d: JSON.parse(localStorage.getItem('lbs_draft') || '{}').phase1 }))
    console.log('  after click', JSON.stringify(st))
    await p.screenshot({ path: `${OUT}/back-${w}-interview.jpg`, type: 'jpeg', quality: 80 })
  }
  await p.close()
}
await b.close()
