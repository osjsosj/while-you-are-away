/**
 * The letter paper drawn from a box look (boxLook.js → look.paper): tint, grain, stain, dots, faces.
 * Returns plain style objects, so the recipient's reader and the lab share one source.
 */

export const GRAIN = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .28  0 0 0 0 .2  0 0 0 .9 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>')}")`

export const STAINS = {
  coffee: 'radial-gradient(circle at 84% 92%, transparent 0 46px, rgba(122,82,54,.22) 47px 50px, rgba(122,82,54,.06) 51px 56px, transparent 57px)',
  tea: 'radial-gradient(circle at 84% 92%, transparent 0 44px, rgba(110,140,70,.2) 45px 48px, transparent 49px)',
  rain: 'radial-gradient(circle at 18% 78%, rgba(90,110,140,.14) 0 9px, transparent 10px), radial-gradient(circle at 27% 88%, rgba(90,110,140,.12) 0 6px, transparent 7px), radial-gradient(circle at 80% 20%, rgba(90,110,140,.1) 0 8px, transparent 9px)',
}

/** The sheet a letter opens on. */
export function sheetStyle(paper) {
  if (!paper) return undefined
  const layers = [STAINS[paper.stain], paper.lines === 'dots' ? `radial-gradient(${paper.line} 1px, transparent 1.4px)` : null].filter(Boolean)
  return {
    backgroundColor: paper.tint,
    backgroundImage: layers.length ? layers.join(', ') : undefined,
    backgroundSize: paper.lines === 'dots' ? (STAINS[paper.stain] ? 'auto, 18px 18px' : '18px 18px') : undefined,
    '--sheet-grain': paper.grain,
    '--sheet-grain-img': GRAIN,
  }
}

/** Variables the paper's words pick up (see .lp in decor.css). */
export function paperVars(paper) {
  if (!paper) return {}
  return {
    '--lp-paper': paper.tint,
    '--lp-ink': paper.ink,
    '--lp-line': paper.line,
    '--lp-title-face': paper.faces.title,
    '--lp-body-face': paper.faces.body,
    '--lp-hand-face': paper.faces.hand,
    ...(paper.accent ? { '--lp-accent': paper.accent } : {}),
  }
}
