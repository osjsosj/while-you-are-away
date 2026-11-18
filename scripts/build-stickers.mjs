/**
 * Builds the sticker library: one list of friendly subjects, drawn in four art styles, so two boxes
 * with the same moments can still look different (storyDesign picks a style per box).
 *   npm i --no-save @iconify-json/fluent-emoji-flat @iconify-json/fluent-emoji @iconify-json/noto @iconify-json/twemoji
 *   node scripts/build-stickers.mjs
 * Writes public/stickers/<id>.svg (flat), public/stickers/<style>/<id>.svg (the others),
 * and src/utils/stickers.js (ids, labels, search words, which styles lack which ids).
 *  - flat:    Microsoft Fluent Emoji, flat   (MIT)
 *  - color:   Microsoft Fluent Emoji, color  (MIT)
 *  - noto:    Google Noto Emoji              (Apache 2.0)
 *  - twemoji: Twitter Twemoji                (CC BY 4.0, attribution in LICENSE.txt and the Terms)
 */
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const set = require('@iconify-json/fluent-emoji-flat/icons.json')
const meta = require('@iconify-json/fluent-emoji-flat/metadata.json')

const KEEP = ['Animals & Nature', 'Food & Drink', 'Activities', 'Objects', 'Travel & Places']
const TONE = /-(light|medium-light|medium|medium-dark|dark)(-(light|medium-light|medium|medium-dark|dark))?$/ // skin-tone variants
// warm faces, signs and gestures from the other groups, picked by name
const FACES = /(smiling|grinning|beaming|heart|kiss|hug|savoring|relieved|sleeping|star-struck|partying|holding-back-tears|tears-of-joy|cat|face-in-clouds|melting|saluting|winking|zany|halo|sparkl|love-letter|sleepy|yawning|shushing|hand-over-mouth|peeking|blushing|upside-down|slightly|nerd|sunglasses|tongue|cowboy|monkey|hundred|speech|thought|zzz|dizzy|dashing)/
const NOT_FACES = /(angry|broken|black-heart|crying-cat|weary|pouting|enraged|vomit|skull|poop|bomb|collision|anger|devil|horns|clown|ogre|goblin|alien|robot|ghost|steam|symbols-on-mouth|frowning)/
const SIGNS = /^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|ophiuchus|infinity|dotted-six-pointed-star|eight-pointed-star|eight-spoked-asterisk|sparkle|heart|peace-symbol|yin-yang|musical|recycling|white-flower|japanese-symbol-for-beginner|curly-loop|double-curly-loop|part-alternation-mark|trident|fleur-de-lis|cinema|star-of-david|om|wheel-of-dharma|red-circle|orange-circle|yellow-circle|green-circle|blue-circle|purple-circle|brown-circle|white-circle|hollow-red-circle)/
const GESTURES = /(waving-hand|folded-hands|heart-hands|raising-hands|clapping-hands|open-hands|palms-up|handshake|thumbs-up|ok-hand|victory-hand|love-you|crossed-fingers|hand-with-index-finger-and-thumb-crossed|people-hugging|couple-with-heart|^kiss$|footprints|^baby$|^eyes$|^eye$|^ear$|mouth|flexed-biceps|selfie|writing-hand|nail-polish|call-me-hand|raised-hand|pinched-fingers|leftwards-hand|rightwards-hand|speaking-head|busts|bust-in-silhouette|person-in-bed|person-taking-bath|person-in-lotus|person-walking|person-running|dancing|santa|angel|fairy|genie|superhero|mage|elf)/
const NOT_GESTURES = /(dead|zombie|vampire|fist|middle-finger|thumbs-down)/
const ART = { color: 'fluent-emoji', noto: 'noto', twemoji: 'twemoji' }
const EXTRA = ['red-heart', 'orange-heart', 'yellow-heart', 'green-heart', 'blue-heart', 'purple-heart', 'white-heart', 'two-hearts', 'sparkling-heart', 'growing-heart', 'revolving-hearts', 'heart-with-ribbon', 'love-letter', 'smiling-face-with-hearts', 'hugging-face', 'sleeping-face']
// whole hyphen-separated words that mark a sticker as unsuitable for a love letter
const DROP_WORDS = new Set('knife dagger sword swords axe bomb pistol gun bow coffin urn syringe pill blood bandage cigarette prohibited skull toilet plunger trap chains cane crutch x-ray stethoscope dna microbe petri tube alembic razor police ambulance engine sos warning radioactive biohazard flag moai nazar hamsa buoy pager fax floppy minidisc abacus bolt screwdriver wrench hammer carpentry clamp toolbox magnet ladder bucket broom sponge soap lotion roll placard identification ballot wastebasket cabinet index clipboard pushpin paperclip paperclips linked chart calendar tear-off dollar euro pound yen money credit receipt coin gem scales joystick slot crystal nesting pinata lab safety military helmet dart yo-yo wand amphora squid lizard snake scorpion spider mosquito cockroach fly worm beetle bug ant bat t-rex sauropod dragon shark crocodile gorilla orangutan skunk rat mouse wilted empty headstone knot bone tooth lungs brain anatomical shield'.split(' '))
const isDropped = (id) => id.split('-').some((w) => DROP_WORDS.has(w)) || /^(no-|non-potable)/.test(id)
const ALIAS = {
  'hot-beverage': 'coffee tea latte cafe café espresso americano cocoa 커피 카페 차',
  'steaming-bowl': 'ramen ramyeon noodle noodles pho udon soup 라면 국수',
  tangerine: 'mandarin clementine orange citrus 귤 오렌지',
  'water-wave': 'sea ocean beach surf waves coast 바다 해변',
  'crescent-moon': 'moon night midnight 달 밤',
  'glowing-star': 'star stars sky stargazing 별',
  airplane: 'plane flight airport travel abroad fly 비행기 공항 여행',
  'musical-notes': 'song music playlist concert 노래 음악',
  'birthday-cake': 'birthday cake 생일 케이크',
  'camera-with-flash': 'camera photo photos picture photobooth 사진',
  'umbrella-with-rain-drops': 'umbrella rain rainy 우산 비',
  'cat-face': 'cat cats kitten kitty 고양이',
  'dog-face': 'dog dogs puppy pup 강아지',
  bus: 'bus shuttle 버스',
  train: 'train rail ktx 기차',
  metro: 'subway metro 지하철',
  bicycle: 'bike bicycle cycling ride 자전거',
  popcorn: 'movie movies cinema film netflix 영화',
  'video-game': 'game games gaming console 게임',
  books: 'book books reading library bookstore 책',
  'cherry-blossom': 'cherry blossom spring 벚꽃 봄',
  snowman: 'snow winter 눈 겨울',
  'fallen-leaf': 'autumn fall leaves 가을',
  'red-heart': 'love heart 사랑',
  'sun-behind-small-cloud': 'weather sunny',
  'beer-mug': 'beer pub 맥주',
  'ice-cream': 'ice cream dessert 아이스크림',
  'shortcake': 'cake dessert bakery 케이크',
  'camping': 'camping camp tent 캠핑',
  'snow-capped-mountain': 'mountain mountains hike hiking 산 등산',
  'beach-with-umbrella': 'beach vacation summer 해변 여름',
  'convenience-store': 'convenience store late night snack 편의점',
}

const pick = (cat, keep, drop) => (meta.categories[cat] || []).filter((id) => keep.test(id) && !drop.test(id))
const ids = [...new Set([
  ...KEEP.flatMap((c) => meta.categories[c] || []),
  ...EXTRA,
  ...pick('Smileys & Emotion', FACES, NOT_FACES),
  ...pick('Symbols', SIGNS, /$^/),
  ...pick('People & Body', GESTURES, NOT_GESTURES),
])]
  .filter((id) => set.icons[id] && !isDropped(id) && !TONE.test(id))
  .sort()

const outDir = path.resolve('public/stickers')
fs.mkdirSync(outDir, { recursive: true })
for (const f of fs.readdirSync(outDir)) if (f.endsWith('.svg')) fs.rmSync(path.join(outDir, f))
const W = set.width || 32
const H = set.height || 32
for (const id of ids) {
  const ic = set.icons[id]
  fs.writeFileSync(path.join(outDir, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ic.width || W} ${ic.height || H}">${ic.body}</svg>`)
}

// the same subjects in the other styles; a style that lacks one falls back to flat
const missing = {}
let files = ids.length
for (const [style, pkg] of Object.entries(ART)) {
  const other = require(`@iconify-json/${pkg}/icons.json`)
  const dir = path.join(outDir, style)
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  missing[style] = []
  for (const id of ids) {
    const ic = other.icons[id]
    if (!ic) { missing[style].push(id); continue }
    fs.writeFileSync(path.join(dir, `${id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ic.width || other.width || 32} ${ic.height || other.height || 32}">${ic.body}</svg>`)
    files++
  }
}

const entries = ids.map((id) => {
  const label = id.replace(/-/g, ' ')
  const words = [...new Set([...label.split(' ').filter((w) => w.length > 2 && !['with', 'and', 'the', 'face'].includes(w)), ...(ALIAS[id] ? ALIAS[id].split(' ') : [])])]
  return `  ${JSON.stringify(id)}: [${JSON.stringify(label)}, ${JSON.stringify(words.join(' '))}],`
})
fs.writeFileSync(path.resolve('src/utils/stickers.js'), `/* Generated by scripts/build-stickers.mjs. Do not edit by hand.
   Subjects (id → [label, search words]) drawn in four styles: Microsoft Fluent Emoji flat and color (MIT),
   Google Noto Emoji (Apache 2.0), Twitter Twemoji (CC BY 4.0). See public/stickers/LICENSE.txt. */
export const STICKERS = {
${entries.join('\n')}
}
export const STICKER_IDS = Object.keys(STICKERS)
/** Art styles: 'flat' lives at /stickers/<id>.svg, the others at /stickers/<style>/<id>.svg. */
export const STICKER_STYLES = ['flat', ${Object.keys(ART).map((k) => JSON.stringify(k)).join(', ')}]
/** Ids a style doesn't have (drawn flat instead). */
export const STICKER_MISSING = ${JSON.stringify(missing)}
`)
fs.writeFileSync(path.join(outDir, 'LICENSE.txt'), [
  'Stickers in four styles:',
  '- /stickers/*.svg and /stickers/color/*.svg: Microsoft Fluent Emoji, MIT License, Copyright (c) Microsoft Corporation. https://github.com/microsoft/fluentui-emoji',
  '- /stickers/noto/*.svg: Noto Emoji by Google, Apache License 2.0. https://github.com/googlefonts/noto-emoji',
  '- /stickers/twemoji/*.svg: Twemoji, Copyright 2020 Twitter, Inc and other contributors, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Graphics unchanged. https://github.com/twitter/twemoji',
  '',
].join('\n'))
console.log(ids.length, 'subjects,', files, 'sticker files')
