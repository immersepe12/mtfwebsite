import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, isTouch } from './utils'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollEngine — Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger.
 * Everything scroll-driven in the site reads `scroll.y`, `scroll.progress` (0..1 of the whole page)
 * and `scroll.velocity`, or uses ScrollTrigger directly.
 */
export class ScrollEngine {
  lenis: Lenis | null = null
  y = 0
  progress = 0
  velocity = 0
  limit = 1
  private listeners = new Set<(s: ScrollEngine) => void>()

  constructor() {
    const reduced = prefersReducedMotion()
    this.lenis = new Lenis({
      lerp: reduced ? 1 : 0.085,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: !reduced,
      syncTouch: false,
      autoRaf: false,
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
  }

  onScroll(fn: (s: ScrollEngine) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  scrollTo(target: number | string | HTMLElement, opts: Record<string, unknown> = {}) {
    this.lenis?.scrollTo(target as any, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4), ...opts })
  }
  stop() { this.lenis?.stop(); document.documentElement.classList.add('is-locked') }
  start() { this.lenis?.start(); document.documentElement.classList.remove('is-locked') }
  refresh() { ScrollTrigger.refresh() }
}

export { gsap, ScrollTrigger }
