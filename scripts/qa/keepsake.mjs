/* QA (needs npm run dev): the two tiers on the paywall, the keepsake book (screen and PDF), the offer to add it,
 * and the recipient's "Keep them all" from the day they meet again. Demo data only (the demo box).
 *   node scripts/qa/keepsake.mjs <out dir> */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:5173'
const { demoBox } = await import('../../src/pages/box/demoBox.js')
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const page = async (w, draft = {}, api = null, local = {}) => {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
  p.errs = errs
  await p.setBypassServiceWorker(true)
  await p.setViewport({ width: w, height: 900, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument((d, l) => { localStorage.clear(); localStorage.setItem('lbs_draft', JSON.stringify(d)); for (const [k, v] of Object.entries(l)) localStorage.setItem(k, v) }, draft, local)
  await p.setRequestInterception(true)
  p.on('request', (q) => { const r = api && api(q); if (r) return q.respond(r); return q.url().includes('/api/') ? q.respond({ status: 204, body: '' }) : q.continue() })
  return p
}
const over = (p) => p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
const draft = { phase1: { fromName: 'Jordan', toName: 'Sam', startDate: '2026-12-06', endDate: '2027-04-05' }, email: 'demo@example.com' }

for (const w of [375, 320]) {
  // paywall with the two tiers
  let p = await page(w, draft)
  await p.goto(`${BASE}/paywall`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.querySelectorAll('.pw-tier input')[1]?.click()); await wait(200)
  const el = await p.$('.wf-paper')
  await el.screenshot({ path: `${OUT}/paywall-${w}.jpg`, type: 'jpeg', quality: 82 })
  console.log('paywall', w, 'overflow', await over(p), p.errs.join(' | '))
  await p.close()

  // the offer to add it (dev demo)
  p = await page(w, draft)
  await p.goto(`${BASE}/keepsake?demo=box`, { waitUntil: 'networkidle0' }); await wait(400)
  await p.screenshot({ path: `${OUT}/offer-${w}.jpg`, type: 'jpeg', quality: 80, fullPage: true })
  console.log('offer', w, 'overflow', await over(p), p.errs.join(' | '))
  await p.close()

  // the book (dev demo)
  p = await page(w, draft)
  await p.goto(`${BASE}/keepsake?demo=book`, { waitUntil: 'networkidle0' }); await wait(600)
  await p.screenshot({ path: `${OUT}/book-page-${w}.jpg`, type: 'jpeg', quality: 80, fullPage: true })
  await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.innerText === 'Open the book')?.click()); await wait(800)
  const pages = await p.evaluate(() => document.querySelectorAll('.kb-page').length)
  await p.screenshot({ path: `${OUT}/book-${w}.jpg`, type: 'jpeg', quality: 80 })
  await p.evaluate(() => document.querySelector('.kb').scrollTo(0, 900)); await wait(300)
  await p.screenshot({ path: `${OUT}/book-${w}-2.jpg`, type: 'jpeg', quality: 80 })
  console.log('book', w, 'pages', pages, 'overflow', await over(p), p.errs.join(' | '))
  if (w === 375) {
    await p.pdf({ path: `${OUT}/book.pdf`, format: 'Letter', printBackground: true })
    console.log('pdf saved', fs.statSync(`${OUT}/book.pdf`).size, 'bytes')
  }
  await p.close()

  // recipient, the day they meet again
  const d = demoBox('tok_live_123')
  const body = JSON.stringify({ ...d, keepsake: true, opened: d.items.filter((i) => i.open).map((i) => i.id), replies: [] })
  p = await page(w, {}, (q) => (q.url().includes('/api/box') ? { status: 200, contentType: 'application/json', body } : null), { wya_seen_tok_live_123: 'true', wya_film_tok_live_123: 'true', wya_hint_tok_live_123: 'true' })
  await p.goto(`${BASE}/b/tok_live_123`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /until|story/i.test(x.innerText))?.click()); await wait(600)
  const keep = await p.$('.wb-keep')
  if (keep) { await keep.scrollIntoView(); await keep.screenshot({ path: `${OUT}/recipient-keep-${w}.jpg`, type: 'jpeg', quality: 82 }) }
  console.log('recipient', w, keep ? 'shown' : 'MISSING', p.errs.join(' | '))
  await p.close()
}
await b.close()
