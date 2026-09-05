/**
 * §9.3 Zeus' bolt — one cream polyline (stroke 2, pathLength 1) with a blurred gold-leaf twin behind it,
 * plus one short fork at 40%. Drawn with stroke-dashoffset 1 → 0 in 60 ms (`strike()`), never eased.
 *
 *   bolt()               → SVG string (viewBox 0 0 1000 1000, stretched to the frame like the stub)
 *   strike(svg, on)      → toggles `.is-struck` (draws / resets)
 */
let uid = 0
const PTS = '680,60 630,300 690,360 560,560 600,600 520,700'
const FORK = '630,300 560,380 585,430'

export function bolt(): string {
  const id = `boltGlow-${++uid}`
  return `<svg class="glyph glyph--bolt" aria-hidden="true" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" stroke-linejoin="round" stroke-linecap="round">
  <style>
    .glyph--bolt .bolt-line, .glyph--bolt .bolt-glow, .glyph--bolt .bolt-fork { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset 60ms linear; }
    .glyph--bolt.is-struck .bolt-line, .glyph--bolt.is-struck .bolt-glow { stroke-dashoffset: 0; }
    .glyph--bolt.is-struck .bolt-fork { stroke-dashoffset: 0; transition-delay: 30ms; }
  </style>
  <defs><filter id="${id}" x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation="6"/></filter></defs>
  <polyline class="bolt-glow" points="${PTS}" stroke-width="7" filter="url(#${id})" pathLength="1" style="stroke:var(--gold-leaf,#F1C86A)" stroke-opacity=".85"/>
  <polyline class="bolt-fork" points="${FORK}" stroke-width="1.25" pathLength="1" style="stroke:var(--cream,#FFF7E1)" stroke-opacity=".4"/>
  <polyline class="bolt-line" points="${PTS}" stroke-width="2" pathLength="1" style="stroke:var(--cream,#FFF7E1)"/>
</svg>`
}

export function strike(svg: SVGElement, on = true): void { svg.classList.toggle('is-struck', on) }
