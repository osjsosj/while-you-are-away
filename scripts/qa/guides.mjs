/* QA (needs npm run dev): the static letter guides read well at phone widths and every link inside them works.
 *   node scripts/qa/guides.mjs <out dir> */
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'
import { GUIDES } from '../guides/content.mjs'
const OUT = process.argv[2]
fs.mkdirSync(OUT, { recursive: true })
const BASE = 'http://localhost:5173'
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
const links = new Set()
for (const w of [375, 320]) {
  for (const slug of ['', ...GUIDES.map((g) => g.slug + '/')]) {
    const p = await b.newPage()
    await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: true })
    const res = await p.goto(`${BASE}/guides/${slug}index.html`, { waitUntil: 'networkidle0' })
    const info = await p.evaluate(() => ({ title: document.title, h1: document.querySelector('h1')?.innerText, over: document.documentElement.scrollWidth > window.innerWidth, links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')) }))
    info.links.forEach((l) => links.add(l))
    console.log(w, res.status(), slug || 'index', info.over ? 'OVERFLOW' : 'ok', '|', info.title)
    if (w === 320 && (slug === '' || slug.startsWith('open-when'))) await p.screenshot({ path: `${OUT}/guide-${slug.replace('/', '') || 'index'}-320.jpg`, type: 'jpeg', quality: 70, fullPage: true })
    await p.close()
  }
}
// internal links resolve (guides as files, app routes through the app)
const p = await b.newPage()
for (const l of links) {
  if (!l.startsWith('/')) continue
  const u = l.replace(/&amp;/g, '&')
  const target = u.startsWith('/guides/') && u.endsWith('/') ? `${u}index.html` : u
  const r = await p.goto(BASE + target, { waitUntil: 'domcontentloaded' })
  if (!r || r.status() >= 400) console.log('BROKEN', l, r?.status())
}
console.log('internal links checked:', [...links].filter((l) => l.startsWith('/')).length)
await b.close()
