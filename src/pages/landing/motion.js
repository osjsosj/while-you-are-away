/** The cinematic sky runs only when motion is welcome and the connection can carry about 2 MB of frames. */
export function cinemaAllowed() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    const c = navigator.connection
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return false
    return true
  } catch {
    return false
  }
}
