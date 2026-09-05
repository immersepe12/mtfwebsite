import { Effect, BlendFunction } from 'postprocessing'
import { Uniform, Vector2, Vector3, type WebGLRenderer, type WebGLRenderTarget } from 'three'

/**
 * MosaicEffect — DESIGN-BIBLE §8.6. The whole frame becomes a laid Roman mosaic: jittered-grid Voronoi
 * tesserae (3 × 3 neighbour search, `uJitter` .55), exact border distance softened with a polynomial
 * smooth-min so every tessera carries a small ROUNDED CORNER, an andamento flow warp (`uFlow` 1.2 rad from
 * `vnoise(uv · 2)`) so the courses bend like hand-laid rows, ONE texture fetch per tile at its site
 * (recovered through the inverse warp), gold tiles where `hash > .955` with a specular that sweeps with
 * `uSweep` (= scroll progress × 2π — the lead wires `effect.sweep`; until then it drifts slowly with time).
 *
 * IT MUST READ AS STONE, NEVER AS A PIXELATE FILTER. Three things carry that:
 *  · a real BEVEL NORMAL — the face rolls off outward through the chamfer (`nxy = tilt + dir · roll²`), so
 *    the rim facing the key light is bright and the opposite rim falls into shadow. The tile is lit, not
 *    just darkened by a distance ramp.
 *  · a SHADED RECESS instead of a black gridline — the grout is the token mortar tinted by the stone above
 *    it, lit by the same normal (so the wall facing the light catches a thin highlight) and occluded with
 *    depth. Anti-aliased against the pixel size (`epx`) so no cell edge ever stairsteps.
 *  · PHOTOGRAPHIC colour — the poster quantise is only a 20 % whisper over 14 levels, and 52 → 20 % of the
 *    true per-pixel gradient (by how finished the floor is) survives inside each tessera, so a tile is a
 *    piece of coloured glass with light moving through it rather than a flat sticker.
 *
 * PER-CELL STAGGER: `on = smoothstep(hash − .08, hash, amount)` — the frame dissolves tile by tile as
 * `amount` rises, it never fades; the .08 window only keeps the arrival from popping as an aliased square.
 * `amount` is driven from `mood.mosaic` by the World every frame. Because Ch 14 rests at .3 (a sparse floor
 * over an open sky) the relief and the grout depth both scale with `amount`: a lone tessera is a soft chip
 * of glass, not a black-outlined sticker; at 1.0 (the Shatter) the floor is fully cut and grouted.
 * `uCells` 68 desktop / 50 mobile (tile ≈ 13 px at 1440 × 900, ≈ 17 px at 390 × 844), `uGrout` .12.
 * Mobile: Voronoi is dropped for rounded, rotated squares (`R(hash · .3) · fract(uv · N)`, lattice set 3°).
 *
 * Composition: sits in the World's single EffectPass (Bloom → Mosaic → ChromaticAberration → Noise →
 * Vignette). `mainImage(inputColor, uv, outputColor)`: `inputColor` is the bloomed frame from the previous
 * effect; `inputBuffer` (the pass's source frame, linear, HalfFloat) is what each tile samples at its site.
 * Colours here are linear — the pass encodes to sRGB on output — so the token hexes are converted below.
 */
const frag = /* glsl */ `
#define TAU 6.28318530718

uniform float uAmount;   // 0 untouched → 1 every tile laid
uniform float uTime;
uniform float uSweep;    // specular sweep phase (radians)
uniform float uCells;    // tiles down the height (68 desktop / 50 mobile)
uniform float uGrout;    // grout where the edge function e < uGrout (.12)
uniform float uJitter;   // site jitter inside its cell (.55)
uniform float uFlow;     // andamento: flow angle range in radians (1.2)
uniform float uGoldAmt;  // strength of the gold glints
uniform float uMobile;   // 1 = rounded rotated-square tiles instead of Voronoi
uniform vec2  uRes;      // drawing-buffer size in device px
uniform vec3  uGroutCol; // #0B0A09 (linear)
uniform vec3  uGoldA;    // --gold-leaf (linear)
uniform vec3  uGoldB;    // --gold (linear)
uniform vec3  uGoldC;    // --gold-deep (linear)

float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2  hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i), b = hash12(i + vec2(1.0, 0.0)), c = hash12(i + vec2(0.0, 1.0)), d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
// polynomial smooth minimum — the cutter's wheel: it rounds the corner where two borders meet.
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }

// andamento: a smooth displacement (in cell units) whose direction turns with the flow field,
// so the courses of tiles bend and meet the way a setter lays them around a figure.
vec2 flowWarp(vec2 uv){
  float a = (vnoise(uv * 2.0 + 3.7) * 2.0 - 1.0) * uFlow;
  // amplitude in cells, scaled with the tile count so the courses bend the same on a 50-cell phone
  float m = (1.6 + 1.6 * vnoise(uv * 1.3 + 11.0)) * (uCells / 68.0);
  m *= mix(1.0, 0.72, uMobile);                // an aligned square lattice shows the bend far more
  return vec2(cos(a), sin(a)) * m;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uAmount <= 0.001) { outputColor = inputColor; return; }
  // the damped mood lands a hair under 1 — never leave a handful of holes in a "complete" floor
  float amount = mix(uAmount, 1.0, step(0.985, uAmount));

  float aspect = uRes.x / uRes.y;
  vec2 scale = vec2(aspect, 1.0) * uCells;      // uv → cell units (square tiles)
  vec2 st = uv * scale;
  // the phone's square lattice is set 3° off the screen so no course ever runs dead level with an edge
  float latA = uMobile * 0.055;
  mat2 latR = rot(latA), latRi = rot(-latA);
  vec2 q = latR * st + flowWarp(uv);            // warped lattice space
  float epx = 2.0 * uCells / uRes.y;            // one device pixel, in the units of the edge function

  vec2 cellId;   // integer id of the tile (stagger, tint, gold, tilt all hash from it)
  vec2 siteQ;    // the tile's site in lattice space
  float e;       // edge function: 0 on the border, ≈ 2 × the distance to it (F2 − F1 style)

  if (uMobile > 0.5) {
    // rounded rotated squares: each cell holds a square turned by hash · .3 on a 3°-set lattice, clipped by its cell
    vec2 n = floor(q);
    vec2 f = fract(q) - 0.5;
    vec2 c = (hash22(n + 8.1) - 0.5) * 0.19;   // the square sits a little off its cell's centre
    vec2 fr = rot((hash12(n + 1.7) - 0.5) * 0.30) * (f - c);
    fr *= 1.03 + 0.22 * hash12(n + 4.3);       // no two are cut the same size
    float ar = (hash12(n + 6.4) - 0.5) * 0.62;  // and some come off the nippers oblong, as they really do
    float r = 0.14;                            // corner radius of the tessera, in cell units
    vec2 bd = abs(fr) - (0.5 - r) * vec2(1.0 + ar, 1.0 - ar);
    float eSq = r - (length(max(bd, 0.0)) + min(max(bd.x, bd.y), 0.0));
    float eCell = 0.5 - max(abs(f.x), abs(f.y));
    e = smin(eSq, eCell, 0.09) * 2.0;
    cellId = n;
    siteQ = n + 0.5 + c;
  } else {
    // jittered-grid Voronoi — pass 1: nearest site in the 3 × 3 neighbourhood
    vec2 n = floor(q);
    vec2 f = fract(q);
    vec2 mg = vec2(0.0), mr = vec2(0.0);
    float md = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = 0.5 + (hash22(n + g) - 0.5) * uJitter;
        vec2 r = g + o - f;
        float d = dot(r, r);
        if (d < md) { md = d; mr = r; mg = g; }
      }
    }
    // pass 2: exact distance to the nearest cell border, smooth-min'd so the corners come off rounded
    md = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = mg + vec2(float(i), float(j));
        vec2 o = 0.5 + (hash22(n + g) - 0.5) * uJitter;
        vec2 r = g + o - f;
        vec2 dr = r - mr;
        if (dot(dr, dr) > 1e-5) md = smin(md, dot(0.5 * (mr + r), normalize(dr)), 0.085);
      }
    }
    e = md * 2.0;
    cellId = n + mg;
    siteQ = q + mr;
  }

  // per-cell stagger: the tile is laid once amount passes its hash. The .08 window is arrival easing,
  // not a fade — one tile at a time still, but it settles in rather than snapping on as hard pixels.
  float hOn = hash12(cellId + 17.3);
  float on = smoothstep(hOn - 0.08, hOn, amount);

  // the site back in frame uv through the inverse warp (one refinement step keeps a tile flat)
  vec2 siteUV = (latRi * (siteQ - flowWarp(uv))) / scale;
  siteUV = (latRi * (siteQ - flowWarp(siteUV))) / scale;
  vec3 tile = texture2D(inputBuffer, clamp(siteUV, vec2(0.0), vec2(1.0))).rgb;

  // how finished the floor is — a sparse scatter is glass laid ON the picture (Ch 14 rests at .3),
  // a full floor is the picture RE-CUT in stone (the Shatter). Everything below leans on this.
  float laid = smoothstep(0.06, 0.78, amount);

  // glass, not stickers: the true gradient keeps living inside each tessera, so light still moves across
  // a tile instead of every tile being one dead flat colour — most of it while the floor is still sparse.
  tile = mix(tile, max(inputColor.rgb, 0.0), mix(0.52, 0.20, laid));

  // a whisper of poster quantise — enough to batch the stone, far too little to look posterised
  vec3 g = sqrt(max(tile, 0.0));
  g = floor(g * 14.0 + 0.5) / 14.0;
  tile = mix(tile, g * g, 0.20);
  // stone batches: per-tile luminance ±6 % and a small warm/cool drift between kiln loads
  float hv = hash12(cellId + 5.1) - 0.5;
  float hw = hash12(cellId + 23.9) - 0.5;
  tile *= (1.0 + hv * 0.12) * vec3(1.0 + hw * 0.05, 1.0, 1.0 - hw * 0.05);

  // ── relief ────────────────────────────────────────────────────────────────────────────────────────
  float ed = e - uGrout;                        // > 0 on the tile, < 0 down in the grout channel
  float chamfer = max(0.20, epx * 1.6);         // the cut edge; never narrower than a couple of pixels
  float h = smoothstep(-chamfer * 0.5, chamfer, ed);   // 0 at the bottom of the channel → 1 flat face
  float roll = 1.0 - h;

  vec2 dir = q - siteQ;
  dir = dir / max(length(dir), 1e-4);           // outward from the tile's own site: flips across a border
  vec2 tilt = (hash22(cellId + 31.0) - 0.5) * 0.22;    // Ravenna setters: every tile sits a few degrees off
  vec3 nrm = normalize(vec3(tilt + dir * roll * roll * mix(0.80, 1.15, laid), 1.0));
  vec3 key = normalize(vec3(-0.38, 0.58, 0.72));
  float lam = max(dot(nrm, key), 0.0);
  float shade = (0.62 + 0.38 * nrm.z) * 0.55 + lam * 0.62;   // ≈ 1.0 on a flat face
  vec3 hv3 = normalize(key + vec3(0.0, 0.0, 1.0));
  float sheen = pow(max(dot(nrm, hv3), 0.0), 34.0);          // glaze catching the key

  // ── gold leaf ─────────────────────────────────────────────────────────────────────────────────────
  // rarer and warmer than the stone: leaf reflects the picture, so it keeps the frame's own value
  float isGold = step(0.955, hash12(cellId + 9.7));
  float hg = hash12(cellId + 2.2);
  vec3 goldCol = mix(mix(uGoldB, uGoldA, smoothstep(0.35, 0.85, hg)), uGoldC, step(hg, 0.22));
  float along = uv.x * 0.8 + uv.y * 0.35;
  float band = smoothstep(0.14, 0.0, abs(fract(along * 0.9 - uSweep / TAU + 0.5) - 0.5));
  float az = atan(tilt.y, tilt.x);
  float facet = pow(max(cos(az - uSweep), 0.0), 18.0) * smoothstep(0.02, 0.10, length(tilt));
  float glint = (band * 0.42 + facet * 0.34) * uGoldAmt;
  float lum = dot(max(tile, 0.0), vec3(0.2126, 0.7152, 0.0722));
  float lit = smoothstep(0.0, 0.24, lum);
  // leaf = the picture seen through warm metal, never a flat orange chip pasted on top
  vec3 leaf = mix(tile, goldCol * (0.55 + 0.8 * lit), 0.52);
  leaf += uGoldA * glint * (0.35 + 0.55 * lit);

  vec3 stone = mix(tile, leaf, isGold);
  vec3 face = stone * shade + sheen * (0.05 + 0.10 * isGold) * mix(vec3(1.0), uGoldA, isGold);

  // ── the grout is a recess, not a line ─────────────────────────────────────────────────────────────
  // mortar tinted by the stone standing in it, lit by the same normal so the wall facing the key picks
  // up a thin highlight, and occluded as the channel deepens.
  vec3 bed = mix(uGroutCol, max(tile, 0.0) * 0.30, 0.42);
  vec3 mortar = mix(max(tile, 0.0) * 0.62, bed, laid) * (0.62 + 0.70 * lam);
  vec3 col = mix(mortar, face, h);

  // sparse floors read as glass chips, not as outlined stickers: the relief comes up with the amount,
  // so Ch 14's .3 is a soft impression in the light and the Shatter's 1.0 is a floor fully cut and grouted.
  col = mix(tile, col, mix(0.55, 1.0, laid));

  outputColor = vec4(mix(inputColor.rgb, col, on), inputColor.a);
}
`

/** sRGB hex → linear RGB (the post chain works in linear light; the pass encodes on output). */
function linear(hexColour: string): Vector3 {
  const n = parseInt(hexColour.replace('#', ''), 16)
  const c = (v: number) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
  return new Vector3(c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255))
}

const CELLS_DESKTOP = 68
const CELLS_MOBILE = 50
const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 820

export class MosaicEffect extends Effect {
  private readonly uAmount: Uniform<number>
  private readonly uTime: Uniform<number>
  private readonly uSweep: Uniform<number>
  private readonly uCells: Uniform<number>
  private readonly uGrout: Uniform<number>
  private readonly uGoldAmt: Uniform<number>
  private readonly uMobile: Uniform<number>
  private readonly uRes: Uniform<Vector2>
  /** true once something (the lead's scroll wiring) has set `sweep`; until then it drifts with time. */
  private sweepDriven = false
  private cellsOverride: number | null = null

  constructor() {
    const uAmount = new Uniform(0)
    const uTime = new Uniform(0)
    const uSweep = new Uniform(0)
    const uCells = new Uniform(CELLS_DESKTOP)
    const uGrout = new Uniform(0.12)
    const uGoldAmt = new Uniform(1)
    const uMobile = new Uniform(0)
    const uRes = new Uniform(new Vector2(1, 1))
    const uniforms = new Map<string, Uniform>([
      ['uAmount', uAmount], ['uTime', uTime], ['uSweep', uSweep], ['uCells', uCells], ['uGrout', uGrout],
      ['uJitter', new Uniform(0.55)], ['uFlow', new Uniform(1.2)], ['uGoldAmt', uGoldAmt], ['uMobile', uMobile], ['uRes', uRes],
      ['uGroutCol', new Uniform(linear('#0B0A09'))],
      ['uGoldA', new Uniform(linear('#F1C86A'))],
      ['uGoldB', new Uniform(linear('#D9A441'))],
      ['uGoldC', new Uniform(linear('#A67C2E'))],
    ])
    super('MosaicEffect', frag, { blendFunction: BlendFunction.NORMAL, uniforms })
    this.uAmount = uAmount; this.uTime = uTime; this.uSweep = uSweep; this.uCells = uCells
    this.uGrout = uGrout; this.uGoldAmt = uGoldAmt; this.uMobile = uMobile; this.uRes = uRes
    this.applyViewport()
  }

  /** 0 = untouched frame → 1 = every tile laid. Driven from `mood.mosaic` by the World. */
  get amount(): number { return this.uAmount.value }
  set amount(v: number) { this.uAmount.value = Math.min(1, Math.max(0, v)) }

  /** Specular sweep phase in radians (= scroll progress × 2π). Setting it once switches off the idle drift. */
  get sweep(): number { return this.uSweep.value }
  set sweep(v: number) { this.sweepDriven = true; this.uSweep.value = v }

  /** Tiles down the height. Set to override the 68 / 50 desktop / mobile default; `null` restores it. */
  get cells(): number { return this.uCells.value }
  set cells(v: number | null) { this.cellsOverride = v; this.applyViewport() }
  /** Legacy alias of `cells` (the stub's name). */
  set scale(v: number) { this.cells = v }

  /** Grout threshold on the edge function (.12). */
  get grout(): number { return this.uGrout.value }
  set grout(v: number) { this.uGrout.value = v }

  /** Strength of the gold glints (1). */
  get gold(): number { return this.uGoldAmt.value }
  set gold(v: number) { this.uGoldAmt.value = v }

  private applyViewport() {
    const mobile = isMobileViewport()
    this.uMobile.value = mobile ? 1 : 0
    this.uCells.value = this.cellsOverride ?? (mobile ? CELLS_MOBILE : CELLS_DESKTOP)
  }

  override update(_renderer: WebGLRenderer, _inputBuffer: WebGLRenderTarget, deltaTime = 0) {
    this.uTime.value += deltaTime
    if (!this.sweepDriven) this.uSweep.value = this.uTime.value * 0.35
  }

  /** Called by the EffectPass with the drawing-buffer size (device px). */
  override setSize(w: number, h: number) {
    this.uRes.value.set(Math.max(1, w), Math.max(1, h))
    this.applyViewport()
  }
}
