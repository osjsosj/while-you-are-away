// All site copy in one place, so it can be edited without touching layout.

export const CONTACT = 'hello@getwhileyouareaway.com'
export const PRICE = '$24'

export const BENEFITS = [
  {
    title: 'A diary they don’t know about',
    body: 'In the days before you part, write a little each day, in secret: what you thought today, how it feels as the day gets closer. Each entry keeps its countdown, D-9, D-3, D-1, and they read it after you’ve gone.',
    control: 'diary',
  },
  {
    title: 'Letter paper made from your story',
    body: 'An AI counselor listens to your goodbye, then dresses every letter for it: the paper, a stamp, a postmark from your first date, a note shaped like your bus ticket. It never writes the words. Those stay yours.',
    control: 'dress',
  },
  {
    title: 'Something to open while you’re apart',
    body: 'Letters open on a rhythm, so there’s always one more coming. “Open when…” letters wait for a hard night, and one stays sealed until the day you meet again.',
    control: 'apart',
  },
]

// The letter the benefits section shows, one per choice of its controls. Illustrative copy.
export const SAMPLE_LETTERS = {
  d9: {
    group: 'diary',
    label: 'D-9',
    meta: 'The days before · 9 days to go',
    title: 'Nine days left',
    body: 'Today you cried and said it was allergies. It hurt to watch. I’m so glad I’m writing these. Every one is a day I got to spend thinking only about you.',
  },
  d3: {
    group: 'diary',
    label: 'D-3',
    meta: 'The days before · 3 days to go',
    title: 'Three days',
    body: 'I put your charger in my bag by accident and didn’t give it back. I think I wanted one more reason to see you before Sunday.',
  },
  d1: {
    group: 'diary',
    label: 'D-1',
    meta: 'The days before · tomorrow',
    title: 'Tomorrow',
    body: 'I keep starting sentences I can’t finish. So just this: I’m proud of you, and I’m already counting.',
  },
  week: {
    group: 'apart',
    label: 'Week 4',
    meta: 'While we’re apart · opened today',
    title: 'Week four',
    body: 'If you’re reading this, you’ve already done the hardest part once. I keep thinking about the bus stop, and how you said the rain was the reason your eyes were wet.',
  },
  sleep: {
    group: 'apart',
    label: 'Open when you can’t sleep',
    meta: 'Open when… · any time',
    title: 'For a sleepless night',
    body: 'Okay. Put the phone down after this one. I mean it. Think about the night the power went out and we played cards by candlelight until two.',
  },
  last: {
    group: 'apart',
    label: 'The day we meet again',
    meta: 'Sealed until the very end',
    title: 'The day we meet again',
    body: 'You waited. Thank you for waiting.',
  },
}

// SAMPLE reviews: placeholders until real ones exist. Replace before launch; never present these as real.
export const REVIEWS = [
  { initials: 'MK', who: 'Wrote to her partner before a year abroad', date: 'Sample review', body: 'I wrote the last letter on the bus to the airport. She told me she saved week six for a night she couldn’t sleep.' },
  { initials: 'JR', who: 'Wrote to his parents before the wedding', date: 'Sample review', body: 'My dad isn’t a letters person. He read every one out loud to my mom.' },
  { initials: 'TS', who: 'Wrote before basic training', date: 'Sample review', body: 'I’m not a writer. The questions got me started and the rest just came.' },
]

export const FAQ = [
  { q: 'What if I miss a day of writing?', a: 'They’ll never know. Each entry shows the day it was written, never the days in between. No streaks and no empty pages, just what you had to say.' },
  { q: 'I’m not a good writer. Will it still be good?', a: 'You don’t need to be a writer. A short guided conversation and gentle prompts help you find what to say, and the words stay yours.' },
  { q: 'How early should I start?', a: 'A month before is ideal, but a week is plenty. You can also write everything in one evening. It’s your goodbye.' },
  { q: 'What do they actually receive?', a: 'A letter box you hand over on the day you part. It opens in their phone’s browser with nothing to install, works offline, and keeps their replies.' },
  { q: 'Do they need to install anything?', a: 'No. Their letter box opens in their phone’s browser from a private link, works offline, and lets them write back to every letter.' },
  { q: 'Who can read what I write?', a: 'Your drafts are saved to your account so you can write from any device. Once you hand it over, the letter box lives on their phone, and only they can open it.' },
  { q: 'How much does it cost?', a: `${PRICE}, paid once, for the whole letter box. No subscription, and a full refund within 14 days for any reason.` },
]

export const STEPS = [
  { when: 'After checkout, about 10 minutes', title: 'Tell us about your goodbye', body: 'A short conversation. Share the small things only you two know, or say “that’s enough” whenever you like.', img: '/landing/step-plan.webp', alt: 'The planning conversation on a phone' },
  { when: 'Right after', title: 'We dress the box from your story', body: 'Paper, a stamp, a postmark from your first date, a letter shaped like your bus ticket. Switch off anything that isn’t you.', img: '/landing/step-dress.webp', alt: 'A decorated first letter with a postmark, a stamp and a bus ticket' },
  { when: 'Any day before you part', title: 'You write the words', body: 'Every word is yours. Add a photo, your voice, a folded note. A companion helps when the words won’t come.', img: '/landing/step-write.webp', alt: 'Writing a letter on a phone', crop: true },
  { when: 'While you’re apart', title: 'They open them one at a time', body: 'On their phone, on the right days, even offline. They can write back to every letter.', img: '/landing/step-open.webp', alt: 'An opened letter with a taped photo and a folded note' },
]

export const KINDS = [
  { name: 'Tonight', desc: 'One letter for the night you part. It opens that day.' },
  { name: 'The days before', desc: 'A countdown diary you keep in secret before you part, D-14 to D-1, each entry carrying its day.' },
  { name: 'While we’re apart', desc: 'Letters that open every day, every week or every two weeks, so there’s always one more coming.' },
  { name: 'Things I never said', desc: 'The stories you both know and the words you never quite said out loud.' },
  { name: 'Open when…', desc: 'For a bad day, a sleepless night, a moment worth sharing. They can open these any time.' },
  { name: 'Special days', desc: 'Birthdays, holidays, anniversaries, a graduation. Each opens on its day.' },
  { name: 'The day we meet again', desc: 'One letter that stays sealed until the very end.' },
]

export const INCLUDED = [
  ['A planning conversation', 'We talk through your goodbye and shape the letter box around it.'],
  ['A companion while you write', 'Help finding the words whenever you get stuck, up to 300 messages. The words stay yours.'],
  ['Every kind of letter', 'Tonight, while you’re apart, open when…, special days, the day you meet again.'],
  ['The days before', 'Collect moments, photos and voice notes before you part, each stamped with its day.'],
  ['Their private letter box', 'A link that opens on their phone, works offline, and brings their replies back to you.'],
  ['Kept online', 'At least a year after the day you meet again, or two years from purchase, whichever is later.'],
]
