/* QA (needs npm run dev): every page at 375 and 320 with a filled draft and the server down.
 * Reports crashes (the error screen), page errors, console errors, failed non-API requests and sideways scrolling.
 *   node scripts/qa/sweep.mjs */
import puppeteer from 'puppeteer-core'
import { DRAFT } from '../shots/story.mjs'
const BASE = 'http://localhost:5173'
const ROUTES = ['/', '/services', '/about', '/contact', '/interview', '/start', '/paywall', '/ai-interview', '/generate', '/editor', '/chats', '/diary', '/preview', '/export', '/keepsake', '/terms', '/privacy', '/refunds', '/guides/index.html', '/b/tok_missing_12345678']
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
let problems = 0
for (const w of [375, 320]) {
  for (const r of ROUTES) {
    const p = await b.newPage()
    const errs = []
    p.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 140)))
    p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|503|net::ERR/.test(m.text())) errs.push('console: ' + m.text().replace(/\s+/g, ' ').slice(0, 160)) })
    p.on('requestfailed', (q) => { if (!q.url().includes('/api/') && !/fonts\.g|google|stripe|supabase/.test(q.url())) errs.push('requestfailed: ' + q.url().slice(0, 100)) })
    p.on('response', (res) => { const u = res.url(); if (u.startsWith(BASE) && !u.includes('/api/') && res.status() >= 400) errs.push(`http ${res.status()}: ${u.slice(BASE.length, 120)}`) })
    await p.setBypassServiceWorker(true)
    await p.setViewport({ width: w, height: 800, isMobile: true, hasTouch: true })
    await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await p.evaluateOnNewDocument((d) => { localStorage.clear(); localStorage.setItem('lbs_draft', JSON.stringify(d)) }, DRAFT)
    await p.setRequestInterception(true)
    p.on('request', (q) => (q.url().includes('/api/') ? q.respond({ status: 503, contentType: 'application/json', body: '{}' }) : q.continue()))
    await p.goto(BASE + r, { waitUntil: 'networkidle0', timeout: 30000 }).catch((e) => errs.push('goto: ' + e.message.slice(0, 80)))
    await new Promise((res) => setTimeout(res, 700))
    const st = await p.evaluate(() => ({ crash: !!document.querySelector('.eb'), over: document.documentElement.scrollWidth - window.innerWidth, path: location.pathname, wide: [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > window.innerWidth + 1 && getComputedStyle(e).position !== 'fixed' }).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`) }))
    const bad = st.crash || st.over > 0 || errs.length
    if (bad) problems++
    console.log(`${w} ${r} -> ${st.path} ${st.crash ? 'CRASH ' : ''}${st.over > 0 ? `OVERFLOW ${st.over}px [${st.wide.join(', ')}] ` : ''}${errs.length ? '\n    ' + errs.slice(0, 4).join('\n    ') : 'ok'}`)
    await p.close()
  }
}
console.log('pages with problems:', problems)
await b.close()
