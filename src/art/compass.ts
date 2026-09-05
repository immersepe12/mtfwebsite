/**
 * §9.7 Compass ring — 72 ticks (every 5°, 12 units; every 6th 24) on r 180 about (500,500), an inner hairline
 * ring r 150, cardinal letters in Geist Mono, and a 1 px gold-leaf needle 500,300 → 500,700 that never moves:
 * the world turns, the hand upon the rudder holds.
 *
 *   compassRing()        → SVG string
 *   setYaw(svg, rad)     → the ring counter-rotates by the camera's yaw
 *   radar(svg, on)       → a 30° gold sector sweeps once every 8 s
 */
export function compassRing(): string {
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const l = i % 6 === 0 ? 24 : 12
    return `<line x1="500" y1="${320 - l}" x2="500" y2="320" transform="rotate(${i * 5} 500 500)"${i % 6 === 0 ? ' stroke-opacity=".8"' : ''}/>`
  }).join('')
  const letter = (t: string, x: number, y: number) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" style="font:500 28px var(--font-mono,ui-monospace,Menlo,monospace);letter-spacing:.24em;fill:var(--star,#FFF9EA)" fill-opacity=".8">${t}</text>`
  return `<svg class="glyph glyph--compass" aria-hidden="true" viewBox="0 0 1000 1000" fill="none" stroke-width="1" style="stroke:var(--star,#FFF9EA)" stroke-opacity=".5">
  <style>
    .glyph--compass .ring { transform-box: view-box; transform-origin: 500px 500px; transform: rotate(var(--yaw, 0rad)); }
    .glyph--compass .radar { transform-box: view-box; transform-origin: 500px 500px; opacity: 0; transition: opacity .32s linear; }
    .glyph--compass.is-radar .radar { opacity: .3; animation: compass-radar 8s linear infinite; }
    @keyframes compass-radar { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .glyph--compass.is-radar .radar { animation: none; } }
  </style>
  <path class="radar" d="M500,500 L500,320 A180,180 0 0 1 590,344.1 Z" stroke="none" style="fill:var(--gold,#D9A441)"/>
  <g class="ring">
    <g class="ticks">${ticks}</g>
    <circle cx="500" cy="500" r="150"/>
    <g class="cardinals" stroke="none">${letter('N', 500, 264)}${letter('E', 738, 502)}${letter('S', 500, 740)}${letter('W', 262, 502)}</g>
  </g>
  <line class="needle" x1="500" y1="300" x2="500" y2="700" stroke-opacity="1" style="stroke:var(--gold-leaf,#F1C86A)" vector-effect="non-scaling-stroke" pathLength="1"/>
  <circle class="pivot" cx="500" cy="500" r="3" stroke="none" style="fill:var(--gold-leaf,#F1C86A)"/>
</svg>`
}

export function setYaw(svg: SVGElement, rad: number): void { svg.style.setProperty('--yaw', `${(-rad).toFixed(4)}rad`) }
export function radar(svg: SVGElement, on: boolean): void { svg.classList.toggle('is-radar', on) }
