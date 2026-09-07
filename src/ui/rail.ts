import './rail.css'
import type { Stage } from '../engine/stage'
import type { ScrollEngine } from '../engine/scroll'
import type { World } from '../engine/gl'
import type { Chapter } from '../engine/chapter'
import { gsap, ScrollTrigger } from '../engine/scroll'
import { clamp } from '../engine/utils'
import { star } from '../art/star'
import { createClock } from './clock'

/**
 * THE RAIL + corner marks + the clock — DESIGN-BIBLE §7.4. Owner: ui/rail.
 *
 *   aside.rail   the 1 px line · 14 ticks (active widens to 22 px with its mono label; passed 40 %) ·
 *                the gold guilloche strand (SVG, pathLength 1, dashoffset ← progress) ·
 *                THE STAR (§9.1) on the active tick, one rung per chapter, --ease-tide .9 s, shown after mtf:ready ·
 *                S · U · N hollow beside ticks 02/05/09, filled gold on `mtf:glyph` { letter }, tooltips with the
 *                pillar questions, and on `mtf:sunrise` { p } (p .1 → .35) they fly to world.sunNdc and go.
 *   #corners     bottom-left: crosshair + chapter label · bottom-right: `01 / 14` · SCROLL (→ CANTO I … CODA · FINALE
 *                after the first scroll) with a breathing rule · THE CLOCK (clock.ts).
 *
 * "Current chapter" is computed exactly as Stage.computeMood does (films: the pinned travel contains scrollY;
 * otherwise the viewport centre), so the rail, the clock and the world always agree. Updates on scroll.onScroll
 * and on ScrollTrigger refresh. Hidden under html.is-black / html.nav-open (CSS); collapsed < 820 px (CSS).
 */

type Question = { letter: string; text: string }
interface RailArgs { stage: Stage; scroll: ScrollEngine; world: World | null; chapters: Chapter[]; content: any }

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV']
const pad2 = (n: number) => String(n).padStart(2, '0')
const GLYPH_CHAPTERS: Record<string, string> = { S: 'warning', U: 'unity', N: 'forever' }
const GLYPH_FALLBACK_TICK: Record<string, number> = { S: 1, U: 4, N: 8 }
const FLY_FROM = 0.1, FLY_TO = 0.35

/** The canto numeral for the bottom-right corner — hero Overture, 02 → I … 12 → XI, 13 Coda, 14 Finale. */
function cantoOf(i: number, n: number): string {
  if (i <= 0) return 'OVERTURE'
  if (i === n - 1) return 'FINALE'
  if (i === n - 2) return 'CODA'
  return `CANTO ${ROMAN[i] ?? String(i)}`
}

/** The pillar questions (content.json theme.questions; falls back to theme.pillars[].question). Never invented. */
function questionsOf(content: any): Question[] {
  const q = content?.theme?.questions
  if (Array.isArray(q) && q.length) return q.map((x: any) => ({ letter: String(x.letter ?? ''), text: String(x.text ?? x.sentenceCase ?? '') }))
  const pillars = content?.theme?.pillars
  if (Array.isArray(pillars)) return pillars.map((x: any) => ({ letter: String(x.letter ?? ''), text: String(x.question ?? '') }))
  return []
}

/** Two gold strands braided around the line (a guilloche): sampled sine waves, one crossing per tick. */
function guillochePath(height: number, ticks: number, phase: 1 | -1): string {
  const cx = 6, amp = 3.6
  const lambda = Math.max(8, height / Math.max(1, ticks - 1))
  const step = 2
  let d = ''
  for (let y = 0; y <= height + 0.001; y += step) {
    const x = cx + phase * amp * Math.sin((y / lambda) * Math.PI * 2)
    d += `${y === 0 ? 'M' : 'L'}${x.toFixed(2)} ${Math.min(y, height).toFixed(2)}`
  }
  return d
}

/** The hollow letter — Fraunces 300, 14 px, stroked; a halo circle behind it for the shine. */
function glyphSvg(letter: string): string {
  return `<svg class="rail__glyph" viewBox="-7 -7 14 14" width="14" height="14" aria-hidden="true" overflow="visible"><circle class="rail__halo" r="11" fill="url(#railGlyphHalo)"/><text x="0" y="5" text-anchor="middle">${letter}</text></svg>`
}

export function initRail({ stage, scroll, world, chapters, content }: RailArgs) {
  const rail = document.querySelector('aside.rail') as HTMLElement | null
  const corners = document.getElementById('corners')
  if (!rail || !corners) return
  const html = document.documentElement
  const n = Math.max(2, chapters.length)
  const yPct = (i: number) => (i / (n - 1)) * 100
  const questions = questionsOf(content)
  const questionFor = (letter: string) => questions.find(q => q.letter === letter)?.text ?? ''
  const tickOf = (letter: string) => { const i = chapters.findIndex(c => c.id === GLYPH_CHAPTERS[letter]); return i >= 0 ? i : (GLYPH_FALLBACK_TICK[letter] ?? 0) }

  // ── DOM ─────────────────────────────────────────────────────────────────────────────
  rail.classList.add('rail')
  rail.innerHTML = [
    `<svg class="rail__defs" width="0" height="0" aria-hidden="true" style="position:absolute"><defs><radialGradient id="railGlyphHalo"><stop offset="0" stop-color="#F1C86A" stop-opacity=".55"/><stop offset=".45" stop-color="#F1C86A" stop-opacity=".16"/><stop offset="1" stop-color="#F1C86A" stop-opacity="0"/></radialGradient></defs></svg>`,
    `<i class="rail__hit"></i>`,
    `<i class="rail__line"></i>`,
    `<i class="rail__bar"></i>`,
    `<svg class="rail__strand" viewBox="0 0 12 100" preserveAspectRatio="none" aria-hidden="true"><path class="strand--a" pathLength="1" d=""/><path class="strand--b" pathLength="1" d=""/></svg>`,
    ...chapters.map((c, i) => `<span class="rail__tick" data-i="${i}" style="top:${yPct(i).toFixed(3)}%"><span class="rail__label index">${pad2(i + 1)} · ${(c.label ?? c.id).toUpperCase()}</span></span>`),
    ...(['S', 'U', 'N'] as const).map(l => `<span class="rail__g" data-letter="${l}" style="top:${yPct(tickOf(l)).toFixed(3)}%">${glyphSvg(l)}<span class="rail__tip index"><b>${l}</b>${questionFor(l)}</span></span>`),
    `<span class="rail__star" style="top:0%">${star(12)}</span>`,
  ].join('')

  corners.classList.add('corners')
  corners.innerHTML =
    `<div class="corners__wrap">` +
    `<div class="corner corner--bl"><span class="cross"></span><span class="index corner__label">${(chapters[0]?.label ?? '').toUpperCase()}</span></div>` +
    `<div class="corner corner--br">` +
      `<span class="index corner__count"><span class="corner__what">CH</span>01 / ${pad2(chapters.length)}</span>` +
      `<span class="corner__scroll"><i class="corner__pulse"></i><span class="index corner__canto">SCROLL</span></span>` +
      `<span class="index tnum corner__clock">16:56 · SUNSET</span>` +
    `</div>` +
    `</div>`

  const ticks = Array.from(rail.querySelectorAll<HTMLElement>('.rail__tick'))
  const glyphs = Array.from(rail.querySelectorAll<HTMLElement>('.rail__g'))
  const starEl = rail.querySelector('.rail__star') as HTMLElement
  const strandSvg = rail.querySelector('.rail__strand') as SVGSVGElement
  const strandA = rail.querySelector('.strand--a') as SVGPathElement
  const strandB = rail.querySelector('.strand--b') as SVGPathElement
  const wrap = corners.querySelector('.corners__wrap') as HTMLElement
  const labelEl = corners.querySelector('.corner__label') as HTMLElement
  const countEl = corners.querySelector('.corner__count') as HTMLElement
  const cantoEl = corners.querySelector('.corner__canto') as HTMLElement
  const clock = createClock(corners.querySelector('.corner__clock') as HTMLElement)

  // ── text swaps (fade out .16 s, swap, fade in) ───────────────────────────────────────
  const swapTimers = new WeakMap<HTMLElement, number>()
  const setText = (el: HTMLElement, text: string, fade = true) => {
    if (el.textContent === text) return
    if (!fade) { el.textContent = text; return }
    const t = swapTimers.get(el); if (t) clearTimeout(t)
    el.classList.add('is-swap')
    swapTimers.set(el, window.setTimeout(() => { el.textContent = text; el.classList.remove('is-swap') }, 170))
  }

  // ── the strand geometry (rebuilt on resize / refresh) ────────────────────────────────
  const buildStrand = () => {
    const h = Math.max(10, rail.clientHeight || innerHeight * 0.52)
    strandSvg.setAttribute('viewBox', `0 0 12 ${h.toFixed(1)}`)
    strandA.setAttribute('d', guillochePath(h, n, 1))
    strandB.setAttribute('d', guillochePath(h, n, -1))
  }
  buildStrand()

  // ── where are we? (identical to Stage.computeMood) ───────────────────────────────────
  const current = () => {
    const list = stage.mounted
    if (!list.length) return { i: 0, p: 0 }
    const y = scroll.y, vh = innerHeight, centre = y + vh * 0.5
    let i = list.findIndex(m => m.film ? (y >= m.top && y < m.top + m.height - vh) : (centre >= m.top && centre < m.top + m.height))
    if (i < 0) i = list.findIndex(m => centre >= m.top && centre < m.top + m.height)
    if (i < 0) i = centre < list[0].top ? 0 : list.length - 1
    return { i, p: stage.progressOf(list[i], y, vh) }
  }

  // ── S · U · N ────────────────────────────────────────────────────────────────────────
  const glyphOf = (letter: string) => glyphs.find(g => g.dataset.letter === letter) ?? null
  const shine = (g: HTMLElement) => {
    g.classList.remove('is-shining'); void g.offsetWidth; g.classList.add('is-shining')
    g.addEventListener('animationend', () => g.classList.remove('is-shining'), { once: true })
  }
  const fill = (letter: string, withShine = true) => {
    const g = glyphOf(letter); if (!g || g.classList.contains('is-filled')) return
    g.classList.add('is-filled')
    if (!withShine) return
    window.setTimeout(() => {
      shine(g)
      // N completes the word: the three shine together for one beat (§6.9)
      if (letter === 'N') glyphs.forEach(o => { if (o !== g && o.classList.contains('is-filled')) shine(o) })
    }, 430)
  }
  const hollow = (letter: string) => glyphOf(letter)?.classList.remove('is-filled')
  document.addEventListener('mtf:glyph', e => {
    const letter = String((e as CustomEvent<{ letter?: string }>).detail?.letter ?? '').toUpperCase()
    if (letter === 'S' || letter === 'U' || letter === 'N') fill(letter)
  })

  // ── sunrise: the three glyphs leave the rail for the sun (FLIP to fixed px), then hide ──
  let flyP = 0, flying = false
  const rest = new Map<HTMLElement, { x: number; y: number }>()
  const sunPx = () => {
    if (world) return { x: (world.sunNdc.x * 0.5 + 0.5) * innerWidth, y: (1 - (world.sunNdc.y * 0.5 + 0.5)) * innerHeight }
    const hz = parseFloat(html.style.getPropertyValue('--horizon-now')) || 62
    return { x: innerWidth * 0.5, y: innerHeight * (hz / 100) }
  }
  const measureRest = () => {
    for (const g of glyphs) {
      const hadT = g.style.transform; g.style.transform = ''
      const r = g.getBoundingClientRect()
      rest.set(g, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
      g.style.transform = hadT
    }
  }
  const applyFlight = () => {
    const t = clamp((flyP - FLY_FROM) / (FLY_TO - FLY_FROM))
    if (t <= 0) {
      if (flying) { flying = false; for (const g of glyphs) { g.classList.remove('is-flying', 'is-gone'); g.style.transform = ''; g.style.opacity = '' } }
      return
    }
    if (!flying) { flying = true; measureRest(); glyphs.forEach(g => g.classList.add('is-flying')) }
    const e = 1 - Math.pow(1 - t, 3)                 // tide-like ease
    const s = sunPx()
    glyphs.forEach((g, k) => {
      const r = rest.get(g); if (!r) return
      const lag = clamp(e * 1.15 - k * 0.075)         // S leads, U and N follow a beat behind
      const dx = (s.x - r.x) * lag, dy = (s.y - r.y) * lag
      g.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${(1 + lag * 0.9).toFixed(3)})`
      g.style.opacity = String(1 - clamp((lag - 0.72) / 0.28))
      g.classList.toggle('is-gone', t >= 1)
    })
  }
  document.addEventListener('mtf:sunrise', e => { flyP = Number((e as CustomEvent<{ p?: number }>).detail?.p ?? 0) || 0; applyFlight() })
  // while in flight, keep the glyphs glued to the (damped) sun every frame
  gsap.ticker.add(() => { if (flying) applyFlight() })

  // ── the update ───────────────────────────────────────────────────────────────────────
  let last = -1, scrolled = false, labelTimer = 0
  const LABEL_HOLD = 3000   // the active label enters on change, holds, then leaves the headline column clear
  const update = () => {
    const { i, p } = current()
    const id = chapters[i]?.id ?? ''
    // continuous progress down the rail: the strand reaches the next tick as the chapter ends
    const prog = clamp((i + p) / (n - 1))
    const off = (1 - prog).toFixed(4)
    strandA.style.strokeDashoffset = off; strandB.style.strokeDashoffset = off
    rail.style.setProperty('--rail-p', prog.toFixed(4))
    if (!scrolled && scroll.y > 2) { scrolled = true; wrap.classList.add('is-scrolled') }
    // the clock is a function of (chapter, p); it ticks on every scroll
    clock.update(id, p)
    if (i !== last) {
      last = i
      ticks.forEach((t, k) => { t.classList.toggle('is-active', k === i); t.classList.toggle('is-past', k < i); t.classList.toggle('is-shown', k === i) })
      clearTimeout(labelTimer)
      labelTimer = window.setTimeout(() => ticks[i]?.classList.remove('is-shown'), LABEL_HOLD)
      starEl.style.top = `${yPct(i).toFixed(3)}%`
      setText(labelEl, (chapters[i]?.label ?? '').toUpperCase())
      setText(countEl, `${pad2(i + 1)} / ${pad2(chapters.length)}`)
      // glyph self-healing: the chapter owns the trigger, but a deep link or a chapter still being built must not
      // leave the word wrong — filled once its chapter is behind us, hollow again if we scroll back before it
      for (const l of ['S', 'U', 'N']) { const k = tickOf(l); if (i > k) fill(l, false); else if (i < k) hollow(l) }
    }
    if (scrolled) setText(cantoEl, cantoOf(i, n))
  }

  scroll.onScroll(update)
  ScrollTrigger.addEventListener('refresh', () => { buildStrand(); if (flying) measureRest(); last = -1; update() })
  window.addEventListener('resize', () => { buildStrand(); if (flying) measureRest() }, { passive: true })

  // the preloader lights the first nine ticks one per night; the rail's star appears only after mtf:ready
  document.addEventListener('mtf:night', e => {
    const night = Number((e as CustomEvent<{ night?: number }>).detail?.night ?? 0) || 0
    ticks.forEach((t, k) => t.classList.toggle('is-lit', k < night))
  })
  document.addEventListener('mtf:ready', () => {
    rail.classList.add('is-lit')
    window.setTimeout(() => ticks.forEach(t => t.classList.remove('is-lit')), 600)
    last = -1; update()
  }, { once: true })

  // dev harness (this file only): ?rail=glyph:S | ?rail=sunrise:.25 — dispatches the events the chapters own
  const q = new URLSearchParams(location.search).get('rail')
  if (q) {
    const [kind, v] = q.split(':')
    window.setTimeout(() => {
      if (kind === 'glyph') document.dispatchEvent(new CustomEvent('mtf:glyph', { detail: { letter: (v ?? 'S').toUpperCase() } }))
      if (kind === 'sunrise') document.dispatchEvent(new CustomEvent('mtf:sunrise', { detail: { p: parseFloat(v ?? '0.25') } }))
    }, 900)
  }

  update()
}
