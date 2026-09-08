import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, isTouch } from './utils'
import { entryOf, holdEnabled, withinFilms } from './hold'
import { player } from './play'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollEngine — Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger.
 * Everything scroll-driven in the site reads `scroll.y`, `scroll.progress` (0..1 of the whole page)
 * and `scroll.velocity`, or uses ScrollTrigger directly.
 *
 * Inside the film the wheel does not scrub: a gesture means "next" (or "back"), and the film plays itself to the
 * next stop at its written pace (engine/play.ts · engine/hold.ts). Outside the film (the footer) it scrolls
 * freely. The keys do the same. Touch stays native. Any input takes the film back from PLAY THE STORY.
 */
export class ScrollEngine {
  lenis: Lenis | null = null
  y = 0
  progress = 0
  velocity = 0
  limit = 1
  private listeners = new Set<(s: ScrollEngine) => void>()
  /** a wheel gesture is counted in distance: every NOTCH px of travel asks for one more stop */
  private wheeled = 0
  private lastWheel = 0
  private dir: 1 | -1 = 1
  private static NOTCH = 150

  constructor() {
    const reduced = prefersReducedMotion()
    this.lenis = new Lenis({
      lerp: reduced ? 1 : 0.062,   // a longer glide: the world keeps moving after the wheel stops
      wheelMultiplier: 0.85,
      touchMultiplier: 1.15,
      smoothWheel: !reduced,
      syncTouch: false,
      autoRaf: false,
      virtualScroll: (data: { deltaX: number; deltaY: number; event: Event }) => this.meter(data),
    })
    this.lenis.on('scroll', (e: any) => {
      this.y = e.scroll ?? e.animatedScroll ?? window.scrollY
      this.limit = e.limit || Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      this.progress = Math.min(1, Math.max(0, this.y / this.limit))
      this.velocity = e.velocity ?? 0
      ScrollTrigger.update()
      this.listeners.forEach(fn => fn(this))
    })
    gsap.ticker.add(t => this.lenis?.raf(t * 1000))
    gsap.ticker.lagSmoothing(0)
    // Touch devices: Lenis still runs but keeps native feel.
    if (isTouch()) document.documentElement.classList.add('is-touch')
    player.attach(this.lenis)
    window.addEventListener('keydown', e => this.keys(e))
  }

  /** The wheel, inside the film: one gesture, one step. */
  private meter(data: { deltaX: number; deltaY: number; event: Event }): boolean {
    const l = this.lenis
    if (!l) return true
    const e = data.event
    if (!e.type.includes('wheel')) return true                 // touch stays native
    if (data.deltaY !== 0 || data.deltaX !== 0) player.interrupt()
    if (!holdEnabled || data.deltaY === 0 || l.isStopped) return true
    if (!withinFilms(l.animatedScroll, window.innerHeight)) return true   // the footer scrolls freely
    if (e.cancelable) e.preventDefault()
    const now = performance.now()
    const dir = data.deltaY > 0 ? 1 : -1
    const fresh = now - this.lastWheel > 260
    this.lastWheel = now
    // a trackpad's tail is a few tiny events, sometimes the other way: never a reversal mid-gesture, never a step
    // for a bounce — that is what sent the film forward and straight back again
    if (Math.abs(data.deltaY) < 8) return false
    if (!fresh && dir !== this.dir) return false
    // a new gesture always moves one stop, so the smallest deliberate nudge is answered; a gesture that keeps
    // going asks for another stop every notch of travel (the player queues at most a few, which caps a hard flick)
    if (fresh) { this.wheeled = 0; this.dir = dir; player.step(dir) }
    else {
      this.wheeled += Math.abs(data.deltaY)
      while (this.wheeled >= ScrollEngine.NOTCH) { this.wheeled -= ScrollEngine.NOTCH; player.step(dir) }
    }
    return false
  }

  /** The keys: next and back, like the wheel; Home and End jump. */
  private keys(e: KeyboardEvent) {
    const l = this.lenis
    if (!l || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement | null
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    if (t && /^(BUTTON|A)$/.test(t.tagName) && e.key === ' ') return   // space presses the control it is on
    if (e.key === 'Escape') { player.interrupt(); return }
    if (document.documentElement.classList.contains('nav-open') || l.isStopped) return
    let dir: 1 | -1 | 0 = 0, jump: number | null = null
    switch (e.key) {
      case 'ArrowDown': case 'PageDown': dir = 1; break
      case 'ArrowUp': case 'PageUp': dir = -1; break
      case ' ': dir = e.shiftKey ? -1 : 1; break
      case 'End': jump = l.limit; break
      case 'Home': jump = 0; break
      default: return
    }
    e.preventDefault()
    player.interrupt()
    if (jump !== null) { l.scrollTo(jump, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing }); return }
    if (!holdEnabled || !withinFilms(l.animatedScroll, window.innerHeight)) {
      const step = (dir as number) * window.innerHeight * 0.7
      l.scrollTo(Math.min(l.limit, Math.max(0, l.targetScroll + step)), { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
      return
    }
    player.step(dir as 1 | -1)
  }

  onScroll(fn: (s: ScrollEngine) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  /** Go to a chapter (or a position). A chapter is entered at its first stop, never on its empty opening frame. */
  scrollTo(target: number | string | HTMLElement, opts: Record<string, unknown> = {}) {
    player.cancel()
    let t: number | string | HTMLElement = target
    if (typeof t === 'string' && t.startsWith('#')) t = document.getElementById(t.slice(1)) ?? t
    if (t instanceof HTMLElement) { const y = entryOf(t); if (y !== null) t = y }
    this.lenis?.scrollTo(t as any, { duration: 1.6, easing: (t2: number) => 1 - Math.pow(1 - t2, 4), ...opts })
  }
  stop() { this.lenis?.stop(); document.documentElement.classList.add('is-locked') }
  start() { this.lenis?.start(); document.documentElement.classList.remove('is-locked') }
  refresh() { ScrollTrigger.refresh() }
}

export { gsap, ScrollTrigger }
