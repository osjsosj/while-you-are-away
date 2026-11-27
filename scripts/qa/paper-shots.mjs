/* QA (needs npm run dev): screenshots of letters in the letter lab, for judging the paper.
 *   node scripts/qa/paper-shots.mjs <out dir> <prefix> <story key> [<story key> ...] */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
const [OUT, PREFIX, ...STORIES] = process.argv.slice(2)
fs.mkdirSync(OUT, { recursive: true })
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
const p = await b.newPage()
await p.setViewport({ width: 420, height: 1000, deviceScaleFactor: 1.5 })
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
for (const s of STORIES) {
  await p.goto(`http://localhost:5173/lab/letters?s=${s}`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready)
  await new Promise((r) => setTimeout(r, 500))
  const ids = await p.$$eval('[data-letter]', (els) => els.map((e) => `${e.dataset.letter}:${e.dataset.form}`))
  console.log(s, ids.join(' '))
  const els = await p.$$('[data-letter]')
  for (const [i, el] of els.slice(0, 4).entries()) await el.screenshot({ path: `${OUT}/${PREFIX}-${s}-${i}.jpg`, type: 'jpeg', quality: 70 })
}
await b.close()
