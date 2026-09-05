import './preloader.css'
import { gsap } from '../engine/scroll'
import { prefersReducedMotion, clamp } from '../engine/utils'
import { star } from '../art/star'
import type { Mood } from '../engine/mood'

/**
 * Preloader — "NINE NIGHTS" (DESIGN-BIBLE §7.1). The film's first frame, not a loader.
 *
 *   Press-black. "Sing to me, Muse…" · a hairline horizon draws on the world's sea line · one gold star
 *   sets on a slow arc above it · progress is nights, not percent: NIGHT 01 … 09 step from the
 *   `mtf:progress` events main.ts dispatches (weights: fonts 15 · chapters 25 · frame 40 · ready 20;
 *   `done()` counts as `ready` because main.ts only emits it after we resolve). No events → a 1.4 s timer.
 *   Each night is broadcast as `mtf:night { night }` (the rail lights one tick per night; `#preloader[data-night]`
 *   carries the current night for listeners that mount late).
 *
 *   At ready: THE TENTH NIGHT · the star drops below the rule · the rule ignites gold · the black lifts
 *   bottom → top (clip-path, 1.1 s, --ease-veil) while the world's sun rises (sunY −1.6 → −.35 over 1.4 s
 *   through `stage.override`, cleared afterwards) and the star flies (FLIP, 1.4 s, --ease-tide) to the rail's
 *   tick 01. `done()` resolves when the curtain has opened.
 *
 *   Min 900 ms · max 3.5 s cold / .8 s warm (sessionStorage.mtfWarm) — the cap opens the curtain even if boot
 *   stalls. Scroll or click skips the designed wait. Reduced motion: static star, 0-duration reveal.
 *   `?preloader=hold` (dev) keeps the preloader up so it can be screenshotted.
 */

type Phase = 'fonts' | 'chapters' | 'frame' | 'ready'
const WEIGHT: Record<Phase, number> = { fonts: 15, chapters: 25, frame: 40, ready: 20 }
const NIGHTS = 9
const STAR_PX = 14
const SUN_FROM = -1.6, SUN_TO = -0.35

interface MtfGlobals { stage?: { override: Partial<Mood> | null } | null }
const globals = (): MtfGlobals => (window as unknown as { __mtf?: MtfGlobals }).__mtf ?? {}
const pad = (n: number) => String(n).padStart(2, '0')
const emit = (name: string, detail: Record<string, unknown>) => document.dispatchEvent(new CustomEvent(name, { detail }))

export function initPreloader(): { done(): Promise<void> } {
  const root = document.getElementById('preloader')
  if (!root) return { done: () => Promise.resolve() }
  const line = root.querySelector<HTMLElement>('.preloader__line')
  const rule = root.querySelector<HTMLElement>('.preloader__rule')
  const starEl = root.querySelector<HTMLElement>('.preloader__star')
  const night = root.querySelector<HTMLElement>('.preloader__night')

  const reduced = prefersReducedMotion()
  let warm = false
  try { warm = sessionStorage.getItem('mtfWarm') === '1' } catch { /* storage may be unavailable */ }
  const hold = new URLSearchParams(location.search).get('preloader') === 'hold'
  const tempo = warm ? 0.6 : 1
  const minShow = reduced ? 0 : warm ? 450 : 900
  const maxShow = warm ? 800 : 3500
  const stepMs = warm ? 45 : 95
  const t0 = performance.now()
  const elapsed = () => performance.now() - t0

  // ── markup: the star glyph; the live region becomes a visible (aria-hidden) label + an sr-only announcer
  if (starEl) starEl.innerHTML = star(STAR_PX)
  const nightText = document.createElement('span')
  nightText.className = 'preloader__nightText'
  nightText.setAttribute('aria-hidden', 'true')
  nightText.textContent = 'NIGHT 01'
  const announce = document.createElement('span')
  announce.className = 'sr-only'
  if (night) { night.textContent = ''; night.append(nightText, announce) }
  root.dataset.night = '1'
  root.setAttribute('aria-valuenow', '11')

  // ── state
  const phaseValue = new Map<Phase, number>()
  let shown = 1
  let opened = false, doneCalled = false, skipped = false
  const wakers = new Set<() => void>()
  let resolveOpen: () => void = () => {}
  const openP = new Promise<void>(r => { resolveOpen = r })

  const weight = () => { let w = 0; phaseValue.forEach((v, k) => { w += WEIGHT[k] * v }); return w }
  const nightFor = (w: number) => clamp(Math.round((w / 100) * NIGHTS), 1, NIGHTS)
  const targetNight = () => (phaseValue.size ? nightFor(weight()) : clamp(1 + Math.floor((elapsed() / 1400) * NIGHTS), 1, NIGHTS))

  // ── the star's arc: sets left → right, slow at the top, quicker into the horizon (cos), always beside the line
  const geo = () => {
    const vw = innerWidth, vh = innerHeight, mobile = vw < 820
    const lr = line?.getBoundingClientRect()
    const x0 = Math.max(vw * (mobile ? 0.6 : 0.56), (lr?.right ?? 0) + 18)
    const x1 = Math.min(vw * 0.9, x0 + vw * (mobile ? 0.2 : 0.16))
    return { x0, x1, hMax: vh * (mobile ? 0.2 : 0.24), hMin: 10 + vh * 0.015, vw, vh }
  }
  const arc = (n: number) => {
    const g = geo(), t = (n - 1) / (NIGHTS - 1), c = Math.cos((t * Math.PI) / 2)
    return { x: g.x0 + (g.x1 - g.x0) * t, y: -(g.hMin + (g.hMax - g.hMin) * c) }
  }
  const belowRule = () => { const g = geo(); return { x: arc(NIGHTS).x + g.vw * 0.02, y: 8 + g.vh * 0.03 } }
  const placeStar = (n: number, animate: boolean) => {
    if (!starEl) return
    const p = arc(n)
    if (!animate || reduced) gsap.set(starEl, { x: p.x, y: p.y })
    else gsap.to(starEl, { x: p.x, y: p.y, duration: 0.7, ease: 'expo.out', overwrite: 'auto' })
  }

  const showNight = (n: number) => {
    shown = n
    nightText.textContent = `NIGHT ${pad(n)}`
    root.dataset.night = String(n)
    root.setAttribute('aria-valuenow', String(Math.min(99, n * 11)))
    emit('mtf:night', { night: n })
    placeStar(n, true)
  }

  // ── the nights step one at a time toward real progress (never ahead of it)
  let stepTimer = 0
  const pump = () => {
    if (opened) return
    if (shown < targetNight()) showNight(shown + 1)
    stepTimer = window.setTimeout(pump, skipped ? 30 : stepMs)
  }
  stepTimer = window.setTimeout(pump, stepMs)

  // ── the sun starts below the water so the wipe can reveal it rising (the Stage rewrites world.target every
  //    frame, so the override is the only handle; armed as soon as the stage exists so world.snap() sees it)
  let sunObj: Partial<Mood> | null = null
  const armSun = () => {
    if (reduced || sunObj) return
    const stage = globals().stage
    if (!stage) return
    sunObj = { ...(stage.override ?? {}), sunY: SUN_FROM }
    stage.override = sunObj
  }
  const sunrise = () => {
    armSun()
    const stage = globals().stage, o = sunObj
    if (!stage || !o || stage.override !== o) return
    gsap.to(o, {
      sunY: SUN_TO, duration: 1.4, ease: 'sine.inOut',
      onComplete: () => {
        if (stage.override !== o) return // the dev harness (?mood=) replaced it — leave theirs alone
        delete o.sunY
        stage.override = Object.keys(o).length ? o : null
      },
    })
  }

  const onProgress = (e: Event) => {
    const d = (e as CustomEvent<{ phase: Phase; value: number }>).detail
    if (!d || !(d.phase in WEIGHT)) return
    phaseValue.set(d.phase, Math.max(phaseValue.get(d.phase) ?? 0, clamp(d.value ?? 1)))
    armSun()
    emit('mtf:night', { night: shown }) // listeners that mounted after earlier nights (the rail) catch up
  }
  document.addEventListener('mtf:progress', onProgress)

  // ── skip: scroll or click collapses the designed wait (readiness itself is main.ts's)
  const skip = () => { if (skipped) return; skipped = true; wakers.forEach(w => w()); wakers.clear() }
  const onKey = (e: KeyboardEvent) => { if ([' ', 'Enter', 'ArrowDown', 'PageDown', 'Escape'].includes(e.key)) skip() }
  const onResize = () => { if (!opened) placeStar(shown, false) }
  window.addEventListener('wheel', skip, { passive: true })
  window.addEventListener('touchstart', skip, { passive: true })
  window.addEventListener('pointerdown', skip, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)

  const wait = (ms: number) => new Promise<void>(res => {
    if (ms <= 0 || skipped) return res()
    const w = () => { clearTimeout(id); res() }
    const id = window.setTimeout(() => { wakers.delete(w); res() }, ms)
    wakers.add(w)
  })
  const waitFor = (cond: () => boolean, maxMs: number) => new Promise<void>(res => {
    const t = performance.now()
    const w = () => { clearInterval(id); res() }
    const id = window.setInterval(() => { if (cond() || skipped || performance.now() - t > maxMs) w() }, 30)
    wakers.add(w)
  })

  // ── never block longer than the cap, even if boot stalls
  const cap = window.setTimeout(() => { if (!hold) open() }, maxShow)

  const cleanup = () => {
    clearTimeout(stepTimer); clearTimeout(cap)
    document.removeEventListener('mtf:progress', onProgress)
    window.removeEventListener('wheel', skip); window.removeEventListener('touchstart', skip)
    window.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', onResize)
  }

  // the rail's tick 01 (or the top-left of the rail if the rail is not there yet)
  const railTarget = () => {
    const r = document.querySelector<HTMLElement>('.rail .rail__tick[data-i="0"]')?.getBoundingClientRect()
    if (r && (r.width || r.height)) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    return { x: Math.max(20, innerWidth * 0.0265), y: innerHeight * 0.24 }
  }

  const flight = () => {
    if (!starEl) return
    const r = starEl.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    gsap.killTweensOf(starEl)
    starEl.classList.add('preloader__star--flight')
    document.body.appendChild(starEl)
    gsap.set(starEl, { x: cx - STAR_PX / 2, y: cy - STAR_PX / 2, opacity: 1 })
    const t = railTarget()
    gsap.to(starEl, { x: t.x - STAR_PX / 2, y: t.y - STAR_PX / 2, duration: 1.4, ease: 'expo.out' })
    gsap.to(starEl, { opacity: 0, duration: 0.3, delay: 1.15, ease: 'none', onComplete: () => starEl.remove() })
  }

  const wipe = () => {
    let finished = false
    const finish = () => { if (finished) return; finished = true; root.remove(); resolveOpen() }
    root.addEventListener('transitionend', e => { if (e.target === root && e.propertyName === 'clip-path') finish() })
    root.classList.add('is-open')
    window.setTimeout(finish, 1300)
  }

  const open = () => {
    if (opened) return
    opened = true
    cleanup()
    try { sessionStorage.setItem('mtfWarm', '1') } catch { /* fine */ }
    while (shown < NIGHTS) showNight(shown + 1)
    // the tenth night
    root.dataset.night = '10'
    root.setAttribute('aria-valuenow', '99')
    night?.classList.add('is-tenth')
    emit('mtf:night', { night: 10 })
    announce.textContent = 'Loaded'
    if (reduced) { nightText.textContent = 'THE TENTH NIGHT'; root.remove(); resolveOpen(); return }
    gsap.to(nightText, { opacity: 0, duration: 0.14, ease: 'none', onComplete: () => {
      nightText.textContent = 'THE TENTH NIGHT'
      gsap.to(nightText, { opacity: 1, duration: 0.32, ease: 'none' })
    } })
    line?.classList.add('is-out')
    const d = belowRule()
    if (starEl) gsap.to(starEl, { x: d.x, y: d.y, duration: 0.55 * tempo, ease: 'power2.inOut', overwrite: 'auto' })
    gsap.delayedCall(0.38 * tempo, () => rule?.classList.add('is-gold'))
    gsap.delayedCall(0.74 * tempo, () => { wipe(); sunrise(); flight() })
  }

  // ── first frame: the rule draws, the line arrives, the star is born
  placeStar(reduced ? 5 : 1, false)
  requestAnimationFrame(() => {
    rule?.classList.add('is-drawn')
    window.setTimeout(() => line?.classList.add('is-in'), 120)
    window.setTimeout(() => starEl?.classList.add('is-lit'), 320)
  })

  return {
    async done() {
      if (doneCalled) return openP
      doneCalled = true
      phaseValue.set('ready', 1) // main.ts emits `ready` only after we resolve
      if (hold) return openP
      await wait(minShow - elapsed())
      await waitFor(() => shown >= NIGHTS, 600) // let the last nights land before the tenth
      open()
      return openP
    },
  }
}
