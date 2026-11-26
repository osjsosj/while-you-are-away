/* Every event the app sends must be on the server allowlist (api/track.js), or it is dropped silently. */
import fs from 'node:fs'
const src = fs.readFileSync('api/track.js', 'utf8')
const allowed = new Set([...src.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]))
const sent = new Set()
for (const f of fs.readdirSync('src', { recursive: true })) {
  if (!/\.(jsx?|mjs)$/.test(f)) continue
  for (const m of fs.readFileSync('src/' + f, 'utf8').matchAll(/track\('([a-z_]+)'/g)) sent.add(m[1])
}
const missing = [...sent].filter((n) => !allowed.has(n))
console.log('events sent by the app:', sent.size, '| not accepted by the server:', missing.length ? missing.join(', ') : 'none')
process.exit(missing.length ? 1 : 0)
