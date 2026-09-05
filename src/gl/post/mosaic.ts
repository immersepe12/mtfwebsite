import { Effect, BlendFunction } from 'postprocessing'
import { Uniform, Vector2, Vector3, type WebGLRenderer, type WebGLRenderTarget } from 'three'

/**
 * MosaicEffect — DESIGN-BIBLE §8.6. The whole frame becomes a laid Roman mosaic: jittered-grid Voronoi
 * tesserae (3 × 3 neighbour search, `uJitter` .45), exact border distance → grout where the edge function
 * `e` (≈ F2 − F1) is below `uGrout`, a bevel `smoothstep(0, .22, e)` on every tile, an andamento flow warp
 * (`uFlow` 1.2 rad from `vnoise(uv · 2)`) so the rows bend like hand-laid courses, ONE texture fetch per
 * tile at its site (recovered through the inverse warp), poster quantise 12 levels at 60 %, per-tile
 * luminance ±7 %, gold tiles where `hash > .93` with a specular that sweeps with `uSweep`
 * (= scroll progress × 2π — the lead wires `effect.sweep`; until then it drifts slowly with time),
 * grout #0B0A09. `uCells` 56 desktop / 34 mobile (tile ≈ 16 px at 1440 × 900), `uGrout` .12.
 *
 * PER-CELL STAGGER: `on = step(hash(site), amount)` — the frame dissolves tile by tile as `amount` rises,
 * it never fades. `amount` is driven from `mood.mosaic` by the World every frame.
 * Mobile: Voronoi is dropped for rotated-square tiles (`R(hash · .4) · fract(uv · N)`).
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
uniform float uCells;    // tiles down the height (56 desktop / 34 mobile)
uniform float uGrout;    // grout where the edge function e < uGrout (.12)
uniform float uJitter;   // site jitter inside its cell (.45)
uniform float uFlow;     // andamento: flow angle range in radians (1.2)
uniform float uGoldAmt;  // strength of the gold glints
uniform float uMobile;   // 1 = rotated-square tiles instead of Voronoi
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

// andamento: a smooth displacement (in cell units) whose direction turns with the flow field,
// so the courses of tiles bend and meet the way a setter lays them around a figure.
vec2 flowWarp(vec2 uv){
  float a = (vnoise(uv * 2.0 + 3.7) * 2.0 - 1.0) * uFlow;
  // amplitude in cells, scaled with the tile count so the courses bend the same on a 34-cell phone
  float m = (1.6 + 1.6 * vnoise(uv * 1.3 + 11.0)) * (uCells / 56.0);
  m *= mix(1.0, 0.45, uMobile);                // an aligned square lattice shows the bend far more
  return vec2(cos(a), sin(a)) * m;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uAmount <= 0.001) { outputColor = inputColor; return; }
  // the damped mood lands a hair under 1 — never leave a handful of holes in a "complete" floor
  float amount = mix(uAmount, 1.0, step(0.985, uAmount));

  float aspect = uRes.x / uRes.y;
  vec2 scale = vec2(aspect, 1.0) * uCells;      // uv → cell units (square tiles)
  vec2 st = uv * scale;
  vec2 q = st + flowWarp(uv);                   // warped lattice space
  float px = uCells / uRes.y;                   // one device pixel in cell units

  vec2 cellId;   // integer id of the tile (stagger, tint, gold, tilt all hash from it)
  vec2 siteQ;    // the tile's site in lattice space
  float e;       // edge function: 0 on the border, ≈ 2 × the distance to it (F2 − F1 style)

  if (uMobile > 0.5) {
    // rotated-square tiles: each cell holds a square turned by hash · .4, clipped by its cell
    vec2 n = floor(q);
    vec2 f = fract(q) - 0.5;
    vec2 c = (hash22(n + 8.1) - 0.5) * 0.26;   // the square sits a little off its cell's centre
    vec2 fr = rot((hash12(n + 1.7) - 0.5) * 0.4) * (f - c);
    fr *= 0.86 + 0.28 * hash12(n + 4.3);       // the cut varies a little from tile to tile
    float eSq = 0.5 - max(abs(fr.x), abs(fr.y));
    float eCell = 0.5 - max(abs(f.x), abs(f.y));
    e = min(eSq, eCell) * 2.0;
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
    // pass 2: exact distance to the nearest cell border (uniform grout width)
    md = 8.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 g = mg + vec2(float(i), float(j));
        vec2 o = 0.5 + (hash22(n + g) - 0.5) * uJitter;
        vec2 r = g + o - f;
        vec2 dr = r - mr;
        if (dot(dr, dr) > 1e-5) md = min(md, dot(0.5 * (mr + r), normalize(dr)));
      }
    }
    e = md * 2.0;
    cellId = n + mg;
    siteQ = q + mr;
  }

  // per-cell stagger: this tile is laid once amount passes its hash
  float on = step(hash12(cellId + 17.3), amount);

  // the site back in frame uv through the inverse warp (one refinement step keeps a tile flat)
  vec2 siteUV = (siteQ - flowWarp(uv)) / scale;
  siteUV = (siteQ - flowWarp(siteUV)) / scale;
  vec3 tile = texture2D(inputBuffer, clamp(siteUV, vec2(0.0), vec2(1.0))).rgb;

  // poster quantise: 12 levels at 60 % (in a gamma-ish space so the night sea keeps its steps)
  vec3 g = sqrt(max(tile, 0.0));
  g = floor(g * 12.0 + 0.5) / 12.0;
  tile = mix(tile, g * g, 0.6);
  // stone batches: per-tile luminance ±7 %
  tile *= 1.0 + (hash12(cellId + 5.1) - 0.5) * 0.14;

  // Ravenna setters: every tile is tilted a few degrees so the key light reads per tile
  vec2 tilt = (hash22(cellId + 31.0) - 0.5) * 0.24;
  vec3 nrm = normalize(vec3(tilt, 1.0));
  vec3 key = normalize(vec3(-0.35, 0.55, 0.76));
  float shade = 0.86 + 0.30 * dot(nrm, key);

  // gold tesserae: hash > .93. A specular sweep: the light turns with uSweep, a diagonal band crosses
  // the frame once per revolution, and each tile flashes when its own tilt faces the light.
  float isGold = step(0.93, hash12(cellId + 9.7));
  float hg = hash12(cellId + 2.2);
  vec3 goldCol = mix(mix(uGoldB, uGoldA, smoothstep(0.35, 0.85, hg)), uGoldC, step(hg, 0.18));
  float along = uv.x * 0.8 + uv.y * 0.35;
  float band = smoothstep(0.11, 0.0, abs(fract(along * 0.9 - uSweep / TAU + 0.5) - 0.5));
  float az = atan(tilt.y, tilt.x);
  float facet = pow(max(cos(az - uSweep), 0.0), 18.0) * smoothstep(0.02, 0.10, length(tilt));
  float glint = (band * 0.75 + facet * 0.65) * uGoldAmt;
  // gold lives in the image's light: deep and dim where the frame is dark, leaf-bright near the sun
  float lum = dot(tile, vec3(0.2126, 0.7152, 0.0722));
  float lit = smoothstep(0.0, 0.22, lum);
  vec3 goldBase = mix(goldCol, goldCol * normalize(tile + 0.02) * 1.5, 0.18) * mix(0.30, 1.0, lit);
  vec3 goldFace = goldBase * (0.85 + 0.45 * max(dot(nrm, key), 0.0)) + uGoldA * glint * (0.55 + 0.6 * lit);

  vec3 col = mix(tile * shade, goldFace, isGold);

  // bevel: the face falls off toward the grout, with a thin highlight on the edge that faces the light
  float bev = smoothstep(0.0, 0.22, e - uGrout);
  vec2 dir = q - siteQ;
  dir = dir / max(length(dir), 1e-4);
  float edgeLit = max(dot(dir, vec2(-0.55, 0.83)), 0.0);
  col *= mix(0.58, 1.0, bev);
  col += (col * 0.9 + 0.05) * edgeLit * (1.0 - bev) * 0.8;

  // grout: matte, always darker than any tile
  float aa = px * 2.4;
  float face = smoothstep(uGrout - aa, uGrout + aa, e);
  vec3 grout = uGroutCol * (0.85 + 0.3 * hash12(floor(q * 3.0) + 0.7));
  col = mix(grout, col, face);

  outputColor = vec4(mix(inputColor.rgb, col, on), inputColor.a);
}
`

/** sRGB hex → linear RGB (the post chain works in linear light; the pass encodes on output). */
function linear(hexColour: string): Vector3 {
  const n = parseInt(hexColour.replace('#', ''), 16)
  const c = (v: number) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
  return new Vector3(c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255))
}

const CELLS_DESKTOP = 56
const CELLS_MOBILE = 34
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
      ['uJitter', new Uniform(0.45)], ['uFlow', new Uniform(1.2)], ['uGoldAmt', uGoldAmt], ['uMobile', uMobile], ['uRes', uRes],
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

  /** Tiles down the height. Set to override the 56 / 34 desktop / mobile default; `null` restores it. */
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
