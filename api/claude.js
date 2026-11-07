import { isPaid, db } from './_lib/server.js'
import { STICKERS, STICKER_IDS } from '../src/utils/stickers.js'

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
- Letters they said they'd like to write: ${Array.isArray(p.letterWishes) && p.letterWishes.length ? p.letterWishes.map((w) => str(w, 40)).join(', ') : 'undecided (help them choose)'}
Don't ask again for what is already known; start from it.

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
3. Gather what makes it theirs. Tell them once, lightly: the more small, specific things they share, the more personal we can make the box look (we decorate it from their details), and they can say "that's enough" any time. Then ask one question at a time, and accept short answers without pushing:
   - what they call each other;
   - things that are "theirs": a food or drink they always share, a song, an animal, an object, a place they go;
   - a few places from their story with dates (the first date, a trip), in their words;
   - a running joke or a small habit only they would understand;
   - how they usually got around together, if it matters (a bus line, a train, flights);
   - whether they want a small pet companion in the box (animal + name);
   - the feel when the box is opened. Offer four in plain words, then confirm: cozy and playful like a scrapbook with photos and tape; calm and warm like cream paper under a porch light at night; soft with pressed flowers; or quiet white paper with just the words. Recommend one from what you heard, but it is their choice;
   - a name for the letter box.
   - photos: invite them, once, to drop in two or three photos of the two of them or of things that are "theirs" with the photo button below the chat (they become the short film that plays the first time the box is opened);
   - their voice: invite them, once, to record about ten seconds with the microphone button, saying hello the way they always do (it plays when the recipient taps the seal to open the box).
   If they say "that's enough" (or press the button that says so), stop gathering right away, thank them, and move on to step 4. Never make them feel they gave too little.
4. Their "days before" diary: entries written before parting are stamped with the day. Offer the two options and confirm (see Preference questions):
   - "mirror": an entry written N days before parting opens N days after parting. Days without an entry are skipped quietly.
   - "all": every entry is there from the day they hand it over.
5. Close warmly. Tell them the best letters are made of small everyday moments: whenever something makes them think of the other person (a few lines, a photo, a short video, a voice memo, "on the way to buy your gift"), they can drop it into their "days before" page any time, and you will be there in the editor to help them write.
${SHARED_RULES}
## Fit the relationship
A partner, a parent, a child and a friend need different questions. For a parent or child, ask about family habits, food, sayings, the house; for a friend, about inside jokes, places, how they met. Never assume romance unless they said partner.

## Keep it light
Each reply under about 70 words. One question. If they seem stuck, offer two or three tiny examples to pick from. Never repeat a question they already answered; use their exact words back to them.

## Attachments
A message that starts with "[Attached: a photo]" or "[Attached: a voice note]" means they added one with the buttons. You can usually see the newest photo (it comes with the message); you cannot hear voice notes. When you can see the photo, name one specific, warm thing in it (the place, the light, what is on the table), never anything about anyone's body, looks or identity, and treat what you see as a detail for decorating. Thank them warmly, use any words they wrote with it as a detail, and if it helps ask one short question about it (where, when, why it matters). Photos go into the opening film; the first voice note plays on the seal. Tell them that once.

## Progress marker
At the very end of EVERY message (after the COMPLETE block, if any), add <GATHERED>n</GATHERED>, where n (0 to 8) counts how many of these you now have: what they call each other; something that is theirs; a place with a date; a running joke or habit; how they got around or another everyday ritual; the feel they want; a photo; a voice note. The sender never sees this tag.

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
  "places": [{ "name": "", "date": "YYYY-MM-DD or empty" }],
  "shared": "foods, songs, objects, animals, places that are theirs, in their words",
  "jokes": "",
  "song": "",
  "transport": "",
  "style": "scrapbook | night | flowers | quiet",
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

const DESIGN_TOOL = {
  name: 'design_letter_box',
  description: 'The name, first line, paper and decorations for the letter box.',
  input_schema: {
    type: 'object',
    properties: {
      appNames: { type: 'array', items: { type: 'string' }, maxItems: 3 },
      welcomeMessage: { type: 'string' },
      style: { type: 'string', enum: ['scrapbook', 'night', 'flowers', 'quiet'] },
      motifs: { type: 'array', maxItems: 4, items: { type: 'object', properties: { id: { type: 'string', enum: STICKER_IDS }, why: { type: 'string' } }, required: ['id', 'why'] } },
      postmark: { type: ['object', 'null'], properties: { place: { type: 'string' }, date: { type: 'string' }, why: { type: 'string' } } },
      ticket: { type: ['object', 'null'], properties: { kind: { type: 'string', enum: ['bus', 'train', 'plane'] }, letterId: { type: 'string' }, title: { type: 'string' }, line: { type: 'string' }, why: { type: 'string' } } },
      song: { type: ['object', 'null'], properties: { title: { type: 'string' }, why: { type: 'string' } } },
    },
    required: ['appNames', 'welcomeMessage', 'style', 'motifs'],
  },
}

/* The sticker library, written once so it stays in the prompt cache: "id" or "id (other words people use)". */
const STICKER_LIBRARY = STICKER_IDS.map((id) => {
  const [label, words] = STICKERS[id]
  const extra = words.split(' ').filter((w) => !label.split(' ').includes(w))
  return extra.length ? `${id} (${extra.join(' ')})` : id
}).join('\n')

const DESIGN_SYSTEM = `You design how a letter box looks. Someone is preparing letters for a person they are about to part from. From what they told the guide, choose a name, a first line, a paper style and a few decorations. Stickers come ONLY from the sticker library below, by exact id; you never invent new ones. The words of the letters are never yours: you only dress them.

Rules:
- Use only things the sender actually said or showed in a photo. If nothing fits a decoration, leave it out. Fewer, truer touches beat many.
- 2 to 4 stickers ("motifs"), each an exact library id. Prefer the most specific sticker that matches what they said ("tangerine" over "red-heart", "steaming-bowl" for ramen, "bus" for the bus they took). Hearts only if nothing more personal fits.
- Match on meaning, not only exact words: a "clementine" is a tangerine, "late-night convenience-store ramyeon" is a steaming-bowl, "our walks by the Han river" can be water-wave. Korean words count too.
- Pick stickers that look good together: vary them (one food, one place or object, one animal, say) rather than three of the same kind.
- Each "why" quotes or closely paraphrases what they said, addressed to them ("You said you always split a tangerine on the bus."). One short sentence.
- postmark: a real place from their story and its date, if they gave one. "place" at most 24 characters, in capitals is fine.
- ticket: only if a bus, train or flight is part of their story. Pick ONE letter from "letters" (an open-when or never-said letter fits best) and give it a short ticket title (at most 20 characters, e.g. "Bus 7 home") and a line (at most 38 characters) in their words.
- style: use the sender's choice if they gave one; otherwise recommend from the feel of their story. scrapbook = playful, lots of photos and shared jokes; night = calm, longing, distance; flowers = soft, family, gratitude; quiet = private, serious, few words.
- song: only if they named a song; title as they wrote it (with the artist if they gave one).
- "theirWords" holds the sender's own messages from the conversation and the lines they wrote under their photos. Prefer details that appear there over the summary fields; quote them in each "why".
- Names: three short names for the letter box, personal to them (a nickname, a place, a running joke), never generic like "Love Letters". welcomeMessage: one line in the sender's voice that the recipient sees first, in the language the sender wrote in.
- Before answering, check each sticker id exists in the library exactly as written.

Answer by calling the design_letter_box tool.

## Sticker library
${STICKER_LIBRARY}`

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

const PHOTO_EXT = /\.(jpe?g|png|webp|gif)$/i

/** Signed links to the sender's own photos, as image blocks Claude can look at. Needs their sign-in token. */
async function imageBlocks(req, refs, max) {
  if (!Array.isArray(refs) || !refs.length) return []
  const jwt = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!jwt) return []
  try {
    const { data } = await db().auth.getUser(jwt)
    const uid = data?.user?.id
    if (!uid) return []
    const paths = refs
      .filter((r) => typeof r === 'string' && r.startsWith('media:'))
      .map((r) => r.slice(6))
      .filter((p) => p.startsWith(`${uid}/`) && PHOTO_EXT.test(p) && !p.includes('..'))
      .slice(0, max)
    if (!paths.length) return []
    const { data: urls } = await db().storage.from('media').createSignedUrls(paths, 600)
    return (urls || []).filter((u) => u.signedUrl).map((u) => ({ type: 'image', source: { type: 'url', url: u.signedUrl } }))
  } catch (err) {
    console.warn('photos unavailable for Claude:', err?.message || err)
    return []
  }
}

// ── handler ──────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { kind, sessionId, messages, phase1, allData, summary, today, images } = req.body || {}
  if (!(await isPaid(sessionId))) return res.status(402).json({ error: 'payment_required' })

  // Photos the sender added, so the guide and the designer can actually see them (only the sender's own files).
  const photoBlocks = await imageBlocks(req, images, kind === 'theme' ? 4 : 1)

  let body
  if (kind === 'interview') {
    const clean = cleanMessages(messages)
    if (!clean) return res.status(400).json({ error: 'invalid_messages' })
    if (photoBlocks.length) {
      const last = clean[clean.length - 1]
      if (last.role === 'user') last.content = [...photoBlocks, { type: 'text', text: last.content }]
    }
    // automatic prompt caching: the long system prompt and earlier turns are read from cache on every new turn
    body = { model: MODELS.interview, max_tokens: 2000, cache_control: { type: 'ephemeral' }, system: INTERVIEW_SYSTEM(phase1 || {}, isoToday(today)), messages: clean }
  } else if (kind === 'companion') {
    const clean = cleanMessages(messages)
    if (!clean) return res.status(400).json({ error: 'invalid_messages' })
    if (!(await withinCompanionCap(sessionId))) return res.status(429).json({ error: 'cap_reached' })
    const sum = typeof summary === 'string' ? summary.slice(0, MAX_SUMMARY_CHARS) : ''
    body = { model: MODELS.companion, max_tokens: 700, cache_control: { type: 'ephemeral' }, system: COMPANION_SYSTEM(sum, isoToday(today)), messages: clean }
  } else if (kind === 'theme') {
    const data = JSON.stringify(allData ?? {})
    if (data.length > MAX_PAYLOAD_CHARS) return res.status(413).json({ error: 'too_large' })
    body = {
      model: MODELS.theme,
      max_tokens: 1200,
      tools: [DESIGN_TOOL],
      tool_choice: { type: 'tool', name: DESIGN_TOOL.name },
      // the rules and the sticker library are the same for everyone: cached across all senders
      system: [{ type: 'text', text: DESIGN_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: [...photoBlocks, { type: 'text', text: `Data: ${data}` + (photoBlocks.length ? `\n\nThe ${photoBlocks.length} photo(s) above are ones the sender added. Look at what is in them (places, food, animals, season, light, mood) and let them guide the stickers and the paper. Never describe or guess anything about the people's bodies or identities.` : '') }] }],
    }
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
    const tool = data.content?.find((b) => b.type === 'tool_use')
    const text = tool ? JSON.stringify(tool.input) : data.content?.find((b) => b.type === 'text')?.text || ''
    return res.status(200).json({ text })
  } catch (err) {
    console.error('Claude proxy error:', err)
    return res.status(500).json({ error: 'server_error' })
  }
}
