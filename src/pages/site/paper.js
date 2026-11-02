// The demo story the site's product fragments show (Jae writing to Mina). Illustrative.
import { STYLES } from '../../utils/decor'

export const PHOTO = '/site/han-river-night.jpg'
export const PAPER_STYLES = Object.entries(STYLES).map(([id, s]) => ({ id, name: s.name }))

export function decorFor(style = 'night', dressed = true) {
  if (!dressed) return { style: 'quiet', motifs: [], postmark: null, ticket: null, tape: false }
  return {
    style,
    motifs: [{ id: 'bicycle' }, { id: 'crescent-moon' }],
    postmark: { place: 'Han River', date: '2023-04-02' },
    ticket: { kind: 'bus', title: 'Open when you miss me', line: 'Two stops, then the river.' },
    tape: true,
  }
}
