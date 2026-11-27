# Letter design rules

How a letter's paper is made from one person's story. Read this before changing anything in
`src/utils/design/`, `src/components/LetterPaper.jsx`, `src/components/LetterForms.jsx` or the letter
part of `src/styles/decor.css`. DESIGN.md still holds the brand; this file holds what makes each letter
belong to one person.

The goal is one reaction from the person opening it: *this paper was made for me.* A box that is only
recoloured fails that test, so the rules below are about composition and content first and colour last.

## 1. Where a design choice may come from

Every visible choice on a letter traces to one of these, and to nothing else:

| Source | Examples |
|---|---|
| The basics | names, who they are to each other, why they're apart, the part and return dates |
| The planning talk | nicknames, places, the feel they picked, things they said are theirs |
| The chat (if brought in) | moments with a place and date, sayings and who says them, earlier goodbyes, counted numbers |
| The letter itself | its kind (tonight, the days before, while apart, never said, open when, special day, the last one), its date, its pins, its length, a photo |

No decoration is random. A seed only moves small things (tilt, which side a stamp sits, the order of
equal choices) so two letters never look cloned. Every choice is listed in "Why it looks like this".

## 2. Composition before colour

Each letter takes a **form**: a layout skeleton borrowed from real paper. The form is picked from what the
letter carries, not dealt at random. In priority order:

| Form | Picked when | What makes it theirs |
|---|---|---|
| **Sealed** | the last letter | their seal (initials, the nickname around the ring), "sealed until" their return date |
| **Diary page** | a day-before entry | the weekday and date it was written, how many days before they part, a margin rule |
| **Ticket** | the night you part | a boarding-pass stub: their names, the day they part, the return date if there is one |
| **Envelope** | an "open when…" letter | the envelope front with that letter's own reason written on it, addressed to their nickname |
| **Folded note** | a "things I never said" letter | a note folded in four, crease lines, the hand face |
| **Card** | a special day | a greeting card set on that day's date |
| **Saying** | a letter pinned to something one of them always says | the saying itself, large, in the hand face, signed by who says it |
| **Postcard** | a letter pinned to a moment with a place or a date | the moment as the picture side, an address block to their nickname, a postmark from that place and date |
| **Tally** | a letter pinned to numbers from their chat | their numbers set like a receipt: the first message, hours on the phone, the latest night |
| **Classic** | nothing above applies | their paper, faces and stamp |

A pin used by the form's head is not repeated in the pin row below it.

Within a box the stationery stays one set (one palette, one pair of faces, one paper), as a person's
writing paper would. The forms change from letter to letter, so a box with five or more letters of
different kinds shows at least three different compositions.

### Details that make a form theirs

- Ticket: names their transport (boarding pass, rail or bus ticket, in its colour) when the story has
  one; the last goodbye with its place and date; long names take a single column.
- Postcard: the letter's own photo as the picture side; a postmark from the moment's place (trimmed to
  fit the ring) and date; their nickname on the "to" line, the sender's drawn signature on "from".
- Saying: signed "you say this a lot" or "I say this a lot" when it's one of the two of them.
- Envelope: pressed shut with their seal; the "open when" reason written on its front.
- Sealed: how many days apart it waited. Diary: the time it was written. Tally: their months of
  messages, a bar a month. Leaf: the weeks of their own time apart, the ones behind them filled in.
- The feel they chose dresses every form (night: navy ticket and envelope; scrapbook: kraft and tape;
  pressed flowers: blush and a dashed rule; quiet: white, level, no tape).

### Opening

Each form moves once as it opens, the way that paper moves in a hand (the stub tears, the note unfolds,
the seal presses, the postmark thumps, the receipt prints, the weeks fill in). The envelope and the card
stay still: in review (2026-11-25) their motion was too slight to read as opening, so it was taken out
rather than kept half-working.
Transform and clip only, under a second, ending on the resting design; nothing moves under reduced
motion.

### Before it opens

- The recipient's path shows an unread letter as the paper waiting in it (postcard, note, receipt,
  calendar page, ticket), and says so to screen readers.
- The sender sees, under each letter in the editor, how it will arrive ("Emma will open this as a
  postcard from Lakefront Trail") and, when nothing is pinned, how a moment or a saying would change it.

### Margin notes from their messages

Small printed notes in a letter's margin, drawn from the chat they brought in, that only the two of them
would recognise. At most two per letter, below the words, never inside them; set like a typed slip, not
a badge. Each comes from a counted fact, never an estimate, and only when the chat holds it. The sender
can switch them off for the whole box. Reviewed candidates (2026-11-25):

| Note | On which letter | From |
|---|---|---|
| The first message, word for word, and its date | the first letter on the rhythm | `stats.first` |
| "Good night no. 641" | the night you part | `phrases.goodnight` + 1 |
| The latest they stayed up, and what was said | "open when" a sleepless or late night | `stats.lateNight` |
| "I miss you", n times | "open when" missing someone | `phrases.missYou` |
| n laughs in their messages | "open when" a laugh or a bad day | `phrases.laugh` |
| "I love you", n times | the sealed last letter | `phrases.loveYou` |
| "Voice note no. 97" | a letter carrying a voice note | `stats.voices` + 1 |
| "Photo no. 821" | a letter carrying a photo | `stats.photos` + 1 |
| Who sent the first message | a "things I never said" letter | `stats.first.role` |
| "Day 1,067" since the first message | a calendar-leaf letter | `stats.from` to the day it opens |
| "On this day in 2023" | a letter that opens on the anniversary of the first message or a pinned moment | dates in the chat |
| "bear", n times | the first "open when" letter, when a nickname is among their most-used words | `stats.topWords` |

Turned down: emoji as icons (reads as generated, Hallmark floor), the count of "sorry" (can read as a
tally of faults), call hours and message totals (the tally form already carries them).

## 3. Only real facts

- A slot with no fact is left out. No placeholder place, no made-up date, no lorem.
- Names, places, dates and sayings are shown as the sender gave them or as the chat holds them.
- Numbers come only from the chat count. Nothing is rounded up to sound bigger.

## 4. The words are the sender's

- The letter body is never generated, edited, shortened or covered. The product never writes a letter.
- Decorations sit outside the text column: in the head, the margins or the foot.
- The body is set at 16px or more with a measure of 34em at most. Meta text is 13px or more.

## 5. Phone first

- Every form is composed at 320px first, then 375px, then wider. Heads stack on a phone; they never
  shrink the words.
- No horizontal scroll. Long names and places wrap; they never push the layout.

## 6. Nothing that looks generated

From Hallmark's floor, Impeccable's craft floor and Taste Skill, as they apply to a letter:

- No gradient text, glass panels, purple-to-blue gradients, glows other than the one porch light, or
  side-stripe accent borders.
- No emoji on the paper (changed 2026-11-26). What sits on a letter comes from the paper kit in
  `public/paper/`: engraved postage stamps by theme, real masking, washi and kraft tape, pressed flowers,
  and a scanned paper surface under the words. They were made as photographed objects with Higgsfield
  (`scripts/paper-kit/`), so they read as things someone put on the page. A sticker whose theme has no
  stamp is left off the letter rather than shown as an emoji. Emoji stay only as small icons in the
  sender's tools.
- Not everything centred: each form has its own alignment (a postcard splits, a diary page hangs from its
  margin, a ticket reads left to right, a sealed letter centres).
- No identical cards in a row and no card inside a card.
- Real paper objects (postcard, boarding pass, envelope, notebook page, receipt) are drawn with
  restraint: thin rules, perforations, a crease. No skeuomorphic gloss.
- Tracked capitals only on printed-ticket and postmark text, where they imitate real print.
- Everything stays visible with reduced motion and with scripts slow to load.

## 7. Type

- Titles and bodies are always a book serif or the hand face, never a sans: the sender's words must not
  look like the product talking.
- One pair per relationship (tender, warm, playful, plain), each with a hand face for handwritten bits.
  Korean faces follow in each stack and load only for Korean text.
- The hand face is for short handwritten pieces and short letters (postcard length). Long letters switch
  to the reading face.

## 8. Colour

- The palette comes from the things their story mentions most (`COLOR_WORDS`), on the feel they chose.
- Body text 7:1 or more on the paper; small text 4.5:1 or more.
- One accent per letter. The amber porch light stays the app's only glow.

## 9. Proof

- `scripts/test-forms.mjs` runs six contrasting stories through the form picker. It checks that boxes
  differ in their form sequence and stationery, that no slot shows a fact the story lacks, and that every
  form appears somewhere.
- `/lab/letters` (development only) renders those stories letter by letter. Check it at 320px and 375px,
  and run the design detectors (Impeccable `detect`, Hallmark `sloplint`) on the letter code before
  shipping.
