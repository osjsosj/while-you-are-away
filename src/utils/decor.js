/**
 * decor.js — how a letter box is dressed: a paper style, a few hand-drawn motifs, a postmark,
 * a ticket-shaped letter. The design step picks from this library; it never draws.
 * Shared by the browser and the server (no JSX, no DOM).
 */

export const STYLES = {
  night: { name: 'Night sky', desc: 'Cream paper under our porch light. Calm and warm.', accent: '#F0B341' },
  scrapbook: { name: 'Scrapbook', desc: 'Kraft paper, tape and photos everywhere.', accent: '#E8913A' },
  flowers: { name: 'Pressed flowers', desc: 'Soft and warm, a flower tucked in each letter.', accent: '#E8918A' },
  quiet: { name: 'Quiet paper', desc: 'White paper, just your words.', accent: '#9AA4B8' },
}
export const STYLE_IDS = Object.keys(STYLES)

/* ── hand-drawn motifs ──────────────────────────────────────────────────────
 * viewBox 0 0 64 64, inked outline (#3A2E26), flat fills, one highlight.
 * No ids inside (gradients etc.) so any number can sit on one page.
 */
const INK = 'stroke="#3A2E26" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"'
const HI = 'fill="none" stroke="#FFF7E6" stroke-width="2.2" stroke-linecap="round" opacity=".75"'

export const MOTIFS = {
  tangerine: {
    label: 'Tangerines', words: ['tangerine', 'mandarin', 'orange', 'clementine', 'citrus', '귤'],
    svg: `<circle cx="31" cy="37" r="19" fill="#F28A24" ${INK}/><path d="M19 30c3-6 9-9 15-8" ${HI}/><g fill="#C8601A" opacity=".5"><circle cx="25" cy="40" r="1"/><circle cx="36" cy="45" r="1"/><circle cx="40" cy="33" r="1"/><circle cx="30" cy="49" r="1"/></g><path d="M31 18c0-2 1-4 2-5" fill="none" ${INK}/><path d="M33 17c5-6 13-6 16-3-4 5-11 6-16 3z" fill="#6A9A43" ${INK}/>`,
  },
  strawberry: {
    label: 'Strawberries', words: ['strawberry', 'strawberries', 'berry', '딸기'],
    svg: `<path d="M32 56C20 48 13 38 15 29c2-7 9-9 17-9s15 2 17 9c2 9-5 19-17 27z" fill="#E04B4B" ${INK}/><path d="M21 31c1-4 4-6 8-6" ${HI}/><g fill="#F6D774"><circle cx="24" cy="36" r="1.3"/><circle cx="32" cy="33" r="1.3"/><circle cx="40" cy="36" r="1.3"/><circle cx="28" cy="43" r="1.3"/><circle cx="36" cy="43" r="1.3"/><circle cx="32" cy="50" r="1.3"/></g><path d="M20 22l6 3 6-6 6 6 6-3-3 6H23z" fill="#5E8C3A" ${INK}/>`,
  },
  cherry: {
    label: 'Cherries', words: ['cherry', 'cherries', '체리'],
    svg: `<path d="M22 42c4-14 10-24 22-32M42 44c-2-12 0-22 2-34" fill="none" ${INK}/><path d="M44 10c6-3 12-1 14 3-6 3-11 2-14-3z" fill="#5E8C3A" ${INK}/><circle cx="21" cy="46" r="10" fill="#C8323C" ${INK}/><circle cx="42" cy="48" r="10" fill="#C8323C" ${INK}/><path d="M16 42c1-2 3-3 5-3M37 44c1-2 3-3 5-3" ${HI}/>`,
  },
  lemon: {
    label: 'Lemons', words: ['lemon', 'lemonade', '레몬'],
    svg: `<path d="M10 34c0-11 10-19 22-19s22 8 22 19-10 18-22 18S10 45 10 34z" fill="#F2CF4A" ${INK}/><path d="M6 34l5-2v4zM58 34l-5-2v4z" fill="#F2CF4A" ${INK}/><path d="M19 28c3-5 8-7 13-7" ${HI}/>`,
  },
  coffee: {
    label: 'Coffee', words: ['coffee', 'latte', 'cafe', 'café', 'espresso', 'americano', '커피', '카페'],
    svg: `<path d="M8 50h44" fill="none" ${INK}/><ellipse cx="30" cy="50" rx="22" ry="4" fill="#E9DCC8" ${INK}/><path d="M14 26h32l-3 20c-1 3-4 5-7 5H24c-3 0-6-2-7-5z" fill="#F4ECDD" ${INK}/><path d="M46 30c6 0 8 3 7 7-1 4-5 6-9 5" fill="none" ${INK}/><ellipse cx="30" cy="27" rx="15" ry="3" fill="#7A4A2A" ${INK}/><path d="M24 20c-2-3 2-5 0-8M32 20c-2-3 2-5 0-8M40 20c-2-3 2-5 0-8" fill="none" stroke="#8A7A6A" stroke-width="1.6" stroke-linecap="round"/>`,
  },
  ramen: {
    label: 'Ramen', words: ['ramen', 'ramyeon', 'noodle', 'noodles', 'pho', 'udon', '라면', '국수'],
    svg: `<path d="M44 6L30 30M52 9L34 31" fill="none" stroke="#B98A55" stroke-width="2.6" stroke-linecap="round"/><path d="M8 32h48c0 13-10 22-24 22S8 45 8 32z" fill="#F4ECDD" ${INK}/><path d="M10 38h44" stroke="#D1453B" stroke-width="3"/><path d="M14 32c3-3 5 0 8-2s5 1 8-1 5 1 8-1 5 1 8-1 4 1 6 0" fill="none" stroke="#E5C27A" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="22" cy="29" rx="6" ry="4" fill="#fff" ${INK}/><circle cx="22" cy="29" r="2.4" fill="#F2B33D"/><path d="M24 54h16" fill="none" ${INK}/>`,
  },
  moon: {
    label: 'The moon', words: ['moon', 'night', 'nights', 'midnight', 'night walk', '달', '밤'],
    svg: `<path d="M40 10c-12 2-21 12-21 24s9 22 21 24C26 60 12 49 12 34S26 8 40 10z" fill="#F3E3B0" ${INK}/><circle cx="24" cy="30" r="2.4" fill="#E2CF92"/><circle cx="20" cy="42" r="1.6" fill="#E2CF92"/><path d="M50 14l1.5 3.5L55 19l-3.5 1.5L50 24l-1.5-3.5L45 19l3.5-1.5z" fill="#F0B341"/>`,
  },
  stars: {
    label: 'Stars', words: ['star', 'stars', 'stargazing', 'galaxy', 'constellation', 'sky', '별'],
    svg: `<path d="M24 10l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#F0B341" ${INK}/><path d="M46 30l2.5 5.5 6 .6-4.5 4 1.3 6-5.3-3-5.3 3 1.3-6-4.5-4 6-.6z" fill="#F6D27E" ${INK}/><path d="M18 46l1.6 3.4 3.7.4-2.8 2.5.8 3.7-3.3-1.9-3.3 1.9.8-3.7-2.8-2.5 3.7-.4z" fill="#F6D27E" ${INK}/>`,
  },
  daisy: {
    label: 'Flowers', words: ['flower', 'flowers', 'daisy', 'bouquet', 'rose', 'tulip', 'cherry blossom', 'blossom', '꽃', '벚꽃'],
    svg: `<path d="M32 40c-1 8-2 14-1 20" fill="none" stroke="#5E8C3A" stroke-width="2" stroke-linecap="round"/><path d="M31 52c-6-1-10-5-10-9 5 0 9 3 10 9z" fill="#7FAF5A" ${INK}/><g fill="#FFFDF6" ${INK}><ellipse cx="32" cy="14" rx="5" ry="9"/><ellipse cx="32" cy="14" rx="5" ry="9" transform="rotate(60 32 24)"/><ellipse cx="32" cy="14" rx="5" ry="9" transform="rotate(120 32 24)"/><ellipse cx="32" cy="14" rx="5" ry="9" transform="rotate(180 32 24)"/><ellipse cx="32" cy="14" rx="5" ry="9" transform="rotate(240 32 24)"/><ellipse cx="32" cy="14" rx="5" ry="9" transform="rotate(300 32 24)"/></g><circle cx="32" cy="24" r="5.5" fill="#F2C14E" ${INK}/>`,
  },
  music: {
    label: 'Our song', words: ['song', 'music', 'playlist', 'concert', 'record', 'vinyl', 'karaoke', 'guitar', 'piano', '노래', '음악'],
    svg: `<circle cx="28" cy="34" r="22" fill="#2B2B33" ${INK}/><circle cx="28" cy="34" r="15" fill="none" stroke="#4A4A55" stroke-width="1"/><circle cx="28" cy="34" r="8" fill="#E8913A" ${INK}/><circle cx="28" cy="34" r="1.6" fill="#2B2B33"/><path d="M16 24c3-4 7-6 12-6" fill="none" stroke="#6A6A78" stroke-width="2" stroke-linecap="round"/><path d="M50 8v22" fill="none" ${INK}/><path d="M50 8c4 2 8 2 10 6" fill="none" ${INK}/><ellipse cx="46.5" cy="31" rx="4.5" ry="3.4" fill="#3A2E26"/>`,
  },
  camera: {
    label: 'Photos', words: ['camera', 'photo', 'photos', 'picture', 'pictures', 'film camera', 'photobooth', 'photo booth', '사진'],
    svg: `<rect x="8" y="20" width="48" height="32" rx="5" fill="#3E4A66" ${INK}/><path d="M22 20l4-7h12l4 7" fill="#3E4A66" ${INK}/><circle cx="32" cy="36" r="11" fill="#E9ECF2" ${INK}/><circle cx="32" cy="36" r="6" fill="#2B3450"/><path d="M28 33c1-2 3-3 5-3" ${HI}/><rect x="45" y="25" width="6" height="4" rx="1" fill="#F0B341"/>`,
  },
  umbrella: {
    label: 'Umbrella', words: ['umbrella', 'rain', 'rainy', 'raining', 'storm', '우산', '비'],
    svg: `<path d="M6 32C8 18 19 9 32 9s24 9 26 23c-3-3-7-3-9 0-3-3-8-3-11 0-3-3-8-3-12 0-3-3-8-3-11 0-3-3-7-3-9 0z" fill="#6C8FC7" ${INK}/><path d="M32 9c-6 6-8 14-8 23M32 9c6 6 8 14 8 23" fill="none" stroke="#3A2E26" stroke-width="1.2"/><path d="M32 32v18c0 5-8 5-8 0" fill="none" ${INK}/><g stroke="#8FB0DD" stroke-width="1.6" stroke-linecap="round"><path d="M12 44l-2 5M52 42l-2 5M46 52l-2 5"/></g>`,
  },
  heart: {
    label: 'Hearts', words: ['love', 'heart', 'hearts', '사랑'],
    svg: `<path d="M32 54C16 43 8 34 9 24c1-7 7-12 13-11 5 0 8 3 10 7 2-4 5-7 10-7 6-1 12 4 13 11 1 10-7 19-23 30z" fill="#E07A7A" ${INK}/><path d="M16 22c1-3 3-5 6-5" ${HI}/>`,
  },
  cat: {
    label: 'A cat', words: ['cat', 'cats', 'kitten', 'kitty', '고양이'],
    svg: `<path d="M14 26L12 8l12 9c5-2 11-2 16 0l12-9-2 18c3 4 4 9 3 14-2 10-11 16-21 16S11 50 10 40c-1-5 1-10 4-14z" fill="#8C7B6B" ${INK}/><path d="M16 12l6 6M48 12l-6 6" fill="none" stroke="#E7B9A8" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="34" r="2.6" fill="#2B2B33"/><circle cx="40" cy="34" r="2.6" fill="#2B2B33"/><path d="M30 40h4l-2 2.4z" fill="#E7908A"/><path d="M32 42.4c-1 2-3 3-5 2M32 42.4c1 2 3 3 5 2M8 38l10 1M8 44l10-2M56 38l-10 1M56 44l-10-2" fill="none" stroke="#3A2E26" stroke-width="1.1" stroke-linecap="round"/>`,
  },
  dog: {
    label: 'A dog', words: ['dog', 'dogs', 'puppy', 'pup', '강아지', '개'],
    svg: `<path d="M18 24c0-8 6-14 14-14s14 6 14 14v12c0 10-6 18-14 18s-14-8-14-18z" fill="#D9B48A" ${INK}/><path d="M18 22C10 22 6 30 8 42c6 0 10-6 11-12M46 22c8 0 12 8 10 20-6 0-10-6-11-12" fill="#9C6B43" ${INK}/><circle cx="26" cy="32" r="2.6" fill="#2B2B33"/><circle cx="38" cy="32" r="2.6" fill="#2B2B33"/><ellipse cx="32" cy="41" rx="4" ry="3" fill="#2B2B33"/><path d="M32 44v3c-1 2-4 2-5 0M32 47c1 2 4 2 5 0" fill="none" stroke="#3A2E26" stroke-width="1.2" stroke-linecap="round"/>`,
  },
  wave: {
    label: 'The sea', words: ['sea', 'ocean', 'beach', 'wave', 'waves', 'surf', 'swim', 'coast', '바다', '해변'],
    svg: `<path d="M4 40c6-12 18-18 28-14-8 2-10 10-4 14 5 3 12 0 14-6 4 10-4 20-16 20H4z" fill="#6FA3C7" ${INK}/><path d="M36 54c6-6 14-8 24-6v8H34z" fill="#9CC3DC" ${INK}/><path d="M14 44c3-5 7-8 12-9" ${HI}/><circle cx="50" cy="16" r="6" fill="#F6D27E" ${INK}/>`,
  },
  mountain: {
    label: 'Mountains', words: ['mountain', 'mountains', 'hike', 'hiking', 'trail', 'camping', 'camp', '산', '등산', '캠핑'],
    svg: `<path d="M4 54L24 18l12 20 6-10 18 26z" fill="#7E95B4" ${INK}/><path d="M24 18l-6 11 4-2 3 3 3-3 3 2z" fill="#FFFDF6" ${INK}/><path d="M42 28l-4 6 3-1 2 2 2-2 2 1z" fill="#FFFDF6" stroke="#3A2E26" stroke-width="1.2" stroke-linejoin="round"/><path d="M4 54h56" fill="none" ${INK}/>`,
  },
  snow: {
    label: 'Snow', words: ['snow', 'snowman', 'winter', 'ski', 'skiing', 'christmas', '눈', '겨울', '크리스마스'],
    svg: `<g fill="none" stroke="#7FA7D1" stroke-width="2.4" stroke-linecap="round"><path d="M32 8v48M11 20l42 24M11 44l42-24"/><path d="M26 12l6 5 6-5M26 52l6-5 6 5M12 27l8-1-3-7M52 37l-8 1 3 7M12 37l8 1-3 7M52 27l-8-1 3-7"/></g>`,
  },
  cake: {
    label: 'Cake', words: ['cake', 'birthday', 'dessert', 'bakery', 'cupcake', '케이크', '생일'],
    svg: `<path d="M30 8c-2 3 0 5 2 5s4-2 2-5l-2-3z" fill="#F0B341"/><path d="M32 13v8" stroke="#E07A7A" stroke-width="3"/><path d="M12 34c0-5 4-9 9-9h22c5 0 9 4 9 9v20H12z" fill="#F6E6D4" ${INK}/><path d="M12 36c4 4 8 4 10 0 3 4 7 4 10 0 3 4 7 4 10 0 3 4 7 4 10 0" fill="none" stroke="#E07A7A" stroke-width="3" stroke-linecap="round"/><path d="M8 54h48" fill="none" ${INK}/><g fill="#E07A7A"><circle cx="22" cy="46" r="1.4"/><circle cx="32" cy="48" r="1.4"/><circle cx="42" cy="46" r="1.4"/></g>`,
  },
  book: {
    label: 'Books', words: ['book', 'books', 'reading', 'library', 'bookstore', 'novel', '책', '서점'],
    svg: `<path d="M32 18c-8-5-17-6-26-4v36c9-2 18-1 26 4 8-5 17-6 26-4V14c-9-2-18-1-26 4z" fill="#FFFDF6" ${INK}/><path d="M32 18v36" fill="none" ${INK}/><g stroke="#B9AE95" stroke-width="1.4" stroke-linecap="round"><path d="M12 24c5-1 10-1 14 1M12 30c5-1 10-1 14 1M12 36c5-1 10-1 14 1M38 25c4-2 9-2 14-1M38 31c4-2 9-2 14-1M38 37c4-2 9-2 14-1"/></g><path d="M44 10v14l3-3 3 3V10" fill="#E07A7A" ${INK}/>`,
  },
  plane: {
    label: 'Paper planes', words: ['plane', 'flight', 'airport', 'travel', 'trip', 'abroad', 'fly', '비행기', '공항', '여행'],
    svg: `<path d="M6 30L58 8 40 56 30 38z" fill="#FFFDF6" ${INK}/><path d="M30 38L58 8 22 34z" fill="#E7EEF7" ${INK}/><path d="M30 38l-2 12 8-8" fill="#C9D6E8" ${INK}/><path d="M4 50c6-2 10-6 12-12" fill="none" stroke="#9AA4B8" stroke-width="1.6" stroke-dasharray="3 4" stroke-linecap="round"/>`,
  },
  popcorn: {
    label: 'Movie nights', words: ['movie', 'movies', 'film', 'cinema', 'popcorn', 'netflix', '영화'],
    svg: `<path d="M16 26h32l-4 30H20z" fill="#FFFDF6" ${INK}/><path d="M22 26l2 30M32 26v30M42 26l-2 30" stroke="#E04B4B" stroke-width="4"/><path d="M16 26h32l-4 30H20z" fill="none" ${INK}/><g fill="#FFF2C4" ${INK}><circle cx="20" cy="22" r="6"/><circle cx="29" cy="17" r="7"/><circle cx="39" cy="18" r="6.5"/><circle cx="46" cy="24" r="5"/><circle cx="33" cy="25" r="5"/></g>`,
  },
  gamepad: {
    label: 'Games', words: ['game', 'games', 'gaming', 'video game', 'mario', 'nintendo', 'playstation', 'xbox', 'switch', '게임'],
    svg: `<path d="M18 22h28c7 0 12 6 13 14l1 8c1 6-6 9-10 5l-6-6H20l-6 6c-4 4-11 1-10-5l1-8c1-8 6-14 13-14z" fill="#5B6E9A" ${INK}/><path d="M18 30v10M13 35h10" stroke="#FFFDF6" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="31" r="3" fill="#F0B341"/><circle cx="50" cy="37" r="3" fill="#E07A7A"/><path d="M24 26c2-1 5-2 8-2" ${HI}/>`,
  },
  bicycle: {
    label: 'Bike rides', words: ['bike', 'bikes', 'bicycle', 'cycling', 'ride', '자전거'],
    svg: `<circle cx="16" cy="42" r="11" fill="none" ${INK}/><circle cx="48" cy="42" r="11" fill="none" ${INK}/><path d="M16 42l10-18h16l6 18M26 24l8 18h-18M34 42l8-18M22 20h8M42 24l-2-6h6" fill="none" stroke="#C8323C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="34" cy="42" r="2" fill="#3A2E26"/>`,
  },
  pizza: {
    label: 'Pizza', words: ['pizza', '피자'],
    svg: `<path d="M8 16c15-6 33-6 48 0L32 58z" fill="#F2C14E" ${INK}/><path d="M8 16c15-6 33-6 48 0l-3 6c-13-5-29-5-42 0z" fill="#D9934A" ${INK}/><g fill="#D1453B" stroke="#3A2E26" stroke-width="1.2"><circle cx="24" cy="27" r="4"/><circle cx="38" cy="29" r="4"/><circle cx="31" cy="41" r="3.5"/></g><g fill="#5E8C3A"><circle cx="30" cy="31" r="1.4"/><circle cx="35" cy="38" r="1.4"/></g>`,
  },
}
export const MOTIF_IDS = Object.keys(MOTIFS)

export const TICKETS = {
  bus: { label: 'Bus ticket', head: 'CITY BUS · ONE WAY', color: '#2F6D5B', words: ['bus', 'shuttle', '버스'] },
  train: { label: 'Train ticket', head: 'RAIL · RETURN', color: '#7A3B4B', words: ['train', 'subway', 'metro', 'ktx', 'rail', '기차', '지하철'] },
  plane: { label: 'Boarding pass', head: 'BOARDING PASS', color: '#2D4B7A', words: ['plane', 'flight', 'airport', '비행기', '공항'] },
}

const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
const clean = (s, n) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, n) : '')

/**
 * Normalize a decoration plan from the design step (or a saved draft).
 * `letterIds` = ids of letters a ticket may dress (open-when / never-said / occasions).
 */
export function normalizeDecor(raw, letterIds = []) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const style = STYLES[r.style] ? r.style : 'night'
  const seen = new Set()
  const motifs = (Array.isArray(r.motifs) ? r.motifs : [])
    .map((m) => (typeof m === 'string' ? { id: m } : m))
    .filter((m) => m && MOTIFS[m.id] && !seen.has(m.id) && seen.add(m.id))
    .slice(0, 3)
    .map((m) => ({ id: m.id, why: clean(m.why, 140) }))
  const pm = r.postmark && clean(r.postmark.place, 28) ? { place: clean(r.postmark.place, 28), date: isISO(r.postmark.date) ? r.postmark.date : '', why: clean(r.postmark.why, 140) } : null
  let ticket = null
  if (r.ticket && TICKETS[r.ticket.kind]) {
    const letterId = letterIds.includes(r.ticket.letterId) ? r.ticket.letterId : letterIds[0]
    if (letterId) ticket = { kind: r.ticket.kind, letterId, title: clean(r.ticket.title, 22), line: clean(r.ticket.line, 40), why: clean(r.ticket.why, 140) }
  }
  const song = r.song && clean(r.song.title, 60) ? { title: clean(r.song.title, 60), why: clean(r.song.why, 140) } : null
  const off = {}
  if (r.off && typeof r.off === 'object') for (const k of Object.keys(r.off)) if (r.off[k] === true) off[k.slice(0, 40)] = true
  return { style, motifs, postmark: pm, ticket, song, off }
}

/** The plan with anything the sender switched off removed — what the recipient actually gets. */
export function activeDecor(decor) {
  if (!decor) return null
  const off = decor.off || {}
  return {
    style: decor.style,
    motifs: decor.motifs.filter((m) => !off[`motif:${m.id}`]),
    postmark: decor.postmark && !off.postmark ? decor.postmark : null,
    ticket: decor.ticket && !off.ticket ? decor.ticket : null,
    tape: !off.tape,
    song: decor.song && !off.song ? decor.song : null,
    sealVoice: !off.sealVoice,
    celebrate: !off.celebrate,
  }
}

/**
 * A plan built from the interview's own words, used when the design step can't run.
 * Picks motifs whose words appear in what the sender said; nothing is invented.
 */
export function fallbackDecor(phase2 = {}, letterIds = []) {
  const text = [phase2.symbols, phase2.special, phase2.nicknames, phase2.shared, phase2.jokes, phase2.song, phase2.transport, ...(Array.isArray(phase2.places) ? phase2.places.map((p) => p && p.name) : []), ...(Array.isArray(phase2.timeline) ? phase2.timeline.map((t) => t && t.label) : [])]
    .filter((s) => typeof s === 'string').join(' ').toLowerCase()
  const has = (w) => (/^[a-z ]+$/.test(w) ? new RegExp(`\\b${w}(e?s)?\\b`).test(text) : text.includes(w))
  const motifs = MOTIF_IDS.filter((id) => MOTIFS[id].words.some(has)).slice(0, 3).map((id) => ({ id, why: '' }))
  if (phase2.song && !motifs.find((m) => m.id === 'music') && motifs.length < 3) motifs.push({ id: 'music', why: '' })
  const place = (Array.isArray(phase2.places) ? phase2.places : []).find((p) => p && p.name)
    || (Array.isArray(phase2.timeline) ? phase2.timeline : []).map((t) => t && { name: t.label, date: t.date }).find((p) => p && p.name && p.name.length <= 28)
  const kind = Object.keys(TICKETS).find((k) => TICKETS[k].words.some(has))
  return normalizeDecor({
    style: 'night',
    motifs,
    postmark: place ? { place: place.name, date: place.date } : null,
    ticket: kind ? { kind, letterId: letterIds[0] } : null,
    song: typeof phase2.song === 'string' && phase2.song.trim() ? { title: phase2.song } : null,
  }, letterIds)
}

/** Format a date for a postmark: "APR 2 · 2023". */
export function postmarkDate(iso) {
  if (!isISO(iso)) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][m - 1]
  return `${mon} ${d} · ${y}`
}

/** The letter that carries the postmark: the first night's letter, or else the first letter on the rhythm. */
export function postmarkLetterId(items) {
  const list = Array.isArray(items) ? items : []
  return (list.find((i) => i.id === 't0') || list.find((i) => i.section === 'scheduled') || {}).id || null
}
