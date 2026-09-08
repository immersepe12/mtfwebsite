import { gsap, ScrollTrigger } from './scroll'
import { filmLength } from './pacing'
import { beatSeconds, readingMs, through, HOLD_SECONDS_PER_UNIT, READ_INSIDE, REST_SECONDS, type Breath, type Landing, type Seg } from './breath'
import { carryLandings, registerFilm, tickLandings } from './hold'
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
 * THE STOPS (why the wheel is "next", not a scrub)
 * Every tween that lands text is a LANDING — the points PLAY THE STORY comes to rest at as it runs the film by
 * itself. Those same points are the STOPS the wheel moves between: one gesture plays the film from the state it
 * is in to the next line, at the pace the player uses, and rests there. Scrolling and playing therefore show the
 * same sequence of screens, one after the other; the only difference is who decides when to move on.
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
/** Landings that begin within this of one another are one arrival: a line's own stagger, a stanza set as one beat.
 *  Anything further apart was written as a separate moment (the eleven stars are 1.8% apart) and gets its own stop. */
const GROUP_GAP = 0.011
/** …and however tight the run, one arrival never spans more than this: a chain cannot swallow a whole sequence. */
const GROUP_MAX = 0.05
/** A stretch of animation with no text in it is a stop of its own only if it is at least this long… */
const ANIM_MIN = 0.08
/** …and only when no text lands within this of it, or the press would show nothing the reader had not seen. */
const ANIM_CLEAR = 0.10
/** Arrivals that follow one another this closely belong to the same moment: one gesture plays them all. */
const STOP_GAP = 0.12
/** Arrivals this close together are SIMULTANEOUS — one moment whatever slots they are in (a star and its label). */
const TOGETHER = 0.006
/** How much of a chapter one moment may span. The Storyteller's is generous — a stanza arrives whole, never half
 *  now and half on the next press. The Forum's column is tighter: its blocks are separate things to read. */
const STOP_SPAN_STORY = 0.40
const STOP_SPAN_CONTENT = 0.30
/** how far past its span a moment may reach to take a piece of metadata with it */
const META_SLACK = 0.06
/** A stop is nudged clear of a beat still running only if that beat is short — a line rising out of its mask, not
 *  a slow continuous change (an optical size drifting, a camera crossing a chapter), which one may rest inside. */
const SETTLE_MAX = 0.08

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

interface Span { a: number; b: number; landing: boolean; leaving: boolean; meta: boolean; chars: number; els: Element[]; block: Element | null; story: boolean }
const META = '.eyebrow, .eye__t, .eye__d, .label, .index, .coords, .chip, .chip-row, .stamp, .stamp__n, .fine, .note, .signoff, .day__head, .forum__label, .forum__lab, .sector__i, .sector__l, .field, .field__label'
/** The Storyteller: the voice that narrates. It is read on its own, never at the same time as the Forum's column. */
const STORY = '.s, .story, .stack, .couplet, .cp1, .cp2, .st'

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

/**
 * The SLOT a landing belongs to: the block of the composition it is part of — the storyteller stack, the Forum's
 * host column, a panel, the tile grid. It is the nearest positioned ancestor (chapters place their slots with
 * `position: absolute`), or failing that the frame's own child. Two landings in different slots are two different
 * things to read, and must never arrive in the same moment.
 */
function slotOf(el: Element): Element | null {
  const frame = el.closest('.pin__frame, .pin__layer, .ch-inner')
  let node: Element | null = el
  let child: Element = el
  while (node && node !== frame) {
    if (node instanceof HTMLElement && getComputedStyle(node).position !== 'static') return node
    child = node
    node = node.parentElement
  }
  return frame ? child : null
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
    spans.push({ a: Math.max(0, a), b: Math.min(1, b), landing: els.length > 0 && arrives(tw), leaving: els.length > 0 && leaves(tw), meta: false, chars: 0, els, block: null, story: false })
  }
  // a landing is text arriving. A container that fades in while its lines land one by one is not a landing —
  // the lines are; and a frieze or a glyph fading in has nothing to read at all.
  const arriving = spans.filter(sp => sp.landing)
  for (const sp of arriving) {
    const holdsAnother = arriving.some(o => o !== sp && o.els.some(e => sp.els.some(c => c !== e && c.contains(e))))
    sp.chars = holdsAnother ? 0 : sp.els.reduce((n, e) => n + readableChars(e), 0)
    // eyebrows, labels, coordinates, chips: metadata in mono caps, a glance rather than a sentence
    if (sp.chars > 0 && sp.els.every(e => e.matches(META))) { sp.chars = Math.min(sp.chars, 12); sp.meta = true }
    sp.landing = sp.chars > 0
    if (sp.landing) { sp.block = slotOf(sp.els[0]); sp.story = !sp.meta && sp.els.some(e => e.matches(STORY) || !!e.closest(STORY)) }
  }
  spans.sort((m, n) => m.a - n.a)
  return spans
}

/** Build the scroll → timeline map, the player's pacing and the reading gates from the timeline's own beats. */
function breathe(tl: gsap.core.Timeline, spacerTarget: object, el?: HTMLElement): Breath | null {
  const spans = spansOf(tl, spacerTarget)
  if (!spans.length) return null
  // a chapter may say its content comes as one block (`data-moment-span`, in timeline time): the register form
  const contentSpan = Math.max(STOP_SPAN_CONTENT, parseFloat(el?.dataset.momentSpan ?? '') || 0)

  // ── the landings: each arrival of text (lines that follow one another closely are one arrival) ──
  const groups: { a: number; e: number; last: number; chars: number; block: Element | null; story: boolean; meta: boolean; els: Element[] }[] = []
  for (const s of spans) {
    if (!s.landing) continue
    const g = groups[groups.length - 1]
    if (g && g.block === s.block && s.a - g.last <= GROUP_GAP && s.b - g.a <= GROUP_MAX) { g.e = Math.max(g.e, s.b); g.last = s.a; g.chars += s.chars; g.meta = g.meta && s.meta; g.els.push(...s.els) }
    else groups.push({ a: s.a, e: s.b, last: s.a, chars: s.chars, block: s.block, story: s.story, meta: s.meta, els: [...s.els] })
  }
  // when does each arrival start to leave the screen again? (a stack replaced by the next, the numbers fading
  // before the close) — a moment must never contain both a text's arrival and its departure
  const touches = (a: Element[], b: Element[]) => a.some(x => b.some(y => x === y || x.contains(y) || y.contains(x)))
  const leaveOf = (g: typeof groups[number]) => {
    let at = Infinity
    for (const s of spans) if (s.leaving && s.a >= g.e - 1e-4 && s.a < at && touches(s.els, g.els)) at = s.a
    return at
  }
  const landings: Landing[] = groups.map(g => ({ from: g.e, arm: g.a, ms: readingMs(g.chars), chars: g.chars, opened: -1, block: g.block, story: g.story, meta: g.meta, leaveAt: leaveOf(g) }))

  // ── the beats: merge overlapping tweens — simultaneous tweens are one moment of movement ──
  const beats: [number, number][] = []
  for (const s of spans) {
    const last = beats[beats.length - 1]
    if (last && s.a <= last[1] + 1e-4) last[1] = Math.max(last[1], s.b)
    else beats.push([s.a, s.b])
  }

  // ── walk the timeline as alternating moving / still segments and weight them ──
  const segs: (Omit<Seg, 'x0' | 'x1'> & { w: number })[] = []
  // a still moment carries the world's own motion (the camera, the sun, the tesserae): crossed at a steady rate,
  // and never faster than a rest — and when a line has just landed, the still after it is that line's reading
  // time, so a stanza arrives at the pace of reading, not word after word after word
  const holdFor = (a: number, b: number) => {
    const landed = landings.find(l => Math.abs(l.from - a) < 2e-3)
    return Math.max(REST_SECONDS, (b - a) * HOLD_SECONDS_PER_UNIT, landed && !landed.meta ? (landed.ms * READ_INSIDE) / 1000 : 0)
  }
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
  // ── the stops: exactly where the player rests. One gesture goes to the next line, as the player does. ──
  // A stop is never left inside a beat that is still running: a headline caught halfway out of its mask is not a
  // frame to come to rest on, so the stop moves to the end of whatever is still moving.
  const settle = (t: number) => {
    let out = t
    for (let i = 0; i < 4; i++) {
      let next = out
      for (const [a, b] of beats) if (b - a <= SETTLE_MAX && a < out - 1e-4 && b > out + 1e-4) next = Math.max(next, b)
      if (next === out) break
      out = next
    }
    return out
  }
  // A gesture should advance a MOMENT, not a tween: arrivals that follow one another closely are played by one
  // gesture, at the pace the timeline wrote them — the stanza arrives line by line over several seconds, exactly
  // as it does when the film plays itself, and the reader decides when the next moment begins.
  const moments: { a: number; b: number; chars: number; block: Element | null; story: boolean; meta: boolean; leaveAt: number }[] = []
  for (const l of landings) {
    const m = moments[moments.length - 1]
    // The Storyteller is read on its own. A moment never mixes the narrating voice with the Forum's column beside
    // it: the story plays, comes to rest, and only then does the content begin (and the other way round). Within
    // one voice, arrivals that follow closely — or arrive together, like a star and its label — are one moment.
    // Metadata (an eyebrow, a hint, a date chip) has no voice and joins whichever moment it falls in. And nothing
    // may leave inside the moment it arrived in: a stack replaced by the next stack, or numbers that fade before
    // the close, are the reader's to read first — the moment ends where they still stand.
    const gap = m ? l.arm - m.b : Infinity
    const voice = m ? (m.meta || l.meta || m.story === l.story) : false
    const stays = m ? l.from <= m.leaveAt + 1e-4 : false
    // a moment that is only metadata so far (an eyebrow, the coordinates) takes the span of what joins it: the
    // eyebrow rides in with the headline and the first stanza, not as a press of its own
    const span = (m && m.meta ? l.story : m?.story) ? STOP_SPAN_STORY : contentSpan
    // metadata rides along whatever the span — a field's label, a date chip, a hint — but only a little past it,
    // or a label would tow the next block into this moment
    const fits = !!m && l.from - m.a <= span + (l.meta ? META_SLACK : 0)
    const same = m && voice && stays && (gap <= TOGETHER || gap <= STOP_GAP) && fits
    if (same) {
      m.b = Math.max(m.b, l.from); m.chars += l.chars; m.leaveAt = Math.min(m.leaveAt, l.leaveAt ?? Infinity)
      if (m.meta && !l.meta) { m.meta = false; m.story = !!l.story }
    } else moments.push({ a: l.arm, b: l.from, chars: l.chars, block: l.block ?? null, story: !!l.story, meta: !!l.meta, leaveAt: l.leaveAt ?? Infinity })
  }
  // …and the end of a long animation that carries no text at all (nothing lands inside it to rest on)
  for (const [a, b] of beats) {
    if (b - a < ANIM_MIN) continue
    // a press that shows nothing is a dead press: an animation only earns a stop of its own when there is no
    // text arriving anywhere near it, so it is genuinely the thing the reader came to see
    if (landings.some(l => l.from > a - ANIM_CLEAR && l.arm < b + ANIM_CLEAR)) continue
    moments.push({ a, b, chars: 0, block: null, story: false, meta: false, leaveAt: Infinity })
  }
  const byT = new Map<number, number>()
  for (const m of moments) {
    const t = +settle(m.b).toFixed(4)
    byT.set(t, Math.max(byT.get(t) ?? 0, readingMs(m.chars)))
  }
  // two stops a hair apart are one place to stand: a gesture that moved a few pixels would read as a dead press
  const stops: number[] = []
  const rests: number[] = []
  for (const t of [...byT.keys()].sort((m, n) => m - n)) {
    const ms = byT.get(t)!
    if (stops.length && t - stops[stops.length - 1] < 0.02) { rests[rests.length - 1] = Math.max(rests[rests.length - 1], ms); stops[stops.length - 1] = t; continue }
    stops.push(t); rests.push(ms)
  }
  return { x, y, stretch: Math.min(STRETCH_MAX, Math.max(1, norm)), segs: out, landings, stops, rests }
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
    map = opts.breathe === false ? null : breathe(tl, spacerTarget, el)
    if (map) carryLandings(prev?.landings, map.landings)
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
    if (map) tickLandings(map.landings, t, performance.now())
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
