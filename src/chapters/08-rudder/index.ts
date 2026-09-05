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
 * The camera IS the compass: it yaws a full circle on the spot with a soft lock at each quarter, and each
 * cardinal bearing holds one of the four specialist events of 27 November. The mosaic island sinks behind us,
 * the man remembers his name, and the veil tears (Fontana's cut) into the cold field of Chapter 09.
 * Beats (p): head .06–.12 · stack A .11–.155 · ring .06–.14 · N .15–.27 · E .30–.44 (radar) · S .47–.62
 * (body .49; the six Ps orbit .47–.54, then dock .54–.58) · W .65–.80 · stack B .33/.41/.49/.57 · everything
 * exits .83–.87 · Nobody .85 → I AM ULYSSES .87 (SOFT snap .885) · exit + tear .92–.96 (veil 2 → 2.5 over .85–.92).
 * The Stage hands over to Ch 09 at the seam (smoothstep .86 → 1): mood() returns the §6.8 table as-is.
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
/** Lock centres (p) for N · E · S · W · N again; the yaw rests ±REST around each and smoothsteps between. */
const LOCKS = [.15, .33, .50, .68, .85], REST = .03
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
          <ol class="ps" aria-label="${esc(b.sixPsLead)}">${(b.sixPs as { p: string; text: string }[]).map(x => `<li class="ps__row"><span class="ps__k">${esc(x.p)}</span><span class="ps__t">— ${esc(x.text)}</span></li>`).join('')}</ol>
          <p class="label chain close fb">${esc(b.closingLines[0])}<br>${esc(b.closingLines[1])}</p>`,
        more: `<p class="body">${esc(b.strLead)}</p>${chips(b.str)}`,
      }
    }
    case 'coffee': return {
      body: `<p class="f fb">${esc(e.lead[0])}</p><p class="f fb">${esc(e.lead[1])}</p><p class="label chain fb">${esc(e.closingLines[0])} → ${esc(e.closingLines[1])}</p><p class="label partner fb">POWERED BY ${esc(String(e.partner).toUpperCase())}</p>`,
      more: `<p class="body">${esc(e.exploringLead)}</p>${chips(e.exploring)}`,
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
      <div class="bearing__body">${body}</div>
      <div class="bearing__more" id="rudder-more-${esc(e.id)}" hidden>${more}</div>
      <button class="link link--mono explore fb" type="button" aria-expanded="false" aria-controls="rudder-more-${esc(e.id)}">EXPLORE<span class="btn__arrow" aria-hidden="true">→</span></button>
    </li>`
  }).join('')
  const orbit = (events[2].blueprint.sixPs as { p: string }[]).map((x, i) => `<span class="orb" style="--a:${i * 60}deg"><span class="orb__t label">${esc(x.p)}</span></span>`).join('')
  return `
    <div class="instrument" aria-hidden="true">
      <div class="ring-wrap">${compassRing()}</div>
      <span class="bearing-lbl label" data-b="east">East</span><span class="bearing-lbl label" data-b="west">West</span>
    </div>
    <div class="col">
      <div class="head">
        <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
        <h2 class="h1 hl">${HEADLINE}</h2>
      </div>
      <div class="stack" aria-label="The Storyteller">${story(STACK_A, 's--a')}${story(STACK_B, 's--b')}<p class="s s--c">${esc(NOBODY)}</p><p class="ulysses h1">${ULYSSES}</p></div>
    </div>
    <ul class="bearings" aria-label="Four specialist events · 27 November">${panels}</ul>
    <div class="orbit" aria-hidden="true">${orbit}</div>
    <a class="link link--mono cta" href="#ch-paradise">THE FOUR — FULL DETAILS<span class="btn__arrow" aria-hidden="true">→</span></a>`
}

/* ─── chapter state (one instance on the page) ─── */
let reduced = false
let ring: SVGSVGElement | null = null
let east: HTMLElement | null = null, west: HTMLElement | null = null
let lastYaw = 1e9, lastE = 1e9, lastW = 1e9, lastTr = ''
let radarOn = false
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
const place = (lbl: HTMLElement | null, x: number, last: number): number => {
  if (!lbl || x === last) return last
  lbl.style.transform = x < -9e3 ? 'translate(-200vw,0)' : `translate(calc(${x}px - 50%),-140%)`
  return x
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
    east = q('[data-b="east"]'); west = q('[data-b="west"]')
    const ringWrap = q('.ring-wrap'), needle = q<SVGLineElement>('.glyph--compass .needle'), orbit = q('.orbit')
    const eyeRule = q('.eye__rule'), eyeT = q('.eye__t'), hl = q('.hl')
    const sA = qa('.s--a'), sB = qa('.s--b'), sC = q('.s--c'), ul = q('.ulysses')
    const panels = qa('.bearing'), cta = q('.cta')
    const psRows = qa('.ps__row')

    /* initial states — the seam rule: nothing in the frame before p .06 or after p .90 (this section exits by .96) */
    const SOFT = (v: number) => `"WONK" 1, "SOFT" ${v}`
    gsap.set(eyeT, { opacity: 0 })
    gsap.set(eyeRule, { scaleX: 0, transformOrigin: 'left center' })
    gsap.set([...sA, ...sB, sC], { opacity: 0, y: 4 })
    gsap.set(sA, { fontVariationSettings: SOFT(60), filter: 'blur(6px)' })
    gsap.set(ul, { opacity: 0, y: 4, fontVariationSettings: '"SOFT" 60', filter: 'blur(0px)' })
    gsap.set(ringWrap, { opacity: 0, scale: .94, transformOrigin: 'center' })
    gsap.set(needle, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(orbit, { opacity: 0 })
    gsap.set([east, west], { opacity: 0 })
    gsap.set([...panels, cta], { autoAlpha: 0 })
    gsap.set(panels, { x: 24 })
    panels.forEach(b => {
      gsap.set(b.querySelectorAll('.card__rule--t, .card__rule--b'), { scaleX: 0 })
      gsap.set(b.querySelectorAll('.card__rule--l, .card__rule--r'), { scaleY: 0 })
      gsap.set(b.querySelectorAll('.card__corner, .bearing__mono'), { opacity: 0 })
      gsap.set(b.querySelectorAll('.bearing__title, .fb'), { opacity: 0, y: 10 })
    })
    gsap.set(psRows, { opacity: 0, x: 24 })

    /* head sequence (.06–.12): rule → eyebrow → headline lines (masked, SplitText) */
    tl.to(eyeRule, { scaleX: 1, duration: .03 }, .06)
    tl.to(eyeT, { opacity: 1, duration: .02 }, .08)
    SplitText.create(hl, {
      type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true,
      onSplit: self => {
        const tw = gsap.fromTo(self.lines, { yPercent: 110 }, { yPercent: 0, duration: .04, stagger: .01, ease: 'none', immediateRender: true })
        tl.add(tw, .09)
        tw.render(Math.max(0, Math.min(tw.duration(), tl.time() - .09)), true, true)
        return tw
      },
    })
    hl.classList.add('is-split')

    /* the ring draws (.06–.14) and the needle strokes in */
    tl.to(ringWrap, { opacity: 1, scale: 1, duration: .06 }, .06)
    tl.to(needle, { strokeDashoffset: 0, duration: .04 }, .10)
    tl.to([east, west], { opacity: 1, duration: .03 }, .14)

    /* storyteller A — the four bearings named under the leaving cloth (SOFT breath 60 → 12, blur 6 → 0) */
    const land = (line: HTMLElement, at: number, prev?: HTMLElement) => {
      tl.to(line, { opacity: 1, y: 0, duration: .025 }, at)
      if (prev) tl.to(prev, { opacity: .55, duration: .02 }, at)
    }
    const collapse = (lines: HTMLElement[], at: number) => tl.to(lines, { opacity: 0, height: 0, marginBottom: 0, duration: .01 }, at)
    ;[.11, .125, .14, .155].forEach((at, i) => {
      land(sA[i], at, sA[i - 1])
      tl.to(sA[i], { fontVariationSettings: SOFT(12), filter: 'blur(0px)', duration: .03 }, at)
    })

    /* the click of light at each lock */
    const click = (at: number) => { tl.to(ring, { '--flash': 1, duration: .008 }, at); tl.to(ring, { '--flash': 0, duration: .03 }, at + .008) }
    ;[.15, .30, .47, .65, .82].forEach(click)

    /* four bearings: at each lock the panel slides in (rule → head → body, complete within .03 of p) and
       slides out before the next lock. Every body lands with its head — the S panel's six-Ps rows alone
       wait for their orbit (psRows below), so no card is ever empty at rest. */
    const panelIn = (b: HTMLElement, at: number) => {
      const bodyAt = at + .02
      tl.to(b, { autoAlpha: 1, x: 0, duration: .02 }, at)
      tl.to(b.querySelectorAll('.card__rule--t, .card__rule--b'), { scaleX: 1, duration: .015 }, at)
      tl.to(b.querySelectorAll('.card__rule--l, .card__rule--r'), { scaleY: 1, duration: .015 }, at + .006)
      tl.to(b.querySelectorAll('.card__corner'), { opacity: 1, duration: .008 }, at + .018)
      tl.to(b.querySelector('.bearing__mono'), { opacity: 1, duration: .01 }, at + .012)
      tl.to(b.querySelector('.bearing__title'), { opacity: 1, y: 0, duration: .012 }, at + .018)
      tl.to(b.querySelectorAll('.fb'), { opacity: 1, y: 0, duration: .012, stagger: .003 }, bodyAt)
    }
    const panelOut = (b: HTMLElement, at: number) => tl.to(b, { autoAlpha: 0, x: 24, duration: .03 }, at)
    panelIn(panels[0], .15); panelOut(panels[0], .27)
    panelIn(panels[1], .30); panelOut(panels[1], .44)
    panelIn(panels[2], .47); panelOut(panels[2], .62)
    panelIn(panels[3], .65); panelOut(panels[3], .80)
    tl.to(cta, { autoAlpha: 1, duration: .02 }, .19)
    tl.to(cta, { autoAlpha: 0, duration: .02 }, .81)

    /* the headline leaves as the first turn begins; the middle stack lands across the second and third bearings */
    tl.to(hl, { opacity: 0, y: -8, duration: .03 }, .27)
    if (shared.mobile) collapse([hl], .30) // portrait: give the stack the headline's room once it has left
    collapse(sA, .30)
    ;[.33, .41, .49, .57].forEach((at, i) => land(sB[i], at, sB[i - 1]))

    /* the six Ps orbit the ring once (.47–.54), then dock as a list in the S panel (.54–.58).
       Portrait skips the orbit (the stack sits over the ring there) and docks the list with the body. */
    if (!shared.mobile) {
      tl.to(orbit, { opacity: 1, duration: .015 }, .47)
      tl.fromTo(orbit, { '--spin': '0deg' }, { '--spin': '360deg', duration: .08 }, .47)
      tl.to(orbit, { opacity: 0, duration: .015 }, .535)
    }
    tl.to(psRows, { opacity: 1, x: 0, duration: .015, stagger: .004 }, shared.mobile ? .49 : .54)

    /* everything exits (.83–.87) — the circle is complete */
    tl.to([eyeRule, eyeT], { opacity: 0, y: -8, duration: .03 }, .83)
    collapse(sB, .84)
    tl.to([ringWrap, east, west], { opacity: 0, duration: .03 }, .84)

    /* the man remembers his name: Nobody (.85) → I AM ULYSSES (.87), SOFT 60 → 0 in one step (.885) */
    land(sC, .85)
    tl.set(ul, { opacity: 1, y: 0 }, .87)
    tl.set(ul, { fontVariationSettings: '"SOFT" 0' }, .885)

    /* the tear (.92–.96): the line under the cut breathes (SOFT → 60, blur → 6) and leaves */
    tl.to(sC, { opacity: 0, y: -8, fontVariationSettings: SOFT(60), filter: 'blur(6px)', duration: .04 }, .92)
    tl.to(ul, { opacity: 0, y: -8, fontVariationSettings: '"SOFT" 60', filter: 'blur(6px)', duration: .04 }, .92)
  },

  /** The radar sweep runs while the camera holds East (MED READY). */
  onProgress(p) {
    if (reduced || !ring) return
    const on = p >= .29 && p < .47
    if (on !== radarOn) { radarOn = on; radar(ring, on) }
  },

  /**
   * The card turns WITH the world: +yaw pans the stars right, so the ring turns clockwise by +yaw (`setYaw`
   * negates its argument, hence −yaw). Its cardinals are mirrored in style.css (E left, W right) so E rises
   * under the needle as Orion comes ahead at π/2. EAST / WEST sit at their true screen bearings; the needle trembles.
   */
  onFrame(s: Shared, ctx: ChapterCtx) {
    if (reduced || !ring) return
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
