/**
 * aiService.js — Claude 호출은 전부 서버(/api/claude)를 거친다.
 * API 키와 프롬프트는 서버에만 있고, 결제된 Stripe 세션 ID로 인증한다.
 */

import { getDraft } from './storage'

export class PaymentRequiredError extends Error {
  constructor() {
    super('payment_required')
    this.name = 'PaymentRequiredError'
  }
}

async function callClaude(payload) {
  const sessionId = getDraft().paymentSessionId
  if (!sessionId) throw new PaymentRequiredError()

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, sessionId }),
  })

  if (res.status === 402) throw new PaymentRequiredError()
  if (!res.ok) throw new Error(`claude_${res.status}`)

  const data = await res.json()
  return data.text || ''
}

export async function runAIInterview(messages, phase1, isFirst) {
  const greeting = {
    role: 'user',
    content: `Hi! I want to build a letter box for ${phase1.toName || 'someone I love'}.`,
  }
  // 화면의 대화는 AI 인사로 시작하므로, API에 보낼 땐 첫 인사(user)를 앞에 붙여준다
  const outgoing = isFirst ? [greeting] : [greeting, ...messages]

  try {
    const text = await callClaude({ kind: 'interview', messages: outgoing, phase1 })
    return text || 'Sorry, something went wrong. Please try again.'
  } catch (err) {
    if (err instanceof PaymentRequiredError) throw err
    return 'Sorry, something went wrong. Please try again.'
  }
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
