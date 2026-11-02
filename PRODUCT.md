# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Senders (primary).** Someone with a goodbye coming: a partner heading to basic training or a deployment, a child leaving for college or another country, a person writing to their parents before a wedding, a friend moving away. They buy the letter box in the days or weeks before the parting, plan it, and write every letter themselves, usually on their phone and often in short sittings. Many don't think of themselves as writers.

**Recipients (equal second audience).** The person being left, or the one leaving. They get a private link (`/b/:token`) on the day of the goodbye and open letters on their phone over the time apart, sometimes on hard days, often offline. They can reply to every letter. Their experience matters as much as the sender's.

## Product Purpose

While You're Away turns a goodbye into a letter box that keeps arriving. In the days before parting, the sender keeps a countdown diary in secret (D-14 … D-1): what they thought that day and how their feelings change as the parting gets closer. After parting, the recipient reads those entries and opens letters one at a time for as long as they're apart. The goal is to move them: success means the recipient is genuinely touched, the sender says what they never quite said out loud, and there is always one more letter to look forward to.

## Positioning

- **The differentiator: letter paper made from their story.** An AI counselor talks with the sender about the goodbye and dresses the letter paper around it (paper, stamps, a postmark from a meaningful date, a note shaped like a real ticket), so each letter feels made for that person and the emotion lands as strongly as possible. The counselor shapes the paper and the plan, never the words.
- **The days before, written in secret.** A D-day countdown diary the recipient doesn't know about until they part.
- **The words stay the sender's.** The AI plans the box and helps when the words won't come, but it never writes the letters. Quality comes from the sender's care, not generation.
- **It opens over time.** Letters unlock on a rhythm (daily, weekly, every two weeks), "open when…" letters wait for a bad day or a sleepless night, special days open on their date, and one letter stays sealed until the day you meet again.
- **Nothing to install.** The recipient opens it in their phone's browser. It works offline and carries their replies back.
- **The founder's own goodbyes.** Jin (soldier, student far from home, son, partner, friend) built this from the letters he wrote through his own partings. That story is part of the brand's trust.

## Operating Context

Flow: landing → short interview → checkout ($24, Stripe) → AI planning conversation (`/ai-interview`) → the box is dressed from the story (`/generate`) → editor and "the days before" diary (`/editor`, `/diary`) → preview and handover (`/preview`, `/export`) → recipient box (`/b/:token`).

Letter box sections: Tonight, The days before, While we're apart, Things I never said, Open when…, Special days, The day we meet again. Letters can carry photos, voice notes, folded notes, stickers, stamps and postmarks. Evening diary reminders go out by email.

## Capabilities and Constraints

- React 19 + Vite SPA with Tailwind, deployed on Vercel with serverless functions in `api/`. Supabase for auth (email sign-in code), drafts, boxes and AI usage; Stripe Checkout; Anthropic API for the planning conversation and writing companion; Resend for reminder email. Installable as a PWA with a service worker.
- Pricing: $24, one payment per letter box per recipient, no subscription. Full refund within 14 days. Writing companion has a fair-use limit of 300 messages.
- Hosting promise: a box stays online at least one year after the reunion date, or two years from purchase with no date, whichever is later; 60 days' notice and a download path if the service shuts down.
- Buyers must be 18+. Recipients can be any age.
- Operator: Sangjin Ouh, sole proprietor, California. Contact: hello@getwhileyouareaway.com. Legal copy lives in `src/pages/legal/docs.js`.
- Terminology: "letter box", "the days before", "open when…", "the day we meet again", "hand over". No streaks or empty pages: a diary entry shows the day it was written, never the days missed.

## Brand Commitments

- Name: While You're Away. Short name "Letters".
- Voice: plain, warm, specific, unsentimental. Small true details over big feelings. Second person, short sentences, curly quotes. Legal copy is plain language on purpose.
- The founder story ("Why I made this", signed "Jin, founder") is binding. A founder photo slot exists (`FOUNDER_PHOTO` in `src/pages/landing/content.js`) but no photo has been supplied.
- Sticker art in `public/stickers/` ships under its own license (`public/stickers/LICENSE.txt`).

## Evidence on Hand

- Illustrative example letters on the landing page (to Sam, Mom and Dad, Leah, Daniel) and chapter examples in `src/pages/landing/content.js`. These are written examples, **not real customers**.
- Real product screens and landing imagery in `public/landing/` (step images, opening video, sky and fly frame sequences).
- Founder story copy in `src/pages/Landing.jsx`.
- **Absent, and must not be fabricated:** testimonials, customer counts, ratings, press mentions, partner logos, usage statistics.

## Product Principles

1. **Every word is theirs.** Help the sender find what to say; never say it for them, and never imply the AI wrote the letters.
2. **Design for both ends of the goodbye.** The sender writing at night before parting and the recipient opening on a hard day are both primary moments.
3. **Something always to look forward to.** Time, anticipation and the sealed last letter are the product, not decoration.
4. **No guilt mechanics.** No streaks, empty states that shame, or pressure to write more. A week is plenty; one evening is fine.
5. **Honest about what exists.** Only real claims, real screens and illustrative examples clearly labeled as such.

## Accessibility & Inclusion

Mobile-first: senders and recipients mostly use phones, and recipients may be offline or on poor connections. Goodbyes cover many relationships (partners, parents, children, friends) and should never assume a romantic couple. No formal compliance standard has been set.
