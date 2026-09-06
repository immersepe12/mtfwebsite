import * as THREE from 'three'
import { EffectComposer, RenderPass, EffectPass, BloomEffect, NoiseEffect, VignetteEffect, ChromaticAberrationEffect, BlendFunction, KernelSize } from 'postprocessing'
import { DEFAULT_MOOD, copyMood, lerpMood, type Mood } from './mood'
import type { Shared } from './chapter'
import { MosaicEffect } from '../gl/post/mosaic'

export interface LayerCtx {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  shared: Shared
  world: World
}
/** A Layer is one visual system of the world (sky, sun, sea, stars, tesserae, veil…). One file each. */
export interface Layer {
  name: string
  init(ctx: LayerCtx): void
  update(mood: Mood, shared: Shared, ctx: LayerCtx): void
  resize?(w: number, h: number, ctx: LayerCtx): void
  dispose?(): void
}

/**
 * World — ONE renderer, ONE scene, ONE camera, a composer, and a stack of layers.
 * It never knows about chapters; it only receives a target Mood every frame and damps toward it.
 */
export class World {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera: THREE.PerspectiveCamera
  composer: EffectComposer
  layers: Layer[] = []
  mood: Mood = copyMood(DEFAULT_MOOD, { ...DEFAULT_MOOD })
  target: Mood = copyMood(DEFAULT_MOOD, { ...DEFAULT_MOOD })
  damping = 3.1   // how fast the world follows the blended chapter mood; lower = gentler camera and colour
  shared: Shared
  effects: { bloom: BloomEffect; noise: NoiseEffect; vignette: VignetteEffect; mosaic: MosaicEffect; aberration: ChromaticAberrationEffect }
  /** Sun position in NDC (-1..1), updated every frame; layers may read it (sky halo, sea specular, lens). */
  sunNdc = new THREE.Vector2(0, 0.3)
  sunWorld = new THREE.Vector3()
  private ctx: LayerCtx
  private dprCap = 1.75
  private cssTick = 0
  private lastSky = -1
  private lastWarmth = -1
  private lastVeil = -1
  private lastTear = -1
  private lastHorizon = -1
  private tmpV = new THREE.Vector3()
  private idleFor = 0
  private frameParity = 0
  private frameAcc = 0
  private frameN = 0

  constructor(public canvas: HTMLCanvasElement, shared: Shared) {
    this.shared = shared
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, depth: true })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.setClearColor(0x090d16, 1)
    this.camera = new THREE.PerspectiveCamera(DEFAULT_MOOD.fov, 1, 0.1, 400)
    this.camera.position.set(DEFAULT_MOOD.camX, DEFAULT_MOOD.camY, DEFAULT_MOOD.camZ)
    this.camera.rotation.order = 'YXZ'

    this.composer = new EffectComposer(this.renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 })
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    const bloom = new BloomEffect({ intensity: 0.6, luminanceThreshold: 0.55, luminanceSmoothing: 0.35, mipmapBlur: true, kernelSize: KernelSize.LARGE, radius: 0.7 })
    const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true })
    noise.blendMode.opacity.value = 0.08
    const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.5 })
    const mosaic = new MosaicEffect()
    const aberration = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0, 0), radialModulation: true, modulationOffset: 0.3 })
    this.effects = { bloom, noise, vignette, mosaic, aberration }
    this.composer.addPass(new EffectPass(this.camera, bloom, mosaic, aberration, noise, vignette))

    this.ctx = { scene: this.scene, camera: this.camera, renderer: this.renderer, shared, world: this }
    this.resize()
  }

  addLayer(layer: Layer) {
    layer.init(this.ctx)
    this.layers.push(layer)
    return this
  }

  /** Convenience accessors for layers other modules need to talk to (e.g. the tesserae formation anchors). */
  layer<T extends Layer = Layer>(name: string): T | undefined { return this.layers.find(l => l.name === name) as T | undefined }
  get tesserae() { return this.layer<any>('tesserae') }
  /**
   * Compile every material and warm the post chain before the film starts. A shader that first compiles when
   * its chapter arrives stalls the main thread for hundreds of milliseconds — exactly the hitch you feel as
   * the scroll "sticking" at a transition.
   */
  prewarm(shared: Shared) {
    try {
      this.renderer.compile(this.scene, this.camera)
      const m = this.mood
      const was = { mosaic: m.mosaic, tess: m.tess, tessForm: m.tessForm, stars: m.stars, veil: m.veil }
      // touch the states that own their own shader branches so nothing compiles mid-scroll
      for (const form of [0, 1, 2, 3, 4, 5]) {
        m.tess = 1; m.tessForm = form; m.mosaic = form === 0 ? 0.5 : 0; m.stars = 1
        for (const l of this.layers) l.update(m, shared, this.ctx)
        this.composer.render(1 / 60)
      }
      Object.assign(m, was)
      for (const l of this.layers) l.update(m, shared, this.ctx)
      this.composer.render(1 / 60)
    } catch (e) { console.warn('[gl] prewarm skipped', e) }
  }

  setTarget(m: Mood) { copyMood(m, this.target) }
  snap() { copyMood(this.target, this.mood); this.forceRender = true }
  forceRender = true
  /** Screen-space position (CSS px from the viewport's top-left) of a world point. Reuses an internal vector; copy the result. */
  project(x: number, y: number, z: number): { x: number; y: number; z: number } {
    this.tmpV.set(x, y, z).project(this.camera)
    return { x: (this.tmpV.x * 0.5 + 0.5) * this.shared.vw, y: (1 - (this.tmpV.y * 0.5 + 0.5)) * this.shared.vh, z: this.tmpV.z }
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight
    const mobile = w < 820
    if (this.dprCap === 1.75 && mobile) this.dprCap = 1.5
    const dpr = Math.min(window.devicePixelRatio || 1, this.dprCap)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.composer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.shared.vw = w; this.shared.vh = h; this.shared.dpr = dpr
    this.layers.forEach(l => l.resize?.(w, h, this.ctx))
  }

  update(shared: Shared) {
    const dt = Math.min(shared.dt, 1 / 20)
    // damp current mood toward target
    const k = 1 - Math.exp(-this.damping * dt)
    lerpMood(this.mood, this.target, k, this.mood)
    const m = this.mood
    // camera
    const mx = shared.mouse.x, my = shared.mouse.y
    this.camera.fov = m.fov
    this.camera.position.set(m.camX + mx * 0.18, m.camY + my * 0.10, m.camZ)
    this.camera.rotation.set(m.camTilt + my * 0.012, m.camYaw - mx * 0.02, 0)  // camYaw = Three.js Y rotation: positive turns LEFT (toward −X)
    this.camera.updateProjectionMatrix()
    this.camera.updateMatrixWorld()
    // sun ndc (no allocations)
    this.sunWorld.set(m.sunX, m.sunY, m.sunZ)
    this.tmpV.copy(this.sunWorld).project(this.camera)
    this.sunNdc.set(this.tmpV.x, this.tmpV.y)
    // expose the live sky to CSS (chrome tints itself from the world: --sky-now, --warmth-now)
    // ── the world's live values, published to CSS ──────────────────────────────────────────────────
    // Writing a custom property on the root invalidates style for the whole document, so each value is
    // quantised and only written when it has actually changed: at 60fps an unquantised write is a full
    // style recalculation several times a second, and that is what a stutter is made of.
    this.cssTick = (this.cssTick + 1) % 3
    if (this.cssTick === 0) {
      const root = document.documentElement.style
      const r = Math.round(m.skyBottom[0] * 255), g = Math.round(m.skyBottom[1] * 255), b = Math.round(m.skyBottom[2] * 255)
      const sky = (r << 16) | (g << 8) | b
      if (sky !== this.lastSky) { this.lastSky = sky; root.setProperty('--sky-now', `rgb(${r} ${g} ${b})`) }
      const w = Math.round(m.warmth * 50) / 50
      if (w !== this.lastWarmth) { this.lastWarmth = w; root.setProperty('--warmth-now', w.toFixed(2)) }
      const v = Math.round(m.veil * 500) / 500
      if (v !== this.lastVeil) { this.lastVeil = v; root.setProperty('--veil-now', v.toFixed(3)) }
      const tr = Math.round(m.p4 * 500) / 500
      if (tr !== this.lastTear) { this.lastTear = tr; root.setProperty('--tear-now', tr.toFixed(3)) }
      this.tmpV.set(m.camX - Math.sin(m.camYaw) * 400, m.seaY, m.camZ - Math.cos(m.camYaw) * 400).project(this.camera)
      const hy = Math.round(Math.min(80, Math.max(30, (1 - this.tmpV.y) * 50)) * 8) / 8
      if (hy !== this.lastHorizon) { this.lastHorizon = hy; root.setProperty('--horizon-now', `${hy.toFixed(2)}%`) }
    }
    // effects
    this.effects.bloom.intensity = m.bloom
    this.effects.noise.blendMode.opacity.value = m.grain
    this.effects.vignette.darkness = m.vignette
    this.effects.mosaic.amount = m.mosaic
    ;(this.effects.mosaic as any).sweep = shared.scrollProgress * Math.PI * 2
    this.effects.aberration.offset.set(m.aberration * 0.004, m.aberration * 0.004)
    // layers
    for (const l of this.layers) l.update(m, shared, this.ctx)
    // static-scene mode: when nothing is scrolling for 500ms, render every other frame (≈30fps) to save battery
    this.idleFor = Math.abs(shared.velocity) < 0.05 && !shared.mouse.down ? this.idleFor + dt : 0
    this.frameParity ^= 1
    if (this.idleFor > 0.5 && this.frameParity === 1 && !this.forceRender) return
    this.forceRender = false
    this.composer.render(dt)
    // adaptive DPR governor: if we average > 24ms/frame over ~1.5s, step the pixel ratio down (never below 1)
    this.frameAcc += shared.dt; this.frameN++
    if (this.frameN >= 90) {
      const avg = this.frameAcc / this.frameN
      this.frameAcc = 0; this.frameN = 0
      if (avg > 0.024 && this.dprCap > 1.0) { this.dprCap = Math.max(1.0, this.dprCap - 0.25); this.resize() }
    }
  }

  dispose() { this.layers.forEach(l => l.dispose?.()); this.composer.dispose(); this.renderer.dispose() }
}
