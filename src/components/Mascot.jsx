import '../styles/mascot.css'

/* Where the mascot stands. The art arrives later; until then this keeps its place, size and idle
   motion so every screen is laid out for it. Swap the inside for the real character. */

export default function Mascot({ size = 120, mood = 'idle', className = '' }) {
  return (
    <span className={`mascot mascot--${mood} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="mascot-slot" />
      <span className="mascot-shadow" />
    </span>
  )
}
