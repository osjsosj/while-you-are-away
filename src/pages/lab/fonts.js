import { useEffect } from 'react'

/* Korean-capable faces the design lab tries per story (not part of DESIGN.md yet). Dev only. */
const FONTS = 'https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Hahmlet:wght@500;700&family=IBM+Plex+Sans+KR:wght@400;600&family=Nanum+Pen+Script&display=swap'

export function useLabFonts() {
  useEffect(() => {
    if (document.getElementById('lab-fonts')) return
    const l = document.createElement('link')
    l.id = 'lab-fonts'
    l.rel = 'stylesheet'
    l.href = FONTS
    document.head.appendChild(l)
  }, [])
}
