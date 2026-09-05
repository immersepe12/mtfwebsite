/**
 * §9.13 The net — Calypso's seven years of weaving: two families of hairlines at ±45° (spacing 44; 60 on
 * mobile), `--cream` .55 at .75 px, knots at the intersections (≤ 400), every line pathLength 1, and the
 * cut line down the middle. Each strand is split at the cut so the halves can retreat by side.
 *
 *   net({ w, h, spacing = 44 })  → SVG string
 *   tighten(svg, s)               → scales the strands about the centre
 *   cut(svg, p)                   → the cut draws 0–.3, strands retreat by side .3–1, knots fall
 */
const f = (n: number) => n.toFixed(1)
const hash = (n: number) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s) }

/** Clip the line y = m·x + c to the rect, then split it at x = w/2. Returns [left, right] segments (or null). */
function segs(m: 1 | -1, c: number, w: number, h: number): Array<[number, number, number, number] | null> {
  const ys = (x: number) => m * x + c, xs = (y: number) => (y - c) / m
  const pts: [number, number][] = []
  const push = (x: number, y: number) => { if (x >= -0.01 && x <= w + 0.01 && y >= -0.01 && y <= h + 0.01) pts.push([x, y]) }
  push(0, ys(0)); push(w, ys(w)); push(xs(0), 0); push(xs(h), h)
  if (pts.length < 2) return [null, null]
  pts.sort((a, b) => a[0] - b[0])
  const a = pts[0], b = pts[pts.length - 1]
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1) return [null, null]
  const mid = w / 2
  if (b[0] <= mid) return [[a[0], a[1], b[0], b[1]], null]
  if (a[0] >= mid) return [null, [a[0], a[1], b[0], b[1]]]
  return [[a[0], a[1], mid, ys(mid)], [mid, ys(mid), b[0], b[1]]]
}

export function net({ w, h, spacing = 44 }: { w: number; h: number; spacing?: number }): string {
  const step = spacing * Math.SQRT2 // vertical pitch of ±45° lines at perpendicular spacing `spacing`
  const cA: number[] = [], cB: number[] = []
  const off = (h / 2 - w / 2) % step
  for (let c = -w - step; c <= h + step; c += step) { cA.push(c + off) }   // y = x + c
  const off2 = (h / 2 + w / 2) % step
  for (let c = -step; c <= h + w + step; c += step) { cB.push(c + off2) }  // y = −x + c
  let left = '', right = ''
  const line = (s: [number, number, number, number], cls: string) => `<line class="${cls}" x1="${f(s[0])}" y1="${f(s[1])}" x2="${f(s[2])}" y2="${f(s[3])}" pathLength="1"/>`
  cA.forEach(c => { const [l, r] = segs(1, c, w, h); if (l) left += line(l, 'a'); if (r) right += line(r, 'a') })
  cB.forEach(c => { const [l, r] = segs(-1, c, w, h); if (l) left += line(l, 'b'); if (r) right += line(r, 'b') })
  // knots at the intersections: x = (cB − cA)/2, y = (cA + cB)/2
  const knotPts: [number, number][] = []
  cA.forEach(a => cB.forEach(b => { const x = (b - a) / 2, y = (a + b) / 2; if (x > 2 && x < w - 2 && y > 2 && y < h - 2) knotPts.push([x, y]) }))
  const keep = Math.min(1, 400 / Math.max(1, knotPts.length))
  let kl = '', kr = ''
  knotPts.forEach((p, i) => {
    if (hash(i + 1) > keep) return
    const k = `<circle class="knot" cx="${f(p[0])}" cy="${f(p[1])}" r="1.5" style="--k:${(0.6 + hash(i + 7) * 0.8).toFixed(2)}"/>`
    if (p[0] < w / 2) kl += k; else kr += k
  })
  return `<svg class="glyph glyph--net" aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" stroke-width=".75" style="stroke:var(--cream,#FFF7E1);--cut:0;--tight:1">
  <style>
    .glyph--net { --retreat: clamp(0, calc((var(--cut, 0) - .3) / .7), 1); }
    .glyph--net .strands { transform-box: view-box; transform-origin: 50% 50%; transform: scale(var(--tight, 1)); }
    .glyph--net .side { transition: none; }
    .glyph--net .side--l { transform: translateX(calc(var(--retreat) * ${f(-w * 0.55)}px)); opacity: calc(1 - var(--retreat)); }
    .glyph--net .side--r { transform: translateX(calc(var(--retreat) * ${f(w * 0.55)}px)); opacity: calc(1 - var(--retreat)); }
    .glyph--net .knot { transform: translateY(calc(var(--retreat) * var(--k, 1) * ${f(h * 0.7)}px)); opacity: calc(1 - var(--retreat) * 1.4); }
    .glyph--net .cut { stroke-dasharray: 1; }
  </style>
  <g class="strands" stroke-opacity=".55">
    <g class="side side--l">${left}<g class="knots" stroke="none" style="fill:var(--cream,#FFF7E1)" fill-opacity=".7">${kl}</g></g>
    <g class="side side--r">${right}<g class="knots" stroke="none" style="fill:var(--cream,#FFF7E1)" fill-opacity=".7">${kr}</g></g>
  </g>
  <line class="cut" x1="${f(w / 2)}" y1="0" x2="${f(w / 2)}" y2="${f(h)}" stroke-width="2" pathLength="1" stroke-dashoffset="1"/>
</svg>`
}

export function tighten(svg: SVGElement, s: number): void { svg.style.setProperty('--tight', s.toFixed(4)) }

export function cut(svg: SVGElement, p: number): void {
  const q = Math.min(1, Math.max(0, p))
  svg.querySelector('.cut')?.setAttribute('stroke-dashoffset', (1 - Math.min(1, q / 0.3)).toFixed(4))
  svg.style.setProperty('--cut', q.toFixed(4))
}
