/* QA (needs npm run dev): records each letter form opening, frame by frame, as an MP4 for review.
 *   node scripts/qa/record-forms.mjs <out dir>
 * Animations are paused and stepped with the Web Animations API, so every frame is exact.
 * Encodes in the page with WebCodecs + mp4-muxer (npm i --no-save puppeteer-core@23 mp4-muxer@5.2.2). */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const OUT = path.resolve(process.argv[2] || 'review/clips')
fs.mkdirSync(OUT, { recursive: true })
const CLIPS = [
  ['ticket', 'sam-emma', 't0'], ['envelope', 'sam-emma', 's0'], ['folded', 'sam-emma', 'n0'], ['sealed', 'sam-emma', 'l0'],
  ['postcard', 'sam-emma', 'w0'], ['saying', 'sam-emma', 'w1'], ['tally', 'sam-emma', 'w2'], ['leaf', 'sam-emma', 'w3'],
  ['diary', 'sam-emma', 'd:d1'], ['card', 'maria-diego', 'o0'],
]
const FPS = 30, MOVE_MS = 1700, HOLD_MS = 1300
const muxer = fs.readFileSync(path.resolve('node_modules/mp4-muxer/build/mp4-muxer.js'), 'utf8')

const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--hide-scrollbars'] })
for (const [name, story, id] of CLIPS) {
  const p = await b.newPage()
  await p.setViewport({ width: 375, height: 1200, deviceScaleFactor: 2, isMobile: true })
  await p.goto(`http://localhost:5173/lab/letters?s=${story}&id=${encodeURIComponent(id)}`, { waitUntil: 'networkidle0' })
  await p.evaluate(() => document.fonts.ready)
  await p.addScriptTag({ content: muxer })
  const el = await p.$('[data-letter]')
  const box = await el.boundingBox()
  const clip = { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.floor(box.width / 2) * 2, height: Math.floor(box.height / 2) * 2 }
  const W = clip.width * 2, H = clip.height * 2
  await p.evaluate((W, H, FPS) => {
    window.__mux = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H, frameRate: FPS }, fastStart: 'in-memory' })
    window.__enc = new VideoEncoder({ output: (c, m) => window.__mux.addVideoChunk(c, m), error: (e) => { window.__err = String(e) } })
    window.__enc.configure({ codec: 'avc1.640028', width: W, height: H, bitrate: 3e6, framerate: FPS })
    document.getAnimations().forEach((a) => a.pause())
  }, W, H, FPS)
  const total = Math.round(((MOVE_MS + HOLD_MS) / 1000) * FPS)
  for (let i = 0; i < total; i++) {
    const t = Math.min(MOVE_MS, (i / FPS) * 1000)
    await p.evaluate((t) => document.getAnimations().forEach((a) => { a.currentTime = t }), t)
    const jpg = await p.screenshot({ type: 'jpeg', quality: 90, clip, encoding: 'base64' })
    await p.evaluate(async (b64, i, FPS) => {
      const bmp = await createImageBitmap(await (await fetch('data:image/jpeg;base64,' + b64)).blob())
      const f = new VideoFrame(bmp, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) })
      window.__enc.encode(f, { keyFrame: i % 30 === 0 }); f.close(); bmp.close()
      if (window.__enc.encodeQueueSize > 6) await new Promise((r) => window.__enc.addEventListener('dequeue', r, { once: true }))
    }, jpg, i, FPS)
    if (i === total - 1) fs.writeFileSync(path.join(OUT, `${name}.jpg`), Buffer.from(jpg, 'base64'))
  }
  const b64 = await p.evaluate(async () => {
    await window.__enc.flush(); window.__mux.finalize()
    const buf = new Uint8Array(window.__mux.target.buffer); let s = ''
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000))
    return btoa(s)
  })
  fs.writeFileSync(path.join(OUT, `${name}.mp4`), Buffer.from(b64, 'base64'))
  console.log(name, `${W}x${H}`, Math.round(Buffer.from(b64, 'base64').length / 1024) + 'KB')
  await p.close()
}
await b.close()
