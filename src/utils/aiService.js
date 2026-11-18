/**
 * aiService.js — every Claude call goes through /api/claude.
 * The key and prompts live on the server. A signed-in account is enough (with free limits);
 * a paid letter box raises them. See api/_lib/access.js.
 */
import { getDraft } from './storage'
import { supabase } from './supabase'
import { localISODate } from './diary'

export class PaymentRequiredError extends Error {
  constructor() {
    super('payment_required')
    this.name = 'PaymentRequiredError'
  }
}

export class SignInRequiredError extends Error {
  constructor() {
    super('sign_in_required')
    this.name = 'SignInRequiredError'
  }
}

export class AIUnavailableError extends Error {
  constructor(status) {
    super(status === 429 ? 'cap_reached' : 'unavailable')
    this.name = 'AIUnavailableError'
    this.status = status
  }
}

async function callClaude(payload) {
  const sessionId = getDraft().paymentSessionId || ''
  let res
  try {
    // the sign-in token lets the server show Claude the sender's own photos
    let auth = {}
    try {
      const token = supabase ? (await supabase.auth.getSession()).data?.session?.access_token : null
      if (token) auth = { Authorization: `Bearer ${token}` }
    } catch { /* not signed in */ }
    res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ ...payload, sessionId, today: localISODate() }),
    })
  } catch {
    throw new AIUnavailableError(0)
  }
  if (res.status === 401) throw new SignInRequiredError()
  if (res.status === 402) throw new PaymentRequiredError() // the free allowance for this is used up
  if (!res.ok) throw new AIUnavailableError(res.status)
  const data = await res.json()
  if (!data.text) throw new AIUnavailableError(502)
  return data.text
}

const opener = (phase1) => ({
  role: 'user',
  content: `Hi! I want to prepare a letter box for ${phase1.toName || 'someone I love'}.`,
})

/** Planning conversation. `messages` is what's on screen (starts with the assistant). */
export function runAIInterview(messages, phase1, images = [], story = '') {
  return callClaude({ kind: 'interview', messages: [opener(phase1), ...messages], phase1, images, story })
}

/** Writing companion in the editor. `summary` describes the letter box as it stands. */
export function askCompanion(messages, summary) {
  const first = { role: 'user', content: 'Hi, I’m working on my letter box.' }
  return callClaude({ kind: 'companion', messages: [first, ...messages], summary })
}

export async function generateLetterboxConfig(allData, images = []) {
  try {
    const text = await callClaude({ kind: 'theme', allData, images })
    const t = text.replace(/```json|```/g, '')
    return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1))
  } catch (err) {
    if (err instanceof PaymentRequiredError || err instanceof SignInRequiredError) throw err
    return null
  }
}

/** Split the hidden <GATHERED>n</GATHERED> marker off an interview reply. */
export function extractGathered(text) {
  const m = String(text).match(/<GATHERED>\s*(\d+)\s*<\/GATHERED>/)
  return { text: String(text).replace(/<GATHERED>[\s\S]*?<\/GATHERED>/g, '').trim(), gathered: m ? Math.min(8, Number(m[1])) : null }
}

/** Pull the <COMPLETE>{…}</COMPLETE> block out of the interview's last message. */
export function extractComplete(text) {
  const m = text.match(/<COMPLETE>([\s\S]*?)<\/COMPLETE>/)
  if (!m) return null
  try {
    return { data: JSON.parse(m[1].trim()), rest: text.replace(m[0], '').trim() }
  } catch {
    return null
  }
}

/**
 * Reads excerpts of their chat and returns the story (moments, sayings, earlier goodbyes).
 * `excerpts` come from pickExcerpts(); `stats` were counted in the browser; `names` = { me, them }.
 * Throws SignInRequiredError when signed out, PaymentRequiredError after the free reading,
 * AIUnavailableError(429) after the paid ones.
 */
export async function findStory({ excerpts, stats, names }) {
  const small = { ...(stats || {}) }
  delete small.byMonth // the month-by-month counts aren't needed to find moments
  const text = await callClaude({ kind: 'chat', excerpts, stats: small, names })
  return JSON.parse(text)
}

/**
 * A sticker the library doesn't have, drawn once in the box's art style and kept for everyone.
 * Returns { id, label }; the id ("x-…") works anywhere a sticker id does.
 */
export async function drawSticker(subject, art = 'flat') {
  const sessionId = getDraft().paymentSessionId || ''
  let res
  try {
    let auth = {}
    try {
      const token = supabase ? (await supabase.auth.getSession()).data?.session?.access_token : null
      if (token) auth = { Authorization: `Bearer ${token}` }
    } catch { /* not signed in */ }
    res = await fetch('/api/sticker', { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth }, body: JSON.stringify({ subject, art, sessionId }) })
  } catch {
    throw new AIUnavailableError(0)
  }
  if (res.status === 401) throw new SignInRequiredError()
  if (res.status === 402) throw new PaymentRequiredError()
  if (!res.ok) throw new AIUnavailableError(res.status)
  return res.json()
}
