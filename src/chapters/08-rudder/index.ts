import type { Chapter, ChapterCtx, Shared } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { gsap } from '../../engine/scroll'
import { SplitText } from 'gsap/SplitText'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { smoothstep } from '../../engine/utils'
import { compassRing, setYaw, radar } from '../../art/compass'
import { eventGlyph, type EventKind } from '../../art/events'
import './style.css'

/**
 * Chapter 08 — THE HAND UPON THE RUDDER · Canto VII · The Four · 04:10 · DESIGN-BIBLE §6.8
 *
 * The camera IS the compass: it yaws a full circle on the spot with a long rest at each quarter, and each
 * cardinal bearing holds one of the four specialist events of 27 November. The mosaic island sinks behind us,
 * the man remembers his name, and the veil tears (Fontana's cut) into the cold field of Chapter 09.
 *
 * LAYOUT — three disjoint lanes, so nothing ever collides (quality pass):
 *   left lane   `--x` → `--x + --colw`   eyebrow · headline (its own wider band, ABOVE the ring) · storyteller
 *   corridor    between the lanes         the compass rose — sized from the gap, never under the type
 *   right lane  `--panw` at `--x`         one bearing panel at a time
 * The EAST / WEST bearing labels sweep the band BELOW the rose, clear of every block.
 *
 * BEATS (fractions of p; the film's absolute length is owned by src/engine/pacing.ts). Re-spaced for the
 * longer film: every storyteller line is ≥ 4 % of p from its neighbour (~230 px of scroll) and no stretch of
 * the chapter runs longer than 7 % of p with nothing happening.
 *   .05 rule · .085 eyebrow · .125 headline · .16 rose · .185 needle · .21 labels
 *   .175 N panel in (.265 out) · .19/.23/.27/.31 storyteller A · .245 CTA · .295 headline out
 *   .335 E panel in (.415 out) · .365/.42/.48/.535 storyteller B · .455 S panel in (.635 out)
 *   .50–.545 the six Ps light one by one round the ring · .555 they draw into the pivot · .565 they dock
 *   .675 W panel in (.765 out) · .745 CTA out · .775 everything leaves
 *   .805 Nobody · .845 I AM ULYSSES (SOFT snap .855) · .878 exit, frame empty by .90
 *   .92–.96 the veil tears — a world event over an empty frame.
 */

gsap.registerPlugin(SplitText)

/* ─── mood (§6.8 table, piecewise-linear) ─── */
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
const PRESS = hex('#090D16'), ABYSS = hex('#06192B'), SKY = hex('#0F5A80'), SEA = hex('#0E3D57')
const TAU = Math.PI * 2
/**
 * Lock centres (p) for N · E · S · W · N again. The yaw RESTS ±REST around each lock and smoothsteps between,
 * so each 90° swing takes ~7% of p — with the longer film (pacing.ts × 1.5 ≈ 5 850 px of travel at 900 px)
 * that is ~410 px of scroll per quarter turn: a slow deliberate sweep, never a spin.
 * Rests: N [0,.245] E [.315,.405] S [.475,.565] W [.655,.745] N [.815,1].
 */
const LOCKS = [.20, .36, .52, .70, .86], REST = .045
const yawAt = (p: number): number => {
  if (p <= LOCKS[0] + REST) return 0
  for (let k = 0; k < 4; k++) {
    const a = LOCKS[k] + REST, b = LOCKS[k + 1] - REST
    if (p <= b) return (k + smoothstep(a, b, p)) * (Math.PI / 2)
  }
  return TAU
}
const K = {
  haze: [[.92, .1], [.96, .05]] as KF, seaAmp: [[.92, .08], [.96, .06]] as KF, seaSpeed: [[.92, .3], [.96, .25]] as KF,
  stars: [[.85, 1], [.92, .8], [.96, .3], [1, 0]] as KF, constellation: [[.92, 2], [.96, 0]] as KF,
  tess: [[0, 1], [.15, 0]] as KF, tessSpread: [[0, 1], [.15, 2]] as KF,
  veil: [[0, 1.6], [.15, 2], [.85, 2], [.92, 2.5], [.96, 2.5], [1, 3]] as KF,
  p4: [[.92, 0], [.96, 1]] as KF, warmth: [[.92, .15], [.96, .1]] as KF,
  /* the keys that must equal Ch 09's p 0 at p 1 (§11.2) */
  camTilt: [[.92, .06], [1, .04]] as KF, fov: [[.92, 36], [1, 34]] as KF, bloom: [[.92, .5], [1, .4]] as KF,
  vignette: [[.92, .35], [1, .2]] as KF, grain: [[.92, .06], [1, .02]] as KF,
}
const SKY_T: [number, RGB][] = [[.92, PRESS], [.96, SKY]]
const SKY_B: [number, RGB][] = [[.92, ABYSS], [.96, SKY]]
const SEA_C: [number, RGB][] = [[.92, SEA], [.96, SKY]]
const HOLD: Partial<Mood> = { camX: 2, camY: 1.6, camZ: 2, sunVisible: 0, tessForm: 1, p1: 0, p2: 0, p3: 0, mosaic: 0, aberration: 0 }
/** The §6.8 table, returned directly — the Stage blends it into Ch 09's p 0 at the seam (.86 → 1); never compensate here. */
const moodAt = (p: number): Partial<Mood> => ({
  ...HOLD,
  camTilt: kf(p, K.camTilt), camYaw: yawAt(p), fov: kf(p, K.fov),
  skyTop: kfRGB(p, SKY_T), skyBottom: kfRGB(p, SKY_B), seaColor: kfRGB(p, SEA_C), haze: kf(p, K.haze),
  seaAmp: kf(p, K.seaAmp), seaSpeed: kf(p, K.seaSpeed),
  stars: kf(p, K.stars), constellation: kf(p, K.constellation),
  tess: kf(p, K.tess), tessSpread: kf(p, K.tessSpread),
  veil: kf(p, K.veil), p4: kf(p, K.p4),
  bloom: kf(p, K.bloom), vignette: kf(p, K.vignette), grain: kf(p, K.grain), warmth: kf(p, K.warmth),
})
/** Reduced motion holds the end frame as a still: the circle complete, the cold field. */
const END = moodAt(1)

/* ─── copy (Storyteller lines are bible-final §6.8; Forum copy from content.json specialistEvents[0..3]) ─── */
const HEADLINE = 'The wind may belong to destiny.<br>The hand upon the rudder remains ours.'
const STACK_A = ['Orion.', 'The Bear.', 'East.', 'West.']
const STACK_B = ['The same stars that guided him toward Ogygia…', 'now pointed beyond it.', 'Navigation awakened memory.', 'Memory awakened identity.']
const NOBODY = 'And the man who arrived calling himself Nobody remembered:'
const ULYSSES = 'I AM ULYSSES.'
const LETTERS = ['N', 'E', 'S', 'W']
const KINDS: EventKind[] = ['destinations', 'medready', 'ai', 'coffee']
const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
const sentence = (s: string) => { const t = s.toLowerCase(); return t[0].toUpperCase() + t.slice(1) }
const chips = (a: string[], cls = '') => `<ul class="chip-row ${cls}">${a.map(d => `<li class="chip">${esc(d)}</li>`).join('')}</ul>`
const arrows = (s: string) => esc(s).replace(/\s•\s/g, ' · ')

function bodyHTML(kind: EventKind, e: any): { body: string; more: string } {
  switch (kind) {
    case 'destinations': return {
      body: `<p class="f fb"><strong>${esc(e.headline)}</strong></p><p class="body fb">${esc(e.question)}</p>${chips(e.qualities, 'fb')}
        <ul class="mantras fb">${(e.mantras as string[]).map(m => `<li>${esc(sentence(m))}</li>`).join('')}</ul>
        <p class="label chain fb">${arrows(e.chain)}</p><p class="small close fb">${esc(e.closingLine)}</p>`,
      more: `<p class="label">Covering</p>${chips(e.covering)}<p class="label">Exploring</p>${chips(e.exploring)}`,
    }
    case 'medready': {
      const c = e.centreOfExcellence, t = e.certification
      return {
        body: `<p class="f fb"><strong>${esc(e.question)}</strong></p>
          <ol class="ladder fb" aria-label="MED READY">${(e.acronym as { letter: string; word: string }[]).map(a => `<li><span class="ladder__k">${esc(a.letter)}</span><span class="ladder__w">${esc(a.word)}</span></li>`).join('')}</ol>
          <p class="label chain fb">${arrows(e.closingLine)}</p>`,
        more: `<p class="label">${esc(c.title)}</p><p class="body">${esc(c.lead)}</p>${chips(c.brings)}<p class="label chain">${arrows(c.mission)}</p>
          <p class="label">${esc(t.title)}</p><p class="body">${esc(t.developingLead)} <strong>${esc(t.developing[0])}</strong> and <strong>${esc(t.developing[1])}</strong></p><p class="label chain">${arrows(t.chainFinal)}</p>`,
      }
    }
    case 'ai': {
      const b = e.blueprint
      return {
        body: `<p class="f fb">${esc(e.lead[0])}</p><p class="f fb"><strong>${esc(e.lead[1])}</strong></p><p class="label chain fb">${arrows(e.opportunityLine)}</p>
          <div class="ps-dock"><p class="label ps-dock__lead">${esc(b.sixPsLead)}</p>
          <ol class="ps" aria-label="${esc(b.sixPsLead)}">${(b.sixPs as { p: string; text: string }[]).map(x => `<li class="ps__row"><span class="ps__k">${esc(x.p)}</span><span class="ps__t">— ${esc(x.text)}</span></li>`).join('')}</ol></div>
          <p class="label chain close fb">${esc(b.closingLines[0])}<br>${esc(b.closingLines[1])}</p>`,
        more: `<p class="body">${esc(b.strLead)}</p>${chips(b.str)}`,
      }
    }
    case 'coffee': return {
      body: `<p class="f fb">${esc(e.lead[0])}</p><p class="f fb">${esc(e.lead[1])}</p>
        <p class="label fb">${esc(e.exploringLead)}</p>${chips(e.exploring, 'fb')}
        <p class="label chain fb">${esc(e.closingLines[0])} → ${esc(e.closingLines[1])}</p><p class="label partner fb">POWERED BY ${esc(String(e.partner).toUpperCase())}</p>`,
      more: '',
    }
  }
}

function frameHTML(c: any): string {
  const day = c.programme.days[2], events = c.specialistEvents as any[]
  const eyebrow = `08 — ${esc(String(day.display).toUpperCase())} · ${esc(String(c.plenary.title).toUpperCase())} · FOUR SPECIALIST EVENTS`
  const story = (lines: string[], cls: string) => lines.map(l => `<p class="s ${cls}">${esc(l)}</p>`).join('')
  const rules = ['t', 'r', 'b', 'l'].map(s => `<span class="card__rule card__rule--${s}" aria-hidden="true"></span>`).join('') +
    ['tl', 'tr', 'bl', 'br'].map(s => `<span class="card__corner card__corner--${s}" aria-hidden="true"></span>`).join('')
  const panels = events.slice(0, 4).map((e, i) => {
    const kind = KINDS[i], { body, more } = bodyHTML(kind, e)
    return `<li class="bearing card card--frame" data-kind="${kind}" data-lenis-prevent>${rules}
      <div class="bearing__head"><p class="label bearing__mono">${LETTERS[i]} · ${esc(e.deckTitle)}</p>
        <div class="bearing__title">${eventGlyph(kind)}<div><h3 class="h3">${esc(e.title)}</h3><p class="small bearing__sub">${esc(e.subtitle)}</p></div></div></div>
      <div class="bearing__body">${body}</div>${more ? `
      <div class="bearing__more" id="rudder-more-${esc(e.id)}" hidden>${more}</div>
      <button class="link link--mono explore fb" type="button" aria-expanded="false" aria-controls="rudder-more-${esc(e.id)}">EXPLORE<span class="btn__arrow" aria-hidden="true">→</span></button>` : ''}
    </li>`
  }).join('')
  const orbit = (events[2].blueprint.sixPs as { p: string }[]).map((_, i) => `<span class="orb" style="--a:${i * 60}deg"></span>`).join('')
  return `
    <div class="instrument" aria-hidden="true">
      <div class="ring-halo"></div>
      <div class="ring-wrap"><span class="ring-glass"></span><span class="ring-dial"></span><span class="ring-rim"></span>
        ${compassRing()}<div class="psorbit">${orbit}</div><p class="psorbit__read label">${esc(events[2].blueprint.sixPsLead)}</p></div>
      <div class="bearing-lbls"><span class="bearing-lbl label" data-b="east">East</span><span class="bearing-lbl label" data-b="west">West</span></div>
    </div>
    <div class="col">
      <div class="head">
        <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
        <h2 class="h1 hl">${HEADLINE}</h2>
      </div>
      <div class="stack" aria-label="The Storyteller">${story(STACK_A, 's--a')}${story(STACK_B, 's--b')}</div>
      <p class="s s--c">${esc(NOBODY)}</p>
      <p class="ulysses h1" data-avoid>${ULYSSES}</p>
    </div>
    <ul class="bearings" aria-label="Four specialist events · 27 November">${panels}</ul>
    <a class="link link--mono cta" href="#ch-paradise">THE FOUR — FULL DETAILS<span class="btn__arrow" aria-hidden="true">→</span></a>`
}

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let ring: SVGSVGElement | null = null
let ringWrap: HTMLElement | null = null
let east: HTMLElement | null = null, west: HTMLElement | null = null
let lastYaw = 1e9, lastE = 1e9, lastW = 1e9, lastTr = ''
let radarOn = false
/* cached lane geometry, re-measured only when the viewport changes (no per-frame layout reads) */
let geoW = 0, geoH = 0, lblY = 0, corrL = 0, corrR = 0
const HALF_V = Math.tan(Math.PI / 10) // tan(fov/2) at fov 36°

/**
 * Screen x of a compass bearing for the current heading. `camYaw` is the Three.js Y rotation (ENGINE-API):
 * POSITIVE TURNS LEFT, so the world pans right as the yaw grows. A bearing `b` — the yaw at which it is dead
 * ahead (the stars layer: Orion/E at π/2, the Bear/N at 0) — therefore sits at screen angle (yaw − b): left of
 * centre until the camera reaches it, right once it has passed. Off-screen bearings return −1e4.
 */
const bearingX = (bearing: number, yaw: number, vw: number, vh: number): number => {
  let d = yaw - bearing
  d = ((d + Math.PI) % TAU + TAU) % TAU - Math.PI
  const halfH = Math.atan(HALF_V * vw / vh)
  if (Math.abs(d) > halfH + .12) return -1e4
  return Math.round(vw / 2 + Math.tan(d) * (vh / 2) / HALF_V)
}
/**
 * The sweeping label lives in the free band UNDER the compass rose, and only inside the corridor that is clear
 * of the left column, the chapter CTA and the fixed corner labels — so it can never print over another block.
 */
const place = (lbl: HTMLElement | null, x: number, last: number): number => {
  if (!lbl || x === last) return last
  const on = x > corrL && x < corrR
  lbl.style.transform = on ? `translate(${x}px, ${lblY}px) translate(-50%,0)` : 'translate(-200vw,0)'
  lbl.style.opacity = on ? '1' : '0'
  return x
}
/** Lane geometry: the rose's own box gives the band below it; the corridor keeps the label off the CTA. */
function measure(s: Shared) {
  if (s.vw === geoW && s.vh === geoH) return
  geoW = s.vw; geoH = s.vh
  const w = ringWrap?.offsetWidth ?? 0
  const top = ringWrap?.offsetTop ?? s.vh * .68 - w / 2
  lblY = Math.min(top + w * .738 + 22, s.vh - 104)   // the rose's drawn bottom (.5 + .238 of its box) + a gap
  corrL = s.vw * .30; corrR = s.vw * .97
}

/** Delegated EXPLORE → toggle (expands the panel's full body in place), Esc closes, glint tracks the pointer. */
function wire(el: HTMLElement) {
  el.addEventListener('click', ev => {
    const btn = (ev.target as HTMLElement).closest<HTMLButtonElement>('.explore')
    if (!btn) return
    const panel = btn.closest<HTMLElement>('.bearing'), more = panel?.querySelector<HTMLElement>('.bearing__more')
    if (!panel || !more) return
    const open = !panel.classList.contains('is-open')
    panel.classList.toggle('is-open', open); more.hidden = !open; btn.setAttribute('aria-expanded', String(open))
  })
  el.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return
    el.querySelectorAll<HTMLElement>('.bearing.is-open').forEach(p => {
      p.classList.remove('is-open'); p.querySelector<HTMLElement>('.bearing__more')!.hidden = true
      const b = p.querySelector<HTMLButtonElement>('.explore'); b?.setAttribute('aria-expanded', 'false'); b?.focus()
    })
  })
  el.addEventListener('pointermove', ev => {
    const card = (ev.target as HTMLElement).closest<HTMLElement>('.bearing')
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${((ev.clientX - r.left) / r.width * 100).toFixed(1)}%`)
    card.style.setProperty('--my', `${((ev.clientY - r.top) / r.height * 100).toFixed(1)}%`)
  })
}

export const rudder: Chapter = {
  id: 'rudder',
  label: 'The Hand Upon the Rudder',
  navIndex: '04', inNav: true,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced
    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content)}</div>`
      wire(el)
      return
    }
    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 3 : 5 })
    pin.innerHTML = `<div class="pin__frame">${frameHTML(content)}</div>`
    wire(el)

    const q = <T extends Element = HTMLElement>(sel: string) => pin.querySelector(sel) as T
    const qa = (sel: string) => Array.from(pin.querySelectorAll<HTMLElement>(sel))
    ring = q<SVGSVGElement>('.glyph--compass')
    ringWrap = q('.ring-wrap')
    east = q('[data-b="east"]'); west = q('[data-b="west"]')
    const halo = q('.ring-halo'), needle = q<SVGLineElement>('.glyph--compass .needle')
    const orbit = q('.psorbit'), orbs = qa('.orb'), read = q('.psorbit__read'), lbls = q('.bearing-lbls')
    const eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl')
    const sA = qa('.s--a'), sB = qa('.s--b'), sC = q('.s--c'), ul = q('.ulysses')
    const panels = qa('.bearing'), cta = q('.cta')
    const psDock = q('.ps-dock'), psRows = qa('.ps__row')

    /* initial states — the seam rule: nothing in the frame before p .06 or after p .90 */
    const SOFT = (v: number) => `"WONK" 1, "SOFT" ${v}`
    gsap.set(eyeT, { opacity: 0 })
    gsap.set(eyeRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([...sA, ...sB, sC], { opacity: 0, y: 4 })
    gsap.set(sA, { fontVariationSettings: SOFT(60), filter: 'blur(6px)' })
    gsap.set(ul, { opacity: 0, y: 4, fontVariationSettings: '"SOFT" 60', filter: 'blur(0px)' })
    gsap.set([ringWrap, halo], { opacity: 0 })
    gsap.set(ringWrap, { scale: .94, transformOrigin: 'center' })
    gsap.set(needle, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set([orbit, read], { opacity: 0 })
    gsap.set(orbs, { scale: 0, transformOrigin: 'center' })
    gsap.set(lbls, { opacity: 0 })
    gsap.set([...panels, cta], { autoAlpha: 0 })
    gsap.set(panels, { x: 28 })
    panels.forEach(b => {
      gsap.set(b.querySelectorAll('.card__rule--t, .card__rule--b'), { scaleX: 0 })
      gsap.set(b.querySelectorAll('.card__rule--l, .card__rule--r'), { scaleY: 0 })
      gsap.set(b.querySelectorAll('.card__corner, .bearing__mono'), { opacity: 0 })
      gsap.set(b.querySelectorAll('.bearing__title, .fb'), { opacity: 0, y: 10 })
    })
    /* the six Ps take NO room in the S panel until they dock — an empty reserved slot reads as a bug.
       In portrait the AI deck is already the tallest sheet on the page, so the six Ps live behind that
       panel's EXPLORE → disclosure instead: every word still ships, and the sheet never overflows. */
    if (shared.mobile) {
      const more = q('[data-kind="ai"] .bearing__more')
      if (more && psDock) more.prepend(psDock)
      gsap.set(psDock, { height: 'auto', opacity: 1, marginTop: 0 })
      gsap.set(psRows, { opacity: 1, x: 0 })
    } else {
      gsap.set(psDock, { height: 0, opacity: 0, overflow: 'hidden', marginTop: '-.7rem' })
      gsap.set(psRows, { opacity: 0, x: 18 })
    }

    /* head sequence (.05–.15): rule → eyebrow → headline lines (masked, SplitText) */
    tl.to(eyeRule, { scaleX: 1, duration: .03 }, .05)
    tl.to(eyeT, { opacity: 1, duration: .02 }, .085)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .035, stagger: .012, ease: 'none', immediateRender: true })
        tl.add(tw, .125)
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - .125)), true, true)
        return tw
      },
    })
    hl.classList.add('is-split')

    /* the rose rises in the corridor between the lanes (.15–.20) and the needle strokes in */
    tl.to([ringWrap, halo], { opacity: 1, duration: .055 }, .16)
    tl.to(ringWrap, { scale: 1, duration: .055 }, .16)
    tl.to(needle, { strokeDashoffset: 0, duration: .05 }, .185)
    tl.to(lbls, { opacity: 1, duration: .03 }, .21)

    /* storyteller A — the four bearings named under the leaving cloth (SOFT breath 60 → 12, blur 6 → 0) */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .025 }, at)
      if (prev) tl.to(prev, { opacity: .5, duration: .02 }, at)
    }
    const collapse = (lines: HTMLElement[], at: number) => tl.to(lines, { opacity: 0, height: 0, marginBottom: 0, duration: .012 }, at)
    ;[.19, .23, .27, .31].forEach((at, i) => {
      land(sA[i], at, sA[i - 1])
      tl.to(sA[i], { fontVariationSettings: SOFT(12), filter: 'blur(0px)', duration: .03 }, at)
    })

    /* the click of light at each lock (the last one is a farewell, just before the rose leaves) */
    const click = (at: number) => { tl.to(ring, { '--flash': 1, duration: .008 }, at); tl.to(ring, { '--flash': 0, duration: .03 }, at + .008) }
    ;[.20, .36, .52, .70, .772].forEach(click)

    /* four bearings: the panel slides into the right lane, complete well before the lock's centre, and slides
       out before the camera turns away. Every body lands with its head — no card is ever empty at rest. */
    const panelIn = (b: HTMLElement, at: number) => {
      tl.to(b, { autoAlpha: 1, x: 0, duration: .022 }, at)
      tl.to(b.querySelectorAll('.card__rule--t, .card__rule--b'), { scaleX: 1, duration: .018 }, at)
      tl.to(b.querySelectorAll('.card__rule--l, .card__rule--r'), { scaleY: 1, duration: .018 }, at + .006)
      tl.to(b.querySelector('.bearing__mono'), { opacity: 1, duration: .012 }, at + .012)
      tl.to(b.querySelectorAll('.card__corner'), { opacity: 1, duration: .01 }, at + .018)
      tl.to(b.querySelector('.bearing__title'), { opacity: 1, y: 0, duration: .014 }, at + .018)
      tl.to(b.querySelectorAll('.fb'), { opacity: 1, y: 0, duration: .014, stagger: .0035 }, at + .026)
    }
    const panelOut = (b: HTMLElement, at: number) => tl.to(b, { autoAlpha: 0, x: 28, duration: .034 }, at)
    panelIn(panels[0], .175); panelOut(panels[0], .265)
    panelIn(panels[1], .335); panelOut(panels[1], .415)
    panelIn(panels[2], .455); panelOut(panels[2], .635)
    panelIn(panels[3], .675); panelOut(panels[3], .765)
    tl.to(cta, { autoAlpha: 1, duration: .02 }, .245)
    tl.to(cta, { autoAlpha: 0, duration: .02 }, .745)

    /* the headline leaves as the first turn begins; the middle stack lands across the second and third bearings */
    tl.to(hl, { opacity: 0, y: -8, duration: .03 }, .295)
    collapse([hl], .33)   // the headline's band is given back to the frame once it has left
    collapse(sA, .345)
    ;[.365, .42, .48, .535].forEach((at, i) => land(sB[i], at, sB[i - 1]))

    /* The six Ps LIGHT one by one round the rose (.50–.545) — one pip per station, inside the ticks and clear
       of both lanes — hold, then draw into the pivot (.555) and DOCK as the list inside the S panel (.565).
       Nothing spins: the camera is the only thing turning in this chapter, and a second, faster circle fighting
       it read as a gadget rather than an instrument. Portrait skips the stations and docks with the body. */
    if (!shared.mobile) {
      tl.to([orbit, read], { opacity: 1, duration: .012 }, .495)
      tl.to(orbs, { scale: 1, duration: .014, stagger: .0068 }, .50)
      tl.to(orbit, { scale: .12, opacity: 0, duration: .022 }, .555)
      tl.to(read, { opacity: 0, duration: .014 }, .558)
      tl.to(psDock, { height: 'auto', opacity: 1, marginTop: 0, duration: .018 }, .565)
      tl.to(psRows, { opacity: 1, x: 0, duration: .014, stagger: .0045 }, .573)
    }

    /* everything leaves (.775–.79) — the circle is complete */
    tl.to([eyeRule, eyeT], { opacity: 0, y: -8, duration: .03 }, .775)
    tl.to([ringWrap, halo, lbls], { opacity: 0, duration: .035 }, .782)
    collapse(sB, .788)

    /* the man remembers his name: Nobody (.805) → I AM ULYSSES (.845), SOFT 60 → 0 in one step (.855) */
    land(sC, .805)
    tl.set(ul, { opacity: 1, y: 0 }, .845)
    tl.set(ul, { fontVariationSettings: '"SOFT" 0' }, .855)

    /* the frame is empty by .90 — the veil's cut (.92–.96) runs over open world */
    tl.to(sC, { opacity: 0, y: -8, fontVariationSettings: SOFT(60), filter: 'blur(6px)', duration: .02 }, .878)
    tl.to(ul, { opacity: 0, y: -8, fontVariationSettings: '"SOFT" 60', filter: 'blur(6px)', duration: .02 }, .878)
  },

  /** The radar sweep runs while the camera holds East (MED READY). */
  onProgress(p) {
    if (reduced || !ring) return
    const on = p >= .33 && p < .425
    if (on !== radarOn) { radarOn = on; radar(ring, on) }
  },

  /**
   * The rose turns WITH the world: +yaw pans the stars right, so the ring turns clockwise by +yaw (`setYaw`
   * negates its argument, hence −yaw). Its cardinals are mirrored in style.css (E left, W right) so E rises
   * under the needle as Orion comes ahead at π/2. EAST / WEST glide along the free band under the rose.
   */
  onFrame(s: Shared, ctx: ChapterCtx) {
    if (reduced || !ring) return
    measure(s)
    const yaw = ctx.world.mood.camYaw
    if (Math.abs(yaw - lastYaw) > 1e-4) {
      lastYaw = yaw; setYaw(ring, -yaw)
      if (!s.mobile) {
        lastE = place(east, bearingX(Math.PI / 2, yaw, s.vw, s.vh), lastE)
        lastW = place(west, bearingX(Math.PI * 1.5, yaw, s.vw, s.vh), lastW)
      }
    }
    const tr = (s.mouse.x * 1.6).toFixed(2)
    if (tr !== lastTr) { lastTr = tr; ring.style.setProperty('--tremble', tr + 'deg') }
  },

  mood: p => (reduced ? END : moodAt(p)),
}
