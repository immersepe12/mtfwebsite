/**
 * §9.2 Helios' cattle — the frieze (viewBox 0 0 1600 220, feet on the bottom edge = the horizon).
 * Seven flat silhouettes in `currentColor`, facing left, built from primitives only:
 * body rect·rx, neck polygon, head rect·rx, two horn crescents, four legs, a tail — and the brand,
 * a hole cut through the flank by a mask so the ember behind shows through.
 *
 *   cattle()                → SVG string
 *   setProgress(svg, p)     → the herd walks (translateX −40·p) and the legs alternate ±6° on a steps(4) cadence
 */
let uid = 0
const XS = [140, 250, 380, 470, 600, 720, 840]
const SCALES = [1, 0.8, 1, 0.75, 0.9, 1, 0.8]
const FEET = 142 // local y of the hooves

function cow(x: number, s: number, i: number, maskId: string): string {
  // local space 0..190 × 0..150, facing right; flipped to face left by scale(-1 1)
  return `<g class="cow" data-i="${i}" transform="translate(${x} ${(220 - FEET * s).toFixed(1)}) scale(${s}) scale(-1 1) translate(-190 0)">
    <g class="cow__body" mask="url(#${maskId})">
      <rect x="0" y="40" width="120" height="56" rx="24"/>
      <polygon points="108,48 150,30 150,70 118,86"/>
      <rect x="140" y="22" width="44" height="34" rx="12"/>
    </g>
    <g class="cow__horns" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">
      <path d="M158,24 q-2,-14 -16,-22"/>
      <path d="M174,24 q2,-16 -8,-26"/>
    </g>
    <path class="cow__tail" d="M2,52 q-16,10 -10,40" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <g class="leg leg--b1"><rect x="14" y="88" width="10" height="54" rx="4"/></g>
    <g class="leg leg--b2"><rect x="34" y="88" width="10" height="54" rx="4"/></g>
    <g class="leg leg--f1"><rect x="82" y="88" width="10" height="54" rx="4" transform="rotate(-4 87 88)"/></g>
    <g class="leg leg--f2"><rect x="102" y="88" width="10" height="54" rx="4" transform="rotate(4 107 88)"/></g>
  </g>`
}

export function cattle(): string {
  const maskId = `brand-${++uid}`
  const herd = XS.map((x, i) => cow(x, SCALES[i], i, maskId)).join('')
  return `<svg class="glyph glyph--cattle" aria-hidden="true" viewBox="0 0 1600 220" preserveAspectRatio="xMidYMax meet" fill="currentColor" data-step="0" style="--walk:0">
  <style>
    .glyph--cattle .herd { transform: translateX(calc(var(--walk, 0) * -40px)); }
    .glyph--cattle .leg { transform-box: fill-box; transform-origin: 50% 0; }
    .glyph--cattle[data-step="0"] .leg--f1, .glyph--cattle[data-step="0"] .leg--b2 { transform: rotate(6deg); }
    .glyph--cattle[data-step="0"] .leg--f2, .glyph--cattle[data-step="0"] .leg--b1 { transform: rotate(-6deg); }
    .glyph--cattle[data-step="2"] .leg--f1, .glyph--cattle[data-step="2"] .leg--b2 { transform: rotate(-6deg); }
    .glyph--cattle[data-step="2"] .leg--f2, .glyph--cattle[data-step="2"] .leg--b1 { transform: rotate(6deg); }
  </style>
  <defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="-20" y="0" width="240" height="160"><rect x="-20" y="0" width="240" height="160" fill="#fff"/><circle cx="60" cy="62" r="6" fill="#000"/></mask></defs>
  <g class="herd">${herd}</g>
</svg>`
}

/** Walk: the herd drifts left 40 units across p; legs step on a 4-frame cadence (the only steps() the bible allows). */
export function setProgress(svg: SVGElement, p: number): void {
  const q = Math.min(1, Math.max(0, p))
  svg.style.setProperty('--walk', q.toFixed(4))
  svg.setAttribute('data-step', String(Math.floor(q * 40) % 4))
}
