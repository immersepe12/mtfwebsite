/**
 * §9.4 The constellation of the eleven — and the Mediterranean as data.
 *
 * MED_OUTLINE_11 — eleven anchors in 0..1 of the logo brushstroke's bounding box
 * (traced from brief/refs/mtf-logo.png), clockwise from Gibraltar; index 10 is Malta.
 * MED_CONTOUR   — the dense outline (43 points, same space) used by the mark and the routes.
 * MED_ASPECT    — width / height of that box (the y values are normalised to the box height).
 * ORION / URSA_MAJOR — vertex lists for the stars layer's second set.
 * fitOutline(w, h)  — the outline's box fitted (aspect kept) into a w × h frame's centre 70 %; shared by the DOM
 *                     constellation() and the stars layer's GL set 1 so both land on the same anchors.
 * constellation({ w, h }) — DOM SVG: 11 stars, hairline edges (pathLength 1), the spear beyond Malta, label anchors.
 */
import { starSymbol } from './star'

export const MED_ASPECT = 2.032

/** Gibraltar · Balearic coast · Gulf of Lion · head of the Adriatic · Aegean · Levant NE · Nile · Sirte · Gabès · Cap Bon · Malta */
export const MED_OUTLINE_11: [number, number][] = [
  [0.00, 0.58], [0.13, 0.34], [0.22, 0.14], [0.44, 0.00], [0.74, 0.31], [0.99, 0.55],
  [0.98, 0.92], [0.81, 0.98], [0.58, 0.99], [0.38, 0.78], [0.67, 0.60],
]

export const MED_CONTOUR: [number, number][] = [
  [0, 0.576], [0.102, 0.511], [0.12, 0.452], [0.125, 0.336], [0.204, 0.235], [0.202, 0.184], [0.215, 0.143], [0.247, 0.12],
  [0.292, 0.138], [0.381, 0.083], [0.406, 0.124], [0.417, 0.042], [0.444, 0], [0.494, 0.037], [0.603, 0.23], [0.628, 0.415],
  [0.655, 0.493], [0.671, 0.475], [0.671, 0.346], [0.696, 0.313], [0.739, 0.309], [0.782, 0.387], [0.796, 0.498], [0.821, 0.562],
  [0.989, 0.553], [1, 0.59], [0.982, 0.788], [0.989, 0.885], [0.977, 0.917], [0.957, 0.945], [0.809, 0.977], [0.719, 0.908],
  [0.644, 0.885], [0.615, 0.986], [0.56, 0.995], [0.474, 0.866], [0.388, 0.802], [0.379, 0.774], [0.386, 0.636], [0.37, 0.608],
  [0.209, 0.641], [0.052, 0.724], [0.018, 0.705],
]

/** Betelgeuse · Bellatrix · Meissa · Alnitak · Alnilam · Mintaka · Saiph · Rigel */
export const ORION: { points: [number, number][]; edges: [number, number][] } = {
  points: [[0.36, 0.12], [0.62, 0.16], [0.49, 0.02], [0.42, 0.46], [0.49, 0.48], [0.56, 0.50], [0.38, 0.86], [0.66, 0.84]],
  edges: [[0, 2], [2, 1], [0, 3], [1, 5], [3, 4], [4, 5], [3, 6], [5, 7]],
}
/** Dubhe · Merak · Phecda · Megrez · Alioth · Mizar · Alkaid */
export const URSA_MAJOR: { points: [number, number][]; edges: [number, number][] } = {
  points: [[0.12, 0.30], [0.16, 0.52], [0.38, 0.56], [0.40, 0.36], [0.58, 0.34], [0.74, 0.28], [0.92, 0.40]],
  edges: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
}

const f = (n: number) => n.toFixed(1)

/**
 * The outline's bounding box (MED_ASPECT kept) fitted into the centre 70 % of a w × h frame: 70 % of the width,
 * unless that would exceed 70 % of the height (portrait), in which case 70 % of the height. Returns the box's
 * origin and size in the frame's units — anchor i sits at (ox + x·sw, oy + y·sh) for MED_OUTLINE_11[i] = [x, y].
 * Pure; the same fit for the DOM (`constellation()`, Ch 03's labels) and the GL (stars layer, set 1).
 */
export function fitOutline(w: number, h: number): { ox: number; oy: number; sw: number; sh: number } {
  let sw = w * 0.7, sh = sw / MED_ASPECT
  if (sh > h * 0.7) { sh = h * 0.7; sw = sh * MED_ASPECT }
  return { ox: (w - sw) / 2, oy: (h - sh) / 2, sw, sh }
}

/**
 * Returns an SVG (w × h) with 11 stars at the outline points fitted (aspect kept) into the frame's centre 70%,
 * hairline edges (`.c-edge`, pathLength 1), the spear beyond Malta (`.c-spear`) and label anchors `<text class="c-label" data-i>`.
 * Malta (data-i="10") is the largest star.
 */
export function constellation({ w, h }: { w: number; h: number }): string {
  const { ox, oy, sw, sh } = fitOutline(w, h)
  const pts = MED_OUTLINE_11.map(([x, y]) => [ox + x * sw, oy + y * sh] as [number, number])
  const edges = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length]
    return `<line class="c-edge" data-i="${i}" x1="${f(p[0])}" y1="${f(p[1])}" x2="${f(q[0])}" y2="${f(q[1])}" pathLength="1"/>`
  }).join('')
  // the spear: the last edge (Cap Bon → Malta) carried on past Malta, ×1.6, at 20% — the diagonal of the folk frames
  const a = pts[9], m = pts[10]
  const dx = m[0] - a[0], dy = m[1] - a[1]
  const spear = `<line class="c-spear" x1="${f(m[0])}" y1="${f(m[1])}" x2="${f(m[0] + dx * 1.6)}" y2="${f(m[1] + dy * 1.6)}" pathLength="1" stroke-opacity=".2"/>`
  const s = Math.max(0.09, Math.min(0.16, sw / 5200))
  const stars = pts.map((p, i) => {
    const k = i === 10 ? s * 1.5 : s
    return `<g class="c-star" data-i="${i}" transform="translate(${f(p[0])} ${f(p[1])})"><use href="#theStar" transform="scale(${k.toFixed(3)})" x="-60" y="-60" width="120" height="120"/><text class="c-label index" data-i="${i}" x="${i === 10 ? 16 : 12}" y="4"></text></g>`
  }).join('')
  return `<svg class="glyph glyph--constellation" aria-hidden="true" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible"><defs>${starSymbol('theStar')}</defs><g class="c-edges" fill="none" stroke-width="1" style="stroke:var(--star,#FFF9EA)" stroke-opacity=".45">${edges}${spear}</g><g class="c-stars">${stars}</g></svg>`
}
