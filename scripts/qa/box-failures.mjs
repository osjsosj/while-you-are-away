/* QA (needs npm run dev): the letter box says something useful when the server fails. node scripts/qa/box-failures.mjs <screenshot dir> */
import puppeteer from 'puppeteer-core'
const OUT = process.argv[2]
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
const cases = {
  'server-503': (q) => q.respond({ status: 503, body: '{}' }),
  'server-500-html': (q) => q.respond({ status: 500, contentType: 'text/html', body: '<html>oops</html>' }),
  'not-found': (q) => q.respond({ status: 404, contentType: 'application/json', body: '{"error":"not_found"}' }),
  'bad-json': (q) => q.respond({ status: 200, contentType: 'application/json', body: '{"box":' }),
  'wrong-shape': (q) => q.respond({ status: 200, contentType: 'application/json', body: '{"box":"x","items":5}' }),
  'offline': (q) => q.abort('internetdisconnected'),
  'hangs': () => {},
}
for (const [name, handle] of Object.entries(cases)) {
  const p = await b.newPage()
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message.slice(0, 160)))
  p.on('console', (m) => { if (m.type() === 'error' && /while-youre-away|TypeError|Cannot/.test(m.text())) errs.push(m.text().replace(/\s+/g, ' ').slice(0, 200)) })
  await p.setBypassServiceWorker(true)
  await p.setViewport({ width: 375, height: 800, isMobile: true })
  await p.setRequestInterception(true)
  p.on('request', (q) => (q.url().includes('/api/box') ? handle(q) : q.url().includes('/api/') ? q.respond({ status: 204, body: '' }) : q.continue()))
  await p.goto('http://localhost:5173/b/tok_live_123', { waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {})
  await new Promise((r) => setTimeout(r, name === 'hangs' ? 17000 : 1500))
  const st = await p.evaluate(() => ({ crash: !!document.querySelector('.eb'), text: document.querySelector('#root')?.innerText.replace(/\s+/g, ' ').slice(0, 160) }))
  console.log(name, st.crash ? 'CRASH-SCREEN' : '', '|', st.text, errs.length ? '\n   ' + errs.slice(0, 2).join('\n   ') : '')
  await p.screenshot({ path: `${OUT}/down-${name}.png` })
  await p.close()
}
await b.close()
