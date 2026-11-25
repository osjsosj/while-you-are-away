/* Checks the chat parsers, stats and excerpts against the synthetic exports in scripts/fixtures/chat.
 * Run: node scripts/test-chat.mjs */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { parseChat, suggestRoles, withRoles, detect } from '../src/utils/chat/parse.js'
import { chatStats } from '../src/utils/chat/stats.js'
import { pickExcerpts } from '../src/utils/chat/sample.js'

const dir = fileURLToPath(new URL('./fixtures/chat/', import.meta.url))
const read = (f) => readFileSync(dir + f, 'utf8')

let failed = 0
function test(name, fn) {
  try {
    fn()
    console.log(`ok   ${name}`)
  } catch (err) {
    failed++
    console.log(`FAIL ${name}\n     ${err.message.split('\n').join('\n     ')}`)
  }
}

const brief = (r) => r.messages.map((m) => [m.at, m.author, m.kind, m.text])

test('KakaoTalk Android (Korean)', () => {
  const r = parseChat(read('kakao-android-ko.txt'))
  assert.equal(r.source, 'kakao')
  assert.deepEqual(brief(r), [
    ['2024-03-14T21:12', '하은', 'text', '오늘 버스에서 귤 나눠먹은 거 너무 좋았어'],
    ['2024-03-14T21:13', '민준', 'text', '나도ㅋㅋ 7번 버스 또 타자'],
    ['2024-03-14T21:14', '민준', 'photo', '사진'],
    ['2024-03-15T01:40', '하은', 'text', '잘자 민준\n내일 봐'],
    ['2024-03-15T08:02', '민준', 'text', '보고싶다'],
    ['2024-03-15T08:03', '하은', 'deleted', '삭제된 메시지입니다.'],
    ['2024-03-15T12:30', '하은', 'text', '고마워 귤 사다줘서 🍊🍊'],
  ])
})

test('KakaoTalk iOS (Korean), join notices skipped', () => {
  const r = parseChat(read('kakao-ios-ko.txt'))
  assert.equal(r.source, 'kakao')
  assert.deepEqual(brief(r), [
    ['2024-03-14T21:12', '하은', 'text', '오늘 버스에서 귤 나눠먹은 거 너무 좋았어'],
    ['2024-03-14T21:13', '민준', 'text', '나도ㅋㅋ 7번 버스 또 타자'],
    ['2024-03-15T01:40', '하은', 'text', '잘자 민준'],
    ['2024-03-15T21:05', '민준', 'sticker', '이모티콘'],
  ])
})

test('KakaoTalk PC TXT (Korean)', () => {
  const r = parseChat(read('kakao-pc-ko.txt'))
  assert.equal(r.source, 'kakao-pc')
  assert.deepEqual(brief(r), [
    ['2024-03-14T21:12', '하은', 'text', '오늘 버스에서 귤 나눠먹은 거 너무 좋았어'],
    ['2024-03-14T21:13', '민준', 'text', '나도ㅋㅋ 7번 버스 또 타자\n그리고 귤 또 사자'],
    ['2024-03-15T01:40', '하은', 'text', '잘자 민준'],
    ['2024-03-15T12:00', '민준', 'photo', '사진 2장'],
  ])
})

test('KakaoTalk PC TXT with call records (shape of a real export)', () => {
  const r = parseChat(read('kakao-pc-calls.txt'))
  assert.equal(r.source, 'kakao-pc')
  assert.deepEqual(r.messages.map((m) => [m.at, m.author, m.kind]), [
    ['2023-06-04T23:50', '엄마', 'text'],
    ['2023-06-04T23:51', '엄마', 'text'],
    ['2023-06-05T01:57', '김지수', 'text'],
    ['2023-06-05T01:58', '김지수', 'call'],
    ['2023-06-05T01:58', '김지수', 'call'],
    ['2023-06-05T07:00', '엄마', 'text'],
    ['2023-06-05T07:01', '엄마', 'call'],
    ['2023-06-05T07:30', '김지수', 'call'],
    ['2023-06-05T07:40', '엄마', 'call'],
    ['2023-06-05T07:41', '엄마', 'text'],
  ])
  assert.equal(r.messages[5].text, '지수야? 전화했네\n밥은 먹었니')
  assert.deepEqual(suggestRoles(r.authors, { fromName: '지수', toName: '엄마' }), { 엄마: 'them', 김지수: 'me' })
  const s = chatStats(withRoles(r.messages, suggestRoles(r.authors, { fromName: '지수', toName: '엄마' })))
  assert.equal(s.total, 5) // call records are not messages
  assert.equal(s.calls, 2) // only the ones that connected
  assert.equal(s.callMinutes, 62) // 1:02:03 + 0:13
  assert.equal(s.daysTalked, 2)
  assert.equal(s.phrases.thanks, 1)
  const x = pickExcerpts(withRoles(r.messages, { 엄마: 'them', 김지수: 'me' }), { names: { me: '지수', them: '엄마' } })
  assert.ok(x.text.includes('[call: 페이스톡 1:02:03]'))
  assert.ok(!x.text.includes('취소') && !x.text.includes('부재중'), 'missed and cancelled calls left out')
})

test('KakaoTalk PC TXT (English)', () => {
  const r = parseChat(read('kakao-pc-en.txt'))
  assert.equal(r.source, 'kakao-pc')
  assert.deepEqual(r.messages.map((m) => [m.at, m.author]), [
    ['2024-03-14T21:12', 'Haeun'],
    ['2024-03-14T21:13', 'Minjun'],
    ['2024-03-15T01:40', 'Haeun'],
  ])
})

test('KakaoTalk PC CSV with quotes, commas and line breaks', () => {
  const r = parseChat(read('kakao-pc.csv'))
  assert.equal(r.source, 'kakao-csv')
  assert.deepEqual(brief(r), [
    ['2024-03-14T21:12', '하은', 'text', '오늘 버스에서 귤 나눠먹은 거 너무 좋았어'],
    ['2024-03-14T21:13', '민준', 'text', '나도ㅋㅋ, 7번 버스 또 타자'],
    ['2024-03-15T01:40', '하은', 'text', '잘자 민준\n내일 봐'],
    ['2024-03-15T08:02', '민준', 'text', '"보고싶다" 라고 말하고 싶었어'],
  ])
})

test('WhatsApp iOS, US dates, narrow spaces and media', () => {
  const r = parseChat(read('whatsapp-ios-us.txt'))
  assert.equal(r.source, 'whatsapp')
  assert.deepEqual(brief(r), [
    ['2024-03-14T21:12', 'Alex', 'text', 'loved sharing the tangerine on the bus'],
    ['2024-03-14T21:13', 'Sam', 'text', 'same lol\nbus 7 again soon'],
    ['2024-03-15T01:40', 'Alex', 'text', 'good night 🌙'],
    ['2024-03-15T08:02', 'Sam', 'photo', 'image omitted'],
    ['2024-03-16T08:05', 'Sam', 'text', 'miss you already'],
  ])
})

test('WhatsApp Android, day-first dates, encryption notice skipped', () => {
  const r = parseChat(read('whatsapp-android-eu.txt'))
  assert.equal(r.source, 'whatsapp')
  assert.deepEqual(r.messages.map((m) => [m.at, m.author, m.kind]), [
    ['2024-03-14T21:12', 'Alex', 'text'],
    ['2024-03-14T21:13', 'Sam', 'text'],
    ['2024-03-15T01:40', 'Alex', 'text'],
    ['2024-03-15T08:02', 'Sam', 'media'],
    ['2024-03-20T08:05', 'Sam', 'text'],
  ])
})

test('iMessage Mac export, tapbacks skipped', () => {
  const r = parseChat(read('imessage-mac.txt'))
  assert.equal(r.source, 'imessage')
  assert.deepEqual(brief(r), [
    ['2024-03-14T21:12', 'Me', 'text', 'loved sharing the tangerine on the bus'],
    ['2024-03-14T21:13', 'Sam', 'text', 'same lol\nbus 7 again soon'],
    ['2024-03-15T01:40', 'Me', 'text', 'good night'],
  ])
})

test('Pasted lines', () => {
  const r = parseChat(read('paste.txt'))
  assert.equal(r.source, 'paste')
  assert.deepEqual(brief(r), [
    [null, 'Alex', 'text', 'loved sharing the tangerine on the bus'],
    [null, 'Sam', 'text', 'same lol\nbus 7 again soon'],
    [null, 'Alex', 'text', 'good night'],
  ])
})

test('A wrong source pick still reads the file', () => {
  const r = parseChat(read('kakao-pc-ko.txt'), 'whatsapp')
  assert.equal(r.source, 'kakao-pc')
  assert.equal(r.messages.length, 4)
})

test('detect() on every fixture', () => {
  assert.equal(detect(read('kakao-android-ko.txt')), 'kakao')
  assert.equal(detect(read('kakao-pc.csv')), 'kakao-csv')
  assert.equal(detect(read('imessage-mac.txt')), 'imessage')
})

test('Roles from the names already given', () => {
  const r = parseChat(read('kakao-android-ko.txt'))
  assert.deepEqual(suggestRoles(r.authors, { fromName: '하은', toName: '민준' }), { 하은: 'me', 민준: 'them' })
  const im = parseChat(read('imessage-mac.txt'))
  assert.deepEqual(suggestRoles(im.authors, { fromName: 'Alex', toName: '' }), { Me: 'me', Sam: 'them' })
  // only one side recognized in a one-to-one chat
  assert.deepEqual(suggestRoles([{ name: 'Haeun Kim' }, { name: '❤️' }], { fromName: 'haeun', toName: 'Minjun' }), { 'Haeun Kim': 'me', '❤️': 'them' })
})

test('Stats: shared facts only', () => {
  const r = parseChat(read('kakao-android-ko.txt'))
  const s = chatStats(withRoles(r.messages, { 하은: 'me', 민준: 'them' }))
  assert.equal(s.total, 6) // deleted message left out
  assert.equal(s.photos, 1)
  assert.equal(s.from, '2024-03-14')
  assert.equal(s.spanDays, 2)
  assert.equal(s.daysTalked, 2)
  assert.equal(s.first.text, '오늘 버스에서 귤 나눠먹은 거 너무 좋았어')
  assert.equal(s.lateNight.at, '2024-03-15T01:40')
  assert.deepEqual(s.busiest, { date: '2024-03-14', count: 3 }) // a tie goes to the earlier day
  assert.equal(s.phrases.goodnight, 1)
  assert.equal(s.phrases.missYou, 1)
  assert.equal(s.phrases.thanks, 1)
  assert.equal(s.phrases.laugh, 1)
  assert.deepEqual(s.topEmoji, [{ emoji: '🍊', count: 2 }])
  assert.ok(!('byRole' in s) && !('perPerson' in s), 'no per-person comparisons')
})

test('Excerpts stay within budget and use confirmed names', () => {
  const lines = []
  for (let i = 0; i < 5000; i++) {
    const d = new Date(Date.UTC(2023, 0, 1) + i * 3 * 3600000)
    const at = d.toISOString().slice(0, 16).replace('T', ' ')
    lines.push(`[${at.slice(5, 7)}/${at.slice(8, 10)}/${at.slice(0, 4)}, ${at.slice(11)}] ${i % 2 ? 'S' : 'A'}: ${i % 97 ? 'ordinary message number ' + i : 'I miss you so much'}`)
  }
  const r = parseChat(lines.join('\n'))
  assert.equal(r.source, 'whatsapp')
  assert.equal(r.messages.length, 5000)
  const msgs = withRoles(r.messages, { A: 'me', S: 'them' })
  const x = pickExcerpts(msgs, { budget: 20000, names: { me: 'Alex', them: 'Sam' } })
  assert.ok(x.text.length <= 20000 + 2000, `length ${x.text.length}`)
  assert.ok(x.messages > 100 && x.messages < 5000)
  assert.ok(x.text.startsWith('2023-01-01 00:00 Alex: I miss you so much'))
  assert.ok(x.text.includes('…'))
  assert.ok(!/\b[AS]: /.test(x.text), 'raw author ids replaced by names')
})

// ── firsts, day starters, questions, hours, quickest hour (adopted from What Brandon Thinks, as facts) ──
{
  const { chatMoments } = await import('../src/utils/chat/stats.js')
  const msgs = []
  const add = (at, role, text, kind = 'text') => msgs.push({ at, role, text, kind, author: role })
  for (let d = 1; d <= 25; d++) {
    const day = `2024-03-${String(d).padStart(2, '0')}`
    add(`${day}T08:05`, d % 3 ? 'them' : 'me', 'good morning')
    add(`${day}T23:10`, 'me', d % 2 ? 'did you eat?' : 'Did you eat??')
    add(`${day}T23:10`, 'them', '그래')
    add(`${day}T23:11`, 'them', '아니')
    add(`${day}T23:11`, 'me', 'ok Em')
  }
  add('2024-03-04T00:30', 'me', 'still up', 'text')
  add('2024-03-02T21:00', 'them', 'voice call 12:03', 'call')
  add('2024-03-09T23:12', 'them', 'love you')
  msgs.sort((a, b) => a.at.localeCompare(b.at))
  const r = chatMoments(msgs, { nicknames: ['Em'] })
  test('the same question asked two ways counts once, word for word', () => {
    assert.equal(r.questions.me.count, 25)
    assert.match(r.questions.me.text, /^did you eat/i)
  })
  test('Korean words that only end like questions are not questions', () => {
    assert.equal(r.questions.them, null)
  })
  test('a 12:30 a.m. message belongs to the day before; the morning starter is counted per day', () => {
    assert.equal(r.starts.me + r.starts.them, 25)
    assert.equal(r.starts.them, 17)
  })
  test('firsts: the first "love you", the first nickname, the first call that connected', () => {
    assert.equal(r.firsts.loveYou.at, '2024-03-09T23:12')
    assert.equal(r.firsts.nickname.text, 'ok Em')
    assert.equal(r.firsts.call.at, '2024-03-02T21:00')
  })
  test('the quickest hour is for both together, never per person', () => {
    assert.equal(r.quick.hour, 23)
    assert.deepEqual(Object.keys(r.quick).sort(), ['hour', 'replies', 'seconds'])
  })
}

// ── Instagram / Messenger JSON and LINE ──
{
  const enc = (t) => Array.from(new TextEncoder().encode(t), (b) => String.fromCharCode(b)).join('')
  const meta = JSON.stringify({ participants: [{ name: 'Emma' }, { name: 'Sam' }], messages: [
    { sender_name: 'Sam', timestamp_ms: Date.UTC(2024, 2, 14, 12, 13), content: enc('보고 싶어 ❤️') },
    { sender_name: enc('엠마'), timestamp_ms: Date.UTC(2024, 2, 14, 12, 12), content: 'did you get home okay?' },
    { sender_name: 'Sam', timestamp_ms: Date.UTC(2024, 2, 14, 12, 20), photos: [{ uri: 'x.jpg' }] },
    { sender_name: 'Sam', timestamp_ms: Date.UTC(2024, 2, 14, 12, 30), call_duration: 723 },
  ] })
  test('Instagram and Messenger JSON: oldest first, Meta’s escaped UTF-8 decoded, photos and calls known', () => {
    const r = parseChat(meta)
    assert.equal(r.source, 'meta')
    assert.deepEqual(r.messages.map((m) => m.author), ['엠마', 'Sam', 'Sam', 'Sam'])
    assert.equal(r.messages[1].text, '보고 싶어 ❤️')
    assert.equal(r.messages[2].kind, 'photo')
    assert.equal(r.messages[3].kind, 'call')
  })
  test('LINE: day lines, tab-separated messages, 12-hour times, continued lines', () => {
    const line = '[LINE] Chat history with Emma\nSaved on: 2024/06/01 21:00\n\n2024/03/14(Thu)\n21:12\tEmma\tdid you get home okay?\n21:13\tSam\tjust now\nsecond line\n2024/03/15(Fri)\n오후 9:12\tEmma\t잘 자\n9:30 PM\tSam\tgood night\n'
    const r = parseChat(line)
    assert.equal(r.source, 'line')
    assert.deepEqual(r.messages.map((m) => m.at), ['2024-03-14T21:12', '2024-03-14T21:13', '2024-03-15T21:12', '2024-03-15T21:30'])
    assert.equal(r.messages[1].text, 'just now\nsecond line')
  })
}

console.log(failed ? `\n${failed} failed` : '\nall passed')
process.exit(failed ? 1 : 0)
