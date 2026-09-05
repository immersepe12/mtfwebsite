import type { Chapter, ChapterCtx } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { countUp } from '../../engine/text'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { island, ripples } from '../../art/island'
import { frame } from '../../art/frame'
import './style.css'

/**
 * Chapter 04 — THE TENTH DAWN · Canto III · Ogygia · 23:00 · DESIGN-BIBLE §6.4
 * The star lands in the cave of an ink island; the Mediterranean rises out of the sea as a mosaic floor;
 * the Foundation introduces itself in the right column; the veil enters at the seam.
 * Beats (p): head .06–.16 · island rises .06–.30 · ripples .20–.42 · storyteller ×3 stacks .30–.62 ·
 * Forum A .53–.70 · stats .71–.785 · closing + date + hotel .80–.88 · exit .88–.90 · veil .88–1
 */

gsap.registerPlugin(SplitText)

/* ─── mood keyframes (§6.4 table, piecewise-linear) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    const p1 = k[i][0]
    if (p <= p1) { const p0 = k[i - 1][0], v0 = k[i - 1][1]; return v0 + (k[i][1] - v0) * ((p - p0) / (p1 - p0)) }
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
const PRESS = hex('#090D16'), ABYSS = hex('#06192B'), SEA = hex('#0E3D57')
/** The cave — where the star lands (world units). The island silhouette is pinned to this point. */
const CAVE: [number, number, number] = [2.6, -.55, -9]
const K = {
  camX: [[0, 1.2], [.3, 1.6], [.72, 2]] as KF,
  camY: [[0, 1.1], [.3, .8], [.72, 1.4]] as KF,
  camZ: [[0, 7], [.3, 5], [.72, 2]] as KF,
  camTilt: [[0, .30], [.3, .08], [.72, -.12], [1, -.08]] as KF,
  camYaw: [[0, 0], [.3, -.22], [.72, -.32]] as KF,
  camYawM: [[0, 0], [.3, -.12], [.72, -.10], [.86, -.10], [1, -.32]] as KF,
  fov: [[0, 40], [.3, 36], [.72, 34]] as KF,
  sunX: [[0, 1.2], [.3, CAVE[0]]] as KF,
  sunY: [[0, .9], [.3, CAVE[1]]] as KF,
  sunZ: [[0, -8], [.3, CAVE[2]]] as KF,
  sunRadius: [[0, .2], [.3, .12], [.72, .12], [1, .1]] as KF,
  sunGlow: [[0, 1.6], [.3, 1.2], [.72, 1], [1, .6]] as KF,
  sunHeat: [[0, 0], [.3, .15], [.72, .2]] as KF,
  haze: [[0, .1], [.3, .2]] as KF,
  seaAmp: [[0, .12], [.3, .1]] as KF,
  tess: [[.5, 0], [.72, 1]] as KF,
  tessSpread: [[.5, 3], [.72, 1]] as KF,
  tessGold: [[.3, .7], [.72, .55]] as KF,
  tessGlint: [[.3, .5], [.72, 1], [1, .7]] as KF,
  stars: [[0, .7], [.3, .5], [.72, .4]] as KF,
  warmth: [[0, .15], [.3, .2], [.72, .35], [1, .3]] as KF,
  bloom: [[0, .7], [.3, .6], [.72, .6], [1, .5]] as KF,
  veil: [[.88, 0], [1, .5]] as KF,
}
const SKY_B: [number, RGB][] = [[0, ABYSS], [.3, SEA]]
/** Reduced motion: the chapter's end state as a still (island locked, star in the cave, veil not yet across). */
const STILL: Partial<Mood> = {
  camX: 2, camY: 1.4, camZ: 2, camTilt: -.08, camYaw: -.32, fov: 34,
  sunX: CAVE[0], sunY: CAVE[1], sunZ: CAVE[2], sunRadius: .1, sunGlow: .6, sunHeat: .2, sunVisible: 1,
  skyTop: PRESS, skyBottom: SEA, haze: .2, seaY: -1.2, seaAmp: .1,
  tess: 1, tessForm: 1, tessSpread: 1, tessGold: .55, tessGlint: .7, mosaic: 0,
  stars: .4, warmth: .3, bloom: .5, veil: 0, p4: 0,
}

/* ─── copy (bible-final; Forum copy from content.json) ─── */
const EYEBROW = '04 — OGYGIA · GOZO · MALTA — THE HEART OF THE MEDITERRANEAN'
const COORDS = '36.0451° N · 14.2470° E · RAMLA'
const HEADLINE = 'A diamond set in blue.'
const STORY: string[][] = [
  ['A nymph.', 'Calypso.', 'And her island was called…', 'Ogygia.', 'An ancient name.'],
  ['Primeval.', 'Through the centuries, Ogygia became rooted in the identity of an island at the heart of this sea:', 'Gozo.', 'Red earth at Ramla.', 'Honey-coloured limestone.'],
  ['Caves watching the horizon.', 'The heart of the Mediterranean.', 'Its eye upon the sea.', 'Its soul carved in stone.'],
]
const VEIL_LINE = 'Kalyptein. / To cover. To conceal. / To draw a veil.'
const HOTEL = 'BOOK A HOTEL IN MALTA'

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let mobile = false
let prevP = -1
let counted = false
let veilSet = false
let pinEl: HTMLElement | null = null
let veilEl: HTMLElement | null = null
let counters: HTMLElement[] = []
let lastCx = -1, lastCy = -1, lastPpu = -1

/** The Kalyptein line rides the cloth only for THIS crossing: set while .86 ≤ p < 1, cleared below .84, at the seam
 *  (p ≥ .999) and in onLeave (both directions) — otherwise it leaks into every later veil crossing (QA round 1). */
const setVeilLine = (on: boolean) => {
  if (on === veilSet) return
  veilSet = on
  if (on) veilEl?.setAttribute('data-veil-line', VEIL_LINE)
  else veilEl?.removeAttribute('data-veil-line')
}

function frameHTML(c: any): string {
  const f = c.foundation, who = f.whoIsMtf, st = c.stats as any[], closing = c.audiences.closing as string[]
  const story = STORY.map((g, i) => `<div class="stack stack--${i}" aria-label="The Storyteller">${g.map(l => `<p class="s">${esc(l)}</p>`).join('')}</div>`).join('')
  const n = (to: number, shown: string) => `<span class="n" data-to="${to}">${shown}</span>`
  const stat = (num: string, label: string) => `<li class="stat"><span class="stat__n tnum">${num}</span><span class="stat__l">${esc(label)}</span></li>`
  const s2 = st[2].detail ? `${st[2].label} — ${st[2].detail}` : st[2].label
  const date = `${esc(c.event.dates.display)} · ${esc(c.event.city.value)} · ${esc(c.event.venue.display)}`
  return `
    <div class="head">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${esc(EYEBROW)}</span></p>
      <p class="index coords tnum">${esc(COORDS)}</p>
      <h2 class="h1 hl">${esc(HEADLINE)}</h2>
    </div>
    ${story}
    <div class="forum">
      <span class="forum__rule" aria-hidden="true"></span>
      <p class="label forum__label">${esc(who.heading)}</p>
      <div class="mv mv--a">
        <p class="f name">${esc(f.name.value)}</p>
        <p class="f body">${esc(who.lines[0])}</p>
        <p class="h2 mission">${esc(who.lines[1])}</p>
        <p class="f body">${esc(who.lines[2])}</p>
        <p class="label tagline">${esc(f.tagline.value)}</p>
      </div>
      <ul class="mv mv--b stats" aria-label="The Forum in numbers">
        ${stat(`${n(st[0].number, '1,600')}+`, st[0].label)}
        ${stat(`${n(60, '60')} / ${n(40, '40')}`, st[1].label)}
        ${stat(`${n(st[2].number, '31')}+`, s2)}
      </ul>
      <div class="mv mv--c">
        <p class="f closing">${esc(closing[0])}</p>
        <p class="h2 one">${esc(closing[1])}</p>
        <p class="chip date tnum">${date}</p>
        <a class="link link--mono cta" href="#ch-register">${HOTEL}<span class="btn__arrow" aria-hidden="true">↗</span></a>
      </div>
    </div>`
}

export const ogygia: Chapter = {
  id: 'ogygia',
  label: 'The Tenth Dawn',
  inNav: false,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    mobile = shared.mobile
    veilEl = document.getElementById('veil')
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content)}</div>`
      return
    }
    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 3 : 4.5 })
    pinEl = pin
    pin.innerHTML = `
      <div class="pin__layer shadow">
        <div class="isle"><div class="isle__rise">${island()}</div></div>
        <div class="isle isle--mirror"><div class="isle__rise">${island()}</div></div>
        <div class="ripples">${ripples()}</div>
      </div>
      <div class="pin__frame">${frameHTML(content)}</div>
      <div class="pin__layer fx"><div class="plate">${frame()}</div></div>`

    const q = <T extends Element = HTMLElement>(sel: string) => pin.querySelector(sel) as T
    const qa = (sel: string) => Array.from(pin.querySelectorAll<HTMLElement>(sel))
    const rise = qa('.isle__rise'), ripplesEl = q('.ripples'), rings = qa('.ripple'), plate = q('.plate'), fr = q('.glyph--frame')
    const eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), coords = q('.coords'), hl = q('.hl'), head = q('.head')
    const stacks = [qa('.stack--0 .s'), qa('.stack--1 .s'), qa('.stack--2 .s')]
    const forum = q('.forum'), fRule = q('.forum__rule'), fLabel = q('.forum__label')
    const mvA = qa('.mv--a > *'), mvB = qa('.mv--b > *'), mvC = qa('.mv--c > *')
    counters = qa('.n')

    /* initial states (seam rule: nothing visible before p .06) */
    gsap.set([eyeT, coords, fLabel, ...stacks.flat(), ...mvA, ...mvB, ...mvC, ripplesEl], { opacity: 0 })
    gsap.set(stacks.flat(), { y: 4 })
    gsap.set([...mvA, ...mvB, ...mvC], { y: 10 })
    gsap.set([eyeRule, fRule], { scaleX: 0, transformOrigin: 'left center' })
    gsap.set(rise, { yPercent: 100 })
    gsap.set(rings, { strokeDashoffset: 1, strokeDasharray: 1 })
    gsap.set(fr, { '--draw': 0 })

    /* the island rises out of the water while the star drops into its cave (mood) · .06–.30 */
    tl.to(rise, { yPercent: 0, duration: .24 }, .06)
    tl.to(fr, { '--draw': 1, duration: .12 }, .12)
    tl.to(plate, { opacity: 0, duration: .06 }, .28)
    tl.set(ripplesEl, { opacity: 1 }, .20)
    rings.forEach((r, i) => tl.to(r, { strokeDashoffset: 0, duration: .1 }, .20 + i * .03))
    tl.to(ripplesEl, { opacity: 0, duration: .08 }, .34)

    /* head sequence: rule → eyebrow → coordinates → headline lines (masked) */
    tl.to(eyeRule, { scaleX: 1, duration: .04 }, .06)
    tl.to(eyeT, { opacity: 1, duration: .02 }, .08)
    tl.to(coords, { opacity: 1, duration: .02 }, .10)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .012, ease: 'none', immediateRender: true })
        tl.add(tw, .11)
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - .11)), true, true)
        return tw
      },
    })
    hl.classList.add('is-split')
    tl.to(head, { opacity: 0, y: -8, duration: .03 }, shared.mobile ? .50 : .58)

    /* storyteller: three stacks of ≤ 5, each replacing the last; older lines fall to faint */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .02 }, at)
      if (prev) tl.to(prev, { opacity: .55, duration: .015 }, at)
    }
    const starts = [.30, .41, .52], exits = [.405, .515, .62]
    stacks.forEach((lines, s) => {
      lines.forEach((l, i) => land(l, starts[s] + i * .02, lines[i - 1]))
      tl.to(lines, { opacity: 0, y: -8, duration: .012 }, exits[s])
    })

    /* Forum second movement in the right column: rule → label → A (the host) → B (the trio) → C (the close) */
    tl.to(fRule, { scaleX: 1, duration: .04 }, .53)
    tl.to(fLabel, { opacity: 1, duration: .02 }, .57)
    const beat = (els: HTMLElement[], at: number, gap: number, out: number) => {
      els.forEach((b, i) => tl.to(b, { opacity: 1, y: 0, duration: .015 }, at + i * gap))
      tl.to(els, { opacity: 0, y: -8, duration: .012 }, out)
    }
    beat(mvA, .59, .012, .70)    // the host · whole from .653, holds to .70
    beat(mvB, .71, .012, .785)   // the trio · whole from .749, holds to .785 (it counts up as it lands)
    beat(mvC, .80, .01, .88)     // the close, the date, the hotel · whole from .845, holds to .88
    tl.to([fRule, fLabel], { opacity: 0, duration: .02 }, .88)
    tl.to(forum, { y: -8, duration: .02 }, .88)
  },

  onProgress(p) {
    if (reduced) return
    /* the trio counts up once, when it first enters (.71) */
    if (!counted && p >= .70 && (prevP < .70 || prevP < 0)) {
      counted = true
      for (const c of counters) countUp(c, Number(c.dataset.to), { duration: 2.2 })
    }
    /* the cloth carries Kalyptein from p .86 (the veil component renders it) — only while this crossing is live */
    if (p >= .86 && p < .999) setVeilLine(true)
    else if (p < .84 || p >= .999) setVeilLine(false)
    prevP = p
  },

  onLeave() { setVeilLine(false) },

  onFrame(_shared, ctx) {
    if (reduced || !pinEl) return
    /* pin the ink island to the cave point of the world: --cx/--cy = screen px, --ppu = px per world unit */
    const w = ctx.world
    const a = w.project(CAVE[0], CAVE[1], CAVE[2])
    const cx = a.x, cy = a.y
    const b = w.project(CAVE[0] + 1, CAVE[1], CAVE[2])
    const ppu = Math.max(24, b.x - cx)
    if (Math.abs(cx - lastCx) < .3 && Math.abs(cy - lastCy) < .3 && Math.abs(ppu - lastPpu) < .3) return
    lastCx = cx; lastCy = cy; lastPpu = ppu
    const s = pinEl.style
    s.setProperty('--cx', cx.toFixed(1) + 'px')
    s.setProperty('--cy', cy.toFixed(1) + 'px')
    s.setProperty('--ppu', ppu.toFixed(1) + 'px')
  },

  mood: p => reduced ? STILL : ({
    camX: kf(p, K.camX), camY: kf(p, K.camY), camZ: kf(p, K.camZ), camTilt: kf(p, K.camTilt), camYaw: kf(p, mobile ? K.camYawM : K.camYaw), fov: kf(p, K.fov),
    sunX: kf(p, K.sunX), sunY: kf(p, K.sunY), sunZ: kf(p, K.sunZ), sunRadius: kf(p, K.sunRadius), sunGlow: kf(p, K.sunGlow), sunHeat: kf(p, K.sunHeat), sunVisible: 1,
    skyTop: PRESS, skyBottom: kfRGB(p, SKY_B), haze: kf(p, K.haze),
    seaY: -1.2, seaAmp: kf(p, K.seaAmp),
    tess: kf(p, K.tess), tessForm: 1, tessSpread: kf(p, K.tessSpread), tessGold: kf(p, K.tessGold), tessGlint: kf(p, K.tessGlint), mosaic: 0,
    stars: kf(p, K.stars), warmth: kf(p, K.warmth), bloom: kf(p, K.bloom),
    veil: kf(p, K.veil), p4: 0,
  }),
}
