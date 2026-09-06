import { gsap, ScrollTrigger } from './scroll'
import { filmLength } from './pacing'
import { beatSeconds, readingMs, through, REST_SECONDS, type Breath, type Gate, type Landing, type Seg } from './breath'
import { carryGates, registerFilm, tickGates } from './hold'
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
 *
 * THE HOLD (why a flick cannot skip a sentence)
 * Scroll is distance, reading is time. The same walk over the timeline also finds every tween that lands text
 * (opacity → 1, a masked line rising) — a LANDING, which the player pauses on — and, for each landing whose text
 * is later taken off the screen, the tween that hides it: a GATE. The wheel may not carry the reader past a gate
 * until the text has had its reading time (engine/hold.ts). Text that stays (a headline while the story arrives
 * under it, the older lines of a stack) makes no gate, so a reader moves at their own pace and only a flick that
 * would erase something unread is stopped. Landings that start within a hair of each other are one arrival.
 */

/** How much more scroll a still moment gets than an animating one. (Reading TIME is the hold's business — engine/hold.ts — so
 *  a pause needs only a little more scroll than its beats, not double.) */
const HOLD_WEIGHT = 1.5
/** The pauses are paid for with extra length, not by speeding the beats up. Cap how much a chapter may grow. */
const STRETCH_MAX = 1.6
/** No single pause may eat more than this share of a chapter, however long the gap. */
const HOLD_MAX_SHARE = 0.14
/** The empty run-up and run-out of a chapter are seams, not reading pauses — they are tightened, not stretched. */
const SEAM_WEIGHT = 0.75
/** …and a seam, however long on the timeline, is never more than this share of the film's scroll. */
const SEAM_MAX_SHARE = 0.06
/** Gaps shorter than this (in timeline units) are part of the beat, not a pause. */
const GAP_MIN = 0.012
/** Landings that begin within this of one another are one arrival and share a gate. */
const GROUP_GAP = 0.012

/**
 * The breath map of every film, by section element. The Stage reads it so that a chapter's `mood(p)` and
 * `onProgress(p)` run on the SAME clock as its timeline — otherwise the world would drift on while the copy
 * holds, and moments designed to coincide (the Shatter, the star in the cave) would come apart.
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

interface Span { a: number; b: number; landing: boolean; leaving: boolean; chars: number; els: Element[] }
const META = '.eyebrow, .eye__t, .eye__d, .label, .index, .coords, .chip, .chip-row, .stamp, .stamp__n, .fine, .note, .signoff, .day__head, .forum__label, .forum__lab, .sector__i, .sector__l'

/** Readable characters under an element: glyphs, SVG titles and anything aria-hidden are not copy. */
function readableChars(root: Element): number {
  let n = 0
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: node => {
      if (node.nodeType === Node.TEXT_NODE) return NodeFilter.FILTER_ACCEPT
      const el = node as Element
      const tag = el.tagName
      if (tag === 'svg' || tag === 'SCRIPT' || tag === 'STYLE' || el.getAttribute('aria-hidden') === 'true') return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_SKIP
    },
  })
  if (root.tagName === 'svg' || root.getAttribute('aria-hidden') === 'true') return 0
  for (let node = walker.nextNode(); node; node = walker.nextNode()) n += (node.textContent || '').replace(/\s+/g, ' ').trim().length
  return n
}

/** Does this tween take something off the screen (opacity → 0, a collapse, a masked line dropping out)? */
function leaves(tw: gsap.core.Tween): boolean {
  const v: any = tw.vars || {}
  return v.opacity === 0 || v.autoAlpha === 0 || v.height === 0 || v.maxHeight === 0 || (typeof v.yPercent === 'number' && Math.abs(v.yPercent) >= 100 && !v.startAt)
}

/** Does this tween bring something onto the screen (opacity → 1, a masked line rising, a `from` hidden)? */
function arrives(tw: gsap.core.Tween): boolean {
  const v: any = tw.vars || {}
  const startAt = v.startAt || null
  const endsVisible = v.opacity === 1 || v.autoAlpha === 1
  const fromHidden = !!v.runBackwards && (v.opacity === 0 || v.autoAlpha === 0 || v.yPercent !== undefined || v.y !== undefined)
  const risesIn = !!startAt && (startAt.opacity === 0 || startAt.autoAlpha === 0 || (startAt.yPercent !== undefined && v.yPercent === 0))
  return endsVisible || fromHidden || risesIn
}

/** Every tween of the timeline as a span on the root clock (nested timelines are unwound). */
function spansOf(tl: gsap.core.Timeline, spacerTarget: object): Span[] {
  const spans: Span[] = []
  for (const child of tl.getChildren(true, true, false)) {
    const tw = child as gsap.core.Tween
    if (tw.targets && tw.targets()[0] === spacerTarget) continue   // the 0→1 spacer covers everything; it is not a beat
    let a = child.startTime(), scale = 1
    let par: gsap.core.Timeline | null = child.parent as gsap.core.Timeline | null
    while (par && par !== tl) { scale *= 1 / Math.max(par.timeScale(), 1e-6); a = par.startTime() + a * scale; par = par.parent as gsap.core.Timeline | null }
    const b = a + (child.totalDuration() || 0) * scale
    if (b <= a) continue
    const targets = (typeof tw.targets === 'function' ? tw.targets() : []) as unknown[]
    const els = targets.filter((t): t is Element => t instanceof Element)
    spans.push({ a: Math.max(0, a), b: Math.min(1, b), landing: els.length > 0 && arrives(tw), leaving: els.length > 0 && leaves(tw), chars: 0, els })
  }
  // a landing is text arriving. A container that fades in while its lines land one by one is not a landing —
  // the lines are; and a frieze or a glyph fading in has nothing to read at all.
  const arriving = spans.filter(sp => sp.landing)
  for (const sp of arriving) {
    const holdsAnother = arriving.some(o => o !== sp && o.els.some(e => sp.els.some(c => c !== e && c.contains(e))))
    sp.chars = holdsAnother ? 0 : sp.els.reduce((n, e) => n + readableChars(e), 0)
    // eyebrows, labels, coordinates, chips: metadata in mono caps, a glance rather than a sentence
    if (sp.chars > 0 && sp.els.every(e => e.matches(META))) sp.chars = Math.min(sp.chars, 12)
    sp.landing = sp.chars > 0
  }
  spans.sort((m, n) => m.a - n.a)
  return spans
}

/** Build the scroll → timeline map, the player's pacing and the reading gates from the timeline's own beats. */
function breathe(tl: gsap.core.Timeline, spacerTarget: object): Breath | null {
  const spans = spansOf(tl, spacerTarget)
  if (!spans.length) return null

  // ── the landings: each arrival of text; and the gates: the moment that arrival is taken away again ──
  const groups: { a: number; e: number; chars: number; els: Element[] }[] = []
  for (const s of spans) {
    if (!s.landing) continue
    const g = groups[groups.length - 1]
    if (g && s.a - g.a <= GROUP_GAP) { g.e = Math.max(g.e, s.b); g.chars += s.chars; g.els.push(...s.els) }
    else groups.push({ a: s.a, e: s.b, chars: s.chars, els: [...s.els] })
  }
  const landings: Landing[] = []
  const gates: Gate[] = []
  const touches = (a: Element[], b: Element[]) => a.some(x => b.some(y => x === y || x.contains(y) || y.contains(x)))
  for (const g of groups) {
    const landing: Landing = { from: g.e, arm: g.a, ms: readingMs(g.chars), chars: g.chars, opened: -1 }
    landings.push(landing)
    let at = Infinity
    for (const s of spans) if (s.leaving && s.a >= g.e - 1e-4 && s.a > g.a && s.a < at && touches(s.els, g.els)) at = s.a
    if (at !== Infinity) gates.push(Object.assign(landing, { at }))
  }

  // ── the beats: merge overlapping tweens — simultaneous tweens are one moment of movement ──
  const beats: [number, number][] = []
  for (const s of spans) {
    const last = beats[beats.length - 1]
    if (last && s.a <= last[1] + 1e-4) last[1] = Math.max(last[1], s.b)
    else beats.push([s.a, s.b])
  }

  // ── walk the timeline as alternating moving / still segments and weight them ──
  const segs: (Omit<Seg, 'x0' | 'x1'> & { w: number })[] = []
  // a still moment is crossed at a rest pace; the reading time itself is owed at the gate (the player waits there
  // exactly as the wheel does — see engine/hold.ts), so lines that follow one another with no gap are held too
  const holdFor = (_a: number, _b: number) => REST_SECONDS
  let t = 0
  for (const [a, b] of beats) {
    // the run-up to the first beat is a seam, not a pause: it is scroll with nothing in it, so it is tightened
    if (a - t > GAP_MIN) segs.push(t === 0 ? { a: t, b: a, w: SEAM_WEIGHT, kind: 'seam', dur: 0 } : { a: t, b: a, w: HOLD_WEIGHT, kind: 'hold', dur: holdFor(t, a) })
    else if (a > t) segs.push({ a: t, b: a, w: 1, kind: 'hold', dur: holdFor(t, a) })
    const ba = Math.max(t, a)
    segs.push({ a: ba, b, w: 1, kind: 'beat', dur: beatSeconds(b - ba) })       // the beat itself: normal speed
    t = b
  }
  if (t < 1) segs.push({ a: t, b: 1, w: SEAM_WEIGHT, kind: 'seam', dur: 0 })    // and so is the run-out

  // ── cap any one pause, then normalise into a monotone piecewise map ──
  const total = segs.reduce((s, g) => s + (g.b - g.a) * g.w, 0) || 1
  const capped = segs.map(g => {
    const share = ((g.b - g.a) * g.w) / total
    const max = g.kind === 'seam' ? SEAM_MAX_SHARE : HOLD_MAX_SHARE
    return share > max ? { ...g, w: (g.w * max) / share } : g
  })
  const norm = capped.reduce((s, g) => s + (g.b - g.a) * g.w, 0) || 1
  const x: number[] = [0]
  const y: number[] = [0]
  const out: Seg[] = []
  let acc = 0
  for (const g of capped) {
    const x0 = acc
    acc += ((g.b - g.a) * g.w) / norm
    const x1 = Math.min(1, acc)
    x.push(x1)
    y.push(g.b)
    out.push({ x0, x1, a: g.a, b: g.b, kind: g.kind, dur: g.dur })
  }
  // `norm` is how much scroll the chapter now wants: 1 would squeeze the pauses out of the beats' own time
  // (a beat would play faster than before, which reads as skipping). Growing the section instead keeps every
  // beat at exactly the speed it had and spends the new length on the stillness between them.
  return { x, y, stretch: Math.min(STRETCH_MAX, Math.max(1, norm)), segs: out, gates, landings }
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
  const get = () => { if (!built) build(); return map }
  FILMS.set(el, get)
  const build = () => {
    const prev = map
    map = opts.breathe === false ? null : breathe(tl, spacerTarget)
    if (map) carryGates(prev?.landings, map.landings)
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
    if (map) tickGates(map.landings, t, performance.now())
  }
  // build once the chapter's timeline exists (the first refresh happens after every chapter has mounted),
  // and rebuild when it re-splits text or the layout changes
  ScrollTrigger.addEventListener('refresh', () => { lastT = -1; if (!stretched) build(); else built = false })
  gsap.ticker.add(apply)

  let st!: ScrollTrigger
  let nearSt!: ScrollTrigger
  /** Hang the scrub on `trigger` (the section by default; a chapter whose section is film + footer re-hangs it on the film). */
  const attach = (trigger: HTMLElement) => {
    st?.kill(); nearSt?.kill()
    st = ScrollTrigger.create({
      trigger, start: 'top top', end: 'bottom bottom',
      scrub: opts.scrub ?? 0.85,   // long enough to turn a flick into a glide, short enough to feel answered
      animation: driver,
      onUpdate: s => opts.onUpdate?.(s.progress),
    })
    // "near" = the section is anywhere within a screen of the viewport; outside that its frame is empty anyway
    nearSt = ScrollTrigger.create({
      trigger, start: 'top bottom+=100%', end: 'bottom top-=100%',
      onToggle: self => { near = self.isActive; if (near) lastT = -1 },
    })
    return st
  }
  attach(el)
  registerFilm({ el, range: () => [st.start, st.end], map: get })
  return { pin, tl, get st() { return st }, length, attach }
}
