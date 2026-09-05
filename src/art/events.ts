/**
 * §9.10 Four event glyphs (120 × 120) — composition grammar, never illustration:
 *   destinations — a Matisse arch: sand semicircle over a sea rect, a frond of five lens leaves
 *   medready     — a shield of five concentric hairline arcs with one pulsing gold dot
 *   ai           — a LeWitt 6 × 6 hairline grid where exactly one cell holds a gold circle
 *   coffee       — a cup from two concentric semicircles (terra) and three rising wavy hairlines
 */
export type EventKind = 'destinations' | 'medready' | 'ai' | 'coffee'

const STAR = 'var(--star,#FFF9EA)'

function inner(kind: EventKind): string {
  switch (kind) {
    case 'destinations': {
      const frond = [-78, -46, -14, 18, 50].map((a, i) => `<path d="M0,0 q14,-5 30,0 q-16,5 -30,0" transform="rotate(${a}) scale(${(0.8 + i * 0.05).toFixed(2)})"/>`).join('')
      return `<rect x="24" y="60" width="72" height="40" style="fill:var(--sea,#0E3D57)"/><path d="M24,60 a36,36 0 0 1 72,0 Z" style="fill:var(--sand,#E8DCC2)"/><g class="frond" transform="translate(46 84)" style="fill:var(--gold,#D9A441)">${frond}</g>`
    }
    case 'medready': {
      const arcs = [20, 32, 44, 56, 68].map((r, i) => `<path d="M${60 - r},76 a${r},${r} 0 0 1 ${2 * r},0" stroke-opacity="${(0.65 - i * 0.08).toFixed(2)}"/>`).join('')
      return `<g fill="none" stroke-width="1" style="stroke:${STAR}">${arcs}</g><circle class="pulse" cx="60" cy="76" r="4" style="fill:var(--gold,#D9A441)"/>`
    }
    case 'ai': {
      const step = 80 / 6
      const lines = Array.from({ length: 7 }, (_, i) => { const v = (20 + i * step).toFixed(2); return `<line x1="${v}" y1="20" x2="${v}" y2="100"/><line x1="20" y1="${v}" x2="100" y2="${v}"/>` }).join('')
      return `<g fill="none" stroke-width="1" style="stroke:${STAR}" stroke-opacity=".45">${lines}</g><circle cx="${(20 + step * 3.5).toFixed(2)}" cy="${(20 + step * 2.5).toFixed(2)}" r="5" style="fill:var(--gold,#D9A441)"/>`
    }
    case 'coffee':
      return `<path d="M30,62 a30,30 0 0 0 60,0 Z" style="fill:var(--terra,#8C3A2B)"/><path d="M38,62 a22,22 0 0 0 44,0 Z" style="fill:var(--press,#090D16)"/><line x1="22" y1="62" x2="98" y2="62" stroke-width="1" style="stroke:var(--terra,#8C3A2B)"/><g class="steam" fill="none" stroke-width="1" style="stroke:${STAR}" stroke-opacity=".6"><path d="M50,50 q4,-8 0,-16 q-4,-8 0,-16"/><path d="M60,48 q4,-8 0,-16 q-4,-8 0,-16"/><path d="M70,50 q4,-8 0,-16 q-4,-8 0,-16"/></g>`
  }
}

export function eventGlyph(kind: EventKind): string {
  return `<svg class="glyph glyph--event glyph--${kind}" aria-hidden="true" width="120" height="120" viewBox="0 0 120 120">
  <style>
    .glyph--event .pulse { transform-box: fill-box; transform-origin: center; animation: event-pulse var(--loop-glow, 4.6s) ease-in-out infinite; }
    .glyph--event .steam path { animation: event-steam 5.2s ease-in-out infinite; }
    .glyph--event .steam path:nth-child(2) { animation-delay: -1.7s; } .glyph--event .steam path:nth-child(3) { animation-delay: -3.4s; }
    @keyframes event-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: .7; } }
    @keyframes event-steam { 0%, 100% { opacity: .25; transform: translateY(0); } 50% { opacity: .7; transform: translateY(-3px); } }
    @media (prefers-reduced-motion: reduce) { .glyph--event .pulse, .glyph--event .steam path { animation: none; } }
  </style>${inner(kind)}</svg>`
}
