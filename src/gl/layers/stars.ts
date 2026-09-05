import * as THREE from 'three'
import type { Layer, LayerCtx } from '../../engine/gl'
import type { Mood } from '../../engine/mood'
import type { Shared } from '../../engine/chapter'
import { MED_OUTLINE_11, ORION, URSA_MAJOR, fitOutline } from '../../art/constellations'

/**
 * StarsLayer — the night sky (DESIGN-BIBLE §8.4).
 *
 * THE FIELD  `THREE.Points`, 12 000 desktop / 5 000 mobile, on a dome of radius 60 whose centre
 *   follows the camera every frame (stars are at infinity: they never parallax, the 360° yaw of
 *   Ch 08 never sees an edge). Upper-hemisphere weighted, with a thin band below the horizon for
 *   the chapters where the sea fades (Ch 11–12). Per star: size .5–3 (power-law, most are dust),
 *   phase, colour temperature, and a "cross" flag for the brightest 2 % (soft disc + tiny
 *   diffraction cross). Twinkle `.85 + .15·sin(t·1.7 + phase)` — amplitude 0 under reduced motion.
 *   `mood.stars` = opacity · `mood.starDrift` = a slow rotation of the field about the zenith
 *   (accumulated, so a change of drift speed never jumps the sky).
 *
 * THE CONSTELLATIONS  one additive `LineSegments`, gold (`--gold` #D9A441) at 40 % alpha, 1 px.
 *   set 1 — the Mediterranean outline of eleven stars (`MED_OUTLINE_11`), a closed loop of 11
 *           edges drawn clockwise from Gibraltar (Malta → Gibraltar closes it, as the DOM does).
 *           The eleven points are mapped onto the dome exactly where the Ch 03 DOM anchors sit —
 *           `fitOutline(w, h)` from constellations.ts, the SAME aspect-true fit `constellation()`
 *           uses (the outline's box at MED_ASPECT in the frame's centre 70 %, width-limited on
 *           landscape, height-limited on portrait) — for the chapter's reference camera: yaw 0,
 *           tilt STARS_REF.tilt / .tiltMobile, fov STARS_REF.fov, live aspect. So the gold GL
 *           hairlines sit on the DOM hairlines (see `medOutlineDirection`).
 *   set 2 — Orion (east, yaw π/2) and Ursa Major (north, yaw 0), each edge continued ×6 beyond its
 *           end vertex at 20 % alpha — the "spear diagonals" that run off-frame in Ch 08.
 *   `mood.constellation` (fractional) selects the set and draws it: 0→1 draws set 1 (per-vertex
 *   `aProgress`, `discard` beyond the draw amount); 1→2 draws set 2 while set 1 fades (1→1.5).
 *   The constellations do NOT drift with the field: they hold their bearings (Ch 08 pins its
 *   EAST/WEST labels from camYaw; Ch 03 pins DOM labels to fixed anchors).
 *   Each set also owns its vertex stars inside the Points buffer (cross stars that light up as
 *   the line reaches them).
 *
 * Draw calls: 2 (points + lines). No per-frame allocations. Below the horizon the opaque sea,
 * drawn after this layer, hides the dome.
 */

/** Dome radius (world units). */
const R = 60
/** Ch 03's reference camera — the tilt/fov at which set 1 coincides with the DOM constellation. */
export const STARS_REF = { tilt: 0.43, tiltMobile: 0.34, fov: 42 } as const

const N_DESKTOP = 12000, N_MOBILE = 5000
const HORIZON_BAND = 0.14          // fraction of the dome allowed below the horizon (y < 0)
const CROSS_FRACTION = 0.02        // the brightest 2 % get the tiny cross
const DRIFT_RATE = 0.02            // rad/s per unit of mood.starDrift
const LINE_ALPHA = 0.4             // gold 40 %
const EXT_FACTOR = 6               // set-2 edges extended ×6 beyond their end vertex
const EXT_ALPHA = 0.2              // …at 20 % alpha (fading to 6 % at the far tip)

/** Deterministic PRNG (mulberry32) — the same sky on every load. */
function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Unit direction for a bearing: `az` = the camYaw at which the point is dead ahead, `el` = elevation (radians). */
function bearingDir(az: number, el: number, out: THREE.Vector3) {
  const ce = Math.cos(el)
  return out.set(-Math.sin(az) * ce, Math.sin(el), -Math.cos(az) * ce)
}

/**
 * Unit direction (camera-relative, yaw 0) of the i-th Mediterranean-outline star: the point where the
 * DOM anchor (`constellation({w,h})` → `fitOutline`) sits for the reference camera at the given aspect.
 * Chapter agents may use it to place the GL star on an anchor: world = cam + dir × distance.
 */
export function medOutlineDirection(i: number, aspect: number, mobile: boolean, out = new THREE.Vector3()) {
  const [x, y] = MED_OUTLINE_11[i] ?? [0.5, 0.5]
  return frameDir(x, y, aspect, mobile ? STARS_REF.tiltMobile : STARS_REF.tilt, STARS_REF.fov, out)
}

/**
 * Unproject a point of the outline's unit box — laid out in the frame by the DOM's own fit (`fitOutline` on a
 * frame of width `aspect` × height 1, i.e. the viewport in vh units) — through the reference camera onto a direction.
 * Only called at init/resize (11 points), so the fit's small allocation never happens per frame.
 */
function frameDir(x: number, y: number, aspect: number, tilt: number, fov: number, out: THREE.Vector3) {
  const f = fitOutline(aspect, 1)
  const nx = ((f.ox + x * f.sw) / aspect) * 2 - 1
  const ny = 1 - (f.oy + y * f.sh) * 2
  const t = Math.tan((fov * Math.PI) / 360)
  const cx = nx * t * aspect, cy = ny * t, cz = -1
  // pitch about X by the camera tilt (Euler YXZ, yaw 0)
  const ct = Math.cos(tilt), st = Math.sin(tilt)
  return out.set(cx, cy * ct - cz * st, cy * st + cz * ct).normalize()
}

interface Figure { points: [number, number][]; edges: [number, number][]; az: number; el: number; width: number; height: number }

/** Set 2 — Orion in the east, the Bear in the north (angular boxes in radians; art coords y-down). */
const FIGURES: Figure[] = [
  { ...ORION, az: Math.PI / 2, el: 0.15, width: 0.63, height: 0.42 },
  { ...URSA_MAJOR, az: 0, el: 0.15, width: 0.80, height: 0.49 },
]

const POINT_VERT = /* glsl */ `
attribute vec4 aStar;   // size, phase, temperature, cross flag
attribute vec2 aConst;  // set (0 field · 1 Mediterranean · 2 Orion+Bear), draw progress
uniform float uTime, uDpr, uDrift, uTwinkle, uScale, uConst;
varying float vA, vTemp, vCross;
void main(){
  vec3 p = position;
  // the field turns about the zenith; the constellations hold their bearings
  float field = 1.0 - step(0.5, aConst.x);
  float ang = uDrift * field;
  float cs = cos(ang), sn = sin(ang);
  p.xz = mat2(cs, -sn, sn, cs) * p.xz;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // twinkle .85 + .15·sin(t·1.7 + phase), with a faint second voice so the sky never breathes in unison
  float ph = aStar.y;
  float tw = 1.0 - uTwinkle * (0.15 - 0.15 * (0.7 * sin(uTime * 1.7 + ph) + 0.3 * sin(uTime * 3.9 + ph * 2.3)));
  // constellation stars light as their line reaches them
  float draw1 = clamp(uConst, 0.0, 1.0);
  float draw2 = clamp(uConst - 1.0, 0.0, 1.0);
  float w = 1.0;
  if (aConst.x > 1.5) w = smoothstep(aConst.y - 0.05, aConst.y, draw2);
  else if (aConst.x > 0.5) w = smoothstep(aConst.y - 0.05, aConst.y, draw1) * (1.0 - smoothstep(1.0, 1.5, uConst));
  float size = aStar.x * uScale * uDpr;
  size *= mix(1.0, 3.4, aStar.w);
  size *= 0.92 + 0.08 * tw;
  float tiny = clamp(size / 1.6, 0.35, 1.0);   // sub-2px stars dim instead of flickering
  gl_PointSize = max(size, 1.0);
  vA = tw * w * tiny;
  vTemp = aStar.z;
  vCross = aStar.w;
  gl_Position = projectionMatrix * mv;
}
`

const POINT_FRAG = /* glsl */ `
precision highp float;
uniform float uOpacity;
uniform vec3 uWarm, uCool, uWhite;
varying float vA, vTemp, vCross;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d2 = dot(c, c);
  float a;
  if (vCross > 0.5) {
    // the bright ones: a hard little core, a tiny cross, a breath of halo
    float core = exp(-d2 * 150.0);
    float armX = smoothstep(0.03, 0.0, abs(c.y)) * smoothstep(0.5, 0.05, abs(c.x));
    float armY = smoothstep(0.03, 0.0, abs(c.x)) * smoothstep(0.5, 0.05, abs(c.y));
    a = core * 1.25 + max(armX, armY) * 0.32 + exp(-d2 * 20.0) * 0.10;
  } else {
    // soft disc, hard zero at the sprite edge
    a = exp(-d2 * 34.0) * (1.0 - smoothstep(0.16, 0.25, d2));
  }
  vec3 col = mix(mix(uWarm, uCool, vTemp), uWhite, 0.5);
  col *= 1.0 + 0.6 * vCross;              // HDR for the brightest so the bloom just catches them
  gl_FragColor = vec4(col, clamp(a * vA * uOpacity, 0.0, 1.0));
}
`

const LINE_VERT = /* glsl */ `
attribute vec3 aLine;   // set, draw progress, alpha
varying float vSet, vProg, vAlpha;
void main(){
  vSet = aLine.x; vProg = aLine.y; vAlpha = aLine.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const LINE_FRAG = /* glsl */ `
precision highp float;
uniform float uConst, uAlpha;
uniform vec3 uGold;
varying float vSet, vProg, vAlpha;
void main(){
  float draw = vSet < 1.5 ? clamp(uConst, 0.0, 1.0) : clamp(uConst - 1.0, 0.0, 1.0);
  if (vProg > draw) discard;
  float fade = vSet < 1.5 ? 1.0 - smoothstep(1.0, 1.5, uConst) : 1.0;
  float tip = smoothstep(draw, draw - 0.03, vProg);     // the drawing tip arrives soft
  gl_FragColor = vec4(uGold, uAlpha * vAlpha * fade * mix(0.55, 1.0, tip));
}
`

export class StarsLayer implements Layer {
  name = 'stars'
  private group = new THREE.Group()
  private pts!: THREE.Points
  private lines!: THREE.LineSegments
  private ptMat!: THREE.ShaderMaterial
  private lnMat!: THREE.ShaderMaterial
  private posAttr!: THREE.BufferAttribute
  private linePos!: THREE.BufferAttribute
  private fieldCount = 0
  private set1Star0 = 0          // index of the first set-1 vertex star in the Points buffer
  private set1Line0 = 0          // index of the first set-1 vertex in the LineSegments buffer
  private drift = 0
  private tmp = new THREE.Vector3()
  private aspect = 16 / 9
  private mobile = false

  init(ctx: LayerCtx) {
    this.mobile = ctx.shared.mobile
    this.aspect = Math.max(0.2, ctx.shared.vw / Math.max(1, ctx.shared.vh))
    const rand = rng(0x4d5446)   // "MTF"

    // ── the field ────────────────────────────────────────────────────────────
    const NF = this.mobile ? N_MOBILE : N_DESKTOP
    this.fieldCount = NF
    const set1N = MED_OUTLINE_11.length
    const set2N = FIGURES.reduce((n, f) => n + f.points.length, 0)
    const N = NF + set1N + set2N
    const pos = new Float32Array(N * 3)
    const star = new Float32Array(N * 4)
    const cst = new Float32Array(N * 2)
    for (let i = 0; i < NF; i++) {
      // uniform on the sphere above y = −HORIZON_BAND (upper hemisphere + a thin band under the horizon)
      const y = -HORIZON_BAND + (1 + HORIZON_BAND) * rand()
      const th = rand() * Math.PI * 2
      const rr = Math.sqrt(Math.max(0, 1 - y * y))
      pos[i * 3] = Math.cos(th) * rr * R
      pos[i * 3 + 1] = y * R
      pos[i * 3 + 2] = Math.sin(th) * rr * R
      const u = rand()
      const size = 0.5 + 2.5 * Math.pow(u, 3.5)
      star[i * 4] = size
      star[i * 4 + 1] = rand() * Math.PI * 2
      star[i * 4 + 2] = Math.pow(rand(), 0.8)             // most stars lean cool-white
      star[i * 4 + 3] = u > 1 - CROSS_FRACTION ? 1 : 0     // the brightest 2 % carry the cross
      cst[i * 2] = 0; cst[i * 2 + 1] = 0
    }
    // ── set 1 vertex stars (positions filled by layoutSet1) ──────────────────
    this.set1Star0 = NF
    for (let i = 0; i < set1N; i++) {
      const k = NF + i
      star[k * 4] = 2.3 + rand() * 0.5
      star[k * 4 + 1] = rand() * Math.PI * 2
      star[k * 4 + 2] = 0.45
      star[k * 4 + 3] = 1
      cst[k * 2] = 1; cst[k * 2 + 1] = i / set1N
    }
    // ── set 2 vertex stars ───────────────────────────────────────────────────
    let k = NF + set1N
    const s2 = this.mobile ? 0.85 : 1
    for (const f of FIGURES) {
      const nE = f.edges.length
      f.points.forEach(([x, y], pi) => {
        bearingDir(f.az + (x - 0.5) * f.width * s2, f.el + (0.5 - y) * f.height * s2, this.tmp)
        pos[k * 3] = this.tmp.x * R; pos[k * 3 + 1] = this.tmp.y * R; pos[k * 3 + 2] = this.tmp.z * R
        // a star lights when the first edge touching it is drawn
        let first = 1
        f.edges.forEach(([a, b], ei) => { if (a === pi) first = Math.min(first, ei / nE); if (b === pi) first = Math.min(first, (ei + 1) / nE) })
        star[k * 4] = 2.2 + rand() * 0.7
        star[k * 4 + 1] = rand() * Math.PI * 2
        star[k * 4 + 2] = 0.3 + rand() * 0.5
        star[k * 4 + 3] = 1
        cst[k * 2] = 2; cst[k * 2 + 1] = first
        k++
      })
    }
    const geo = new THREE.BufferGeometry()
    this.posAttr = new THREE.BufferAttribute(pos, 3)
    geo.setAttribute('position', this.posAttr)
    geo.setAttribute('aStar', new THREE.BufferAttribute(star, 4))
    geo.setAttribute('aConst', new THREE.BufferAttribute(cst, 2))
    this.ptMat = new THREE.ShaderMaterial({
      vertexShader: POINT_VERT, fragmentShader: POINT_FRAG,
      transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 }, uDpr: { value: 1 }, uDrift: { value: 0 }, uTwinkle: { value: 1 },
        uScale: { value: 2 }, uConst: { value: 0 }, uOpacity: { value: 0 },
        // tokens as sRGB → linear (the composer encodes the scene to sRGB at the end)
        uWarm: { value: new THREE.Color(0xffd9a8) },
        uCool: { value: new THREE.Color(0xc6d8ff) },
        uWhite: { value: new THREE.Color(0xfff9ea) },   // --star
      },
    })
    this.pts = new THREE.Points(geo, this.ptMat)
    this.pts.frustumCulled = false
    this.pts.renderOrder = -90

    // ── the constellation lines ──────────────────────────────────────────────
    const segs: number[] = [], attr: number[] = []
    const push = (a: THREE.Vector3, b: THREE.Vector3, set: number, p0: number, p1: number, a0: number, a1: number) => {
      segs.push(a.x, a.y, a.z, b.x, b.y, b.z)
      attr.push(set, p0, a0, set, p1, a1)
    }
    // set 1: the closed loop (positions filled by layoutSet1) — 11 edges, clockwise from Gibraltar
    this.set1Line0 = 0
    const zero = new THREE.Vector3()
    for (let i = 0; i < set1N; i++) push(zero, zero, 1, i / set1N, (i + 1) / set1N, 1, 1)
    // set 2: Orion + the Bear, each edge + its ×6 extension beyond the end vertex
    const A = new THREE.Vector3(), B = new THREE.Vector3(), E = new THREE.Vector3()
    for (const f of FIGURES) {
      const nE = f.edges.length
      const dir = (pi: number, out: THREE.Vector3) => {
        const [x, y] = f.points[pi]
        return bearingDir(f.az + (x - 0.5) * f.width * s2, f.el + (0.5 - y) * f.height * s2, out).multiplyScalar(R)
      }
      f.edges.forEach(([ia, ib], ei) => {
        dir(ia, A); dir(ib, B)
        const p0 = ei / nE, p1 = (ei + 1) / nE
        push(A, B, 2, p0, p1, 1, 1)
        E.copy(B).sub(A).multiplyScalar(EXT_FACTOR).add(B)
        push(B, E, 2, p1, Math.min(1, p1 + 0.5 / nE), EXT_ALPHA, EXT_ALPHA * 0.3)
      })
    }
    const lgeo = new THREE.BufferGeometry()
    this.linePos = new THREE.BufferAttribute(new Float32Array(segs), 3)
    lgeo.setAttribute('position', this.linePos)
    lgeo.setAttribute('aLine', new THREE.BufferAttribute(new Float32Array(attr), 3))
    this.lnMat = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
      transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
      uniforms: {
        uConst: { value: 0 }, uAlpha: { value: LINE_ALPHA },
        uGold: { value: new THREE.Color(0xd9a441) },       // --gold (sRGB → linear)
      },
    })
    this.lines = new THREE.LineSegments(lgeo, this.lnMat)
    this.lines.frustumCulled = false
    this.lines.renderOrder = -89

    this.layoutSet1()
    this.group.add(this.pts, this.lines)
    ctx.scene.add(this.group)
  }

  /** Place the Mediterranean outline (stars + edges) where the DOM anchors sit for the reference camera at the live aspect. */
  private layoutSet1() {
    const n = MED_OUTLINE_11.length
    const tilt = this.mobile ? STARS_REF.tiltMobile : STARS_REF.tilt
    const P = this.posAttr.array as Float32Array
    const L = this.linePos.array as Float32Array
    for (let i = 0; i < n; i++) {
      const [x, y] = MED_OUTLINE_11[i]
      frameDir(x, y, this.aspect, tilt, STARS_REF.fov, this.tmp).multiplyScalar(R)
      const k = (this.set1Star0 + i) * 3
      P[k] = this.tmp.x; P[k + 1] = this.tmp.y; P[k + 2] = this.tmp.z
      // edge i starts here, edge i−1 ends here
      const s = (this.set1Line0 + i * 2) * 3
      L[s] = this.tmp.x; L[s + 1] = this.tmp.y; L[s + 2] = this.tmp.z
      const e = (this.set1Line0 + ((i + n - 1) % n) * 2 + 1) * 3
      L[e] = this.tmp.x; L[e + 1] = this.tmp.y; L[e + 2] = this.tmp.z
    }
    this.posAttr.needsUpdate = true
    this.linePos.needsUpdate = true
  }

  resize(w: number, h: number, ctx: LayerCtx) {
    this.aspect = Math.max(0.2, w / Math.max(1, h))
    this.mobile = ctx.shared.mobile
    this.layoutSet1()
  }

  update(m: Mood, s: Shared) {
    // the dome rides with the camera: stars are at infinity
    this.group.position.set(m.camX, m.camY, m.camZ)
    const still = s.reduced
    if (!still) this.drift += m.starDrift * DRIFT_RATE * Math.min(s.dt, 0.05)
    const u = this.ptMat.uniforms
    u.uTime.value = s.time
    u.uDpr.value = s.dpr
    u.uDrift.value = this.drift
    u.uTwinkle.value = still ? 0 : 1
    u.uScale.value = 2.0 * Math.min(1.2, Math.max(0.75, s.vh / 900))
    u.uConst.value = m.constellation
    u.uOpacity.value = m.stars
    const l = this.lnMat.uniforms
    l.uConst.value = m.constellation
    l.uAlpha.value = LINE_ALPHA * Math.min(1, m.stars * 2)
    this.pts.visible = m.stars > 0.01
    this.lines.visible = m.stars > 0.01 && m.constellation > 0.005
  }

  dispose() {
    this.pts.geometry.dispose(); this.ptMat.dispose()
    this.lines.geometry.dispose(); this.lnMat.dispose()
    this.group.removeFromParent()
  }
}
