---
name: While You're Away
description: Letters for the time apart. A night sky, one warm light, and paper that glows.
colors:
  night: "#050A19"
  night-mid: "#0B1430"
  night-surface: "#101A33"
  night-high: "#18234A"
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
  field-edge: "#9AA4B2"
  slate-edge: "#46557A"
  danger: "#F2A99E"
  danger-paper: "#B2382C"
  note-yellow: "#FFF6C9"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(44px, 12.4vw, 96px)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(44px, 9vw, 88px)"
    fontWeight: 800
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  section:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 3.2vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(22px, 1.8vw, 26px)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  statement:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(24px, 2.4vw, 34px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.4
  small:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  letter-title:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "26px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0em"
  letter:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0em"
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
  panel: "16px"
  bubble: "18px"
  block: "20px"
  shot: "24px"
  pill: "999px"
spacing:
  gut: "clamp(20px, 4.4vw, 64px)"
  gap: "clamp(96px, 12vw, 176px)"
  tile-gap: "8px"
  gutter: "20px"
  field-gap: "22px"
  card: "24px"
  paper: "28px"
components:
  button-primary:
    backgroundColor: "{colors.light}"
    textColor: "{colors.ink-on-light}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "16px 30px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.light-hi}"
    textColor: "{colors.ink-on-light}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "#FBFCFD"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "16px 30px"
    height: "56px"
  button-ink-hover:
    backgroundColor: "#26334D"
  toggle:
    backgroundColor: "transparent"
    textColor: "{colors.moonlit}"
    rounded: "{rounded.pill}"
    padding: "10px 18px"
    height: "44px"
  toggle-pressed:
    backgroundColor: "{colors.moonlit}"
    textColor: "{colors.ink-on-light}"
  segment:
    backgroundColor: "transparent"
    textColor: "{colors.mist-soft}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
    height: "44px"
  segment-selected:
    backgroundColor: "{colors.moonlit}"
    textColor: "{colors.ink-on-light}"
  switch:
    backgroundColor: "{colors.night-high}"
    rounded: "{rounded.pill}"
    width: "56px"
    height: "32px"
  switch-on:
    backgroundColor: "{colors.light}"
  control-panel:
    backgroundColor: "{colors.night-mid}"
    rounded: "{rounded.panel}"
    padding: "12px"
  calendar-day:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.mist-muted}"
    rounded: "{rounded.field}"
    padding: "7px 8px"
    height: "56px"
  calendar-day-lit:
    backgroundColor: "{colors.light}"
    textColor: "{colors.ink-on-light}"
  calendar-day-seal:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
  comment:
    backgroundColor: "{colors.night-mid}"
    textColor: "{colors.moonlit}"
    rounded: "{rounded.panel}"
    padding: "18px 20px"
  footer-tile:
    backgroundColor: "{colors.night-mid}"
    textColor: "{colors.mist}"
    rounded: "{rounded.card}"
    padding: "24px"
    height: "220px"
  footer-tile-word:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.moonlit}"
  footer-tile-go:
    backgroundColor: "{colors.night-high}"
    textColor: "{colors.moonlit}"
  paper-panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.block}"
    padding: "36px"
  input-paper:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "12px 14px"
    height: "48px"
  pill-paper:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
    height: "44px"
  pill-paper-selected:
    backgroundColor: "{colors.ink}"
    textColor: "#FBFCFD"
  pill-night:
    backgroundColor: "rgba(10, 18, 38, 0.35)"
    textColor: "{colors.mist-soft}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
    height: "44px"
  pill-night-selected:
    backgroundColor: "{colors.moonlit}"
    textColor: "{colors.ink-on-light}"
  input-night:
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

Someone is still thinking of you in the dark. The whole product lives at night: a deep navy sky, cool moonlit text, and a single warm amber light that marks the one thing worth doing next. Letters are the only bright, warm surfaces. They sit on the night like paper under a desk lamp. Everything else is quiet chrome that gets out of the way.

Time is the material. The public site (home, services, about, contact) shows the time apart as a calendar of weeks: each day that holds a letter is lit amber, and the day you meet again is a square of letter paper. The site is set flat on midnight with tone-step surfaces, in one face, Schibsted Grotesk, with heavy 800 headlines at tight tracking. Literata appears only where a letter appears. The writing app (builder, diary, recipient box) stays on the night gradient, with glowing paper and soft translucent chrome. Motion is unhurried and turns off completely under reduced motion.

The letter itself is crafted and tactile: paper variants, washi tape, stamps, postmarks, pressed flowers, die-cut vinyl stickers and handwritten Caveat notes. The interface around it is soft and calm, never pushy.

**Key Characteristics:**
- Night-first. Midnight (`night`) is the ground everywhere. Flat tone steps on the public site; a `night` → `night-mid` → `night-surface` gradient in the app. Never flat black.
- One warm light. Amber (`light`) is the single accent: the one primary action, focus, and "today" or lit letter days.
- Paper is the warmth. Cream paper carries the sender's words in ink.
- One face for everything the site says, Schibsted Grotesk; Literata only for the letters themselves.
- Pills and soft tiles, 44px+ touch targets, page margins that grow with the viewport (`gut`).
- Unhurried motion, fully disabled under `prefers-reduced-motion`.

## Colors

A night palette of navy, moonlit mist and cream paper, lit by one amber lamp.

### Primary
- **Lamplight Amber** (`light`): The one warm light. The primary button, focus rings, lit letter days in the calendar, the wordmark dot, the open FAQ dot, the underline on active and highlighted links, the price figure, the switch when on, the seal, text selection. Hover brightens to **Lit Amber** (`light-hi`).

### Neutral
- **Midnight** (`night`): The page ground on the public site and the base of every app gradient. Also the PWA theme color.
- **Deep Night** (`night-mid`), **Night Surface** (`night-surface`), **High Night** (`night-high`): The public site's tone steps. `night-mid` holds panels, comments and footer tiles; `night-surface` holds calendar days, controls inside panels, image wells and the sticky letter stage; `night-high` is the switch track, comment initials, the slider track and the footer's call-to-action tile (hover `#22305C`).
- **Moonlit White** (`moonlit`): Headlines and emphasized text on night. Warmer than mist, so headings feel lit. Also the selected fill of segments and toggles.
- **Mist** (`mist`), **Soft Mist** (`mist-soft`), **Muted Mist** (`mist-muted`): Body, secondary and tertiary text on night. Calendar days after the reunion step down to `#7F8AA0`.
- **Letter Paper** (`paper`), **Bright Paper** (`paper-bright`), **Paper Rule** (`paper-line`): Letter surfaces, the contact form, the sealed reunion day, the sealed-letter kind, the guide's chat bubbles and today's row in the box.
- **Ink** (`ink`), **Soft Ink** (`ink-soft`), **Muted Ink** (`ink-muted`): Text on paper. `ink` is also the button and selected pill on paper.
- **Night Ink** (`ink-on-light`): Text on amber and moonlit fills.
- **Field Edge** (`field-edge`): The 1.5px resting border of inputs and pills on paper.
- **Slate Edge** (`slate-edge`): The resting border of pills and swatches on night, in the app.
- **Soft Coral** (`danger`): Error text and invalid borders on night. **Brick** (`danger-paper`): Error text and invalid borders on paper, where coral would not read.
- **Note Yellow** (`note-yellow`): Folded handwritten notes inside letters only.

### Named Rules
**The One Lamp Rule.** Amber is the only accent. One amber primary action per view, plus focus and "today" or lit letter days; everything else is mist, moonlit, paper or ink. If two things glow, neither does.

**The Paper Is the Warmth Rule.** Warm, bright surfaces are reserved for letters and the things that hold the sender's words (and the form that starts them). Chrome on night is a navy tone step on the public site or translucent mist (`rgba(233, 236, 242, 0.03–0.08)`) in the app, never cream.

**The Flat Night Rule.** Inner public pages use no gradients. The homepage motion exception below permits readability scrims over the supplied night-sky footage, a masked horizon image, and physical shadows on the sample letter and paper. Depth is a step from `night` to `night-mid` to `night-surface` to `night-high`. The only `linear-gradient` is the slider track's solid amber fill, sized to the value.

**The Retired Rose Rule.** The cream-and-rose palette from before the night redesign (warm creams, dusty rose, brown text, DM Sans, Playfair Display) has been removed from the code. Don't bring it back. `src/index.css` holds only the night body background, and the Tailwind theme stays empty.

## Typography

**Display Font:** Schibsted Grotesk 800 (with system-ui, sans-serif)
**Body Font:** Schibsted Grotesk 400 and 600 (with system-ui, sans-serif)
**Letter Font:** Literata (with Georgia, serif)
**Hand Font:** Caveat (with Segoe Print, cursive)

**Character:** One plain, friendly grotesk does all the talking, set heavy and tight for headlines so they land like a held breath. Literata is the bookish serif of the letters themselves, so the sender's words always look different from the product's. Caveat appears only where a person would actually write by hand.

### Hierarchy
- **Display** (800, `min(5.85vw, 96px)` above 900px, `clamp(44px, 12.4vw, 96px)` below, 0.92, -0.04em): The home hero headline only, in two lines that rise in from a mask.
- **Headline** (800, `clamp(44px, 9vw, 88px)`, 0.94, -0.04em): Inner page titles (services, about, contact).
- **Section** (800, `clamp(2rem, 1.3rem + 3.2vw, 4rem)`, 0.98, -0.04em): Section heads on every page. The price figure uses the same cut at `clamp(64px, 7vw, 96px)`, 0.9, in amber.
- **Title** (800, 19–32px, 1.1–1.15, -0.02 to -0.03em): Step, benefit, promise and "what's included" titles; the footer's call-to-action. Step titles are `clamp(22px, 1.8vw, 26px)`.
- **Statement** (400, `clamp(24px, 2.4vw, 34px)`, 1.25, -0.02em): Moonlit sentences that carry an argument: the meaning line, the founder's roles, the large review. FAQ answers and closing lines use a smaller cut (22–28px, 1.3).
- **Lead** (400, `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)`, 1.4): Ledes under display and headline, capped at 30–36em.
- **Body** (400, `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)`, 1.5, -0.01em): Site prose, capped at 34–38em. App body stays 16px/1.6.
- **Label** (600, 14–17px): Buttons (17px), nav (16px), form labels (16px), control names (14px). Sentence case.
- **Small** (400, 0.875rem): Fine print under actions, in muted mist. Captions and meta are 15px muted mist.
- **Letter title / Letter** (Literata 400, 26px/1.2 and 18px/1.8, no tracking): Letter titles and bodies, in the app and in letter fragments on the site (the site's fragment runs 28px and 18px/1.7, stepping to 22px and 16px/1.6 on phones).
- **Hand** (Caveat 500, 19–32px): Folded notes, ticket lines and scrapbook captions only.

### Named Rules
**The Heart and Hands Rule.** Literata is the sender's voice: letter bodies, letter titles, the recipient's letters and replies, letter row titles, and the guide's chat replies. Everything the product says, headlines included, is Schibsted Grotesk. Never set a letter in sans, and never set a headline, button or label in serif.

**The Tight Heavy Rule.** Headlines are 800 at -0.04em with leading under 1 (0.92–0.98); titles ease to -0.02 to -0.03em. Everything else carries -0.01em. Nothing is uppercase or positively tracked.

## Layout

The public site runs edge to edge on a fluid margin, `gut` (`clamp(20px, 4.4vw, 64px)`), with sections separated by `gap` (`clamp(96px, 12vw, 176px)`). Compositions are asymmetric two-column grids on fractional tracks (5/7 for the hero, 6/6, 7/4, 5/6), collapsing to one column at 900px. The hero fills the first viewport: copy at left, the live controls and the calendar at right. The benefits section pins a letter on a full-height `night-surface` stage while the copy scrolls beside it. Services shows four real phone screens in a row that align on subgrid, two per row at 1080px, and image-beside-text at 560px. The footer is a 12-column grid of tiles with 8px gaps (6px on tablets), becoming two columns at 900px and one at 560px.

The writing app is a single centered column for one hand on a phone: 720px for the builder (560px for narrow steps), 560px for the recipient box, a 20px gutter. Sticky translucent bars (navy at 82–92% alpha, 12px backdrop blur, a mist hairline) hold the step indicator and the box tabs. Fields sit 22px apart, cards pad 24px, paper pads 28px.

Breakpoints: 1080px, 900px and 560px on the site; 900px, 720px, 640px, 560px and 420px in the app.

**The Thumb Rule.** Every interactive element is at least 44px tall (footer nav links 36px within a tile). Primary buttons are 56px on the site and 52px in the app; inputs are 48px.

## Elevation & Depth

The public site is flat. Nothing casts a shadow at rest or on hover; prominence comes from a lighter tone step or from being lit (amber, moonlit, paper). Hovered buttons rise 2px and brighten; they do not bloom. The only box-shadow on the site is the focus ring on paper fields. There are no hairline rules or dividers outside interface fragments (the date field and segment borders in the hero controls, and the form fields on paper).

In the app, depth still comes from light: paper is lifted by an amber halo and a deep, soft drop shadow, and the primary button blooms amber on hover.

### Shadow Vocabulary
- **Focus ring, night** (`outline: 2px solid` amber, offset 3px): Every focusable element on night.
- **Focus ring, paper** (`box-shadow: 0 0 0 4px rgba(27, 37, 54, 0.12)` with an ink border): Inputs on paper; other focusables on paper take an ink outline.
- **Paper glow, app** (`box-shadow: 0 0 70px rgba(240, 179, 65, 0.08), 0 24px 60px -24px rgba(0, 0, 0, 0.7)`): Paper surfaces on night in the app.
- **Lamp bloom, app** (`box-shadow: 0 12px 30px -12px rgba(240, 179, 65, 0.6)`): App primary button hover.
- **Focus halo, app** (`box-shadow: 0 0 0 4px rgba(240, 179, 65, 0.14)`): Focused inputs on night, with an amber border.
- **Sticker lift** (four 1.5px white `drop-shadow`s plus `0 3px 3px rgba(40, 28, 16, 0.22)`): The die-cut vinyl edge on stickers inside letters.

### Named Rules
**The Tone Step Rule.** On the public site a surface is raised by one tone step, never by a shadow. Shadows exist only as focus rings.

**The Light, Not Shadow Rule.** In the app, a surface earns prominence by being lit (paper, amber), not by casting a darker shadow. Never put a heavy shadow on a translucent mist card.

## Shapes

Soft and rounded, never sharp, never bubbly. Actions and choices are full pills (999px). Containers step up in radius by size: paper sheets 6px, inputs, calendar days and control cells 10px, rows 12px, cards, kinds and footer tiles 14px, panels, the calendar and comments 16px, chat bubbles 18px, the price block and the contact form 20px, and phone screenshots 22–28px. Avatars, dots and the switch knob are circles. Locked letters use a dashed border. The tactile pieces inside a letter (stamps, tape, postmarks, notes) are slightly rotated (1–14°), so the page looks handled, not printed.

## Components

### Buttons
Soft and unhurried. Pills that lift gently and never shout.
- **Shape:** Full pill (999px), 56px tall on the site, 52px in the app.
- **Primary:** Lamplight amber with night ink text, 600 at 17px, 16px × 30px padding.
- **Hover / Active / Focus:** Brightens to lit amber and rises 2px over 200ms; active presses to 0.98. Focus is the 2px amber outline offset 3px.
- **Ink:** The primary on paper (the contact form, full width). Hover darkens to `#26334D`.
- **Text link:** Moonlit 600 at 17px with an amber underline offset 5px; hover turns the text lit amber. The soft variant is soft mist with a muted underline.
- **Toggle:** A 44px outline pill (1.5px mist at 45%) in moonlit text; hover fills mist at 8%; pressed fills moonlit with night ink.

### Segmented Control
A row of 44px pills, 1px mist border at 22%, soft mist text, 6px apart, each growing to fill the row. Hover brightens the border to 50% and the text to moonlit. The selected segment fills moonlit with night ink.

### Switch
A 56 × 32px pill track in high night with a 24px soft mist knob. On, the track turns amber and the knob slides 24px and turns night ink.

### Control Panel
The hero's live controls: a 16px-radius `night-mid` panel with 12px padding, holding 10px-radius `night-surface` cells. Each cell has a 14px soft mist name over its control (a date field, a range slider with an amber fill and a 22px amber thumb, a segmented control, a switch). Three columns on desktop, one on phones.

### The Time-Apart Calendar (signature)
The time apart, drawn as weeks. A 16px-radius `night-mid` panel; a seven-column grid of 10px-radius `night-surface` days, 6px apart (4px on phones), each `clamp(44px, 3.9vw, 56px)` tall with the date at top in tabular figures and the letter's name at bottom. Days that hold a letter are lit amber with night ink. The day you meet again is letter paper with ink. Days outside the range go transparent; days after the reunion stay transparent with dimmer text, so the reunion never stands alone in its row. Long stretches fold their middle weeks into a single `night-surface` strip ("8 more weeks, 6 more letters"). A caption below counts the letters, its count in moonlit. On phones the letter names hide and each day becomes a centered date. Day colors transition over 300ms as the controls change.

### Comment Reviews
Reviews are a comment thread, not cards with stars. Each is a 16px-radius `night-mid` block (18px × 20px padding) with a 36px high-night initials disc, the name in soft mist 600 and the date in muted mist, over the review in moonlit. The first review is large (48px disc, statement-size body, up to 900px wide); the rest indent beneath it as replies, up to 520px. A plain muted note above says the reviews are samples.

### Inputs / Fields
- **On paper (site):** 48px tall, 10px radius, 1.5px field-edge border, white fill, 16px ink text. Labels are 16px semibold above the field, optional hints in soft ink. Focus turns the border ink with the paper focus ring. Errors use brick, set through `aria-invalid`.
- **Pills on paper:** 44px, 1.5px field-edge border, white fill, soft ink text; hover turns the border ink; selected fills ink.
- **On night (app):** 48px tall, 10px radius, 1.5px mist border at 28%, navy at 50% fill, 16px text. Focus turns the border amber with the app focus halo. Errors use soft coral.

### Navigation
- **Site bar:** Wordmark at left (a 12px amber dot and "While You're Away" in moonlit 600, 17px), three links at right (Services, About, Contact) in 600 soft mist at 16px, 44px tall. Hover and the active page turn moonlit; the active page takes an amber underline. On phones the wordmark and links step down to 14px.
- **Glass bar:** The site bar floats 12px from the top (8px on phones) on the page margins, 64px tall (56px on phones), 22px corners (18px). Where WebGL allows, liquid-glass-js (vendored in public/vendor/liquid-glass, MIT) turns it into a refracting glass panel over the page, set up in src/pages/site/useGlassNav.js. It is the one deliberate exception to the no-glass rule. Elsewhere, and while the glass loads, it is a flat translucent night panel (rgba(11, 20, 48, 0.86)). Links on the glass carry a soft night text-shadow for legibility.
- **Builder top bar (app):** Sticky translucent navy, wordmark at left, step list at right (13px muted mist, the current step semibold mist).
- **Box tabs (app):** Sticky translucent navy, 48px tabs in 15px medium muted mist. The selected tab is mist with a 2px amber underline.

### FAQ
Questions are a list of 48px rows in 600 at 18px, muted mist, each led by an 8px dot. Hover and the open question turn moonlit; the open question's dot turns amber. On desktop the answer appears in a sticky pane beside the list at statement size; under 900px it opens inline beneath the question.

### Footer of Tiles (signature)
The footer is a grid of 14px-radius tiles, 8px apart, never a row of columns over a rule. Tiles are `night-mid` at 220px minimum with 24px padding: a sentence tile with the legal line, a nav tile, a California local-time tile (800 at 28px in tabular figures), and a mail tile. A wide `night-surface` tile sets the wordmark at `min(6.6vw, 110px)`, 800, -0.045em. A `high night` call-to-action tile ("Questions before you start?") carries a 48px arrow that nudges up and right on hover, while the tile steps to `#22305C`. Image credits run full width beneath.

### Letter Paper (signature)
The letter itself: paper variants (night, scrapbook, flowers, quiet) recolor the paper, tape and postmark. A head line carries the date meta, stamp and postmark. The title and body are Literata. Decorations (tape, stamps, pressed flowers, Caveat notes on note-yellow, die-cut stickers) are rotated slightly and carry their own small drop shadows. On the site, letter fragments sit flat on paper at 14px radius with no glow.

### Letter Row (signature, app)
Each letter in the recipient's box is a 60px row: 12px radius, a faint mist fill and hairline, a Literata title over a 13px muted subline. Today's new letter becomes a paper row (cream, ink text), the only lit row in the list. Locked letters dim and take a dashed border. Rows lift 1px on hover.

### Guide Chat (app)
The planning guide's messages are paper bubbles in Literata 17px with ink text, tucked to the bottom-left. The sender's messages sit on night. The composer is a 16px-radius textarea with a 52px round amber send button.

### The Seal (signature, app)
On the recipient's first open: a 96px amber wax seal with a radial gradient, an inner ring, and a slow 3s breathing glow. It's the brightest thing in the product, and it appears exactly once.

### Motion
The site's ease is `cubic-bezier(0.16, 1, 0.3, 1)`. The hero headline lines rise out of a mask over 900ms (the second line 110ms later); ledes, buttons and inner-page openers fade up 12px over 700ms. Sections further down rise 24px as they enter, set only by script, so nothing is hidden without it. State changes run 200ms. The app keeps `cubic-bezier(0.2, 0.7, 0.2, 1)` with 1000ms reveals and 250ms lifts.

## Do's and Don'ts

### Do:
- **Do** set public pages flat on `night` and raise surfaces by tone step (`night-mid`, `night-surface`, `night-high`); build app screens on the night gradient.
- **Do** keep amber to one primary action per view, plus focus and "today" or lit letter days.
- **Do** set every headline in Schibsted Grotesk 800 at -0.04em with leading under 1, and keep Literata for letter bodies, letter titles and the recipient's letters.
- **Do** place page content on the `gut` margin (`clamp(20px, 4.4vw, 64px)`) and separate sections by `gap`.
- **Do** keep touch targets at 44px or more, and text inputs at 16px.
- **Do** use a 2px amber `:focus-visible` outline offset 3px on night, and ink on paper.
- **Do** kill all animation and transition under `prefers-reduced-motion`, and keep text visible at rest: entrances move text, they never hide it without script.
- **Do** show the product with real screens and live fragments (the calendar, a letter, comments) rather than mockups.

### Don't:
- **Don't** use the retired cream/rose palette, DM Sans, or Playfair Display in new work.
- **Don't** introduce a second accent color, or tint chrome cream or amber.
- **Don't** use gradients or shadows on the public site, or hairline rules outside interface fragments.
- **Don't** put heavy shadows on translucent night cards in the app. Light lifts surfaces here, shadow doesn't.
- **Don't** set headlines, buttons or labels in Literata, or a letter in sans.
- **Don't** use Caveat outside handwritten notes, tickets and scrapbook captions.
- **Don't** uppercase or letter-space labels.
- **Don't** use flat pure black (`#000`) backgrounds or saturated alarm reds; errors are soft coral on night and brick on paper.


## Continuous homepage motion exception November 2026

The homepage now follows one letter through a continuous, locally hosted night sky. This section supersedes the older homepage hero, benefits, sample-review, and snapshot-glass descriptions above. Inner-page layouts and the writing app retain their existing design.

- `Journey.jsx` keeps all three chapters in normal document flow. There is no envelope: the illustrative sample letter is one still sheet of paper beside the story (sticky on desktop). There is no wheel interception, forced snapping, or artificial scroll smoothing.
- Below 900px, the scene becomes a natural single column. The sample letter sits in the flow, without pinning a large object over the text. Reduced motion uses a still sky and an already-open sample; no video is requested initially. The sky can be paused and stops when the tab is hidden. Data Saver also uses the poster.
- The calendar follows the story as its own interactive timeline, with the original departure date, duration, delivery rhythm and sealed-final-letter controls. Paper creation is one three-step tabbed demonstration, using the actual `ChatFragment` and `PaperFragment` components.
- Native CSS glass replaces page-snapshot WebGL glass on all four site routes. The navigation keeps its glass appearance over live imagery without loading html2canvas or recapturing the page. A native mobile menu keeps all navigation links available on narrow phones.
- Homepage-only exceptions allow a low-opacity gradient scrim for readable text over footage, a masked horizon image to bridge the recipient scene, a fine orbit around the letter, and a physical shadow beneath the sample letter and real paper. No second accent color is introduced.
- Schibsted Grotesk, Literata and Caveat remain the brand fonts. The headline retains “Goodbyes can be prepared.” The sample letter is explicitly illustrative. Placeholder testimonials and repeated paper descriptions have been removed; no customer claims are invented.
- The homepage files are `Home.jsx`, `Journey.jsx`, `NightSky.jsx`, `useScrollScene.js` and `home.css` under `src/pages/site/`. Rive source in `animation/perigan/` is independent and is not modified or replaced by the retired three.js experiment.
