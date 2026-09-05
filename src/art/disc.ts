/**
 * §9.9 The mini Disc — concentric rings of small gold tesserae (ring pitch 6, tile 5 × 5, 1-unit grout,
 * each tile turned to face the centre like a Ravenna setter would lay it) around a core tile, and a 3 × 5
 * bitmap font for digits. `write(svg, '25')` flips the tiles under the glyph mask to ink — each tile turns
 * over with an 8 ms stagger radiating from the centre — and `clear(svg)` turns them back.
 *
 *   disc({ size = 64, word })   → SVG string (viewBox 0 0 100 100); `word` pre-writes
 *   write(svg, text) / clear(svg)
 */
const RINGS = [6, 12, 18, 24, 30, 36, 42, 48]
const FONT: Record<string, string[]> = {
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'], '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'], '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '001', '001', '001'], '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'], 'X': ['101', '101', '010', '101', '101'], 'I': ['111', '010', '010', '010', '111'],
  'V': ['101', '101', '101', '101', '010'], '-': ['000', '000', '111', '000', '000'], ' ': ['000', '000', '000', '000', '000'],
}

interface Tile { x: number; y: number; a: number; rank: number }

function tiles(): Tile[] {
  const out: Tile[] = [{ x: 50, y: 50, a: 0, rank: 0 }]
  let rank = 1
  for (const r of RINGS) {
    const n = Math.round((2 * Math.PI * r) / 6)
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 - Math.PI / 2
      out.push({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r, a: (a * 180) / Math.PI, rank: rank++ })
    }
  }
  return out
}

/** Which tiles fall under the bitmap of `text` (3 × 5 cells per glyph, one cell of space between glyphs). */
function mask(text: string): (t: Tile) => boolean {
  const chars = text.toUpperCase().split('').filter(c => c in FONT)
  if (!chars.length) return () => false
  const cols = chars.length * 4 - 1
  const cell = Math.min(10.5, 74 / cols)
  const x0 = 50 - (cols * cell) / 2, y0 = 50 - (5 * cell) / 2
  return t => {
    const c = Math.floor((t.x - x0) / cell), r = Math.floor((t.y - y0) / cell)
    if (c < 0 || r < 0 || r > 4 || c >= cols) return false
    const g = Math.floor(c / 4), cc = c % 4
    if (cc === 3) return false
    return FONT[chars[g]][r][cc] === '1'
  }
}

export function disc({ size = 64, word }: { size?: number; word?: string } = {}): string {
  const T = tiles()
  const lit = word ? mask(word) : () => false
  const body = T.map(t => {
    const op = (0.8 + ((t.rank * 7) % 5) * 0.05).toFixed(2)
    return `<g class="tile${lit(t) ? ' is-ink' : ''}" data-x="${t.x.toFixed(2)}" data-y="${t.y.toFixed(2)}" transform="translate(${t.x.toFixed(2)} ${t.y.toFixed(2)}) rotate(${t.a.toFixed(1)})" style="--d:${t.rank * 8}ms"><rect class="t" x="-2.5" y="-2.5" width="5" height="5" rx=".4" opacity="${op}"/></g>`
  }).join('')
  return `<svg class="glyph glyph--disc" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 100 100"${word ? ` data-word="${word}"` : ''}>
  <style>
    .glyph--disc .t { fill: var(--gold, #D9A441); transform-box: fill-box; transform-origin: center; transition: fill 0s linear calc(var(--d, 0ms) + .2s); }
    .glyph--disc .tile.is-ink .t { fill: var(--press, #090D16); }
    .glyph--disc .tile.is-ink .t, .glyph--disc .tile.is-out .t { animation: disc-flip .42s var(--ease-set, cubic-bezier(.33,0,.2,1)) var(--d, 0ms) both; }
    @keyframes disc-flip { 0% { transform: scaleY(1); } 50% { transform: scaleY(.04); } 100% { transform: scaleY(1); } }
    @media (prefers-reduced-motion: reduce) { .glyph--disc .t { animation: none !important; transition: none; } }
  </style>
  <g class="tiles">${body}</g>
</svg>`
}

export function write(svg: SVGElement, text: string): void {
  const lit = mask(text)
  svg.dataset.word = text
  svg.classList.add('is-writing')
  svg.querySelectorAll<SVGGElement>('.tile').forEach(g => {
    const on = lit({ x: Number(g.dataset.x), y: Number(g.dataset.y), a: 0, rank: 0 })
    g.classList.toggle('is-out', !on && g.classList.contains('is-ink'))
    g.classList.toggle('is-ink', on)
  })
}

export function clear(svg: SVGElement): void {
  delete svg.dataset.word
  svg.classList.remove('is-writing')
  svg.querySelectorAll<SVGGElement>('.tile.is-ink').forEach(g => { g.classList.remove('is-ink'); g.classList.add('is-out') })
}
