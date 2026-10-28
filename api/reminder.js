import { isPaid, db, escapeHtml, isEmail, isISODate, siteUrl, usEveningDate } from './_lib/server.js'

/**
 * POST /api/reminder            turn evening questions on or off (needs a paid checkout session)
 * GET|POST /api/reminder?unsubscribe=<token>   one-click unsubscribe from the email footer
 */
export default async function handler(req, res) {
  const token = req.query?.unsubscribe
  if (token) return unsubscribe(req, res, String(token))

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { sessionId, email, partDate, toName, enabled } = req.body || {}
  if (!(await isPaid(sessionId))) return res.status(402).json({ error: 'payment_required' })

  const on = enabled !== false
  if (on) {
    if (!isEmail(email)) return res.status(400).json({ error: 'invalid_email' })
    if (!isISODate(partDate) || partDate < usEveningDate()) return res.status(400).json({ error: 'invalid_date' })
  }

  const row = {
    session_id: sessionId,
    enabled: on,
    updated_at: new Date().toISOString(),
    ...(on ? { email: email.trim(), part_date: partDate, to_name: typeof toName === 'string' ? toName.slice(0, 80) : null } : {}),
  }

  try {
    const table = db().from('diary_reminders')
    const { data: existing } = await table.select('session_id').eq('session_id', sessionId).maybeSingle()
    if (!existing && !on) return res.status(200).json({ ok: true })
    const { error } = existing
      ? await db().from('diary_reminders').update(row).eq('session_id', sessionId)
      : await db().from('diary_reminders').insert(row)
    if (error) throw error
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('reminder save failed:', err?.message || err)
    return res.status(500).json({ error: 'server_error' })
  }
}

async function unsubscribe(req, res, token) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return page(res, 400, 'This link isn’t valid.', 'It may be incomplete. You can also turn evening questions off on your diary page.')
  const { error } = await db()
    .from('diary_reminders')
    .update({ enabled: false, updated_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
  if (error) {
    console.error('unsubscribe failed:', error.message)
    return page(res, 500, 'Something went wrong.', 'Please try the link again in a minute.')
  }
  if (req.method === 'POST') return res.status(200).send('ok')
  return page(res, 200, 'Evening questions are off.', 'You won’t get any more of them. Your diary is still there whenever you want to write.')
}

function page(res, status, title, body) {
  res.status(status).setHeader('Content-Type', 'text/html; charset=utf-8')
  res.send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0B1430;color:#E9ECF2;font-family:system-ui,sans-serif;padding:24px">
<main style="max-width:420px;text-align:center"><h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px;margin:0 0 12px">${escapeHtml(title)}</h1>
<p style="color:#C9D0DC;line-height:1.6;margin:0 0 24px">${escapeHtml(body)}</p>
<a href="${siteUrl()}/diary" style="color:#F0B341">Go to your diary</a></main></body></html>`)
}
