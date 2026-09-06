import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { disc, write, clear } from '../../art/disc'
import './style.css'

/**
 * Chapter 06 — PARADISE · Canto V · Three Days · the clock stops · DESIGN-BIBLE §6.6
 * The single daylight chapter. Everything inverts to paper; the sun crosses the sky three times and each
 * sunrise brings one day-column of the programme. `theme-paper` on <html> while the film is active.
 * Beats (p): inversion .06–.18 · head .06–.17 · storyteller stanzas .155–.34 · DAY 01 .378 · DAY 02 .538
 *            DAY 03 .698 · closing stack .800–.862 · sign-off .818 · exit .876–.900; the third sunset keeps going.
 */

/* ─── keyframe helpers (piecewise-linear between the §6.6 anchors) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) { const [p0, v0] = k[i - 1]; return v0 + (k[i][1] - v0) * ((p - p0) / (k[i][0] - p0)) }
  }
  return k[k.length - 1][1]
}
const kfRGB = (p: number, k: [number, RGB][]): RGB => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) {
      const a = k[i - 1][1], b = k[i][1], t = (p - k[i - 1][0]) / (k[i][0] - k[i - 1][0])
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
    }
  }
  return k[k.length - 1][1]
}

/** The island stands on the horizon, on the camera's heading (camX 2, yaw .1). Chapter 05 leaves it near (window at
 *  2.4, −9.4, scale 1); the seam carries it out here at the same apparent size (scale ≈ distance ÷ 11.6), so it
 *  recedes to the horizon rather than jumping, and the paper world turns its stone to sand. */
const ISLE: [number, number, number] = [-7.6, -1.2, -52.7]   // the window; the body runs east, so the stone is centred on the heading
const ISLE_SCALE = 2.6

/* ─── §6.6 mood table. The inversion runs over 12% of scroll (.06 → .18); the table's .2 state holds to .8 ─── */
const IN0 = .06, IN1 = .18
const SKY_TOP: [number, RGB][] = [[IN0, hex('#124A66')], [IN1, hex('#A9CBDD')], [.8, hex('#A9CBDD')], [1, hex('#7FA9C2')]]
const SKY_BOT: [number, RGB][] = [[IN0, hex('#2B8FA3')], [IN1, hex('#F3EEE3')], [.8, hex('#F3EEE3')], [1, hex('#E8DCC2')]]
const SEA_COL: [number, RGB][] = [[IN0, hex('#0E3D57')], [IN1, hex('#D6C39C')], [.8, hex('#D6C39C')], [1, hex('#B9A77E')]]
const K = {
  camY: [[0, 1.4], [.2, 1.8], [.34, 2.4]] as KF,
  camTilt: [[0, -.06], [.2, -.04]] as KF,
  sunGlow: [[0, .6], [.2, 1], [.8, 1], [1, .8]] as KF,
  haze: [[0, .3], [.2, .4], [.8, .4], [1, .35]] as KF,
  seaAmp: [[0, .12], [.2, .08], [.8, .08], [1, .1]] as KF,
  tessGold: [[0, .6], [.2, .2], [.8, .2], [1, .3]] as KF,
  tessGlint: [[0, .7], [.2, .4]] as KF,
  stars: [[0, .3], [IN1, 0]] as KF,
  grain: [[0, .06], [.2, .03], [.8, .03], [1, .04]] as KF,
  warmth: [[0, .45], [.2, 1], [.8, 1], [1, .85]] as KF,
  bloom: [[0, .5], [.2, .4], [.8, .4], [1, .45]] as KF,
}
/** Three daylight passes. The arcs are placed so each day's column arrives on a CLIMBING sun (t ≈ .21–.39),
 *  and so the low limbs sit clear of the left type column: the sun rises between the storyteller and the
 *  programme slab, crowns it at noon, and sets past its right edge. Dawn 0 is held below the frame. */
const SUN_X0 = -1.4, SUN_X1 = 5.6
const ARCS: [number, number][] = [[.30, .50], [.50, .66], [.66, .84]]
const sunAt = (p: number): [number, number] => {
  if (p < ARCS[0][0]) return [SUN_X0, kf(p, [[0, -2.6], [ARCS[0][0], -.6]])]
  if (p >= ARCS[2][1]) return [SUN_X1, -.6]
  const a = ARCS.find(([s, e]) => p >= s && p < e) as [number, number]
  const t = (p - a[0]) / (a[1] - a[0])
  return [SUN_X0 + (SUN_X1 - SUN_X0) * t, -.6 + (mobile ? 5.8 : 4.2) * Math.sin(Math.PI * t)]
}
/** Reduced motion: the chapter as one still (§5.3) — high noon on paper. */
const STILL: Partial<Mood> = {
  camX: 2, camY: 2.4, camZ: 2, camTilt: -.04, camYaw: .1, fov: 34,
  skyTop: hex('#7FA9C2'), skyBottom: hex('#E8DCC2'), haze: .35,
  sunX: 2.1, sunY: 2.8, sunRadius: .5, sunGlow: .8, sunHeat: 1, sunVisible: 1,
  seaColor: hex('#B9A77E'), seaAmp: .1, stars: 0, tess: 1, tessForm: 1, tessGold: .3, tessGlint: .4,
  island: 1, islandX: ISLE[0], islandY: ISLE[1], islandZ: ISLE[2], islandScale: ISLE_SCALE, islandYaw: .35, islandTone: 1,
  veil: 1, p4: 0, grain: .04, warmth: .85, bloom: .45,
}

/* ─── copy (bible-final; programme facts from content.json) ─── */
const HEADLINE = 'Stay today.'
const STORY_I = ['And then… they were happy.', 'Do not rush past that.', 'Morning over Ramla.', 'Red earth.', 'Thyme upon the wind.', 'Olive leaves turning silver.', 'Salt.', 'Wine.', 'Music.', 'The Mediterranean.']
const BETWEEN = ['Stay today.', 'Tomorrow came.', 'Stay today.', 'Again.', 'And again.']
const CLOSE = ['Calypso was happy.', 'The island that had always been paradise…', 'was no longer lonely.']
const LAST = 'And time passed.'
const NOTE = 'Times and venues to be announced.'          // Appendix C — programme times are TBC
const CTA = 'Full programme'                               // satellite /programme is TBC → #ch-eleven for now

/** The storyteller as stanzas, not a strobe of single lines: [p, line indices into ALL]. One substantive
 *  beat per ≈ 3.7% of p, and never more than WIN stanzas on screen at once. */
const ALL = [...STORY_I, ...BETWEEN, ...CLOSE, LAST]
const STANZAS: [number, number[]][] = [
  [.155, [0]], [.192, [1]], [.229, [2, 3]], [.266, [4, 5]], [.303, [6, 7, 8]], [.340, [9]],
  [.500, [10, 11]], [.660, [12, 13]], [.800, [14, 15]], [.833, [16, 17]], [.862, [18]],
]
const DAY_AT = [.378, .538, .698]
const FOOT_AT = .818, EXIT_AT = .876

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
const pad = (n: number) => String(n).padStart(2, '0')

interface DayItem { title: string; subtitle?: string }
interface Day { label: string; display: string; date: string; keywordsLine: string; followedBy?: string; items: DayItem[] }

function dayHTML(d: Day, i: number, size: number): string {
  const head = `${esc(d.label)} — ${esc(d.display).toUpperCase()}`
  const li = (it: DayItem, n: number) => `<li><span class="day__i tnum">${pad(n)}</span><span class="day__t">${esc(it.title)}${it.subtitle ? ` <span class="day__st">— ${esc(it.subtitle)}</span>` : ''}</span></li>`
  let items: string
  if (d.followedBy) {
    // DAY 03: the plenary, then the four specialist events as an indented sub-list
    items = `<ol class="day__items">${li(d.items[0], 1)}</ol>
      <p class="day__fb">${esc(d.followedBy)}</p>
      <ol class="day__items day__sub">${d.items.slice(1).map((it, n) => li(it, n + 1)).join('')}</ol>
      <a class="link link--mono day__four" href="#ch-rudder"><span class="btn__arrow">→</span> The four</a>`
  } else {
    items = `<ol class="day__items">${d.items.map((it, n) => li(it, n + 1)).join('')}</ol>`
  }
  return `<article class="day" data-day="${i + 1}">
    <div class="day__top">
      <div class="day__disc" aria-hidden="true">${disc({ size })}</div>
      <p class="label day__head"><time datetime="${esc(d.date)}">${head}</time></p>
    </div>
    ${items}
    <div class="day__foot"><span class="day__rule" aria-hidden="true"></span><p class="label day__sum">${esc(d.keywordsLine)}</p></div>
  </article>`
}

function frameHTML(c: any, mob: boolean): string {
  const prog = c.programme
  const days = prog.days as Day[]
  const heading = String(prog.heading).replace(/\.\s*/g, ' · ').replace(/\s·\s*$/, '')       // THREE DAYS · ONE ECOSYSTEM
  const nums = days.map(d => d.date.slice(8)).join(' · ')                                        // 25 · 26 · 27
  const month = new Date(days[0].date + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase()
  const eyebrow = `06 — ${heading}`, dates = `${nums} ${month}`
  return `
    <div class="head">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span><span class="eye__d">${dates}</span></p>
      <h2 class="display hl"><span class="hl__m"><span class="hl__in">${HEADLINE}</span></span></h2>
    </div>
    <div class="stack" aria-label="The Storyteller">${ALL.map(l => `<p class="s">${esc(l)}</p>`).join('')}</div>
    <div class="days" aria-label="Programme">${days.map((d, i) => dayHTML(d, i, mob ? 44 : 52)).join('')}</div>
    <div class="foot">
      <p class="fine note">${NOTE}</p>
      <a class="btn btn--sky cta" href="#ch-eleven"><span class="flood" aria-hidden="true"></span><span>${CTA}</span><span class="btn__arrow" aria-hidden="true">→</span></a>
    </div>`
}

/* ─── chapter state ─── */
let reduced = false, mobile = false
let active = false, paper = false
let filmP = () => 0   // the film ScrollTrigger's progress (set in mount)
const PAPER_AT = .1   // the DOM inverts once the sky is mostly paper (inversion .06–.18); the world leads, the chrome follows
const PAPER_OFF = .93 // …and turns back at the seam's midpoint, where the blend into 07's night is half done
const setPaper = (on: boolean) => { if (on !== paper) { paper = on; document.documentElement.classList.toggle('theme-paper', on) } }

export const paradise: Chapter = {
  id: 'paradise',
  label: 'Paradise',
  navIndex: '02', inNav: true,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    mobile = shared.mobile
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content, mobile)}</div>`
      return
    }
    const { pin, tl, st } = createFilm(ctx, { length: mobile ? 3 : 4.5 })
    filmP = () => st.progress
    pin.innerHTML = `<div class="pin__frame">${frameHTML(content, mobile)}</div>`

    const q = <T extends Element = HTMLElement>(s: string) => pin.querySelector(s) as T
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(pin.querySelectorAll(s)) as T[]
    const head = q('.head'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hlIn = q('.hl__in')
    const stack = q('.stack'), lines = qa('.stack .s'), daysEl = q('.days'), days = qa('.day'), foot = q('.foot')
    const discs = qa<SVGElement>('.day__disc svg'), rules = qa('.day__rule'), sums = qa('.day__sum')
    const WIN = mobile ? 2 : 3          // stanzas held on screen

    /* head sequence: rule → eyebrow → headline (line mask) · the island rises on the horizon as the sky turns to paper (mood) */
    tl.fromTo([head, stack], { opacity: 0 }, { opacity: 1, duration: .01 }, .06)
    tl.fromTo(eyeRule, { scaleX: 0 }, { scaleX: 1, duration: .035 }, .06)
      .fromTo(eyeT, { opacity: 0 }, { opacity: 1, duration: .028 }, .088)
      .fromTo(hlIn, { yPercent: 110 }, { yPercent: 0, duration: .055 }, .115)

    /* the storyteller: one stanza per beat, 6 px rise; the previous stanza goes faint, the WIN-th back collapses */
    STANZAS.forEach(([at, idx], k) => {
      idx.forEach((i, j) => tl.fromTo(lines[i], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .02 }, at + j * .007))
      if (k > 0) STANZAS[k - 1][1].forEach(i => tl.to(lines[i], { '--pd-old': 1, duration: .02 }, at))
      if (k >= WIN) STANZAS[k - WIN][1].forEach(i => {          // fade out first, then close the gap — never a squashed remnant
        tl.to(lines[i], { opacity: 0, duration: .009 }, at - .024)
        tl.to(lines[i], { height: 0, marginBottom: 0, duration: .013 }, at - .015)
      })
    })

    /* three sunrises: a column settles up from the water, its Disc writes the day, flips back; rule → summary */
    const flip = (svg: SVGElement, text: string, at: number) => {
      tl.to({ v: 0 }, { v: 1, duration: .004, onStart: () => write(svg, text), onReverseComplete: () => clear(svg) }, at)
      tl.to({ v: 0 }, { v: 1, duration: .004, onStart: () => clear(svg), onReverseComplete: () => write(svg, text) }, at + .07)
    }
    const dayNums = (content.programme.days as Day[]).map(d => d.date.slice(8))
    DAY_AT.forEach((at, i) => {
      // the stone face arrives solid, then finishes sliding — a column is never ghost type on open water
      tl.fromTo(days[i], { opacity: 0 }, { opacity: 1, duration: .018 }, at)
      tl.fromTo(days[i], { y: 44 }, { y: 0, duration: .06 }, at)
      if (mobile && i > 0) tl.to(days[i - 1], { opacity: 0, y: -10, duration: .03 }, at - .03)   // one column at a time on portrait
      flip(discs[i], dayNums[i], at + .028)
      tl.fromTo(rules[i], { scaleX: 0 }, { scaleX: 1, duration: .03 }, at + .055)
      tl.fromTo(sums[i], { opacity: 0 }, { opacity: 1, duration: .022 }, at + .068)
    })
    // portrait: the last column steps aside so the closing stack and the sign-off own the frame
    if (mobile) tl.to(days[2], { opacity: 0, y: -10, duration: .03 }, .782)

    /* the honesty line + FULL PROGRAMME → · then the whole frame exits by .90 (seam rule); the sun does not stop */
    tl.fromTo(foot, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .04 }, FOOT_AT)
    tl.to([head, stack, daysEl, foot], { opacity: 0, y: -8, duration: .024 }, EXIT_AT)
  },

  onEnter() { active = true; setPaper(reduced || filmP() >= PAPER_AT) },
  onLeave() { active = false; setPaper(false) },            // both directions — Ch 07 is dark from its p 0
  // the chrome inverts with the light: on once the sky is mostly paper, off again as the seam takes the world to night
  onProgress(p) { if (active && !reduced) setPaper(p >= PAPER_AT && p < PAPER_OFF) },

  mood: (p: number) => {
    if (reduced) return STILL
    const [sunX, sunY] = sunAt(p)
    return {
      camX: 2, camY: kf(p, K.camY), camZ: 2, camTilt: kf(p, K.camTilt), camYaw: .1, fov: 34,
      skyTop: kfRGB(p, SKY_TOP), skyBottom: kfRGB(p, SKY_BOT), haze: kf(p, K.haze),
      sunX, sunY, sunRadius: .5, sunGlow: kf(p, K.sunGlow), sunHeat: 1, sunVisible: 1,
      seaColor: kfRGB(p, SEA_COL), seaAmp: kf(p, K.seaAmp),
      stars: kf(p, K.stars), tess: 1, tessForm: 1, tessGold: kf(p, K.tessGold), tessGlint: kf(p, K.tessGlint),
      island: 1, islandX: ISLE[0], islandY: ISLE[1], islandZ: ISLE[2], islandScale: ISLE_SCALE, islandYaw: .35, islandTone: kf(p, [[IN0, 0], [IN1, 1]]),
      veil: 1, p4: 0,
      grain: kf(p, K.grain), warmth: kf(p, K.warmth), bloom: kf(p, K.bloom),
    }
  },
}
