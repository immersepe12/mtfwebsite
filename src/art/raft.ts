/**
 * §9.14 The raft — rebuilt from the wreck. Five planks (the shatter's survivor shapes, 520 × 38 quads
 * with irregular ends) lashed into rows, two battens, a mast and a sand sail that can turn gold-leaf
 * (`--sail-fill`). Planks and mast are `currentColor`.
 *
 *   raft()              → SVG string (viewBox 0 0 1000 1000; deck 240..760 × 560..774)
 *   assemble(svg, p)    → planks arc in from the bottom-left third (stagger .08), battens drop, mast rises, sail unfurls
 *   bob(svg, t)         → rotate ±1.5°, translateY ±4 (the sea under it)
 */
const PLANKS = [
  '0,4 512,0 520,18 514,38 6,36 0,22',
  '4,0 520,6 516,24 520,38 0,34 2,16',
  '0,2 508,0 520,20 506,38 8,38 0,26',
  '6,0 520,2 518,22 512,38 0,36 4,18',
  '0,6 516,0 520,22 516,38 10,36 0,24',
]
const ROW_Y = (i: number) => 560 + i * 44
const START = [
  { x: 40, y: 900, r: -34 }, { x: 180, y: 940, r: 22 }, { x: 90, y: 820, r: -12 }, { x: 260, y: 880, r: 38 }, { x: 20, y: 780, r: -50 },
]
let uid = 0

export function raft(): string {
  const id = `sail-${++uid}`
  const planks = PLANKS.map((pts, i) => `<g class="plank" data-i="${i}" transform="translate(240 ${ROW_Y(i)})"><polygon points="${pts}" fill="currentColor"/></g>`).join('')
  const lash = (x: number, y: number) => `<g class="lash" transform="translate(${x} ${y})" style="stroke:var(--gold,#D9A441)" stroke-width="1.5" fill="none"><line x1="-12" y1="-12" x2="12" y2="12"/><line x1="12" y1="-12" x2="-12" y2="12"/></g>`
  return `<svg class="glyph glyph--raft" aria-hidden="true" viewBox="0 0 1000 1000" overflow="visible">
  <defs><clipPath id="${id}"><rect class="sail__clip" x="504" y="300" width="0" height="240"/></clipPath></defs>
  <g class="raft">
    <g class="planks">${planks}</g>
    <g class="battens" fill="currentColor">
      <rect class="batten" data-i="0" x="240" y="546" width="520" height="14" rx="2"/>
      <rect class="batten" data-i="1" x="240" y="774" width="520" height="14" rx="2"/>
    </g>
    <g class="lashings" opacity="0">${lash(262, 553)}${lash(738, 553)}${lash(262, 781)}${lash(738, 781)}</g>
    <rect class="mast" x="496" y="300" width="8" height="260" fill="currentColor" transform="translate(500 560) scale(1 0) translate(-500 -560)"/>
    <polygon class="sail" points="504,310 700,420 504,530" clip-path="url(#${id})" style="fill:var(--sail-fill,var(--sand,#E8DCC2))"/>
  </g>
</svg>`
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)))

export function assemble(svg: SVGElement, p: number): void {
  const q = Math.min(1, Math.max(0, p))
  svg.style.setProperty('--assemble', q.toFixed(4))
  svg.querySelectorAll<SVGGElement>('.plank').forEach((g, i) => {
    const s = START[i], e = easeOut(seg(q, i * 0.08, i * 0.08 + 0.56))
    const x = s.x + (240 - s.x) * e, y = s.y + (ROW_Y(i) - s.y) * e - Math.sin(Math.PI * e) * 140
    const r = s.r * (1 - e)
    g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)} 260 19)`)
    g.setAttribute('opacity', e > 0 || q > 0 ? '1' : '0')
  })
  svg.querySelectorAll<SVGRectElement>('.batten').forEach((r, i) => {
    const e = easeOut(seg(q, 0.56 + i * 0.06, 0.78 + i * 0.06))
    r.setAttribute('transform', `translate(0 ${((1 - e) * -160).toFixed(1)})`)
    r.setAttribute('opacity', e.toFixed(3))
  })
  const lash = easeOut(seg(q, 0.78, 0.88))
  svg.querySelector('.lashings')?.setAttribute('opacity', lash.toFixed(3))
  const mast = easeOut(seg(q, 0.72, 0.9))
  svg.querySelector('.mast')?.setAttribute('transform', `translate(500 560) scale(1 ${mast.toFixed(4)}) translate(-500 -560)`)
  const sail = easeOut(seg(q, 0.86, 1))
  svg.querySelector('.sail__clip')?.setAttribute('width', (sail * 200).toFixed(1))
}

export function bob(svg: SVGElement, t: number): void {
  const g = svg.querySelector<SVGGElement>('.raft')
  if (!g) return
  g.style.transformBox = 'view-box'
  g.style.transformOrigin = '500px 660px'
  g.style.transform = `translateY(${(Math.sin(t) * 4).toFixed(2)}px) rotate(${(Math.sin(t * 0.7) * 1.5).toFixed(3)}deg)`
}
