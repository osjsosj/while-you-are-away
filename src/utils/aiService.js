/**
 * aiService.js — every Claude call goes through /api/claude.
 * The key and prompts live on the server; a paid Stripe session id authorizes the call.
 */
import { getDraft } from './storage'
import { localISODate } from './diary'

export class PaymentRequiredError extends Error {
  constructor() {
    super('payment_required')
    this.name = 'PaymentRequiredError'
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
  const sessionId = getDraft().paymentSessionId
  if (!sessionId) throw new PaymentRequiredError()
  let res
  try {
    res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sessionId, today: localISODate() }),
    })
  } catch {
    throw new AIUnavailableError(0)
  }
  if (res.status === 402) throw new PaymentRequiredError()
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
export function runAIInterview(messages, phase1) {
  return callClaude({ kind: 'interview', messages: [opener(phase1), ...messages], phase1 })
}

/** Writing companion in the editor. `summary` describes the letter box as it stands. */
export function askCompanion(messages, summary) {
  const first = { role: 'user', content: 'Hi, I’m working on my letter box.' }
  return callClaude({ kind: 'companion', messages: [first, ...messages], summary })
}

export async function generateLetterboxConfig(allData) {
  try {
    const text = await callClaude({ kind: 'theme', allData })
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch (err) {
    if (err instanceof PaymentRequiredError) throw err
    return null
  }
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
