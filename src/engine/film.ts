import { gsap, ScrollTrigger } from './scroll'
import { filmLength } from './pacing'
import type { ChapterCtx } from './chapter'

/**
 * createFilm — turns a chapter into a pear.no-style pinned "film": the section becomes `length × 100vh` tall,
 * a sticky `.pin` (100dvh, overflow clip) holds the frame, and a paused GSAP timeline is scrubbed 0→1 across
 * the section's travel. Put your DOM inside `pin`; add tweens to `tl` with positions in 0..1 (tl duration is 1).
 *
 *   const { pin, tl } = createFilm(ctx, { length: 4 })
 *   pin.innerHTML = `...`
 *   tl.fromTo('.x', { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.2)   // 20%→30% of the chapter
 *
 * THE BREATH (why the scroll is not linear)
 * A chapter's timeline is a run of short tweens — a line lands, a rule draws — separated by stretches where
 * nothing changes. Mapped linearly to scroll, a sentence arrives and the next one is already on its way: the
 * copy streams past and cannot be read. So the mapping from scroll to timeline time is re-weighted: the moment
 * a beat is actually animating passes at normal speed, and the still moment after it is given several times as
 * much scroll, so the frame comes to rest and holds while you read. The pauses are computed from the chapter's
 * own timeline (its children's start and end times), so every chapter breathes without knowing this exists.
 */

/** How much more scroll a still moment gets than an animating one. */
const HOLD_WEIGHT = 2.2
/** The pauses are paid for with extra length, not by speeding the beats up. Cap how much a chapter may grow. */
const STRETCH_MAX = 1.6
/** No single pause may eat more than this share of a chapter, however long the gap. */
const HOLD_MAX_SHARE = 0.14
/** Gaps shorter than this (in timeline units) are part of the beat, not a pause. */
const GAP_MIN = 0.012

interface Breath { x: number[]; y: number[]; stretch: number }

/**
 * The breath map of every film, by section element. The Stage reads it so that a chapter's `mood(p)` and
 * `onProgress(p)` run on the SAME clock as its timeline — otherwise the world would drift on while the copy
 * holds, and moments designed to coincide (the Shatter, the veil's tear) would come apart.
 */
const FILMS = new WeakMap<HTMLElement, () => Breath | null>()

let refreshQueued = false
/** Coalesce the length changes of every film into a single ScrollTrigger.refresh(). */
function scheduleRefresh() {
  if (refreshQueued) return
  refreshQueued = true
  requestAnimationFrame(() => { refreshQueued = false; ScrollTrigger.refresh() })
}
export const filmTime = (el: HTMLElement, p: number): number => {
  const get = FILMS.get(el)
  return get ? through(get(), p) : p
}

/** Build the scroll → timeline map from the timeline's own beats. */
function breathe(tl: gsap.core.Timeline, spacerTarget: object): Breath | null {
  const spans: [number, number][] = []
  for (const child of tl.getChildren(true, true, false)) {
    const tw = child as gsap.core.Tween
    if (tw.targets && tw.targets()[0] === spacerTarget) continue   // the 0→1 spacer covers everything; it is not a beat
    const a = child.startTime()
    const b = a + (child.totalDuration() || 0)
    if (b > a) spans.push([Math.max(0, a), Math.min(1, b)])
  }
  if (!spans.length) return null
  spans.sort((m, n) => m[0] - n[0])

  // merge overlapping beats — simultaneous tweens are one moment of movement
  const beats: [number, number][] = []
  for (const s of spans) {
    const last = beats[beats.length - 1]
    if (last && s[0] <= last[1] + 1e-4) last[1] = Math.max(last[1], s[1])
    else beats.push([s[0], s[1]])
  }

  // walk the timeline as alternating moving / still segments and weight them
  const segs: { a: number; b: number; w: number }[] = []
  let t = 0
  for (const [a, b] of beats) {
    if (a - t > GAP_MIN) segs.push({ a: t, b: a, w: HOLD_WEIGHT })   // a still moment: give it room
    else if (a > t) segs.push({ a: t, b: a, w: 1 })
    segs.push({ a: Math.max(t, a), b, w: 1 })                        // the beat itself: normal speed
    t = b
  }
  if (t < 1) segs.push({ a: t, b: 1, w: HOLD_WEIGHT })

  // cap any one pause, then normalise into a monotone piecewise map
  const total = segs.reduce((s, g) => s + (g.b - g.a) * g.w, 0) || 1
  const capped = segs.map(g => {
    const share = ((g.b - g.a) * g.w) / total
    return share > HOLD_MAX_SHARE ? { ...g, w: (g.w * HOLD_MAX_SHARE) / share } : g
  })
  const norm = capped.reduce((s, g) => s + (g.b - g.a) * g.w, 0) || 1
  const x: number[] = [0]
  const y: number[] = [0]
  let acc = 0
  for (const g of capped) {
    acc += ((g.b - g.a) * g.w) / norm
    x.push(Math.min(1, acc))
    y.push(g.b)
  }
  // `norm` is how much scroll the chapter now wants: 1 would squeeze the pauses out of the beats' own time
  // (a beat would play faster than before, which reads as skipping). Growing the section instead keeps every
  // beat at exactly the speed it had and spends the new length on the stillness between them.
  return { x, y, stretch: Math.min(STRETCH_MAX, Math.max(1, norm)) }
}

/** scroll fraction → timeline time, through the breath map. */
function through(map: Breath | null, p: number): number {
  if (!map) return p
  const { x, y } = map
  if (p <= 0) return 0
  if (p >= 1) return 1
  let i = 1
  while (i < x.length - 1 && p > x[i]) i++
  const span = x[i] - x[i - 1]
  const t = span > 1e-6 ? (p - x[i - 1]) / span : 0
  return y[i - 1] + (y[i] - y[i - 1]) * t
}

export function createFilm(ctx: ChapterCtx, opts: { length?: number; scrub?: number | boolean; snap?: boolean; onUpdate?: (p: number) => void; breathe?: boolean } = {}) {
  const { el } = ctx
  // the chapter declares the length its composition wants; src/engine/pacing.ts sets the film's global rhythm
  const length = filmLength(el.dataset.chapter, opts.length ?? 3)
  el.classList.add('chapter--film')
  el.style.setProperty('--film-len', String(length))
  const pin = document.createElement('div')
  pin.className = 'pin'
  el.appendChild(pin)
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
  // duration is normalised to 1 so positions are fractions of the chapter
  const spacerTarget = {}
  tl.to(spacerTarget, { duration: 1 }, 0)

  // the scrubbed driver: ScrollTrigger smooths THIS, and every frame we push it through the breath map
  const drive = { p: 0 }
  const driver = gsap.to(drive, { p: 1, duration: 1, ease: 'none', paused: true })
  let map: Breath | null = null
  let built = false
  let lastT = -1
  let near = false
  let stretched = false
  // Rendering a timeline is not free: a chapter is only pushed through the breath map while it is on or near
  // the screen, and only when the value it would be set to has actually changed. Fourteen timelines rendering
  // every frame is the difference between 60 fps and a page that stutters.
  FILMS.set(el, () => { if (!built) build(); return map })
  const build = () => {
    map = opts.breathe === false ? null : breathe(tl, spacerTarget)
    built = true
    // pay for the pauses in length, once, before the visitor gets here
    if (map && !stretched && map.stretch > 1.01) {
      stretched = true
      el.style.setProperty('--film-len', String(length * map.stretch))
      scheduleRefresh()   // one refresh for all fourteen chapters, not fourteen nested ones
    }
  }
  const apply = () => {
    if (!near) return
    if (!built) build()
    const t = through(map, drive.p)
    if (Math.abs(t - lastT) < 1e-4) return
    lastT = t
    tl.progress(t)
  }
  // build once the chapter's timeline exists (the first refresh happens after every chapter has mounted),
  // and rebuild when it re-splits text or the layout changes
  ScrollTrigger.addEventListener('refresh', () => { lastT = -1; if (!stretched) build(); else built = false })
  gsap.ticker.add(apply)

  const st = ScrollTrigger.create({
    trigger: el, start: 'top top', end: 'bottom bottom',
    scrub: opts.scrub ?? 0.85,   // long enough to turn a flick into a glide, short enough to feel answered
    animation: driver,
    onUpdate: s => opts.onUpdate?.(s.progress),
  })
  // "near" = the section is anywhere within a screen of the viewport; outside that its frame is empty anyway
  ScrollTrigger.create({
    trigger: el, start: 'top bottom+=100%', end: 'bottom top-=100%',
    onToggle: self => { near = self.isActive; if (near) lastT = -1 },
  })
  return { pin, tl, st, length }
}
