/**
 * mascot.js — one download per Perigan GIF. A fresh object URL for each play is what restarts
 * a GIF from its first frame without fetching it again.
 */
const gifs = new Map()

export function loadMove(move) {
  if (!gifs.has(move)) {
    gifs.set(move, fetch(`/mascot/${move}.gif`).then((r) => {
      if (!r.ok) throw new Error(String(r.status))
      return r.blob()
    }).catch((err) => { gifs.delete(move); throw err }))
  }
  return gifs.get(move)
}
