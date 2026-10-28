// All landing copy in one place, so it can be edited without touching layout.

export const LETTERS = [
  {
    label: 'Before basic training',
    to: 'To Sam',
    written: 'Written 9 days before you left for basic',
    body: 'Today you cried and said it was allergies. It hurt to watch. I’m so glad I’m writing these. Every one is a day I got to spend thinking only about you.',
  },
  {
    label: 'Before the wedding',
    to: 'To Mom and Dad',
    written: 'Written 12 days before the wedding',
    body: 'Mom, you cried at the dress fitting before I did. Dad, you pretended to check your phone. Everything I know about loving someone, I learned watching you two.',
  },
  {
    label: 'A friend’s hard year',
    to: 'To Leah',
    written: 'Written the week you moved back home',
    body: 'I know this year took more from you than you let anyone see. You don’t have to be okay yet. I’m not going anywhere, even from three states away.',
  },
  {
    label: 'Studying abroad',
    to: 'To Daniel',
    written: 'Written 21 days before your flight',
    body: 'You practiced ordering coffee in Korean at breakfast and you were terrible at it. I’m going to miss hearing you be terrible at things.',
  },
]

export const STEPS = [
  { when: 'A week or a month before', title: 'You write', body: 'A few lines on the days you can, and the things you never got around to saying. Gentle prompts help when the words won’t come.' },
  { when: 'The day you part', title: 'You hand it over', body: 'One letter box on their phone, with everything you wrote waiting inside.', now: true },
  { when: 'While you’re apart', title: 'They open, one by one', body: 'New letters unlock on schedule. Others are there for the nights they need you most.' },
  { when: 'The day you meet again', title: 'The last letter', body: 'Saved for the end, so the waiting always has somewhere to arrive.' },
]

// `row` points at the matching line in the phone preview
export const CHAPTERS = [
  { label: 'The days before', row: 1, desc: 'A diary you keep in the weeks before you part. Each entry carries the day you wrote it.', example: '“You laughed so hard at dinner that you snorted, and then laughed at that. I want to remember exactly how it sounded.”' },
  { label: 'Things I never said', row: 2, desc: 'Prompts for the stories you both know and the words you never quite said out loud.', example: '“The first time I saw you, you were arguing with a vending machine. You won.”' },
  { label: 'While we’re apart', row: 0, desc: 'Letters that unlock every day or every week, so there’s always one more to look forward to.', example: '“Week four. If you’re reading this, you’ve already done the hardest part once.”' },
  { label: 'When you need me', row: 3, desc: 'Letters they can open any time: a bad day, a sleepless night, a moment worth sharing.', example: '“Open when you can’t sleep. Okay. Put the phone down after this one. I mean it.”' },
  { label: 'Our story', row: 4, desc: 'The moments that made you two, laid out on a timeline they can walk back through.', example: '“March 3. The night the power went out and we played cards by candlelight until two.”' },
  { label: 'The day we meet again', row: 6, desc: 'One letter that stays sealed until the very end.', example: '“You waited. Thank you for waiting.”' },
]

export const PHONE_ROWS = [
  { title: 'Week 4', sub: 'New today' },
  { title: 'Written before I left', sub: '18 entries' },
  { title: 'Things I never said', sub: '6 letters' },
  { title: 'Open when you can’t sleep', sub: 'Any time' },
  { title: 'Our story', sub: '9 moments' },
  { title: 'Week 5', sub: 'Opens November 11', locked: true },
  { title: 'The day we meet again', sub: 'Sealed until then', locked: true },
]

export const FAQ = [
  { q: 'What if I miss a day of writing?', a: 'They’ll never know. Each entry shows the day it was written, never the days in between. No streaks and no empty pages, just what you had to say.' },
  { q: 'I’m not a good writer. Will it still be good?', a: 'You don’t need to be a writer. Prompts and a short guided conversation help you find what to say, and the words stay yours. What makes it good is that it came from you.' },
  { q: 'How early should I start?', a: 'A month before is ideal, but a week is plenty. You can also write everything in one evening. It’s your goodbye.' },
  { q: 'What do they actually receive?', a: 'A letter box you hand over on the day you part. It opens in their phone’s browser with nothing to install, works offline, and keeps their replies.' },
  { q: 'Who can read what I write?', a: 'Your drafts are saved to your account so you can write from any device. Once you hand it over, the letter box lives on their phone, and only they can open it.' },
  { q: 'Who is it for?', a: 'Anyone with a goodbye coming: a partner heading to basic training or a deployment, a child leaving for college or a new country, parents before a wedding, a friend moving away.' },
]

export const WHO = ['A partner', 'A parent', 'A child', 'A friend', 'Someone else']

// Set to an image path (e.g. '/founder.jpg' in /public) to show the founder photo.
export const FOUNDER_PHOTO = null

// Scene times on the sundial, in hours (24+ = the next day)
export const SCENES = [
  { name: 'The goodbye', time: 'Late night', hour: 23.67 },
  { name: 'How it works', time: 'Before dawn', hour: 29.17 },
  { name: 'What they receive', time: 'Morning', hour: 32 },
  { name: 'Questions', time: 'Afternoon', hour: 38.5 },
  { name: 'Why I made this', time: 'Dusk', hour: 43.33 },
  { name: 'Start', time: 'Evening', hour: 45.5 },
]
