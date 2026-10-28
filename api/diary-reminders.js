import { db, escapeHtml, siteUrl, usEveningDate } from './_lib/server.js'
import { promptFor, daysBetween } from '../src/utils/diary.js'

/**
 * Daily job (vercel.json → crons, 01:00 UTC ≈ 6 pm Pacific / 9 pm Eastern).
 * Sends one diary question to everyone who turned evening questions on,
 * and a single "today's the day" note on the day they part. Never mentions skipped days.
 */
export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ error: 'unauthorized' })
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'missing RESEND_API_KEY' })

  const today = usEveningDate()
  const { data: rows, error } = await db()
    .from('diary_reminders')
    .select('session_id, email, to_name, part_date, unsubscribe_token, last_sent_on')
    .eq('enabled', true)
    .gte('part_date', today)
    .or(`last_sent_on.is.null,last_sent_on.lt.${today}`)
    .limit(1000)
  if (error) {
    console.error('reminder query failed:', error.message)
    return res.status(500).json({ error: 'query_failed' })
  }

  const prompt = promptFor(today)
  const emails = rows.map((r) => buildEmail(r, today, prompt))
  let sent = 0
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100)
    const ok = await sendBatch(chunk.map((e) => e.message))
    if (ok) {
      const ids = chunk.map((e) => e.sessionId)
      await db().from('diary_reminders').update({ last_sent_on: today }).in('session_id', ids)
      sent += chunk.length
    }
    if (i + 100 < emails.length) await new Promise((r) => setTimeout(r, 700))
  }
  return res.status(200).json({ date: today, due: rows.length, sent })
}

async function sendBatch(messages) {
  if (!messages.length) return true
  try {
    const r = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
    if (!r.ok) console.error('resend batch failed:', r.status, await r.text())
    return r.ok
  } catch (err) {
    console.error('resend batch error:', err?.message || err)
    return false
  }
}

function buildEmail(row, today, prompt) {
  const site = siteUrl()
  const unsub = `${site}/api/reminder?unsubscribe=${row.unsubscribe_token}`
  const daysLeft = daysBetween(today, row.part_date)
  const name = row.to_name ? escapeHtml(row.to_name) : 'them'
  const from = process.env.REMINDER_FROM || "While You're Away <hello@getwhileyouareaway.com>"

  const handover = daysLeft <= 0
  const subject = handover ? 'Today’s the day' : daysLeft === 1 ? 'Tonight’s question · one day to go' : `Tonight’s question · ${daysLeft} days to go`
  const lead = handover
    ? `Today you part from ${name}. Everything you wrote is waiting in the letter box.`
    : `${daysLeft === 1 ? 'One day' : `${daysLeft} days`} until you part from ${name}.`
  const headline = handover ? 'Leave the light on for them.' : escapeHtml(prompt)
  const cta = handover ? { href: `${site}/export`, label: 'Get the letter box' } : { href: `${site}/diary`, label: 'Write tonight’s entry' }
  const note = handover
    ? 'Download it and hand it over whenever you’re ready. This is the last evening email.'
    : 'Skip any night you like. Nothing piles up, and they’ll never see the days you didn’t write.'

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B1430">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B1430"><tr><td align="center" style="padding:40px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px">
<tr><td style="padding-bottom:24px;font-family:Georgia,serif;font-size:15px;color:#B9C2D3">While You're Away</td></tr>
<tr><td style="background:#F6F3EA;border-radius:10px;padding:32px 28px">
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#5A6070">${lead}</p>
<p style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.4;color:#1B2536">${headline}</p>
<a href="${cta.href}" style="display:inline-block;background:#1B2536;color:#FBFCFD;padding:14px 26px;border-radius:999px;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold">${cta.label}</a>
<p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#4E596B">${note}</p>
</td></tr>
<tr><td style="padding-top:20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8E98AB">
You turned on evening questions for your letter box. <a href="${unsub}" style="color:#B9C2D3">Stop evening questions</a>
</td></tr></table></td></tr></table></body></html>`

  const text = `${handover ? 'Today you part.' : lead}\n\n${handover ? 'Everything you wrote is waiting in the letter box.' : prompt}\n\n${cta.label}: ${cta.href}\n\n${note}\n\nStop evening questions: ${unsub}`

  return {
    sessionId: row.session_id,
    message: {
      from,
      to: [row.email],
      subject,
      html,
      text,
      headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    },
  }
}
