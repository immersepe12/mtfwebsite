import * as THREE from 'three'
import type { Layer, LayerCtx } from '../../engine/gl'
import type { Mood } from '../../engine/mood'
import type { Shared } from '../../engine/chapter'

/**
 * SunLayer — the Sun and the Star are ONE additive billboard (DESIGN-BIBLE §8.3).
 *
 *   sunHeat → 1  THE SUN   limb-darkened disc, granulation, gold-leaf corona streaks streaming
 *                          outward, ember rim; HDR core ≥ 1.6 so the bloom takes it.
 *   sunHeat → 0  THE STAR  a small hard core, four diffraction spikes (0°/90° at 60 % of the
 *                          billboard, 45° at 30 %), a cool halo and a twinkle.
 *   The morph is continuous in uHeat: the star's core *grows into* the disc while the spikes
 *   dissolve and the corona lights.
 *
 * Sizing: the quad is `sunRadius × 3.2` (the disc itself has world radius `sunRadius`, so the
 * corona has 0.6 r of room). A screen-size floor (MIN_QUAD_PX) keeps the tiny star of Ch 03 / 12
 * from collapsing to a sub-pixel dot — the disc radius is passed to the shader in quad units
 * (uDiscP), so every shape stays in world proportion; only the corona/spike *room* grows.
 * Pixel-aware minimum widths (uPxPerRd = CSS px per sun radius) keep the core ≥ 2.4 px and the
 * spikes ≥ 0.9 px wide at any distance / DPR.
 *
 * Depth: the disc writes its true depth (gl_FragDepth) so it is a solid body — it occludes the far
 * sea, the stars and tiles behind it, and is cut by the near water (the hero's "lower fifth below
 * the sea line") and by tiles in front, whatever the draw order. Outside the disc (corona, spikes)
 * the fragment writes far-plane depth, so the light never punches a hole in the water.
 *
 * Reduced motion: uTime is frozen and the twinkle amplitude is 0 (a still per chapter).
 * No allocations in update(): every value is a scalar uniform write or an in-place copy.
 */

const SUN_DISTANCE = 140   // world units: far enough to sit behind the sea disc (r 392) at the horizon
const MIN_QUAD_PX = 72

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`

const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uHeat, uGlow, uTime, uVisible, uSeed, uTwinkle, uWarmth, uDiscP, uPxPerRd;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
// value noise periodic in x (period = per lattice cells) — polar corona streaks without a seam
float pnoise(vec2 p, float per){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float x0 = mod(i.x, per), x1 = mod(i.x + 1.0, per);
  float a = hash(vec2(x0, i.y)), b = hash(vec2(x1, i.y));
  float c = hash(vec2(x0, i.y + 1.0)), d = hash(vec2(x1, i.y + 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float pfbm(vec2 p, float per){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * pnoise(p, per); p = vec2(p.x * 2.0, p.y * 2.03 + 7.3); per *= 2.0; a *= 0.5; }
  return v;
}
// one diffraction spike along ±x: anisotropic gaussian, thinner toward the tip
float spike(vec2 q, float L, float w){
  float ax = abs(q.x);
  float taper = clamp(1.0 - ax / L, 0.0, 1.0);
  float ww = w * (0.35 + 0.65 * taper);
  float sx = L * 0.5;
  float across = exp(-(q.y * q.y) / (ww * ww));
  float along = exp(-(ax * ax) / (sx * sx)) * taper;
  return across * along;
}

void main(){
  vec2 p = vUv * 2.0 - 1.0;          // quad space, half-width 1
  float r = length(p);
  vec2 q = p / uDiscP;               // sun-radius units (1 = the disc's edge)
  float rd = length(q);
  float ang = atan(p.y, p.x);
  float t = uTime;

  // ── the morph ────────────────────────────────────────────────────────────
  float sunW  = smoothstep(0.35, 0.80, uHeat);            // corona, limb, granulation
  float starW = 1.0 - smoothstep(0.20, 0.55, uHeat);      // spikes, hard core, halo
  float hotW  = smoothstep(0.50, 0.85, uHeat);            // granulation + streak detail
  float coreMin = max(0.30, 2.4 / uPxPerRd);
  float discR = mix(coreMin, 1.0, smoothstep(0.15, 0.85, uHeat));

  // ── palette: the bible's tokens, converted sRGB → linear (the composer encodes to sRGB) ──
  vec3 cream  = vec3(1.000, 0.930, 0.753);   // #FFF7E1
  vec3 starC  = vec3(1.000, 0.947, 0.823);   // #FFF9EA
  vec3 leaf   = vec3(0.880, 0.578, 0.144);   // #F1C86A gold-leaf
  vec3 gold   = vec3(0.694, 0.371, 0.053);   // #D9A441
  vec3 flame  = vec3(1.000, 0.195, 0.010);   // #FF7A1A
  vec3 ember  = vec3(0.456, 0.069, 0.026);   // #B44A2D
  vec3 coolW  = vec3(0.748, 0.848, 1.000);

  // ── the disc ─────────────────────────────────────────────────────────────
  // The star's edge is a hairline. The SUN's edge is eaten by air: a photographed sun has no rim —
  // its light simply keeps falling outward — so in sun mode the body is feathered over 11 % of the
  // radius and the corona picks the level up exactly where the body leaves off (no circular seam).
  float aa = fwidth(rd);
  float hard = 1.0 - smoothstep(discR - aa, discR + aa, rd);
  float feather = max(aa, discR * 0.11);
  float soft = 1.0 - smoothstep(discR - feather, discR + feather, rd);
  float disc = mix(hard, soft, sunW);
  float x = clamp(rd / discR, 0.0, 1.0);
  float mu = sqrt(max(0.0, 1.0 - x * x));
  float limb = mix(1.0, 0.42 + 0.58 * mu, sunW);         // limb darkening u = .58

  // sun body: white-hot heart → gold-leaf → gold → flame/ember limb (dusk) or gold limb (day)
  vec3 limbCol = mix(mix(ember, flame, 0.5), gold, uWarmth);
  vec3 heartCol = mix(leaf, cream, 0.55 + 0.35 * uWarmth);
  vec3 body = mix(heartCol, leaf, smoothstep(0.05, 0.50, x));
  body = mix(body, gold, smoothstep(0.45, 0.85, x));
  body = mix(body, limbCol, smoothstep(0.78, 1.0, x));
  float gran = fbm(q * 2.8 + vec2(t * 0.05, -t * 0.03) + uSeed) - 0.5;
  body *= 1.0 + gran * 0.25 * hotW;
  // Exposure: the layer is ADDITIVE over a sky that is already bright by day, so only the HEART may
  // exceed 1 (it clips white, as a photographed sun does). Everything from ~half the radius outward
  // stays under 1 and therefore keeps its hue: gold, then amber at the limb. Over-driving the whole
  // body is what turned the sun into a flat grey-white sticker with a circular edge.
  float heart = exp(-x * x * 6.0);
  float sunInt = 0.60 + 1.30 * heart;                    // HDR ≥ 1.6 only in the heart — the body stays gold
  vec3 sunCol = body * sunInt;

  vec3 starCol = mix(starC, coolW, 0.25) * 2.4;          // the star's core is white-hot (bloom takes it)
  vec3 col = mix(starCol, sunCol, sunW) * disc * limb;

  // gold-leaf warmth on the limb — wide and low, a graded edge rather than a drawn ring
  float rim = exp(-pow((rd - discR) * 7.0, 2.0)) * 0.11 * sunW;
  col += leaf * rim;

  // ── corona (sun): streaks streaming outward in gold-leaf, flame further out ──
  float a01 = ang / 6.2831853 + 0.5;
  float streak = pfbm(vec2(a01 * 14.0, rd * 2.0 - t * 0.15 + uSeed), 14.0);
  streak = smoothstep(0.30, 0.90, streak);
  // the corona begins UNDER the body's feather and leaves off at the limb's own level, so the eye
  // reads one continuous fall of light from the heart outward — never a disc pasted on a glow.
  float outside = smoothstep(discR * 0.80, discR * 1.06, rd);
  float breathe = 0.96 + 0.04 * sin(t * 2.1 + rd * 9.0);
  float d = max(rd - discR, 0.0);
  float cor = exp(-d * 2.2) * (0.10 + 0.62 * streak * (0.5 + 0.5 * hotW)) * outside * breathe;
  float corSoft = exp(-d * 1.00) * 0.26 * outside;
  vec3 corCol = mix(leaf, mix(flame, gold, uWarmth * 0.5), smoothstep(1.0, 1.7, rd));
  col += corCol * (cor * 0.9 + corSoft) * uGlow * sunW;

  // ── star: spikes + a tight halo + twinkle ────────────────────────────────
  float tw = 1.0 - uTwinkle * (0.04 - 0.04 * sin(t * 7.0 + uSeed));
  float lenTw = 1.0 + uTwinkle * 0.05 * sin(t * 3.1 + uSeed * 1.7);
  float wS = max(0.05, 0.9 / uPxPerRd);
  float L0 = max(0.96, 26.0 / uPxPerRd) * lenTw;          // 0° / 90° — 60 % of the nominal quad
  float L1 = max(0.48, 13.0 / uPxPerRd) * lenTw;          // 45°     — 30 %
  float sp = spike(q, L0, wS) + spike(q.yx, L0, wS);
  vec2 q45 = vec2(q.x - q.y, q.x + q.y) * 0.7071068;
  sp += (spike(q45, L1, wS) + spike(q45.yx, L1, wS)) * 0.65;
  float haloS = exp(-rd * rd * 1.1) * 0.10;
  vec3 spCol = mix(starC, leaf, 0.65);
  col += (spCol * sp * 1.9 + starC * haloS * uGlow) * starW;
  col *= mix(1.0, tw, starW);

  // ── quad edge fade (never a square), visibility ──────────────────────────
  float edge = 1.0 - smoothstep(0.80, 0.985, r);
  col *= edge * uVisible;
  gl_FragColor = vec4(col, 1.0);
  // depth: the disc is a solid body (it occludes the far sea, the stars, tiles behind it);
  // the corona / spikes are light — far-plane depth so they never punch holes in the water.
  float solid = (rd < discR && uVisible > 0.5) ? 1.0 : 0.0;
  gl_FragDepth = mix(1.0, gl_FragCoord.z, solid);
}
`

export class SunLayer implements Layer {
  name = 'sun'
  private mesh!: THREE.Mesh
  private mat!: THREE.ShaderMaterial
  private geo!: THREE.PlaneGeometry
  private u = {
    uHeat: { value: 0.5 }, uGlow: { value: 0.8 }, uTime: { value: 0 }, uVisible: { value: 1 },
    uSeed: { value: 2.37 }, uTwinkle: { value: 1 }, uWarmth: { value: 0.35 },
    uDiscP: { value: 0.625 }, uPxPerRd: { value: 100 },
  }
  private reduced = false

  init(ctx: LayerCtx) {
    this.reduced = ctx.shared.reduced
    this.u.uTwinkle.value = this.reduced ? 0 : 1
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag, uniforms: this.u,
      transparent: true, depthWrite: true, depthTest: true, blending: THREE.AdditiveBlending,
    })
    this.geo = new THREE.PlaneGeometry(1, 1)
    this.mesh = new THREE.Mesh(this.geo, this.mat)
    this.mesh.renderOrder = -50
    ctx.scene.add(this.mesh)
  }

  private dir = new THREE.Vector3()

  update(m: Mood, s: Shared, ctx: LayerCtx) {
    const cam = ctx.camera
    const radius = Math.max(m.sunRadius, 1e-3)
    // ── the sun is a celestial body, never an object in the scene ──────────────────────────────────
    // A chapter declares where the sun should APPEAR (sunX/Y/Z); if that point is close to the camera the
    // billboard renders in front of the water and reads as a lamp floating on the sea. So the declared point
    // is treated as a DIRECTION: the disc is pushed out along the same ray to a fixed far distance and its
    // radius scaled by the same factor, which keeps its screen position and apparent size exactly as declared
    // while putting it beyond every other object. The sea then cuts it at the horizon, the way a real sunset is.
    this.dir.set(m.sunX, m.sunY, m.sunZ).sub(cam.position)
    const declared = Math.max(this.dir.length(), 0.05)
    const far = Math.max(declared, SUN_DISTANCE)
    this.mesh.position.copy(cam.position).addScaledVector(this.dir.multiplyScalar(1 / declared), far)
    const push = far / declared
    // world units per CSS pixel at the billboard's distance (vertical fov)
    const dist = far
    const worldPerPx = (2 * dist * Math.tan((cam.fov * Math.PI) / 360)) / Math.max(s.vh, 1)
    const nominal = radius * push * 3.2
    const sc = Math.max(nominal, MIN_QUAD_PX * worldPerPx)
    this.mesh.scale.set(sc, sc, 1)
    this.mesh.quaternion.copy(cam.quaternion)

    const u = this.u
    u.uHeat.value = m.sunHeat
    u.uGlow.value = m.sunGlow
    u.uWarmth.value = m.warmth
    u.uTime.value = this.reduced ? 12 : s.time
    u.uDiscP.value = (2 * radius) / sc          // disc radius in quad units (nominal .625)
    u.uPxPerRd.value = radius / worldPerPx      // CSS px per sun-radius unit
    // a radius set to ~0 means "no sun" even if sunVisible was left on
    const vis = m.sunVisible * Math.min(1, m.sunRadius / 0.02)
    u.uVisible.value = vis
    this.mesh.visible = vis > 0.005
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
  }
}
