// All site copy in one place, so it can be edited without touching layout.

export const CONTACT = 'hello@getwhileyouareaway.com'
export const PRICE = '$9.99'
export const KEEPSAKE_PRICE = '$19.99'

export const FAQ = [
  { q: 'What if I miss a day of writing?', a: 'They’ll never know. Each entry shows the day it was written, never the days in between. No streaks and no empty pages, just what you had to say.' },
  { q: 'I’m not a good writer. Will it still be good?', a: 'You don’t need to be a writer. A short guided conversation and gentle prompts help you find what to say, and the words stay yours.' },
  { q: 'How early should I start?', a: 'A month before is ideal, but a week is plenty. You can also write everything in one evening. It’s your goodbye.' },
  { q: 'What do they actually receive?', a: 'A letter box you hand over on the day you part. It opens in their phone’s browser with nothing to install, works offline, and keeps their replies.' },
  { q: 'Who can read what I write?', a: 'Your drafts are saved to your account so you can write from any device. The recipient opens their box using the link you share. Keep that link private.' },
  { q: 'How much does it cost?', a: `Planning, reading your chats once and writing are free. When you hand it over, it’s ${PRICE}, paid once for the whole letter box, or ${KEEPSAKE_PRICE} with the keepsake book: every letter and reply gathered to print or save as a PDF. No subscription, and a full refund within 14 days for any reason.` },
]

export const STEPS = [
  { when: 'About 10 minutes', title: 'Sign in and tell the guide', body: 'Why you’re apart, how often you’ll talk, the small things only you two know. It suggests the letters and when each opens; you decide what stays.', shot: 'plan', alt: 'The planning conversation with the guide.' },
  { when: 'Optional, before you write', title: 'Bring in your chats', body: 'An iMessage, WhatsApp or KakaoTalk export, counted on your phone first. Reading it for moments, sayings and earlier goodbyes is free once.', shot: 'chats', alt: 'Numbers counted from a chat: the first message, days talked, hours on calls.' },
  { when: 'Any day before you part', title: 'Write with what you found', body: 'Start a letter from a moment, or pin one beside your words. Add a photo or your voice. A companion helps when the words won’t come; it never writes them.', shot: 'findings', alt: 'Moments found in a chat, each with a question to start a letter from.' },
  { when: 'The day you part', title: 'Hand it over', body: 'Make one private link for their phone and pay, once. Anything you add later still arrives on its day.', shot: 'handover', alt: 'The hand-over page with the button to make their link.' },
  { when: 'While you’re apart', title: 'They open them one at a time', body: 'On the right days, even offline, on paper made from your story. They can write back to every letter.', shot: 'box', alt: 'Their letter box on the phone, dressed in their story.' },
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
  ['Your chats, read for moments', 'Up to three readings of an iMessage, WhatsApp or KakaoTalk chat: moments, the things you always say, the goodbyes before this one.'],
  ['A companion while you write', 'Help finding the words whenever you get stuck, up to 300 messages. The words stay yours.'],
  ['Paper made from your story', 'Colors, typeface, stamps and a seal drawn from what you shared, so no two letter boxes look alike.'],
  ['The days before', 'Collect moments, photos and voice notes before you part, each stamped with its day.'],
  ['Their private letter box', 'A link that opens on their phone, works offline, and brings their replies back to you.'],
  ['Kept online', 'At least a year after the day you meet again, or two years from purchase, whichever is later.'],
]
