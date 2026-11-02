// Which days of the time apart hold a letter, for the home page calendar.
// Day 0 is the day you part; negative days are the diary you keep before it.

export const RHYTHMS = [
  { id: 'daily', label: 'Every day', every: 1, unit: 'Day' },
  { id: 'weekly', label: 'Every week', every: 7, unit: 'Week' },
  { id: 'biweekly', label: 'Every two weeks', every: 14, unit: 'Letter' },
]

const DAY = 86400000
const addDays = (d, n) => new Date(d.getTime() + n * DAY)
const short = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export function planLetters({ weeks, rhythm, seal, start, before = 0 }) {
  const r = RHYTHMS.find((x) => x.id === rhythm) || RHYTHMS[1]
  const total = weeks * 7
  const letters = new Map()
  for (let d = -before; d < 0; d++) letters.set(d, `D-${-d}`)
  letters.set(0, 'Tonight')
  let k = 0
  for (let day = r.every; day < total; day += r.every) letters.set(day, `${r.unit} ${++k}`)
  if (seal) letters.set(total, 'Meet again')
  return { total, before, letters, count: letters.size - before, scheduled: k, end: addDays(start, total), rhythm: r }
}

export { addDays, short }
