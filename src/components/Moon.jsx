/* A moon drawn at a given phase (0 new → 0.5 full → 1 new). Lit side faces right while waxing. */
export default function Moon({ phase, size = 96, label }) {
  const r = 44
  const c = 50
  const p = ((phase % 1) + 1) % 1
  const rx = Math.abs(Math.cos(2 * Math.PI * p)) * r
  const waxing = p < 0.5
  const outer = waxing ? 1 : 0
  const crescent = p < 0.25 || p > 0.75
  const inner = waxing ? (crescent ? 0 : 1) : (crescent ? 1 : 0)
  const d = `M ${c} ${c - r} A ${r} ${r} 0 0 ${outer} ${c} ${c + r} A ${rx} ${r} 0 0 ${inner} ${c} ${c - r} Z`
  const nearlyNew = p < 0.02 || p > 0.98
  const nearlyFull = Math.abs(p - 0.5) < 0.02
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label}>
      <defs>
        <radialGradient id="moonLit" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FBF6E4" />
          <stop offset="100%" stopColor="#E6DCC0" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={r + 6} fill="rgba(246,239,214,0.06)" />
      <circle cx={c} cy={c} r={r} fill="#1A2440" />
      {!nearlyNew && (nearlyFull ? <circle cx={c} cy={c} r={r} fill="url(#moonLit)" /> : <path d={d} fill="url(#moonLit)" />)}
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(246,239,214,0.18)" strokeWidth="1" />
    </svg>
  )
}
