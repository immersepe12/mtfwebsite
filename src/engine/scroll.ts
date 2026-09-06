import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion, isTouch } from './utils'
import { holdState, limitAhead, nextStop, settleTarget } from './hold'
import { player } from './play'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollEngine — Lenis smooth scroll wired into GSAP's ticker + ScrollTrigger.
 * Everything scroll-driven in the site reads `scroll.y`, `scroll.progress` (0..1 of the whole page)
 * and `scroll.velocity`, or uses ScrollTrigger directly.
 *
 * Wheel input passes through the hold (engine/hold.ts): when the text on screen is owed reading time before it
 * leaves, forward input is shortened so the scroll settles on it. A gesture made against that gate is not lost —
 * it is remembered and let go the moment the time is up, to the next sentence whole. A gesture that reaches into
 * a sentence's arrival completes it. Any input hands the film back from the player (engine/play.ts). The keys are
 * routed the same way.
 */
export class ScrollEngine {
  lenis: Lenis | null = null
  y = 0
  progress = 0
  velocity = 0
  limit = 1
  private listeners = new Set<(s: ScrollEngine) => void>()
  /** page y of the closed gate the reader last pushed against (−1 = none): their intent, kept until the gate opens */
  private pending = -1

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
    gsap.ticker.add(t => { this.lenis?.raf(t * 1000); this.release() })
    gsap.ticker.lagSmoothing(0)
    // Touch devices: Lenis still runs but keeps native feel.
    if (isTouch()) document.documentElement.classList.add('is-touch')
    player.attach(this.lenis)
    window.addEventListener('keydown', e => this.keys(e))
  }

  /** The hold, applied to wheel input (touch stays native and is not metered). */
  private meter(data: { deltaX: number; deltaY: number; event: Event }): boolean {
    const l = this.lenis
    if (!l) return true
    const e = data.event
    const isWheel = e.type.includes('wheel')
    if (data.deltaY !== 0 || data.deltaX !== 0) player.interrupt()
    if (!isWheel) return true
    if (data.deltaY <= 0) { if (data.deltaY < 0) this.pending = -1; return true }
    const now = performance.now()
    const limit = limitAhead(l.animatedScroll, now)
    const target = l.targetScroll + data.deltaY
    if (target > limit) {
      // a closed gate ahead: go up to it, and remember that the reader wanted more
      this.pending = limit
      const room = limit - l.targetScroll
      if (room <= 0.5) {
        if (e.cancelable) e.preventDefault()
        const h = holdState()
        if (h) document.dispatchEvent(new CustomEvent('mtf:hold', { detail: h }))
        return false
      }
      data.deltaY = room
      return true
    }
    // the way is open: a gesture that reaches into a sentence's arrival brings it in whole
    const settled = Math.min(settleTarget(target), limit)
    if (settled > target) data.deltaY = settled - l.targetScroll
    return true
  }

  /** The remembered gesture: when the gate it pushed against opens, carry the reader on to the next sentence, whole. */
  private release() {
    const l = this.lenis
    if (!l || this.pending < 0) return
    if (l.animatedScroll < this.pending - window.innerHeight) { this.pending = -1; return }   // they went back up: forget it
    const now = performance.now()
    const limit = limitAhead(l.animatedScroll, now)
    if (limit <= this.pending + 1) return                                                    // still closed
    const stop = Math.min(nextStop(this.pending + 1, window.innerHeight), limit, l.limit)
    this.pending = -1
    if (stop > l.targetScroll + 0.5) l.scrollTo(stop, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
  }

  /** The keys scroll through the same hold as the wheel (natively they would go around it). */
  private keys(e: KeyboardEvent) {
    const l = this.lenis
    if (!l || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
    const t = e.target as HTMLElement | null
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    if (t && /^(BUTTON|A)$/.test(t.tagName) && e.key === ' ') return   // space presses the control it is on
    if (e.key === 'Escape') { player.interrupt(); return }
    if (document.documentElement.classList.contains('nav-open') || l.isStopped) return
    const vh = window.innerHeight
    let step = 0
    switch (e.key) {
      case 'ArrowDown': step = 96; break
      case 'ArrowUp': step = -96; break
      case 'PageDown': step = vh * 0.7; break
      case 'PageUp': step = -vh * 0.7; break
      case ' ': step = e.shiftKey ? -vh * 0.7 : vh * 0.7; break
      case 'End': step = Infinity; break
      case 'Home': step = -Infinity; break
      default: return
    }
    e.preventDefault()
    player.interrupt()
    let target = Math.min(l.limit, Math.max(0, l.targetScroll + step))
    if (step > 0) {
      const limit = limitAhead(l.animatedScroll, performance.now())
      if (target > limit) { this.pending = limit; target = limit }
      else target = Math.min(settleTarget(target), limit)
    } else this.pending = -1
    l.scrollTo(target, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
  }

  onScroll(fn: (s: ScrollEngine) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  scrollTo(target: number | string | HTMLElement, opts: Record<string, unknown> = {}) {
    player.interrupt()
    this.lenis?.scrollTo(target as any, { duration: 1.6, easing: (t: number) => 1 - Math.pow(1 - t, 4), ...opts })
  }
  stop() { this.lenis?.stop(); document.documentElement.classList.add('is-locked') }
  start() { this.lenis?.start(); document.documentElement.classList.remove('is-locked') }
  refresh() { ScrollTrigger.refresh() }
}

export { gsap, ScrollTrigger }
