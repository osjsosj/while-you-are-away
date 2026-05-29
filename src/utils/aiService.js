const API_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
}

const SYSTEM_PROMPT = (phase1) => `
You are a warm, empathetic letter box curator helping someone create a deeply personal gift for the person they love.

Your job is to have a natural, caring conversation to collect the remaining information needed to build their custom letter box.

## Information already collected
- Situation: ${phase1.situation || ''}
- Sender name: ${phase1.fromName || ''}
- Recipient name: ${phase1.toName || ''}
- Departure date: ${phase1.startDate || ''}
- Return date: ${phase1.endDate || ''}
- No-contact period: ${phase1.blackout || ''}
- Letter unlock schedule: ${phase1.unlockSchedule || ''}
- Number of scheduled letters (auto-calculated): ${phase1.regularCount || ''}

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

export async function runAIInterview(messages, phase1, isFirst) {
  const systemMessages = isFirst
    ? [
        {
          role: 'user',
          content: `Hi! I want to build a letter box for ${phase1.toName || 'someone I love'}.`,
        },
      ]
    : messages

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM_PROMPT(phase1),
      messages: systemMessages,
    }),
  })

  const data = await res.json()
  return (
    data.content?.find((b) => b.type === 'text')?.text ||
    'Sorry, something went wrong. Please try again.'
  )
}

export async function generateLetterboxConfig(allData) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `Based on the information below, generate a letter box theme as JSON only. No other text.

Data: ${JSON.stringify(allData)}

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
}`,
        },
      ],
    }),
  })

  const data = await res.json()
  const text = data.content?.find((b) => b.type === 'text')?.text || ''
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}
