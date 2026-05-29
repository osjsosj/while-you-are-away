export default function Dog({
  color = '#E8A85A',
  earType = 'up',
  size = 100,
  feedCount = 0,
}) {
  const isHappy = feedCount >= 5
  const isVeryHappy = feedCount >= 9
  const scale = 0.8 + feedCount * 0.02

  const darkColor = shadeColor(color, -25)
  const lightColor = shadeColor(color, 30)

  const eyeLeft = isVeryHappy ? (
    <text x="38" y="31" fontSize="9" textAnchor="middle" fill="#C8706E">
      ♥
    </text>
  ) : (
    <>
      <circle cx="38" cy="28" r={isHappy ? 2.8 : 2.5} fill="#3D2B1F" />
      <circle cx="39.2" cy="27" r="1" fill="white" />
      {isHappy && (
        <path
          d="M35,32 Q38,35 41,32"
          stroke="#3D2B1F"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </>
  )

  const eyeRight = isVeryHappy ? (
    <text x="62" y="31" fontSize="9" textAnchor="middle" fill="#C8706E">
      ♥
    </text>
  ) : (
    <>
      <circle cx="62" cy="28" r={isHappy ? 2.8 : 2.5} fill="#3D2B1F" />
      <circle cx="63.2" cy="27" r="1" fill="white" />
      {isHappy && (
        <path
          d="M59,32 Q62,35 65,32"
          stroke="#3D2B1F"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </>
  )

  const tailY = Math.max(42, 50 - feedCount)
  const tailRotate = -15 - feedCount * 2

  return (
    <svg
      width={size * scale}
      height={size * scale * 0.85}
      viewBox="0 0 100 85"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="80"
        cy={tailY}
        rx="7"
        ry="5"
        fill={darkColor}
        transform={`rotate(${tailRotate}, 80, ${tailY})`}
      />
      <ellipse cx="50" cy="58" rx="30" ry="20" fill={color} />
      <ellipse cx="50" cy="62" rx="18" ry="12" fill={lightColor} />
      <rect x="30" y="70" width="9" height="12" rx="4.5" fill={darkColor} />
      <rect x="42" y="70" width="9" height="12" rx="4.5" fill={darkColor} />
      <rect x="52" y="70" width="9" height="12" rx="4.5" fill={darkColor} />
      <rect x="64" y="70" width="9" height="12" rx="4.5" fill={darkColor} />
      <circle cx="50" cy="30" r="20" fill={color} />
      {earType === 'up' ? (
        <>
          <polygon points="30,22 22,3 42,18" fill={darkColor} />
          <polygon points="70,22 78,3 58,18" fill={darkColor} />
          <polygon points="31,20 25,7 40,17" fill="#EFC5C4" opacity="0.6" />
          <polygon points="69,20 75,7 60,17" fill="#EFC5C4" opacity="0.6" />
        </>
      ) : (
        <>
          <ellipse
            cx="26"
            cy="24"
            rx="8"
            ry="12"
            fill={darkColor}
            transform="rotate(-15,26,24)"
          />
          <ellipse
            cx="74"
            cy="24"
            rx="8"
            ry="12"
            fill={darkColor}
            transform="rotate(15,74,24)"
          />
          <ellipse
            cx="26"
            cy="24"
            rx="5"
            ry="9"
            fill="#EFC5C4"
            opacity="0.5"
            transform="rotate(-15,26,24)"
          />
          <ellipse
            cx="74"
            cy="24"
            rx="5"
            ry="9"
            fill="#EFC5C4"
            opacity="0.5"
            transform="rotate(15,74,24)"
          />
        </>
      )}
      <ellipse cx="50" cy="34" rx="13" ry="11" fill={lightColor} />
      {eyeLeft}
      {eyeRight}
      <ellipse cx="50" cy="38" rx="3.5" ry="2.5" fill="#3D2B1F" />
      <path
        d={isVeryHappy ? 'M44,36 Q50,42 56,36' : 'M46,36 Q50,39 54,36'}
        stroke="#3D2B1F"
        strokeWidth="1.2"
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
