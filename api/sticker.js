import { db } from './_lib/server.js'
import { allowAI } from './_lib/access.js'
import { drawRequest, safeSvg, stickerKey } from './_lib/stickerDraw.js'

/**
 * /api/sticker — stickers we didn't have, drawn once and kept for everyone.
 *   GET  ?id=x-…                          → the SVG (plain shapes only; served with a strict policy)
 *   POST { subject, art, sessionId }      → { id, label }   (signed in; counted like other AI calls)
 */
const ARTS = new Set(['flat', 'color', 'noto', 'twemoji'])

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return await serve(req, res)
    if (req.method === 'POST') return await draw(req, res)
    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('sticker api error:', err?.message || err)
    return res.status(500).json({ error: 'server_error' })
  }
}

async function serve(req, res) {
  const id = String(req.query?.id || '')
  if (!/^x-[a-f0-9]{12}$/.test(id)) return res.status(404).end()
  const { data } = await db().from('custom_stickers').select('svg').eq('id', id).maybeSingle()
  if (!data?.svg) return res.status(404).end()
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  // even though only plain shapes are stored, the file can't run anything or load anything
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  return res.status(200).send(data.svg)
}

async function draw(req, res) {
  const { subject, art: rawArt, sessionId } = req.body || {}
  const text = typeof subject === 'string' ? subject.replace(/\s+/g, ' ').trim().slice(0, 60) : ''
  if (text.length < 2) return res.status(400).json({ error: 'invalid_subject' })
  const art = ARTS.has(rawArt) ? rawArt : 'flat'
  const { key, id } = stickerKey(text, art)

  // drawn before (by anyone): free and instant
  const { data: have } = await db().from('custom_stickers').select('id, label').eq('key', key).maybeSingle()
  if (have) return res.status(200).json({ id: have.id, label: have.label })

  const access = await allowAI(req, 'sticker', sessionId)
  if (!access.ok) return res.status(access.status).json({ error: access.error })

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-beta': 'server-side-fallback-2026-07-01' },
    body: JSON.stringify(drawRequest(text, art)),
  })
  const data = await r.json()
  if (!r.ok) {
    console.error('Anthropic error:', r.status, data?.error?.message)
    return res.status(502).json({ error: 'upstream_error' })
  }
  if (data.stop_reason === 'refusal' || data.stop_reason === 'max_tokens') return res.status(502).json({ error: 'not_drawn' })
  let out
  try { out = JSON.parse(data.content?.find((b) => b.type === 'text')?.text || '') } catch { return res.status(502).json({ error: 'not_drawn' }) }
  const svg = safeSvg(out.svg)
  if (!svg) return res.status(502).json({ error: 'not_drawn' })
  const label = String(out.object || text).slice(0, 60)
  const words = String(out.words || '').slice(0, 300)
  const { error } = await db().from('custom_stickers').upsert({ key, id, label, words, subject: text, art, svg }, { onConflict: 'key' })
  if (error) throw error
  return res.status(200).json({ id, label })
}
