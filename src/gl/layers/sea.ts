import * as THREE from 'three'
import type { Layer, LayerCtx } from '../../engine/gl'
import type { Mood } from '../../engine/mood'
import type { Shared } from '../../engine/chapter'

/**
 * SeaLayer — the Mediterranean (DESIGN-BIBLE §8.4, §10.2-C).
 *
 * GEOMETRY  One radial disc, built once, CENTRED ON THE CAMERA EVERY FRAME
 *   (`mesh.position.set(camera.x, seaY, camera.z)` — `ctx.camera.position` is authoritative, mouse
 *   parallax included). Rings grow geometrically from r 2 to r 392 (just inside the camera's far
 *   plane), so the tessellation is dense where the small waves live (≈ .13 units at r 4) and sparse
 *   at the horizon; one last ring at r 12000 — its clip-space depth pinned just inside the far
 *   plane in the vertex shader — carries the rim to the TRUE eye-level horizon for every camera
 *   height in the film (h/12000 rad: under 1.5 px even at camY 3.4, where a rim at the far plane
 *   would stop 17 px short and show a ledge). A disc has no corners: the 360° yaw of Ch 08 never
 *   sees an edge. 160 rings × 160 sectors desktop, 96 × 96 mobile. The waves are evaluated in
 *   WORLD space, so the water does not slide with the camera — only the mesh does.
 *
 * VERTEX  Four Gerstner waves, the calm table `(1,.3,.12,9) (−.6,1,.08,5.5) (.3,−.8,.06,3.2)
 *   (1,1,.04,1.6)` as (dir.x, dir.y, steepness, wavelength). `seaAmp` scales steepness
 *   (`.25` = the table as written; `.6`, the Shatter, = 2.4×; clamped so the sum never loops).
 *   `seaSpeed` scales time through an accumulated phase (a change of speed never jumps the sea;
 *   reduced motion runs it at ×.15). Plus two octaves of simplex chop. Each wave's displacement
 *   fades with distance so the far field never shimmers; the analytic Gerstner normal is exact
 *   whatever the tessellation.
 *
 * FRAGMENT  Depth colour from `seaColor` (troughs deep, crests toward `--lagoon` scaled by
 *   `warmth`); Schlick fresnel toward `skyBottom` (with the sun's warmth mirrored on the sun side
 *   of the horizon); the gold path = Blinn-Phong exponent 400 toward `world.sunWorld` on
 *   per-texel jittered micro-normals (a slow 9 Hz reseed makes it sparkle), plus a wide lobe
 *   (exponent 24, .15); the path is tinted star-white → flame/gold-leaf by `sunHeat`/`warmth`,
 *   gated by `sunVisible` and by the sun's height over the water. A grazing-angle fade closes the
 *   far sea into `skyBottom` — the mirrored sun-side scatter in that target is gated exactly as the
 *   sky gates its own (warmth .12→.5 × heat .3→.7), so a star's far water is skyBottom like the sky's
 *   horizon, never a lighter band — and the last ≈ .5° under the horizon dissolve by ALPHA into the
 *   sky drawn behind (halo, ember band and haze show through), so no camera height or pitch can
 *   ever show a rim. `seaOpacity` fades the plane. NEVER foam, NEVER white water: the glitter is
 *   clamped below the tone-mapper's white.
 *
 * DEPTH  The plane writes depth. The sun tests depth (its disc sinks into the water), the star dome
 *   and the tesserae test depth (nothing below the surface shows through). The material stays
 *   `transparent` so the Ch 11–13 fade needs no program recompile; `renderOrder −20` draws it before
 *   the other translucent layers.
 *
 * Mobile: 96² segments, three waves, vertex-interpolated chop normals, no micro-normal jitter.
 * Draw calls: 1. No per-frame allocations.
 */

const RINGS_DESKTOP = 160, RINGS_MOBILE = 96
const R_INNER = 2.0          // nothing closer is ever in frame (the camera sits ≥ 1.8 above the water)
const R_OUTER = 392.0        // the last wave-carrying ring, inside the camera's 400-unit far plane
const R_FAR = 12000.0        // the rim ring: beyond the far plane (depth pinned in the vertex shader) → on the eye-level horizon
const STEEP_PER_AMP = 4.0    // seaAmp .25 = the calm table as written
const STEEP_MAX = 3.0        // Σ steepness .9 — Gerstner never loops

/* Shared GLSL: 2-D simplex noise with analytic derivatives, and the two-octave chop built on it. */
const NOISE = /* glsl */ `
vec2 hash2(vec2 p){
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}
vec2 grad2(vec2 i){ float a = hash2(i).x * 6.2831853; return vec2(cos(a), sin(a)); }
// returns (value, d/dx, d/dy); value ≈ −1..1
vec3 snoised(vec2 p){
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec2 ga = grad2(i), gb = grad2(i + o), gc = grad2(i + 1.0);
  vec3 gd = vec3(dot(a, ga), dot(b, gb), dot(c, gc));
  vec3 h3 = h * h * h;
  vec3 h4 = h3 * h;
  float v = 70.0 * dot(h4, gd);
  vec2 d = 70.0 * (h4.x * ga + h4.y * gb + h4.z * gc - 8.0 * (h3.x * gd.x * a + h3.y * gd.y * b + h3.z * gd.z * c));
  return vec3(v, d);
}
// two octaves of chop drifting with the swell. q = world xz, t = the sea's phase. (value, d/dx, d/dz)
vec3 chop(vec2 q, float t){
  vec3 n1 = snoised(q * 0.55 + vec2(0.21, 0.07) * t);
  vec3 n2 = snoised(vec2(q.y, -q.x) * 1.35 - vec2(0.13, 0.19) * t);
  vec2 d1 = n1.yz * 0.55;
  vec2 d2 = vec2(-n2.z, n2.y) * 1.35;
  return vec3(n1.x * 0.65 + n2.x * 0.35, d1 * 0.65 + d2 * 0.35);
}
`

const VERT = /* glsl */ `
uniform float uTime, uAmp;
uniform vec3 uCam;
varying vec3 vWorld;
varying vec3 vN;
varying vec2 vChop;
varying float vCrest, vDist;
${NOISE}
// one Gerstner wave: returns the displacement, accumulates tangent + binormal for the analytic normal
vec3 gerstner(vec2 dir, float steep, float wl, vec2 p, float t, inout vec3 T, inout vec3 B){
  float k = 6.2831853 / wl;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(dir);
  float f = k * (dot(d, p) - c * t);
  float a = steep / k;
  float s = sin(f), co = cos(f);
  T += vec3(-d.x * d.x * steep * s, d.x * steep * co, -d.x * d.y * steep * s);
  B += vec3(-d.x * d.y * steep * s, d.y * steep * co, -d.y * d.y * steep * s);
  return vec3(d.x * a * co, a * s, d.y * a * co);
}
void main(){
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vec2 p = wp.xz;
  float dist = length(p - uCam.xz);
  vec3 T = vec3(1.0, 0.0, 0.0), B = vec3(0.0, 0.0, 1.0);
  vec3 d = vec3(0.0);
  // the calm table; each wave's displacement fades before the tessellation could alias it
  d += gerstner(vec2( 1.0,  0.3), 0.12 * uAmp * (1.0 - smoothstep(140.0, 330.0, dist)), 9.0, p, uTime, T, B);
  d += gerstner(vec2(-0.6,  1.0), 0.08 * uAmp * (1.0 - smoothstep( 80.0, 220.0, dist)), 5.5, p, uTime, T, B);
  d += gerstner(vec2( 0.3, -0.8), 0.06 * uAmp * (1.0 - smoothstep( 45.0, 140.0, dist)), 3.2, p, uTime, T, B);
  #ifndef MOBILE
  d += gerstner(vec2( 1.0,  1.0), 0.04 * uAmp * (1.0 - smoothstep( 22.0,  80.0, dist)), 1.6, p, uTime, T, B);
  #endif
  // two-octave chop (small; its slope is what matters, see the fragment)
  float chopAmp = 0.05 * uAmp * (1.0 - smoothstep(10.0, 60.0, dist));
  vec3 ch = chop(p, uTime);
  d.y += ch.x * chopAmp;
  vChop = ch.yz * chopAmp;
  wp.xyz += d;
  vWorld = wp.xyz;
  vDist = dist;
  vN = normalize(cross(B, T));
  vCrest = d.y / (0.22 * uAmp + 1e-4);
  gl_Position = projectionMatrix * viewMatrix * wp;
  // the rim ring lies beyond the far plane: pin its depth just inside it (xy/w are untouched, so it
  // projects exactly where an infinite sea would — on the eye-level horizon)
  gl_Position.z = min(gl_Position.z, gl_Position.w * 0.99999);
}
`

const FRAG = /* glsl */ `
uniform vec3 uColor, uSkyBottom, uSun, uCam;
uniform float uOpacity, uWarmth, uHeat, uPath, uTime, uAmp, uSeed, uTexel, uJitter, uSeaY;
varying vec3 vWorld;
varying vec3 vN;
varying vec2 vChop;
varying float vCrest, vDist;
${NOISE}
// tokens (sRGB, hex allowed in GLSL): --lagoon #2B8FA3 · --gold-leaf #F1C86A · --gold #D9A441 · --flame #FF7A1A · --star #FFF9EA
const vec3 LAGOON = vec3(0.169, 0.561, 0.639);
const vec3 LEAF   = vec3(0.945, 0.784, 0.416);
const vec3 GOLD   = vec3(0.851, 0.643, 0.255);
const vec3 FLAME  = vec3(1.000, 0.478, 0.102);
const vec3 STAR   = vec3(1.000, 0.976, 0.918);
// the scene is linear; the composer encodes to sRGB (the mood colours arrive linear from update())
vec3 toLinear(vec3 c){
  c = max(c, 0.0);
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 hash3(vec2 p){
  vec3 q = vec3(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)), dot(p, vec2(419.2, 371.9)));
  return fract(sin(q) * 43758.5453);
}
void main(){
  vec3 V = normalize(uCam - vWorld);
  vec3 N = normalize(vN);
  vec2 g = vChop;
  #ifndef MOBILE
  // per-pixel chop slope near the camera (the vertex slope is only the fallback)
  float chopLod = 1.0 - smoothstep(8.0, 50.0, vDist);
  if (chopLod > 0.002) { vec3 ch = chop(vWorld.xz, uTime); g = ch.yz * 0.05 * uAmp * chopLod; }
  #endif
  N = normalize(N + vec3(-g.x, 0.0, -g.y));

  // grazing angle (≈ radians under the eye-level horizon) → the far sea closes into the sky
  float h = max(uCam.y - uSeaY, 0.05);
  float grz = h / max(vDist, 0.001);
  float fog = 1.0 - smoothstep(0.004, 0.09, grz);
  fog = max(fog, smoothstep(300.0, 380.0, vDist));
  // the last ≈ .5° under the horizon (≈ 12 px at fov 34) dissolve into the sky behind: no rim, ever
  float rim = smoothstep(0.0, 0.0085, grz);

  // depth colour: troughs deep, crests toward the lagoon with warmth
  float crest = clamp(vCrest, -1.0, 1.0);
  vec3 col = mix(uColor * 0.55, uColor * 1.15, crest * 0.5 + 0.5);
  col = mix(col, toLinear(LAGOON), smoothstep(0.35, 1.0, crest) * 0.30 * uWarmth);

  // the sun's contribution: star-white → flame/gold by heat and warmth; a set sun lights nothing
  vec3 L = normalize(uSun - vWorld);
  vec3 H = normalize(L + V);
  float above = smoothstep(-0.9, 0.4, uSun.y - uSeaY);
  float strength = uPath * above;
  vec3 starC = toLinear(STAR) * 0.85;
  vec3 pathCol  = mix(starC, toLinear(mix(FLAME, GOLD, uWarmth)), uHeat);   // the lane
  vec3 glintCol = mix(starC, toLinear(mix(FLAME, LEAF, uWarmth)), uHeat);   // the sparkle peaks

  // Schlick fresnel toward the sky; the sky is warmer on the sun's side of the horizon — mirrored
  // only when the sky itself scatters (its gates: warmth .12→.5 × heat .3→.7), so a star's far water
  // is exactly skyBottom, like the sky's horizon
  float cosT = max(dot(N, V), 0.0);
  float F = 0.02 + 0.98 * pow(1.0 - cosT, 5.0);
  vec2 toP = normalize(vWorld.xz - uCam.xz);
  vec2 toS = normalize(uSun.xz - uCam.xz + vec2(1e-4, 0.0));
  float side = pow(max(dot(toP, toS), 0.0), 8.0);
  float skyGate = smoothstep(0.12, 0.50, uWarmth) * smoothstep(0.30, 0.70, uHeat);
  vec3 skyRef = uSkyBottom + pathCol * (side * 0.30 + 0.04) * strength * skyGate;   // the sun-side scatter, mirrored
  col = mix(col, skyRef, F);

  // the gold path: wide lobe (24, .15) + a medium lobe that gives the lane a body + jittered micro-normal glitter
  // (capped: never white water)
  float ndh = max(dot(N, H), 0.0);
  col += pathCol * (pow(ndh, 24.0) * 0.15 + pow(ndh, 90.0) * 0.30) * strength;
  #ifndef MOBILE
  vec2 tx = floor(gl_FragCoord.xy / uTexel);
  vec3 j = hash3(mod(tx, 1024.0) + uSeed) - 0.5;
  vec3 Nj = normalize(N + vec3(j.x, 0.0, j.z) * uJitter);
  float glit = pow(max(dot(Nj, H), 0.0), 400.0);
  col += glintCol * min(glit * 2.0, 1.25) * strength;
  #else
  col += glintCol * min(pow(ndh, 400.0) * 1.6, 1.2) * strength;
  #endif

  col = mix(col, skyRef, fog);
  gl_FragColor = vec4(col, uOpacity * rim);
}
`

/** A camera-centred disc: geometric ring spacing (dense near, sparse far), flat in xz, +y up.
 *  `rings` wave-carrying rings from R_INNER to R_OUTER, plus the rim ring at R_FAR (see the vertex shader). */
function buildDisc(rings: number, sectors: number): THREE.BufferGeometry {
  const cols = sectors + 1
  const nRings = rings + 1                 // + the rim ring
  const nv = (nRings + 1) * cols
  const pos = new Float32Array(nv * 3)
  const ratio = Math.pow(R_OUTER / R_INNER, 1 / (rings - 1))
  for (let i = 0; i <= nRings; i++) {
    const r = i === 0 ? 0 : i > rings ? R_FAR : R_INNER * Math.pow(ratio, i - 1)
    for (let j = 0; j <= sectors; j++) {
      const a = (j / sectors) * Math.PI * 2
      const k = (i * cols + j) * 3
      pos[k] = Math.cos(a) * r
      pos[k + 1] = 0
      pos[k + 2] = Math.sin(a) * r
    }
  }
  const idx = new Uint32Array(nRings * sectors * 6)
  let n = 0
  for (let i = 0; i < nRings; i++) {
    for (let j = 0; j < sectors; j++) {
      const a = i * cols + j, b = a + 1, c = a + cols, d = c + 1
      idx[n++] = a; idx[n++] = c; idx[n++] = b
      idx[n++] = b; idx[n++] = c; idx[n++] = d
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setIndex(new THREE.BufferAttribute(idx, 1))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), R_FAR + 1)
  return geo
}

export class SeaLayer implements Layer {
  name = 'sea'
  private mesh!: THREE.Mesh
  private mat!: THREE.ShaderMaterial
  private geo!: THREE.BufferGeometry
  private phase = 0
  private u = {
    uTime: { value: 0 }, uAmp: { value: 1 },
    uCam: { value: new THREE.Vector3() }, uSun: { value: new THREE.Vector3() }, uSeaY: { value: -1.2 },
    uColor: { value: new THREE.Color(0x0e3d57) }, uSkyBottom: { value: new THREE.Color(0x0e3d57) },
    uOpacity: { value: 1 }, uWarmth: { value: 0.35 }, uHeat: { value: 0.5 }, uPath: { value: 1 },
    uSeed: { value: 3.7 }, uTexel: { value: 1 }, uJitter: { value: 0.3 },
  }

  init(ctx: LayerCtx) {
    const mobile = ctx.shared.mobile
    const n = mobile ? RINGS_MOBILE : RINGS_DESKTOP
    this.geo = buildDisc(n, n)
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG,
      defines: mobile ? { MOBILE: 1 } : {},
      uniforms: this.u,
      transparent: true, depthWrite: true, depthTest: true, side: THREE.DoubleSide,
    })
    this.mesh = new THREE.Mesh(this.geo, this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -20
    this.mesh.position.set(ctx.camera.position.x, -1.2, ctx.camera.position.z)
    ctx.scene.add(this.mesh)
  }

  update(m: Mood, s: Shared, ctx: LayerCtx) {
    const u = this.u
    // time: an accumulated phase, so seaSpeed can change per chapter without a jump
    const dt = Math.min(s.dt, 0.05)
    this.phase += dt * m.seaSpeed * (s.reduced ? 0.15 : 1)
    u.uTime.value = this.phase
    const amp = Math.min(Math.max(m.seaAmp, 0) * STEEP_PER_AMP, STEEP_MAX)
    u.uAmp.value = amp
    // the plane follows the camera (its position is authoritative — parallax included)
    const cam = ctx.camera.position
    this.mesh.position.set(cam.x, m.seaY, cam.z)
    u.uCam.value.copy(cam)
    u.uSeaY.value = m.seaY
    u.uSun.value.copy(ctx.world.sunWorld)
    // colours: sRGB tokens → linear (the composer encodes back to sRGB)
    u.uColor.value.setRGB(m.seaColor[0], m.seaColor[1], m.seaColor[2], THREE.SRGBColorSpace)
    u.uSkyBottom.value.setRGB(m.skyBottom[0], m.skyBottom[1], m.skyBottom[2], THREE.SRGBColorSpace)
    u.uOpacity.value = m.seaOpacity
    u.uWarmth.value = m.warmth
    u.uHeat.value = m.sunHeat
    // the path: off without a sun, faint and narrow for the star, full for the gold sun; wider on a rougher sea
    const src = Math.min(Math.max(m.sunRadius / 1.2, 0), 1)
    u.uPath.value = m.sunVisible * (0.6 + 0.4 * m.sunGlow) * (0.12 + 0.88 * m.sunHeat) * (0.55 + 0.45 * src)
    u.uJitter.value = (0.3 + 0.15 * Math.min(amp, 2)) * (0.55 + 0.45 * m.sunHeat)
    // glitter reseed at 9 Hz (bounded so the hash never sees a huge argument); still under reduced motion
    u.uSeed.value = s.reduced ? 3.7 : (Math.floor(s.time * 9) % 97) * 7.31
    u.uTexel.value = s.dpr >= 1.5 ? 2 : 1
    this.mesh.visible = m.seaOpacity > 0.005
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
  }
}
