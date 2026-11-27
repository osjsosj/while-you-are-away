/*
 * Pinterest pins for the letter guides (2:3, 1000x1500), drawn from the paper kit: a cream paper surface,
 * one engraved stamp, real tape, the title in Literata. Rendered locally with the dev server running (for /paper files).
 *   node marketing/pins/build.mjs
 * Output: marketing/pins/out/<slug>.png. Posting needs a yes for each pin.
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const PINS = [
  { slug: 'open-when-letter-ideas', kicker: 'Letter ideas', title: '50 open when letters for the time apart', sub: 'Bad days, sleepless nights, good news, birthdays, and the day you meet again.', stamp: 'moon', tape: 'masking', items: ['Open when you can’t sleep', 'Open when the call drops', 'Open on your birthday', 'Open the day we meet again'] },
  { slug: 'letters-before-deployment', kicker: 'For military families', title: 'What to write before a deployment', sub: 'The first night, the long middle months, birthdays apart, and homecoming.', stamp: 'plane', tape: 'kraft', items: ['The last normal thing we did', 'Open at the halfway point', 'Open when the kids miss you', 'The first meal I’ll make you'] },
  { slug: 'letters-for-college-freshman', kicker: 'For parents', title: 'Letters for a college freshman', sub: 'Move-in night, homesick weeks, the first exam, and the drive home.', stamp: 'train', tape: 'rose', items: ['Open when you’re homesick', 'Open before your first exam', 'Open when your roommate is too much', 'Open the week before Thanksgiving'] },
]
const OUT = path.resolve('marketing/pins/out')
fs.mkdirSync(OUT, { recursive: true })

const html = (p) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,500&family=Schibsted+Grotesk:wght@500;600&display=swap">
<style>
  html, body { margin: 0; }
  .pin { position: relative; width: 1000px; height: 1500px; overflow: hidden; background: #F3EEE2; color: #1B2536; font-family: 'Schibsted Grotesk', sans-serif; }
  .pin::before { content: ''; position: absolute; inset: 0; background: url(/paper/paper-night.webp) center top / 100% auto repeat-y; mix-blend-mode: multiply; opacity: .75; }
  .sheet { position: absolute; left: 90px; right: 90px; top: 210px; bottom: 170px; background: #FBF8F1; box-shadow: 0 30px 60px -36px rgba(27, 37, 54, .55); padding: 120px 80px 80px; transform: rotate(-1.2deg); }
  .sheet::before { content: ''; position: absolute; inset: 0; background: url(/paper/paper-night.webp) center top / 100% auto repeat-y; mix-blend-mode: multiply; opacity: .6; }
  .tape { position: absolute; top: -34px; left: 50%; width: 260px; transform: translateX(-50%) rotate(3deg); }
  .stamp { position: absolute; top: 50px; right: 56px; width: 150px; transform: rotate(6deg); filter: drop-shadow(0 4px 6px rgba(0,0,0,.18)); }
  .kicker { position: relative; margin: 0 0 30px; font-size: 30px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #8A6A2E; }
  h1 { position: relative; margin: 0 0 34px; max-width: 590px; font-family: 'Literata', serif; font-weight: 500; font-size: 80px; line-height: 1.05; letter-spacing: -.01em; text-wrap: balance; }
  .sub { position: relative; margin: 0; max-width: 640px; font-family: 'Literata', serif; font-size: 40px; line-height: 1.4; color: #3C4658; }
  .items { position: relative; margin: 46px 0 0; padding: 0; list-style: none; display: grid; gap: 16px; }
  .items li { padding: 18px 26px; background: rgba(255, 255, 255, .55); border-left: 5px solid #C9A866; font-family: 'Literata', serif; font-style: italic; font-size: 34px; line-height: 1.2; color: #2A3446; }
  .foot { position: absolute; left: 90px; right: 90px; bottom: 64px; display: flex; justify-content: space-between; align-items: center; font-size: 30px; font-weight: 600; }
  .dot { display: inline-block; width: 22px; height: 22px; margin-right: 14px; border-radius: 50%; background: #F0B341; vertical-align: -2px; }
</style></head><body>
<div class="pin">
  <div class="sheet">
    <img class="tape" src="/paper/tape-${p.tape}.webp" alt="">
    <img class="stamp" src="/paper/stamp-${p.stamp}.webp" alt="">
    <p class="kicker">${p.kicker}</p>
    <h1>${p.title}</h1>
    <p class="sub">${p.sub}</p>
    <ul class="items">${p.items.slice(0, 3).map((i) => `<li>${i}</li>`).join('')}</ul>
  </div>
  <div class="foot"><span><span class="dot"></span>While You’re Away</span><span>getwhileyouareaway.com</span></div>
</div></body></html>`

const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const page = await b.newPage()
await page.setViewport({ width: 1000, height: 1500 })
for (const p of PINS) {
  // served from the dev server's origin so /paper/* resolves
  await page.goto('http://localhost:5173/guides/index.html')
  await page.setContent(html(p), { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(OUT, `${p.slug}.png`) })
  console.log('pin', p.slug)
}
await b.close()
