import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { disc, write, clear } from '../../art/disc'
import { island } from '../../art/island'
import './style.css'

/**
 * Chapter 06 — PARADISE · Canto V · Three Days · the clock stops · DESIGN-BIBLE §6.6
 * The single daylight chapter. Everything inverts to paper; the sun crosses the sky three times and each
 * sunrise brings one day-column of the programme. `theme-paper` on <html> while the film is active.
 * Beats (p): inversion .06–.18 · head .06–.16 · storyteller I .12–.27 · DAY 01 .24 · DAY 02 .43 · DAY 03 .63
 *            closing stack .78–.83 · FULL PROGRAMME .80 · exit .865–.895 · third sunset keeps going.
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

/* ─── §6.6 mood table. The inversion runs over 12% of scroll (.06 → .18); the table's .2 state holds to .8 ─── */
const IN0 = .06, IN1 = .18
const SKY_TOP: [number, RGB][] = [[IN0, hex('#124A66')], [IN1, hex('#A9CBDD')], [.8, hex('#A9CBDD')], [1, hex('#7FA9C2')]]
const SKY_BOT: [number, RGB][] = [[IN0, hex('#2B8FA3')], [IN1, hex('#F3EEE3')], [.8, hex('#F3EEE3')], [1, hex('#E8DCC2')]]
const SEA_COL: [number, RGB][] = [[IN0, hex('#0E3D57')], [IN1, hex('#D6C39C')], [.8, hex('#D6C39C')], [1, hex('#B9A77E')]]
const K = {
  camY: [[0, 1.4], [.2, 1.8], [.32, 2.4]] as KF,
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
/** The camera sits at camX 2 with camYaw .1, so the view centre at the sun's depth (Δz 8) is x ≈ 2 − sin(.1)·8 ≈ 1.2.
 *  The bible's ±4 arc is centred there so each day rises at the left edge and sets at the right. */
const SUN_CX = 1.2, SUN_R = 4
const sunAt = (p: number): [number, number] => {
  if (p < .2) return [SUN_CX - SUN_R, kf(p, [[0, -1.6], [.2, -.6]])]   // held under the frame while camY is still low
  if (p >= .8) return [SUN_CX + SUN_R, -.6]
  const t = ((p - .2) / .2) % 1                       // three days, one per 20% of p
  return [SUN_CX - SUN_R + 2 * SUN_R * t, -.6 + (mobile ? 5.8 : 4) * Math.sin(Math.PI * t)]   // portrait: the noon sun clears the headline
}
/** Reduced motion: the chapter's end state as a still (§5.3). */
const STILL: Partial<Mood> = {
  camX: 2, camY: 2.4, camZ: 2, camTilt: -.04, camYaw: .1, fov: 34,
  skyTop: hex('#7FA9C2'), skyBottom: hex('#E8DCC2'), haze: .35,
  sunX: 2.2, sunY: 2.9, sunRadius: .5, sunGlow: .8, sunHeat: 1, sunVisible: 1,
  seaColor: hex('#B9A77E'), seaAmp: .1, stars: 0, tess: 1, tessForm: 1, tessGold: .3, tessGlint: .4,
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
    <div class="day__disc" aria-hidden="true">${disc({ size })}</div>
    <p class="label day__head"><time datetime="${esc(d.date)}">${head}</time></p>
    ${items}
    <div class="day__foot"><span class="day__rule" aria-hidden="true"></span><p class="label day__sum">${esc(d.keywordsLine)}</p></div>
  </article>`
}

function frameHTML(c: any, mobile: boolean): string {
  const prog = c.programme
  const days = prog.days as Day[]
  const heading = String(prog.heading).replace(/\.\s*/g, ' · ').replace(/\s·\s*$/, '')       // THREE DAYS · ONE ECOSYSTEM
  const nums = days.map(d => d.date.slice(8)).join(' · ')                                        // 25 · 26 · 27
  const month = new Date(days[0].date + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase()
  const eyebrow = `06 — ${heading}`, dates = `${nums} ${month}`
  const story = (lines: string[]) => lines.map(l => `<p class="s">${esc(l)}</p>`).join('')
  return `
    <div class="head">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span><span class="eye__d">${dates}</span></p>
      <h2 class="display hl"><span class="hl__m"><span class="hl__in">${HEADLINE}</span></span></h2>
    </div>
    <div class="stack" aria-label="The Storyteller">${story(STORY_I)}${story(BETWEEN)}${story(CLOSE)}${story([LAST])}</div>
    <div class="days" aria-label="Programme">${days.map((d, i) => dayHTML(d, i, mobile ? 48 : 64)).join('')}</div>
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
    pin.innerHTML = `<div class="pin__layer shadow"><div class="isle">${island()}</div></div><div class="pin__frame">${frameHTML(content, mobile)}</div>`

    const q = <T extends Element = HTMLElement>(s: string) => pin.querySelector(s) as T
    const qa = <T extends Element = HTMLElement>(s: string) => Array.from(pin.querySelectorAll(s)) as T[]
    const isle = q('.isle'), head = q('.head'), eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hlIn = q('.hl__in')
    const stack = q('.stack'), lines = qa('.stack .s'), daysEl = q('.days'), days = qa('.day'), foot = q('.foot')
    const discs = qa<SVGElement>('.day__disc svg'), rules = qa('.day__rule'), sums = qa('.day__sum')
    const MAX = mobile ? 3 : 6

    /* head sequence: rule → eyebrow → headline (line mask) · the island fades in as the sky turns to paper */
    tl.fromTo([head, stack], { opacity: 0 }, { opacity: 1, duration: .01 }, .06)
    tl.fromTo(eyeRule, { scaleX: 0 }, { scaleX: 1, duration: .04 }, .06)
      .fromTo(eyeT, { opacity: 0 }, { opacity: 1, duration: .03 }, .085)
      .fromTo(hlIn, { yPercent: 110 }, { yPercent: 0, duration: .06 }, .10)
      .fromTo(isle, { opacity: 0 }, { opacity: 1, duration: .10 }, .08)

    /* the storyteller stack: one line per beat, 4 px rise; older lines go faint; at most MAX visible */
    const line = (i: number, at: number) => {
      tl.fromTo(lines[i], { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .02 }, at)
      if (i >= 2) tl.to(lines[i - 2], { '--old': 1, duration: .02 }, at)
      if (i >= MAX) tl.to(lines[i - MAX], { opacity: 0, height: 0, marginBottom: 0, duration: .02 }, at - .02)
    }
    STORY_I.forEach((_, i) => line(i, .12 + i * .017))
    const B = STORY_I.length, C = B + BETWEEN.length, L = C + CLOSE.length
    ;[.37, .40, .56, .59, .76].forEach((at, i) => line(B + i, at))
    ;[.78, .80, .82].forEach((at, i) => line(C + i, at))
    line(L, .84)

    /* three sunrises: a column settles up from the water, its Disc writes the day, flips back; rule → summary */
    const flip = (svg: SVGElement, text: string, at: number) => {
      tl.to({ v: 0 }, { v: 1, duration: .004, onStart: () => write(svg, text), onReverseComplete: () => clear(svg) }, at)
      tl.to({ v: 0 }, { v: 1, duration: .004, onStart: () => clear(svg), onReverseComplete: () => write(svg, text) }, at + .07)
    }
    const dayNums = (content.programme.days as Day[]).map(d => d.date.slice(8))
    ;[.24, .43, .63].forEach((at, i) => {
      tl.fromTo(days[i], { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: .06 }, at)
      if (mobile && i > 0) tl.to(days[i - 1], { opacity: 0, y: -8, duration: .03 }, at - .03)   // one column at a time on portrait
      flip(discs[i], dayNums[i], at + .03)
      tl.fromTo(rules[i], { scaleX: 0 }, { scaleX: 1, duration: .03 }, at + .06)
      tl.fromTo(sums[i], { opacity: 0 }, { opacity: 1, duration: .02 }, at + .085)
    })

    /* the honesty line + FULL PROGRAMME → · then the whole frame exits by .90 (seam rule); the sun does not stop */
    tl.fromTo(foot, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .04 }, .80)
    tl.to([head, stack, daysEl, foot], { opacity: 0, y: -8, duration: .03 }, .865)
    tl.to(isle, { opacity: 0, duration: .03 }, .865)
  },

  onEnter() { active = true; setPaper(reduced || filmP() >= PAPER_AT) },
  onLeave() { active = false; setPaper(false) },            // both directions — Ch 07 is dark from its p 0
  onProgress(p) { if (active && !reduced) setPaper(p >= PAPER_AT) },

  mood: (p: number) => {
    if (reduced) return STILL
    const [sunX, sunY] = sunAt(p)
    return {
      camX: 2, camY: kf(p, K.camY), camZ: 2, camTilt: kf(p, K.camTilt), camYaw: .1, fov: 34,
      skyTop: kfRGB(p, SKY_TOP), skyBottom: kfRGB(p, SKY_BOT), haze: kf(p, K.haze),
      sunX, sunY, sunRadius: .5, sunGlow: kf(p, K.sunGlow), sunHeat: 1, sunVisible: 1,
      seaColor: kfRGB(p, SEA_COL), seaAmp: kf(p, K.seaAmp),
      stars: kf(p, K.stars), tess: 1, tessForm: 1, tessGold: kf(p, K.tessGold), tessGlint: kf(p, K.tessGlint),
      veil: 1, p4: 0,
      grain: kf(p, K.grain), warmth: kf(p, K.warmth), bloom: kf(p, K.bloom),
    }
  },
}
