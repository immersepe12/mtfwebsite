import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { island } from '../../art/island'
import './style.css'

/**
 * Chapter 07 — SEVEN YEARS, ELEVEN EDITIONS · Canto VI · 11 for 11 · 01:00 → 04:00 · DESIGN-BIBLE §6.7
 * The stillest chapter: the camera is locked, the sky time-lapses (5¾ day/night cycles, accelerating then
 * decelerating, settling on deep night at p .7), a small distant island flickers paper ↔ ink with it on the
 * horizon, and the eleven think tanks assemble as DOM tesserae. The numeral 11 drifts opsz 144 → 60.
 * Beats (p), re-spaced for the longer film (src/engine/pacing.ts × 1.5): head .06–.11 · storyteller I .17/.21/.25/.29 ·
 * forum .34–.44 · sectors .35 · the eleven tiles .41–.64 · the wall dims and ages .64 ·
 * storyteller II .67/.70/.73/.76/.79 · JOIN A THINK TANK .83 · exit .865–.895 · veil 1 → 1.6 from .86.
 * Placement (§4.2): head + storyteller own the left column, the Forum the right column, the tile wall the lower band —
 * three regions that never touch, and a day-reactive graded wash keeps every one of them legible under the noon sky.
 */

/* ─── keyframe helpers (piecewise-linear between anchors) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) { const [p0, v0] = k[i - 1]; return v0 + (k[i][1] - v0) * ((p - p0) / (k[i][0] - p0)) }
  }
  return k[k.length - 1][1]
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const smooth = (t: number) => { const x = Math.min(1, Math.max(0, t)); return x * x * (3 - 2 * x) }

/* ─── the day/night cycle. c(p) = phase; 5¾ cycles over p 0–.7 (smoothstep: accelerates, then decelerates
       to a stop) so c(.7) ≡ 3π/2 = deep night, held to p 1. day(p) = max(0, sin c). ─── */
// Time passing, not a strobe: two and a half unhurried days, decelerating into the last night.
const CYCLE_END = .7, CYCLES = 2.5
const phase = (p: number) => Math.PI * 2 * CYCLES * smooth(p / CYCLE_END)
/** smoothstep on an arbitrary edge pair — used so the sun dissolves through the horizon rather than switching off */
const smooth01 = (x: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const dayOf = (p: number) => Math.max(0, Math.sin(phase(p)))

/* colours of the cycle (§6.7) */
// Days passing over the same sea — but the daylight peak stays a Mediterranean day, not a white-out: at full
// noon the frame kept no contrast and the type, the tiles and the island all washed to milk (client review).
const NIGHT_TOP = hex('#090D16'), DAY_TOP = hex('#6E97B4')
const NIGHT_BOT = hex('#06192B'), DAY_BOT = hex('#C9B48C')
const NIGHT_SEA = hex('#0E3D57'), DAY_SEA = hex('#7C8F86')
/** The camera sits at camX 2 (camYaw 0), so the sun's sweep is centred on x = 2: it rises at the right frame edge and sets at the left. */
// The sun is a celestial body, not a lamp on a string: it sits far away and travels a wide, shallow arc from
// one horizon to the other. A near sun on a small circle reads as a glitch, however slowly it moves.
const SUN_CX = 2, SUN_R = 26, SUN_Z = -55, SUN_H = 9, SUN_BASE = -1.4

/** Reduced motion: the chapter's end state as a still (§5.3) — deep night, veil 1.6, the mosaic on the water. */
const STILL: Partial<Mood> = {
  camX: 2, camY: 2, camZ: 2, camTilt: -.06, camYaw: 0, fov: 34,
  skyTop: NIGHT_TOP, skyBottom: NIGHT_BOT, haze: .12,
  sunX: SUN_CX, sunY: -.6, sunRadius: .5, sunGlow: .8, sunHeat: 1, sunVisible: 0,
  seaColor: NIGHT_SEA, seaAmp: .1, seaSpeed: .4, stars: 1, constellation: 2,
  tess: 1, tessForm: 1, tessSpread: 1, tessGold: .3, tessGlint: .2,
  veil: 1.6, p4: 0, grain: .05, warmth: .35, bloom: .5,
}

/* ─── copy (storyteller lines are bible-final; every Forum fact comes from content.json → thinkTanks) ─── */
const STORY_I = ['At first they counted the days.', 'Then the months.', 'Then…', 'they stopped counting.']
const STORY_II = ['Life never announces:', 'Remember this moment.', 'It simply happens.', 'And only later do we understand:', 'THAT WAS OUR LIFE.']
const CTA = 'Join a think tank'
const MAILTO = 'mailto:forum@medtourismfoundation.com?subject=11%20for%2011%20%E2%80%94%20MTF11'   // route TBC (Appendix C)
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']                  // editions, never years

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
const val = (x: unknown): string => (x && typeof x === 'object' && 'value' in (x as object)) ? String((x as { value: unknown }).value) : String(x ?? '')
/** "11TH EDITION.  11 THINK TANKS.  ONE MEDITERRANEAN." → sentence case; both numerals wrapped for the opsz drift */
const sentenceCase = (s: string) => s.trim().split(/\.\s*/).filter(Boolean)
  .map(t => t.toLowerCase().replace(/^./, c => c.toUpperCase()).replace(/\bmediterranean\b/gi, 'Mediterranean') + '.').join(' ')
const wrapNumerals = (s: string) => esc(s).replace(/\b11(?=th\b|\b)/g, '<span class="opsz">11</span>')
const longDate = (iso: string) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', timeZone: 'UTC' }).toUpperCase()

interface Group { id: string; name: string; numbers: string[] }
interface Item { number: string; id: string; title: string; subtitle: string; description: string; keywords: string[]; closingLine: string | null; closingLine2?: string; closingLineFromSpecialistEvent?: string; group: string }

function frameHTML(c: any, mobile: boolean): string {
  const tt = c.thinkTanks
  const groups = tt.groups as Group[], items = tt.items as Item[]
  const name = val(tt.name).replace(/^11\s+/, '')                                              // "MTF BRAIN THINK TANKS"
  const eyebrow = `07 — ${esc(val(tt.heading))} · ${esc(name)} · ${longDate(val(tt.date))}`
  const story = (lines: string[], off: number) => lines.map((l, i) => `<p class="s${i + off === STORY_I.length + STORY_II.length - 1 ? ' s--last' : ''}">${esc(l)}</p>`).join('')
  const outputs = (tt.outputs as string[]).map(o => `<li class="chip">${esc(o)}</li>`).join('')
  const sectors = groups.map(g => {
    const n = g.numbers
    return `<div class="sector"><i class="sector__rule" aria-hidden="true"></i><span class="index sector__i tnum">${esc(n[0])}–${esc(n[n.length - 1])}</span><span class="label sector__l">${esc(g.name)}</span></div>`
  }).join('')
  const tiles = items.map((it, i) => `<button class="tile" type="button" aria-expanded="false" aria-controls="ch-eleven-card" data-i="${i}">
      <span class="tile__top">
        <span class="tile__n tnum">${esc(it.number)}</span>
        <span class="chip tile__g">${esc(it.group)}</span>
      </span>
      <span class="tile__t">${esc(it.title)}</span>
      <span class="tile__s">${esc(it.subtitle)}</span>
    </button>`).join('')
  return `
    <i class="wash" aria-hidden="true"></i>
    <div class="head">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
      <h2 class="h1 hl">${wrapNumerals(sentenceCase(val(tt.closingLine)))}</h2>
    </div>
    <p class="stamp index tnum" aria-label="Edition"><span class="stamp__l">EDITION</span> <span class="stamp__n">XI</span></p>
    <div class="stack" aria-label="The Storyteller">${story(STORY_I, 0)}${story(STORY_II, STORY_I.length)}</div>
    <div class="forum">
      <i class="forum__rule" aria-hidden="true"></i>
      <p class="label forum__lab">${esc(val(tt.heading))}</p>
      <p class="f forum__formula">${esc(val(tt.formula))}</p>
      <p class="small forum__who">${esc(val(tt.who))}</p>
      <ul class="chip-row forum__out" aria-label="Outputs">${outputs}</ul>
      <p class="label forum__proc tnum">${esc(val(tt.process))}</p>
      <a class="link link--mono cta" href="${MAILTO}"><span>${CTA}</span><span class="btn__arrow" aria-hidden="true">→</span></a>
    </div>
    <div class="sectors" aria-label="Think-tank groups">${sectors}</div>
    <div class="tiles" role="group" aria-label="The eleven think tanks"${mobile ? ' data-lenis-prevent' : ''}>${tiles}</div>
    <div class="tile__card" id="ch-eleven-card" role="region" aria-live="polite"></div>`
}

function cardHTML(it: Item): string {
  const close = it.closingLine ?? it.closingLineFromSpecialistEvent ?? ''          // 04 MED READY uses its specialist-event line
  const kw = (it.keywords ?? []).map(k => `<li class="chip">${esc(k)}</li>`).join('')
  return `<i class="card__rule" aria-hidden="true"></i>
    <p class="index card__i tnum">${esc(it.number)} — ${esc(it.group)}</p>
    <p class="h3 card__t">${esc(it.title)}</p>
    <p class="small card__s">${esc(it.subtitle)}</p>
    <p class="small card__d">${esc(it.description)}</p>
    ${kw ? `<ul class="chip-row card__kw" aria-label="Keywords">${kw}</ul>` : ''}
    ${close ? `<p class="label card__close">${esc(close)}</p>` : ''}
    ${it.closingLine2 ? `<p class="label card__close">${esc(it.closingLine2)}</p>` : ''}`
}

/* ─── the tiles: hover / focus / tap open the card; arrow keys move focus; Esc closes ─── */
function wireTiles(root: HTMLElement, items: Item[], inPlace: boolean, cols: number) {
  const tiles = Array.from(root.querySelectorAll<HTMLButtonElement>('.tile'))
  const grid = root.querySelector('.tiles') as HTMLElement
  const card = root.querySelector('.tile__card') as HTMLElement
  let open = -1, pinned = false
  const openCard = (i: number, pin: boolean) => {
    if (open !== i) {
      if (open >= 0) tiles[open].setAttribute('aria-expanded', 'false')
      card.innerHTML = cardHTML(items[i])
      tiles[i].setAttribute('aria-expanded', 'true')
      if (inPlace) { const rowEnd = Math.min(tiles.length - 1, Math.floor(i / cols) * cols + cols - 1); tiles[rowEnd].after(card) }
      open = i
    }
    pinned = pinned || pin
    card.classList.add('is-open'); root.classList.add('has-card')
  }
  const closeCard = () => {
    if (open >= 0) tiles[open].setAttribute('aria-expanded', 'false')
    open = -1; pinned = false
    card.classList.remove('is-open'); root.classList.remove('has-card')
  }
  tiles.forEach((t, i) => {
    t.addEventListener('click', () => { if (open === i && pinned) closeCard(); else openCard(i, true) })
    t.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse' && !pinned) openCard(i, false) })
    t.addEventListener('focus', () => { if (!pinned) openCard(i, false) })
    t.addEventListener('pointermove', e => { const r = t.getBoundingClientRect(); t.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`); t.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`) })
  })
  grid.addEventListener('pointerleave', () => { if (!pinned) closeCard() })
  root.addEventListener('focusout', e => { const to = e.relatedTarget as Node | null; if (!pinned && !(to && (grid.contains(to) || card.contains(to)))) closeCard() })
  root.addEventListener('keydown', e => {
    const i = tiles.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'Escape' && open >= 0) { const back = tiles[open]; closeCard(); back.focus(); e.preventDefault(); return }
    if (i < 0) return
    const step: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }
    let n = i
    if (e.key in step) n = i + step[e.key]
    else if (e.key === 'Home') n = 0
    else if (e.key === 'End') n = tiles.length - 1
    else return
    if (n < 0 || n >= tiles.length) return
    e.preventDefault(); pinned = false; tiles[n].focus()
  })
}

/* ─── chapter state (cached at mount; no queries per frame) ─── */
let reduced = false
let pinEl: HTMLElement | null = null
let stampN: HTMLElement | null = null
let lastEdition = -1, lastDay = -1
const html = () => document.documentElement
/** The sky's clock in the DOM: the island's paper ↔ ink flicker (--day) and the On Kawara stamp —
 *  EDITION XI · X · IX … I, ticking backwards on the same decelerating curve, resting on I at p .7. */
function tick(p: number) {
  if (!pinEl) return
  const d = Math.round(dayOf(p) * 200) / 200
  if (d !== lastDay) { lastDay = d; pinEl.style.setProperty('--day', String(d)) }
  const e = p < .08 ? 10 : Math.max(0, 10 - Math.floor(smooth((p - .08) / (CYCLE_END - .08)) * 10.999))
  if (e !== lastEdition && stampN) { lastEdition = e; stampN.textContent = ROMAN[e] }
}

export const eleven: Chapter = {
  id: 'eleven',
  label: 'Seven Years, Eleven Editions',
  navIndex: '03', inNav: true,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    const mobile = shared.mobile
    const items = content.thinkTanks.items as Item[]
    const cols = mobile ? 2 : 6
    html().classList.remove('theme-paper')                      // paper is Ch 06's only; never here

    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content, false)}</div>`
      wireTiles(el, items, true, cols)
      return
    }

    const { pin, tl } = createFilm(ctx, { length: mobile ? 3 : 5 })
    pinEl = pin
    pin.style.setProperty('--sky-top-static', 'var(--press)')   // html.no-gl: the p 1 sky as tokens
    pin.style.setProperty('--sky-bottom-static', 'var(--abyss)')
    pin.innerHTML = `<div class="pin__layer shadow"><div class="isle">${island()}</div></div><div class="pin__frame">${frameHTML(content, mobile)}</div>`
    const frame = pin.querySelector('.pin__frame') as HTMLElement
    // portrait: the card is a sheet laid over the wall, not an extra grid row — an in-place row would push
    // the last tiles below the fold inside a pin that cannot scroll. (Reduced motion still expands in place.)
    wireTiles(frame, items, false, cols)

    const q = <T extends Element = HTMLElement>(s: string) => pin.querySelector(s) as T
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(pin.querySelectorAll(s)) as T[]
    const isle = q('.isle'), wash = q('.wash'), head = q('.head'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl')
    const stamp = q('.stamp'); stampN = q('.stamp__n')
    const stack = q('.stack'), lines = qa('.stack .s')
    const forum = q('.forum'), fRule = q('.forum__rule'), fLab = q('.forum__lab'), fForm = q('.forum__formula'), fWho = q('.forum__who')
    const fOut = qa('.forum__out .chip'), fProc = q('.forum__proc'), cta = q('.cta')
    const sectors = q('.sectors'), sRules = qa('.sector__rule'), sLabs = qa('.sector__i, .sector__l')
    const tilesEl = q('.tiles'), tiles = qa('.tile'), card = q('.tile__card')
    const MAX = 3                                                 // visible storyteller lines (≤ 6; the tiles need the room)

    /* head sequence: rule → eyebrow → headline lines (masked) → the date stamp; the island fades up with the first day */
    tl.fromTo(wash, { opacity: 0 }, { opacity: 1, duration: .05 }, .06)
      .fromTo(eyeRule, { scaleX: 0 }, { scaleX: 1, duration: .04 }, .06)
      .fromTo(eyeT, { opacity: 0 }, { opacity: 1, duration: .03 }, .085)
      .fromTo(stamp, { opacity: 0 }, { opacity: 1, duration: .03 }, .085)
      .fromTo(isle, { opacity: 0 }, { opacity: 1, duration: .08 }, .06)
    let headTween: gsap.core.Tween | null = null
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'line',
      onSplit: self => {
        if (headTween) tl.remove(headTween)
        headTween = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .015, ease: 'none' })
        tl.add(headTween, .11)
        tl.render(tl.time(), true, true)                          // re-split after a font load: re-render the scrubbed frame
        return headTween
      },
    })
    hl.classList.add('is-split')
    /* the numeral 11: "opsz" 144 → 60 over the hold ("they stopped counting") — one tween, one element (§2.3 allowance 3) */
    tl.fromTo(hl, { '--opsz': 144 }, { '--opsz': 60, duration: .58 }, .12)

    /* the storyteller stack: one line per beat, 4 px rise, older lines go faint, at most MAX visible */
    const line = (i: number, at: number) => {
      tl.fromTo(lines[i], { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .02 }, at)
      if (i >= 1) tl.to(lines[i - 1], { '--old': 1, duration: .02 }, at)
      if (i >= MAX) tl.to(lines[i - MAX], { opacity: 0, maxHeight: 0, marginBottom: 0, duration: .02 }, at - .02)
    }
    STORY_I.forEach((_, i) => line(i, .17 + i * .04))                       // .17 .21 .25 .29 — one line every 4% of p
    ;[.67, .70, .73, .76, .79].forEach((at, i) => line(STORY_I.length + i, at))
    /* Portrait has one column, so the storyteller and the Forum share a single voice slot: the first stack
       clears the slot at .32, the Forum body vacates it at .60, and the second stack returns at .67. Never both. */
    if (mobile) tl.to(lines.slice(0, STORY_I.length), { opacity: 0, y: -6, duration: .025 }, .32)

    /* the Forum block: rule → label → formula → who → chips → process (§5.4 rule 3) */
    tl.fromTo(fRule, { scaleX: 0 }, { scaleX: 1, duration: .04 }, .34)
      .fromTo(fLab, { opacity: 0 }, { opacity: 1, duration: .02 }, .36)
      .fromTo(fForm, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .03 }, .38)
      .fromTo(fWho, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .03 }, .40)
      .fromTo(fOut, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .02, stagger: .008 }, .42)
      .fromTo(fProc, { opacity: 0 }, { opacity: 1, duration: .02 }, .44)
    if (mobile) tl.to([fRule, fLab, fForm, fProc], { opacity: 0, duration: .025 }, .60)

    /* the four hairline sectors, then the eleven tiles assemble one at a time (settle + 14 px rise) */
    tl.fromTo(sRules, { scaleX: 0 }, { scaleX: 1, duration: .04, stagger: .01 }, .35)
      .fromTo(sLabs, { opacity: 0 }, { opacity: 1, duration: .02 }, .38)
    /* the plate arrives whole (empty sockets, hairline grout), then the eleven are set into it one at a time,
       one every 2.3% of p ≈ 850 px of scroll each at the new pace: .41 → .64. No half-built rectangle. */
    tl.fromTo(tilesEl, { '--plate': 0 }, { '--plate': 1, duration: .04 }, .38)
    tiles.forEach((t, i) => tl.fromTo(t, { '--fill': 0, '--ty': '14px' }, { '--fill': 1, '--ty': '0px', duration: .035 }, .41 + i * .023))   // `translate`, so the hover tilt (transform) survives
    /* p .64–.79: the world ages around them — the grain darkens and the wall recedes so the storyteller can be heard */
    tl.fromTo(tilesEl, { '--age': 0, '--dim': 0 }, { '--age': 1, '--dim': 1, duration: .09 }, .64)

    /* the sky's clock, driven by the scrubbed timeline itself (and by onProgress, so a jump lands right) */
    const proxy = { v: 0 }
    tl.to(proxy, { v: 1, duration: 1, onUpdate: () => tick(tl.progress()) }, 0)

    /* JOIN A THINK TANK → · then everything exits by .90 (seam rule); the veil crosses behind (mood) */
    // portrait: the wall leaves before the call to action so the one column never holds both
    if (mobile) tl.to(tilesEl, { autoAlpha: 0, y: -8, duration: .03 }, .795)
    tl.fromTo(cta, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .03 }, .83)
    tl.to([head, stamp, stack, sectors], { opacity: 0, y: -8, duration: .03 }, .865)
    tl.to([forum, tilesEl, card], { autoAlpha: 0, y: -8, duration: .03 }, .865)
    tl.to([isle, wash], { opacity: 0, duration: .03 }, .865)
  },

  onEnter() { html().classList.remove('theme-paper') },

  /** cheap: the stamp + island flicker (cached elements), and paper stays off (covers a jump straight into the chapter) */
  onProgress(p: number) {
    if (!reduced) tick(p)
    if (p > .02 && p < .9) html().classList.remove('theme-paper')
  },

  mood: (p: number) => {
    if (reduced) return STILL
    const c = phase(p), d = Math.max(0, Math.sin(c))
    return {
      camX: 2, camY: 2, camZ: 2, camTilt: -.06, camYaw: 0, fov: 34,
      skyTop: mix(NIGHT_TOP, DAY_TOP, d), skyBottom: mix(NIGHT_BOT, DAY_BOT, d), haze: .12 + .10 * d,
      // rises east (−x), crosses, sets west (+x); it fades through the horizon instead of snapping off
      sunX: SUN_CX - SUN_R * Math.cos(c), sunY: SUN_BASE + SUN_H * Math.sin(c), sunZ: SUN_Z,
      sunRadius: 2.6, sunGlow: .85, sunHeat: 1, sunVisible: smooth01(Math.sin(c), -.14, .12),
      seaColor: mix(NIGHT_SEA, DAY_SEA, d), seaAmp: kf(p, [[0, .1], [.7, .1], [1, .08]]), seaSpeed: kf(p, [[0, .5], [.7, .5], [1, .35]]),
      stars: 1 - d, constellation: kf(p, [[.7, 0], [.86, 2]]),
      tess: 1, tessForm: 1, tessSpread: 1, tessGold: kf(p, [[0, .4], [1, .3]]), tessGlint: kf(p, [[0, .5], [1, .2]]),
      veil: kf(p, [[.86, 1], [1, 1.6]]), p4: 0,
      grain: .05, warmth: .3 + .5 * d, bloom: .5 - .12 * d,
    }
  },
}
