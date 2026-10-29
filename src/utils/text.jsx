/* Small shared helpers for the writing flow. */

export const ACCENTS = [
  { id: 'porch', name: 'Porch light', hex: '#F0B341' },
  { id: 'rose', name: 'Rose', hex: '#E8918A' },
  { id: 'sea', name: 'Sea glass', hex: '#7FC4D9' },
  { id: 'sage', name: 'Sage', hex: '#9FCB9A' },
  { id: 'lilac', name: 'Lilac', hex: '#B9A4E8' },
]

/** Render **bold** spans in AI text without HTML injection. */
export function renderInline(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) => (part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part))
}
