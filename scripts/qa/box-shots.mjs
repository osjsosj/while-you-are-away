/* QA (needs npm run dev): the recipient's letter box (demo data) at 375 and 320: the letter path, an open letter, and "Until".
 *   node scripts/qa/box-shots.mjs <out dir> */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
for (const w of [375, 320]) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)))
  p.on('response', (r) => { if (r.url().includes('/paper/') && r.status() >= 400) errs.push(`missing ${r.url()}`) })
  await p.setBypassServiceWorker(true)
  await p.setViewport({ width: w, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await p.evaluateOnNewDocument(() => { localStorage.clear(); for (const k of ['wya_seen_demo', 'wya_film_demo', 'wya_hint_demo']) localStorage.setItem(k, 'true') })
  await p.goto('http://localhost:5173/b/demo', { waitUntil: 'networkidle0' })
  await wait(800)
  await p.screenshot({ path: `${OUT}/box-${w}-path.jpg`, type: 'jpeg', quality: 72 })
  // open the "can't sleep" letter
  await p.evaluate(() => [...document.querySelectorAll('button, a')].find((x) => /can.t sleep/i.test(x.innerText))?.click())
  await wait(900)
  await p.screenshot({ path: `${OUT}/box-${w}-letter.jpg`, type: 'jpeg', quality: 72, fullPage: false })
  console.log(w, errs.length ? errs.join(' | ') : 'ok', await p.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.src.includes('/paper/')).map((i) => i.src.split('/paper/')[1]).join(' ')))
  await p.close()
}
await b.close()
