/*
 * Makes the letter paper kit with the Higgsfield CLI (Nano Banana Pro, about 2 credits an image) and downloads each result.
 *   node scripts/paper-kit/generate.mjs <raw dir> [id ...]
 * Skips pieces already downloaded, so it can be run again to fill gaps or remake one piece (delete its file first).
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { KIT } from './prompts.mjs'

const [RAW, ...ONLY] = process.argv.slice(2)
fs.mkdirSync(RAW, { recursive: true })
const ASPECT = { stamp: '4:5', sheet: '1:1', paper: '1:1' }

for (const k of KIT) {
  if (!k.prompt) continue
  if (ONLY.length && !ONLY.includes(k.id)) continue
  const file = path.join(RAW, `${k.id}.png`)
  if (fs.existsSync(file)) { console.log('have', k.id); continue }
  try {
    // the prompt goes in on stdin (the CLI reads it there), so no shell quoting can break it
    const out = execFileSync('higgsfield', ['generate', 'create', 'nano_banana_pro', '--aspect_ratio', ASPECT[k.kind], '--resolution', k.kind === 'paper' ? '1k' : '2k', '--wait', '--json'], { input: k.prompt, encoding: 'utf8', shell: true, maxBuffer: 10 * 1024 * 1024, timeout: 15 * 60 * 1000 })
    const url = out.match(/"result_url":\s*"([^"]+)"/)?.[1]
    if (!url) { console.log('no result', k.id, out.slice(-300)); continue }
    const res = await fetch(url)
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
    console.log('made', k.id)
  } catch (e) {
    console.log('failed', k.id, String(e.stdout || e.message).slice(-300))
  }
}
