import * as THREE from 'three'
import type { Layer, LayerCtx } from '../../engine/gl'
import type { Mood } from '../../engine/mood'
import type { Shared } from '../../engine/chapter'

/**
 * SkyLayer — the dome behind everything (DESIGN-BIBLE §8.2, §3.4).
 *
 * Two passes, one material each:
 *   1. the DOME pass renders the sky into a HALF-RESOLUTION HalfFloat render target (0.5 × CSS px,
 *      DPR-independent) — the blur is real: pear.no's blurred-photo softness, the sky is never sharp;
 *   2. the BLIT pass draws that target on an NDC quad (renderOrder −100, no depth) with a 4-tap tent
 *      upscale, so the softness survives the upscale.
 *
 * The dome is direction-based, not screen-based: every fragment reconstructs its world-space view ray
 * (inverse projection × camera rotation), so the gradient sits on the true horizon, tilts with camTilt,
 * turns with camYaw (the 360° of Ch 08) and the sun-side scatter follows dot(dir, sunDir) even when the
 * sun is off-screen.
 *
 * Colour: mood colours are the CSS tokens (sRGB). The scene is rendered linear and encoded to sRGB by the
 * composer, so the gradient converts sRGB → linear in the shader; light (scatter, band, halo) is added in
 * linear space. Values > 1 near the sun so BloomEffect catches the halo.
 *
 * Terms (all read from the damped Mood every frame, no allocations):
 *   gradient skyBottom (horizon) → skyTop (zenith), darkening below the horizon (visible when the sea fades);
 *   fbm haze (5 octaves, 3-D value noise on the view ray, sky-locked, slow drift; frozen under reduced motion);
 *   night nebula (2 octaves, ±.03 display, only when warmth < .3, never on pure black);
 *   sun-side scatter pow(max(dot(dir,sunDir),0),8) in --flame → --gold-leaf (flame at the horizon, gold above);
 *   horizon band, sun-side weighted; sun halo (HDR core ≈ 1.4 × sunGlow, wide lobe) gated to ≤ 12 % in star mode
 *   (sunHeat < .35) where only a tight ≈ 30 px glow remains around the point;
 *   the haze catches the light. Static-scene mode mirrors the World's (every other frame when idle).
 */

const domeVert = /* glsl */ `
uniform mat4 uInvProj;
uniform mat3 uCamRot;
varying vec3 vDir;
void main(){
  vec4 v = uInvProj * vec4(position.xy, 1.0, 1.0);
  vDir = uCamRot * (v.xyz / v.w);
  gl_Position = vec4(position.xy, 0.9999, 1.0);
}
`

const domeFrag = /* glsl */ `
varying vec3 vDir;
uniform vec3 uTop, uBottom, uSunDir;
uniform float uHaze, uTime, uWarmth, uSunGlow, uSunVisible, uSunHeat;

// tokens (sRGB, hex allowed in GLSL): --flame #FF7A1A · --gold-leaf #F1C86A · --star #FFF9EA · --flame-hot #FFD166
const vec3 FLAME = vec3(1.0, 0.478, 0.102);
const vec3 GOLD  = vec3(0.945, 0.784, 0.416);
const vec3 STAR  = vec3(1.0, 0.976, 0.918);
const vec3 HOT   = vec3(1.0, 0.820, 0.400);   // --flame-hot #FFD166

vec3 toLinear(vec3 c){
  c = max(c, 0.0);
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
float hash3(vec3 p){ p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3)); p += dot(p, p.yzx + 19.19); return fract((p.x + p.y) * p.z); }
float noise3(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i), hash3(i + vec3(1,0,0)), f.x), mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x), mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm5(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return v; }
float fbm2(vec3 p){ return 0.6667 * noise3(p) + 0.3333 * noise3(p * 2.07 + vec3(5.2, 1.3, 7.7)); }

void main(){
  vec3 dir = normalize(vDir);
  float el = dir.y;                                   // sin(elevation); 0 = the sea horizon

  // ── gradient (display space) ──
  float t = (1.0 - exp(-max(el, 0.0) * 6.0)) / 0.9975;  // most of the transition lives in the first 20°
  vec3 base = mix(uBottom, uTop, t);
  base = mix(base, uBottom * 0.45, smoothstep(0.0, -0.25, el));   // below the horizon: the abyss

  // ── haze: slow drifting clouds of light, sky-locked ──
  float n = fbm5(dir * 3.2 + vec3(uTime * 0.020, uTime * 0.007, 0.0));
  base *= 1.0 + (n - 0.5) * uHaze * 0.8;

  // ── night nebula: ±.03, only when warmth < .3, never on pure black ──
  float night = smoothstep(0.30, 0.12, uWarmth);
  float lum = dot(base, vec3(0.2126, 0.7152, 0.0722));
  float nb = fbm2(dir * 1.9 + vec3(0.0, uTime * 0.004, uTime * 0.003));
  base += (nb - 0.5) * 0.07 * night * smoothstep(0.0, 0.06, lum) * vec3(0.85, 0.95, 1.10);

  vec3 col = toLinear(base);

  // ── light (linear) ──
  float warmGate = smoothstep(0.12, 0.50, uWarmth);
  float heatGate = smoothstep(0.30, 0.70, uSunHeat);
  vec2 sxz = uSunDir.xz; float sl = length(sxz);
  vec2 sh = sl > 1e-4 ? sxz / sl : vec2(0.0, -1.0);
  vec2 dxz = dir.xz; float dl = length(dxz);
  vec2 dh = dl > 1e-4 ? dxz / dl : sh;
  float sunSide = 0.35 + 0.65 * max(dot(dh, sh), 0.0);
  vec3 warmH = toLinear(mix(FLAME, GOLD, smoothstep(0.0, 0.18, el)));   // flame at the horizon → gold above

  // horizon band — the ember line, strongest toward the sun
  float band = exp(-abs(el) * 14.0);
  col += warmH * band * sunSide * 0.22 * warmGate * uSunVisible * heatGate;

  // sun-side scatter — long path near the horizon, fainter when the sun is high
  float d = dot(dir, uSunDir);
  float scatter = pow(max(d, 0.0), 8.0) * exp(-max(el, 0.0) * 9.0)
                * warmGate * uSunVisible * heatGate * mix(1.0, 0.5, clamp(uSunDir.y * 2.5, 0.0, 1.0));
  col += warmH * scatter * 0.35;
  // the haze catches the light
  col += warmH * max(n - 0.5, 0.0) * uHaze * scatter * 0.6;

  // sun halo — HDR core so Bloom takes it; a star lights the sky far less than the sun
  float th = acos(clamp(d, -1.0, 1.0));
  vec3 sunCol = toLinear(mix(STAR, mix(FLAME, GOLD, clamp(uSunDir.y * 4.0 + 0.3, 0.0, 1.0)), uSunHeat));
  float glow = uSunGlow * uSunVisible;
  // star mode (sunHeat < .35): both sun-sized lobes are gated to ≤ 12 % of the sun's — a star must read as a
  // point with the sun layer's diffraction spikes on black, not sit in a grey disc of sky-light (QA round 1).
  // haloGate is 1 from sunHeat .6, so the dusk / day skies are untouched; starW mirrors the sun layer's morph.
  float haloGate = mix(0.12, 1.0, smoothstep(0.20, 0.60, uSunHeat));
  float starW = 1.0 - smoothstep(0.20, 0.55, uSunHeat);
  col += mix(sunCol, HOT, 0.6) * 1.4 * exp(-th * 22.0) * glow * mix(0.35, 1.0, uSunHeat) * haloGate;        // HDR core (lum > .55 → Bloom)
  col += sunCol * 0.25 * exp(-th * mix(14.0, 6.0, uSunHeat)) * glow * mix(0.08, 1.0, uSunHeat) * haloGate;  // the wide atmospheric glow
  col += sunCol * 0.40 * exp(-th * 120.0) * glow * starW;                                                  // the star's own tight glow (≈ 30 px) — bloom still catches the point

  gl_FragColor = vec4(col, 1.0);
}
`

const blitVert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }
`
const blitFrag = /* glsl */ `
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
void main(){
  vec2 o = uTexel * 0.75;
  vec3 c = texture2D(uTex, vUv + vec2(-o.x, -o.y)).rgb
         + texture2D(uTex, vUv + vec2( o.x, -o.y)).rgb
         + texture2D(uTex, vUv + vec2(-o.x,  o.y)).rgb
         + texture2D(uTex, vUv + vec2( o.x,  o.y)).rgb;
  gl_FragColor = vec4(c * 0.25, 1.0);
}
`

export class SkyLayer implements Layer {
  name = 'sky'
  private dome!: THREE.ShaderMaterial
  private blit!: THREE.ShaderMaterial
  private rt!: THREE.WebGLRenderTarget
  private rtScene = new THREE.Scene()
  private rtCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad!: THREE.PlaneGeometry
  private domeMesh!: THREE.Mesh
  private blitMesh!: THREE.Mesh
  private camRot = new THREE.Matrix3()
  private sunDir = new THREE.Vector3(0, 0, -1)
  private idleFor = 0
  private parity = 0
  private dirty = true

  init(ctx: LayerCtx) {
    const w = Math.max(1, Math.floor(ctx.shared.vw * 0.5)), h = Math.max(1, Math.floor(ctx.shared.vh * 0.5))
    this.rt = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType, format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      depthBuffer: false, stencilBuffer: false, generateMipmaps: false,
    })
    this.rt.texture.name = 'sky.rt'
    this.quad = new THREE.PlaneGeometry(2, 2)

    this.dome = new THREE.ShaderMaterial({
      vertexShader: domeVert, fragmentShader: domeFrag, depthWrite: false, depthTest: false,
      uniforms: {
        uInvProj: { value: ctx.camera.projectionMatrixInverse },
        uCamRot: { value: this.camRot },
        uTop: { value: new THREE.Vector3(0.035, 0.051, 0.086) },
        uBottom: { value: new THREE.Vector3(0.055, 0.239, 0.341) },
        uSunDir: { value: this.sunDir },
        uHaze: { value: 0.35 }, uTime: { value: 0 }, uWarmth: { value: 0.35 },
        uSunGlow: { value: 0.8 }, uSunVisible: { value: 1 }, uSunHeat: { value: 0.5 },
      },
    })
    this.domeMesh = new THREE.Mesh(this.quad, this.dome)
    this.domeMesh.frustumCulled = false
    this.rtScene.add(this.domeMesh)

    this.blit = new THREE.ShaderMaterial({
      vertexShader: blitVert, fragmentShader: blitFrag, depthWrite: false, depthTest: false,
      uniforms: { uTex: { value: this.rt.texture }, uTexel: { value: new THREE.Vector2(1 / w, 1 / h) } },
    })
    this.blitMesh = new THREE.Mesh(this.quad, this.blit)
    this.blitMesh.frustumCulled = false
    this.blitMesh.renderOrder = -100
    ctx.scene.add(this.blitMesh)
  }

  resize(w: number, h: number) {
    const rw = Math.max(1, Math.floor(w * 0.5)), rh = Math.max(1, Math.floor(h * 0.5))
    this.rt.setSize(rw, rh)
    ;(this.blit.uniforms.uTexel.value as THREE.Vector2).set(1 / rw, 1 / rh)
    this.dirty = true
  }

  update(m: Mood, s: Shared, ctx: LayerCtx) {
    const u = this.dome.uniforms
    ;(u.uTop.value as THREE.Vector3).set(m.skyTop[0], m.skyTop[1], m.skyTop[2])
    ;(u.uBottom.value as THREE.Vector3).set(m.skyBottom[0], m.skyBottom[1], m.skyBottom[2])
    u.uHaze.value = m.haze
    u.uWarmth.value = m.warmth
    u.uSunGlow.value = m.sunGlow
    u.uSunVisible.value = m.sunVisible
    u.uSunHeat.value = m.sunHeat
    if (!s.reduced) u.uTime.value = s.time
    // view rays: the camera's world rotation (already updated by World this frame) and inverse projection
    this.camRot.setFromMatrix4(ctx.camera.matrixWorld)
    u.uInvProj.value = ctx.camera.projectionMatrixInverse
    // direction to the sun from the camera (world space)
    this.sunDir.subVectors(ctx.world.sunWorld, ctx.camera.position)
    if (this.sunDir.lengthSq() > 1e-8) this.sunDir.normalize(); else this.sunDir.set(0, 0, -1)

    // static-scene mode (mirrors World): when nothing moves for 500 ms, refresh the dome every other frame
    this.idleFor = Math.abs(s.velocity) < 0.05 && !s.mouse.down ? this.idleFor + Math.min(s.dt, 1 / 20) : 0
    this.parity ^= 1
    if (this.idleFor > 0.5 && this.parity === 1 && !this.dirty) return
    this.dirty = false

    // pass 1 — the dome at half resolution
    const r = ctx.renderer
    const prevTarget = r.getRenderTarget()
    const prevAutoClear = r.autoClear
    r.autoClear = false
    r.setRenderTarget(this.rt)
    r.render(this.rtScene, this.rtCam)
    r.setRenderTarget(prevTarget)
    r.autoClear = prevAutoClear
    // pass 2 — the blit quad is drawn by the World's RenderPass (renderOrder −100)
  }

  dispose() {
    this.rt.dispose()
    this.dome.dispose()
    this.blit.dispose()
    this.quad.dispose()
  }
}
