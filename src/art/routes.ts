/**
 * §9.6 Portolan routes — laid over the island's projected screen rect (w × h).
 * 31 ports along the traced coast (MED_CONTOUR, equal arc length); every route meets at Malta.
 * Four families as groups: `.air` (quadratic arcs lifted 12% above the plane, gold .6),
 * `.sea` (coast-hugging polylines, lagoon .5), `.digital` (dotted 2 6, star .5),
 * `.people` (31 pulsing circles r 2; Malta r 4 gold-leaf). One luzzu eye at the bow of the first sea line.
 * Every line has pathLength="1"; `--draw` (0..1, default 1) draws them.
 *
 *   routes({ w, h, ports = 31 })   → SVG string       setDraw(svg, p)  → sets --draw       eye()  → the luzzu eye
 */
import { MED_CONTOUR, MED_OUTLINE_11 } from './constellations'

const f = (n: number) => n.toFixed(1)

/** n points at equal arc length along the closed contour, scaled to w × h. */
function ports(n: number, w: number, h: number): [number, number][] {
  const P = MED_CONTOUR.map(([x, y]) => [x * w, y * h] as [number, number])
  const L = P.length
  const seg: number[] = []
  let total = 0
  for (let i = 0; i < L; i++) { const a = P[i], b = P[(i + 1) % L]; const d = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(d); total += d }
  const out: [number, number][] = []
  for (let k = 0; k < n; k++) {
    let t = (k / n) * total, i = 0
    while (t > seg[i]) { t -= seg[i]; i = (i + 1) % L }
    const a = P[i], b = P[(i + 1) % L], u = seg[i] ? t / seg[i] : 0
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u])
  }
  return out
}

export function eye(): string {
  return `<svg class="glyph glyph--eye" aria-hidden="true" width="18" height="10" viewBox="0 0 36 20"><path d="M0,10 q18,-12 36,0 q-18,12 -36,0" style="fill:var(--cream,#FFF7E1)"/><circle cx="18" cy="10" r="5" style="fill:var(--sea,#0E3D57)"/><circle cx="18" cy="10" r="2" style="fill:var(--press,#090D16)"/></svg>`
}

export function routes({ w, h, ports: n = 31 }: { w: number; h: number; ports?: number }): string {
  const P = ports(n, w, h)
  const malta: [number, number] = [MED_OUTLINE_11[10][0] * w, MED_OUTLINE_11[10][1] * h]
  const C = MED_CONTOUR.map(([x, y]) => [x * w, y * h] as [number, number])
  // the coast point nearest Malta — Sicily's tip — where the sea lanes leave the coast
  let gate = 0, gd = Infinity
  C.forEach((c, i) => { const d = Math.hypot(c[0] - malta[0], c[1] - malta[1]); if (d < gd) { gd = d; gate = i } })
  const air: string[] = [], sea: string[] = [], dig: string[] = [], people: string[] = []
  let firstSea: [number, number] | null = null, firstSeaNext: [number, number] | null = null
  P.forEach((p, i) => {
    const fam = i % 3
    if (fam === 0) {
      const mx = (p[0] + malta[0]) / 2, my = (p[1] + malta[1]) / 2 - h * 0.12 * 2 // control point lifted so the arc's apex sits 12% above the plane
      air.push(`<path d="M${f(p[0])},${f(p[1])} Q${f(mx)},${f(my)} ${f(malta[0])},${f(malta[1])}" pathLength="1"/>`)
    } else if (fam === 1) {
      // hug the coast from the nearest contour vertex to the gate, the shorter way round, then strike out for Malta
      let near = 0, nd = Infinity
      C.forEach((c, k) => { const d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < nd) { nd = d; near = k } })
      const L = C.length, fwd = (gate - near + L) % L, back = (near - gate + L) % L
      const pts: [number, number][] = [p]
      let k = near
      const steps = Math.min(fwd, back), dir = fwd <= back ? 1 : -1
      for (let s = 0; s < steps; s++) { k = (k + dir + L) % L; pts.push(C[k]) }
      pts.push(malta)
      if (!firstSea) { firstSea = p; firstSeaNext = pts[1] }
      sea.push(`<polyline points="${pts.map(q => `${f(q[0])},${f(q[1])}`).join(' ')}" pathLength="1"/>`)
    } else {
      dig.push(`<line x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(malta[0])}" y2="${f(malta[1])}" pathLength="1"/>`)
    }
    people.push(`<circle class="port" data-i="${i}" r="2" cx="${f(p[0])}" cy="${f(p[1])}" style="--i:${i}"/>`)
  })
  // the luzzu eye rides the bow of the first sea line, pointing along it
  let luzzu = ''
  if (firstSea && firstSeaNext) {
    const a = firstSea as [number, number], b = firstSeaNext as [number, number]
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI
    luzzu = `<g class="luzzu" transform="translate(${f(a[0])} ${f(a[1])}) rotate(${ang.toFixed(1)})"><svg aria-hidden="true" x="-2" y="-5" width="18" height="10" viewBox="0 0 36 20"><path d="M0,10 q18,-12 36,0 q-18,12 -36,0" style="fill:var(--cream,#FFF7E1)"/><circle cx="18" cy="10" r="5" style="fill:var(--sea,#0E3D57)"/><circle cx="18" cy="10" r="2" style="fill:var(--press,#090D16)"/></svg></g>`
  }
  return `<svg class="glyph glyph--routes" aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible;--draw:1" fill="none" stroke-width="1" stroke-linejoin="round" stroke-linecap="round">
  <style>
    .glyph--routes .air path, .glyph--routes .sea polyline, .glyph--routes .digital line { stroke-dasharray: 1; stroke-dashoffset: calc(1 - var(--draw, 1)); }
    .glyph--routes .digital line { stroke-dasharray: .006 .018; stroke-dashoffset: 0; opacity: var(--draw, 1); }
    .glyph--routes .port { transform-box: fill-box; transform-origin: center; animation: routes-pulse var(--loop-glow, 4.6s) ease-in-out infinite; animation-delay: calc(var(--i, 0) * -.31s); }
    @keyframes routes-pulse { 0%, 100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.6); } }
    @media (prefers-reduced-motion: reduce) { .glyph--routes .port { animation: none; } }
  </style>
  <g class="air" style="stroke:var(--gold,#D9A441)" stroke-opacity=".6">${air.join('')}</g>
  <g class="sea" style="stroke:var(--lagoon,#2B8FA3)" stroke-opacity=".5">${sea.join('')}</g>
  <g class="digital" style="stroke:var(--star,#FFF9EA)" stroke-opacity=".5">${dig.join('')}</g>
  <g class="people" stroke="none" style="fill:var(--star,#FFF9EA)">${people.join('')}<circle class="port port--malta" r="4" cx="${f(malta[0])}" cy="${f(malta[1])}" style="fill:var(--gold-leaf,#F1C86A);--i:31"/></g>
  ${luzzu}
</svg>`
}

export function setDraw(svg: SVGElement, p: number): void { svg.style.setProperty('--draw', Math.min(1, Math.max(0, p)).toFixed(4)) }
