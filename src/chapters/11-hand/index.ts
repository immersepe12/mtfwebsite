import type { Chapter, ChapterCtx, Shared } from '../../engine/chapter'
import { createFilm } from '../../engine/film'
import { hex, type Mood, type RGB } from '../../engine/mood'
import { net, tighten, cut } from '../../art/net'
import { galaTitle, draw } from '../../art/gala-title'
import './style.css'

/**
 * Chapter 11 — THE OPEN HAND · Canto X · The Gala · Awards · 05:55 · DESIGN-BIBLE §6.11
 * The net tightens, is cut, and the tessera field opens from the fist into the open hand — the only full
 * mosaic figure in the site. Type lives in the left column; the hand is the emblema, right of centre.
 * Beats (p): net draws 0–.18 + tightens 0–.3 · eyebrow .06–.12 · stack .11–.29 · exit .31 · THE CUT .30–.40 ·
 * "Calypso cuts the net." .35–.47 · the hand assembles .38–.66 (fist → open hand .42–.70, one finger group at a time) ·
 * couplet .47 / .62 (one line per finger group) · exit .74 ·
 * gala lettering draws across the palm .75–.85 · Forum .78–.86 (exit .885) · pill in the palm .82 ·
 * Awards .905–.935 (exit .955) · closing lines .945–.978 fading with the frame · html.is-black from .96
 */

/* ─── keyframe helpers (piecewise-linear between the §6.11 anchors) ─── */
type KF = [number, number][]
const kf = (p: number, k: KF): number => {
  if (p <= k[0][0]) return k[0][1]
  for (let i = 1; i < k.length; i++) {
    if (p <= k[i][0]) { const p0 = k[i - 1][0], v0 = k[i - 1][1]; return v0 + (k[i][1] - v0) * ((p - p0) / (k[i][0] - p0)) }
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
const PRESS = hex('#090D16'), BLACK = hex('#000000'), INK_SEA = hex('#0B1A2A'), NIGHT = hex('#123044')
const SEA_10 = hex('#0B2A3D'), SEA_GLASS = hex('#0A1622')

/** The palm centre in world units — the tesserae layer's own anchor when it exposes one, else the bible's §6.11 value. */
let PALM: [number, number, number] = [0.8, 0.4, -8]
let mobileMood = false
let reducedMood = false

const K = {
  camX: [[.3, 1], [.4, .35]] as KF,
  camXm: [[.3, 1], [.4, .8]] as KF,
  camY: [[.3, 2.4], [.4, 2.0], [.75, 1.55]] as KF,
  camYm: [[.3, 2.4], [.75, 2.4]] as KF,
  camZ: [[.3, -8], [.4, -6], [.75, -4]] as KF,
  camZm: [[.3, -8], [.4, -2], [.75, 1.8]] as KF,
  camTilt: [[.3, .02], [.4, 0]] as KF,
  fov: [[0, 34], [.3, 30], [.4, 32], [.75, 34]] as KF,
  sunGlow: [[.86, 0], [.92, 1.6]] as KF,
  sunVisible: [[.86, 0], [.92, 1]] as KF,
  seaOpacity: [[0, 1], [.3, .8], [.4, .6], [.75, .5], [.9, .5], [1, 0]] as KF,
  seaAmp: [[0, .08], [.3, .05], [.4, .04], [.9, .04], [1, 0]] as KF,
  stars: [[0, .2], [.3, .1], [.9, .1], [1, 0]] as KF,
  // assembly .38–.66 so the hand is clearly forming at p .5; holds 1 through p 1 — Ch 12 owns the dissolve
  tess: [[.38, 0], [.66, 1]] as KF,
  tessForm: [[.42, 2], [.70, 3]] as KF,
  // the layer's scatter shell is far (r 14–20 × spread), so the spread must close early or the forming hand is
  // still tiny specks at p .5 — 4 → 1.4 by .52 puts the tiles on stage while they are still travelling
  tessSpread: [[.3, 4], [.38, 2.2], [.52, 1.4], [.66, 1]] as KF,
  tessGold: [[.4, .8], [.75, .9]] as KF,
  tessGlint: [[.4, .5], [.75, .8], [.82, 1.4], [.9, 1], [1, .6]] as KF,
  bloom: [[.3, .5], [.4, .6], [.75, .8], [.9, .9], [1, .7]] as KF,
  warmth: [[0, .25], [.3, .2], [.4, .2], [.75, .35], [.9, .35], [1, .1]] as KF,
  vignette: [[0, .35], [.3, .4], [.9, .4], [1, .6]] as KF,
}
const SKY_T: [number, RGB][] = [[.9, PRESS], [1, BLACK]]
const SKY_B: [number, RGB][] = [[0, NIGHT], [.3, PRESS], [.4, PRESS], [.75, INK_SEA], [.9, INK_SEA], [1, BLACK]]
const SEA_C: [number, RGB][] = [[0, SEA_10], [.3, SEA_GLASS], [.9, SEA_GLASS], [1, BLACK]]

const moodAt = (p: number): Partial<Mood> => ({
  camX: kf(p, mobileMood ? K.camXm : K.camX), camY: kf(p, mobileMood ? K.camYm : K.camY), camZ: kf(p, mobileMood ? K.camZm : K.camZ),
  camTilt: kf(p, K.camTilt), camYaw: Math.PI * 2, fov: kf(p, K.fov),
  skyTop: kfRGB(p, SKY_T), skyBottom: kfRGB(p, SKY_B), haze: .2,
  sunX: PALM[0], sunY: PALM[1], sunZ: PALM[2], sunRadius: .16, sunGlow: kf(p, K.sunGlow), sunHeat: 0, sunVisible: kf(p, K.sunVisible),
  seaY: -1.2, seaAmp: kf(p, K.seaAmp), seaSpeed: .3, seaOpacity: kf(p, K.seaOpacity), seaColor: kfRGB(p, SEA_C),
  stars: kf(p, K.stars), starDrift: .1, constellation: 0,
  tess: kf(p, K.tess), tessForm: kf(p, K.tessForm), tessSpread: kf(p, K.tessSpread), tessGlint: kf(p, K.tessGlint), tessGold: kf(p, K.tessGold),
  veil: 3, p1: 0, p2: 0, p3: 0, p4: 0,
  bloom: kf(p, K.bloom), grain: .06, vignette: kf(p, K.vignette), mosaic: 0, aberration: 0,
  warmth: kf(p, K.warmth),
})

/* ─── copy (Storyteller lines are bible-final §6.11; facts from content.json gala.* / awards.* / contact.*) ─── */
const STACK = [
  'For seven years Calypso had tried to keep what she loved.',
  'Make paradise beautiful enough.', 'Stop time.', 'Offer forever.', 'Hold tighter.',
  'But holding tighter does not stop departure.', 'Sometimes… it turns love into a chain.',
]
const CUT_LINE = 'Calypso cuts the net.'
const F1 = 'One Storyteller. No dialogue. Nine songs. One night.'
const F2 = 'A Mediterranean production of aerial constellations, ribbons, sea and fire — the story of the star that became Calypso, the island that became Gozo, and the hand that learned to open.'
const AWARDS_S = 'And yet… three thousand years later… you know his name.'
const AWARDS_F = 'The Mediterranean Tourism Awards recognise the people, places and projects whose work will still be known when the season is over.'
const AWARDS_FINE = 'Categories and venue to be announced.'
const CLOSING = ['Everything disappears.', 'No acrobats.', 'No projections.', 'No music.', 'Only the Storyteller.']
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const dayMonth = (iso: string) => { const [, m, d] = iso.split('-'); return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]}` }

function frameHTML(c: any, film: boolean): string {
  const g = c.gala, a = c.awards
  const email: string = c.contact?.emails?.[0]?.address ?? 'forum@medtourismfoundation.com'
  const galaDate = dayMonth(String(g.date)), year = String(g.date).slice(0, 4)
  const city = String(c.event?.city?.value ?? 'Malta').toUpperCase()
  const eyebrow = `11 — ${galaDate} · ${esc(String(g.titleCaps))} · THE GALA`
  const cantos = (g.chapters as { title: string }[]).map((ch, i) =>
    `<li class="canto"><span class="canto__i">${String(i + 1).padStart(2, '0')}</span><span class="canto__t">${esc(String(ch.title).toUpperCase())}</span></li>`).join('')
  const closing = CLOSING.map(l => `<p class="s c">${esc(l)}</p>`).join('')
  const stack = STACK.map(l => `<p class="s st">${esc(l)}</p>`).join('')
  const couplet = (g.keyLines as { sentenceCase?: string }[]).slice(0, 2).map(k => `<p class="s h2 cp">${esc(String(k.sentenceCase ?? ''))}</p>`).join('')
  const invite = `mailto:${email}?subject=${encodeURIComponent(`${g.title} — invitation request`)}`
  const nominate = `mailto:${email}?subject=${encodeURIComponent(`${a.title} — nomination`)}`
  return `
    <div class="col">
      <p class="eyebrow eye"><span class="eye__rule" aria-hidden="true"></span><span class="eye__t">${eyebrow}</span></p>
      <h2 class="h1 hl${film ? ' sr-only' : ''}">${esc(String(g.title))}<span class="hl__sub">${esc(String(g.subtitle))}</span></h2>
      <div class="stack" aria-label="The Storyteller">${stack}<p class="s cutline">${esc(CUT_LINE)}</p></div>
      <div class="forum">
        <span class="forum__rule" aria-hidden="true"></span>
        <p class="label forum__label">THE GALA</p>
        <p class="f fb">${esc(F1)}</p>
        <p class="f fb f2">${esc(F2)}</p>
        <div class="track fb"><ol class="cantos" aria-label="The nine cantos">${cantos}</ol></div>
        <ul class="chip-row meta fb" aria-label="Gala details">
          <li class="chip">${galaDate} ${year}</li><li class="chip">${city}</li><li class="chip">APPROX. 70 MINUTES</li><li class="chip chip--tba">BY INVITATION (TBC)</li>
        </ul>
      </div>
      <div class="awards">
        <span class="forum__rule" aria-hidden="true"></span>
        <p class="label awards__label">${esc(String(a.title).toUpperCase())} · ${dayMonth(String(a.date))}</p>
        <p class="s ab">${esc(AWARDS_S)}</p>
        <p class="f ab">${esc(AWARDS_F)}</p>
        <p class="fine ab">${esc(AWARDS_FINE)}</p>
        <a class="link link--mono ab" href="${nominate}">AWARDS — NOMINATE<span class="btn__arrow" aria-hidden="true">→</span></a>
      </div>
    </div>
    <div class="couplet" aria-label="The final image">${couplet}</div>
    ${film ? `<div class="title" aria-hidden="true">${galaTitle({ subtitle: String(g.subtitle) })}</div>` : ''}
    <div class="pill-pos"><a class="btn btn--primary pill" href="${invite}"><span class="flood" aria-hidden="true"></span><span>REQUEST AN INVITATION</span><span class="btn__arrow" aria-hidden="true">→</span></a></div>
    <div class="closing" aria-label="The Storyteller">${closing}</div>`
}

/* ─── film state (cached elements; no per-frame queries) ─── */
let pill: HTMLElement | null = null, pillPos: HTMLElement | null = null, title: HTMLElement | null = null
let px = -1, py = -1, tx = -1, ty = -1

export const hand: Chapter = {
  id: 'hand',
  label: 'The Open Hand',
  navIndex: '05', inNav: true,

  mount(ctx: ChapterCtx) {
    const { el, shared, content } = ctx
    mobileMood = shared.mobile
    // the palm anchor of the tesserae layer (typed narrowly; the layer may still be a stub)
    const tl0 = ctx.world?.layers?.find(l => l.name === 'tesserae') as { anchors?: { palm?: number[] } } | undefined
    const palm = tl0?.anchors?.palm
    if (palm && palm.length === 3) PALM = [palm[0], palm[1], palm[2]]

    if (shared.reduced) {
      reducedMood = true
      el.classList.add('chapter--static')
      el.innerHTML = `<div class="pin__frame">${frameHTML(content, false)}</div>`
      return
    }

    const { pin, tl } = createFilm(ctx, { length: shared.mobile ? 3 : 4.5 })
    const w = Math.max(320, shared.vw), h = Math.max(320, shared.vh)
    pin.innerHTML = `
      <div class="pin__layer fx" aria-hidden="true">${net({ w, h, spacing: shared.mobile ? 60 : 44 })}</div>
      <div class="pin__frame">${frameHTML(content, true)}</div>`

    const q = <T extends Element>(s: string) => pin.querySelector(s) as T
    const qa = (s: string) => Array.from(pin.querySelectorAll<HTMLElement>(s))
    const netSvg = q<SVGSVGElement>('.glyph--net')
    const eyeRule = q<HTMLElement>('.eye__rule'), eyeT = q<HTMLElement>('.eye__t')
    const stackLines = qa('.stack .st'), cutLine = q<HTMLElement>('.cutline')
    const couplet = qa('.couplet .cp')
    const forum = q<HTMLElement>('.forum'), forumRule = q<HTMLElement>('.forum__rule'), forumLabel = q<HTMLElement>('.forum__label'), forumBlocks = qa('.forum .fb')
    const awards = q<HTMLElement>('.awards'), awardsRule = q<HTMLElement>('.awards .forum__rule'), awardsLabel = q<HTMLElement>('.awards__label'), awardsBlocks = qa('.awards .ab')
    const closing = qa('.closing .c')
    const galaSvg = q<SVGSVGElement>('.glyph--gala')
    pill = q<HTMLElement>('.pill'); pillPos = q<HTMLElement>('.pill-pos'); title = q<HTMLElement>('.title')
    netSvg.style.setProperty('--net-draw', '0')
    px = py = tx = ty = -1

    // the net follows the viewport (rebuilt on resize, cheap: one SVG string)
    let lastW = w, lastH = h
    const rebuildNet = () => {
      const nw = Math.max(320, window.innerWidth), nh = Math.max(320, window.innerHeight)
      if (Math.abs(nw - lastW) < 24 && Math.abs(nh - lastH) < 24) return
      lastW = nw; lastH = nh
      const fx = q<HTMLElement>('.fx'); fx.innerHTML = net({ w: nw, h: nh, spacing: shared.mobile ? 60 : 44 })
      const s = q<SVGSVGElement>('.glyph--net'); s.style.setProperty('--net-draw', netState.draw.toFixed(4)); tighten(s, netState.tight); cut(s, netState.cut)
      netProxy.svg = s
    }
    window.addEventListener('resize', rebuildNet, { passive: true })

    /* ── the net: draw 0–.18 · tighten 1 → .96 over 0–.3 · the cut .30–.40 (all scrubbed through proxies) ── */
    const netState = { draw: 0, tight: 1, cut: 0 }
    const netProxy = { svg: netSvg }
    tl.to(netState, { draw: 1, duration: .18, onUpdate: () => netProxy.svg.style.setProperty('--net-draw', netState.draw.toFixed(4)) }, 0)
    tl.to(netState, { tight: .96, duration: .3, onUpdate: () => tighten(netProxy.svg, netState.tight) }, 0)
    tl.to(netState, { cut: 1, duration: .1, onUpdate: () => cut(netProxy.svg, netState.cut) }, .3)
    tl.fromTo(netProxy.svg, { opacity: 1 }, { opacity: 0, duration: .04 }, .40)

    /* ── head: eyebrow rule draws → eyebrow ── */
    tl.fromTo(eyeRule, { scaleX: 0 }, { scaleX: 1, duration: .04 }, .06)
    tl.fromTo(eyeT, { opacity: 0 }, { opacity: 1, duration: .03 }, .09)
    tl.to([eyeRule, eyeT], { opacity: 0, y: -8, duration: .03 }, .31)

    /* ── the Storyteller stack: one line per beat, 4 px rise; older lines to --fg-faint; max 6 visible ── */
    stackLines.forEach((line, i) => {
      const at = .11 + i * .03
      tl.fromTo(line, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .025 }, at)
      if (i > 0) tl.to(stackLines[i - 1], { opacity: .55, duration: .025 }, at)
      if (i >= 6) tl.to(stackLines[i - 6], { opacity: 0, duration: .02 }, at)
    })
    tl.to(stackLines, { opacity: 0, y: -8, duration: .03 }, .31)
    // the cut line stands alone while the strands retreat
    tl.fromTo(cutLine, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .03 }, .35)
    tl.to(cutLine, { opacity: 0, y: -8, duration: .03 }, .44)

    /* ── the couplet: one line per finger group as the hand opens ── */
    couplet.forEach((line, i) => tl.fromTo(line, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .04 }, .47 + i * .15))
    tl.to(couplet, { opacity: 0, y: -8, duration: .04 }, .74)

    /* ── gold sweep: the gala lettering strokes on across the palm ── */
    const drawState = { v: 0 }
    tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: .02 }, .75)
    tl.to(drawState, { v: 1, duration: .10, onUpdate: () => draw(galaSvg, drawState.v) }, .75)
    tl.to(title, { opacity: 0, duration: .03 }, .955)

    /* ── Forum: rule → label → blocks (canto strip, meta chips) ── */
    tl.fromTo(forumRule, { scaleX: 0 }, { scaleX: 1, duration: .03 }, .78)
    tl.fromTo(forumLabel, { opacity: 0 }, { opacity: 1, duration: .02 }, .805)
    forumBlocks.forEach((b, i) => tl.fromTo(b, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .025 }, .815 + i * .012))
    tl.to(forum, { opacity: 0, y: -8, duration: .02 }, .885)
    // the invitation pill, in the palm
    tl.fromTo(pill, { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .03 }, .82)
    tl.to(pill, { opacity: 0, duration: .02 }, .955)

    /* ── Awards — the second movement ── */
    tl.fromTo(awardsRule, { scaleX: 0 }, { scaleX: 1, duration: .02 }, .905)
    tl.fromTo(awardsLabel, { opacity: 0 }, { opacity: 1, duration: .015 }, .915)
    awardsBlocks.forEach((b, i) => tl.fromTo(b, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .02 }, .92 + i * .008))
    tl.to(awards, { opacity: 0, y: -8, duration: .02 }, .965)

    /* ── closing lines (fg-faint), fading with the frame ── */
    closing.forEach((line, i) => tl.fromTo(line, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .01 }, .942 + i * .009))
    tl.to(closing, { opacity: 0, duration: .02 }, .98)
  },

  onProgress(p) {
    if (reducedMood) return
    document.documentElement.classList.toggle('is-black', p >= .96)
  },

  onFrame(shared: Shared, ctx: ChapterCtx) {
    if (reducedMood || !pillPos || !title) return
    const world = ctx.world
    // the pill sits in the palm (below it on mobile); the lettering hangs above the palm centre
    const dy = shared.mobile ? -1.0 : -.32
    const a = world.project(PALM[0], PALM[1] + dy, PALM[2])
    const ax = Math.round(a.x), ay = Math.round(a.y)
    if (ax !== px || ay !== py) { px = ax; py = ay; pillPos.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -50%)` }
    const b = world.project(PALM[0], PALM[1] + (shared.mobile ? .35 : .72), PALM[2])
    const bx = Math.round(b.x), by = Math.round(b.y)
    if (bx !== tx || by !== ty) { tx = bx; ty = by; title.style.transform = `translate3d(${bx}px, ${by}px, 0) translate(-50%, -50%)` }
  },

  mood: p => reducedMood ? moodAt(.9) : moodAt(p),
}
