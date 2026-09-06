import gsap from 'gsap'
import type Lenis from 'lenis'
import { estimateSeconds, playerLimit, speedAt } from './hold'

/**
 * The player — PLAY THE STORY.
 *
 * The film scrolls itself at the pace it was written for: a beat takes the moment its motion needs, every landed
 * sentence holds for its reading time (a little less than the hold owes it under the wheel), the empty seams pass
 * briskly. The pace comes from each film's breath map (engine/breath.ts · engine/hold.ts), so a chapter never
 * has to know it can be played. The reader takes the film back with any wheel, key or touch — the player stops
 * the instant they do.
 *
 * It drives Lenis the way the wheel does (a moving target, the same lerp), so the world glides rather than steps.
 */
class Player {
  playing = false
  private y = 0
  private lenis: Lenis | null = null
  private listeners = new Set<(on: boolean) => void>()
  private ticking = false

  attach(lenis: Lenis) {
    this.lenis = lenis
    if (!this.ticking) { this.ticking = true; gsap.ticker.add(this.tick) }
  }
  onChange(fn: (on: boolean) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn) }

  start() {
    if (!this.lenis || this.playing) return
    // at the very end there is nothing left to play: start again from the top
    if (this.lenis.animatedScroll >= this.lenis.limit - 2) this.lenis.scrollTo(0, { immediate: true })
    this.y = this.lenis.animatedScroll
    this.playing = true
    this.listeners.forEach(fn => fn(true))
  }
  stop() {
    if (!this.playing) return
    this.playing = false
    this.listeners.forEach(fn => fn(false))
  }
  toggle() { this.playing ? this.stop() : this.start() }
  /** The reader touched the wheel or the keys: the film is theirs again. */
  interrupt() { this.stop() }

  /** Rough running time of the whole film at the player's pace, in seconds (dev readout). */
  estimate() { return this.lenis ? estimateSeconds(window.innerHeight, this.lenis.limit) : 0 }

  private tick = (_time: number, deltaMs: number) => {
    if (!this.playing || !this.lenis) return
    const l = this.lenis
    if (l.isStopped) return                              // the nav is open: wait, do not fight it
    const dt = Math.min(deltaMs, 50) / 1000
    const now = performance.now()
    const v = speedAt(this.y, window.innerHeight)
    // the player pauses on every sentence: it lands, gets its time, then the film goes on
    this.y = Math.min(this.y + v * dt, l.limit, Math.max(this.y, playerLimit(l.animatedScroll, now)))
    l.scrollTo(this.y, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
    if (this.y >= l.limit - 0.5) this.stop()
  }
}

export const player = new Player()
