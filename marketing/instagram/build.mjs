/*
 * Instagram carousels for While You're Away, made from a post.json per post.
 *   npm i --no-save puppeteer-core@23
 *   node marketing/instagram/build.mjs posts/2026-11-19-intro      (one post)
 *   node marketing/instagram/build.mjs                              (every post under posts/)
 * Each post folder gets slide-1.png … and caption.txt (from post.json "caption" and "alt").
 *
 * The look follows a bright app-launch carousel: 1080×1440, amber light fading to cream, centered
 * two-line titles, a pill label per step, a white-bezel phone holding a real screen from
 * public/site/shots that runs off the bottom edge on purpose, one piece of the screen lifted out as
 * a floating card, small outlined tags, light rays on the first and last slide.
 *
 * post.json:
 * {
 *   "caption": "…", "alt": ["one line per slide", …],
 *   "slides": [
 *     { "type": "cover", "shot": "box", "title": "Line one<br>line two", "sub": "…" },
 *     { "type": "card", "title": "…", "sub": "…", "rows": [["Label", "Text"], …], "fine": "…" },
 *     { "type": "price", "title": "…", "sub": "…", "rows": [["Item", "Free", "small note"], …], "last": ["Their private link", "$9.99"], "fine": "…" },
 *     { "type": "step", "pill": "STEP 1", "title": "…", "shot": "plan",
 *       "tags": [{ "text": "…", "side": "left", "y": 520 }],
 *       "pop": { "kind": "bubble", "text": "…" } | { "kind": "stat", "label": "…", "big": "…", "small": "…" }
 *            | { "kind": "moment", "label": "A MOMENT", "title": "…", "meta": "…", "question": "…" }
 *            | { "kind": "button", "text": "…" } | { "kind": "letter", "title": "…", "text": "…", "sign": "…" } },
 *     { "type": "statement", "title": "…", "sub": "…" },
 *     { "type": "end", "title": "Start your letter box", "sub": "getwhileyouareaway.com" }
 *   ]
 * }
 * Shots available: plan, chats, findings, look, editor, letter, box, handover, signin.
 * Any slide with a shot carries a small "Example letter box · names made up" note: the screens use a
 * made-up box (scripts/shots/story.mjs). Never invent customers, reviews or numbers.
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const ROOT = path.resolve('marketing/instagram')
const img = (p) => `data:image/${path.extname(p).slice(1)};base64,${fs.readFileSync(path.resolve(p)).toString('base64')}`
const shot = (name) => img(`public/site/shots/${name}.webp`)
const esc = (s = '') => String(s).replace(/&(?!amp;|lt;|gt;)/g, '&amp;')

const logo = `<div class="logo"><i></i>While You’re Away</div>`
const rays = `<div class="rays"></div>`
const phone = (name, cls = '') => `<div class="phone ${cls}"><div class="screen"><img src="${shot(name)}"></div></div>`
const sample = `<div class="sample">Example letter box · names made up</div>`

function pop(p) {
  if (!p) return ''
  if (p.kind === 'bubble') return `<div class="pop bubble"><p>${esc(p.text)}</p></div>`
  if (p.kind === 'stat') return `<div class="pop stat"><small>${esc(p.label)}</small><b>${esc(p.big)}</b><span>${esc(p.small)}</span></div>`
  if (p.kind === 'moment') return `<div class="pop moment"><small>${esc(p.label || 'A MOMENT')}</small><b>${esc(p.title)}</b>${p.meta ? `<span>${esc(p.meta)}</span>` : ''}${p.question ? `<i>${esc(p.question)}</i>` : ''}</div>`
  if (p.kind === 'button') return `<div class="pop button">${esc(p.text)}</div>`
  if (p.kind === 'letter') return `<div class="pop letter"><b>${esc(p.title)}</b><p>${esc(p.text)}</p>${p.sign ? `<span>${esc(p.sign)}</span>` : ''}</div>`
  return ''
}

function slide(s) {
  switch (s.type) {
    case 'cover':
      return `<section class="s cover">${rays}${logo}${phone(s.shot || 'box', 'hero')}<div class="fade"></div>
        <div class="cover-copy"><h1>${esc(s.title)}</h1>${s.sub ? `<p>${esc(s.sub)}</p>` : ''}</div>${sample}</section>`
    case 'card':
      return `<section class="s"><h2>${esc(s.title)}</h2>${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ''}
        <div class="card facts">${s.rows.map(([b, t]) => `<div><b>${esc(b)}</b><span>${esc(t)}</span></div>`).join('')}</div>
        ${s.fine ? `<p class="fine">${esc(s.fine)}</p>` : ''}</section>`
    case 'price':
      return `<section class="s"><h2>${esc(s.title)}</h2>${s.sub ? `<p class="sub">${esc(s.sub)}</p>` : ''}
        <div class="card price">${s.rows.map(([a, b, n]) => `<div><span>${esc(a)}</span><b>${esc(b)}${n ? `<small>${esc(n)}</small>` : ''}</b></div>`).join('')}
        ${s.last ? `<div class="hi"><span>${esc(s.last[0])}</span><b>${esc(s.last[1])}</b></div>` : ''}</div>
        ${s.fine ? `<p class="fine">${esc(s.fine)}</p>` : ''}</section>`
    case 'step':
      return `<section class="s step">${s.pill ? `<div class="pill">${esc(s.pill)}</div>` : ''}<h2>${esc(s.title)}</h2>
        ${phone(s.shot)}
        ${(s.tags || []).map((t) => `<div class="tag" style="${t.side === 'right' ? 'right' : 'left'}:${t.x ?? 64}px;top:${t.y ?? 540}px">${esc(t.text)}</div>`).join('')}
        ${pop(s.pop)}${sample}</section>`
    case 'statement':
      return `<section class="s statement">${rays}<div class="mid"><h2>${esc(s.title)}</h2>${s.sub ? `<p>${esc(s.sub)}</p>` : ''}</div><div class="end-logo">${logo}</div></section>`
    case 'end':
      return `<section class="s end">${rays}<div class="mid"><h2>${esc(s.title || 'Start your letter box')}</h2><p>${esc(s.sub || 'getwhileyouareaway.com')}</p></div><div class="end-logo">${logo}</div></section>`
    default:
      throw new Error(`unknown slide type: ${s.type}`)
  }
}

const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000}
.s{position:relative;width:1080px;height:1440px;overflow:hidden;color:#101A33;font-family:'Schibsted Grotesk',system-ui,sans-serif;letter-spacing:-0.015em;text-align:center;
   background:linear-gradient(180deg,#F6C25E 0%,#FBE3A6 42%,#FFF8EA 100%)}
h1,h2{font-weight:800;letter-spacing:-0.04em;color:#101A33}
h2{margin:150px auto 0;max-width:960px;font-size:70px;line-height:1.14}
.sub{margin:30px auto 0;max-width:900px;font-size:34px;line-height:1.45;color:#3D4859}
.fine{position:absolute;left:0;right:0;bottom:96px;font-size:30px;color:#6B6455}
.logo{display:inline-flex;align-items:center;gap:14px;font-size:38px;font-weight:700;letter-spacing:-0.03em;color:#101A33}
.logo i{width:22px;height:22px;border-radius:50%;background:#101A33;box-shadow:inset 0 0 0 6px #F0B341}
.rays{position:absolute;inset:-20%;background:repeating-conic-gradient(from 0deg at 50% 46%,rgba(255,255,255,.34) 0deg 5deg,rgba(255,255,255,0) 5deg 22deg)}
.cover,.end,.statement{background:#F6C25E}
.cover .logo{position:absolute;top:70px;left:0;right:0;justify-content:center;z-index:3}
.phone{position:absolute;left:50%;width:560px;aspect-ratio:390/844;padding:20px;border-radius:78px;background:#FFFFFF;transform:translateX(-50%);box-shadow:0 30px 60px -30px rgba(16,26,51,.35)}
.screen{width:100%;height:100%;overflow:hidden;border-radius:60px;background:#050A19}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.phone.hero{top:170px;width:600px}
.fade{position:absolute;left:0;right:0;bottom:0;height:640px;background:linear-gradient(180deg,rgba(246,194,94,0) 0%,#F6C25E 46%,#F6C25E 100%);z-index:2}
.cover-copy{position:absolute;left:0;right:0;bottom:120px;z-index:3}
.cover h1{font-size:82px;line-height:1.12}
.cover-copy p{margin-top:28px;font-size:36px;color:#3D3424}
.card{margin:70px auto 0;width:930px;padding:56px 64px;border-radius:52px;background:#FFFFFF;box-shadow:0 30px 60px -36px rgba(16,26,51,.28);text-align:left}
.facts{display:flex;flex-direction:column;gap:58px;margin-top:90px;padding:76px 70px}
.facts div{display:grid;grid-template-columns:270px 1fr;gap:24px;align-items:baseline}
.facts b{font-size:38px;font-weight:800;letter-spacing:-0.025em}
.facts span{font-size:36px;line-height:1.35;color:#3D4859}
.price{display:flex;flex-direction:column;gap:34px;margin-top:64px}
.price div{display:flex;justify-content:space-between;align-items:center;gap:20px}
.price span{font-size:36px;color:#1B2536}
.price b{display:flex;flex-direction:column;align-items:flex-end;font-size:60px;font-weight:800;letter-spacing:-0.04em;line-height:1}
.price b small{margin-top:6px;font-size:22px;font-weight:600;letter-spacing:0;color:#8A7A5A}
.price .hi{margin-top:6px;padding-top:34px;border-top:2px solid #EFE6D2}
.price .hi b{color:#C47A00}
.pill{display:inline-block;margin-top:110px;padding:14px 30px;border-radius:999px;background:#101A33;color:#FFF8EA;font-size:30px;font-weight:800;letter-spacing:.02em}
.step h2{margin-top:40px;font-size:66px}
.step .phone{top:470px}
.tag{position:absolute;z-index:4;padding:12px 20px;border-radius:12px;background:#FFFFFF;border:2.5px solid #101A33;font-size:28px;font-weight:600;letter-spacing:-0.01em;white-space:nowrap}
.pop{position:absolute;z-index:5;left:50%;transform:translateX(-50%);text-align:left;box-shadow:0 34px 60px -24px rgba(16,26,51,.45)}
.bubble{bottom:150px;width:780px;padding:36px 42px;border-radius:40px 40px 40px 12px;background:#F6F3EA;font-family:'Literata',Georgia,serif;font-size:38px;line-height:1.45;color:#1B2536}
.bubble b{font-weight:600}
.stat{bottom:170px;width:700px;padding:40px 48px;border-radius:40px;background:#101A33;color:#F4F1E6;display:flex;flex-direction:column;gap:8px}
.stat small{font-size:26px;color:#A9B3C6}
.stat b{font-family:'Literata',Georgia,serif;font-size:96px;font-weight:500;letter-spacing:-0.03em;line-height:1.05}
.stat span{font-size:30px;color:#C9D0DC}
.moment,.letter{bottom:140px;width:780px;padding:40px 46px;border-radius:40px;background:#F6F3EA;display:flex;flex-direction:column;gap:10px;color:#1B2536}
.moment small{font-size:24px;font-weight:800;letter-spacing:.08em;color:#4E596B}
.moment b,.letter b{font-family:'Literata',Georgia,serif;font-size:52px;font-weight:500;letter-spacing:-0.02em;line-height:1.1}
.moment span{font-size:28px;color:#4E596B}
.moment i{margin-top:6px;font-family:'Literata',Georgia,serif;font-size:32px;line-height:1.4;color:#3D4859}
.letter p{font-family:'Caveat',cursive;font-size:46px;line-height:1.3;color:#2B2420}
.letter span{align-self:flex-end;font-family:'Caveat',cursive;font-size:40px;color:#5E554B}
.button{bottom:190px;padding:40px 80px;border-radius:999px;background:#F0B341;color:#101A33;font-size:46px;font-weight:700;letter-spacing:-0.02em;white-space:nowrap;box-shadow:0 0 0 14px rgba(255,255,255,.6),0 34px 60px -24px rgba(16,26,51,.45)}
.sample{position:absolute;right:40px;bottom:30px;z-index:6;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.8);font-size:20px;color:#6B6455}
.mid{position:absolute;left:0;right:0;top:560px;z-index:2;padding:0 80px}
.end .mid h2,.statement .mid h2{margin:0;font-size:84px}
.statement .mid h2{font-size:72px;line-height:1.16}
.mid p{margin-top:28px;font-size:44px;font-weight:600;letter-spacing:-0.02em;color:#3D3424}
.end-logo{position:absolute;left:0;right:0;bottom:110px;z-index:2}
`

async function build(dir, browser) {
  const post = JSON.parse(fs.readFileSync(path.join(dir, 'post.json'), 'utf8'))
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&family=Caveat:wght@500;700&display=swap">
<style>${css}</style></head><body>${post.slides.map(slide).join('')}</body></html>`
  for (const f of fs.readdirSync(dir)) if (/^slide-\d+\.png$/.test(f)) fs.rmSync(path.join(dir, f))
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  const els = await page.$$('.s')
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(dir, `slide-${i + 1}.png`) })
  await page.close()
  const alt = (post.alt || []).map((a, i) => `${i + 1}. ${a}`).join('\n')
  fs.writeFileSync(path.join(dir, 'caption.txt'), `${post.caption}\n${alt ? `\n---\nAlt text (one line per slide)\n${alt}\n` : ''}`)
  console.log(`${els.length} slides → ${path.relative(process.cwd(), dir)}`)
}

const arg = process.argv[2]
const dirs = arg
  ? [path.resolve(ROOT, arg)]
  : fs.readdirSync(path.join(ROOT, 'posts')).map((d) => path.join(ROOT, 'posts', d)).filter((d) => fs.existsSync(path.join(d, 'post.json')))
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
for (const d of dirs) await build(d, browser)
await browser.close()
