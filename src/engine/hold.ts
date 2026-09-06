import { inverse, type Breath, type Gate } from './breath'

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
 * not. `?nohold` switches the gates off for the QA scripts that drive the page with synthetic wheel events.
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
if (typeof window !== 'undefined') (window as any).__mtf_gates = (el: HTMLElement) => { const f = films.find(x => x.el === el); const m = f?.map(); return m ? { range: f!.range(), stretch: m.stretch, gates: m.gates, segs: m.segs } : null }
export const holdFilms = (): readonly FilmHold[] => films

/** Mark landings as a film's timeline crosses them (and un-mark them when it is scrolled back above them). */
export function tickGates(gates: Gate[], t: number, now: number) {
  for (const g of gates) {
    if (t >= g.from - 1e-3) { if (g.opened < 0) g.opened = now }
    else if (t < g.arm) g.opened = -1
  }
}

/** Rebuilding a map must not close gates the reader has already been given: carry the stamps across. */
export function carryGates(from: Gate[] | undefined, to: Gate[]) {
  if (!from?.length) return
  for (const g of to) {
    const old = from.find(o => Math.abs(o.from - g.from) < 1e-3)
    if (old) g.opened = old.opened
  }
}

export interface HoldState { y: number; remaining: number; ms: number }
let last: HoldState | null = null
/** The gate the scroll last leaned on (for the reading cue), or null. */
export const holdState = () => last

/**
 * The furthest page y the scroll may be sent right now, given it is at `y`: the first gate ahead that is still
 * closed — exactly where the next change begins, so the landing before it is complete — or Infinity when the
 * way is clear.
 */
export function limitAhead(y: number, now: number): number {
  last = null
  if (!holdEnabled) return Infinity
  let best = Infinity
  let bestGate: Gate | null = null
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e < y - 2 || s > best) continue
    const map = f.map()
    if (!map || !map.gates.length) continue
    const travel = e - s
    for (const g of map.gates) {
      if (g.opened >= 0 && now - g.opened >= g.ms) continue        // open: the text has had its time
      const gy = s + inverse(map, g.at) * travel
      if (gy < y - 2 || gy >= best) continue                       // behind us, or not the nearest
      best = gy; bestGate = g
    }
  }
  if (bestGate) last = { y: best, ms: bestGate.ms, remaining: bestGate.opened < 0 ? bestGate.ms : Math.max(0, bestGate.ms - (now - bestGate.opened)) }
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
      for (const g of map.gates) total += g.ms / 1000
    } else total += travel / (FLOW_VH_PER_S * vh)
    cursor = e
  }
  total += Math.max(0, limit - cursor) / (FLOW_VH_PER_S * vh)
  return total
}
