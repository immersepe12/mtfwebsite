import { inverse, PLAYER_READ, type Breath, type Landing } from './breath'

/**
 * The hold — the film's reading gate on the scroll.
 *
 * A laptop trackpad is sensitive: one flick carries a sentence in and out before it has been seen. So the scroll
 * is metered by what is on screen. Every film registers here with its breath map (which knows where each landing
 * completes and where the next change begins). When wheel input would carry the reader past the next change
 * before the landed text has been on screen for its reading time, the input is shortened so the scroll settles
 * exactly there — the frame comes to rest on the sentence — and passes again once the time has been given.
 *
 * Only forward wheel input is metered; scrolling back, touch (native), the scrollbar and programmatic jumps are
 * not. A gesture made against a closed gate is not lost: the ScrollEngine remembers it and lets it go the moment
 * the gate opens (to the next landing, whole). A gesture that reaches into a landing completes it, so a line is
 * never left half-faded. `?nohold` switches the gates off for the QA scripts that drive the page with synthetic
 * wheel events.
 */

export interface FilmHold {
  el: HTMLElement
  /** page px of the film's pinned travel: [start, end] (ScrollTrigger's numbers, valid after refresh) */
  range: () => [number, number]
  /** the film's breath map (built lazily by the film) */
  map: () => Breath | null
}

const films: FilmHold[] = []
export const holdEnabled = typeof location === 'undefined' || !new URLSearchParams(location.search).has('nohold')

export function registerFilm(f: FilmHold) { films.push(f) }
// dev: window.__mtf_gates(el) → the film's gates and segments (scripts/hold.mjs)
if (typeof window !== 'undefined') (window as any).__mtf_gates = (el: HTMLElement) => { const f = films.find(x => x.el === el); const m = f?.map(); return m ? { range: f!.range(), stretch: m.stretch, gates: m.gates, landings: m.landings, segs: m.segs } : null }
export const holdFilms = (): readonly FilmHold[] => films

/** Mark landings as a film's timeline crosses them (and un-mark them when it is scrolled back above them). */
export function tickGates(landings: Landing[], t: number, now: number) {
  for (const g of landings) {
    if (t >= g.from - 1e-3) { if (g.opened < 0) g.opened = now }
    else if (t < g.arm) g.opened = -1
  }
}

/** Rebuilding a map must not close gates the reader has already been given: carry the stamps across. */
export function carryGates(from: Landing[] | undefined, to: Landing[]) {
  if (!from?.length) return
  for (const g of to) {
    const old = from.find(o => Math.abs(o.from - g.from) < 1e-3)
    if (old) g.opened = old.opened
  }
}

/** page y of a landing's completion / start, given its film's range and map */
const yOf = (s: number, travel: number, map: Breath, t: number) => s + inverse(map, t) * travel

/** a wheel notch that stops this short of a landing is pulled into it */
const PULL_PX = 48

/**
 * Where a forward gesture aimed at `target` should actually stop: if that point lies inside a landing (or just
 * short of one), the landing's completion — a sentence arrives whole or not at all.
 */
export function settleTarget(target: number): number {
  if (!holdEnabled) return target
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || target < s - PULL_PX || target > e) continue
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const l of map.landings) {
      const armY = yOf(s, travel, map, l.arm), fromY = yOf(s, travel, map, l.from)
      if (target > armY - PULL_PX && target < fromY) return fromY
    }
  }
  return target
}

/** The next place worth stopping after `y`: the completion of the next landing within a screen, else a short step on. */
export function nextStop(y: number, vh: number): number {
  let best = Infinity
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e < y || s > y + vh * 1.2) continue
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const l of map.landings) { const fy = yOf(s, travel, map, l.from); if (fy > y + 1 && fy < best) best = fy }
  }
  return best <= y + vh * 1.2 ? best : y + vh * 0.35
}

/**
 * The player's stop: the completion of the first landing ahead that has not yet had its (scaled) time — the
 * player pauses on every sentence, hidden later or not.
 */
export function playerLimit(y: number, now: number): number {
  let best = Infinity
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e < y - 2 || s > best) continue
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const l of map.landings) {
      if (l.opened >= 0 && now - l.opened >= l.ms * PLAYER_READ) continue
      const fy = yOf(s, travel, map, l.from)
      if (fy < y - 2 || fy >= best) continue
      best = fy
    }
  }
  return best
}

export interface HoldState { y: number; remaining: number; ms: number }
let last: HoldState | null = null
/** The gate the scroll last leaned on (for the reading cue), or null. */
export const holdState = () => last

/**
 * A reader reads in order and no faster than the reading time: line i is finished at
 *   readEnd(i) = max(readEnd(i−1), the moment line i was on screen) + its reading time.
 * A flick that lands a whole stanza at once therefore owes the stanza's time, not one line's — bounded by
 * LOCK_MAX so a hard flick through a chapter is never a locked door for longer than a few seconds.
 */
const LOCK_MAX = 4000
function needOf(map: Breath): Map<Landing, number> {
  const need = new Map<Landing, number>()
  const order = [...map.landings].sort((a, b) => a.from - b.from)
  let readEnd = -Infinity
  for (const l of order) {
    if (l.opened < 0) { need.set(l, Infinity); continue }
    readEnd = Math.max(readEnd, l.opened) + l.ms
    need.set(l, Math.min(readEnd, l.opened + LOCK_MAX))
  }
  return need
}

/**
 * The furthest page y the scroll may be sent right now, given it is at `y`: the first gate ahead that is still
 * closed — exactly where the text starts to leave, so it is whole until then — or Infinity when the way is clear.
 */
export function limitAhead(y: number, now: number): number {
  last = null
  if (!holdEnabled) return Infinity
  let best = Infinity
  let bestNeed = Infinity, bestMs = 0
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e < y - 2 || s > best) continue
    const map = f.map()
    if (!map || !map.gates.length) continue
    const travel = e - s
    const need = needOf(map)
    for (const g of map.gates) {
      const n = need.get(g) ?? Infinity
      if (now >= n) continue                                        // open: the text has had its time
      const gy = s + inverse(map, g.at) * travel
      if (gy < y - 2 || gy >= best) continue                       // behind us, or not the nearest
      best = gy; bestNeed = n; bestMs = g.ms
    }
  }
  if (best !== Infinity) last = { y: best, ms: bestMs, remaining: bestNeed === Infinity ? bestMs : Math.max(0, bestNeed - now) }
  return best
}

/** Player pacing: px per second through page position `y` (vh = viewport height, for the distance-paced parts). */
export const FLOW_VH_PER_S = 0.9     // flowing sections and the slide between two films
export const SEAM_VH_PER_S = 1.15    // the empty run-in and run-out of a film
export function speedAt(y: number, vh: number): number {
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || y < s || y >= e) continue
    const map = f.map()
    const travel = e - s
    if (!map || !map.segs.length) return FLOW_VH_PER_S * vh
    const p = (y - s) / travel
    const segs = map.segs
    let seg = segs[segs.length - 1]
    for (const g of segs) if (p < g.x1) { seg = g; break }
    if (seg.kind === 'seam') return SEAM_VH_PER_S * vh
    return Math.max(30, ((seg.x1 - seg.x0) * travel) / Math.max(seg.dur, 0.05))
  }
  return FLOW_VH_PER_S * vh
}

/** Rough running time of the whole film at the player's pace, in seconds (dev readout). */
export function estimateSeconds(vh: number, limit: number): number {
  let total = 0, cursor = 0
  const sorted = [...films].sort((a, b) => a.range()[0] - b.range()[0])
  for (const f of sorted) {
    const [s, e] = f.range()
    if (!(e > s)) continue
    total += Math.max(0, s - cursor) / (FLOW_VH_PER_S * vh)
    const map = f.map(), travel = e - s
    if (map) {
      for (const g of map.segs) total += g.kind === 'seam' ? ((g.x1 - g.x0) * travel) / (SEAM_VH_PER_S * vh) : g.dur
      for (const g of map.landings) total += (g.ms * PLAYER_READ) / 1000
    } else total += travel / (FLOW_VH_PER_S * vh)
    cursor = e
  }
  total += Math.max(0, limit - cursor) / (FLOW_VH_PER_S * vh)
  return total
}
