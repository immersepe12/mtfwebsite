import type { Chapter } from '../../engine/chapter'
import type { Mood, RGB } from '../../engine/mood'
import { hex } from '../../engine/mood'
import { createFilm } from '../../engine/film'
import { SplitText } from 'gsap/SplitText'
import { constellation, MED_OUTLINE_11, fitOutline } from '../../art/constellations'
import { STARS_REF } from '../../gl/layers/stars'
import './style.css'

/**
 * Chapter 03 — A SKY FULL OF STARS · Canto II · Why now · 21:10 · DESIGN-BIBLE §6.3
 *
 * The "Why now?" slide staged as a sailor losing sight of land. The eleven forces are eleven stars on the
 * logo's Mediterranean outline (§9.4 `constellation()` in `.pin__layer.fx`, labels as a real <ol>); the
 * hairlines draw between them; the old question is struck through; the Malta star (anchor 10) swells gold and
 * the world's star billboard takes over at the same screen position (sunX/sunY from the anchor's NDC).
 *
 * Layout (desktop): head + first storyteller stack left (p .06–.30, the constellation is dark then) → the sky
 * lights (p .30–.60) with the statement top-right and the questions bottom-left in the outline's free corners →
 * Malta swells (p .58–.64) → second stack left over the dimmed sky (p .62–.80) → NINE NIGHTS ↓ + the last two
 * beats → exit by .90 (seam rule).
 *
 * The outline's fit is `fitOutline()` from the art file — the SAME fit the GL stars layer (set 1) uses, so the
 * gold GL lines sit on the DOM hairlines at every aspect.
 */

type KF = [number, number][]
/** Piecewise-linear keyframe read, clamped at both ends. */
function kf(p: number, pts: KF): number {
  const first = pts[0], last = pts[pts.length - 1]
  if (!first || !last) return 0
  if (p <= first[0]) return first[1]
  for (let i = 1; i < pts.length; i++) {
    const b = pts[i], a = pts[i - 1]
    if (!a || !b) continue
    if (p <= b[0]) { const t = b[0] === a[0] ? 1 : (p - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t }
  }
  return last[1]
}
/** Colour keyframes — linear in p (hue never eases), written into a reused triple. */
function kfRGB(p: number, pts: [number, RGB][], out: RGB): RGB {
  for (let c = 0; c < 3; c++) out[c] = kf(p, pts.map(([q, v]) => [q, v[c] ?? 0] as [number, number]))
  return out
}

const ABYSS = hex('#06192B'), PRESS = hex('#090D16')
const skyTop: RGB = [0, 0, 0]

/* copy — the storyteller lines are the bible's (§6.3, verbatim); the Forum copy comes from content.json whyNow.* */
const STACK_A = ['For thousands of years,', 'sailors of this sea looked to the stars.', 'For direction.', 'For destiny.', 'Perhaps for the gods.', 'When they lost sight of earth…', 'they read the heavens.']
const STACK_B = ['One star grows brighter.', 'Was it Athena?', 'Destiny?', 'Hope?', 'He did not know.', 'He knew only that above him stretched…', 'A SKY FULL OF STARS.']
const STACK_C = ['On the tenth dawn…', 'the star touched the earth.']
const HINT = 'NINE NIGHTS ↓'
const HEADLINE = 'Where do I go from here?'

/**
 * Label placement per anchor: [anchor, dx, dy] — 's' start (text runs right of the star), 'e' end (text ends left
 * of it), 'm' centred; dy is the text's centre relative to the star. Chosen so no label sits on a hairline (the
 * outline's edges, the spear) or on another label. The portrait table is used below 820 px, where the outline is
 * only 70 % of a narrow frame and the long forces are shortened (SHORT) — the full names stay in the DOM.
 */
type Anchor = 's' | 'e' | 'm'
type Pos = [Anchor, number, number]
const LABEL_POS: Pos[] = [
  ['s', 12, 18], ['s', 12, 4], ['s', 12, 8], ['s', 12, -4], ['s', 12, -10],
  ['e', 12, 8], ['e', 12, -8], ['s', 12, 22], ['s', 12, 18], ['s', 36, 4], ['s', 18, 8],
]
const LABEL_POS_M: Pos[] = [
  ['s', 8, 16], ['s', 8, 2], ['s', 8, 8], ['m', 0, -10], ['s', 8, -8],
  ['e', 8, 14], ['e', 8, -10], ['s', 2, 13], ['m', 0, 13], ['e', 8, 12], ['e', 10, -13],
]
/** Portrait short forms (visible < 820 px, aria-hidden); the desktop copy and the accessible name are unchanged. */
const SHORT: Record<number, string> = { 4: 'GEOPOLITICS', 5: 'MIGRATION', 7: 'HOUSING', 9: 'EXPECTATIONS', 10: 'SUSTAINABILITY' }
/** Labels keep at least this many px from the frame's edges (runtime clamp). */
const EDGE = 12

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const str = (v: unknown, fallback = ''): string => typeof v === 'string' ? v : (v && typeof v === 'object' && typeof (v as { value?: unknown }).value === 'string') ? (v as { value: string }).value : fallback
const txOf = (a: string, dx: number) => a === 'e' ? `calc(-100% - ${dx}px)` : a === 'm' ? `calc(-50% + ${dx}px)` : `${dx}px`

/* ── module state read by mood(p) (set in mount; mood has no ctx) ── */
let reduced = false, mobile = false, aspect = 16 / 9, lastNight = 0
const anchor = { nx: 0.238, ny: -0.14 }      // Malta's NDC in the frame
const sunPos = { x: 0, y: 0 }
function setAnchor(w: number, h: number) {
  const f = fitOutline(w, h)
  const [mx, my] = MED_OUTLINE_11[10] ?? [0.67, 0.6]
  anchor.nx = ((f.ox + mx * f.sw) / w) * 2 - 1
  anchor.ny = 1 - ((f.oy + my * f.sh) / h) * 2
  aspect = w / h
}
/** World point on the plane z = sunZ that projects onto the anchor for a yaw-0 camera at (camX, camY, camZ), pitch `tilt`, `fov`. */
function anchorWorld(camX: number, camY: number, camZ: number, tilt: number, fov: number, sunZ: number) {
  const t = Math.tan((fov * Math.PI) / 360)
  const cx = anchor.nx * t * aspect, cy = anchor.ny * t
  const ct = Math.cos(tilt), st = Math.sin(tilt)
  const dx = cx, dy = cy * ct + st, dz = cy * st - ct
  const s = (sunZ - camZ) / dz
  sunPos.x = camX + dx * s; sunPos.y = camY + dy * s
}

function skyHTML(w: number, h: number, forces: string[], lead: string, portrait: boolean): string {
  const f = fitOutline(w, h)
  const table = portrait ? LABEL_POS_M : LABEL_POS
  const lis = forces.slice(0, 11).map((t, i) => {
    const pt = MED_OUTLINE_11[i] ?? [0.5, 0.5]
    const [a, dx, dy] = table[i] ?? ['s', 12, 4]
    const x = ((f.ox + pt[0] * f.sw) / w) * 100, y = ((f.oy + pt[1] * f.sh) / h) * 100
    const short = SHORT[i]
    const text = short
      ? `<span class="stars__full">${esc(t)}</span><span class="stars__short" aria-hidden="true">${esc(short)}</span>`
      : `<span class="stars__full">${esc(t)}</span>`
    return `<li class="label" data-a="${a}" data-dx="${dx}"${short ? ' data-short' : ''} style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;--tx:${txOf(a, dx)};--dy:${dy}px"><span class="stars__lbl">${text}</span></li>`
  }).join('')
  return `<div class="stars__sky" style="--asp:${(w / h).toFixed(4)}">${constellation({ w, h })}<ol class="stars__forces" aria-label="${esc(lead)}">${lis}</ol></div>`
}

/**
 * Keep every label box inside the frame: a start-anchored label that would run off the right edge flips to
 * end-anchored (and vice-versa on the left); whatever still overflows is shifted in by --sx/--sy. The placement
 * transform lives on the inner .stars__lbl, so GSAP's y-tween on the <li> never disturbs it. Runs once fonts are
 * ready and on resize (measures 11 boxes; nothing per frame).
 */
function placeLabels(frame: HTMLElement, lis: HTMLElement[]) {
  const fr = frame.getBoundingClientRect()
  if (!fr.width || !fr.height) return
  for (const li of lis) {
    const box = li.firstElementChild as HTMLElement | null
    if (!box) continue
    const a0 = li.dataset.a ?? 's', dx = Number(li.dataset.dx ?? 12)
    li.style.setProperty('--tx', txOf(a0, dx)); li.style.removeProperty('--sx'); li.style.removeProperty('--sy')
    let r = box.getBoundingClientRect()
    if (a0 !== 'm') {
      const flip = a0 === 's' ? r.right > fr.right - EDGE : r.left < fr.left + EDGE
      if (flip) { li.style.setProperty('--tx', txOf(a0 === 's' ? 'e' : 's', dx)); r = box.getBoundingClientRect() }
    }
    const sx = r.right > fr.right - EDGE ? fr.right - EDGE - r.right : r.left < fr.left + EDGE ? fr.left + EDGE - r.left : 0
    const sy = r.bottom > fr.bottom - EDGE ? fr.bottom - EDGE - r.bottom : r.top < fr.top + EDGE ? fr.top + EDGE - r.top : 0
    if (sx) li.style.setProperty('--sx', `${sx.toFixed(1)}px`)
    if (sy) li.style.setProperty('--sy', `${sy.toFixed(1)}px`)
  }
}
/** Run `fn` once the curtain has opened and fonts are ready (label widths are final then). */
function onReady(fn: () => void) {
  const go = () => { document.fonts.ready.then(fn).catch(fn) }
  if (document.documentElement.classList.contains('is-ready')) go()
  else document.addEventListener('mtf:ready', go, { once: true })
}

const stackHTML = (cls: string, lines: string[]) =>
  `<div class="stars__stack stars__stack--${cls}">${lines.map(l => `<p class="s${/^[A-Z .]+$/.test(l) ? ' stars__cap' : ''}">${esc(l)}</p>`).join('')}</div>`

export const stars: Chapter = {
  id: 'stars',
  label: 'A Sky Full of Stars',
  inNav: false,

  mount(ctx) {
    const { el, shared, content } = ctx
    reduced = shared.reduced; mobile = shared.mobile
    const wn = (content?.whyNow ?? {}) as Record<string, unknown>
    const forces = Array.isArray(wn.forces) ? (wn.forces as unknown[]).map(f => str(f)) : []
    const heading = str(wn.heading, 'WHY NOW?')
    const lead = str(wn.lead, 'Tourism is being reshaped by forces far beyond tourism:')
    const statement = str(wn.statement)
    const qs = (wn.questions ?? {}) as Record<string, unknown>
    const framingOld = str(qs.framingOld, 'The question is no longer:'), oldQ = str(qs.old), framingNew = str(qs.framingNew, 'It is:'), newQ = str(qs.new)
    const keyLines = (content?.gala?.keyLines ?? []) as { text?: string }[]
    const headline = keyLines.find(l => typeof l?.text === 'string' && l.text.startsWith('Where do I go'))?.text ?? HEADLINE
    const eyebrow = `${heading.replace(/[?:]$/, '')} — ${lead.replace(/[?:]$/, '')}`

    const frame = `<div class="pin__frame">
      <div class="stars__eyebrow"><span class="stars__rule"></span><p class="eyebrow"><span class="index tnum">03 —</span><span class="chip">${esc(eyebrow)}</span></p></div>
      <h2 class="h1 stars__h2">${esc(headline)}</h2>
      ${stackHTML('a', STACK_A)}${stackHTML('b', STACK_B)}${stackHTML('c', STACK_C)}
      <div class="stars__forum stars__statement"><span class="stars__rule"></span><p class="label">${esc(heading)}</p><p class="f">${esc(statement)}</p></div>
      <div class="stars__forum stars__questions"><span class="stars__rule"></span><p class="small stars__framing">${esc(framingOld)}</p><p class="caps stars__old"><span>${esc(oldQ)}</span><i class="stars__strike" aria-hidden="true"></i></p><p class="small stars__framing">${esc(framingNew)}</p><p class="h2 stars__new">${esc(newQ)}</p></div>
      <p class="label stars__hint">${HINT}</p>
    </div>`

    if (reduced) {
      el.classList.add('chapter--static')
      el.innerHTML = frame
      el.querySelector('.stars__questions')?.insertAdjacentHTML('beforebegin', skyHTML(1000, 500, forces, lead, mobile))
      const sky = el.querySelector('.stars__sky') as HTMLElement | null
      if (sky) {
        const lis = Array.from(sky.querySelectorAll('.stars__forces li')) as HTMLElement[]
        const place = () => placeLabels(sky, lis)
        onReady(place)
        window.addEventListener('resize', place, { passive: true })
      }
      return
    }

    const { pin, tl } = createFilm(ctx, { length: mobile ? 2.5 : 4 })
    const w = shared.vw || window.innerWidth, h = shared.vh || window.innerHeight
    setAnchor(w, h)
    pin.innerHTML = `${frame}<div class="pin__layer fx">${skyHTML(w, h, forces, lead, mobile || w < 820)}</div>`

    const q = (s: string) => pin.querySelector(s) as HTMLElement
    const qa = (s: string) => Array.from(pin.querySelectorAll(s)) as HTMLElement[]
    const eyebrowEl = q('.stars__eyebrow'), h2 = q('.stars__h2'), fx = q('.fx'), hint = q('.stars__hint')
    const stA = q('.stars__stack--a'), stB = q('.stars__stack--b'), stC = q('.stars__stack--c')
    const statementEl = q('.stars__statement'), questionsEl = q('.stars__questions')
    const framing = qa('.stars__framing'), oldEl = q('.stars__old'), strike = q('.stars__strike'), newEl = q('.stars__new')
    const edges = qa('.c-edge'), spear = q('.c-spear'), starG = qa('.c-star'), labels = qa('.stars__forces li'), edgeGroup = q('.c-edges')

    /* labels inside the frame (flip / clamp) once fonts are final, and again on resize (rAF-coalesced) */
    const place = () => placeLabels(fx, labels)
    onReady(place)
    let raf = 0
    window.addEventListener('resize', () => {
      setAnchor(window.innerWidth, window.innerHeight)
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; place() })
    }, { passive: true })

    const D = 0.03
    const show = (t: HTMLElement | HTMLElement[], at: number, dur = D, y = 10) => tl.fromTo(t, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur }, at)
    const hide = (t: HTMLElement | HTMLElement[], at: number, dur = D) => tl.to(t, { opacity: 0, y: -8, duration: dur }, at)
    const draw = (t: HTMLElement, at: number, dur = D) => tl.fromTo(t, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: dur }, at)
    /** Storyteller lines arrive whole (4 px rise) and stay; older lines fade to the faint level; max 6 visible. */
    const stackIn = (root: HTMLElement, at: number, step: number) => {
      const lines = Array.from(root.children) as HTMLElement[]
      lines.forEach((ln, i) => {
        const t = at + i * step, prev = lines[i - 1], old = lines[i - 6]
        tl.fromTo(ln, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: step * 0.8 }, t)
        if (prev) tl.to(prev, { opacity: 0.55, duration: step * 0.8 }, t)
        if (old) tl.to(old, { opacity: 0, duration: step * 0.8 }, t)
      })
    }
    /** Masked line reveal (SplitText) once fonts are ready; falls back to a whole-block rise. */
    const linesIn = (target: HTMLElement, at: number, dur: number) => {
      tl.fromTo(target, { opacity: 0 }, { opacity: 1, duration: 0.004 }, at)
      onReady(() => {
        try {
          const split = SplitText.create(target, { type: 'lines', mask: 'lines', linesClass: 'line' })
          tl.fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: dur, stagger: dur * 0.35 }, at)
        } catch { tl.fromTo(target, { y: 10 }, { y: 0, duration: dur }, at) }
        tl.render(tl.time(), false, true)
      })
    }

    /* ── p .06–.30 · head sequence + the first stack, left ── */
    draw(q('.stars__eyebrow .stars__rule'), 0.06)
    show(q('.stars__eyebrow .eyebrow'), 0.09, 0.02, 0)
    linesIn(h2, 0.11, 0.035)
    stackIn(stA, 0.16, 0.02)
    hide([h2, stA], 0.30)

    /* ── p .30–.60 · eleven stars, one by one, 2.6 % apart; each label follows the hairline that reaches it ── */
    const STEP = 0.026, T0 = 0.30
    starG.forEach((g, i) => {
      const t = T0 + i * STEP
      tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.02 }, t)
      const label = labels[i], edge = edges[i]
      if (label) tl.fromTo(label, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.018 }, t + 0.01)
      if (edge) tl.to(edge, { strokeDashoffset: 0, duration: STEP }, t)
    })
    if (spear) tl.to(spear, { strokeDashoffset: 0, duration: 0.03 }, 0.58)

    /* statement, top-right (rule → label → block) */
    draw(q('.stars__statement .stars__rule'), 0.34)
    show(q('.stars__statement .label'), 0.37, 0.02, 0)
    show(q('.stars__statement .f'), 0.39)
    /* the two questions, bottom-left: the old one is struck through by a drawing hairline; the new one settles */
    draw(q('.stars__questions .stars__rule'), 0.44)
    if (framing[0]) show(framing[0], 0.47, 0.02, 0)
    show(oldEl, 0.49, 0.02)
    draw(strike, 0.51, 0.035)
    tl.to(oldEl, { opacity: 0.55, duration: 0.02 }, 0.545)
    if (framing[1]) show(framing[1], 0.55, 0.02, 0)
    linesIn(newEl, 0.57, 0.04)
    hide(questionsEl, mobile ? 0.61 : 0.70)

    /* ── p .58–.64 · Malta swells gold, the GL star takes over at the same screen position; the rest dims to 40 % ── */
    const malta = starG[10]
    if (malta) tl.to(malta, { scale: 2.6, transformOrigin: '50% 50%', duration: 0.04 }, 0.58).to(malta, { opacity: 0, duration: 0.03 }, 0.61)
    tl.to(starG.slice(0, 10), { opacity: 0.4, duration: 0.04 }, 0.60)
    tl.to(labels, { opacity: 0.4, duration: 0.04 }, 0.60)
    tl.to(edgeGroup, { opacity: 0.5, duration: 0.04 }, 0.60)

    /* ── p .62–.80 · the second stack ── */
    const bAt = mobile ? 0.65 : 0.63, bStep = mobile ? 0.02 : 0.025
    stackIn(stB, bAt, bStep)
    hide(stB, 0.805)

    /* ── p .82–.90 · NINE NIGHTS ↓, the last two beats, exit ── */
    show(hint, 0.82, 0.02, 0)
    stackIn(stC, 0.83, 0.025)
    hide(fx, 0.86, 0.04)
    hide(statementEl, 0.86, 0.025)
    hide(eyebrowEl, 0.87)
    hide([hint, stC], 0.88, 0.02)
  },

  /* the rail's nine ticks pulse in sequence at p .85–.94 (nine nights); cleared as the star touches the earth */
  onProgress(p) {
    if (reduced) return
    const n = p < 0.85 ? 0 : p < 0.96 ? Math.min(9, Math.floor(((p - 0.85) / 0.09) * 9) + 1) : 0
    if (n !== lastNight) { lastNight = n; document.dispatchEvent(new CustomEvent('mtf:night', { detail: { night: n } })) }
  },
  onLeave() {
    if (lastNight) { lastNight = 0; document.dispatchEvent(new CustomEvent('mtf:night', { detail: { night: 0 } })) }
  },

  /* §6.3 mood keyframes. Tilt/fov from p .25 are the stars layer's reference camera so GL set 1 coincides with the DOM anchors. */
  mood: (pIn: number): Partial<Mood> => {
    const p = reduced ? 0.62 : pIn
    const tilt = mobile ? STARS_REF.tiltMobile : STARS_REF.tilt, fovRef = STARS_REF.fov
    const camY = kf(p, [[0, 0.5], [0.25, 0.9], [0.6, 1.1]])
    anchorWorld(0, camY, 7, tilt, fovRef, -8)
    return {
      camX: kf(p, [[0.85, 0], [1, 1.2]]), camY, camZ: 7, camYaw: 0,
      camTilt: kf(p, [[0, 0.04], [0.25, tilt], [0.85, tilt], [1, 0.30]]),
      fov: kf(p, [[0, 34], [0.25, fovRef], [0.85, fovRef], [1, 40]]),
      skyTop: kfRGB(p, [[0, ABYSS], [0.25, PRESS]], skyTop), skyBottom: ABYSS,
      haze: kf(p, [[0, 0.15], [0.25, 0.1]]),
      sunX: kf(p, [[0.25, 0], [0.5, sunPos.x], [0.85, sunPos.x], [1, 1.2]]),
      sunY: kf(p, [[0, -2.4], [0.25, 2], [0.5, sunPos.y], [0.85, sunPos.y], [1, 0.9]]),
      sunZ: kf(p, [[0, -6], [0.25, -8]]),
      sunRadius: kf(p, [[0, 1], [0.25, 0.1], [0.58, 0.1], [0.64, 0.18], [0.85, 0.18], [1, 0.2]]),
      sunGlow: kf(p, [[0.58, 0], [0.64, 1.4], [0.85, 1.4], [1, 1.6]]),
      sunHeat: 0, sunVisible: kf(p, [[0.58, 0], [0.64, 1]]),
      stars: kf(p, [[0, 0.8], [0.25, 1], [0.85, 1], [1, 0.7]]),
      starDrift: kf(p, [[0, 0.2], [0.25, 0.15], [0.6, 0.1]]),
      constellation: kf(p, [[0.28, 0], [0.6, 1]]),
      tess: 0, tessForm: 0, tessSpread: 12,
      veil: 0, p1: 0, p2: 0, p3: 0, p4: 0, mosaic: 0,
      bloom: kf(p, [[0.25, 0.5], [0.6, 0.7]]),
      warmth: kf(p, [[0, 0.2], [0.25, 0.15]]),
    }
  },
}
