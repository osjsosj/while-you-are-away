---
version: 1
slug: "src-pages-site-home-jsx"
primary_target: "src/pages/site/Home.jsx"
related_targets: ["src/pages/site/Services.jsx","src/pages/site/About.jsx","src/pages/site/Contact.jsx"]
---

# Surface: marketing site (Home, Services, About, Contact)

Scope: the public site at getwhileyouareaway.com, replacing the old cinematic landing at `/`. Pages: `/`, `/services`, `/about`, `/contact`. Mode: Persuade. Language: English.
Audience: anyone with a goodbye coming. Feel: calm, the ache of parting, and the gladness of having prepared it.
Action: Start your letter box → `/interview` (one button on Home). Proof: real product screens in `public/landing/`, founder story, price and refund terms. Testimonials are SAMPLE placeholders, labelled on the page, to replace before launch.
Constraints: night palette from DESIGN.md; Schibsted Grotesk (Taste deal) for everything, Literata only inside letter fragments; Taste house rules (no eyebrows, no gradients, no shadows at rest, no thin rules outside `data-ui` fragments).

## Direction contract

THESIS: The time apart is the product, so the page shows it as a calendar of weeks where each letter day is lit. It refuses the stock split hero with a phone mockup and a row of feature cards.

OWN-WORLD: Flat midnight ground (#050A19) with tone-step surfaces (#0B1430, #101A33). Calendar cells are soft 10px tiles; letter days fill Lamplight Amber (#F0B341) with night ink; the reunion day is Letter Paper (#F6F3EA). Schibsted Grotesk 800 display at tight tracking, 400/600 text. Pill buttons. Moonlit headlines.

STORY: The visitor sees their own time apart become a run of letters, understands that a goodbye can be prepared, trusts it through real screens, the founder and plain terms, and starts.

FIRST VIEWPORT: Left 5/12: h1 "Goodbyes can be prepared." at ~96px over two lines, one sentence, the one amber button. Right 7/12: live calendar (5–6 weeks visible) with three controls above it (apart for, opens, seal one) and a caption counting the letters. Plain bar nav: wordmark, Services, About, Contact.

FORM: Calendar of the time apart (dealt lead, position 6 of 7 on my list), fused with Taste's product-performs live controls. seed:8faabfbdf0a33f2c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
