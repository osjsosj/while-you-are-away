// Generates scene.rml for Perigan. The output is plain Rive markup; this script only keeps
// the many keyframes and their easing consistent. Run: node tools/build-scene.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const EASE = {
  io: [0.42, 0, 0.58, 1],
  out: [0, 0, 0.58, 1],
  in: [0.42, 0, 1, 1],
  soft: [0.33, 0, 0.67, 1],
}

// one keyframe: [frame, value, ease] where ease is a key of EASE, 'lin' or 'hold'
function key(frame, value, ease = 'io') {
  if (ease === 'hold' || ease === 'lin') {
    return `<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="${ease === 'lin' ? 'linear' : 'hold'}"/>`
  }
  const [x1, y1, x2, y2] = EASE[ease]
  return `<KeyFrameDouble frame="${frame}" value="${value}" interpolationType="cubic"><CubicEaseInterpolator x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></KeyFrameDouble>`
}

const P = { x: 13, y: 14, rotation: 15, scaleX: 16, scaleY: 17, opacity: 18 }

// animation: { id, name, duration, loop, tracks: { objectId: { prop: [[frame, value, ease], ...] } } }
function animation({ id, name, duration, loop, tracks }) {
  const objects = Object.entries(tracks).map(([objectId, props]) => {
    const keyed = Object.entries(props).map(([prop, frames]) =>
      `<KeyedProperty propertyKey="${P[prop]}">${frames.map((f) => key(...f)).join('')}</KeyedProperty>`).join('\n')
    return `<KeyedObject objectId="${objectId}">\n${keyed}\n</KeyedObject>`
  }).join('\n')
  return `<LinearAnimation loopValue="${loop}" duration="${duration}" name="${name}" id="${id}">\n${objects}\n</LinearAnimation>`
}

// alternate between two values every `step` frames, for flapping
function flap(from, to, a, b, step) {
  const out = []
  let up = true
  for (let f = from; f <= to; f += step) { out.push([f, up ? a : b, 'soft']); up = !up }
  return out
}

const solid = (c) => `<SolidColor colorValue="${c}"/>`
const radial = (sx, sy, ex, ey, stops) => `<RadialGradient startX="${sx}" startY="${sy}" endX="${ex}" endY="${ey}">${stops.map(([c, p]) => `<GradientStop colorValue="${c}" position="${p}"/>`).join('')}</RadialGradient>`
const linear = (sx, sy, ex, ey, stops) => `<LinearGradient startX="${sx}" startY="${sy}" endX="${ex}" endY="${ey}">${stops.map(([c, p]) => `<GradientStop colorValue="${c}" position="${p}"/>`).join('')}</LinearGradient>`
const fill = (paint) => `<Fill>${paint}</Fill>`
const soft = (color, strength, extra = '') => `<Fill fillRule="clockwise">${solid(color)}<Feather strength="${strength}" ${extra}/></Fill>`
const inner = (color, strength, ox, oy) => `<Fill fillRule="clockwise">${solid(color)}<Feather inner="true" strength="${strength}" offsetX="${ox}" offsetY="${oy}"/></Fill>`
const ellipse = (w, h) => `<Ellipse width="${w}" height="${h}"/>`
const path = (pts, closed = true) => `<PointsPath isClosed="${closed}" isClockwise="true">${pts.map(([x, y, r = 0]) => `<StraightVertex x="${x}" y="${y}" radius="${r}"/>`).join('')}</PointsPath>`
const shape = (name, attrs, body) => `<Shape ${attrs} name="${name}">${body}</Shape>`

// palette: warm cream, ivory, beige, light brown, one amber accent
const C = {
  ivory: 'FFFFFDF7', cream: 'FFFBF1DE', beige: 'FFE9D2AE', shade: '48A27B4E',
  wingTop: 'FFFDF6E8', wingBot: 'FFE2C7A0', wingFarTop: 'FFF0E2C9', wingFarBot: 'FFD4B48A',
  billTop: 'FFF9CF6E', billBot: 'FFE6A03A', hook: 'FFD08222', seam: 'FFC98A30',
  pouchIn: 'FFFFF1D4', pouchOut: 'FFF0C890',
  irisIn: 'FF8A5634', irisOut: 'FF2E180C', lash: 'FF3A2414',
  blush: '70F4A08A', bagTop: 'FFD9B48C', bagBot: 'FFB98B5E', flap: 'FFB07F52', strap: 'FFA97A4E',
  amber: 'FFF0B341', amberDeep: 'FFC98A1E', paper: 'FFFFFDF7', paperEdge: 'FFE6D9C2',
  foot: 'FFF0AE44', footDeep: 'FFD8902C', shadow: '6E2E2016',
}

const eye = (name, x, y, w, h) => `
<Node x="${x}" y="${y}" name="${name}">
  ${shape(`${name} Glint`, 'x="-0.22w" y="0"'.replace('-0.22w', -w * 0.2).replace('y="0"', `y="${-h * 0.24}"`), ellipse(w * 0.32, w * 0.32) + fill(solid('FFFFFFFF')))}
  ${shape(`${name} Spark`, `x="${w * 0.2}" y="${h * 0.2}"`, ellipse(w * 0.15, w * 0.15) + fill(solid('D9FFFFFF')))}
  ${shape(`${name} Iris`, '', ellipse(w, h) + fill(radial(-w * 0.15, -h * 0.2, w * 0.55, h * 0.6, [[C.irisIn, 0], [C.irisOut, 1]])))}
</Node>`

const smileArc = (name, x, w) => shape(name, `x="${x}" y="0"`,
  path([[-w / 2, 5], [0, -8, 9], [w / 2, 5]], false) + `<Stroke thickness="6" cap="round" join="round">${solid(C.lash)}</Stroke>`)

const scene = `<Rive version="1" kind="fragment">
<Artboard defaultStateMachineId="1:100" styleId="1:99" width="500" height="500" name="Perigan" id="1:98">
<LayoutComponentStyle name="Perigan Style" id="1:99"/>

<Node x="232" y="410" name="Perigan" id="1:1">
<Node name="Hop" id="1:4">
<Node name="Body Rig" id="1:2">

<Node name="Head" id="1:3">
  <Node y="-172" opacity="0" name="Eyes Happy" id="1:20">
    ${smileArc('Smile Near', 14, 30)}
    ${smileArc('Smile Far', 74, 24)}
  </Node>
  <Node y="-172" name="Eyes Open" id="1:21">
    <Node name="Gaze" id="1:24">
      ${eye('Eye Near', 14, 0, 40, 48)}
      ${eye('Eye Far', 74, 2, 33, 42)}
    </Node>
  </Node>
  <Node x="44" y="-143" name="Blush" id="1:35">
    ${shape('Blush Near', 'x="-52" y="3"', ellipse(36, 18) + soft(C.blush, 7))}
    ${shape('Blush Far', 'x="48" y="-4"', ellipse(22, 13) + soft(C.blush, 6))}
  </Node>

  <Node x="50" y="-140" name="Beak" id="1:30">
    ${shape('Bill Glint', 'x="30" y="-11" rotation="-0.06"', ellipse(16, 5) + fill(solid('F2FFFFFF')))}
    ${shape('Bill Shine', 'x="58" y="-9" rotation="-0.05"', ellipse(54, 6) + soft('80FFFFFF', 2))}
    ${shape('Bill Hook', '', path([[112, -12, 10], [134, -10, 14], [146, 4, 10], [141, 21, 6], [133, 13, 6], [118, 9, 6]]) + fill(linear(0, -8, 0, 26, [[C.billBot, 0], [C.hook, 1]])))}
    ${shape('Nostril', '', path([[16, -7], [46, -9]], false) + `<Stroke thickness="2.2" cap="round">${solid(C.seam)}</Stroke>`)}
    ${shape('Bill Seam', '', path([[-12, 11], [62, 12, 30], [127, 17]], false) + `<Stroke thickness="2.5" cap="round">${solid(C.seam)}</Stroke>`)}
    ${shape('Upper Bill', '', path([[-16, -18, 9], [72, -20, 44], [120, -12, 16], [128, 4, 6], [120, 14, 8], [62, 13, 30], [-16, 15, 9]])
      + fill(linear(0, -20, 0, 16, [[C.billTop, 0], [C.billBot, 1]])))}
    <Node name="Pouch" id="1:33">
      ${shape('Pouch Sac', '', path([[-12, 6, 10], [62, 10, 30], [126, 18, 12], [116, 46, 30], [68, 80, 40], [12, 68, 30], [-14, 30, 14]])
        + fill(radial(36, 28, 120, 90, [[C.pouchIn, 0], [C.pouchOut, 1]])) + inner('3A9C6A30', 14, -8, -10))}
    </Node>
  </Node>
</Node>

<Node x="-94" y="-140" name="Wing Near" id="1:40">
  ${shape('Wing Near Shape', 'x="-2" y="30" rotation="0.32"', ellipse(46, 72)
    + fill(linear(0, -46, 0, 46, [[C.wingTop, 0], [C.wingBot, 1]])) + inner('339C7848', 10, -6, -8))}
</Node>

${shape('Bag Strap', '', path([[-88, -66], [-100, -136, 50], [-76, -214]], false) + `<Stroke thickness="7" cap="round" join="round">${solid(C.strap)}</Stroke>`)}

<Node x="-60" y="-58" rotation="-0.08" name="Bag" id="1:45">
  ${shape('Wax Seal', 'x="0" y="-5"', ellipse(17, 17) + fill(radial(-3, -3, 9, 9, [[C.amber, 0], [C.amberDeep, 1]])) + `<Stroke thickness="2">${solid(C.amberDeep)}</Stroke>`)}
  ${shape('Bag Flap', '', path([[-35, -23, 6], [35, -23, 6], [33, -4, 8], [0, 9, 12], [-33, -4, 8]]) + fill(solid(C.flap)))}
  ${shape('Letter', 'x="4" y="-28" rotation="-0.14"', `<Rectangle width="42" height="22" cornerRadiusTL="2"/>` + fill(solid(C.paper)) + `<Stroke thickness="1.2">${solid(C.paperEdge)}</Stroke>`)}
  ${shape('Bag Body', '', `<Rectangle width="72" height="54" cornerRadiusTL="13"/>` + fill(linear(0, -27, 0, 27, [[C.bagTop, 0], [C.bagBot, 1]])))}
</Node>

${shape('Tuft Small', 'x="10" y="-243" rotation="0.42"', ellipse(15, 26) + fill(linear(0, -13, 0, 13, [[C.ivory, 0], [C.beige, 1]])))}
${shape('Tuft Big', 'x="-6" y="-246" rotation="-0.38"', ellipse(19, 32) + fill(linear(0, -16, 0, 16, [[C.ivory, 0], [C.beige, 1]])))}
${shape('Body Glint', 'x="-62" y="-205" rotation="-0.65"', ellipse(24, 12) + fill(solid('F7FFFFFF')))}
${shape('Body Highlight', 'x="-50" y="-196" rotation="-0.6"', ellipse(64, 34) + soft('A6FFFFFF', 11))}
${shape('Belly', 'x="16" y="-92"', ellipse(142, 118) + soft('E6FFFEFA', 22))}
${shape('Rim Light', 'x="0" y="-128"', ellipse(226, 230) + `<Stroke thickness="3.5" cap="round">${solid('E6FFFFFF')}<TrimPath start="0.56" end="0.8"/><Feather strength="1.5"/></Stroke>`)}
<Shape x="0" y="-128" name="Body" id="1:50">
  ${ellipse(232, 236)}
  ${fill(radial(-38, -52, 150, 62, [[C.ivory, 0], [C.cream, 0.5], [C.beige, 1]]))}
  ${inner(C.shade, 34, -16, -18)}
</Shape>

${shape('Body Depth', 'x="2" y="-120"', ellipse(230, 234) + fill(linear(0, -60, 0, 117, [['FFE8CFA8', 0], ['FFCFA678', 1]])))}

<Node x="92" y="-182" name="Wing Far" id="1:41">
  ${shape('Wing Far Shape', 'x="8" y="30" rotation="-0.32"', ellipse(42, 68) + fill(linear(0, -34, 0, 34, [[C.wingFarTop, 0], [C.wingFarBot, 1]])))}
</Node>

${shape('Foot Near', 'x="-36" y="-5"', ellipse(46, 17) + fill(linear(0, -8, 0, 8, [[C.foot, 0], [C.footDeep, 1]])))}
${shape('Foot Far', 'x="36" y="-4"', ellipse(40, 15) + fill(linear(0, -8, 0, 8, [[C.foot, 0], [C.footDeep, 1]])))}

</Node>
</Node>
</Node>

<Node x="242" y="418" name="Shadow" id="1:60">
  ${shape('Shadow Shape', '', ellipse(204, 26) + soft(C.shadow, 12))}
</Node>

<StateMachine name="PeriganMain" id="1:100">
  <StateMachineTrigger name="happy" id="1:102"/>
  <StateMachineLayer name="Mood" id="1:101">
    <AnyState x="200" y="-120"/>
    <ExitState x="500" y="-120"/>
    <EntryState x="0" y="0"><StateTransition stateToId="1:110"/></EntryState>
    <AnimationState x="200" y="0" animationId="1:120" id="1:110">
      <StateTransition stateToId="1:111" duration="120"><TransitionTriggerCondition inputId="1:102"/></StateTransition>
    </AnimationState>
    <AnimationState x="400" y="0" animationId="1:121" id="1:111">
      <StateTransition stateToId="1:110" duration="250" enableExitTime="true" exitTimeIsPercetange="true" exitTime="100"/>
    </AnimationState>
  </StateMachineLayer>
  <StateMachineListenerSingle targetId="1:50" listenerTypeValue="click" name="Tap Perigan" id="1:103">
    <ListenerTriggerChange inputId="1:102"/>
  </StateMachineListenerSingle>
</StateMachine>

${animation({
  id: '1:120', name: 'idle', duration: 180, loop: 'loop',
  tracks: {
    '1:2': { scaleY: [[0, 1], [90, 1.03], [180, 1]], scaleX: [[0, 1], [90, 0.986], [180, 1]] },
    '1:3': { y: [[0, 0], [100, -3], [180, 0]] },
    '1:21': { scaleY: [[0, 1, 'hold'], [112, 1, 'lin'], [116, 0.08, 'lin'], [121, 1, 'hold'], [180, 1, 'hold']] },
    '1:24': { x: [[0, 0], [40, 2.5], [72, 2.5], [112, -2], [150, -2], [180, 0]] },
    '1:40': { rotation: [[0, 0], [90, 0.07], [180, 0]] },
    '1:41': { rotation: [[0, 0], [90, -0.06], [180, 0]] },
    '1:30': { rotation: [[0, 0], [90, -0.025], [180, 0]] },
    '1:60': { scaleX: [[0, 1], [90, 1.025], [180, 1]] },
  },
})}

${animation({
  id: '1:121', name: 'happy', duration: 120, loop: 'oneShot',
  tracks: {
    '1:4': { y: [[0, 0], [8, 4, 'out'], [22, -48, 'in'], [36, 0, 'out'], [44, 2, 'out'], [58, -36, 'in'], [72, 0, 'out'], [84, 0, 'hold'], [120, 0, 'hold']] },
    '1:2': {
      scaleY: [[0, 1], [8, 0.86, 'out'], [20, 1.1], [33, 1.02, 'in'], [37, 0.84, 'out'], [47, 1.07], [58, 1.04, 'in'], [71, 1.02, 'in'], [74, 0.88, 'out'], [86, 1.03], [100, 1], [120, 1, 'hold']],
      scaleX: [[0, 1], [8, 1.09, 'out'], [20, 0.94], [33, 0.99, 'in'], [37, 1.11, 'out'], [47, 0.96], [58, 0.98, 'in'], [71, 0.99, 'in'], [74, 1.08, 'out'], [86, 0.98], [100, 1], [120, 1, 'hold']],
    },
    '1:40': { rotation: [...flap(0, 84, -1.05, 0.15, 6), [96, 0], [120, 0, 'hold']] },
    '1:41': { rotation: [...flap(0, 84, 1.3, -0.1, 6), [96, 0], [120, 0, 'hold']] },
    '1:21': { opacity: [[0, 1, 'hold'], [4, 0, 'hold'], [100, 0, 'lin'], [108, 1, 'hold'], [120, 1, 'hold']] },
    '1:20': { opacity: [[0, 0, 'hold'], [4, 1, 'hold'], [100, 1, 'lin'], [108, 0, 'hold'], [120, 0, 'hold']] },
    '1:35': { scaleX: [[0, 1], [10, 1.3], [96, 1.3], [110, 1], [120, 1, 'hold']], scaleY: [[0, 1], [10, 1.3], [96, 1.3], [110, 1], [120, 1, 'hold']] },
    '1:30': { rotation: [[0, 0], [10, -0.13], [40, -0.06], [72, -0.13], [100, 0], [120, 0, 'hold']] },
    '1:33': { scaleY: [[0, 1], [12, 1.14], [36, 0.94], [58, 1.12], [84, 1], [120, 1, 'hold']] },
    '1:60': {
      scaleX: [[0, 1], [8, 1.08, 'out'], [22, 0.68, 'in'], [36, 1.1, 'out'], [44, 1], [58, 0.76, 'in'], [72, 1.08, 'out'], [86, 1], [120, 1, 'hold']],
      opacity: [[0, 1], [22, 0.55, 'in'], [36, 1, 'out'], [58, 0.62, 'in'], [72, 1, 'out'], [120, 1, 'hold']],
    },
  },
})}

</Artboard>
</Rive>
`

const out = fileURLToPath(new URL('../scene.rml', import.meta.url))
writeFileSync(out, scene)
console.log('wrote', out)
