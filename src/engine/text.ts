import { gsap, ScrollTrigger } from './scroll'
import { SplitText } from 'gsap/SplitText'
import { prefersReducedMotion } from './utils'

gsap.registerPlugin(SplitText)

export type RevealOpts = {
  type?: 'lines' | 'words' | 'chars'
  y?: number; stagger?: number; duration?: number; delay?: number
  ease?: string
  start?: string                 // ScrollTrigger start, default 'top 85%'
  trigger?: Element              // custom trigger
  once?: boolean
  scrub?: boolean | number       // scrub the reveal across scroll instead of playing it
  immediate?: boolean            // play now instead of on scroll
  blur?: boolean                 // add a soft blur-in
}

const toEls = (t: Element | Element[] | string) => typeof t === 'string' ? Array.from(document.querySelectorAll(t)) : Array.isArray(t) ? t : [t]

/**
 * Split an element's text (GSAP SplitText, masked lines, aria-safe) and animate it in.
 * Returns a cleanup function. Reduced-motion users just see the text.
 */
export function reveal(target: Element | Element[] | string, opts: RevealOpts = {}) {
  const els = toEls(target)
  const type = opts.type ?? 'lines'
  const cleanups: (() => void)[] = []
  for (const el of els) {
    if (prefersReducedMotion()) { el.classList.add('is-revealed'); continue }
    let st: ScrollTrigger | undefined
    const split = SplitText.create(el as HTMLElement, {
      type: type === 'lines' ? 'lines' : type === 'words' ? 'lines,words' : 'lines,words,chars',
      mask: type === 'lines' ? 'lines' : type === 'words' ? 'words' : 'chars',
      autoSplit: true,
      linesClass: 'line', wordsClass: 'word', charsClass: 'char',
      onSplit: (self) => {
        const targets = type === 'lines' ? self.lines : type === 'words' ? self.words : self.chars
        const tween = gsap.from(targets, {
          yPercent: opts.y ?? 110,
          opacity: type === 'lines' ? 1 : 0,
          filter: opts.blur ? 'blur(8px)' : undefined,
          duration: opts.duration ?? 1.15,
          ease: opts.ease ?? 'power4.out',
          stagger: opts.stagger ?? (type === 'lines' ? 0.09 : type === 'words' ? 0.03 : 0.012),
          delay: opts.delay ?? 0,
          paused: !opts.immediate,
          onStart: () => el.classList.add('is-revealed'),
        })
        if (opts.immediate && !document.documentElement.classList.contains('is-ready')) {
          // hero-type reveals: wait for the curtain to open so the first frame is the animation
          document.addEventListener('mtf:ready', () => tween.play(), { once: true })
        } else if (!opts.immediate) {
          st?.kill()
          st = ScrollTrigger.create({
            trigger: opts.trigger ?? el,
            start: opts.start ?? 'top 85%',
            ...(opts.scrub ? { scrub: opts.scrub, animation: tween, end: 'bottom 45%' } : { once: opts.once ?? true, onEnter: () => tween.play() }),
          })
        }
        return tween
      },
    })
    el.classList.add('is-split')
    cleanups.push(() => { st?.kill(); split.revert() })
  }
  return () => cleanups.forEach(c => c())
}

/** Fade/rise a whole element in on scroll (no splitting). */
export function rise(target: Element | Element[] | string, opts: { y?: number; start?: string; delay?: number; stagger?: number; duration?: number; trigger?: Element } = {}) {
  const els = toEls(target)
  if (!els.length) return () => {}
  if (prefersReducedMotion()) { els.forEach(e => e.classList.add('is-revealed')); return () => {} }
  const tween = gsap.from(els, { y: opts.y ?? 28, opacity: 0, duration: opts.duration ?? 1.2, ease: 'power3.out', stagger: opts.stagger ?? 0.08, delay: opts.delay ?? 0, paused: true, clearProps: 'transform' })
  const st = ScrollTrigger.create({ trigger: opts.trigger ?? els[0], start: opts.start ?? 'top 88%', once: true, onEnter: () => { els.forEach(e => e.classList.add('is-revealed')); tween.play() } })
  return () => { st.kill(); tween.kill() }
}

/** Draw a hairline rule (scaleX 0→1) when it enters. */
export function drawRule(target: Element | Element[] | string, opts: { start?: string; delay?: number; duration?: number; origin?: string } = {}) {
  const els = toEls(target)
  if (!els.length || prefersReducedMotion()) return () => {}
  const cleanups = els.map(e => {
    gsap.set(e, { scaleX: 0, transformOrigin: opts.origin ?? 'left center' })
    const st = ScrollTrigger.create({ trigger: e, start: opts.start ?? 'top 92%', once: true, onEnter: () => gsap.to(e, { scaleX: 1, duration: opts.duration ?? 1.4, ease: 'power4.inOut', delay: opts.delay ?? 0 }) })
    return () => st.kill()
  })
  return () => cleanups.forEach(c => c())
}

/** Counter that counts up to a number when visible. */
export function countUp(el: HTMLElement, to: number, opts: { duration?: number; suffix?: string; prefix?: string; decimals?: number } = {}) {
  const obj = { v: 0 }
  const fmt = (v: number) => (opts.prefix ?? '') + v.toLocaleString('en-GB', { maximumFractionDigits: opts.decimals ?? 0 }) + (opts.suffix ?? '')
  el.textContent = fmt(0)
  if (prefersReducedMotion()) { el.textContent = fmt(to); return }
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(obj, { v: to, duration: opts.duration ?? 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(obj.v)) }) })
}
