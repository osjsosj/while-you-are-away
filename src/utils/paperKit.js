/*
 * The letter paper kit: real-looking engraved stamps, tape, pressed flowers and paper surfaces (made with Higgsfield,
 * see scripts/paper-kit/). On letters they take the place of emoji stickers: a sticker whose theme has a stamp becomes
 * that stamp, and a sticker without one is simply left off the paper. Fewer, truer things.
 */

// sticker id → engraved stamp, by what the sticker shows
const STAMPS = [
  ['plane', /airplane|small-airplane|airport/],
  ['train', /train|railway|locomotive|metro|monorail|tram|light-rail/],
  ['bus', /^bus$|bus-stop|oncoming-bus|minibus|trolleybus/],
  ['ship', /ferry|ship|sailboat|motor-boat|speedboat|anchor/],
  ['bike', /bicycle/],
  ['music', /microphone|musical|headphone|guitar|radio|piano/],
  ['flower', /blossom|bouquet|rose$|tulip|sunflower|hibiscus|white-flower|cherry-blossom/],
  ['snow', /snow|christmas-tree|evergreen|mountain/],
  ['coffee', /hot-beverage|coffee|pancakes|doughnut|croissant|custard/],
  ['moon', /moon|night-with-stars|star$|glowing-star|shooting-star|milky-way/],
]

/** The engraved stamp for a sticker, or null when the kit has none for it. */
export function kitStamp(stickerId) {
  if (typeof stickerId !== 'string' || !stickerId) return null
  const hit = STAMPS.find(([, re]) => re.test(stickerId))
  return hit ? `/paper/stamp-${hit[0]}.webp` : null
}

/** Tape for a paper style (quiet paper has none). */
export const kitTape = (style) => ({ night: '/paper/tape-masking.webp', scrapbook: '/paper/tape-kraft.webp', flowers: '/paper/tape-rose.webp' })[style] || null

const FLOWERS = ['/paper/flower-daisy.webp', '/paper/flower-lavender.webp', '/paper/flower-fern.webp']
/** A pressed flower for the flowers paper, the same one for the same letter. */
export function kitFlower(seed = '') {
  let h = 0
  for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return FLOWERS[h % FLOWERS.length]
}
