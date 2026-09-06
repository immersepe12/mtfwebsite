import * as THREE from 'three'
import type { Layer, LayerCtx } from '../../engine/gl'
import type { Mood } from '../../engine/mood'
import type { Shared } from '../../engine/chapter'
import { SRGB_TO_LINEAR_GLSL } from '../../engine/mood'

/**
 * The island — Ogygia, "a diamond set in blue" (DESIGN-BIBLE §6.4, §9.5).
 *
 * A cut stone rather than a silhouette: honey limestone in stepped, flat-topped mesas (Gozo's own geology),
 * every face a facet, with a natural rock window at its western point through which the star lands. Built once
 * from a seeded outline — three terraces, each wall split into two bands of facets, each plateau a shallow
 * pyramid — and lit in the shader from a flat normal (dFdx/dFdy), so nothing is smooth: the star in the window
 * is a near, warm key light with falloff, the sky is the fill, the water bounces up into the underside of the
 * cliffs, a rim from the sky lifts the silhouette off the sea, and a sharp specular gives the facets their glint.
 * Aerial haze carries it back toward the sky when a chapter places it on the horizon. A mirrored copy under
 * the waterline, drawn after the sea with no depth test and fading with depth, is its reflection.
 *
 * Mood: island (presence 0→1), islandX/Y/Z (the window's base — Y is the waterline it stands in), islandScale,
 * islandYaw, islandTone (0 night stone → 1 the paper world's sand). Chapters place it; the world never moves it
 * on its own. Renders after the tesserae and before the sun (renderOrder −55), so the star's billboard is
 * depth-tested against the rock and reads as sitting IN the window rather than printed over it.
 */

const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

/** outline of a jittered ellipse, CCW from above, with an optional bay bitten out of the +z (near) side */
function outline(cx: number, cz: number, rx: number, rz: number, n: number, jitter: number, rnd: () => number, bay?: { x: number; w: number; depth: number }) {
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    let r = 1 + (rnd() - 0.5) * 2 * jitter
    let x = cx + Math.cos(a) * rx * r, z = cz + Math.sin(a) * rz * r
    if (bay && z > cz) { const k = Math.max(0, 1 - Math.abs(x - bay.x) / bay.w); z -= bay.depth * k * k * (3 - 2 * k) }
    pts.push([x, z])
  }
  return pts
}
/** the same outline pulled in toward its centre (a terrace's top edge sits inside its foot) */
const inset = (pts: [number, number][], cx: number, cz: number, by: number) => pts.map(([x, z]) => { const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz) || 1; const k = Math.max(0.15, 1 - by / d); return [cx + dx * k, cz + dz * k] as [number, number] })

export class IslandLayer implements Layer {
  name = 'island'
  private geo!: THREE.BufferGeometry
  private mat!: THREE.ShaderMaterial
  private mirrorMat!: THREE.ShaderMaterial
  private mesh!: THREE.Mesh
  private mirror!: THREE.Mesh
  private u = {
    uSun: { value: new THREE.Vector3() }, uCam: { value: new THREE.Vector3() },
    uSkyTop: { value: new THREE.Color() }, uSkyBot: { value: new THREE.Color() }, uSeaCol: { value: new THREE.Color() },
    uSunGlow: { value: 1 }, uSunHeat: { value: 0 }, uSunVis: { value: 1 }, uWarmth: { value: 0.3 }, uTone: { value: 0 }, uHaze: { value: 0.2 },
    uAlpha: { value: 1 }, uMirror: { value: 0 }, uSeaY: { value: -1.2 }, uStars: { value: 0.5 },
  }

  init(ctx: LayerCtx) {
    this.geo = buildIsland()
    const vert = /* glsl */ `
      varying vec3 vW; varying float vH;
      void main(){
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz; vH = position.y;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`
    const frag = /* glsl */ `
      precision highp float;
      varying vec3 vW; varying float vH;
      uniform vec3 uSun, uCam, uSkyTop, uSkyBot, uSeaCol;
      uniform float uSunGlow, uSunHeat, uSunVis, uWarmth, uTone, uHaze, uAlpha, uMirror, uSeaY, uStars;
      ${SRGB_TO_LINEAR_GLSL}
      float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main(){
        // the facet: one flat normal per triangle, turned to face the eye (a visible face of a solid always does)
        vec3 V = normalize(uCam - vW);
        vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
        if (dot(n, V) < 0.0) n = -n;
        float fid = hash(floor(n * 61.0 + 0.5));
        // honey limestone by night, the paper world's sand by day; every facet a slightly different cut
        vec3 stone = srgbToLinear(vec3(0.64, 0.50, 0.32));
        vec3 sand  = srgbToLinear(vec3(0.86, 0.80, 0.66));
        vec3 alb = mix(stone, sand, uTone) * (0.86 + 0.28 * fid);
        // the key: the star in the window (near, warm, falling off) or the sun (far, even)
        vec3 toSun = uSun - vW;
        float d = length(toSun);
        vec3 L = toSun / max(d, 1e-3);
        float key = max(dot(n, L), 0.0);
        float near = clamp(1.4 / (0.6 + d * d * 0.5), 0.0, 1.3);         // a star a few units away lights the cave mouth, and little else
        float att = mix(near, 1.0, uSunHeat) * uSunVis;
        vec3 keyCol = mix(vec3(1.0, 0.84, 0.58), vec3(1.0, 0.96, 0.88), uSunHeat) * (0.3 + 0.45 * uSunGlow);
        // the fill: sky from above, water from below
        float up = n.y * 0.5 + 0.5;
        vec3 skyFill = mix(uSkyBot, uSkyTop, clamp(n.y, 0.0, 1.0));
        vec3 amb = mix(uSeaCol * 0.7, skyFill, up) * (0.9 + 0.5 * uTone) + uSkyBot * 0.18;
        amb += vec3(0.12, 0.14, 0.2) * uStars * 0.5;                    // starlight, faint and cool
        // the rim from the sky, and the glint of a cut face
        float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0) * 0.22;
        float spec = pow(max(dot(reflect(-L, n), V), 0.0), 28.0) * (0.22 + 0.3 * uTone) * att;
        vec3 col = alb * (amb * (0.75 + 0.35 * uWarmth) + keyCol * key * att) + rim * skyFill * (0.6 + 0.4 * uTone) + spec * keyCol;
        // the shore: a damp, darker band where the stone meets the water
        col *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.14, vH));
        // aerial perspective: the far island goes to the sky
        float dist = length(uCam - vW);
        float fog = 1.0 - exp(-dist * (0.004 + uHaze * 0.012));
        col = mix(col, uSkyBot, fog * 0.9);
        float a = uAlpha;
        if (uMirror > 0.5) { a *= 0.16 * (1.0 - smoothstep(0.0, 0.8, vH)); col = mix(col, uSeaCol, 0.45); }
        gl_FragColor = vec4(col, a);
      }`
    const make = (mirror: boolean) => new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: frag,
      uniforms: mirror ? { ...this.u, uMirror: { value: 1 }, uAlpha: { value: 1 } } : this.u,
      transparent: true, depthWrite: !mirror, depthTest: !mirror, side: THREE.DoubleSide,
    })
    this.mat = make(false)
    this.mirrorMat = make(true)
    this.mesh = new THREE.Mesh(this.geo, this.mat)
    this.mesh.renderOrder = -55
    this.mesh.frustumCulled = false
    this.mirror = new THREE.Mesh(this.geo, this.mirrorMat)
    this.mirror.renderOrder = -15
    this.mirror.frustumCulled = false
    this.mirror.scale.y = -1
    ctx.scene.add(this.mesh, this.mirror)
  }

  update(m: Mood, _s: Shared, ctx: LayerCtx) {
    const vis = m.island
    this.mesh.visible = vis > 0.01
    this.mirror.visible = vis > 0.01 && m.seaOpacity > 0.05
    if (!this.mesh.visible) return
    const sc = Math.max(m.islandScale, 1e-3)
    this.mesh.position.set(m.islandX, m.islandY, m.islandZ)
    this.mesh.rotation.y = m.islandYaw
    this.mesh.scale.set(sc, sc, sc)
    // the reflection: the same stone hung under the waterline it stands in
    this.mirror.position.set(m.islandX, 2 * m.seaY - m.islandY, m.islandZ)
    this.mirror.rotation.y = m.islandYaw
    this.mirror.scale.set(sc, -sc, sc)
    const u = this.u
    u.uSun.value.copy(ctx.world.sunWorld)
    u.uCam.value.copy(ctx.camera.position)
    u.uSkyTop.value.setRGB(m.skyTop[0], m.skyTop[1], m.skyTop[2], THREE.SRGBColorSpace)
    u.uSkyBot.value.setRGB(m.skyBottom[0], m.skyBottom[1], m.skyBottom[2], THREE.SRGBColorSpace)
    u.uSeaCol.value.setRGB(m.seaColor[0], m.seaColor[1], m.seaColor[2], THREE.SRGBColorSpace)
    u.uSunGlow.value = m.sunGlow
    u.uSunHeat.value = m.sunHeat
    u.uSunVis.value = m.sunVisible * Math.min(1, m.sunRadius / 0.02)
    u.uWarmth.value = m.warmth
    u.uTone.value = m.islandTone
    u.uHaze.value = m.haze
    u.uSeaY.value = m.seaY
    u.uStars.value = m.stars
    u.uAlpha.value = vis
    ;(this.mirrorMat.uniforms.uAlpha as { value: number }).value = vis * Math.min(1, m.seaOpacity)
  }

  dispose() { this.geo.dispose(); this.mat.dispose(); this.mirrorMat.dispose() }
}

/**
 * The stone. Local units: the origin is the base of the rock window at the waterline; +x east (right), +z toward
 * the shore the camera looks from. The body runs east of the window; nothing stands behind the window, so the
 * star's ray through it meets open sea.
 */
function buildIsland(): THREE.BufferGeometry {
  const rnd = seeded(7331)
  const pos: number[] = []
  const tri = (a: number[], b: number[], c: number[]) => pos.push(...a, ...b, ...c)

  /**
   * A terrace: its foot outline at y0, its top (inset: the wall leans in) at y1. The wall is two bands of facets
   * — the mid ring bulges out, so a cliff has a shoulder, not a plane — and the plateau is two rings of broken
   * facets around a low crown.
   */
  const terrace = (foot: [number, number][], top: [number, number][], y0: number, y1: number, cx: number, cz: number, crown: number) => {
    const n = foot.length
    const ym = y0 + (y1 - y0) * (0.55 + (rnd() - 0.5) * 0.1)
    const mid = foot.map(([fx, fz], i) => { const [tx, tz] = top[i]; const k = 0.45 + (rnd() - 0.5) * 0.3; const bulge = 1.08 + rnd() * 0.1; return [cx + (fx + (tx - fx) * k - cx) * bulge, cz + (fz + (tz - fz) * k - cz) * bulge] as [number, number] })
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const f0 = [foot[i][0], y0, foot[i][1]], f1 = [foot[j][0], y0, foot[j][1]]
      const m0 = [mid[i][0], ym + (rnd() - 0.5) * 0.08 * (y1 - y0), mid[i][1]], m1 = [mid[j][0], ym + (rnd() - 0.5) * 0.08 * (y1 - y0), mid[j][1]]
      const t0 = [top[i][0], y1, top[i][1]], t1 = [top[j][0], y1, top[j][1]]
      tri(f0, m1, f1); tri(f0, m0, m1)
      tri(m0, m1, t1); tri(m0, t1, t0)
    }
    const inner = inset(top, cx, cz, 0.45).map(([x, z]) => [x, y1 + (rnd() - 0.5) * 0.07 + crown * 0.5, z])
    const c = [cx, y1 + crown, cz]
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const t0 = [top[i][0], y1, top[i][1]], t1 = [top[j][0], y1, top[j][1]]
      tri(t0, t1, inner[j]); tri(t0, inner[j], inner[i])
      tri(inner[i], inner[j], c)
    }
  }
  /** a boulder: an irregular outline extruded with a lean and a broken top */
  const boulder = (cx: number, cz: number, rx: number, rz: number, y0: number, y1: number, n: number, jitter: number, lean: number) => {
    const foot = outline(cx, cz, rx, rz, n, jitter, rnd)
    terrace(foot, inset(foot, cx, cz, lean), y0, y1, cx, cz, 0.03)
  }

  // ── the body: three mesas stepping up toward the east ──
  const C1 = [1.85, -0.1], C2 = [2.2, -0.24], C3 = [2.5, -0.34]
  const foot1 = outline(C1[0], C1[1], 1.5, 0.95, 24, 0.11, rnd, { x: 1.2, w: 0.7, depth: 0.3 })   // the Ramla bay on the near shore
  terrace(foot1, inset(foot1, C1[0], C1[1], 0.3), -0.4, 0.5, C1[0], C1[1], 0.05)                  // the foot starts under the water
  const foot2 = outline(C2[0], C2[1], 1.0, 0.6, 18, 0.12, rnd)
  terrace(foot2, inset(foot2, C2[0], C2[1], 0.2), 0.5, 0.88, C2[0], C2[1], 0.04)
  const foot3 = outline(C3[0], C3[1], 0.56, 0.34, 12, 0.14, rnd)
  terrace(foot3, inset(foot3, C3[0], C3[1], 0.13), 0.88, 1.14, C3[0], C3[1], 0.04)
  // a low shelf between the body and the window (the cave's own headland)
  boulder(0.85, 0.1, 0.5, 0.4, -0.3, 0.36, 12, 0.14, 0.12)

  // ── the window: two pillars and a lintel, each a boulder ──
  boulder(-0.6, 0.0, 0.2, 0.32, -0.3, 0.82, 9, 0.18, 0.05)     // west pillar
  boulder(0.6, 0.0, 0.2, 0.32, -0.3, 0.86, 9, 0.18, 0.05)      // east pillar (leans on the shelf)
  boulder(0.0, 0.0, 0.84, 0.3, 0.76, 1.0, 12, 0.08, 0.06)      // the lintel across them
  boulder(-1.05, 0.15, 0.3, 0.22, -0.3, 0.22, 8, 0.2, 0.06)    // a fallen block at the west point

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.computeBoundingSphere()
  return geo
}
