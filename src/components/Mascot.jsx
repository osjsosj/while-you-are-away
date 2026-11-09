import { useEffect, useRef, useState } from 'react'
import { loadMove } from '../utils/mascot'
import '../styles/mascot.css'

/* Perigan, the pelican who carries the letters. He rests on a still frame and breathes (CSS), then every
   few seconds does one thing once, so he never reads as a looping GIF. Every GIF has its own canvas, so
   each is cropped to the character's box: all moves stand the same size in the same place.
   Reduced motion leaves him on the still frame. */

// canvas size, the character's box within it (all frames, GIF pixels), and one play through in ms
const MOVES = {
  walk: { w: 313, h: 418, box: [32, 78, 275, 330], ms: 1200 },
  land: { w: 313, h: 313, box: [38, 60, 275, 292], ms: 1600 },
  fly: { w: 313, h: 627, box: [14, 204, 295, 458], ms: 720 },
  flyleft: { w: 313, h: 627, box: [11, 176, 302, 447], ms: 880 },
  idle: { w: 313, h: 418, box: [35, 102, 281, 332], ms: 1200 },
  doze: { w: 250, h: 627, box: [9, 182, 246, 441], ms: 1500 },
  cheer: { w: 313, h: 627, box: [20, 170, 288, 447], ms: 800 },
  notice: { w: 313, h: 418, box: [29, 83, 286, 330], ms: 1200 },
  talk: { w: 313, h: 418, box: [34, 64, 282, 326], ms: 1200 },
  putdown: { w: 313, h: 418, box: [24, 97, 279, 350], ms: 1920 },
  bow: { w: 313, h: 418, box: [26, 100, 290, 338], ms: 2040 },
}
const REF = 262 // a typical character height; `size` is the on-screen size of that

// what he does now and then while resting in each move (same canvas, so he stays in place)
const ACTS = {
  idle: ['idle', 'idle', 'idle', 'notice', 'bow'],
  talk: ['talk', 'idle'],
  notice: ['idle', 'notice'],
  bow: ['bow', 'idle'],
  doze: ['doze'],
  cheer: ['cheer'],
  fly: ['fly', 'fly'],
  flyleft: ['flyleft', 'flyleft'],
}
const ON_ARRIVAL = new Set(['talk', 'notice', 'cheer', 'bow', 'land']) // these happen once as soon as they're asked for
const ONGOING = new Set(['walk', 'putdown']) // these keep going until the screen moves on

function usePlays(move, loop, node) {
  const [playing, setPlaying] = useState(null) // { base, url }

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    let alive = true
    let timer = 0
    let onScreen = true
    let url = null
    const release = (u) => { if (u) setTimeout(() => URL.revokeObjectURL(u), 300) }

    const wait = () => {
      const acts = ACTS[move]
      if (!acts) return
      timer = setTimeout(() => {
        if (document.hidden || !onScreen) return wait()
        play(acts[Math.floor(Math.random() * acts.length)], false)
      }, 3500 + Math.random() * 5500)
    }
    const play = (m, keepGoing) => {
      loadMove(m).then((blob) => {
        if (!alive) return
        const next = URL.createObjectURL(blob)
        release(url)
        url = next
        setPlaying({ base: move, url: next })
        if (keepGoing) return
        timer = setTimeout(() => {
          release(url)
          url = null
          setPlaying(null)
          wait()
        }, MOVES[m].ms - 30)
      }).catch(() => { if (alive) wait() }) // no GIF, no signal: he just rests
    }

    if (loop || ONGOING.has(move)) play(move, true)
    else if (ON_ARRIVAL.has(move)) play(move, false)
    else wait()

    const seen = node.current && new IntersectionObserver(([e]) => { onScreen = e.isIntersecting })
    if (seen) seen.observe(node.current)
    return () => {
      alive = false
      clearTimeout(timer)
      seen?.disconnect()
      release(url)
    }
  }, [move, loop, node])

  return playing?.base === move ? playing.url : null
}

export default function Mascot({ move = 'idle', size = 120, flip = false, loop = false, className = '', label = '', onAnimationEnd }) {
  const node = useRef(null)
  const gif = usePlays(move, loop, node)
  const m = MOVES[move] || MOVES.idle
  const s = size / REF
  const [l, t, r, b] = m.box
  const cw = (r - l) * s
  const ch = (b - t) * s
  // centre the character's box in a size × size square
  const left = (size - cw) / 2 - l * s
  const top = (size - ch) / 2 - t * s
  // putting the letter down starts from standing; its own still is the end of the move
  const still = move === 'putdown' ? 'idle' : move
  return (
    <span
      ref={node}
      className={`mascot mascot--${move}${flip ? ' is-flipped' : ''} ${className}`}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
      onAnimationEnd={onAnimationEnd}
    >
      <img key={move} src={gif || `/mascot/${still}.png`} alt="" width={m.w * s} height={m.h * s} style={{ left, top }} draggable="false" />
    </span>
  )
}

/** What Perigan says when someone could use a hand. `tail` points at him: left, right, up or down. */
export function Says({ tail = 'left', className = '', children }) {
  return <p className={`says says--${tail} ${className}`}>{children}</p>
}
