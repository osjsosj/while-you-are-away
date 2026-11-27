/*
 * The letter paper kit: real-looking paper things made with Higgsfield (Nano Banana Pro), to replace emoji stickers and flat CSS tape.
 * Each prompt asks for a photographed or scanned object on plain white, which scripts/paper-kit/cutout.py turns into a transparent PNG.
 * Kept here so any piece can be remade in the same look.
 */
const STAMP = (ink, scene, denom, words) => `A single vintage postage stamp photographed flat from directly above on a plain pure white background. Perforated edges with real paper fibers. Intaglio engraving printed in one ink color, ${ink}, on aged off-white stamp paper: ${scene}. Fine engraved line work and cross-hatching like a 1950s banknote engraving. A small denomination ${denom} in the top corner and tiny serif lettering ${words} along the bottom. No country name. Slight ink unevenness, a faint crease. Realistic scan, not a cartoon, not a 3D render, no gradients, no shadow.`

export const KIT = [
  // stamps (one per theme a letter can be about)
  { id: 'stamp-plane', kind: 'stamp', prompt: null, note: 'made as the test image' },
  { id: 'stamp-train', kind: 'stamp', prompt: STAMP('oxblood red', 'a passenger train crossing a long steel bridge over a river, steam trailing behind', '29', 'RAIL POST') },
  { id: 'stamp-bus', kind: 'stamp', prompt: STAMP('forest green', 'a rounded 1950s city bus on a tree-lined street, a bus stop sign beside it', '15', 'CITY LINES') },
  { id: 'stamp-ship', kind: 'stamp', prompt: STAMP('deep slate blue', 'a small passenger ferry crossing a harbor with gulls and low hills behind', '25', 'HARBOR MAIL') },
  { id: 'stamp-bike', kind: 'stamp', prompt: STAMP('sepia brown', 'a bicycle leaning against a lamp post on a lakeside path, water and a distant skyline behind', '10', 'LAKE SHORE') },
  { id: 'stamp-music', kind: 'stamp', prompt: STAMP('plum purple', 'a vintage ribbon microphone in front of a record player with a spinning record, small musical notes', '20', 'SONG POST') },
  { id: 'stamp-flower', kind: 'stamp', prompt: STAMP('muted rose red', 'a loose bouquet of wild daisies and garden roses tied with a ribbon', '18', 'GARDEN SERIES') },
  { id: 'stamp-snow', kind: 'stamp', prompt: STAMP('cold steel blue', 'snow-covered pine trees and a small cabin with a lit window under falling snow', '22', 'WINTER') },
  { id: 'stamp-coffee', kind: 'stamp', prompt: STAMP('dark umber brown', 'a diner counter with a steaming coffee cup and a stack of pancakes on a plate', '12', 'ALL NIGHT DINER') },
  { id: 'stamp-moon', kind: 'stamp', prompt: STAMP('midnight navy', 'a crescent moon above a quiet rooftop at night with a few stars and a water tower', '30', 'NIGHT POST') },
  // tape and pressed flowers (several on one sheet, cut apart afterwards)
  { id: 'tape-sheet', kind: 'sheet', prompt: 'Three separate strips of tape photographed flat from directly above on a plain pure white background, well apart from each other with lots of white space between them, each strip horizontal: one strip of cream masking tape with torn ends, one strip of muted dusty rose washi tape with torn ends and a faint paper texture, one strip of brown kraft gummed paper tape with torn ends. Real material texture, slight translucency, realistic scan. No shadow, no cartoon, no 3D render.' },
  { id: 'flower-sheet', kind: 'sheet', prompt: 'Three real pressed and dried flowers photographed flat from directly above on a plain pure white background, well apart from each other with lots of white space between: a pressed white daisy with a short stem, a pressed sprig of lavender, a small pressed fern frond. Faded natural colors, delicate, flattened like in an old book, realistic botanical scan. No shadow, no cartoon, no 3D render.' },
  // paper (full frame, used as the sheet's surface)
  { id: 'paper-night', kind: 'paper', prompt: 'Full frame close-up scan of warm cream laid writing paper, fine horizontal laid lines and faint chain lines, soft cotton fibers, very even light, no objects, no text, no edges visible, seamless texture.' },
  { id: 'paper-scrapbook', kind: 'paper', prompt: 'Full frame close-up scan of light brown kraft paper, visible natural fibers and small flecks, very even light, no objects, no text, no edges visible, seamless texture.' },
  { id: 'paper-flowers', kind: 'paper', prompt: 'Full frame close-up scan of soft blush off-white handmade cotton rag paper with tiny embedded flower petal flecks, gentle fibers, very even light, no objects, no text, no edges visible, seamless texture.' },
  { id: 'paper-quiet', kind: 'paper', prompt: 'Full frame close-up scan of bright white heavy watercolor paper with a fine cold-press tooth, very even light, no objects, no text, no edges visible, seamless texture.' },
]
