/* QA (needs npm run dev): every flow page loads with a damaged saved draft. node scripts/qa/corrupt-drafts.mjs [all] */
import puppeteer from 'puppeteer-core'
const all = process.argv[2] === 'all'
const routes = all ? ['/editor', '/preview', '/generate', '/ai-interview', '/diary', '/export', '/chats', '/interview', '/start', '/paywall'] : ['/editor', '/preview', '/ai-interview', '/diary', '/export', '/interview']
const drafts = {
  garbage: 'not json{',
  nullish: 'null',
  number: '42',
  array: '[]',
  wrongTypes: JSON.stringify({ phase1: 'x', phase2: 5, plan: 'weekly', capsuleData: [], diary: {}, story: 'hi', decor: 7, generatedConfig: [], interviewChat: 'x', film: 3, signature: 'abc' }),
  halfShapes: JSON.stringify({ phase1: { fromName: 5, toName: null, startDate: '2026-99-99', endDate: 'soon' }, plan: { scheduled: { enabled: true, schedule: 'yearly', count: 'many' }, anytime: [null, 5, { label: 7 }] }, capsuleData: { w0: null, t0: { letter: 5, pins: 'x' } }, diary: [null, { writtenOn: 'yesterday', body: 3 }], story: { memories: 'x', catchphrases: [null], stats: { byMonth: 'x' } } }),
}
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
let problems = 0
for (const [name, raw] of Object.entries(drafts)) {
  if (!all && !['wrongTypes', 'halfShapes'].includes(name)) continue
  for (const r of routes) {
    const p = await b.newPage()
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
    p.on('console', (m) => { if (m.type() === 'error' && /while-youre-away|TypeError|is not|Cannot/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 300)) })
    await p.setViewport({ width: 375, height: 800, isMobile: true })
    await p.evaluateOnNewDocument((raw) => { localStorage.clear(); localStorage.setItem('lbs_draft', raw) }, raw)
    await p.setRequestInterception(true)
    p.on('request', (q) => (q.url().includes('/api/') ? q.respond({ status: 503, body: '{}' }) : q.continue()))
    await p.goto('http://localhost:5173' + r, { waitUntil: 'networkidle0', timeout: 30000 }).catch((e) => errs.push('goto ' + e.message))
    await new Promise((res) => setTimeout(res, 800))
    const st = await p.evaluate(() => ({ crash: !!document.querySelector('.eb'), blank: !document.querySelector('#root')?.innerText.trim() }))
    if (st.crash || st.blank || errs.length) { problems++; console.log(name, r, st.crash ? 'CRASH-SCREEN' : '', st.blank ? 'BLANK' : '', '\n   ', errs.slice(0, 2).join('\n    ')) }
    await p.close()
  }
}
console.log('corrupt run done, problems:', problems)
await b.close()
