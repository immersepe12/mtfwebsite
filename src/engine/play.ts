import gsap from 'gsap'
import type Lenis from 'lenis'
import { estimateSeconds, playerLimit, speedAt, stopAfter, stopBefore } from './hold'

/**
 * The player.
 *
 * Two ways to run the film, one engine. Under the wheel, a gesture means "next": the film plays itself from the
 * stop it is at to the next one — a sentence lands in half a second, the Shatter takes three, an island rises in
 * its own time — and rests until the next gesture (a gesture made while it plays is kept, one deep). PLAY THE
 * STORY (the header pill, `?autoplay`) runs the whole film the same way, resting on every sentence for its
 * reading time; any wheel, key or touch takes it back.
 *
 * It drives Lenis the way the wheel does (a moving target, the same lerp), so the world glides rather than steps.
 */
class Player {
  /** the whole film is playing itself (PLAY THE STORY) */
  playing = false
  private y = 0
  private until = Infinity
  private dir = 1
  private stepping = false
  private queued = 0
  private static QUEUE_MAX = 3
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
    this.playing = true; this.stepping = false; this.queued = 0; this.until = Infinity; this.dir = 1
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

  /** One gesture: play the film to the next stop (dir 1) or back to the previous one (−1). */
  step(dir: 1 | -1) {
    const l = this.lenis
    if (!l) return
    if (this.playing) this.stop()
    // asked for while a step is playing: keep it (a flick can ask for a few) and play them in turn
    if (this.stepping) { this.queued = Math.sign(dir) === Math.sign(this.queued) || this.queued === 0 ? Math.max(-Player.QUEUE_MAX, Math.min(Player.QUEUE_MAX, this.queued + dir)) : dir; return }
    const from = l.targetScroll
    const to = dir > 0 ? Math.min(stopAfter(from), l.limit) : Math.max(stopBefore(from), 0)
    if (!Number.isFinite(to) || Math.abs(to - from) < 1) return
    this.y = l.animatedScroll; this.until = to; this.dir = dir; this.stepping = true
  }
  get busy() { return this.stepping || this.playing }

  /** Rough running time of the whole film at the player's pace, in seconds (dev readout). */
  estimate() { return this.lenis ? estimateSeconds(window.innerHeight, this.lenis.limit) : 0 }

  private tick = (_time: number, deltaMs: number) => {
    const l = this.lenis
    if (!l || (!this.playing && !this.stepping)) return
    if (l.isStopped) return                              // the nav is open: wait, do not fight it
    const dt = Math.min(deltaMs, 50) / 1000
    const now = performance.now()
    const v = speedAt(this.y, window.innerHeight)
    if (this.playing) {
      // the whole film: pauses on every sentence, its time, then on
      this.y = Math.min(this.y + v * dt, l.limit, Math.max(this.y, playerLimit(l.animatedScroll, now)))
      if (this.y >= l.limit - 0.5) this.stop()
    } else {
      this.y = this.dir > 0 ? Math.min(this.y + v * dt, this.until) : Math.max(this.y - v * dt, this.until)
      if (Math.abs(this.y - this.until) < 0.5) {
        this.stepping = false
        if (this.queued) {
          const dir = this.queued > 0 ? 1 : -1
          this.queued -= dir
          l.scrollTo(this.y, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
          const keep = this.queued
          this.step(dir as 1 | -1)
          this.queued = keep
          return
        }
      }
    }
    l.scrollTo(this.y, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
  }
}

export const player = new Player()
