import { randomBytes } from 'node:crypto'
import { db, isPaid } from './_lib/server.js'
import { recipientView, allItems, trustedToday } from '../src/utils/boxModel.js'

/**
 * /api/box
 *   POST {action:'publish'}  + Authorization: Bearer <supabase access token>  → { token }
 *   GET  ?token=…&today=YYYY-MM-DD                                           → recipient view
 *   POST ?token=… {action:'reply', itemId, body} | {action:'open', itemId}    → { ok }
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const token = typeof req.query?.token === 'string' ? req.query.token : ''
  try {
    if (!token) {
      if (req.method === 'POST' && req.body?.action === 'publish') return await publish(req, res)
      return res.status(400).json({ error: 'missing_token' })
    }
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return res.status(404).json({ error: 'not_found' })
    const box = await loadBox(token)
    if (!box) return res.status(404).json({ error: 'not_found' })
    if (req.method === 'GET') return await view(req, res, box)
    if (req.method === 'POST') return await act(req, res, box)
    return res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('box api error:', err?.message || err)
    return res.status(500).json({ error: 'server_error' })
  }
}

async function publish(req, res) {
  const jwt = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return res.status(401).json({ error: 'sign_in_required' })
  const { data: userData, error: userErr } = await db().auth.getUser(jwt)
  const user = userData?.user
  if (userErr || !user) return res.status(401).json({ error: 'sign_in_required' })

  const { data: draftRow } = await db().from('drafts').select('data').eq('user_id', user.id).maybeSingle()
  const draft = draftRow?.data
  if (!draft?.phase1) return res.status(400).json({ error: 'no_draft' })
  const sessionId = draft.paymentSessionId
  if (!(await isPaid(sessionId))) return res.status(402).json({ error: 'payment_required' })

  const { data: existing } = await db().from('boxes').select('share_token').eq('user_id', user.id).maybeSingle()
  const shareToken = existing?.share_token || randomBytes(16).toString('base64url')
  const row = { user_id: user.id, share_token: shareToken, stripe_session_id: sessionId, updated_at: new Date().toISOString() }
  const { error } = existing
    ? await db().from('boxes').update(row).eq('user_id', user.id)
    : await db().from('boxes').insert(row)
  if (error) throw error
  return res.status(200).json({ token: shareToken })
}

async function loadBox(token) {
  const { data: box } = await db().from('boxes').select('user_id, share_token').eq('share_token', token).maybeSingle()
  if (!box) return null
  const { data: draftRow } = await db().from('drafts').select('data').eq('user_id', box.user_id).maybeSingle()
  return { userId: box.user_id, draft: draftRow?.data || {} }
}

async function view(req, res, box) {
  const today = trustedToday(req.query?.today)
  const data = recipientView(box.draft, today)

  // sign every media file the recipient may see (6 hours; the page refreshes them on each visit)
  const slots = [] // [object, field]
  for (const it of data.items) for (const f of ['photo', 'voice', 'video']) slots.push([it, f])
  if (data.film) {
    for (const p of data.film.photos) slots.push([p, 'photo'])
    slots.push([data.film, 'voice'])
  }
  await signMedia(slots, box.userId)
  if (data.film) {
    data.film.photos = data.film.photos.filter((p) => p.photo)
    if (!data.film.photos.length) data.film = null
  }

  const [{ data: replies }, { data: opens }] = await Promise.all([
    db().from('box_replies').select('item_id, body, created_at').eq('box_user_id', box.userId).order('created_at', { ascending: true }),
    db().from('box_opens').select('item_id').eq('box_user_id', box.userId),
  ])
  return res.status(200).json({ ...data, today, replies: replies || [], opened: (opens || []).map((o) => o.item_id) })
}

async function act(req, res, box) {
  const { action, itemId, body } = req.body || {}
  if (typeof itemId !== 'string' || itemId.length > 80) return res.status(400).json({ error: 'invalid_item' })
  const today = trustedToday(req.body?.today)
  const item = allItems(box.draft).find((it) => it.id === itemId)
  if (!item || (item.opensOn && item.opensOn > today)) return res.status(403).json({ error: 'locked' })

  if (action === 'open') {
    const { error } = await db().from('box_opens').upsert({ box_user_id: box.userId, item_id: itemId }, { onConflict: 'box_user_id,item_id', ignoreDuplicates: true })
    if (error) throw error
    return res.status(200).json({ ok: true })
  }
  if (action === 'reply') {
    const text = typeof body === 'string' ? body.trim() : ''
    if (!text || text.length > 5000) return res.status(400).json({ error: 'invalid_body' })
    const { data, error } = await db().from('box_replies').insert({ box_user_id: box.userId, item_id: itemId, body: text }).select('item_id, body, created_at').single()
    if (error) throw error
    return res.status(200).json({ ok: true, reply: data })
  }
  return res.status(400).json({ error: 'invalid_action' })
}

/** Replace media refs with signed URLs, in place. Refs outside the sender's own folder are dropped. */
async function signMedia(slots, userId) {
  const paths = []
  for (const [obj, f] of slots) {
    const v = obj[f]
    if (typeof v === 'string' && v.startsWith('media:')) {
      const p = v.slice(6)
      if (p.startsWith(`${userId}/`)) paths.push(p)
      else delete obj[f]
    }
  }
  let signed = {}
  if (paths.length) {
    const { data: urls } = await db().storage.from('media').createSignedUrls([...new Set(paths)], 6 * 3600)
    signed = Object.fromEntries((urls || []).filter((u) => u.signedUrl).map((u) => [u.path, u.signedUrl]))
  }
  for (const [obj, f] of slots) {
    const v = obj[f]
    if (typeof v === 'string' && v.startsWith('media:')) {
      const p = v.slice(6)
      if (signed[p]) obj[f] = { url: signed[p], key: p }
      else delete obj[f]
    } else if (typeof v === 'string' && v.startsWith('data:')) {
      obj[f] = { url: v, key: null } // legacy inline media
    }
  }
}
