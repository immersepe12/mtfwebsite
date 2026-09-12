import { inverse, PLAYER_REST, READ_INSIDE, type Breath, type Landing } from './breath'

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
  /** a chapter's own tempo (`data-tempo`, 1 = as written): the sunrise wanted to be a touch brisker */
  tempo?: number
  /** page px of the film's pinned travel: [start, end] (ScrollTrigger's numbers, valid after refresh) */
  range: () => [number, number]
  /** the film's breath map (built lazily by the film) */
  map: () => Breath | null
}

const films: FilmHold[] = []
export const holdEnabled = typeof location === 'undefined' || !new URLSearchParams(location.search).has('nohold')

export function registerFilm(f: FilmHold) { f.tempo = parseFloat(f.el.dataset.tempo ?? '') || 1; films.push(f) }
// dev: window.__mtf_gates(el) → the film's landings, stops and segments
if (typeof window !== 'undefined') (window as any).__mtf_gates = (el: HTMLElement) => { const f = films.find(x => x.el === el); const m = f?.map(); return m ? { range: f!.range(), stretch: m.stretch, landings: m.landings, stops: m.stops, rests: m.rests, segs: m.segs } : null }
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

/** Past the last film (the footer): there are no more moments, so NEXT stands down and the wheel scrolls freely. */
export function atEnd(y: number): boolean {
  let last = -Infinity
  for (const f of films) { const [s, e] = f.range(); if (e > s) last = Math.max(last, e) }
  return last > -Infinity && y >= last - 2
}

/** Is `y` inside a film, or within a screen of the next one? (Otherwise — the footer — the wheel scrolls freely.) */
export function withinFilms(y: number, vh: number): boolean {
  for (const f of films) {
    const [s, e] = f.range()
    if (e > s && y >= s - vh && y < e) return true
  }
  return false
}

/**
 * The next stop after `y`. A chapter's own end is NOT a stop: the last line of one chapter and the first of the
 * next are consecutive, and the exit, the seam and the new chapter's run-in all play inside that one gesture.
 * The film's end is only a fallback, so the reader is never stuck in a chapter's tail.
 */
export function stopAfter(y: number): number {
  let best = Infinity, fallback = Infinity
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e <= y + 2) continue
    fallback = Math.min(fallback, e)
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const t of map.stops) { const sy = yOf(s, travel, map, t); if (sy > y + 2 && sy < best) best = sy }
  }
  return best !== Infinity ? best : fallback
}

/** The stop before `y`, or 0. */
export function stopBefore(y: number): number {
  let best = -Infinity, fallback = -Infinity
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || s >= y - 2) continue
    fallback = Math.max(fallback, s)
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const t of map.stops) { const sy = yOf(s, travel, map, t); if (sy < y - 2 && sy > best) best = sy }
  }
  return Math.max(0, best !== -Infinity ? best : fallback === -Infinity ? 0 : fallback)
}

/**
 * Where a link to a chapter should land: its first stop — the frame with its first line in it. A film's section
 * begins with a seam (an empty frame by the seam rule), so jumping to the section itself lands the reader on
 * nothing and makes them scroll to find the chapter they asked for.
 */
export function entryOf(el: HTMLElement): number | null {
  const f = films.find(x => x.el === el)
  if (!f) return null
  const [s, e] = f.range()
  const map = f.map()
  if (!map || !map.stops.length) return s
  // a chapter may name where a link should enter it (`data-entry`, in timeline time): the register form is the
  // point of that chapter, and a reader who presses REGISTER wants the form, not the chapter's first line
  const want = parseFloat(el.dataset.entry ?? '')
  const stop = (Number.isFinite(want) && map.stops.find(t => t >= want)) || map.stops[0]
  return yOf(s, e - s, map, stop)
}

/** The tempo of the film at page position `y` (1 outside any film). */
export function tempoAt(y: number): number {
  for (const f of films) { const [s, e] = f.range(); if (e > s && y >= s && y < e) return f.tempo ?? 1 }
  return 1
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
    // a still after a landed line may be only a few pixels long and owe a second of reading: no speed floor to
    // speak of, or the wait would be skipped
    return Math.max(2, ((seg.x1 - seg.x0) * travel) / Math.max(seg.dur, 0.05)) * (f.tempo ?? 1)
  }
  return FLOW_VH_PER_S * vh
}

/** The reading time owed INSIDE a step (y0, y1]: every line that lands before the step's last, so a press that
 *  brings a stanza may take as long as the stanza takes to read. Seconds. */
export function readInside(y0: number, y1: number): number {
  let t = 0
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || e < y0 || s > y1) continue
    const map = f.map()
    if (!map) continue
    const travel = e - s
    for (const l of map.landings) { if (l.meta) continue; const fy = yOf(s, travel, map, l.from); if (fy > y0 + 1 && fy < y1 - 1) t += (l.ms * READ_INSIDE) / 1000 }
  }
  return t
}

/** How long PLAY rests on the moment that ends at page position `y` (the nearest stop). */
export function restAt(y: number): number {
  let best = 700, bestD = 24
  for (const f of films) {
    const [s, e] = f.range()
    if (!(e > s) || y < s - 24 || y > e + 24) continue
    const map = f.map()
    if (!map) continue
    const travel = e - s
    map.stops.forEach((t, i) => {
      const d = Math.abs(yOf(s, travel, map, t) - y)
      if (d < bestD) { bestD = d; best = map.rests[i] }
    })
  }
  return best * PLAYER_REST
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
      for (const g of map.rests) total += (g * PLAYER_REST) / 1000
    } else total += travel / (FLOW_VH_PER_S * vh)
    cursor = e
  }
  total += Math.max(0, limit - cursor) / (FLOW_VH_PER_S * vh)
  return total
}
