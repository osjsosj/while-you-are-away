import { useMemo } from 'react'
import { constellation } from '../utils/sky'

/* Every letter opened becomes a star; the line joins them in the order they were opened. */
export default function Constellation({ ids, height = 120, newest = true }) {
  const stars = useMemo(() => constellation(ids), [ids])
  const W = 600
  const H = height
  const pts = stars.map((s) => [s.x * W, s.y * H])
  return (
    <svg className="wc-sky" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${ids.length} ${ids.length === 1 ? 'star' : 'stars'}, one for each letter opened`}>
      {pts.length > 1 && (
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="rgba(233,236,242,0.28)" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      )}
      {stars.map((s, i) => {
        const last = newest && i === stars.length - 1
        return (
          <g key={s.id} transform={`translate(${pts[i][0]} ${pts[i][1]})`}>
            {last && <circle r={9} fill="var(--light, #F0B341)" opacity="0.18" className="wc-pulse" />}
            <circle r={2.2 * s.size + (last ? 1 : 0)} fill={last ? 'var(--light, #F0B341)' : '#F4F1E6'} />
          </g>
        )
      })}
    </svg>
  )
}
