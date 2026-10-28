import Stripe from 'stripe'

/**
 * /api/claude — Claude API 서버 프록시
 *
 * - API 키는 서버에만 있음 (ANTHROPIC_API_KEY, VITE_ 접두사 없음)
 * - 결제 완료된 Stripe 세션 ID가 있어야만 호출됨
 * - 모델·프롬프트·토큰 한도는 서버가 고정 → 클라이언트가 임의로 바꿀 수 없음
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const MODELS = {
  interview: 'claude-haiku-5-5',
  theme: 'claude-sonnet-5-5',
}

const MAX_MESSAGES = 60 // 인터뷰 대화 최대 길이
const MAX_CONTENT_CHARS = 4000 // 메시지 1개 최대 글자 수
const MAX_PAYLOAD_CHARS = 20000 // 테마 생성용 데이터 최대 크기

// ── 결제 검증 ────────────────────────────────────────────────

const paidCache = new Map() // 같은 인스턴스 안에서 Stripe 재조회 줄이기

async function isPaid(sessionId) {
  if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) return false
  if (paidCache.get(sessionId)) return true
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const paid = session.payment_status === 'paid'
    if (paid) paidCache.set(sessionId, true)
    return paid
  } catch {
    return false
  }
}

// ── 프롬프트 (서버 고정) ───────────────────────────────────────

const str = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, 200) : '')

const INTERVIEW_SYSTEM = (p) => `
You are a warm, empathetic letter box curator helping someone create a deeply personal gift for the person they love.

Your job is to have a natural, caring conversation to collect the remaining information needed to build their custom letter box.

## Information already collected
- Situation: ${str(p.situation)}
- Sender name: ${str(p.fromName)}
- Recipient name: ${str(p.toName)}
- Departure date: ${str(p.startDate)}
- Return date: ${str(p.endDate)}
- No-contact period: ${str(p.blackout)}
- Letter unlock schedule: ${str(p.unlockSchedule)}
- Number of scheduled letters (auto-calculated): ${str(p.regularCount)}

## Information still needed
1. One word or phrase that defines this relationship (e.g. "soulmates", "my person")
2. Nicknames for each other
3. Things that remind them of each other (colors, seasons, animals, food, songs, etc.)
4. Something only the two of them share (a habit, inside joke, special place, object)
5. Timeline of special moments together (date + what happened)
6. Situation-based letter labels (e.g. "when you miss me", "when you're lonely")
7. Whether they want a pet companion feature, and if so — what animal and name
8. What stats they'd like to track (visit count, replies, pet feeds, etc.)
9. A name for the letter box

## Conversation rules
- Always acknowledge and respond warmly to what they shared before asking the next question
- Ask only ONE question at a time
- If something can be logically inferred, just confirm it naturally (e.g. "So that's 10 weeks — should we do 10 letters, one per week?")
- If an answer is vague or very short, gently ask one follow-up
- Keep the tone warm and personal, like a friend helping plan something meaningful
- Stay on the task of building this letter box; politely steer back if asked about unrelated things
- Write in plain conversational text. You may use **bold** for the one question you are asking, but no headings, bullet lists, or other markdown
- Once ALL information is collected, wrap up warmly and include the data block below

## When complete
At the very end of your final message, include:
<COMPLETE>
{
  "relationshipWord": "",
  "nicknames": "",
  "symbols": "",
  "special": "",
  "timeline": [{ "date": "YYYY-MM-DD", "label": "", "emoji": "" }],
  "situationLabels": [{ "id": "s0", "label": "", "emoji": "", "hint": "" }],
  "petName": "",
  "petAnimal": "",
  "stats": [],
  "appName": ""
}
</COMPLETE>
`

const THEME_PROMPT = (allData) => `Based on the information below, generate a letter box theme as JSON only. No other text.

Data: ${allData}

Output format:
{
  "appNames": ["option1", "option2", "option3"],
  "theme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "mood": "one word"
  },
  "welcomeMessage": "one-line message shown on the home screen"
}`

// ── 입력 정리 ────────────────────────────────────────────────

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

// ── 핸들러 ──────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { kind, sessionId, messages, phase1, allData } = req.body || {}

  if (!(await isPaid(sessionId))) {
    return res.status(402).json({ error: 'payment_required' })
  }

  let body
  if (kind === 'interview') {
    const clean = cleanMessages(messages)
    if (!clean) return res.status(400).json({ error: 'invalid_messages' })
    body = {
      model: MODELS.interview,
      max_tokens: 1000,
      system: INTERVIEW_SYSTEM(phase1 || {}),
      messages: clean,
    }
  } else if (kind === 'theme') {
    const data = JSON.stringify(allData ?? {})
    if (data.length > MAX_PAYLOAD_CHARS) return res.status(413).json({ error: 'too_large' })
    body = {
      model: MODELS.theme,
      max_tokens: 1000,
      messages: [{ role: 'user', content: THEME_PROMPT(data) }],
    }
  } else {
    return res.status(400).json({ error: 'invalid_kind' })
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
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
