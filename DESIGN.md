---
name: While You're Away
description: Letters for the time apart. A night sky, one warm light, and paper that glows.
colors:
  night: "#050A19"
  night-mid: "#0B1430"
  night-high: "#18234A"
  night-surface: "#101A33"
  light: "#F0B341"
  light-hi: "#F6C25E"
  paper: "#F6F3EA"
  paper-bright: "#FFFDF8"
  paper-line: "#DDD8C9"
  moonlit: "#F4F1E6"
  mist: "#E9ECF2"
  mist-soft: "#C9D0DC"
  mist-muted: "#A9B3C6"
  ink: "#1B2536"
  ink-soft: "#3D4859"
  ink-muted: "#4E596B"
  ink-on-light: "#101A33"
  slate-edge: "#46557A"
  danger: "#F2A99E"
  note-yellow: "#FFF6C9"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "72px"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
  letter:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  hand:
    fontFamily: "Caveat, Segoe Print, cursive"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sheet: "6px"
  field: "10px"
  row: "12px"
  card: "14px"
  bubble: "18px"
  device: "46px"
  pill: "999px"
spacing:
  gutter: "20px"
  field-gap: "22px"
  card: "24px"
  paper: "28px"
  scene-x: "48px"
  scene-y: "96px"
components:
  button-primary:
    backgroundColor: "{colors.light}"
    textColor: "{colors.ink-on-light}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.light-hi}"
    textColor: "{colors.ink-on-light}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-bright}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    padding: "14px 26px"
    height: "52px"
  pill:
    backgroundColor: "rgba(10, 18, 38, 0.35)"
    textColor: "{colors.mist-soft}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
    height: "44px"
  pill-selected:
    backgroundColor: "{colors.moonlit}"
    textColor: "{colors.ink-on-light}"
  input:
    backgroundColor: "rgba(5, 10, 25, 0.5)"
    textColor: "{colors.mist}"
    rounded: "{rounded.field}"
    padding: "11px 14px"
    height: "48px"
  card:
    backgroundColor: "rgba(233, 236, 242, 0.05)"
    textColor: "{colors.mist}"
    rounded: "{rounded.card}"
    padding: "{spacing.card}"
  paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    padding: "{spacing.paper}"
  letter-row:
    backgroundColor: "rgba(255, 255, 255, 0.03)"
    textColor: "{colors.mist-muted}"
    rounded: "{rounded.row}"
    padding: "12px 16px"
    height: "60px"
  letter-row-new:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  chat-bubble-guide:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "14px 18px"
---

# Design System: While You're Away

## Overview

**Creative North Star: "A Lamp Left On"**

Someone is still thinking of you in the dark. The whole product lives at night: a deep navy sky, cool moonlit text, and a single warm amber light that marks the one thing worth doing next. Letters are the only bright, warm surfaces. They sit on the night like paper under a desk lamp, with a faint amber halo around them. Everything else is quiet chrome that gets out of the way.

Time is the material. The landing walks through a day, from late night through before dawn, morning, afternoon and dusk, back to evening, with a sundial marking the hour and the sky changing behind each scene. The builder, diary and recipient box stay in the night. Motion is slow and unhurried (1000ms reveals, 250ms lifts, a gentle `cubic-bezier(0.2, 0.7, 0.2, 1)` ease) and turns off completely under reduced motion.

The letter itself is crafted and tactile: paper variants, washi tape, stamps, postmarks, pressed flowers, die-cut vinyl stickers and handwritten Caveat notes. The interface around it is soft and calm, never pushy.

**Key Characteristics:**
- Night-first. Navy gradients from `night` to `night-surface`, never flat black.
- One warm light. Amber (`light`) is the single accent: primary action, focus, today's letter, the seal.
- Paper glows. Cream paper surfaces carry ink text and an amber halo.
- Literata for anything the heart says, Schibsted Grotesk for anything the interface says.
- Pills and soft corners, 44px+ touch targets, mobile-first column widths (560–720px).
- Unhurried motion, fully disabled under `prefers-reduced-motion`.

## Colors

A night palette of navy, moonlit mist and cream paper, lit by one amber lamp.

### Primary
- **Lamplight Amber** (`light`): The one warm light. Primary buttons, focus rings, the progress meter, the "new today" dot, the active tab underline, the wax seal on the recipient's first open, text selection. Hover brightens to **Lit Amber** (`light-hi`).

### Neutral
- **Midnight** (`night`): The base of every night gradient and the PWA theme color. Gradients run `night` → `night-mid` → `night-surface` (or `night-high` on the hero).
- **Moonlit White** (`moonlit`): Headlines and serif titles on night. It's warmer than mist, so headings feel lit rather than clinical.
- **Mist** (`mist`), **Soft Mist** (`mist-soft`), **Muted Mist** (`mist-muted`): Body, secondary and tertiary text on night. Hairlines on night are mist at 10–14% alpha.
- **Letter Paper** (`paper`), **Bright Paper** (`paper-bright`), **Paper Rule** (`paper-line`): Letter surfaces, the guide's chat bubbles, today's row in the box, and the landing's start form. Rules and dividers on paper use `paper-line`.
- **Ink** (`ink`), **Soft Ink** (`ink-soft`), **Muted Ink** (`ink-muted`): Text on paper and on the landing's daylight scenes. `ink` is also the secondary button on light surfaces.
- **Night Ink** (`ink-on-light`): Text on amber buttons and selected pills.
- **Slate Edge** (`slate-edge`): The resting border of pills and swatches on night.
- **Soft Coral** (`danger`): Error text and invalid field borders on night. It stays gentle, never alarm red.
- **Note Yellow** (`note-yellow`): Folded handwritten notes inside letters only.

### Named Rules
**The One Lamp Rule.** Amber is the only accent. One amber primary action per view; everything else is mist, paper or ink. If two things glow, neither does.

**The Paper Is the Warmth Rule.** Warm, bright surfaces are reserved for letters and the things that hold the sender's words. UI chrome on night stays translucent mist (`rgba(233, 236, 242, 0.03–0.08)`), never cream.

**The Retired Rose Rule.** The cream-and-rose palette from before the night redesign (warm creams, dusty rose, brown text, DM Sans, Playfair Display) has been removed from the code. Don't bring it back. `src/index.css` holds only the night body background, and the Tailwind theme stays empty.

## Typography

**Display Font:** Literata (with Georgia, serif)
**Body Font:** Schibsted Grotesk (with system-ui, sans-serif)
**Hand Font:** Caveat (with Segoe Print, cursive)

**Character:** Literata is a bookish, warm text serif that carries both headlines and the letters themselves. Schibsted Grotesk is a plain, friendly grotesk for interface text. Caveat appears only where a person would actually write by hand.

### Hierarchy
- **Display** (400, 72px, 1.05, -0.03em): The landing hero only. 46px on phones.
- **Headline** (400, 40px, 1.1, -0.02em): Page and scene titles (landing h2s, builder h1s, the box's first-open title). 32px on phones; the landing's closing "Start" headline goes to 52px. Always `text-wrap: balance`.
- **Title** (500, 20–24px): Section headings, step titles, the brand wordmark (16–19px).
- **Letter** (400, 18–21px, 1.55–1.8): The letter body and quoted examples. This is where the sender's words live.
- **Body** (400, 16–18px, 1.6): Interface prose. Ledes run 17–20px, capped at 28–36em. Legal copy is 16px/1.7 at 64ch.
- **Label** (600, 15–16px): Field labels, button text. Meta and notes are 13–14px in muted mist or ink.
- **Hand** (500, 19–32px): Folded notes, ticket lines and scrapbook captions only.

### Named Rules
**The Heart and Hands Rule.** Serif for what the sender or the product says to a person (headlines, letters, the guide's chat replies, row titles). Sans for what the interface says (labels, buttons, help, meta). Never set a letter in sans or a button in serif.

**The No Tracking Rule.** Headlines get slight negative tracking (-0.01 to -0.03em). Nothing is uppercase-tracked. Labels stay sentence case.

## Layout

A single, centered column built for one hand on a phone. The builder pages use a 720px column (560px for narrow steps like checkout and sign-in) with a 20px gutter. The recipient box is a 560px column. The landing is a stack of full-height scenes (`min-height: 100dvh`, `scroll-snap-type: y proximity`), each a 1200px container with 96px vertical and 48px horizontal padding. The "how it works" scene places four real phone screens in a row, which stack on small screens.

Sticky, translucent bars (navy at 82–92% alpha with a 12px backdrop blur and a mist hairline) hold the step indicator in the builder and the tabs in the box. On phones under 560px, the step list collapses to the current step only.

Rhythm is generous but not airy: fields sit 22px apart, cards pad 24px, paper pads 28px. Breakpoints are 900px (or under 760px tall), 720px, 640px, 560px and 420px.

**The Thumb Rule.** Every interactive element is at least 44px tall. Primary buttons and inputs are 48–52px.

## Elevation & Depth

On night, depth comes from light, not from shadow. Surfaces at rest are flat translucent mist with a hairline border. Paper is lifted twice: a wide amber halo (light reaching the page) plus a deep, soft drop shadow beneath it. Shadows appear on chrome only in response to state: an amber bloom under a hovered primary button and a 1–2px lift.

### Shadow Vocabulary
- **Paper glow** (`box-shadow: 0 0 70px rgba(240, 179, 65, 0.08), 0 24px 60px -24px rgba(0, 0, 0, 0.7)`): Any paper surface on night.
- **Lamp bloom** (`box-shadow: 0 12px 30px -12px rgba(240, 179, 65, 0.6)`): Primary button hover.
- **Focus halo** (`box-shadow: 0 0 0 4px rgba(240, 179, 65, 0.14)`): Focused inputs on night, with an amber border.
- **Device** (`box-shadow: 0 34px 80px -24px rgba(16, 26, 51, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.08)`): Phone frames on the landing.
- **Sticker lift** (four 1.5px white `drop-shadow`s plus `0 3px 3px rgba(40, 28, 16, 0.22)`): The die-cut vinyl edge on stickers.

### Named Rules
**The Light, Not Shadow Rule.** On night, a surface earns prominence by being lit (paper, amber), not by casting a darker shadow. Never put a heavy shadow on a translucent mist card.

## Shapes

Soft and rounded, never sharp, never bubbly. Actions and choices are full pills (999px). Containers step up in radius by size: paper sheets 6px, inputs 10px, rows and paper cards 12px, cards 14px, chat bubbles 18px (with the guide's bubble tucked to 6px at the bottom-left corner), and phone frames 46px. Small status dots are circles with a 3px amber ring. Locked letters use a dashed border. The tactile pieces inside a letter (stamps, tape, postmarks, notes) are slightly rotated (1–14°), so the page looks handled, not printed.

## Components

### Buttons
Soft and unhurried. Pills that lift gently and never shout.
- **Shape:** Full pill (999px), 52px tall; the small size is 44px.
- **Primary:** Lamplight amber with night ink text, semibold 16–17px, 14px × 26px padding.
- **Hover / Focus:** Brightens to lit amber, rises 2px, and blooms an amber shadow over 250ms. Active returns to rest. Focus is a 2px amber outline offset 3px.
- **Ink:** Ink on light surfaces (the landing's start form). Hover darkens to `#26334D`.
- **Ghost / Outline:** Transparent with a 1.5px mist border at 45–70% alpha. Hover fills with mist at 8–10%.
- **Text link:** Mist with a 1.5px underline offset 5–6px. On hover, the underline turns amber.
- **Disabled:** Slate fill (`#4A5168`) with gray text, no lift.

### Chips / Pills
- **Style:** 44px pill, 1.5px slate-edge border, navy at 35% fill, soft mist text.
- **State:** Hover brightens the border to `#A9B4CF`. Selected (`aria-pressed`) fills moonlit with night ink text. On light scenes it's inverted: a gray border on translucent white, and selected fills with ink.

### Cards / Containers
- **Corner Style:** 14px for mist cards, 12px for paper.
- **Background:** Mist cards are `rgba(233, 236, 242, 0.05)` with a mist hairline. Paper cards are letter paper with ink text.
- **Shadow Strategy:** Mist cards have none. Paper uses the paper glow.
- **Internal Padding:** 24px for cards, 28px for paper.

### Inputs / Fields
- **Style:** 48px tall, 10px radius, 1.5px mist border at 28% alpha, navy at 50% fill, 16px text (never smaller, so iOS doesn't zoom). Labels are 15px semibold, above the field; help text is 14px muted, between them.
- **Focus:** The border turns amber with the focus halo. On paper, the border turns ink with an ink halo at 12%.
- **Error:** Soft coral border and text, set through `aria-invalid`.

### Navigation
- **Builder top bar:** Sticky translucent navy, serif wordmark on the left, step list on the right (13px muted mist, the current step semibold mist, steps joined by hairlines).
- **Box tabs:** Sticky translucent navy, 48px tabs in 15px medium muted mist. The selected tab is mist with a 2px amber underline.

### Letter Row (signature)
Each letter in the recipient's box is a 60px row: 12px radius, a faint mist fill and hairline, a serif title over a 13px muted subline. Today's new letter becomes a **paper row** (cream, ink text), the only lit row in the list. Locked letters dim and take a dashed border. Rows lift 1px on hover.

### Letter Paper (signature)
The letter itself: paper variants (night, scrapbook, flowers, quiet) recolor the paper, tape and postmark. A head line carries the date meta, stamp and postmark. The title is Literata 26px and the body is Literata 18px/1.8. Decorations (tape, stamps, pressed flowers, Caveat notes on note-yellow, die-cut stickers) are rotated slightly and carry their own small drop shadows.

### Guide Chat
The planning guide's messages are paper bubbles in Literata 17px with ink text, tucked to the bottom-left. The sender's messages sit on night. The composer is a 16px-radius textarea with a 52px round amber send button.

### The Seal (signature)
On the recipient's first open: a 96px amber wax seal with a radial gradient, an inner ring, and a slow 3s breathing glow. It's the brightest thing in the product, and it appears exactly once.

## Do's and Don'ts

### Do:
- **Do** build every new screen on the night gradient (`night` → `night-mid` → `night-surface`) and reserve warm surfaces for paper.
- **Do** keep amber to one primary action per view, plus focus and "today" signals.
- **Do** set headlines and letter text in Literata, and interface text in Schibsted Grotesk.
- **Do** keep touch targets at 44px or more, and text inputs at 16px.
- **Do** use the shared ease `cubic-bezier(0.2, 0.7, 0.2, 1)`, and kill all animation and transition under `prefers-reduced-motion`.
- **Do** use a 2px amber `:focus-visible` outline offset 3px on night.
- **Do** keep text visible at rest. Scroll reveals move the text, they never hide it.

### Don't:
- **Don't** use the retired cream/rose palette, DM Sans, or Playfair Display in new work.
- **Don't** introduce a second accent color, or tint UI chrome cream or amber.
- **Don't** put heavy shadows on translucent night cards. Light lifts surfaces here, shadow doesn't.
- **Don't** use Caveat outside handwritten notes, tickets and scrapbook captions.
- **Don't** uppercase or letter-space labels.
- **Don't** use flat pure black (`#000`) backgrounds or alarm-red errors.
