import { Component, useEffect, useMemo, useRef, useState } from 'react'
import { DataTexture, ExtrudeGeometry, MathUtils, NearestFilter, RedFormat, Shape } from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'

/*
 * The one 3D moment on the site: our mascot, a white pelican mail carrier, drawn flat.
 * Toon shading gives every part two tones (lit and shade) and the eyes take no light,
 * so it reads as a 2D illustration that still turns in 3D.
 * It never stands still: it breathes, looks around, blinks and sways, and every few seconds
 * crouches, hops and spins, fast off the jump and easing slowly to a stop.
 * The render loop stops while the tab is hidden, and holds still for reduced motion.
 */

const WHITE = '#FFFFFF'
const BELLY = '#F5EFE4'
const WING = '#F3EEE5'
const AMBER = '#F0B341'
const HOOK = '#DD9420'
const POUCH = '#F8CF74'
const NAVY = '#24305A'
const BAG = '#2E3D6B'
const PUPIL = '#1B2536'

// two tones: shade and lit, with a hard edge between them
const STEPS = new DataTexture(new Uint8Array([175, 255]), 2, 1, RedFormat)
STEPS.minFilter = NearestFilter
STEPS.magFilter = NearestFilter
STEPS.generateMipmaps = false
STEPS.needsUpdate = true

const Toon = ({ color }) => <meshToonMaterial color={color} gradientMap={STEPS} />
const Flat = ({ color }) => <meshBasicMaterial color={color} toneMapped={false} />

const CYCLE = 7 // seconds per loop of looking around, then a spin
const SPIN_AT = 5
const CROUCH = 0.22 // anticipation before the hop
const SPIN_FOR = 1.5
const easeOut = (t) => 1 - (1 - t) ** 4 // fast off the jump, slow into the stop
const smooth = (t) => t * t * (3 - 2 * t)

/** The upper bill, seen from above: wide at the face, tapering to a rounded tip. */
function useBill() {
  return useMemo(() => {
    const s = new Shape()
    s.moveTo(-0.17, 0)
    s.bezierCurveTo(-0.16, 0.35, -0.09, 0.72, -0.05, 0.86)
    s.quadraticCurveTo(0, 0.93, 0.05, 0.86)
    s.bezierCurveTo(0.09, 0.72, 0.16, 0.35, 0.17, 0)
    s.quadraticCurveTo(0, -0.05, -0.17, 0)
    return new ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 6, curveSegments: 40 })
  }, [])
}

function Eye({ x, eyeRef, pupilRef, happyRef }) {
  return (
    <group position={[x, 0.36, 0.74]} rotation={[0, x * 0.55, 0]}>
      <group ref={eyeRef}>
        <mesh scale={[0.19, 0.23, 0.06]}>
          <sphereGeometry args={[1, 32, 24]} />
          <Flat color="#FFFFFF" />
        </mesh>
        <group ref={pupilRef}>
          <mesh position={[0, -0.02, 0.05]} scale={[0.09, 0.11, 0.03]}>
            <sphereGeometry args={[1, 24, 16]} />
            <Flat color={PUPIL} />
          </mesh>
          <mesh position={[0.03, 0.03, 0.08]} scale={[0.026, 0.026, 0.01]}>
            <sphereGeometry args={[1, 12, 8]} />
            <Flat color="#FFFFFF" />
          </mesh>
        </group>
      </group>
      {/* happy eyes: a small arch, shown after the spin */}
      <mesh ref={happyRef} position={[0, -0.02, 0.05]} visible={false}>
        <torusGeometry args={[0.1, 0.024, 10, 32, Math.PI]} />
        <Flat color={PUPIL} />
      </mesh>
    </group>
  )
}

/** A wing set into the body's side, pivoting at the shoulder. */
function Wing({ side, wingRef }) {
  return (
    <group ref={wingRef} position={[side * 0.68, 0.1, -0.04]} rotation={[0, 0, side * 0.08]}>
      <mesh position={[side * 0.05, -0.32, -0.04]} rotation={[0.25, side * -0.45, side * 0.18]} scale={[0.12, 0.42, 0.34]}>
        <sphereGeometry args={[1, 40, 28]} />
        <Toon color={WING} />
      </mesh>
    </group>
  )
}

function Pelican({ animate }) {
  const root = useRef(null)
  const body = useRef(null)
  const jaw = useRef(null)
  const wingL = useRef(null)
  const wingR = useRef(null)
  const eyeL = useRef(null)
  const eyeR = useRef(null)
  const pupilL = useRef(null)
  const pupilR = useRef(null)
  const happyL = useRef(null)
  const happyR = useRef(null)
  const bag = useRef(null)
  const time = useRef(0)
  const bill = useBill()

  useFrame((_, delta) => {
    if (!animate) return
    // our own clock with a capped step, so coming back to the tab never jumps the motion
    time.current += Math.min(delta, 0.1)
    const t = time.current
    const phase = t % CYCLE

    // looking around: the head (the whole round body) turns to one side, pauses, turns to the other
    const glance = Math.sin(t * 0.85) * 0.75 + Math.sin(t * 1.9 + 1) * 0.18
    const lookYaw = 0.25 + MathUtils.clamp(glance, -0.7, 0.7) * 0.62
    const lookDir = Math.cos(t * 0.85) // where it's about to look: the eyes lead the head

    // the spin: crouch, hop, turn fast and ease to a stop, land with a squash
    const crouch = MathUtils.clamp((phase - SPIN_AT + CROUCH) / CROUCH, 0, 1) * (phase < SPIN_AT ? 1 : 0)
    const spin = MathUtils.clamp((phase - SPIN_AT) / SPIN_FOR, 0, 1)
    const airborne = spin > 0 && spin < 0.42
    const landing = MathUtils.clamp((spin - 0.42) / 0.16, 0, 1)
    const isHappy = spin > 0.3 && phase < SPIN_AT + SPIN_FOR + 0.8

    root.current.rotation.y = lookYaw * (1 - smooth(Math.min(1, crouch + spin * 4))) + easeOut(spin) * Math.PI * 2 + (spin > 0 ? 0.25 : 0) * smooth(Math.min(1, spin * 4))
    root.current.rotation.z = Math.sin(t * 1.3) * 0.045
    const hop = airborne ? Math.sin((spin / 0.42) * Math.PI) * 0.32 : 0
    const breathe = Math.sin(t * 2.4)
    root.current.position.y = hop + (spin === 0 || spin === 1 ? Math.abs(Math.sin(t * 2.4)) * 0.02 : 0)

    // squash and stretch: crouching squashes, the jump stretches, landing squashes and settles
    let sy = 1 + breathe * 0.012
    if (crouch > 0) sy = 1 - 0.12 * smooth(crouch)
    else if (airborne) sy = 1 + 0.08 * Math.sin((spin / 0.42) * Math.PI)
    else if (spin > 0 && spin < 1) sy = 1 - 0.1 * Math.sin(landing * Math.PI)
    body.current.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))

    // wings: a little flutter now and then, out wide in the air, flapping while happy
    const flutter = Math.max(0, Math.sin(t * 0.55 + 2)) > 0.97 ? Math.sin(t * 22) * 0.25 : 0
    const happyFlap = isHappy ? 0.55 + Math.sin(t * 16) * 0.25 : 0
    const target = airborne ? 1.05 : isHappy ? happyFlap : 0.06 + flutter + crouch * 0.3
    const w = MathUtils.lerp(wingL.current.rotation.z, target, 0.2)
    wingL.current.rotation.z = -w
    wingR.current.rotation.z = w
    // the bag swings behind the motion
    bag.current.rotation.z = MathUtils.lerp(bag.current.rotation.z, airborne ? 0.35 : Math.sin(t * 2.4) * 0.04, 0.1)
    // the pouch opens in a grin while happy, and sometimes as if humming
    const hum = Math.sin(t * 0.6) > 0.92 ? 0.12 : 0
    jaw.current.rotation.x = MathUtils.lerp(jaw.current.rotation.x, isHappy ? 0.42 : hum, 0.18)

    // eyes: lead the head's turns, blink now and then, and squint happily after the spin
    const look = MathUtils.clamp(lookDir, -1, 1) * 0.045
    const blink = !isHappy && (t % 3.1 < 0.12 || (t + 1.4) % 5.3 < 0.12)
    const sides = [[eyeL, pupilL, happyL], [eyeR, pupilR, happyR]]
    for (const [eye, pupil, happy] of sides) {
      pupil.current.position.x = MathUtils.lerp(pupil.current.position.x, look, 0.15)
      pupil.current.position.y = MathUtils.lerp(pupil.current.position.y, Math.sin(t * 0.7) * 0.015, 0.1)
      eye.current.scale.y = MathUtils.lerp(eye.current.scale.y, blink ? 0.08 : 1, 0.5)
      eye.current.visible = !isHappy
      happy.current.visible = isHappy
    }
  })

  return (
    <group ref={root} rotation={[0, 0.25, 0]}>
      <group ref={body}>
        {/* a duck's shape: the head rises out of a round, bottom-heavy body */}
        <mesh position={[0, 0.25, 0.02]} scale={[0.72, 0.72, 0.7]}>
          <sphereGeometry args={[1, 64, 48]} />
          <Toon color={WHITE} />
        </mesh>
        <mesh position={[0, -0.3, 0]} scale={[0.9, 0.78, 0.86]}>
          <sphereGeometry args={[1, 64, 48]} />
          <Toon color={WHITE} />
        </mesh>
        <mesh position={[0, -0.36, 0.34]} scale={[0.6, 0.52, 0.5]}>
          <sphereGeometry args={[1, 48, 32]} />
          <Toon color={BELLY} />
        </mesh>
        {/* a little tail */}
        <mesh position={[0, -0.32, -0.8]} rotation={[-0.7, 0, 0]} scale={[0.26, 0.12, 0.3]}>
          <sphereGeometry args={[1, 24, 16]} />
          <Toon color={WING} />
        </mesh>

        <Eye x={-0.27} eyeRef={eyeL} pupilRef={pupilL} happyRef={happyL} />
        <Eye x={0.27} eyeRef={eyeR} pupilRef={pupilR} happyRef={happyR} />

        {/* the pelican beak: a long flat bill with a hooked tip, and a pouch beneath that opens */}
        <group position={[0, 0.16, 0.62]} rotation={[0.22, 0, 0]}>
          <mesh geometry={bill} rotation={[-Math.PI / 2, 0, 0]}>
            <Toon color={AMBER} />
          </mesh>
          <mesh position={[0, -0.05, 0.9]} rotation={[0.9, 0, 0]} scale={[0.055, 0.085, 0.05]}>
            <sphereGeometry args={[1, 20, 14]} />
            <Toon color={HOOK} />
          </mesh>
          <group ref={jaw} position={[0, -0.03, 0.04]}>
            <mesh position={[0, -0.13, 0.36]} rotation={[-0.12, 0, 0]} scale={[0.15, 0.15, 0.4]}>
              <sphereGeometry args={[1, 36, 24]} />
              <Toon color={POUCH} />
            </mesh>
          </group>
        </group>

        {/* mail carrier cap: crown, amber band, brim and an envelope badge */}
        <group position={[0, 0.9, 0.04]} rotation={[-0.14, 0, 0.07]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.4, 0.36, 0.22, 48]} />
            <Toon color={NAVY} />
          </mesh>
          <mesh position={[0, 0.22, 0]} scale={[1, 0.25, 1]}>
            <sphereGeometry args={[0.4, 48, 24]} />
            <Toon color={NAVY} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.375, 0.375, 0.065, 48]} />
            <Toon color={AMBER} />
          </mesh>
          <mesh position={[0, -0.02, 0.3]} rotation={[0.25, 0, 0]} scale={[1, 0.12, 0.6]}>
            <cylinderGeometry args={[0.33, 0.33, 0.3, 48, 1, false, -Math.PI / 2, Math.PI]} />
            <Toon color={NAVY} />
          </mesh>
          <RoundedBox args={[0.16, 0.11, 0.03]} radius={0.01} smoothness={3} position={[0, 0.12, 0.39]} rotation={[-0.1, 0, 0]}>
            <Toon color={AMBER} />
          </RoundedBox>
        </group>

        <Wing side={-1} wingRef={wingL} />
        <Wing side={1} wingRef={wingR} />

        {/* the mail bag hangs at its side from a short strap over the shoulder, clear of the face */}
        <group position={[0.8, 0.28, 0.02]}>
          <mesh position={[0.02, -0.22, 0]} rotation={[0, Math.PI / 2, 0.1]}>
            <torusGeometry args={[0.24, 0.035, 10, 40, Math.PI * 0.9]} />
            <Toon color={BAG} />
          </mesh>
          <group ref={bag} position={[0.06, -0.62, 0.06]}>
            <group rotation={[0, Math.PI / 2 - 0.25, 0]}>
              <RoundedBox args={[0.5, 0.4, 0.2]} radius={0.07} smoothness={4}>
                <Toon color={BAG} />
              </RoundedBox>
              <RoundedBox args={[0.32, 0.22, 0.03]} radius={0.01} smoothness={3} position={[-0.05, 0.22, 0.02]} rotation={[0, 0, 0.14]}>
                <Toon color="#FFFDF8" />
              </RoundedBox>
              <RoundedBox args={[0.28, 0.2, 0.03]} radius={0.01} smoothness={3} position={[0.08, 0.2, -0.04]} rotation={[0, 0, -0.2]}>
                <Toon color="#F3ECDD" />
              </RoundedBox>
              <RoundedBox args={[0.52, 0.17, 0.22]} radius={0.05} smoothness={4} position={[0, 0.1, 0.01]}>
                <Toon color={NAVY} />
              </RoundedBox>
              <mesh position={[0, 0.03, 0.125]} scale={[0.05, 0.05, 0.02]}>
                <sphereGeometry args={[1, 16, 12]} />
                <Toon color={AMBER} />
              </mesh>
            </group>
          </group>
        </group>

        {/* webbed feet */}
        {[-0.27, 0.27].map((x) => (
          <mesh key={x} position={[x, -1.03, 0.22]} rotation={[0, x * 0.6, 0]} scale={[0.19, 0.06, 0.27]}>
            <sphereGeometry args={[1, 24, 16]} />
            <Toon color={AMBER} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// if WebGL can't start, lose only the mascot, never the page around it
class Quiet extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? null : this.props.children }
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}

export default function HeroObject() {
  const visible = usePageVisible()
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const frameloop = still ? 'demand' : visible ? 'always' : 'never'

  return (
    // data-html2canvas-ignore keeps the glass nav's page snapshot from claiming this canvas first
    <div className="hs-object" aria-hidden="true" data-html2canvas-ignore="true">
      <Quiet>
        <Canvas flat frameloop={frameloop} dpr={[1, 2]} camera={{ position: [0, 0.9, 5.6], fov: 38 }} gl={{ antialias: true, alpha: true }} onCreated={({ camera }) => camera.lookAt(0, 0, 0)}>
          {/* one key light: toon shading splits each part into a lit side and a shade side */}
          <ambientLight intensity={1.5} />
          <directionalLight position={[-3, 4, 5]} intensity={1.2} />
          {/* a soft shadow on the ground */}
          <mesh position={[0, -1.12, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.8, 1]}>
            <circleGeometry args={[0.85, 48]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.28} />
          </mesh>
          <Pelican animate={!still} />
        </Canvas>
      </Quiet>
    </div>
  )
}
