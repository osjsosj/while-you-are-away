import { useRef, useState } from 'react'

/*
 * Sign once; the signature goes under every letter. Stored as SVG path data in a 400×150 box,
 * so it stays tiny and sharp at any size.
 */
const W = 400
const H = 150

const r1 = (n) => Math.round(n * 10) / 10

function strokeToPath(pts) {
  if (pts.length === 1) return `M${r1(pts[0][0])} ${r1(pts[0][1])} L${r1(pts[0][0] + 0.5)} ${r1(pts[0][1] + 0.5)}`
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]
    const [nx, ny] = pts[i + 1]
    d += ` Q${r1(x)} ${r1(y)} ${r1((x + nx) / 2)} ${r1((y + ny) / 2)}`
  }
  const last = pts[pts.length - 1]
  return `${d} L${r1(last[0])} ${r1(last[1])}`
}

export default function SignaturePad({ value, onSave, name }) {
  const svg = useRef(null)
  const [strokes, setStrokes] = useState([]) // finished path strings
  const [current, setCurrent] = useState(null) // points of the stroke being drawn
  const [editing, setEditing] = useState(!value?.d)

  const point = (e) => {
    const box = svg.current.getBoundingClientRect()
    return [((e.clientX - box.left) / box.width) * W, ((e.clientY - box.top) / box.height) * H]
  }
  const down = (e) => {
    e.preventDefault()
    svg.current.setPointerCapture?.(e.pointerId)
    setCurrent([point(e)])
  }
  const move = (e) => {
    if (!current) return
    const p = point(e)
    const last = current[current.length - 1]
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) > 1.5) setCurrent([...current, p])
  }
  const up = () => {
    if (!current) return
    setStrokes((s) => [...s, strokeToPath(current)])
    setCurrent(null)
  }

  const save = () => {
    if (!strokes.length) return
    onSave({ d: strokes.join(' ') })
    setStrokes([])
    setEditing(false)
  }

  if (!editing && value?.d) {
    return (
      <div className="ws ws--done">
        <svg viewBox={`0 0 ${W} ${H}`} className="ws-view" role="img" aria-label={`${name || 'Your'} signature`}>
          <path d={value.d} />
        </svg>
        <div className="ws-actions">
          <button type="button" className="wf-link we-small-link" onClick={() => setEditing(true)}>Sign again</button>
          <button type="button" className="wf-link we-small-link" onClick={() => onSave(null)}>Remove</button>
        </div>
      </div>
    )
  }

  const live = current ? strokeToPath(current) : ''
  return (
    <div className="ws">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="ws-pad"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
        role="img"
        aria-label="Signature pad. Draw with your finger or mouse."
      >
        <line x1="24" x2={W - 24} y1={H - 34} y2={H - 34} className="ws-line" />
        {strokes.map((d, i) => <path key={i} d={d} />)}
        {live && <path d={live} />}
        {!strokes.length && !current && <text x={W / 2} y={H / 2} textAnchor="middle" className="ws-hint">Sign here</text>}
      </svg>
      <div className="ws-actions">
        <button type="button" className="wf-btn wf-btn--small" onClick={save} disabled={!strokes.length}>Use this signature</button>
        <button type="button" className="wf-link we-small-link" onClick={() => setStrokes([])} disabled={!strokes.length}>Clear</button>
        {value?.d && <button type="button" className="wf-link we-small-link" onClick={() => { setStrokes([]); setEditing(false) }}>Cancel</button>}
      </div>
    </div>
  )
}
