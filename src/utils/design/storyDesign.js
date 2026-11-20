/**
 * storyDesign.js — turns what we know about two people (their "story", from the chat and the
 * planning conversation) into a design spec for their letter box.
 *
 * Every visual choice is traced back to a piece of their story, so two boxes look different
 * because the people are different, not because of randomness. A seed from the story (plus a
 * "variant" number for "dress it again") only moves small things: tilt, order, which shade.
 * Pure functions: no DOM, no React. The page draws the spec with our own components.
 *
 * story = {
 *   from, to, relationship: 'partner'|'parent'|'child'|'friend'|'sibling',
 *   mood: 'scrapbook'|'night'|'flowers'|'quiet',
 *   nicknames: [''], catchphrases: [{ who, text }],
 *   memories: [{ id, title, date, place, things: [''], transport, sticker }],
 *   partings: [{ date, place, what, back }],
 *   stats: { spanDays, daysTalked, total, calls, callMinutes, lateNight, byMonth: [{ month, count }] },
 *   letters: [{ id, title, memory }]
 * }
 */

// ── tiny seeded random ───────────────────────────────────────

export function hash(s) {
  let h = 2166136261
  for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) }
  return h >>> 0
}

function rng(seed) {
  let a = seed || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── color ────────────────────────────────────────────────────

/** Things people mention, and the color each one brings. Korean and English words. */
export const COLOR_WORDS = [
  [/귤|tangerine|mandarin|clementine|orange/i, '#EE8A2A', 'tangerine'],
  [/바다|sea|ocean|beach|해변|파도|wave/i, '#2F6F97', 'sea'],
  [/한강|강가|river/i, '#3E7FA8', 'river'],
  [/벚꽃|cherry blossom|sakura|봄/i, '#EBA7BA', 'blossom'],
  [/첫눈|눈 오|눈이 |snow|겨울|winter/i, '#9FB6CF', 'snow'],
  [/커피|coffee|카페|cafe|latte/i, '#7A5236', 'coffee'],
  [/노을|sunset|석양/i, '#E2694A', 'sunset'],
  [/밤하늘|밤바다|새벽|night|별빛|별자리|stars?\b|moon|보름달/i, '#2A3566', 'night'],
  [/숲|forest|등산|mountain|hike/i, '#3F6E4E', 'forest'],
  [/라면|ramen|ramyeon|국수|noodle/i, '#D69A3A', 'ramen'],
  [/김치|찌개|stew|떡볶이|tteokbokki|spicy|매운/i, '#C0432F', 'stew'],
  [/(^|\s)비( |가|가 |$)|빗소리|rain|우산|umbrella/i, '#6F8399', 'rain'],
  [/레몬|lemon/i, '#E2C243', 'lemon'],
  [/딸기|strawberry/i, '#D9475B', 'strawberry'],
  [/녹차|matcha|green tea|\btea\b/i, '#7E9A55', 'tea'],
  [/노래방|karaoke|neon|club|festival|페스티벌/i, '#8A4FD1', 'neon'],
  [/버스|bus/i, '#3C8C5A', 'bus'],
  [/기차|train|ktx/i, '#2E5A8C', 'train'],
  [/비행기|plane|flight|공항|airport/i, '#4C7FB8', 'sky'],
  [/집|home|부엌|kitchen|밥|rice/i, '#B9824A', 'home'],
]

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`
export const mix = (a, b, t) => rgbToHex(hexToRgb(a).map((v, i) => v + (hexToRgb(b)[i] - v) * t))

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
/** Darken (or lighten) `fg` until it reads on `bg` at the given ratio. */
function readable(fg, bg, ratio) {
  let c = fg
  const target = luminance(bg) > 0.4 ? '#000000' : '#FFFFFF'
  for (let i = 0; i < 20 && contrast(c, bg) < ratio; i++) c = mix(c, target, 0.15)
  return c
}

/** Things in the story that carry a color, counted by how many memories mention them (not how often one memory repeats it). */
function colorAnchors(story) {
  const texts = [
    ...(story.memories || []).map((m) => [m.title, m.place, ...(m.things || []), m.transport].filter(Boolean).join(' · ')),
    ...(story.catchphrases || []).map((c) => c.text),
    ...(story.partings || []).map((p) => `${p.place} ${p.what}`),
    ...(story.colorWords || []), // things they said are theirs: a tint, never shown as words
  ].filter(Boolean)
  const counts = new Map()
  for (const t of texts) {
    for (const [re, hex, name] of COLOR_WORDS) {
      if (re.test(t)) {
        const e = counts.get(name) || { hex, name, n: 0, from: t }
        e.n++
        counts.set(name, e)
      }
    }
  }
  return [...counts.values()].sort((a, b) => b.n - a.n)
}

// ── what each relationship and mood starts from ──────────────

const BASE = {
  night: { bg: '#0B1430', paper: '#FBF6EA', ink: '#1B2536', dark: true },
  scrapbook: { bg: '#C8A27C', paper: '#FBF6EA', ink: '#2B2420', dark: false },
  flowers: { bg: '#E9DFD3', paper: '#FFFDF8', ink: '#3A2E2A', dark: false },
  quiet: { bg: '#E4E1DA', paper: '#FFFFFF', ink: '#1E1E1E', dark: false },
}

/** Type pairings: a title face, a body face and a hand. English faces first; a Korean face follows in each stack
 * and is only fetched when a letter has Korean in it (Google Fonts serves it by unicode range). */
export const TYPE = {
  tender: { title: "'Fraunces', 'Gowun Batang', 'Literata', serif", body: "'Literata', 'Gowun Batang', serif", hand: "'Caveat', 'Nanum Pen Script', cursive", label: 'Fraunces + Caveat' },
  warm: { title: "'Lora', 'Hahmlet', 'Literata', serif", body: "'Source Sans 3', 'Gowun Dodum', system-ui, sans-serif", hand: "'Kalam', 'Nanum Pen Script', cursive", label: 'Lora + Kalam' },
  playful: { title: "'Nunito', 'Gowun Dodum', system-ui, sans-serif", body: "'Nunito', 'Gowun Dodum', system-ui, sans-serif", hand: "'Patrick Hand', 'Gaegu', cursive", label: 'Nunito + Patrick Hand' },
  plain: { title: "'IBM Plex Sans', 'IBM Plex Sans KR', 'Schibsted Grotesk', sans-serif", body: "'IBM Plex Sans', 'IBM Plex Sans KR', system-ui, sans-serif", hand: "'Caveat', 'Nanum Pen Script', cursive", label: 'IBM Plex Sans + Caveat' },
}
const ART_NAMES = { flat: 'flat', color: 'soft color', noto: 'rounded', twemoji: 'bright' }
const TYPE_FOR = { partner: 'tender', parent: 'warm', child: 'warm', sibling: 'playful', friend: 'playful' }

// ── the spec ─────────────────────────────────────────────────

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function designFromStory(story, variant = 0) {
  const trace = []
  const why = (info, design) => trace.push({ info, design })
  const seed = hash(`${story.from}|${story.to}|${story.stats?.byMonth?.[0]?.month || ''}|${variant}`)
  const r = rng(seed)
  const mood = BASE[story.mood] ? story.mood : 'night'
  const base = BASE[mood]
  why(`The feel you chose: ${mood}`, `${mood} paper and ground`)

  // color: the two things they mention most
  const anchors = colorAnchors(story)
  const pick = variant % 2 && anchors.length > 2 ? [anchors[0], anchors[2]] : anchors.slice(0, 2)
  const accent = pick[0]?.hex || '#F0B341'
  const accent2 = pick[1]?.hex || mix(accent, base.dark ? '#FFFFFF' : '#000000', 0.35)
  if (pick[0]) why(`What comes up most: "${pick[0].from}"${pick[0].n > 1 ? ` (${pick[0].n} times)` : ''}`, `its main color, ${pick[0].name}`)
  if (pick[1]) why(`Next: "${pick[1].from}"`, `its second color, ${pick[1].name}`)
  const paper = mix(base.paper, accent, 0.06)
  const bg = base.dark ? mix(base.bg, accent2, 0.18) : mix(base.bg, accent, 0.22)
  const ink = readable(mix(base.ink, accent2, 0.15), paper, 9)
  const palette = { bg, paper, ink, accent: readable(accent, paper, 3), accent2: readable(accent2, paper, 3), line: mix(paper, ink, 0.16), soft: mix(paper, accent, 0.18), accentRaw: accent, accent2Raw: accent2 }

  // type: who they are to each other
  const typeKey = mood === 'quiet' ? 'plain' : TYPE_FOR[story.relationship] || 'warm'
  why(`Who they are to you (${story.relationship})`, `the typeface, ${TYPE[typeKey].label}`)
  // sticker drawings: two styles suit each pairing; "dress it again" swaps between them
  const ART_FOR = { tender: ['color', 'flat'], warm: ['noto', 'color'], playful: ['twemoji', 'flat'], plain: ['flat', 'noto'] }
  const art = ART_FOR[typeKey][(variant + (seed % 2)) % 2]
  why(`Who they are to you, and the feel`, `stickers drawn in the ${ART_NAMES[art]} style`)

  // paper: how long they've known each other, how they talk, how many goodbyes
  const st = story.stats || {}
  const years = (st.spanDays || 0) / 365
  const grain = clamp(0.08 + years * 0.12, 0.08, 0.6)
  why(years >= 0.1 ? `${years.toFixed(1)} years of messages` : 'A new chat, or none yet', years >= 1 ? 'older, grainier paper' : 'fresh paper')
  const perDay = st.daysTalked ? st.total / st.daysTalked : 0
  const lines = mood === 'quiet' ? 'none' : perDay > 25 ? 'ruled-tight' : perDay > 8 ? 'ruled' : 'dots'
  why(perDay ? `About ${perDay.toFixed(0)} messages on the days you talk` : 'How much you write', lines === 'none' ? 'plain paper' : lines === 'dots' ? 'dotted paper' : 'ruled lines')
  const goodbyes = (story.partings || []).length
  const edge = goodbyes >= 2 ? 'torn' : goodbyes === 1 ? 'deckle' : 'straight'
  why(goodbyes ? `${goodbyes} goodbye${goodbyes > 1 ? 's' : ''} before this one` : 'No goodbyes before this one', edge === 'torn' ? 'a torn edge' : edge === 'deckle' ? 'a soft deckled edge' : 'a clean edge')
  const stainWord = anchors.find((a) => ['coffee', 'tea', 'rain'].includes(a.name))
  const stain = stainWord ? stainWord.name : null
  if (stain) why(`"${stainWord.from}"`, stain === 'rain' ? 'a few raindrops on the paper' : `a ${stain} ring on the paper`)

  // the conversation as a pattern: their months, drawn
  const months = st.byMonth || []
  const pattern = { kind: years >= 2 ? 'rings' : 'ribbon', months, calls: st.callMinutes || 0, late: st.lateNight || 0 }
  if (months.length) why(`${months.length} months of messages`, pattern.kind === 'rings' ? 'tree rings at the top (one ring a year)' : 'a ribbon at the top (one bar a month)')
  if (st.callMinutes) why(`${Math.round(st.callMinutes / 60)} hours on the phone`, 'small dots around the pattern')

  // stamps: one per memory, with its own thing in it
  const stamps = (story.memories || []).slice(0, 5).map((m, i) => ({
    memory: m.id,
    sticker: m.sticker,
    text: m.place || m.title,
    date: m.date || '',
    color: [palette.accent, palette.accent2, mix(palette.accent, palette.accent2, 0.5)][i % 3],
    tilt: Math.round((r() - 0.5) * 14),
  }))
  if (stamps.length) why(`${stamps.length} moment${stamps.length > 1 ? 's' : ''} on your letters`, 'a stamp for each, shown once its letter opens')
  if (stamps.length) why('The stickers of those moments', 'set beside the path of letters')
  why(mood === 'night' ? 'The second color' : 'The main color', 'the tint of the whole box')
  why('The main color', 'the button for today’s letter')

  // seal: what they call each other
  const nick = (story.nicknames || [])[0] || story.to
  const seal = { text: nick, initials: [...String(story.from)][0] + [...String(story.to)][0], color: palette.accent }
  why(`What you call each other, "${nick}"`, 'the words around the seal')

  // each letter gets the piece of the story it belongs to
  const memoById = Object.fromEntries((story.memories || []).map((m) => [m.id, m]))
  const letters = (story.letters || []).map((l) => {
    const m = memoById[l.memory]
    const phrase = (story.catchphrases || []).find((c) => c.letter === l.id)
    let deco
    if (phrase) deco = { kind: 'quote', text: phrase.text, who: phrase.who }
    else if (m?.transport) deco = { kind: 'ticket', transport: m.transport, title: m.title, date: m.date }
    else if (m?.place && m?.date) deco = { kind: 'postmark', place: m.place, date: m.date }
    else if (m) deco = { kind: 'stamp', sticker: m.sticker, text: m.title }
    else deco = { kind: 'seal' }
    why(`The letter "${l.title}", from ${phrase ? `"${phrase.text}"` : m ? `"${m.title}"` : 'no part of the story'}`, `its decoration: ${deco.kind}`)
    return { ...l, memoryData: m || null, deco, sticker: m?.sticker || null, tilt: Math.round((r() - 0.5) * 4 * 10) / 10 }
  })

  // the road of goodbyes: past ones, then this one
  const route = [...(story.partings || []), story.now ? { ...story.now, current: true } : null].filter(Boolean)
  if (route.length > 1) why(`${route.length} goodbyes with their dates and places`, 'a map of your goodbyes')

  return { seed, variant, mood, palette, type: TYPE[typeKey], typeKey, art, paper: { grain, lines, edge, stain }, pattern, stamps, seal, letters, route, trace }
}

// ── the recipient app ────────────────────────────────────────

/**
 * CSS variables that dress the recipient app (letterapp.css) in this story's colors.
 * The ground stays dark so the app's light text keeps reading; it takes on their color.
 */
export function appTheme(spec) {
  const p = spec.palette
  const tone = spec.mood === 'night' ? p.accent2Raw : p.accentRaw
  const deep = mix('#06080F', tone, 0.2)
  // the button colour must carry its label at 4.5:1: pick the label that reads better, lighten the colour if neither does
  const dark = mix(deep, '#000000', 0.3)
  let lamp = p.accentRaw
  for (let i = 0; i < 12 && Math.max(contrast(dark, lamp), contrast('#FFFFFF', lamp)) < 4.5; i++) lamp = mix(lamp, '#FFFFFF', 0.08)
  const onLight = contrast(dark, lamp) >= contrast('#FFFFFF', lamp) ? dark : '#FFFFFF'
  return {
    '--night': deep,
    '--night-mid': mix(deep, '#FFFFFF', 0.05),
    '--night-surface': mix(deep, '#FFFFFF', 0.08),
    '--night-high': mix(deep, '#FFFFFF', 0.13),
    '--night-higher': mix(deep, '#FFFFFF', 0.19),
    '--night-lip': mix(deep, '#000000', 0.45),
    '--last-face': mix(deep, '#FFFFFF', 0.24),
    '--moonlit': mix('#F4F1E6', lamp, 0.05),
    '--lamp': lamp,
    '--lamp-lip': mix(lamp, '#000000', 0.32),
    '--on-light': onLight,
    '--paper': p.paper,
    '--paper-lip': mix(p.paper, p.ink, 0.2),
    '--paper-shade': mix(p.paper, p.ink, 0.07),
    '--paper-line': p.line,
    '--ink': p.ink,
    '--ink-soft': mix(p.ink, p.paper, 0.25),
    '--note': mix('#FFF6C9', lamp, 0.12),
    '--note-shade': mix(mix('#FFF6C9', lamp, 0.12), '#000000', 0.1),
    '--note-read': mix(mix('#FFF6C9', lamp, 0.12), '#000000', 0.04),
    '--serif': spec.type.title,
  }
}

/**
 * How a letter is set, by its length. A few lines read like a postcard in their hand;
 * a long letter switches to a calm reading face so page after page stays easy on a phone.
 */
export function letterLayout(text) {
  const paras = String(text || '').replace(/\r/g, '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
  const all = paras.join(' ')
  const chars = all.length
  // a Hangul syllable carries about as much as two Latin letters, so it weighs more on the page
  const weight = chars + 0.8 * (all.match(/[가-힣]/g) || []).length
  if (weight <= 220) return { kind: 'postcard', face: 'hand', size: 26, lineHeight: 1.35, paras, chars }
  if (weight <= 700) return { kind: 'letter', face: 'hand', size: 23, lineHeight: 1.5, paras, chars }
  return { kind: 'long', face: 'body', size: 17, lineHeight: 1.85, paras, chars, stampAfter: Math.min(2, paras.length - 1) }
}
