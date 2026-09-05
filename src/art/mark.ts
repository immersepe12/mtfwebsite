/**
 * §9.15 The MTF mark — the logo's Mediterranean brushstroke redrawn as ONE 1 px `--star` path.
 * The contour is MED_CONTOUR (traced from brief/refs/mtf-logo.png, Gibraltar → clockwise), smoothed
 * with Catmull-Rom into cubic Béziers. `pathLength="1"` so the header/nav can draw it.
 * Never the raster logo in the film chrome (that lives only in the footer's foundation block).
 *
 *   mark(width = 26)              → <svg width height viewBox="0 0 1000 492"> · height = width / 2.032
 *   medPath(w, h, inset = 0)      → the `d` string of the smoothed outline fitted to w × h (for the routes / plates)
 */
import { MED_ASPECT, MED_CONTOUR } from './constellations'

/** Closed Catmull-Rom (uniform, tension 0) → cubic Bézier path data. */
export function medPath(w = 1000, h = 1000 / MED_ASPECT, inset = 0): string {
  const P = MED_CONTOUR.map(([x, y]) => [inset + x * (w - 2 * inset), inset + y * (h - 2 * inset)])
  const n = P.length
  const f = (v: number) => v.toFixed(1)
  let d = `M${f(P[0][0])},${f(P[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2[0])},${f(p2[1])}`
  }
  return d + ' Z'
}

export function mark(width = 26): string {
  const H = 1000 / MED_ASPECT
  const height = Math.round(width / MED_ASPECT)
  return `<svg class="glyph glyph--mark" aria-hidden="true" width="${width}" height="${height}" viewBox="0 0 1000 ${H.toFixed(0)}" overflow="visible" fill="none"><path class="mark__sea" d="${medPath(1000, H, 14)}" pathLength="1" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round" style="stroke:var(--star,#FFF9EA)"/></svg>`
}
