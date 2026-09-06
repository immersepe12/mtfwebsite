/**
 * The breath — the pure maths of a film's scroll → time map, shared by the film (which builds it), the hold
 * (which gates the scroll on it) and the player (which paces itself by it). No DOM, no GSAP, no state.
 *
 * A film's timeline runs 0→1. The map is a monotone piecewise-linear function from the scroll fraction `x`
 * (0→1 across the pinned travel) to the timeline time `y`. Between the knots the film is either MOVING (a beat:
 * a line landing, a rule drawing), STILL after something landed (a hold: the reader's time) or EMPTY at either
 * end (a seam: scroll with nothing in it).
 */

export type SegKind = 'beat' | 'hold' | 'seam'

export interface Seg {
  /** scroll fraction span */
  x0: number; x1: number
  /** timeline span */
  a: number; b: number
  kind: SegKind
  /** how long the player gives this stretch, in seconds (seams are paced by distance instead) */
  dur: number
}

/**
 * A landing: text began arriving at `arm` and was whole at `from`; the player pauses on it for `ms` from the
 * moment it was actually there (`opened`, a wall-clock stamp; −1 while it has not happened yet). Scrolling back
 * above `arm` un-lands it.
 */
export interface Landing { from: number; arm: number; ms: number; chars: number; opened: number }

/**
 * The breath. `stops` are the timeline times the film comes to rest at under the wheel: the end of each RUN of
 * activity — everything the composition does between one quiet moment and the next, which is one state of the
 * frame. One gesture plays the film from one stop to the next at the pace written here (engine/play.ts), so a
 * scroll advances a whole moment (a stanza, the eleven stars lighting one by one, the Shatter) and then rests.
 */
export interface Breath { x: number[]; y: number[]; stretch: number; segs: Seg[]; landings: Landing[]; stops: number[] }

/** scroll fraction → timeline time, through the map. */
export function through(map: Breath | null, p: number): number {
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

/** timeline time → scroll fraction: the inverse of `through` (the map is monotone, so this is exact). */
export function inverse(map: Breath | null, t: number): number {
  if (!map) return t
  const { x, y } = map
  if (t <= 0) return 0
  if (t >= 1) return 1
  let i = 1
  while (i < y.length - 1 && t > y[i]) i++
  const span = y[i] - y[i - 1]
  const k = span > 1e-6 ? (t - y[i - 1]) / span : 0
  return x[i - 1] + (x[i] - x[i - 1]) * k
}

/**
 * How long the player rests on a landed line before going on (under the wheel the reader decides). Measured in
 * characters: SplitText hands the film letters, not words.
 */
export function readingMs(chars: number): number {
  if (chars <= 12) return 900             // "Salt." · "They knew." — a glance, then a breath
  return Math.min(2800, Math.max(1400, 300 + 32 * chars))
}

/** The pace of a beat: a line lands unhurried; a long animation (the Shatter, an island rising) takes its time. */
export const beatSeconds = (len: number) => Math.min(4, Math.max(0.55, len * 30))
/** A still moment carries the world's own motion (a camera move, the sun): it is crossed at this rate, never faster than a rest. */
export const REST_SECONDS = 0.35
export const HOLD_SECONDS_PER_UNIT = 9
