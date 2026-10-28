/**
 * diary.js — "The days before" diary: prompts and date helpers.
 * Plain functions only (no browser APIs) so the reminder cron can import it too.
 */

// One question a day. Mix of: today, memories, things never said, the time apart, the future.
export const PROMPTS = [
  'What did they do today that you want to remember exactly?',
  'What is something you have never told them, but always meant to?',
  'Describe the first time you saw them. What were they wearing?',
  'What will you miss most about an ordinary Tuesday with them?',
  'What is a small habit of theirs that you secretly love?',
  'Write about a day you were proud of them.',
  'What do you want them to do on the hardest night while you are apart?',
  'What did you two laugh about this week?',
  'What is one thing you hope never changes about the two of you?',
  'Describe their voice to someone who has never heard it.',
  'What is a promise you want to make before you go?',
  'Where do you want to take them when you are together again?',
  'What did you almost say today, but didn’t?',
  'Write about a time they took care of you without being asked.',
  'What song will make you think of them while you are apart?',
  'What scares you about the time apart? Say it honestly.',
  'What do you want them to know on a day they feel alone?',
  'Describe a meal you shared that you still think about.',
  'What have they taught you, without meaning to?',
  'Write down a moment from today, just as it happened.',
  'What is the kindest thing they have ever said to you?',
  'What would you want them to hear first thing in the morning?',
  'Write about a fight you had, and what you learned from it.',
  'What is your favorite photo of them, and why?',
  'What did you notice about them today that they didn’t notice?',
  'What do you want to thank them for, specifically?',
  'Describe the place you feel most at home with them.',
  'What is something silly you want them to keep doing while you are apart?',
  'If they read this on a sleepless night, what should it say?',
  'Write about the moment you knew they mattered this much.',
  'What will the first hour together again look like?',
  'What do you want to say that is too big for a text message?',
]

const DAY = 86400000

/** Local calendar date as YYYY-MM-DD */
export function localISODate(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Whole days between two YYYY-MM-DD dates (b - a), timezone-safe */
export function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / DAY)
}

/** Same question for everyone on a given calendar date; `offset` cycles to another one */
export function promptFor(isoDate, offset = 0) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const n = Math.floor(Date.UTC(y, m - 1, d) / DAY)
  return PROMPTS[(((n + offset) % PROMPTS.length) + PROMPTS.length) % PROMPTS.length]
}

/** "Written 12 days before you left" style stamp. `partDate` may be empty. */
export function stampFor(writtenOn, partDate, voice = 'you') {
  if (!partDate) return `Written ${formatLong(writtenOn)}`
  const n = daysBetween(writtenOn, partDate)
  const leave = voice === 'you' ? 'you leave' : 'I left'
  if (n > 1) return `Written ${n} days before ${leave}`
  if (n === 1) return `Written the day before ${leave}`
  return voice === 'you' ? 'Written the day you leave' : 'Written the day I left'
}

export function formatLong(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export const UNLOCK_OPTIONS = {
  mirror: {
    label: 'One on each matching day',
    detail: 'An entry you write 12 days before you part opens 12 days after. Days you didn’t write are simply skipped.',
  },
  all: {
    label: 'All at once',
    detail: 'Every entry is there from the day you hand it over, like a book they can read at their own pace.',
  },
}

export function normalizeUnlock(v) {
  return v === 'all' ? 'all' : 'mirror'
}
