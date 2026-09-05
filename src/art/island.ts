/**
 * §9.5 Ogygia — the island (viewBox 0 0 1600 400, shore on the bottom edge = the horizon).
 * Stepped flat-topped mesas — a back plateau, a left shelf, a right cliff — as three `currentColor` fills
 * at .8 / .9 / 1 so the steps read in a flat silhouette (one hue, three densities: aerial perspective).
 * The Ramla notch is a shallow crescent bitten out of the shore, and the cave is an almond hole,
 * both cut with one mask so the sea and the star show through.
 *
 *   island()   → SVG string          ripples()  → three concentric ellipses (pathLength 1) for the touch point
 */
let uid = 0

export function island(): string {
  const id = `ogygia-${++uid}`
  return `<svg class="glyph glyph--island" aria-hidden="true" viewBox="0 0 1600 400" preserveAspectRatio="xMidYMax meet" fill="currentColor">
  <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="400">
    <rect width="1600" height="400" fill="#fff"/>
    <path class="island__ramla" d="M520,400 q140,-44 280,0 Z" fill="#000"/>
    <path class="island__cave" d="M640,350 q60,-34 120,0 q-60,34 -120,0" fill="#000"/>
  </mask></defs>
  <g class="island__land" mask="url(#${id})">
    <path class="island__back" opacity=".8" d="M360,400 L430,232 L560,222 L900,216 L1120,246 L1240,400 Z"/>
    <path class="island__mid" opacity=".9" d="M180,400 L250,318 L520,300 L600,312 L700,336 L760,400 Z"/>
    <path class="island__front" d="M560,400 L640,350 L900,335 L1060,344 L1300,332 L1420,400 Z"/>
  </g>
</svg>`
}

export function ripples(): string {
  return `<svg class="glyph glyph--ripples" aria-hidden="true" viewBox="0 0 400 120" fill="none" stroke-width="1" style="stroke:var(--star,#FFF9EA)" stroke-opacity=".5">
  <ellipse class="ripple" data-i="0" cx="200" cy="60" rx="40" ry="10" pathLength="1"/>
  <ellipse class="ripple" data-i="1" cx="200" cy="60" rx="90" ry="22" pathLength="1"/>
  <ellipse class="ripple" data-i="2" cx="200" cy="60" rx="150" ry="36" pathLength="1"/>
</svg>`
}
