import { gsap, ScrollTrigger } from './scroll'
import type { ChapterCtx } from './chapter'

/**
 * createFilm — turns a chapter into a pear.no-style pinned "film": the section becomes `length × 100vh` tall,
 * a sticky `.pin` (100dvh, overflow clip) holds the frame, and a paused GSAP timeline is scrubbed 0→1 across
 * the section's travel. Put your DOM inside `pin`; add tweens to `tl` with positions in 0..1 (tl duration is 1).
 *
 *   const { pin, tl } = createFilm(ctx, { length: 4 })
 *   pin.innerHTML = `...`
 *   tl.fromTo('.x', { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.2)   // 20%→30% of the chapter
 */
export function createFilm(ctx: ChapterCtx, opts: { length?: number; scrub?: number | boolean; snap?: boolean; onUpdate?: (p: number) => void } = {}) {
  const { el } = ctx
  const length = opts.length ?? 3
  el.classList.add('chapter--film')
  el.style.setProperty('--film-len', String(length))
  const pin = document.createElement('div')
  pin.className = 'pin'
  el.appendChild(pin)
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
  // duration is normalised to 1 so positions are fractions of the chapter
  tl.to({}, { duration: 1 }, 0)
  const st = ScrollTrigger.create({
    trigger: el, start: 'top top', end: 'bottom bottom',
    scrub: opts.scrub ?? 0.6,
    animation: tl,
    onUpdate: s => opts.onUpdate?.(s.progress),
  })
  return { pin, tl, st, length }
}
