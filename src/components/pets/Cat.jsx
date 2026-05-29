export default function Cat({
  bodyColor = '#888888',
  patternType = 'solid',
  eyeColor = '#4CAF50',
  size = 100,
  feedCount = 0,
}) {
  const isHappy = feedCount >= 5
  const isVeryHappy = feedCount >= 9
  const scale = 0.8 + feedCount * 0.02
  const dark = shadeColor(bodyColor, -30)
  const light = shadeColor(bodyColor, 35)

  const tailPath = isVeryHappy
    ? 'M75,70 Q95,50 90,30 Q88,20 82,25'
    : 'M75,70 Q90,60 88,45'

  return (
    <svg
      width={size * scale}
      height={size * scale * 0.9}
      viewBox="0 0 100 90"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={tailPath}
        stroke={dark}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="60" rx="26" ry="20" fill={bodyColor} />
      <ellipse cx="50" cy="64" rx="14" ry="11" fill={light} />
      {patternType === 'tabby' && (
        <>
          <path
            d="M34,55 Q40,50 46,55"
            stroke={dark}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M54,55 Q60,50 66,55"
            stroke={dark}
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
        </>
      )}
      {patternType === 'bicolor' && (
        <ellipse cx="38" cy="58" rx="10" ry="12" fill="white" opacity="0.7" />
      )}
      <rect x="31" y="72" width="8" height="13" rx="4" fill={dark} />
      <rect x="42" y="72" width="8" height="13" rx="4" fill={dark} />
      <rect x="52" y="72" width="8" height="13" rx="4" fill={dark} />
      <rect x="63" y="72" width="8" height="13" rx="4" fill={dark} />
      <circle cx="50" cy="30" r="19" fill={bodyColor} />
      <polygon points="32,18 26,2 44,15" fill={bodyColor} />
      <polygon points="68,18 74,2 56,15" fill={bodyColor} />
      <polygon points="33,17 28,5 42,14" fill="#EFC5C4" opacity="0.7" />
      <polygon points="67,17 72,5 58,14" fill="#EFC5C4" opacity="0.7" />
      {patternType === 'tabby' && (
        <>
          <path
            d="M44,14 Q50,11 56,14"
            stroke={dark}
            strokeWidth="1"
            fill="none"
            opacity="0.6"
          />
          <path
            d="M46,18 Q50,15 54,18"
            stroke={dark}
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </>
      )}
      <ellipse cx="50" cy="34" rx="12" ry="10" fill={light} />
      {isVeryHappy ? (
        <>
          <text x="38" y="31" fontSize="9" textAnchor="middle" fill="#C8706E">
            ♥
          </text>
          <text x="62" y="31" fontSize="9" textAnchor="middle" fill="#C8706E">
            ♥
          </text>
        </>
      ) : (
        <>
          <ellipse
            cx="38"
            cy="28"
            rx={isHappy ? 3.5 : 3}
            ry={isHappy ? 3 : 3.5}
            fill={eyeColor}
          />
          <circle cx="38" cy="28" r="1.8" fill="#111" />
          <circle cx="39" cy="27" r="0.8" fill="white" />
          <ellipse
            cx="62"
            cy="28"
            rx={isHappy ? 3.5 : 3}
            ry={isHappy ? 3 : 3.5}
            fill={eyeColor}
          />
          <circle cx="62" cy="28" r="1.8" fill="#111" />
          <circle cx="63" cy="27" r="0.8" fill="white" />
        </>
      )}
      <polygon points="50,36 48,38 52,38" fill="#E8938A" />
      <line
        x1="25"
        y1="37"
        x2="42"
        y2="38"
        stroke={dark}
        strokeWidth="0.7"
        opacity="0.5"
      />
      <line
        x1="25"
        y1="40"
        x2="42"
        y2="40"
        stroke={dark}
        strokeWidth="0.7"
        opacity="0.4"
      />
      <line
        x1="58"
        y1="38"
        x2="75"
        y2="37"
        stroke={dark}
        strokeWidth="0.7"
        opacity="0.5"
      />
      <line
        x1="58"
        y1="40"
        x2="75"
        y2="40"
        stroke={dark}
        strokeWidth="0.7"
        opacity="0.4"
      />
      <path
        d={isHappy ? 'M46,39 Q50,43 54,39' : 'M47,39 Q50,41 53,39'}
        stroke={dark}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      {isVeryHappy && (
        <text x="50" y="6" fontSize="8" textAnchor="middle">
          ✨
        </text>
      )}
    </svg>
  )
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent))
  return (
    '#' +
    [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')
  )
}
