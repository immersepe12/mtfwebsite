import gsap from 'gsap'
import type Lenis from 'lenis'
import { atEnd, estimateSeconds, readInside, restAt, speedAt, stopAfter, stopBefore } from './hold'

/**
 * The player.
 *
 * Three ways to run the film, one engine. The NEXT button (ui/next.ts) and the wheel both ask for the next
 * moment: the film plays itself from the stop it rests at to the next one and stops there. PLAY THE STORY (the
 * header pill, `?autoplay`) is the same button pressed for you — it plays a moment, rests on it for as long as
 * there is to read, and goes on. Any wheel, key or touch takes it back.
 *
 * A step's own length varies a lot — one moment is a line landing, another is a stanza and a lightning strike —
 * so the film would lurch: too quick here, too slow there. Every step is therefore scaled to take between
 * STEP_MIN and STEP_MAX seconds. Inside that time the moment keeps its written shape (the beats and the pauses
 * between them stay in proportion); only the tempo is evened out, so every press of NEXT feels the same weight.
 *
 * It drives Lenis the way the wheel does (a moving target, the same lerp), so the world glides rather than steps.
 */
/** Every moment takes between these, whatever it contains: one press of NEXT always feels the same weight. */
const STEP_MIN = 1.8
const STEP_MAX = 4.2
class Player {
  /** the whole film is playing itself (PLAY THE STORY) */
  playing = false
  private y = 0
  private until = Infinity
  private dir = 1
  private stepping = false
  private queued = 0
  private static QUEUE_MAX = 1
  private scale = 1
  private waitUntil = 0
  private lenis: Lenis | null = null
  private listeners = new Set<(on: boolean) => void>()
  private busyListeners = new Set<(busy: boolean, ms: number) => void>()
  private ticking = false

  attach(lenis: Lenis) {
    this.lenis = lenis
    if (!this.ticking) { this.ticking = true; gsap.ticker.add(this.tick) }
  }
  onChange(fn: (on: boolean) => void) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  /** Told when a step starts and ends, with how long it will take — the NEXT button shows the wait. */
  onBusy(fn: (busy: boolean, ms: number) => void) { this.busyListeners.add(fn); return () => this.busyListeners.delete(fn) }
  private setBusy(busy: boolean, ms = 0) { this.busyListeners.forEach(fn => fn(busy, ms)) }
  /** Is there another moment after this one? (The footer is past the film and scrolls freely.) */
  get hasNext() { const l = this.lenis; return !!l && !atEnd(l.targetScroll) && l.targetScroll < l.limit - 2 }

  start() {
    if (!this.lenis || this.playing) return
    // at the very end there is nothing left to play: start again from the top
    if (this.lenis.animatedScroll >= this.lenis.limit - 2) this.lenis.scrollTo(0, { immediate: true })
    this.y = this.lenis.animatedScroll
    this.playing = true; this.stepping = false; this.queued = 0; this.until = Infinity; this.dir = 1; this.waitUntil = 0
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
  step(dir: 1 | -1, fromPlayer = false) {
    const l = this.lenis
    if (!l) return
    if (this.playing && !fromPlayer) this.stop()
    // asked for while a step is playing: keep it (a flick can ask for a few) and play them in turn
    if (this.stepping) { this.queued = Math.sign(dir) === Math.sign(this.queued) || this.queued === 0 ? Math.max(-Player.QUEUE_MAX, Math.min(Player.QUEUE_MAX, this.queued + dir)) : dir; return }
    const from = l.targetScroll
    const to = dir > 0 ? Math.min(stopAfter(from), l.limit) : Math.max(stopBefore(from), 0)
    if (!Number.isFinite(to) || Math.abs(to - from) < 1) { if (fromPlayer) this.stop(); return }
    this.y = l.animatedScroll; this.until = to; this.dir = dir; this.stepping = true
    // even out the tempo: the moment keeps its shape, but every step lasts about as long as every other
    const natural = this.timeAcross(Math.min(from, to), Math.max(from, to))
    // a press that brings several lines may last as long as they take to read; a press that brings one thing
    // is evened into the usual window
    const want = Math.min(STEP_MAX + readInside(Math.min(from, to), Math.max(from, to)), Math.max(STEP_MIN, natural))
    this.scale = natural > 0.05 ? natural / want : 1
    this.setBusy(true, want * 1000)
  }

  /** Seconds the film would take to cross [a, b] at its written pace. */
  private timeAcross(a: number, b: number): number {
    const vh = window.innerHeight
    const N = 32, dx = (b - a) / N
    if (dx <= 0) return 0
    let t = 0
    for (let i = 0; i < N; i++) t += dx / Math.max(2, speedAt(a + dx * (i + 0.5), vh))
    return t
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
    if (this.stepping) {
      const v = speedAt(this.y, window.innerHeight) * this.scale
      this.y = this.dir > 0 ? Math.min(this.y + v * dt, this.until) : Math.max(this.y - v * dt, this.until)
      l.scrollTo(this.y, { programmatic: false, lerp: l.options.lerp, duration: l.options.duration, easing: l.options.easing })
      if (Math.abs(this.y - this.until) < 0.5) {
        this.stepping = false
        this.setBusy(false)
        // PLAY: rest on the moment for as long as there is to read in it, then take the next one
        if (this.playing) this.waitUntil = now + restAt(this.until)
        else if (this.queued) {
          const dir = this.queued > 0 ? 1 : -1
          this.queued -= dir
          const keep = this.queued
          this.step(dir as 1 | -1)
          this.queued = keep
        }
      }
      return
    }
    // playing, between moments
    if (now < this.waitUntil) return
    if (l.targetScroll >= l.limit - 2) { this.stop(); return }
    this.step(1, true)
  }
}

export const player = new Player()
