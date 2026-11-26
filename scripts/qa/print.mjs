/* QA (needs npm run dev): what prints. The keepsake book at Letter size, one letter per page; the handover card alone on one 5x7 page.
 *   node scripts/qa/print.mjs <out dir> */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const pdfInfo = (f) => { const d = fs.readFileSync(f); return { bytes: d.length, pages: (d.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length, sizes: [...new Set(d.toString('latin1').match(/\/MediaBox\s*\[[^\]]*\]/g) || [])] } }
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const p = await b.newPage()
await p.setViewport({ width: 816, height: 1056 })
await p.goto('http://localhost:5173/keepsake?demo=book', { waitUntil: 'networkidle0' }); await wait(600)
await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => x.innerText === 'Open the book')?.click()); await wait(800)
await p.pdf({ path: `${OUT}/book.pdf`, printBackground: true, preferCSSPageSize: true })
console.log('book', JSON.stringify(pdfInfo(`${OUT}/book.pdf`)), 'sections', await p.evaluate(() => document.querySelectorAll('.kb-page').length))
const q = await b.newPage()
await q.setViewport({ width: 816, height: 1056 })
await q.goto('http://localhost:5173/export?demo=live', { waitUntil: 'networkidle0' }); await wait(1500)
await q.pdf({ path: `${OUT}/card.pdf`, printBackground: true, preferCSSPageSize: true })
await q.emulateMediaType('print')
console.log('card', JSON.stringify(pdfInfo(`${OUT}/card.pdf`)), 'text:', await q.evaluate(() => document.querySelector('.wh-print')?.innerText.replace(/\s+/g, ' ').slice(0, 120)))
await q.screenshot({ path: `${OUT}/card-print.png` })
await b.close()
