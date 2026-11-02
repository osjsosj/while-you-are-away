import { useMemo } from 'react'
import { planLetters, addDays, short } from './letters'

/*
 * The time apart as a calendar. It starts today with the diary you keep in secret (D-14 … D-1),
 * lights the day you part and every day a letter opens, and seals the day you meet again.
 * Long stretches fold in the middle so the start and the end both show.
 */

export default function TimeApart({ weeks, rhythm, seal, start, before }) {
  const plan = useMemo(() => planLetters({ weeks, rhythm, seal, start, before }), [weeks, rhythm, seal, start, before])
  const first = -plan.before
  const rows = Math.floor((plan.total - first) / 7) + 1
  const folded = rows > 7
  // keep the countdown, the parting and its first weeks, then the last two weeks
  const head = Math.min(rows - 3, Math.max(3, Math.ceil(plan.before / 7) + 2))
  const shown = folded ? [...[...Array(head).keys()], rows - 2, rows - 1] : [...Array(rows).keys()]
  const dayOf = (row, col) => first + row * 7 + col
  const hiddenFrom = dayOf(head, 0)
  const hiddenTo = dayOf(rows - 2, 0)
  const hiddenLetters = folded ? [...plan.letters.keys()].filter((d) => d >= hiddenFrom && d < hiddenTo).length : 0

  const cell = (day) => {
    const date = addDays(start, day)
    if (day > plan.total) {
      // the days after you meet again finish the row, so the reunion never stands alone
      return <li key={day} className="ta-day ta-day--after" aria-hidden="true"><span className="ta-date">{date.getDate()}</span></li>
    }
    const label = plan.letters.get(day)
    const cls = day < 0 ? 'ta-day ta-day--diary'
      : seal && day === plan.total ? 'ta-day ta-day--seal'
        : label ? 'ta-day ta-day--lit' : 'ta-day'
    return (
      <li key={day} className={cls}>
        <span className="ta-date">
          {(day === 0 || date.getDate() === 1) && day !== first && <span className="ta-mon">{date.toLocaleDateString('en-US', { month: 'short' })} </span>}
          {day === first ? short(date) : date.getDate()}
        </span>
        {label && <span className="ta-label">{label}</span>}
      </li>
    )
  }

  const weekdays = [...Array(7).keys()].map((i) => addDays(start, first + i).toLocaleDateString('en-US', { weekday: 'short' }))

  return (
    <figure className="ta" data-ui aria-label={`Calendar: ${plan.before} diary days before you part, then ${plan.count} letters over ${weeks} weeks apart`}>
      <ol className="ta-head" aria-hidden="true">{weekdays.map((w) => <li key={w}>{w}</li>)}</ol>
      {shown.map((row, i) => (
        <div key={row}>
          {folded && i === head && (
            <p className="ta-fold">
              {Math.round((hiddenTo - hiddenFrom) / 7)} more weeks{hiddenLetters ? `, ${hiddenLetters} more letters` : ''}
            </p>
          )}
          <ol className="ta-row">{[...Array(7).keys()].map((c) => cell(dayOf(row, c)))}</ol>
        </div>
      ))}
      <figcaption className="ta-cap">
        {plan.before > 0 && <><strong>{plan.before} days</strong> to write in secret before you part. Then </>}
        <strong>{plan.count} letters</strong>: one tonight, {plan.scheduled ? `${plan.scheduled} ${plan.rhythm.label.toLowerCase()}` : 'none on a rhythm'}
        {seal ? `, and one sealed until ${short(plan.end)}.` : `, until ${short(plan.end)}.`}
      </figcaption>
    </figure>
  )
}
