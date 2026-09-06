/**
 * tesserae-formations — the rasteriser behind the instanced tessera field (DESIGN-BIBLE §8.5).
 *
 * Turns the three SVG silhouettes (src/art/formations/*.svg) and three procedural shapes into
 * per-instance data for exactly N instances: six formation targets (vec3), six palette tints
 * (quantised indices, packed), a finger group, a scatter shell and a disc UV for the write masks.
 *
 * Everything here runs ONCE at init (synchronously — the SVGs are parsed and drawn with Path2D on an
 * offscreen canvas, no <img> round-trip) and allocates nothing afterwards.
 *
 * THE LATTICE. A tessera is small: the pitch of every formation is chosen so a tile lands at roughly
 * 6–9 CSS px at that formation's viewing distance (island ≈ 9 units, hand ≈ 5, hero disc ≈ 8) — the
 * field must read as cut stone, never as a pixel grid. `fitCells` then walks the pitch up until the
 * formation fits the instance budget, so the picture is never truncated. Each instance's quad is one
 * pitch × BED (a 6% overlap) so the dark grout bed under the tiles is continuous — no sea shows
 * between neighbours, and the slab reads as a laid floor rather than confetti. Cell jitter is a few
 * per cent of the pitch (not a fifth of it) for the same reason; the *visible* irregularity — ±12%
 * tile size, ±7° rotation, ±7° seat — is carved per-tile inside that quad by the shader.
 *
 * TONE. Tints are clustered by a value noise rather than picked per tile, so the mosaic has fields of
 * stone and fields of gold the way a Ravenna pavement does, instead of salt-and-pepper.
 *
 * Formation indices are STORY ORDER (mood.tessForm):
 *   0 hero sun disc · 1 the Mediterranean · 2 the fist · 3 the open hand · 4 the sunrise path · 5 the dawn disc
 *
 * Targets for 1, 4 and 5 are stored RELATIVE to a live anchor the layer feeds per frame
 * (1: the sea height; 4 and 5: the sun's position), so the island always lies on the water and the
 * dawn disc / sunrise path always sit where the chapter has put the sun.
 */
import type { RGB } from '../../engine/mood'
import mediterraneanSvg from '../../art/formations/mediterranean.svg?raw'
import fistSvg from '../../art/formations/hand-fist.svg?raw'
import openSvg from '../../art/formations/hand-open.svg?raw'

// ── palette (quantised tints; indices are what the packed attribute carries) ─────────────────────
export const TINT = { NONE: 0, GOLD_LEAF: 1, GOLD: 2, GOLD_DEEP: 3, STONE: 4, TERRA: 5, SEA: 6, ABYSS: 7, INK: 8, LAGOON: 9 } as const
export type TintIndex = (typeof TINT)[keyof typeof TINT]

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
const lin = (h: string): RGB => {
  const n = parseInt(h.replace('#', ''), 16)
  return [srgbToLinear(((n >> 16) & 255) / 255), srgbToLinear(((n >> 8) & 255) / 255), srgbToLinear((n & 255) / 255)]
}
/** Linear-light palette, indexed by TINT. Hex literals are the bible's tokens (§3.1). */
export const PALETTE: RGB[] = [
  [0, 0, 0],       // 0 none (invisible)
  lin('#F1C86A'),  // 1 gold-leaf
  lin('#D9A441'),  // 2 gold
  lin('#A67C2E'),  // 3 gold-deep
  lin('#D6C39C'),  // 4 stone
  lin('#8C3A2B'),  // 5 terra
  lin('#0E3D57'),  // 6 sea
  lin('#06192B'),  // 7 abyss (sea-deep)
  lin('#090D16'),  // 8 press-ink
  lin('#2B8FA3'),  // 9 lagoon
]

export const FORMATION_COUNT = 6
export const DISC_RADIUS = 2.2
export const DAWN_RADIUS = 1.2
/** The Mediterranean slab's tilt about its own x-axis (far edge lifted toward the camera's eye) — §8.5 `aUp` for formation 1. */
export const ISLAND_TILT = (25 * Math.PI) / 180
/** The tile quad is one pitch × BED — the small overlap that keeps the grout bed continuous under the field. */
export const BED = 1.06

/** World anchors chapters may want (palm centre for the star, Malta for a label, disc centres). */
export interface FormationAnchors {
  hero: [number, number, number]
  island: [number, number, number]   // the tilted slab's centre; y is relative to seaY (the near coast sits at seaY + .06)
  /** rotation of the island about its own x-axis (radians, far edge lifted toward the sky) — a point at local (x, 0, z) sits at (x, −z·sin, z·cos) from `island` */
  islandTilt: number
  malta: [number, number, number]    // y is relative to seaY
  palm: [number, number, number]
  path: [number, number, number]     // relative to (sunX, seaY, sunZ)
  dawn: [number, number, number]     // relative to (sunX, sunY, sunZ)
}

export interface FormationData {
  count: number
  /** six Float32Array(N*3) — formation targets (1/4/5 relative to their live anchor) */
  targets: Float32Array[]
  /** Float32Array(N*4): seed, group (+8 flags the Malta tile), tintA (formations 0–2 packed base 16), tintB (3–5) */
  meta: Float32Array
  /** Float32Array(N*3): unit-shell direction × radius (r 14–20, flattened ×.6 in y) around the hero field — far enough that loose tiles read as distant glints */
  scatter: Float32Array
  /** Float32Array(N*2): the tile's UV on the disc (formations 0 and 5) for the write masks */
  discUV: Float32Array
  /** per-formation quad edge (world units) = the cell pitch × BED */
  scale: number[]
  /** per-formation 1 = lies flat on the sea, 0 = billboard toward the camera */
  flat: number[]
  /** per-formation rotation of the flat basis about the formation's x-axis (radians; only the island is tilted) */
  tilt: number[]
  /** how many instances each formation actually uses */
  used: number[]
  anchors: FormationAnchors
}

// ── deterministic PRNG so every load lays the same mosaic ────────────────────────────────────────
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Smooth value noise — clusters the tints into fields of stone and fields of gold (andamento, not confetti). */
function vnoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const h = (i: number, j: number) => { const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return n - Math.floor(n) }
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

interface Cell { x: number; y: number; z: number; group: number; tint: number; k: number }

// ── a tiny synchronous SVG rasteriser (rect / circle / ellipse / path / polygon, g transforms, data-group)
interface RasterResult { cols: number; rows: number; alpha: Uint8ClampedArray; group: Uint8ClampedArray; vb: [number, number, number, number] }

function applyTransform(ctx: CanvasRenderingContext2D, tr: string | null) {
  if (!tr) return
  const re = /(\w+)\s*\(([^)]*)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(tr))) {
    const fn = m[1]
    const a = m[2].split(/[\s,]+/).filter(Boolean).map(Number)
    switch (fn) {
      case 'translate': ctx.translate(a[0] || 0, a[1] || 0); break
      case 'scale': ctx.scale(a[0] ?? 1, a[1] ?? a[0] ?? 1); break
      case 'rotate': {
        const rad = ((a[0] || 0) * Math.PI) / 180
        if (a.length >= 3) { ctx.translate(a[1], a[2]); ctx.rotate(rad); ctx.translate(-a[1], -a[2]) } else ctx.rotate(rad)
        break
      }
      case 'matrix': if (a.length === 6) ctx.transform(a[0], a[1], a[2], a[3], a[4], a[5]); break
      case 'skewX': ctx.transform(1, 0, Math.tan(((a[0] || 0) * Math.PI) / 180), 1, 0, 0); break
      case 'skewY': ctx.transform(1, Math.tan(((a[0] || 0) * Math.PI) / 180), 0, 1, 0, 0); break
    }
  }
}

function drawNode(ctx: CanvasRenderingContext2D, node: Element, group: number) {
  const g = node.getAttribute('data-group')
  const myGroup = g != null && g !== '' ? Math.max(0, Math.min(5, parseInt(g, 10) || 0)) : group
  ctx.save()
  applyTransform(ctx, node.getAttribute('transform'))
  ctx.fillStyle = `rgb(${myGroup * 40},255,0)`
  const n = (name: string, d = 0) => { const v = parseFloat(node.getAttribute(name) ?? ''); return Number.isFinite(v) ? v : d }
  switch (node.tagName) {
    case 'rect': {
      const x = n('x'), y = n('y'), w = n('width'), h = n('height'), rx = n('rx', n('ry')), ry = n('ry', rx)
      ctx.beginPath()
      if (rx > 0 || ry > 0) ctx.roundRect(x, y, w, h, Math.min(rx, w / 2)); else ctx.rect(x, y, w, h)
      ctx.fill()
      break
    }
    case 'circle': ctx.beginPath(); ctx.arc(n('cx'), n('cy'), n('r'), 0, Math.PI * 2); ctx.fill(); break
    case 'ellipse': ctx.beginPath(); ctx.ellipse(n('cx'), n('cy'), n('rx'), n('ry'), 0, 0, Math.PI * 2); ctx.fill(); break
    case 'path': { const d = node.getAttribute('d'); if (d) ctx.fill(new Path2D(d)); break }
    case 'polygon': case 'polyline': {
      const pts = (node.getAttribute('points') ?? '').split(/[\s,]+/).filter(Boolean).map(Number)
      if (pts.length >= 6) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill() }
      break
    }
  }
  for (const child of Array.from(node.children)) drawNode(ctx, child, myGroup)
  ctx.restore()
}

function rasterise(svg: string, cols: number, rows: number): RasterResult | null {
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const root = doc.documentElement
    if (!root || root.tagName !== 'svg') return null
    const vbAttr = (root.getAttribute('viewBox') ?? '0 0 1000 1000').split(/[\s,]+/).map(Number)
    const vb: [number, number, number, number] = vbAttr.length === 4 ? [vbAttr[0], vbAttr[1], vbAttr[2], vbAttr[3]] : [0, 0, 1000, 1000]
    const canvas = document.createElement('canvas')
    canvas.width = cols; canvas.height = rows
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null
    ctx.clearRect(0, 0, cols, rows)
    ctx.scale(cols / vb[2], rows / vb[3])
    ctx.translate(-vb[0], -vb[1])
    for (const child of Array.from(root.children)) drawNode(ctx, child, 0)
    const img = ctx.getImageData(0, 0, cols, rows).data
    const alpha = new Uint8ClampedArray(cols * rows), group = new Uint8ClampedArray(cols * rows)
    for (let i = 0; i < cols * rows; i++) { alpha[i] = img[i * 4 + 3]; group[i] = Math.round(img[i * 4] / 40) }
    return { cols, rows, alpha, group, vb }
  } catch {
    return null
  }
}

// ── formation builders ───────────────────────────────────────────────────────────────────────────
type Placement = 'billboard' | 'flat'

/**
 * Cells from a silhouette. `size` = world width of the viewBox; the silhouette is centred on the viewBox centre.
 * Billboard: viewBox x→+x, y→−y (up). Flat: viewBox x→+x, y→+z toward the camera (top of the drawing is far away).
 * Jitter is a few per cent of the pitch — enough to break the grid, small enough that the grout bed stays sealed.
 */
function silhouetteCells(svg: string, size: number, pitch: number, placement: Placement, rnd: () => number): Cell[] {
  const cols = Math.max(8, Math.min(320, Math.round(size / pitch)))
  const r = rasterise(svg, cols, cols)
  const cells: Cell[] = []
  if (!r) return cells
  const rows = r.rows, h = (size * r.vb[3]) / r.vb[2]
  for (let ry = 0; ry < rows; ry++) for (let cx = 0; cx < cols; cx++) {
    const i = ry * cols + cx
    if (r.alpha[i] < 128) continue
    const jx = (rnd() - 0.5) * 0.05 * pitch, jy = (rnd() - 0.5) * 0.05 * pitch
    const lx = ((cx + 0.5) / cols) * size - size / 2 + jx
    const ly = h / 2 - ((ry + 0.5) / rows) * h + jy      // up
    const jz = (rnd() - 0.5) * 0.30 * pitch              // tiles are not perfectly co-planar (they are set by hand)
    cells.push(placement === 'billboard'
      ? { x: lx, y: ly, z: jz, group: r.group[i], tint: 0, k: rnd() }
      : { x: lx, y: jz * 0.7, z: -ly, group: r.group[i], tint: 0, k: rnd() })
  }
  return cells
}

/** The sun disc: concentric rings (andamento), `rings` deep, radius R. Centre first, outward. */
function discCells(R: number, pitch: number, rnd: () => number): Cell[] {
  const cells: Cell[] = []
  const rings = Math.max(6, Math.round(R / pitch))
  for (let ring = 0; ring < rings; ring++) {
    const r = ((ring + 0.5) / rings) * R
    const n = Math.max(6, Math.floor((2 * Math.PI * r) / pitch))
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + ring * 0.11
      const rr = r + (rnd() - 0.5) * 0.06 * pitch
      cells.push({ x: Math.cos(a) * rr, y: Math.sin(a) * rr, z: (rnd() - 0.5) * 0.3 * pitch, group: 0, tint: 0, k: rnd() })
    }
  }
  return cells
}

/** The sunrise path: a lane on the sea, `len` deep, widening toward the camera (+z). Relative to (sunX, seaY, sunZ). */
function pathCells(len: number, w0: number, w1: number, pitch: number, rnd: () => number): Cell[] {
  const cells: Cell[] = []
  const rows = Math.max(4, Math.round(len / pitch))
  for (let ry = 0; ry < rows; ry++) {
    const t = (ry + 0.5) / rows           // 0 at the sun → 1 near the camera
    const w = w0 + (w1 - w0) * t
    const n = Math.max(2, Math.floor(w / pitch))
    for (let cx = 0; cx < n; cx++) {
      const x = ((cx + 0.5) / n) * w - w / 2 + (rnd() - 0.5) * 0.06 * pitch
      // a soft ragged edge so the lane reads as light on water, not a runway
      if (Math.abs(x) / (w / 2) > 0.82 && rnd() < 0.45) continue
      cells.push({ x, y: 0.04, z: t * len + (rnd() - 0.5) * 0.06 * pitch, group: 0, tint: 0, k: rnd() })
    }
  }
  return cells
}

/** Walks the pitch up until the formation fits the instance budget — a formation is never truncated. */
function fitCells(budget: number, pitch0: number, make: (pitch: number) => Cell[]): { cells: Cell[]; pitch: number } {
  let pitch = pitch0
  let cells = make(pitch)
  for (let k = 0; k < 6 && cells.length > budget; k++) {
    pitch *= Math.max(1.04, Math.sqrt(cells.length / (budget * 0.92)))
    cells = make(pitch)
  }
  if (cells.length > budget) cells = cells.slice(0, budget)
  return { cells, pitch }
}

// ── tint rules (§8.5 table) ──────────────────────────────────────────────────────────────────────
const rampHand = (d: number, k: number): number => {
  const t = Math.max(0, Math.min(1, d + (k - 0.5) * 0.14))
  if (k > 0.92) return TINT.GOLD_LEAF                    // 8% pure gold-leaf glints
  if (t < 0.26) return TINT.GOLD_LEAF
  if (t < 0.52) return TINT.GOLD
  if (t < 0.74) return TINT.GOLD_DEEP
  if (t < 0.90) return TINT.TERRA
  return TINT.STONE
  // The hand is seen against the night: an outer ring of sea/abyss tesserae simply disappears and the fingers
  // read as holes. The ramp still cools outward (leaf → gold → deep → terra → stone) but every stop stays lit.
}

function tintDisc(c: Cell, R: number, gold: 'hero' | 'dawn') {
  const rr = Math.hypot(c.x, c.y) / R
  // a soft field so the gold clusters in patches the way beaten leaf does
  const f = vnoise(c.x * 2.6 + 11, c.y * 2.6 + 5)
  const k = Math.max(0, Math.min(0.999, c.k * 0.55 + f * 0.45))
  if (gold === 'dawn') return k < 0.58 ? TINT.GOLD : k < 0.88 ? TINT.GOLD_LEAF : TINT.GOLD_DEEP
  // 70% gold-leaf/gold by luminance ramp (bright centre), 30% gold-deep/stone by hash
  if (k < 0.3) return k < 0.16 ? TINT.GOLD_DEEP : TINT.STONE
  return rr < 0.42 ? TINT.GOLD_LEAF : rr < 0.8 ? TINT.GOLD : (k < 0.6 ? TINT.GOLD : TINT.GOLD_DEEP)
}

function tintIsland(c: Cell) {
  const f = vnoise(c.x * 1.7 + 3.2, c.z * 1.7 - 1.4)
  const g = vnoise(c.x * 5.1 - 7.0, c.z * 5.1 + 2.0)
  const k = Math.max(0, Math.min(0.999, c.k * 0.34 + f * 0.44 + g * 0.22))
  if (k < 0.06) return TINT.INK           // press-ink, the darkest cut — reads as grout by jitter
  if (k < 0.13) return TINT.SEA
  if (k < 0.19) return TINT.TERRA         // a few warm stones through the limestone
  if (k < 0.47) return TINT.GOLD_DEEP
  return TINT.STONE
}

function tintPath(c: Cell, len: number) {
  const t = c.z / len                     // 0 at the sun
  const f = vnoise(c.x * 3.0 + 21, c.z * 3.0)
  const k = Math.max(0, Math.min(0.999, c.k * 0.5 + f * 0.5))
  if (k < 0.12) return TINT.GOLD_DEEP
  return k < 0.45 + (1 - t) * 0.3 ? TINT.GOLD_LEAF : TINT.GOLD
}

// ── the hand: two states of every finger, paired tile for tile ───────────────────────────────────
const centroidOf = (cells: Cell[]): Cell => {
  if (!cells.length) return { x: 0, y: 0, z: 0, group: 0, tint: 0, k: 0 }
  let x = 0, y = 0, z = 0; for (const c of cells) { x += c.x; y += c.y; z += c.z }
  return { x: x / cells.length, y: y / cells.length, z: z / cells.length, group: 0, tint: 0, k: 0 }
}

/**
 * Pair the two states of each finger by nearest position inside the finger's own bounding box, so a tile of
 * the folded finger becomes the tile at the same relative place on the open finger (the finger unfolds, it
 * does not dissolve). The larger state drives; cells of the smaller state are reused where counts differ.
 */
function handSlots(fist: Cell[], open: Cell[], pFist: number, pOpen: number): [Cell[], Cell[]] {
  const byGroup = (cells: Cell[]) => { const g: Cell[][] = [[], [], [], [], [], []]; for (const c of cells) g[Math.min(5, c.group)].push(c); return g }
  const norm = (cells: Cell[]) => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    for (const c of cells) { x0 = Math.min(x0, c.x); x1 = Math.max(x1, c.x); y0 = Math.min(y0, c.y); y1 = Math.max(y1, c.y) }
    const w = Math.max(1e-4, x1 - x0), h = Math.max(1e-4, y1 - y0)
    return cells.map(c => [(c.x - x0) / w, (c.y - y0) / h] as [number, number])
  }
  // a deterministic sub-pitch offset for a reused cell
  const jit = (n: number) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v) - 0.5 }
  const pair = (a: Cell[], b: Cell[], pa: number, pb: number): [Cell[], Cell[]] => {
    if (!a.length || !b.length) return [a, b]
    const aBig = a.length >= b.length
    const big = aBig ? a : b, small = aBig ? b : a
    const ps = aBig ? pb : pa
    const nb = norm(big), ns = norm(small)
    const matched: Cell[] = new Array(big.length)
    const reuse = new Uint16Array(small.length)
    for (let i = 0; i < big.length; i++) {
      let best = 0, bd = Infinity
      const u = nb[i][0], v = nb[i][1]
      for (let j = 0; j < small.length; j++) { const du = ns[j][0] - u, dv = ns[j][1] - v; const d = du * du + dv * dv; if (d < bd) { bd = d; best = j } }
      // A reused cell is NOT stacked on its twin — that leaves the sparser state full of holes. It is set a
      // sub-pitch away (and a hair behind, so the two never z-fight), so the finger stays a solid mosaic
      // whichever of the two states rasterised to fewer stones.
      const r = reuse[best]
      const c = small[best]
      matched[i] = r
        ? { ...c, x: c.x + jit(best * 2.7 + r * 7.1) * 0.9 * ps, y: c.y + jit(best * 3.3 + r * 11.7 + 5) * 0.9 * ps, z: c.z - r * 0.004 }
        : c
      reuse[best]++
    }
    return aBig ? [big, matched] : [matched, big]
  }
  const fistG = byGroup(fist), openG = byGroup(open)
  const outF: Cell[] = [], outO: Cell[] = []
  for (let g = 0; g < 6; g++) {
    const a0 = fistG[g].sort((p, q) => q.y - p.y || p.x - q.x), b0 = openG[g].sort((p, q) => q.y - p.y || p.x - q.x)
    const [a, b] = pair(a0, b0, pFist, pOpen)
    const n = Math.max(a.length, b.length), ca = centroidOf(a0), cb = centroidOf(b0)
    for (let j = 0; j < n; j++) {
      outF.push(j < a.length ? a[j] : { ...ca, group: g })
      outO.push(j < b.length ? b[j] : { ...cb, group: g })
    }
  }
  return [outF, outO]
}

// ── the builder ─────────────────────────────────────────────────────────────────────────────────
export function buildFormations(N: number, mobile: boolean): FormationData {
  const rnd = mulberry32(0x5eed)
  const budget = Math.floor(N * 0.96)

  // ---- placements (world) -------------------------------------------------------------------
  const HERO: [number, number, number] = [0, 0.9, -4]
  const ISLAND: [number, number, number] = [6.8, 0.06, -9]     // y relative to seaY; a little east of the Ch 04 camera's heading (camX 2, yaw −.32), clear of the island's rock window at x 2.4
  const HAND: [number, number, number] = [0.8, 1.35, -8]       // viewBox centre; palm ≈ .2 below
  const handSize = 4.17                                        // viewBox 1000 → 4.17 world units (open hand ≈ 2.0 tall)
  const islandSize = 7
  const PATH_LEN = 5, PATH_W0 = 1.6, PATH_W1 = 3.2

  // Target pitches: a tessera of ~6–9 CSS px at that formation's viewing distance on a 1440 × 900 stage
  // (fov 42 → 1172/d px per world unit; island d ≈ 9, hand d ≈ 5, hero disc d ≈ 8, path d ≈ 15).
  // Mobile starts coarser and `fitCells` takes the rest of the slack out of the budget.
  const m = mobile ? 1.45 : 1
  const P_DISC = 0.052 * m, P_ISLAND = 0.056 * m, P_HAND = 0.029 * m, P_PATH = 0.070 * m

  // ---- cells per formation ------------------------------------------------------------------
  const discFit = fitCells(budget, P_DISC, p => discCells(DISC_RADIUS, p, rnd))
  const disc = discFit.cells
  for (const c of disc) c.tint = tintDisc(c, DISC_RADIUS, 'hero')
  const dawn: Cell[] = disc.map(c => ({ x: (c.x * DAWN_RADIUS) / DISC_RADIUS, y: (c.y * DAWN_RADIUS) / DISC_RADIUS, z: 0, group: 0, tint: tintDisc(c, DISC_RADIUS, 'dawn'), k: c.k }))

  const islandFit = fitCells(budget, P_ISLAND, p => {
    const c = silhouetteCells(mediterraneanSvg, islandSize, p, 'flat', rnd)
    return c.length ? c : discCells(2.4, p, rnd).map(q => ({ ...q, z: q.y, y: 0 }))   // stub-safe fallback
  })
  const island = islandFit.cells
  for (const c of island) c.tint = tintIsland(c)
  // Malta: the inside cell nearest the outline's centre-bottom (viewBox ≈ 560, 610 → local x +.42, z +.77)
  {
    const mx = (560 / 1000 - 0.5) * islandSize, mz = (610 / 1000 - 0.5) * islandSize
    let best = 0, bd = Infinity
    island.forEach((c, i) => { const d = Math.hypot(c.x - mx, c.z - mz); if (d < bd) { bd = d; best = i } })
    const mc = island[best]; island.splice(best, 1); island.unshift(mc); mc.tint = TINT.GOLD_LEAF; mc.group = 8
  }
  // sort the rest far → near so morphs flow across the water (Malta stays at 0)
  const isl0 = island.shift()!
  island.sort((a, b) => a.z - b.z || a.x - b.x); island.unshift(isl0)
  // Tilt the slab ≈ 25° about its own x-axis (through its centre) so the far coast lifts toward the sky and the
  // outline is legible from the low Ch 04/05 camera instead of a thin oblique band; then raise it just enough
  // that the nearest coast still sits at the water (ISLAND y) — nothing of the Mediterranean is under the sea.
  let islandLift = 0
  {
    const cs = Math.cos(ISLAND_TILT), sn = Math.sin(ISLAND_TILT)
    let minY = Infinity
    for (const c of island) {
      const y = c.y * cs - c.z * sn, z = c.y * sn + c.z * cs
      c.y = y; c.z = z
      if (y < minY) minY = y
    }
    islandLift = Number.isFinite(minY) ? Math.max(0, -minY) : 0
  }

  // the two hands share slots per finger group so the 2→3 morph unfolds finger by finger
  const palmLocal = { x: 0, y: -(540 / 1000 - 0.5) * handSize }   // viewBox (500,540) → local
  const maxD = (340 / 1000) * handSize
  // The two states must be EQUALLY dense: `handSlots` pairs them one slot per tile, so whichever silhouette
  // rasterises to fewer cells would be drawn with duplicated tiles — and a hand full of stacked duplicates is
  // a hand full of holes. So the sparser state is re-cut at a finer pitch until the counts meet (each state
  // keeps its own tile size, uScale[2] / uScale[3]).
  const cut = (svg: string, p: number, fallbackR: number) => {
    let c = silhouetteCells(svg, handSize, p, 'billboard', rnd)
    if (c.length === 0) c = discCells(fallbackR, p, rnd)
    return c
  }
  let pFist = P_HAND, pOpen = P_HAND
  let slotsFist: Cell[] = [], slotsOpen: Cell[] = []
  for (let k = 0; k < 7; k++) {
    let fist = cut(fistSvg, pFist, 0.6)
    let open = cut(openSvg, pOpen, 0.9)
    if (fist.length > open.length * 1.05 && open.length > 0) {
      pOpen *= Math.sqrt(open.length / fist.length); open = cut(openSvg, pOpen, 0.9)
    } else if (open.length > fist.length * 1.05 && fist.length > 0) {
      pFist *= Math.sqrt(fist.length / open.length); fist = cut(fistSvg, pFist, 0.6)
    }
    // tint the real cells BEFORE slotting: the centroid fillers handSlots invents keep tint 0 (invisible)
    for (const c of fist) c.tint = rampHand(Math.hypot(c.x - palmLocal.x, c.y - palmLocal.y) / maxD, c.k)
    for (const c of open) c.tint = rampHand(Math.hypot(c.x - palmLocal.x, c.y - palmLocal.y) / maxD, c.k)
    const [sf, so] = handSlots(fist, open, pFist, pOpen)
    slotsFist = sf; slotsOpen = so
    if (sf.length <= budget) break
    const grow = Math.max(1.04, Math.sqrt(sf.length / (budget * 0.9)))
    pFist *= grow; pOpen *= grow
  }
  if (slotsFist.length > budget) { slotsFist = slotsFist.slice(0, budget); slotsOpen = slotsOpen.slice(0, budget) }

  const pathFit = fitCells(budget, P_PATH, p => pathCells(PATH_LEN, PATH_W0, PATH_W1, p, rnd))
  const path = pathFit.cells
  for (const c of path) c.tint = tintPath(c, PATH_LEN)
  path.sort((a, b) => a.z - b.z || a.x - b.x)

  const pitch = [discFit.pitch, islandFit.pitch, pFist, pOpen, pathFit.pitch, discFit.pitch * (DAWN_RADIUS / DISC_RADIUS)]

  // ---- instance slots -------------------------------------------------------------------------
  const targets = Array.from({ length: FORMATION_COUNT }, () => new Float32Array(N * 3))
  const meta = new Float32Array(N * 4)
  const scatter = new Float32Array(N * 3)
  const discUV = new Float32Array(N * 2)
  const lists: Cell[][] = [disc, island, slotsFist, slotsOpen, path, dawn]
  const cents = lists.map(centroidOf)
  const used = lists.map(l => Math.min(N, l.length))
  const tintOf = new Array<number>(FORMATION_COUNT)

  for (let i = 0; i < N; i++) {
    for (let f = 0; f < FORMATION_COUNT; f++) {
      const c = i < lists[f].length ? lists[f][i] : cents[f]
      const t = targets[f]
      t[i * 3] = c.x; t[i * 3 + 1] = c.y; t[i * 3 + 2] = c.z
      tintOf[f] = i < lists[f].length ? c.tint : TINT.NONE
    }
    const openCell = i < slotsOpen.length ? slotsOpen[i] : null
    let group = openCell ? openCell.group : 0
    if (i === 0) group += 8                       // the Malta tile (formation 1) — instance 0 is a palm cell for the hand, so no clash
    meta[i * 4] = rnd()
    meta[i * 4 + 1] = group
    meta[i * 4 + 2] = tintOf[0] + tintOf[1] * 16 + tintOf[2] * 256
    meta[i * 4 + 3] = tintOf[3] + tintOf[4] * 16 + tintOf[5] * 256
    // scatter: a shell r 14–20 around the hero field (unit direction × radius) — every camera of the film (z 8 → −12)
    // sits inside the hollow, so loose tiles are always far and small; the shader also keeps them ≥ 6 units off the camera
    const u = rnd() * 2 - 1, ph = rnd() * Math.PI * 2, rr = 14 + rnd() * 6, s = Math.sqrt(1 - u * u)
    scatter[i * 3] = Math.cos(ph) * s * rr; scatter[i * 3 + 1] = u * rr * 0.6 + 0.8; scatter[i * 3 + 2] = Math.sin(ph) * s * rr
    // disc uv (same layout for 0 and 5)
    const d = i < disc.length ? disc[i] : cents[0]
    discUV[i * 2] = (d.x / DISC_RADIUS) * 0.5 + 0.5
    discUV[i * 2 + 1] = 0.5 - (d.y / DISC_RADIUS) * 0.5
  }

  // hero / hand are absolute — bake the anchors in; island / path / dawn stay relative
  const bake = (f: number, a: [number, number, number]) => { const t = targets[f]; for (let i = 0; i < N; i++) { t[i * 3] += a[0]; t[i * 3 + 1] += a[1]; t[i * 3 + 2] += a[2] } }
  const islandCentre: [number, number, number] = [ISLAND[0], ISLAND[1] + islandLift, ISLAND[2]]
  bake(0, HERO); bake(2, HAND); bake(3, HAND)
  bake(1, islandCentre)                                  // relative to (0, seaY, 0)
  bake(5, [0, 0, 1])                                     // one unit in front of the sun billboard

  const malta = targets[1]
  return {
    count: N, targets, meta, scatter, discUV,
    scale: pitch.map(p => p * BED),       // the quad is one pitch plus the bed overlap; the shader carves the tessera and its grout
    flat: [0, 1, 0, 0, 1, 0],
    tilt: [0, ISLAND_TILT, 0, 0, 0, 0],
    used,
    anchors: {
      hero: HERO,
      island: islandCentre,
      islandTilt: ISLAND_TILT,
      malta: [malta[0], malta[1], malta[2]],
      palm: [HAND[0], HAND[1] + palmLocal.y, HAND[2]],
      path: [0, 0.04, PATH_LEN * 0.5],
      dawn: [0, 0, 1],
    },
  }
}

// ── write masks ("SUN" / "XI") — 64 × 64 luminance drawn with canvas text in Fraunces ───────────
export const MASK_SIZE = 64

/** Draws `word` centred on a MASK_SIZE² canvas into `out` (RGBA bytes). Returns true if Fraunces was used. */
export function drawWriteMask(word: string, out: Uint8Array, letterSpacing = -0.04): boolean {
  const S = MASK_SIZE
  const canvas = document.createElement('canvas')
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return false
  const fraunces = typeof document !== 'undefined' && 'fonts' in document && document.fonts.check('320 40px Fraunces')
  const family = fraunces ? '"Fraunces"' : '"Iowan Old Style", Georgia, "Helvetica Neue", Arial, sans-serif'
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, S, S)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacing}em`
  // fit: the word's width ≤ 82% of the disc's inner square, height ≤ 50%
  let size = 40
  ctx.font = `${fraunces ? 320 : 700} ${size}px ${family}`
  let m = ctx.measureText(word)
  const wScale = (S * 0.82) / Math.max(1, m.width)
  const hScale = (S * 0.5) / Math.max(1, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)
  size = Math.floor(size * Math.min(wScale, hScale))
  ctx.font = `${fraunces ? 320 : 700} ${size}px ${family}`
  m = ctx.measureText(word)
  const capH = m.actualBoundingBoxAscent
  ctx.fillText(word, S / 2, S / 2 + capH / 2)
  const img = ctx.getImageData(0, 0, S, S).data
  out.set(img.subarray(0, S * S * 4))
  return fraunces
}
