// All site copy in one place, so it can be edited without touching layout.

export const CONTACT = 'hello@getwhileyouareaway.com'
export const PRICE = '$24'

export const FAQ = [
  { q: 'What if I miss a day of writing?', a: 'They’ll never know. Each entry shows the day it was written, never the days in between. No streaks and no empty pages, just what you had to say.' },
  { q: 'I’m not a good writer. Will it still be good?', a: 'You don’t need to be a writer. A short guided conversation and gentle prompts help you find what to say, and the words stay yours.' },
  { q: 'How early should I start?', a: 'A month before is ideal, but a week is plenty. You can also write everything in one evening. It’s your goodbye.' },
  { q: 'What do they actually receive?', a: 'A letter box you hand over on the day you part. It opens in their phone’s browser with nothing to install, works offline, and keeps their replies.' },
  { q: 'Who can read what I write?', a: 'Your drafts are saved to your account so you can write from any device. The recipient opens their box using the link you share. Keep that link private.' },
  { q: 'How much does it cost?', a: `${PRICE}, paid once, for the whole letter box. No subscription, and a full refund within 14 days for any reason.` },
]

export const STEPS = [
  { when: 'After checkout, about 10 minutes', title: 'Tell us about your goodbye', body: 'A short conversation. Share the small things only you two know, or say “that’s enough” whenever you like.', frag: 'chat' },
  { when: 'Right after', title: 'The counselor makes your paper', body: 'From your story: the paper, a stamp, a postmark from your first date, a letter shaped like your bus ticket. Switch off anything that isn’t you.', frag: 'paper' },
  { when: 'Any day before you part', title: 'You write the words', body: 'Only what you want to say, or how today felt. Add a photo or your voice. A companion helps when the words won’t come.', frag: 'write' },
  { when: 'While you’re apart', title: 'They open them one at a time', body: 'On their phone, on the right days, even offline. They can write back to every letter.', frag: 'box' },
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
