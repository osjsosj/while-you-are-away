/* QA (needs npm run dev): the first letter, written in the first steps, on its ticket. node scripts/qa/first-letter.mjs <out dir> */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const iso = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
const draft = { phase1: { reasonId: 'study', relationship: 'A partner', letterIds: ['tonight', 'scheduled'], fromName: 'Sam', toName: 'Emma', startDate: iso(10), endDate: iso(130) } }
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
for (const w of [375, 320]) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
  await p.setViewport({ width: w, height: 1400, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument((d) => { localStorage.clear(); localStorage.setItem('lbs_draft', JSON.stringify(d)) }, draft)
  await p.setRequestInterception(true)
  p.on('request', (q) => (q.url().includes('/api/') ? q.respond({ status: 204, body: '' }) : q.continue()))
  await p.goto('http://localhost:5173/interview', { waitUntil: 'networkidle0' })
  for (let i = 0; i < 12 && !(await p.$('#ob-first-text')); i++) {
    await p.evaluate(() => document.querySelector('.ob-go')?.click())
    await new Promise((r) => setTimeout(r, i >= 4 ? 1600 : 500))
  }
  if (!(await p.$('#ob-first-text'))) { console.log(w, 'no first step', await p.evaluate(() => document.querySelector('.ob-bubble')?.innerText)); continue }
  await p.screenshot({ path: `${OUT}/first-${w}-empty.jpg`, type: 'jpeg', quality: 80, fullPage: true })
  await p.type('#ob-first-text', 'You’ll be over the ocean when you read this. Text me when you land, even if it’s 3am here.\n\nI already miss the way you hum when you cook.')
  await new Promise((r) => setTimeout(r, 400))
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  await p.screenshot({ path: `${OUT}/first-${w}.jpg`, type: 'jpeg', quality: 80, fullPage: true })
  const label = await p.evaluate(() => document.querySelector('.ob-go').innerText)
  await p.evaluate(() => document.querySelector('.ob-go').click())
  await new Promise((r) => setTimeout(r, 800))
  const after = await p.evaluate(() => ({ path: location.pathname, t0: JSON.parse(localStorage.getItem('lbs_draft')).capsuleData?.t0?.letter?.slice(0, 30) }))
  console.log(w, 'overflow-x', overflow, '| button', label, '| after', JSON.stringify(after), errs.join(' | '))
  await p.close()
}
await b.close()
