/*
 * Product screenshots for the website, taken from the real app with a made-up letter box (story.mjs).
 *   npm i --no-save puppeteer-core@23   (uses the installed Chrome)
 *   npm run dev   (in another terminal)  then  node scripts/shots/capture.mjs
 * Writes public/site/shots/<name>.webp at 390×844, 2x.
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import { DRAFT, STORY, TALK_DRAFT } from './story.mjs'

const BASE = process.env.SHOT_BASE || 'http://localhost:5173'
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = path.resolve('public/site/shots')
fs.mkdirSync(OUT, { recursive: true })

const chat = { excerpts: 'made-up', stats: STORY.stats, names: { me: 'Jae', them: 'Mina' }, source: 'kakao', messages: 6240 }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--lang=en-US'] })

async function shot(name, route, { draft = DRAFT, local = {}, before, wait = 1400, full = false } = {}) {
  const page = await browser.newPage()
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  await page.evaluateOnNewDocument((d, extra) => {
    localStorage.clear()
    if (d) localStorage.setItem('lbs_draft', JSON.stringify(d))
    for (const [k, v] of Object.entries(extra)) localStorage.setItem(k, JSON.stringify(v))
    localStorage.setItem('wya_text_size', '18')
  }, draft, local)
  // the planning page asks the AI when it opens; answer locally so the screen holds still
  await page.setRequestInterception(true)
  page.on('request', (req) => (req.url().includes('/api/') ? req.respond({ status: 503, body: '{}' }) : req.continue()))
  await page.goto(BASE + route, { waitUntil: 'networkidle0' })
  await sleep(wait)
  if (before) await before(page)
  await page.screenshot({ path: path.join(OUT, `${name}.webp`), type: 'webp', quality: 84, fullPage: full })
  console.log('saved', name)
  await page.close()
}

await shot('signin', '/start', { draft: { phase1: DRAFT.phase1, phase1Done: true } })
await shot('plan', '/ai-interview', { draft: TALK_DRAFT })
await shot('chats', '/chats', { local: { 'wya-chat-v1': chat } })
await shot('editor', '/editor', { before: async (p) => { await p.evaluate(() => document.querySelector('.we-story')?.scrollIntoView({ block: 'start' })); await p.evaluate(() => window.scrollBy(0, -90)); await sleep(400) } })
await shot('findings', '/editor', { before: async (p) => { await p.click('.we-story'); await sleep(700) } })
await shot('look', '/editor', { before: async (p) => { await p.evaluate(() => { const w = document.querySelector('.we-why'); w?.querySelector('details')?.setAttribute('open', ''); w?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80) }); await sleep(500) } })
const openBox = async (p) => {
  await p.evaluate(() => [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || b.textContent).includes('Open your letter box'))?.click())
  await sleep(2600)
}
await shot('box', '/preview', { before: async (p) => { await openBox(p); await p.evaluate(() => { document.querySelector('.wp-bar, .wp-top')?.remove(); document.querySelector('.la-hero')?.scrollIntoView({ block: 'start' }); window.scrollBy(0, -72) }); await sleep(600) } })
await shot('letter', '/preview', { before: async (p) => { await openBox(p); await p.evaluate(() => [...document.querySelectorAll('.la-note, .la-env')].find((n) => n.textContent.includes('Bikes'))?.click()); await sleep(1200) } })
await shot('handover', '/export')

await browser.close()
