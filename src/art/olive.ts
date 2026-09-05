/**
 * §9.11 The olive branch — one cubic in `currentColor` (stroke 3, pathLength 1) and thirteen lens leaves
 * set along it at t .08 … 1, alternating sides, turned to the tangent ±35°, growing .7 → 1.
 * Each leaf has a `.front` (olive) and a `.back` (olive-silver); `flip(svg, i, deg)` turns leaf i
 * about its stem with CSS rotateY (orthographic — SVG has no perspective — so the silver shows past 90°).
 *
 *   olive()  → SVG string (viewBox 0 0 1000 1000)      leaf()  → the lens path        fallPath  → offset-path for leaf #7
 *   flip(svg, i, deg)
 */
const B = { p0: [200, 760], p1: [380, 620], p2: [560, 420], p3: [820, 240] } as const

function bez(t: number): [number, number] {
  const u = 1 - t
  const x = u * u * u * B.p0[0] + 3 * u * u * t * B.p1[0] + 3 * u * t * t * B.p2[0] + t * t * t * B.p3[0]
  const y = u * u * u * B.p0[1] + 3 * u * u * t * B.p1[1] + 3 * u * t * t * B.p2[1] + t * t * t * B.p3[1]
  return [x, y]
}
function tangent(t: number): number {
  const u = 1 - t
  const dx = 3 * u * u * (B.p1[0] - B.p0[0]) + 6 * u * t * (B.p2[0] - B.p1[0]) + 3 * t * t * (B.p3[0] - B.p2[0])
  const dy = 3 * u * u * (B.p1[1] - B.p0[1]) + 6 * u * t * (B.p2[1] - B.p1[1]) + 3 * t * t * (B.p3[1] - B.p2[1])
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

export function leaf(): string { return `<path d="M0,0 q35,-9 70,0 q-35,9 -70,0"/>` }
export const fallPath = 'M0,0 c40,60 -60,120 -10,200 s60,120 20,220'

export function olive(): string {
  const leaves = Array.from({ length: 13 }, (_, i) => {
    const t = 0.08 + (i * 0.92) / 12
    const [x, y] = bez(t)
    const side = i % 2 ? 1 : -1
    const rot = tangent(t) + side * 35
    const s = 0.7 + t * 0.3
    return `<g class="leaf" data-i="${i}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})"><g class="leaf__flip"><path class="front" d="M0,0 q35,-9 70,0 q-35,9 -70,0" style="fill:var(--olive,#6F7A5C)"/><path class="back" d="M0,0 q35,-9 70,0 q-35,9 -70,0" style="fill:var(--olive-silver,#A9B39C)" opacity="0"/></g></g>`
  }).join('')
  return `<svg class="glyph glyph--olive" aria-hidden="true" viewBox="0 0 1000 1000" overflow="visible">
  <style>
    .glyph--olive .leaf__flip { transform-box: fill-box; transform-origin: 0 50%; transition: transform .64s var(--ease-press, cubic-bezier(.22,1,.36,1)); }
    .glyph--olive .front, .glyph--olive .back { transition: opacity .12s linear; }
  </style>
  <path class="branch" d="M200,760 C380,620 560,420 820,240" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" pathLength="1"/>
  ${leaves}
</svg>`
}

export function flip(svg: SVGElement, i: number, deg: number): void {
  const g = svg.querySelector<SVGGElement>(`.leaf[data-i="${i}"] .leaf__flip`)
  if (!g) return
  g.style.transform = `rotateY(${deg}deg)`
  const back = Math.abs(((deg % 360) + 360) % 360 - 180) < 90
  g.querySelector('.front')?.setAttribute('opacity', back ? '0' : '1')
  g.querySelector('.back')?.setAttribute('opacity', back ? '1' : '0')
}
