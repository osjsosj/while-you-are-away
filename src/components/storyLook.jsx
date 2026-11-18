import { useEffect } from 'react'
import { StoryHero } from './StoryArt'

/* Korean-capable faces per type pairing (storyDesign TYPE); only the pairing in use is loaded. */
const FONT_FAMILIES = {
  tender: 'Gowun+Batang:wght@400;700&family=Nanum+Pen+Script',
  warm: 'Hahmlet:wght@500;700&family=Gowun+Dodum&family=Nanum+Pen+Script',
  playful: 'Gowun+Dodum&family=Gaegu:wght@400;700',
  plain: 'IBM+Plex+Sans+KR:wght@400;600&family=Nanum+Pen+Script',
}

export function useStoryFonts(typeKey) {
  useEffect(() => {
    const fam = FONT_FAMILIES[typeKey]
    if (!fam || document.getElementById(`story-fonts-${typeKey}`)) return
    const l = document.createElement('link')
    l.id = `story-fonts-${typeKey}`
    l.rel = 'stylesheet'
    l.href = `https://fonts.googleapis.com/css2?family=${fam}&display=swap`
    document.head.appendChild(l)
  }, [typeKey])
}

/** The `look` LetterApp takes, from box.look (utils/design/boxLook.js); null keeps the usual look. */
export function storyLook(box) {
  const look = box?.look
  if (!look?.theme) return null
  return {
    theme: look.theme,
    art: look.art,
    hero: <StoryHero look={look} fromName={box.fromName} toName={box.toName} />,
    pathArt: look.stamps.map((s) => s.sticker).filter(Boolean),
  }
}
