import { inverse, type Breath, type Landing } from './breath'

/**
 * The film registry — every film's breath map, by page position — and what the wheel and the player ask of it.
 *
 * Under the wheel the film is not scrubbed: a gesture means "next" (or "back"), and the film plays itself from
 * the stop it is at to the next one at its written pace (engine/play.ts), then rests until the next gesture.
 * So a sentence always lands whole and in its own time, an animation is always seen at the speed it was made
 * for, and no scroll is ever spent on an empty screen. Touch stays native; `?nohold` restores free scrolling for
 * the QA scripts that drive the page with synthetic wheel events.
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
// dev: window.__mtf_gates(el) → the film's landings, stops and segments
if (typeof window !== 'undefined') (window as any).__mtf_gates = (el: HTMLElement) => { const f = films.find(x => x.el === el); const m = f?.map(); return m ? { range: f!.range(), stretch: m.stretch, landings: m.landings, stops: m.stops, segs: m.segs } : null }
export const holdFilms = (): readonly FilmHold[] => films

/** Mark landings as a film's timeline crosses them (and un-mark them when it is scrolled back above them). */
export function tickLandings(landings: Landing[], t: number, now: number) {
  for (const g of landings) {
    if (t >= g.from - 1e-3) { if (g.opened < 0) g.opened = now }
    else if (t < g.arm) g.opened = -1
  }
}

/** Rebuilding a map must not forget what the reader has already seen: carry the stamps across. */
export function carryLandings(from: Landing[] | undefined, to: Landing[]) {
  if (!from?.length) return
  for (const g of to) {
    const old = from.find(o => Math.abs(o.from - g.from) < 1e-3)
    if (old) g.opened = old.opened
  }
}

/** page y of a timeline time, given the film's range and map */
const yOf = (s: number, travel: number, map: Breath, t: number) => s + inverse(map, t) * travel

/** Is `y` inside a film, or within a screen of the next one? (Otherwise — the footer — the wheel scrolls freely.) */
export function withinFilms(y: number, vh: number): boolean {
  for (const f of films) {
    const [s, e] = f.range()
    if (e > s && y >= s - vh && y < e) return true
  }
  return false
}

/** The next stop after `y` (the first film's start counts), or Infinity. */
export function stopAfter(y: number): number {
  let best = Infinity
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e <= y + 2 || s >= best) continue
    if (s > y + 2) { best = Math.min(best, s); continue }
    const map = f.map()
    if (!map) { best = Math.min(best, e); continue }
    const travel = e - s
    for (const t of map.stops) { const sy = yOf(s, travel, map, t); if (sy > y + 2 && sy < best) best = sy }
  }
  return best
}

/** The stop before `y`, or 0. */
export function stopBefore(y: number): number {
  let best = 0
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || s >= y - 2) continue
    if (e < y - 2) { best = Math.max(best, e); continue }
    best = Math.max(best, s)
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const t of map.stops) { const sy = yOf(s, travel, map, t); if (sy < y - 2 && sy > best) best = sy }
  }
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

/** The player's pause: the completion of the first landing ahead that has not yet had its time. */
export function playerLimit(y: number, now: number): number {
  let best = Infinity
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e < y - 2 || s > best) continue
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const l of map.landings) {
      if (l.opened >= 0 && now - l.opened >= l.ms) continue
      const fy = yOf(s, travel, map, l.from)
      if (fy < y - 2 || fy >= best) continue
      best = fy
    }
  }
  return best
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
      for (const g of map.landings) total += g.ms / 1000
    } else total += travel / (FLOW_VH_PER_S * vh)
    cursor = e
  }
  total += Math.max(0, limit - cursor) / (FLOW_VH_PER_S * vh)
  return total
}
