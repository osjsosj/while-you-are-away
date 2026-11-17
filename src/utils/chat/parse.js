/**
 * parse.js — turns an exported chat into one list of messages.
 * Pure functions (no browser APIs), so they run in a Web Worker and in Node tests.
 *
 * Every message: { at, author, text, kind }
 *  - at: local time as 'YYYY-MM-DDTHH:MM' (no time zone; exports don't carry one), or null for pasted text without times
 *  - kind: 'text' | 'photo' | 'video' | 'sticker' | 'voice' | 'call' | 'media' | 'deleted' | 'system'
 *
 * Sources: KakaoTalk (phone TXT, PC TXT, PC CSV), WhatsApp (iOS, Android), iMessage (Mac export TXT), pasted lines.
 */

export const SOURCES = ['kakao', 'kakao-pc', 'kakao-csv', 'whatsapp', 'imessage', 'paste']

// ── time ─────────────────────────────────────────────────────

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 }
const monthOf = (name) => MONTHS[String(name).slice(0, 3).toLowerCase()] || 0

const pad = (n) => String(n).padStart(2, '0')

/** 'YYYY-MM-DDTHH:MM', or null when a part is out of range. */
export function stamp(y, mo, d, h = 0, mi = 0) {
  y = Number(y); mo = Number(mo); d = Number(d); h = Number(h); mi = Number(mi)
  if (y < 100) y += 2000
  if (!(y >= 1990 && y <= 2100 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31 && h >= 0 && h <= 23 && mi >= 0 && mi <= 59)) return null
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}`
}

/** 12-hour clock to 24 (오전/오후, AM/PM, a.m./p.m.). */
export function to24(h, mark) {
  h = Number(h)
  if (!mark) return h
  const pm = /오후|p/i.test(mark)
  if (h === 12) return pm ? 12 : 0
  return pm ? h + 12 : h
}

const AMPM = '(오전|오후|[AaPp]\\.?\\s?[Mm]\\.?)'

// ── message kinds ────────────────────────────────────────────

const KINDS = [
  // call records: "보이스톡 해요", "페이스톡 부재중", "보이스톡 0:13", "Missed voice call", "Video call 1:02:03"
  ['call', /^(보이스톡|페이스톡|그룹콜|voice ?talk|face ?talk|(missed )?(voice|video) call)( (해요|부재중|취소|응답없음|\d{1,2}:\d{2}(:\d{2})?|cancell?ed|missed|no answer|declined))?$/i],
  ['deleted', /^(삭제된 메시지입니다\.?|this message (was|has been) deleted\.?|you deleted this message\.?|메시지가 삭제되었습니다\.?)$/i],
  ['photo', /^(사진( \d+장)?|photos?( \d+)?|image omitted|<attached: [^>]*\.(jpe?g|png|heic|webp|gif)>|[^\s]*\.(jpe?g|png|heic|webp))$/i],
  ['video', /^(동영상|videos?|video omitted|<attached: [^>]*\.(mp4|mov)>)$/i],
  ['sticker', /^(이모티콘|emoticons?|sticker omitted|gif omitted|스티커)$/i],
  ['voice', /^(음성메시지|음성 메시지|voice message|audio omitted|<attached: [^>]*\.(opus|m4a|caf)>)$/i],
  ['media', /^(<media omitted>|document omitted|파일: .+|file: .+|<attached: [^>]+>)$/i],
]

export function kindOf(text) {
  const t = String(text).trim()
  for (const [kind, re] of KINDS) if (re.test(t)) return kind
  return 'text'
}

const SYSTEM = /님이 (들어왔습니다|나갔습니다|.*초대했습니다)|님을 내보냈습니다|채팅방 관리자|joined (this chat|using)|left the chat|left$|added .+|removed .+|messages and calls are end-to-end encrypted|created group|changed the (subject|group)|security code changed/i

// ── helpers ──────────────────────────────────────────────────

/** BOM off, Windows line ends off, invisible direction marks off, odd spaces to plain spaces. */
export function clean(raw) {
  return String(raw)
    .replace(/^\ufeff/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/[\u202f\u00a0]/g, ' ')
}

function push(out, at, author, text) {
  const t = String(text)
  out.push({ at, author: String(author).trim(), text: t, kind: kindOf(t) })
}

/** A line that didn't start a new message belongs to the one before it. */
function cont(out, line) {
  const last = out[out.length - 1]
  if (!last) return false
  last.text += `\n${line}`
  if (last.kind !== 'text') last.kind = 'text'
  return true
}

// ── KakaoTalk, phone export ──────────────────────────────────
// "2024년 3월 14일 오후 9:12, 하은 : 안녕"   "2024. 3. 14. 오후 9:12, 하은 : 안녕"
// "2024. 3. 14. 21:12, 하은 : 안녕"          "Mar 14, 2024 at 9:12 PM, Haeun : hi"
// Date lines on their own ("2024년 3월 14일 목요일") and join/leave lines are skipped.

const K_KR = new RegExp(`^(\\d{4})년\\s*(\\d{1,2})월\\s*(\\d{1,2})일\\s*(?:\\S요일\\s*)?${AMPM}?\\s*(\\d{1,2}):(\\d{2})`)
const K_DOT = new RegExp(`^(\\d{4})\\.\\s*(\\d{1,2})\\.\\s*(\\d{1,2})\\.?\\s*${AMPM}?\\s*(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*${AMPM}?`)
const K_EN = new RegExp(`^([A-Za-z]{3,9})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})(?:,|\\s+at)?\\s+(\\d{1,2}):(\\d{2})(?::\\d{2})?\\s*${AMPM}`)
const K_DATE_ONLY = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일(\s*\S요일)?$|^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?$|^[A-Za-z]+day,\s+[A-Za-z]+\s+\d{1,2},\s+\d{4}$|^[A-Za-z]+\s+\d{1,2},\s+\d{4}$/

/** The time at the start of a phone-export line, and where the rest begins. */
function kakaoLead(line) {
  let m = line.match(K_KR)
  if (m) return { at: stamp(m[1], m[2], m[3], to24(m[5], m[4]), m[6]), len: m[0].length }
  m = line.match(K_DOT)
  if (m) return { at: stamp(m[1], m[2], m[3], to24(m[5], m[4] || m[7]), m[6]), len: m[0].length }
  m = line.match(K_EN)
  if (m && monthOf(m[1])) return { at: stamp(m[3], monthOf(m[1]), m[2], to24(m[4], m[6]), m[5]), len: m[0].length }
  return null
}

const K_HEADER = /님과 카카오톡 대화$|^저장한 날짜\s*:|^talk_|^chats? with .+ on kakaotalk$|^date saved\s*:/i

export function parseKakao(text) {
  const out = []
  for (const line of clean(text).split('\n')) {
    if (!line.trim()) continue
    if (K_HEADER.test(line.trim()) && !out.length) continue
    const lead = kakaoLead(line)
    if (lead && lead.at) {
      const rest = line.slice(lead.len).replace(/^\s*,\s*/, '')
      const sep = rest.indexOf(' : ')
      if (sep > 0) { push(out, lead.at, rest.slice(0, sep), rest.slice(sep + 3)); continue }
      if (!rest.trim() || SYSTEM.test(rest)) continue // a bare time line or a join/leave notice
      if (cont(out, line)) continue
      continue
    }
    if (K_DATE_ONLY.test(line.trim())) continue
    cont(out, line)
  }
  return out
}

// ── KakaoTalk for PC, TXT ────────────────────────────────────
// "--------------- 2024년 3월 14일 목요일 ---------------"
// "[하은] [오후 9:12] 안녕"      "[Haeun] [9:12 PM] hi"

const PC_SEP = /^-{5,}\s*(.+?)\s*-{5,}$/
const PC_MSG = new RegExp(`^\\[(.+?)\\] \\[${AMPM}?\\s*(\\d{1,2}):(\\d{2})\\s*${AMPM}?\\] ?(.*)$`)

function pcDay(s) {
  let m = s.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/)
  if (m) return [m[1], m[2], m[3]]
  m = s.match(/([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/)
  if (m && monthOf(m[1])) return [m[3], monthOf(m[1]), m[2]]
  m = s.match(/(\d{4})[.-]\s*(\d{1,2})[.-]\s*(\d{1,2})/)
  if (m) return [m[1], m[2], m[3]]
  return null
}

export function parseKakaoPC(text) {
  const out = []
  let day = null
  for (const line of clean(text).split('\n')) {
    if (!line.trim()) continue
    const sep = line.trim().match(PC_SEP)
    if (sep) { day = pcDay(sep[1]) || day; continue }
    const m = line.match(PC_MSG)
    if (m && day) {
      const at = stamp(day[0], day[1], day[2], to24(m[3], m[2] || m[5]), m[4])
      if (at) { push(out, at, m[1], m[6]); continue }
    }
    if (!day) continue // header lines before the first date
    if (SYSTEM.test(line)) continue
    cont(out, line)
  }
  return out
}

// ── KakaoTalk for PC, CSV ────────────────────────────────────
// "Date,User,Message" then "2024-03-14 21:12:33,"하은","안녕""

/** RFC 4180 rows; quoted fields may hold commas, quotes ("") and line breaks. */
export function csvRows(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

export function parseKakaoCSV(text) {
  const rows = csvRows(clean(text))
  const out = []
  for (const r of rows) {
    if (r.length < 3) continue
    const m = String(r[0]).trim().match(/^(\d{4})[-.]\s*(\d{1,2})[-.]\s*(\d{1,2})\.?\s+(\d{1,2}):(\d{2})/)
    if (!m) continue // the header row
    const at = stamp(m[1], m[2], m[3], m[4], m[5])
    if (!at) continue
    push(out, at, r[1], r.slice(2).join(','))
  }
  return out
}

// ── WhatsApp ─────────────────────────────────────────────────
// iOS:     "[14/03/2024, 21:12:03] Sam: hi"     "[3/14/24, 9:12:03 PM] Sam: hi"
// Android: "14/03/2024, 21:12 - Sam: hi"        "3/14/24, 9:12 PM - Sam: hi"
// Day/month order isn't in the file, so it's worked out from the dates themselves.

const WA_DATE = `(\\d{1,4})[./-](\\d{1,2})[./-](\\d{1,4}),?\\s+(\\d{1,2})[:.](\\d{2})(?:[:.]\\d{2})?\\s*${AMPM}?`
const WA_IOS = new RegExp(`^\\[${WA_DATE}\\]\\s+(.*)$`)
const WA_ANDROID = new RegExp(`^${WA_DATE}\\s+-\\s+(.*)$`)

/** Pick y/m/d order for all the date triples at once: the order that is valid and keeps time moving forward. */
function resolveOrder(triples) {
  const orders = [['y', 'm', 'd'], ['d', 'm', 'y'], ['m', 'd', 'y']]
  let best = null
  for (const o of orders) {
    let bad = 0
    let back = 0
    let prev = ''
    for (const t of triples) {
      const v = { [o[0]]: t[0], [o[1]]: t[1], [o[2]]: t[2] }
      const s = stamp(v.y, v.m, v.d)
      if (!s) { bad++; continue }
      if (s < prev) back++
      prev = s
    }
    const yFirst = o[0] === 'y'
    if (yFirst !== triples.some((t) => String(t[0]).length === 4)) bad += triples.length
    const score = bad * 1000 + back
    if (!best || score < best.score) best = { o, score }
  }
  return best ? best.o : orders[1]
}

export function parseWhatsApp(text) {
  const raw = []
  for (const line of clean(text).split('\n')) {
    const m = line.match(WA_IOS) || line.match(WA_ANDROID)
    if (m) {
      raw.push({ parts: [m[1], m[2], m[3]], h: to24(m[4], m[6]), mi: m[5], rest: m[7] })
      continue
    }
    if (raw.length && line.trim()) raw[raw.length - 1].rest += `\n${line}`
  }
  const order = resolveOrder(raw.map((r) => r.parts))
  const out = []
  for (const r of raw) {
    const v = { [order[0]]: r.parts[0], [order[1]]: r.parts[1], [order[2]]: r.parts[2] }
    const at = stamp(v.y, v.m, v.d, r.h, r.mi)
    const sep = r.rest.indexOf(': ')
    if (!at || sep <= 0 || sep > 60) continue // system notices have no "Name: "
    const author = r.rest.slice(0, sep)
    if (SYSTEM.test(r.rest) && !r.rest.slice(sep + 2).trim()) continue
    push(out, at, author, r.rest.slice(sep + 2))
  }
  return out
}

// ── iMessage (Mac export, imessage-exporter TXT) ─────────────
// "Mar 14, 2024  9:12:03 PM (Read by them after 1 minute)"
// "Sam"   (or "Me")
// "hi"
// (blank line)

const IM_TIME = /^([A-Za-z]{3,9})\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])/

export function parseIMessage(text) {
  const out = []
  const lines = clean(text).split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(IM_TIME)
    if (!m || !monthOf(m[1]) || i + 1 >= lines.length) continue
    const author = lines[i + 1].trim()
    if (!author || IM_TIME.test(author)) continue
    const body = []
    let j = i + 2
    while (j < lines.length && lines[j].trim() !== '' && !IM_TIME.test(lines[j])) body.push(lines[j++])
    i = j - 1
    const at = stamp(m[3], monthOf(m[1]), m[2], to24(m[4], m[6]), m[5])
    const txt = body.join('\n')
    if (!at || !txt.trim()) continue
    // tapbacks ("Loved “…”") are reactions, not messages
    if (/^(Loved|Liked|Disliked|Laughed at|Emphasized|Questioned|Removed a .+ from) [“"]/.test(txt)) continue
    push(out, at, author, txt)
  }
  return out
}

// ── pasted lines ─────────────────────────────────────────────
// "Sam: hi" one per line; an optional time in front ("[9:12 PM] Sam: hi", "21:12 Sam: hi") is dropped.

export function parsePaste(text) {
  const out = []
  for (const line of clean(text).split('\n')) {
    if (!line.trim()) continue
    const body = line.replace(/^\s*\[?[^\]\n]{0,24}?\d{1,2}:\d{2}[^\]\n]{0,6}\]?\s*[-,]?\s*/, '')
    const m = body.match(/^([^:：]{1,30})\s?[:：]\s(.*)$/)
    if (m && !/^https?$/i.test(m[1])) { push(out, null, m[1], m[2]); continue }
    cont(out, line)
  }
  return out
}

// ── detect + parse ───────────────────────────────────────────

const PARSERS = {
  kakao: parseKakao,
  'kakao-pc': parseKakaoPC,
  'kakao-csv': parseKakaoCSV,
  whatsapp: parseWhatsApp,
  imessage: parseIMessage,
  paste: parsePaste,
}

/** The export format, from the first few hundred lines. */
export function detect(raw) {
  const text = clean(raw)
  const head = text.split('\n').filter((l) => l.trim()).slice(0, 300)
  if (/^\s*"?date"?\s*,\s*"?user"?\s*,\s*"?message"?/i.test(head[0] || '')) return 'kakao-csv'
  const score = {
    'kakao-pc': head.filter((l) => PC_MSG.test(l) || PC_SEP.test(l.trim())).length,
    kakao: head.filter((l) => { const lead = kakaoLead(l); return lead && lead.at && l.slice(lead.len).includes(' : ') }).length,
    whatsapp: head.filter((l) => WA_IOS.test(l) || WA_ANDROID.test(l)).length,
    imessage: head.filter((l) => IM_TIME.test(l)).length * 3,
  }
  const [best, n] = Object.entries(score).sort((a, b) => b[1] - a[1])[0]
  return n >= 2 ? best : 'paste'
}

/**
 * Parse an export. `hint` is the source the sender picked, or 'auto'.
 * If the picked source reads nothing, the detected one is tried, so a wrong pick still works.
 */
export function parseChat(raw, hint = 'auto') {
  const text = clean(raw)
  const detected = detect(text)
  let source = PARSERS[hint] ? hint : detected
  let messages = PARSERS[source](text)
  if (messages.length < 2 && source !== detected) {
    source = detected
    messages = PARSERS[source](text)
  }
  const counts = new Map()
  for (const m of messages) counts.set(m.author, (counts.get(m.author) || 0) + 1)
  const authors = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  const timed = messages.filter((m) => m.at)
  return {
    source,
    messages,
    authors,
    from: timed.length ? timed[0].at.slice(0, 10) : null,
    to: timed.length ? timed[timed.length - 1].at.slice(0, 10) : null,
  }
}

// ── who is who ───────────────────────────────────────────────

const norm = (s) => String(s || '').toLowerCase().replace(/[\s._\-()]/g, '')
const SELF = new Set(['me', '나', '본인', 'myself'])

/**
 * A first guess at roles from the names the sender already gave: 'me', 'them' or 'other'.
 * The sender confirms or changes it; several names can share a role (a renamed contact).
 */
export function suggestRoles(authors, { fromName = '', toName = '' } = {}) {
  const roles = {}
  const f = norm(fromName)
  const t = norm(toName)
  const like = (a, b) => a && b && (a === b || a.includes(b) || b.includes(a))
  for (const { name } of authors) {
    const n = norm(name)
    roles[name] = SELF.has(n) || like(n, f) ? 'me' : like(n, t) ? 'them' : 'other'
  }
  // one-to-one chat with only one side recognized: the other side is the other person
  const names = authors.map((a) => a.name)
  if (names.length === 2) {
    const [a, b] = names
    if (roles[a] === 'me' && roles[b] === 'other') roles[b] = 'them'
    else if (roles[b] === 'me' && roles[a] === 'other') roles[a] = 'them'
    else if (roles[a] === 'them' && roles[b] === 'other') roles[b] = 'me'
    else if (roles[b] === 'them' && roles[a] === 'other') roles[a] = 'me'
  }
  return roles
}

/** Messages with a role, inside an optional date range. System lines are dropped. */
export function withRoles(messages, roles, range = {}) {
  return messages
    .filter((m) => m.kind !== 'system')
    .filter((m) => !m.at || ((!range.from || m.at.slice(0, 10) >= range.from) && (!range.to || m.at.slice(0, 10) <= range.to)))
    .map((m) => ({ ...m, role: roles[m.author] || 'other' }))
}
