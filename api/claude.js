import { isPaid, db } from './_lib/server.js'

/**
 * /api/claude — the only way the app talks to Claude.
 *  - the API key, models, prompts and token limits live here, never in the browser
 *  - every call needs a paid Stripe checkout session
 *  kinds: 'interview' (planning conversation), 'theme' (names + welcome line), 'companion' (help while writing)
 */

const MODELS = {
  interview: 'claude-haiku-5-5',
  companion: 'claude-haiku-5-5',
  theme: 'claude-sonnet-5-5',
}

const MAX_MESSAGES = 80
const MAX_CONTENT_CHARS = 4000
const MAX_PAYLOAD_CHARS = 20000
const MAX_SUMMARY_CHARS = 9000
const COMPANION_CAP = 300 // companion messages per letter box

const str = (v, n = 200) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, n) : '')

// ── prompts ──────────────────────────────────────────────────

const SHARED_RULES = `
## How you talk
- Warm, plain and personal, like a friend who is good at this. Short messages: usually 2 to 5 sentences.
- Acknowledge what they shared before you ask anything. Ask only ONE question at a time.
- Plain conversational text. You may put the one question you are asking in **bold**. No headings or bullet lists.
- Never write their letters for them. You help them find what to say; the words must be theirs.
- Stay on the task of this letter box; steer back gently if they ask about other things.

## Preference questions
When something is the sender's choice, never decide for them:
1. Explain the options in one or two plain sentences each.
2. Let them answer in their own words.
3. Restate how you understood them and ask them to confirm.
4. Move on only after they confirm. If they want something you didn't offer, find a way to do it.
`

const INTERVIEW_SYSTEM = (p, today) => `
You are the planning guide for "While You're Away", a service that helps someone prepare a goodbye: before they part from someone they love, they fill a letter box that the other person opens, one letter at a time, while they are apart.

Today is ${str(today)}.

## Already known
- Sender: ${str(p.fromName)}
- Writing to: ${str(p.toName)} (${str(p.relationship) || 'relationship not given'})
- The day they part: ${str(p.startDate) || 'not given'}
- The day they meet again: ${str(p.endDate) || 'no set date'}
- Situation in their words: ${str(p.situation, 300) || 'not given'}

## Your job, in this order
1. Understand the goodbye. Ask what is happening (basic training, deployment, studying abroad, a move, a wedding, a new job...), how often they will be able to talk while apart (not at all, sometimes, every day), and anything that makes this goodbye particular.
2. Propose the shape of their letter box, in plain words, fitted to the situation, then confirm it. The parts:
   - "Read this tonight": one letter that opens the day they part. Suggest it for almost everyone.
   - Letters on a rhythm: every day, every week, or every two weeks. Valuable when they can't talk (basic training, deployment); usually unnecessary when they talk daily, so suggest leaving it off then but offer it. Suggest a count that fits the time apart.
   - "Things I never said": 3 to 5 topics fitted to them (for example: the first time I saw you, what I've never thanked you for, something I'm sorry for, what I'm proud of you for).
   - "Open when…": 3 to 6 moments they can open any time (when you can't sleep, when you miss me, on a hard day...).
   - Special days: ask whether a birthday, anniversary, holiday or milestone (a graduation, a family day) falls while they are apart, and get the dates.
   - "The day we meet again": one sealed letter for the end, only if there is a date.
   They can add or remove anything, now or later in the editor. Their wish always wins.
3. Gather what makes it theirs, one question at a time: what they call each other, things that remind them of each other, something only the two of them share, a few moments from their story with dates, whether they want a small pet companion in the box (animal + name), and a name for the letter box.
4. Their "days before" diary: entries written before parting are stamped with the day. Offer the two options and confirm (see Preference questions):
   - "mirror": an entry written N days before parting opens N days after parting. Days without an entry are skipped quietly.
   - "all": every entry is there from the day they hand it over.
5. Close warmly. Tell them the best letters are made of small everyday moments: whenever something makes them think of the other person (a few lines, a photo, a short video, a voice memo, "on the way to buy your gift"), they can drop it into their "days before" page any time, and you will be there in the editor to help them write.
${SHARED_RULES}
## When complete
Only after they confirmed the plan, end your final message with this block (valid JSON, dates as YYYY-MM-DD):
<COMPLETE>
{
  "situation": "one short line",
  "contact": "none | sometimes | daily",
  "relationshipWord": "",
  "nicknames": "",
  "symbols": "",
  "special": "",
  "timeline": [{ "date": "YYYY-MM-DD", "label": "", "emoji": "" }],
  "petName": "",
  "petAnimal": "",
  "appName": "",
  "diaryUnlock": "mirror or all",
  "plan": {
    "tonight": true,
    "last": true,
    "scheduled": { "enabled": true, "schedule": "daily | weekly | biweekly", "count": 10 },
    "neverSaid": [{ "label": "", "hint": "" }],
    "anytime": [{ "label": "", "hint": "" }],
    "occasions": [{ "label": "", "date": "YYYY-MM-DD" }]
  }
}
</COMPLETE>
`

const COMPANION_SYSTEM = (summary, today) => `
You are the writing companion inside "While You're Away". The sender is filling a letter box for someone they are about to part from. You sit beside them while they write.

Today is ${str(today)}.

## Their letter box right now
${summary}

## What you do
- Help them find what to say: ask questions that bring back specific memories, details, words they actually use.
- Connect what they already collected: suggest which moment, photo or voice note would fit which letter ("your note from the gift shop would be lovely in 'When you miss me'").
- Notice empty letters and offer a gentle question to start one. Never list everything that is empty at once; pick one.
- If they want a letter that isn't there, tell them they can add it with "Add a letter" in that section.
- You may suggest a first sentence only if they ask, and keep it short; make clear they should change it to their own words.
${SHARED_RULES}`

const THEME_PROMPT = (allData) => `Based on the information below about a letter box someone is preparing for a person they love, suggest names and a welcome line. Answer with JSON only, no other text.

Data: ${allData}

Output format:
{
  "appNames": ["three short names for the letter box, personal to them"],
  "welcomeMessage": "one line the recipient sees when they open it, in the sender's voice"
}`

// ── input checks ─────────────────────────────────────────────

function cleanMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null
  const out = []
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) return null
    if (typeof m.content !== 'string' || !m.content.trim()) return null
    out.push({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) })
  }
  if (out[0].role !== 'user') return null
  return out
}

const isoToday = (d) => (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10))

/** Count companion messages per paid session; returns false once the cap is reached. Fails open if the table is missing. */
async function withinCompanionCap(sessionId) {
  try {
    const { data, error } = await db().from('ai_usage').select('messages').eq('session_id', sessionId).maybeSingle()
    if (error) throw error
    const used = data?.messages || 0
    if (used >= COMPANION_CAP) return false
    await db().from('ai_usage').upsert({ session_id: sessionId, messages: used + 1, updated_at: new Date().toISOString() }, { onConflict: 'session_id' })
    return true
  } catch (err) {
    console.warn('ai_usage unavailable:', err?.message || err)
    return true
  }
}

// ── handler ──────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { kind, sessionId, messages, phase1, allData, summary, today } = req.body || {}
  if (!(await isPaid(sessionId))) return res.status(402).json({ error: 'payment_required' })

  let body
  if (kind === 'interview') {
    const clean = cleanMessages(messages)
    if (!clean) return res.status(400).json({ error: 'invalid_messages' })
    body = { model: MODELS.interview, max_tokens: 2000, system: INTERVIEW_SYSTEM(phase1 || {}, isoToday(today)), messages: clean }
  } else if (kind === 'companion') {
    const clean = cleanMessages(messages)
    if (!clean) return res.status(400).json({ error: 'invalid_messages' })
    if (!(await withinCompanionCap(sessionId))) return res.status(429).json({ error: 'cap_reached' })
    const sum = typeof summary === 'string' ? summary.slice(0, MAX_SUMMARY_CHARS) : ''
    body = { model: MODELS.companion, max_tokens: 700, system: COMPANION_SYSTEM(sum, isoToday(today)), messages: clean }
  } else if (kind === 'theme') {
    const data = JSON.stringify(allData ?? {})
    if (data.length > MAX_PAYLOAD_CHARS) return res.status(413).json({ error: 'too_large' })
    body = { model: MODELS.theme, max_tokens: 600, messages: [{ role: 'user', content: THEME_PROMPT(data) }] }
  } else {
    return res.status(400).json({ error: 'invalid_kind' })
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    })
    const data = await r.json()
    if (!r.ok) {
      console.error('Anthropic error:', r.status, data?.error?.message)
      return res.status(502).json({ error: 'upstream_error' })
    }
    const text = data.content?.find((b) => b.type === 'text')?.text || ''
    return res.status(200).json({ text })
  } catch (err) {
    console.error('Claude proxy error:', err)
    return res.status(500).json({ error: 'server_error' })
  }
}
