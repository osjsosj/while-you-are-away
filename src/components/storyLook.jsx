import { useEffect } from 'react'
import { StoryHero } from './StoryArt'

/* The faces of each type pairing (storyDesign TYPE); only the pairing in use is loaded. Literata and Caveat
 * come with the page. The Korean faces after them are split by unicode range, so a browser only downloads
 * them for a letter that has Korean in it. */
const FONT_FAMILIES = {
  tender: 'Fraunces:opsz,wght@9..144,400;9..144,600&family=Gowun+Batang:wght@400;700&family=Nanum+Pen+Script',
  warm: 'Lora:wght@500;700&family=Source+Sans+3:wght@400;600&family=Kalam&family=Hahmlet:wght@500;700&family=Gowun+Dodum&family=Nanum+Pen+Script',
  playful: 'Nunito:wght@400;700&family=Patrick+Hand&family=Gowun+Dodum&family=Gaegu:wght@400;700',
  plain: 'IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Sans+KR:wght@400;600&family=Nanum+Pen+Script',
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
