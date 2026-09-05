import type { Chapter, ChapterCtx, Shared } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { routes } from '../../art/routes'
import { island } from '../../art/island'
import './style.css'

/**
 * Chapter 05 — THE HAND THAT LIFTS · Canto IV · Unity · 00:15 · DESIGN-BIBLE §6.5
 * The veil finishes crossing; the Storyteller tells of the stranger; the Forum's four connections
 * (AIR · SEA · DIGITAL · PEOPLE) draw as portolan lines on the water over the mosaic Mediterranean.
 * Beats (p): head .06–.14 · stack A .14–.25 · Forum rule .34 · rows .40/.47/.54/.61 (+ line families on the water)
 * · stacks B/C interleaved .37–.74 · chips .66 · mono .76 · sign-off .79 · last line .82 · exit .87–.90 · U fills .95
 */

gsap.registerPlugin(SplitText)

/* ─── mood keyframes (§6.5 table, piecewise-linear) ─── */
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
const SEA = hex('#0E3D57'), DAWN = hex('#124A66'), PRESS = hex('#090D16')
const K = {
  camTilt: [[.15, -.08], [.85, -.06]] as KF,
  camYaw: [[0, -.32], [.15, -.2], [.85, .1]] as KF,
  sunGlow: [[0, .6], [.15, .5], [.85, .5], [1, .6]] as KF,
  tessGlint: [[.15, .3], [.85, .6], [1, .7]] as KF,
  tessGold: [[.15, .55], [.85, .6]] as KF,
  veil: [[0, .5], [.15, 1]] as KF,
  stars: [[.85, .4], [1, .3]] as KF,
  warmth: [[.15, .3], [.85, .35], [1, .45]] as KF,
}
const SKY_B: [number, RGB][] = [[.85, SEA], [1, DAWN]]
/** Constant through the chapter: the camera holds where Ch 04 left it; the star still sits in the cave. */
const HOLD: Partial<Mood> = {
  camX: 2, camY: 1.4, camZ: 2, fov: 34,
  skyTop: PRESS, haze: .2,
  sunX: 2.6, sunY: -.55, sunZ: -9, sunRadius: .1, sunHeat: .2, sunVisible: 1,
  seaAmp: .1, seaSpeed: .5, seaColor: SEA,
  tess: 1, tessForm: 1, tessSpread: 1, constellation: 0,
  p1: 0, p2: 0, p3: 0, p4: 0, mosaic: 0, aberration: 0, bloom: .5, grain: .06,
}
const moodAt = (p: number): Partial<Mood> => ({
  ...HOLD,
  camTilt: kf(p, K.camTilt), camYaw: kf(p, K.camYaw), sunGlow: kf(p, K.sunGlow),
  skyBottom: kfRGB(p, SKY_B), tessGlint: kf(p, K.tessGlint), tessGold: kf(p, K.tessGold),
  veil: kf(p, K.veil), stars: kf(p, K.stars), warmth: kf(p, K.warmth),
})
const STILL = moodAt(1)

/* ─── copy (Storyteller lines are bible-final §6.5; Forum copy from content.json theme.pillars[1]) ─── */
const STACK_A = ['When she asked the stranger his name…', 'he answered:', 'Nobody.']
const STACK_B = ['Before Calypso loved Ulysses…', 'she saved him.', 'Made him stand.', 'Made him walk.']
const STACK_C = ['A stranger.', 'A friend.', 'A hand when we needed one.', 'And only later do we understand:']
const LAST = 'I was different because you were there.'
const COLLAB = 'Collaborate across borders on:'
const PROPER = ['mediterranean']
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const sentence = (s: string) => {
  const t = s.toLowerCase().replace(/\b\w+/g, w => PROPER.includes(w) ? w[0].toUpperCase() + w.slice(1) : w)
  return t[0].toUpperCase() + t.slice(1)
}

/* nominal size of the routes plate; scaled to the island's projected rect each frame */
const W0 = 1000, H0 = 700
/** The island's world footprint (tessera formation 1, 7 units square; the traced coast fills ≈ 6 × 4.2 of it). */
const HALF_W = 3.3, HALF_D = 2.3
/** Bible §6.5 anchor; replaced at mount by the tesserae layer's own anchor when it exposes one. */
const ISLAND: [number, number, number] = [0.8, -1.15, -9]

const FAMILIES = ['air', 'sea', 'digital', 'people'] as const

function frameHTML(c: any, withFigure: boolean): string {
  const s = c.theme.pillars[1]
  const eyebrow = `05 — ${esc(String(s.deckTitle).replace(' | ', ' · '))} — ${esc(s.question)}`
  const story = (lines: string[], cls: string) => lines.map(l => `<p class="s ${cls}">${esc(l)}</p>`).join('')
  const rows = (s.strengthen as { key: string; text: string }[]).map((r, i) =>
    `<li class="st st--${FAMILIES[i] ?? 'air'}"><span class="st__rule" aria-hidden="true"></span><span class="st__key">${esc(r.key)}</span><span class="st__text">${esc(r.text)}</span></li>`).join('')
  const chips = (s.collaborateOn as string[]).map(d => `<li class="chip">${esc(d)}</li>`).join('')
  const mono = esc(String(s.lines[0]).replace(/\s•\s/g, ' · '))
  return `
    <div class="col">
      <div class="head">
        <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
        <h2 class="h1 hl">${esc(sentence(String(s.lines[1])))}.</h2>
      </div>
      <div class="stack" aria-label="The Storyteller">${story(STACK_A, 's--a')}${story(STACK_B, 's--b')}${story(STACK_C, 's--c')}<p class="s s--last">${esc(LAST)}</p></div>
    </div>
    <div class="forum">
      <span class="forum__rule" aria-hidden="true"></span>
      <p class="label forum__label">${esc(s.letter)} · ${esc(String(s.name).toUpperCase())}</p>
      <p class="f lead fb">${esc(s.lead)}</p>
      <ul class="strengthen" aria-label="Strengthen">${rows}</ul>
      <p class="f collab fb">${COLLAB}</p>
      <ul class="chip-row collab-chips fb" aria-label="Collaborate across borders on">${chips}</ul>
      <p class="label mono fb">${mono}</p>
      <a class="link link--mono cta fb" href="#ch-remains">B2B BUSINESS MEETINGS<span class="btn__arrow" aria-hidden="true">↓</span></a>
    </div>
    <p class="h2 signoff">${esc(sentence(String(s.closingLine)))}</p>
    ${withFigure ? `<div class="figure">${routes({ w: W0, h: H0 })}</div>` : ''}`
}

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let glyphSent = false
let plate: HTMLElement | null = null
let shade: HTMLElement | null = null
let anchor: [number, number, number] = ISLAND
let lastT = ''
let lastS = ''

export const unity: Chapter = {
  id: 'unity',
  label: 'The Hand That Lifts',
  inNav: false,

  mount(ctx: ChapterCtx) {
    const { el, shared, content, world } = ctx
    reduced = shared.reduced
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content, true)}</div>`
      return
    }
    // the mosaic island's real anchor, if the tesserae layer exposes it (y is relative to seaY)
    const tessLayer = world?.layers?.find(l => l.name === 'tesserae') as { anchors?: { island?: [number, number, number] } } | undefined
    const a = tessLayer?.anchors?.island
    anchor = a ? [a[0], (HOLD.seaY ?? -1.2) + a[1], a[2]] : ISLAND

    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 2 : 3 })
    pin.innerHTML = `
      <div class="pin__layer shadow"><div class="gozo">${island()}</div></div>
      <div class="pin__frame">${frameHTML(content, false)}</div>
      <div class="pin__layer fx"><div class="plate">${routes({ w: W0, h: H0 })}</div></div>`

    const q = <T extends Element = HTMLElement>(sel: string) => pin.querySelector(sel) as T
    const qa = (sel: string) => Array.from(pin.querySelectorAll<HTMLElement>(sel))
    const eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl'), head = q('.head')
    const sA = qa('.s--a'), sB = qa('.s--b'), sC = qa('.s--c'), sLast = q('.s--last')
    const forum = q('.forum'), fRule = q('.forum__rule'), fLabel = q('.forum__label')
    const lead = q('.lead'), rows = qa('.st'), collab = q('.collab'), chips = qa('.collab-chips .chip')
    const mono = q('.mono'), cta = q('.cta'), signoff = q('.signoff')
    const fx = q('.fx')
    plate = q('.plate'); shade = q('.gozo')
    const svg = q<SVGSVGElement>('.glyph--routes')
    const fam = FAMILIES.map(f => svg.querySelector(`.${f}`) as SVGGElement)

    /* initial states — the seam rule: nothing in the frame before p .06 or after p .90 */
    gsap.set([eyeT, ...sA, ...sB, ...sC, sLast, fLabel, lead, collab, ...chips, mono, cta, signoff], { opacity: 0 })
    gsap.set([...sA, ...sB, ...sC, sLast], { y: 4 })
    gsap.set([lead, collab, mono, cta, signoff], { y: 10 })
    gsap.set([eyeRule, fRule], { scaleX: 0, transformOrigin: 'left center' })
    rows.forEach(r => {
      gsap.set(r.querySelector('.st__rule'), { scaleX: 0, transformOrigin: 'left center' })
      gsap.set([r.querySelector('.st__key'), r.querySelector('.st__text')], { opacity: 0 })
    })
    gsap.set(fx, { opacity: 0 })
    gsap.set(svg, { attr: { 'stroke-width': 1.25 } })
    fam.forEach((g, i) => i < 3 ? g.style.setProperty('--draw', '0') : gsap.set(g, { opacity: 0 }))

    /* head sequence: rule → eyebrow → headline lines (masked, SplitText) */
    tl.to(eyeRule, { scaleX: 1, duration: .04 }, .06)
    tl.to(eyeT, { opacity: 1, duration: .02 }, .08)
    let hlTween: gsap.core.Tween | undefined
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        // an unpaused child (a paused one is skipped by the timeline's render); a re-split replaces the previous
        hlTween?.kill()
        hlTween = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .05, stagger: .012, ease: 'none', immediateRender: true })
        tl.add(hlTween, .09)
        tl.render(tl.time(), true, true)   // a re-split (fonts / resize) may land mid-scroll: render at the playhead now
        return hlTween
      },
    })
    hl.classList.add('is-split')

    /* storyteller: a line lands whole (4 px rise); the previous falls to faint; a stack collapses when the next begins */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .025 }, at)
      if (prev) tl.to(prev, { opacity: .55, duration: .02 }, at)
    }
    const collapse = (lines: HTMLElement[], at: number) => tl.to(lines, { opacity: 0, height: 0, marginBottom: 0, duration: .01 }, at)
    ;[.14, .19, .25].forEach((at, i) => land(sA[i], at, sA[i - 1]))
    collapse(sA, .36)
    ;[.37, .43, .50, .57].forEach((at, i) => land(sB[i], at, sB[i - 1]))
    collapse(sB, .63)
    ;[.64, .67, .70, .74].forEach((at, i) => land(sC[i], at, sC[i - 1]))
    land(sLast, .82, sC[3])

    /* Forum: rule → label → lead; then the four rows, each drawing its line family on the water */
    tl.to(fRule, { scaleX: 1, duration: .04 }, .34)
    tl.to(fLabel, { opacity: 1, duration: .02 }, .36)
    tl.to(lead, { opacity: 1, y: 0, duration: .03 }, .38)
    tl.to(fx, { opacity: 1, duration: .04 }, .38)
    rows.forEach((r, i) => {
      const at = .40 + i * .07
      tl.to(r.querySelector('.st__rule'), { scaleX: 1, duration: .02 }, at)
      tl.to(r.querySelector('.st__key'), { opacity: 1, duration: .015 }, at + .015)
      tl.to(r.querySelector('.st__text'), { opacity: 1, duration: .02 }, at + .025)
      if (i < 3) tl.to(fam[i], { '--draw': 1, duration: .05 }, at + .02)
      else tl.to(fam[i], { opacity: 1, duration: .04 }, at + .02)
    })
    tl.to(collab, { opacity: 1, y: 0, duration: .02 }, .66)
    tl.to(chips, { opacity: 1, duration: .012, stagger: .004 }, .68)
    tl.to(mono, { opacity: 1, y: 0, duration: .025 }, .76)
    tl.to(cta, { opacity: 1, y: 0, duration: .02 }, .78)
    tl.to(signoff, { opacity: 1, y: 0, duration: .03 }, .79)

    /* transition → 06: the lines on the water thicken and warm */
    tl.to(svg, { attr: { 'stroke-width': 1.9 }, duration: .08 }, .80)
    tl.to(fam[0], { attr: { 'stroke-opacity': .9 }, duration: .08 }, .80)

    /* exit · .87–.90 — everything inside the pin is empty at the seam */
    tl.to([head, forum, signoff], { opacity: 0, y: -8, duration: .03 }, .87)
    tl.to([...sC, sLast], { opacity: 0, y: -8, duration: .03 }, .87)
    tl.to(fx, { opacity: 0, duration: .03 }, .87)
  },

  onProgress(p) {
    if (p >= .95 && !glyphSent) { glyphSent = true; document.dispatchEvent(new CustomEvent('mtf:glyph', { detail: { letter: 'U' } })) }
    else if (p < .5) glyphSent = false
  },

  /** Pin the routes plate to the island's projected rect (desktop and portrait alike), and Gozo's silhouette to the island's heading. */
  onFrame(_s: Shared, ctx: ChapterCtx) {
    const w = ctx.world
    const [ix, iy, iz] = anchor
    // the silhouette sits on the far horizon along the island's bearing from the camera
    const far = w.project(2 + (ix - 2) * 5.5, iy, 2 + (iz - 2) * 5.5)
    if (shade && far.z < 1) {
      const sx = far.x.toFixed(0)
      if (sx !== lastS) { lastS = sx; shade.style.left = sx + 'px' }
    }
    if (!plate) return
    const r = w.project(ix + HALF_W, iy, iz); const rx = r.x
    const l = w.project(ix - HALF_W, iy, iz); const lx = l.x
    const n = w.project(ix, iy, iz + HALF_D); const ny = n.y
    const f = w.project(ix, iy, iz - HALF_D); const fy = f.y, fz = f.z
    if (fz > 1) return
    const pw = Math.max(1, rx - lx), ph = Math.max(1, ny - fy)
    const t = `translate(${lx.toFixed(1)}px,${fy.toFixed(1)}px) scale(${(pw / W0).toFixed(4)},${(ph / H0).toFixed(4)})`
    if (t !== lastT) { lastT = t; plate.style.transform = t }
  },

  mood: p => (reduced ? STILL : moodAt(p)),
}
