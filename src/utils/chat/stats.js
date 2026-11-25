/**
 * stats.js — small true facts about a chat, for the free preview and the box.
 * Facts, never scores: nothing ranks who sent more, replied faster or tried harder. Who starts the day
 * and each one's most-asked question are told as plain facts about the two of them; reply speed is only
 * ever the hour they're quickest together, never a per-person average (docs/letter-design-rules.md).
 * Input: messages from withRoles() (each has a role).
 */
import { daysBetween } from '../diary.js'

/** Messages that contain each phrase, Korean and English. Counted once per message. */
export const PHRASES = {
  goodnight: /잘\s?자|잘 자요|굿\s?밤|good\s?night|night night|nighty|\bgn\b/i,
  missYou: /보고\s?싶|보고싶|miss(ed|ing)? (you|u|ya)|\bmiss u\b/i,
  loveYou: /사랑해|사랑행|사랑한다|love (you|u|ya)|\bily\b/i,
  thanks: /고마워|고맙|감사해|thank|\bthx\b|\bty\b/i,
  sorry: /미안|죄송|sorry/i,
  laugh: /ㅋㅋ|ㅎㅎ|haha|hehe|\blol\b|lmao/i,
}

const EMOJI = /\p{Extended_Pictographic}(️|‍\p{Extended_Pictographic})*/gu

const STOP = new Set([
  // Korean everyday filler
  '그래', '그럼', '근데', '그냥', '진짜', '정말', '너무', '아니', '아니야', '나도', '나는', '내가', '너는', '네가', '니가', '우리', '오늘', '지금',
  '이제', '그거', '이거', '저거', '뭐해', '뭐야', '어디', '응응', '그치', '맞아', '있어', '없어', '했어', '하는', '해서', '하고', '그리고', '그래서',
  '좀', '아직', '많이', '조금', '빨리', '같아', '같은', '거야', '건데', '사진', '이모티콘', '동영상', '삭제된', '메시지입니다',
  // English filler
  'the', 'and', 'you', 'that', 'this', 'with', 'for', 'are', 'was', 'have', 'just', 'but', 'not', 'what', 'its', "it's", 'yeah', 'yes', 'okay',
  'too', 'can', 'will', 'all', 'get', 'got', 'like', 'how', 'when', 'out', 'now', 'there', 'then', 'about', 'your', 'i\'m', 'im', 'dont', "don't",
  'omitted', 'image', 'sticker', 'media', 'deleted', 'message',
])

/** Korean particles that stick to a noun ("귤을", "귤이") — trimmed so the noun is counted once. */
const PARTICLE = /(이랑|에서|한테|까지|부터|처럼|이야|이가|은|는|이|가|을|를|도|에|랑|야|아|의|로)$/

function words(text) {
  const out = []
  for (let w of String(text).toLowerCase().match(/[\p{L}\p{N}']+/gu) || []) {
    if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(w) || /^\d+$/.test(w)) continue // ㅋㅋ, ㅠㅠ, numbers
    if (/[가-힣]/.test(w) && w.length > 2) w = w.replace(PARTICLE, '')
    if (w.length < 2 || STOP.has(w)) continue
    out.push(w)
  }
  return out
}

const top = (map, n) => [...map].sort((a, b) => b[1] - a[1]).slice(0, n)

/** Minutes after 5 a.m., so 2 a.m. counts as later than 11 p.m. */
const lateness = (at) => {
  const h = Number(at.slice(11, 13))
  const m = Number(at.slice(14, 16))
  return ((h + 24 - 5) % 24) * 60 + m
}

/** Seconds in a call record's duration ("보이스톡 0:13", "Video call 1:02:03"); 0 for missed or cancelled calls. */
export function callSeconds(text) {
  const m = String(text).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return 0
  return m[3] ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : Number(m[1]) * 60 + Number(m[2])
}

const snip = (m) => (m ? { at: m.at, role: m.role, text: m.text.replace(/\s+/g, ' ').slice(0, 140) } : null)

/** A message that asks something: ends in "?", or a Korean question ending. */
// "그래", "아니", "했어" end like questions but aren't, so only a question mark or 냐 / 까 counts
const QUESTION = /[?？]\s*$|(냐|까)\s*$/
/** A question, trimmed to compare like with like ("did you eat??" and "Did you eat" are one). */
const qKey = (t) => String(t).toLowerCase().replace(EMOJI, '').replace(/[?？!.~…,\s]+$/g, '').replace(/\s+/g, ' ').trim()

/** The day a message belongs to, with the day starting at 5 a.m. (a 1 a.m. message is still last night). */
const dayOf = (at) => {
  const d = new Date(`${at.slice(0, 10)}T${at.slice(11, 16) || '00:00'}:00Z`)
  d.setUTCHours(d.getUTCHours() - 5)
  return d.toISOString().slice(0, 10)
}

/**
 * Firsts, who starts the day, most-asked questions, the hours they talk, the hour they're quickest together.
 * Kept apart from chatStats' older fields so each can be tested on its own.
 */
export function chatMoments(messages, { nicknames = [] } = {}) {
  const timed = messages.filter((m) => m.at && m.kind !== 'system' && m.kind !== 'deleted' && (m.role === 'me' || m.role === 'them'))
  const texts = timed.filter((m) => m.kind === 'text')

  // a1: the first time each thing was said, and the first call that connected
  const firstOf = (re) => snip(texts.find((m) => re.test(m.text)))
  const nick = nicknames.map((n) => String(n).trim()).filter((n) => n.length >= 2)
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const nickRe = nick.length ? new RegExp(`(^|[^\\p{L}])(${nick.map(esc).join('|')})([^\\p{L}]|$)`, 'iu') : null
  const firstCall = timed.find((m) => m.kind === 'call' && callSeconds(m.text) > 0)
  const firsts = {
    loveYou: firstOf(PHRASES.loveYou),
    missYou: firstOf(PHRASES.missYou),
    goodnight: firstOf(PHRASES.goodnight),
    nickname: nickRe ? snip(texts.find((m) => nickRe.test(m.text))) : null,
    call: firstCall ? { at: firstCall.at, role: firstCall.role } : null,
  }

  // a3: who sends the first message of the day (a day starts at 5 a.m.)
  const starts = { me: 0, them: 0 }
  const seen = new Set()
  for (const m of timed) {
    if (m.kind === 'call') continue
    const d = dayOf(m.at)
    if (seen.has(d)) continue
    seen.add(d)
    starts[m.role]++
  }

  // a4: each one's most-asked question, word for word, when they asked it three times or more
  const asked = { me: new Map(), them: new Map() }
  const shown = new Map()
  for (const m of texts) {
    const t = m.text.trim()
    if (t.length > 60 || !QUESTION.test(t)) continue
    const k = qKey(t)
    if (k.length < 3) continue
    asked[m.role].set(k, (asked[m.role].get(k) || 0) + 1)
    if (!shown.has(k)) shown.set(k, t.replace(/\s+/g, ' '))
  }
  const topQ = (map) => { const [k, count] = top(map, 1)[0] || []; return k && count >= 3 ? { text: shown.get(k), count } : null }
  const questions = { me: topQ(asked.me), them: topQ(asked.them) }

  // a5: messages by hour, and the three-hour stretch they talk most in
  const byHour = Array(24).fill(0)
  for (const m of texts) byHour[Number(m.at.slice(11, 13))]++
  let peak = null
  for (let h = 0; h < 24; h++) {
    const n = byHour[h] + byHour[(h + 1) % 24] + byHour[(h + 2) % 24]
    if (!peak || n > peak.count) peak = { start: h, count: n }
  }
  const total = texts.length
  const talkHours = peak && total >= 30 ? { start: peak.start, end: (peak.start + 3) % 24, share: Math.round((peak.count / total) * 100) } : null

  // a6: the hour they answer each other fastest, both together (replies within the same hour of talk)
  const waits = Array.from({ length: 24 }, () => [])
  for (let i = 1; i < texts.length; i++) {
    const a = texts[i - 1], b = texts[i]
    if (a.role === b.role) continue
    const sec = (Date.parse(`${b.at}:00Z`) - Date.parse(`${a.at}:00Z`)) / 1000
    if (sec >= 0 && sec <= 3600) waits[Number(b.at.slice(11, 13))].push(sec)
  }
  let quick = null
  for (let h = 0; h < 24; h++) {
    const w = waits[h].sort((x, y) => x - y)
    if (w.length < 20) continue
    const median = w[Math.floor(w.length / 2)]
    if (!quick || median < quick.seconds) quick = { hour: h, seconds: median, replies: w.length }
  }

  return { firsts, starts, questions, byHour, talkHours, quick }
}

export function chatStats(messages, opts = {}) {
  const msgs = messages.filter((m) => m.kind !== 'system' && m.kind !== 'deleted')
  const texts = msgs.filter((m) => m.kind === 'text')
  const timed = msgs.filter((m) => m.at)

  // days they were in touch count calls too; the busiest day and months count messages only
  const contactDays = new Set(timed.map((m) => m.at.slice(0, 10)))
  const perDay = new Map()
  const perMonth = new Map()
  for (const m of timed) {
    if (m.kind === 'call') continue
    const d = m.at.slice(0, 10)
    perDay.set(d, (perDay.get(d) || 0) + 1)
    perMonth.set(d.slice(0, 7), (perMonth.get(d.slice(0, 7)) || 0) + 1)
  }

  const phrases = {}
  for (const [k, re] of Object.entries(PHRASES)) phrases[k] = texts.filter((m) => re.test(m.text)).length

  const emoji = new Map()
  const vocab = new Map()
  for (const m of texts) {
    for (const e of m.text.match(EMOJI) || []) emoji.set(e, (emoji.get(e) || 0) + 1)
    for (const w of words(m.text)) vocab.set(w, (vocab.get(w) || 0) + 1)
  }

  // the latest the two of them were still talking, between midnight and 5 a.m.
  let late = null
  for (const m of timed) {
    if (m.kind !== 'text' || Number(m.at.slice(11, 13)) >= 5) continue
    if (!late || lateness(m.at) > lateness(late.at)) late = m
  }

  const busiest = top(perDay, 1)[0]
  const from = timed.length ? timed[0].at.slice(0, 10) : null
  const to = timed.length ? timed[timed.length - 1].at.slice(0, 10) : null

  return {
    total: msgs.filter((m) => m.kind !== 'call').length,
    // calls that connected, and how long they talked in all (call records carry a duration)
    calls: msgs.filter((m) => m.kind === 'call' && callSeconds(m.text) > 0).length,
    callMinutes: Math.round(msgs.reduce((n, m) => n + (m.kind === 'call' ? callSeconds(m.text) : 0), 0) / 60),
    photos: msgs.filter((m) => m.kind === 'photo' || m.kind === 'video').length,
    voices: msgs.filter((m) => m.kind === 'voice').length,
    from,
    to,
    spanDays: from && to ? daysBetween(from, to) + 1 : null,
    daysTalked: contactDays.size,
    first: snip(timed.find((m) => m.kind === 'text') || texts[0]),
    busiest: busiest ? { date: busiest[0], count: busiest[1] } : null,
    lateNight: snip(late),
    phrases,
    topEmoji: top(emoji, 5).map(([e, count]) => ({ emoji: e, count })),
    topWords: top(vocab, 12).filter(([, c]) => c >= 3).map(([word, count]) => ({ word, count })),
    byMonth: [...perMonth].sort((a, b) => a[0].localeCompare(b[0])).map(([month, count]) => ({ month, count })),
    ...chatMoments(messages, opts),
  }
}
