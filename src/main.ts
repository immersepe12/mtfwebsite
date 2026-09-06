import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/ui.css'
import { ScrollEngine, gsap, ScrollTrigger } from './engine/scroll'
import { World } from './engine/gl'
import { Stage } from './engine/stage'
import { createNullWorld } from './engine/nullworld'
import type { Shared } from './engine/chapter'
import { prefersReducedMotion, isTouch, isMobile, damp } from './engine/utils'
import { hex } from './engine/mood'
import { SkyLayer } from './gl/layers/sky'
import { SunLayer } from './gl/layers/sun'
import { SeaLayer } from './gl/layers/sea'
import { StarsLayer } from './gl/layers/stars'
import { TesseraeLayer } from './gl/layers/tesserae'
import { IslandLayer } from './gl/layers/island'
import { chapters } from './chapters/registry'
import content from './content/content.json'
import { initPreloader } from './ui/preloader'
import { initHeader } from './ui/header'
import { initCursor } from './ui/cursor'
import { initRail } from './ui/rail'
import { initHoldCue } from './ui/holdcue'
import { player } from './engine/play'

// dev harness flags: ?reduced (reduced-motion stack), ?nogl (DOM-only mode)
const qsBoot = new URLSearchParams(location.search)
if (qsBoot.has('reduced')) document.documentElement.classList.add('reduced-motion')
if (qsBoot.has('nogl')) document.documentElement.classList.add('no-gl')

const shared: Shared = {
  time: 0, dt: 0.016, scrollY: 0, scrollProgress: 0, velocity: 0,
  mouse: { x: 0, y: 0, tx: 0, ty: 0, down: false },
  vw: window.innerWidth, vh: window.innerHeight, dpr: Math.min(devicePixelRatio || 1, 2),
  reduced: prefersReducedMotion() || qsBoot.has('reduced'), touch: isTouch(), mobile: isMobile(),
}
;(window as any).__mtf = { shared, gsap, ScrollTrigger }

const hexOf = (c: number[]) => '#' + c.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('')
const progress = (phase: 'fonts' | 'chapters' | 'frame' | 'ready', value: number) =>
  document.dispatchEvent(new CustomEvent('mtf:progress', { detail: { phase, value } }))

async function boot() {
  const html = document.documentElement
  html.classList.add('js')
  if (shared.reduced) html.classList.add('reduced-motion')
  if (shared.touch) html.classList.add('is-touch')

  const preloader = initPreloader()
  const scroll = new ScrollEngine()
  scroll.stop()

  // WebGL world (graceful fallback when unavailable)
  let world: World | null = null
  const canvas = document.getElementById('gl') as HTMLCanvasElement | null
  try {
    if (canvas && !html.classList.contains('no-gl')) {
      world = new World(canvas, shared)
      // ?nolayer=tesserae,sea — diagnostic: leave layers out to find what a frame is actually spending its time on
      const skip = new Set((qsBoot.get('nolayer') || '').split(',').filter(Boolean))
      for (const [name, make] of [['sky', () => new SkyLayer()], ['stars', () => new StarsLayer()], ['sun', () => new SunLayer()], ['sea', () => new SeaLayer()], ['tesserae', () => new TesseraeLayer()], ['island', () => new IslandLayer()]] as const)
        if (!skip.has(name)) world.addLayer(make())
    }
  } catch (e) { console.warn('[gl] WebGL unavailable, running DOM-only', e); html.classList.add('no-gl'); world = null }

  const app = document.getElementById('app') as HTMLElement
  const stage = new Stage(app, chapters, world, scroll, shared, content, world ?? createNullWorld(shared))
  ;(window as any).__mtf.stage = stage
  ;(window as any).__mtf.world = world

  // pointer
  window.addEventListener('pointermove', e => { shared.mouse.tx = (e.clientX / shared.vw) * 2 - 1; shared.mouse.ty = -((e.clientY / shared.vh) * 2 - 1) }, { passive: true })
  window.addEventListener('pointerdown', () => (shared.mouse.down = true))
  window.addEventListener('pointerup', () => (shared.mouse.down = false))
  window.addEventListener('resize', () => { shared.vw = innerWidth; shared.vh = innerHeight; shared.mobile = isMobile(); world?.resize(); stage.measure() })

  await stage.mount()
  progress('chapters', 1)
  initHeader({ scroll, chapters, content, stage })
  initRail({ stage, scroll, world, chapters, content })
  initCursor(shared)
  initHoldCue()
  ;(window as any).__mtf.play = player

  // wait for fonts, then a frame, then open the curtain
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]) } catch {}
  progress('fonts', 1)
  await new Promise(r => requestAnimationFrame(() => r(null)))
  ScrollTrigger.refresh(); stage.measure()
  ScrollTrigger.config({ ignoreMobileResize: true })

  let last = performance.now() / 1000
  gsap.ticker.add(() => {
    const now = performance.now() / 1000
    shared.dt = Math.min(0.05, now - last); last = now
    shared.time += shared.dt
    shared.scrollY = scroll.y; shared.scrollProgress = scroll.progress; shared.velocity = scroll.velocity
    const k = 1 - Math.exp(-5 * shared.dt)
    shared.mouse.x = damp(shared.mouse.x, shared.mouse.tx, 5, shared.dt)
    shared.mouse.y = damp(shared.mouse.y, shared.mouse.ty, 5, shared.dt)
    void k
    stage.frame(shared)
    world?.update(shared)
  })
  if (world) { stage.frame(shared); world.snap(); world.update(shared); world.prewarm(shared) }
  progress('frame', 1)

  await preloader.done()
  progress('ready', 1)
  scroll.start()
  html.classList.add('is-ready')
  document.dispatchEvent(new CustomEvent('mtf:ready'))

  // dev harness: ?chapter=<id>&p=<0..1> jumps into a chapter; ?debug shows a mood readout; ?autoplay presses play
  const q = new URLSearchParams(location.search)
  if (q.has('autoplay')) requestAnimationFrame(() => player.start())
  const ch = q.get('chapter')
  if (ch) {
    const m = stage.mounted.find(x => x.chapter.id === ch)
    if (m) {
      const p = parseFloat(q.get('p') ?? '0')
      // film chapters: p is the pinned travel (top top → bottom bottom); flowing chapters: section-relative
      const y = m.film ? m.top + stage.travelOf(m, shared.vh) * p : m.top + m.height * p
      scroll.lenis?.scrollTo(y, { immediate: true }); ScrollTrigger.update()
    }
  }
  const mo = q.get('mood')
  if (mo) {
    const o: Record<string, unknown> = {}
    for (const kv of mo.split(',')) { const [k, v] = kv.split(':'); if (!k || v === undefined) continue; o[k] = v.startsWith('#') ? hex(v) : parseFloat(v) }
    stage.override = o as any
  }
  if (q.has('debug')) {
    const d = document.createElement('pre'); d.id = 'debug'; d.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:999;font:11px/1.3 ui-monospace,monospace;color:#fff;background:rgba(0,0,0,.6);padding:8px;margin:0;pointer-events:none;max-width:40vw;white-space:pre-wrap'
    document.body.appendChild(d)
    gsap.ticker.add(() => { const w = world; if (!w) return; const m = w.mood; d.textContent = `y ${Math.round(shared.scrollY)}  fps ${Math.round(1 / Math.max(shared.dt, 0.001))}  dpr ${shared.dpr.toFixed(2)}\nsun ${m.sunX.toFixed(2)},${m.sunY.toFixed(2)},${m.sunZ.toFixed(2)} r${m.sunRadius.toFixed(2)} heat ${m.sunHeat.toFixed(2)}\ncam ${m.camX.toFixed(2)},${m.camY.toFixed(2)},${m.camZ.toFixed(2)} fov ${m.fov.toFixed(0)}\nsea ${m.seaY.toFixed(2)} amp ${m.seaAmp.toFixed(2)} op ${m.seaOpacity.toFixed(2)}  stars ${m.stars.toFixed(2)}  tess ${m.tess.toFixed(2)} form ${m.tessForm.toFixed(2)} spread ${m.tessSpread.toFixed(2)}  mosaic ${m.mosaic.toFixed(2)}  warmth ${m.warmth.toFixed(2)}\nsky ${hexOf(m.skyTop)} → ${hexOf(m.skyBottom)}  sea ${hexOf(m.seaColor)}  veil ${m.veil.toFixed(2)} yaw ${m.camYaw.toFixed(2)} p1-4 ${m.p1.toFixed(2)} ${m.p2.toFixed(0)} ${m.p3.toFixed(2)} ${m.p4.toFixed(2)}` })
  }
}

boot().catch(e => { console.error(e); document.documentElement.classList.add('is-ready', 'boot-failed') })
