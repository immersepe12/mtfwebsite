/**
 * §9.1 The star — one gold tessera of light.
 * Gold disc r 6, four tapered diffraction spikes (60 units at 0°/90°, 30 at 45°) and a
 * radial halo r 40 that falls to nothing. Pure: returns an SVG string with aria-hidden.
 * Colours are tokens with hex fallbacks so the preloader (before tokens.css) still shines.
 *
 *   star(size = 14, { spikes: 4, halo: true })   → <svg class="glyph glyph--star">
 *   starSymbol(id)                               → <symbol id="…" viewBox="-60 -60 120 120"> for <use>
 *   starGlyph({ spikes, halo, haloId })          → the raw inner markup (no <svg>) for compositing
 */
let uid = 0

const GOLD = 'var(--gold-leaf,#F1C86A)'
const CORE = 'var(--star,#FFF9EA)'

/** The four spikes: long pair on the axes, short pair on the diagonals — tapered polygons, never lines. */
function spikes(n: number): string {
  if (n <= 0) return ''
  const long = (rot: number) => `<polygon points="0,-60 1.7,-9 0,-3 -1.7,-9" transform="rotate(${rot})"/>`
  const short = (rot: number) => `<polygon points="0,-30 1.1,-8 0,-3 -1.1,-8" transform="rotate(${rot})"/>`
  let s = ''
  const axes = n >= 4 ? [0, 90, 180, 270] : n === 2 ? [0, 180] : [0]
  for (const a of axes) s += long(a)
  if (n >= 8) for (const a of [45, 135, 225, 315]) s += short(a)
  else if (n >= 4) for (const a of [45, 135, 225, 315]) s += short(a).replace('points="0,-30 1.1,-8 0,-3 -1.1,-8"', 'points="0,-30 .9,-8 0,-3 -.9,-8"')
  return `<g class="star__spikes" style="fill:${GOLD}">${s}</g>`
}

/** Inner markup in the −60..60 box (no <svg> wrapper). */
export function starGlyph(opts: { spikes?: number; halo?: boolean; haloId?: string } = {}): string {
  const n = opts.spikes ?? 4, halo = opts.halo ?? true
  const id = opts.haloId ?? `starHalo-${++uid}`
  return `${halo ? `<defs><radialGradient id="${id}"><stop offset="0" style="stop-color:${GOLD}" stop-opacity=".55"/><stop offset=".35" style="stop-color:${GOLD}" stop-opacity=".16"/><stop offset="1" style="stop-color:${GOLD}" stop-opacity="0"/></radialGradient></defs><circle class="star__halo" r="40" fill="url(#${id})"/>` : ''}${spikes(n)}<circle class="star__disc" r="6" style="fill:${GOLD}"/><circle class="star__core" r="2.2" style="fill:${CORE}"/>`
}

/** A reusable <symbol> (viewBox −60 −60 120 120) — reference with <use href="#id" …>. */
export function starSymbol(id = 'theStar', opts: { spikes?: number; halo?: boolean } = {}): string {
  return `<symbol id="${id}" viewBox="-60 -60 120 120" overflow="visible">${starGlyph({ ...opts, haloId: `${id}-halo` })}</symbol>`
}

export function star(size = 14, opts: { spikes?: number; halo?: boolean } = {}): string {
  return `<svg class="glyph glyph--star" aria-hidden="true" width="${size}" height="${size}" viewBox="-60 -60 120 120" overflow="visible">${starGlyph(opts)}</svg>`
}
