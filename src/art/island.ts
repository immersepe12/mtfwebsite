/**
 * §9.5 Ogygia — the water rings where the star touches down. (The island itself is modelled in the world:
 * gl/layers/island.ts. It used to be a flat ink silhouette here.)
 *
 *   ripples()  → three concentric ellipses (pathLength 1) for the touch point
 */

export function ripples(): string {
  return `<svg class="glyph glyph--ripples" aria-hidden="true" viewBox="0 0 400 120" fill="none" stroke-width="1" style="stroke:var(--star,#FFF9EA)" stroke-opacity=".5">
  <ellipse class="ripple" data-i="0" cx="200" cy="60" rx="40" ry="10" pathLength="1"/>
  <ellipse class="ripple" data-i="1" cx="200" cy="60" rx="90" ry="22" pathLength="1"/>
  <ellipse class="ripple" data-i="2" cx="200" cy="60" rx="150" ry="36" pathLength="1"/>
</svg>`
}
