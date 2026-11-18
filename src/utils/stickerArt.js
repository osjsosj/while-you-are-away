/**
 * Which drawing of a sticker to show. Each box draws all its stickers in one art style, picked from
 * the senders' story (storyDesign → look.art); a style that lacks a subject falls back to flat.
 */
import { createContext } from 'react'
import { STICKER_MISSING, STICKER_STYLES } from './stickers.js'

export const StickerArtContext = createContext('flat')

const missing = Object.fromEntries(Object.entries(STICKER_MISSING).map(([k, v]) => [k, new Set(v)]))

export function stickerSrc(id, art = 'flat') {
  if (art && art !== 'flat' && STICKER_STYLES.includes(art) && !missing[art]?.has(id)) return `/stickers/${art}/${id}.svg`
  return `/stickers/${id}.svg`
}
