import { clamp } from '../engine/utils'

/**
 * THE CLOCK — DESIGN-BIBLE §1.3 / §7.4. Owner: ui/rail.
 * One night on the water: the corner clock runs from 16:56 · SUNSET (hero, p 0) to 06:51 · SUNRISE
 * (sunrise, p ≥ .9). Every chapter owns a segment of minutes-since-sunset between its p 0 and p 1;
 * the display interpolates linearly inside the segment, so the clock is purely a function of scroll.
 *
 * Anchor times are the chapter clocks of §6.0 (16:56 · 17:40 · 21:10 · 23:00 · 00:15 · — · 01:00→04:00
 * · 04:10 · 04:50 · 05:20 · 05:55 · 06:20 · 06:40 · 06:51). The §7.4 minute list drifts by an hour after
 * `eleven` and would run the sunrise backwards (865 → 835); the §6.0 chapter times are consistent with
 * the sacred anchors, so they are what ships. VERIFY 16:56 / 06:51 with a solar calculator for Valletta,
 * 25 → 26 November 2026, before launch (Appendix C).
 *
 *   unity    — the clock runs 00:15 → 01:00 and STOPS at the end of the chapter
 *   paradise — stopped: `— · STAY TODAY`
 *   eleven   — SPINS 01:00 → 04:10 (seven years) in 4-minute steps that decelerate (power2.out of p)
 *   sunrise  — reaches 06:51 at p .9 and holds; the `· SUNRISE` suffix appears from p .9
 */
export type ClockMode = 'run' | 'spin' | 'stop'
export interface ClockAnchor {
  /** minutes since sunset at the chapter's p 0 */
  from: number
  /** minutes since sunset at the chapter's p 1 (or at `reachAt`) */
  to: number
  mode: ClockMode
  /** the p at which `to` is reached (held afterwards); default 1 */
  reachAt?: number
}

/** 16:56 — sunset, Valletta, 25 November 2026 (verify before launch). */
export const SUNSET_MINUTE = 16 * 60 + 56
/** 06:51 — sunrise, Valletta, 26 November 2026 (verify before launch) = 835 minutes after sunset. */
export const SUNRISE_AFTER = 835
/** the eleven spin steps in minutes (steps(1) every 4 minutes, decelerating) */
export const SPIN_STEP = 4

export const CLOCK_ANCHORS: Record<string, ClockAnchor> = {
  hero:     { from: 0,   to: 44,  mode: 'run'  },              // 16:56 → 17:40
  warning:  { from: 44,  to: 254, mode: 'run'  },              // 17:40 → 21:10
  stars:    { from: 254, to: 364, mode: 'run'  },              // 21:10 → 23:00
  ogygia:   { from: 364, to: 439, mode: 'run'  },              // 23:00 → 00:15
  unity:    { from: 439, to: 484, mode: 'run'  },              // 00:15 → 01:00, then it stops
  paradise: { from: 484, to: 484, mode: 'stop' },              // — · STAY TODAY
  eleven:   { from: 484, to: 674, mode: 'spin' },              // 01:00 → 04:10, seven years
  rudder:   { from: 674, to: 714, mode: 'run'  },              // 04:10 → 04:50
  forever:  { from: 714, to: 744, mode: 'run'  },              // 04:50 → 05:20
  remains:  { from: 744, to: 779, mode: 'run'  },              // 05:20 → 05:55
  hand:     { from: 779, to: 804, mode: 'run'  },              // 05:55 → 06:20
  homer:    { from: 804, to: 824, mode: 'run'  },              // 06:20 → 06:40
  register: { from: 824, to: 830, mode: 'run'  },              // 06:40 → 06:46
  sunrise:  { from: 830, to: SUNRISE_AFTER, mode: 'run', reachAt: 0.9 }, // 06:46 → 06:51 · SUNRISE
}

/** GSAP's `power2.out`, written out so this module stays dependency-free (the tween is p-driven anyway). */
const power2Out = (t: number) => 1 - (1 - t) * (1 - t)

/** Minutes since sunset shown for chapter `id` at local progress `p`; `null` while the clock is stopped. */
export function minutesAt(id: string, p: number): number | null {
  const a = CLOCK_ANCHORS[id]
  if (!a || a.mode === 'stop') return a ? null : 0
  const t = clamp(p / (a.reachAt ?? 1))
  if (a.mode === 'spin') {
    if (t >= 1) return a.to
    const v = a.from + (a.to - a.from) * power2Out(t)
    return a.from + Math.floor((v - a.from) / SPIN_STEP) * SPIN_STEP
  }
  return a.from + (a.to - a.from) * t
}

/** `HH:MM` (24 h, wraps past midnight) for a minutes-since-sunset value. */
export function formatTime(minutesSinceSunset: number): string {
  const m = (((Math.round(minutesSinceSunset) + SUNSET_MINUTE) % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** The full corner text for a chapter at progress p — `16:56 · SUNSET`, `23:37`, `— · STAY TODAY`, `06:51 · SUNRISE`. */
export function clockText(id: string, p: number): string {
  const v = minutesAt(id, p)
  if (v === null) return '— · STAY TODAY'
  const t = formatTime(v)
  if (id === 'hero' && p < 0.3) return `${t} · SUNSET`
  if (id === 'sunrise' && p >= (CLOCK_ANCHORS.sunrise?.reachAt ?? 0.9)) return `${t} · SUNRISE`
  return t
}

/** Binds the clock to an element; `update` writes only when the text changes (cheap on scroll). */
export function createClock(el: HTMLElement) {
  let last = ''
  return {
    update(id: string, p: number) {
      const text = clockText(id, p)
      if (text === last) return text
      last = text
      el.textContent = text
      el.dataset.mode = CLOCK_ANCHORS[id]?.mode ?? 'run'
      return text
    },
    get text() { return last },
  }
}
