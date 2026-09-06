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
 * A gate: text finished landing at time `from`; the next change on the timeline begins at `at`. The scroll may
 * not carry the reader past `at` until `ms` milliseconds after the landing was actually on screen (`opened`,
 * a wall-clock stamp; −1 while the landing has not happened yet). `arm` is where the landing began — scrolling
 * back above it un-lands the text, and the gate closes again.
 */
export interface Gate { at: number; from: number; arm: number; ms: number; chars: number; opened: number }

export interface Breath { x: number[]; y: number[]; stretch: number; segs: Seg[]; gates: Gate[] }

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
 * How long a landed line is owed before the scroll may move on. Two seconds is the floor the reader asked for;
 * longer copy earns more at about a word every fifth of a second, with a ceiling so a paragraph never feels
 * like a locked door. Measured in characters: SplitText hands the film letters, not words.
 */
export function readingMs(chars: number): number {
  if (chars <= 12) return 1200            // "Salt." · "They knew." — a glance, then a breath
  return Math.min(4200, Math.max(2000, 600 + 42 * chars))
}

/** The player's pace for a beat: short beats still take a moment, long ones (an island rising) are not rushed. */
export const beatSeconds = (len: number) => Math.min(2.4, Math.max(0.55, len * 24))
/** The player's pace for a still moment that is not a reading hold (an empty screen between two exits). */
export const REST_SECONDS = 0.4
